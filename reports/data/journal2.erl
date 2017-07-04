%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @author Владимир Щербина <vns.scherbina@gmail.com>
%% @copyright 2017
%% @version 1.0.0
%% @doc Модуль <b>journal2.erl</b> реализует формирование данных
%% для документа печного журнала <Температура верхней части печи>.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
-include("reports.hrl").

%%%%%%%%%%%%%%%%%%%%%%
%%% public функции %%%
%%%%%%%%%%%%%%%%%%%%%%

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec ({struct,Props}) -> term
%% @doc <i>Формирование данных для рапорта</i>
%% <p>
%% <b>Props</b> - список ключей со значениями.
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
data({struct,Props}) ->
	{{Year,Month,Day},{_Hour,_Minute,_Second}}=get_timestamp("report_date",Props),
	ShiftStart1=get_shift_start(Year,Month,Day,1),
	ShiftStart2=get_shift_start(Year,Month,Day,2),
	ShiftStart3=get_shift_start(Year,Month,Day,3),
	ReportDateStr=format_date({{Year,Month,Day},{0,0,0}}),
	Fields=[
		"TKG_1",
		"TKG_2",
		"TKG_3",
		"TKG_4",
		"TPP_1",
		"TPP_2",
		"TPP_3",
		"TPP_4",
		"TPP_5",
		"TPP_6",
		"TPP_7",
		"TPP_8",
		"TPP_9",
		"TPP_10",
		"TPP_11",
		"TPP_12",
		"TPP_13",
		"TPP_14",
		"TPP_15",
		"TPP_16"
	],
	Actions=[
		max,
		max,
		max,
		max,
		max,
		max,
		max,
		min,
		avg,
		avg	
	],
	{Shift1Rows,Shift1Row}=get_shift_data(ShiftStart1,Fields,Actions),
	{Shift2Rows,Shift2Row}=get_shift_data(ShiftStart2,Fields,Actions),
	{Shift3Rows,Shift3Row}=get_shift_data(ShiftStart3,Fields,Actions),
	{_,DayRow}=lists:foldl(
		fun(Row,{Count,Acc}) ->
			case Acc of
				[] ->
					{Count+1,Row};
				_ ->
					[FirstValue|_]=Row,
					case FirstValue==0.0 of
						true ->
							{Count,Acc};
						false ->		
							{Count+1,process_actions(Row,Acc,Actions,Count)}
					end
			end
		end,
		{1,[]},
		[Shift1Row,Shift2Row,Shift3Row]
	),
	{ok,
		[
			{"name","Печной журнал. Температура верхней части печи."},
			{"report_date",ReportDateStr},
			{"shift1_rows",[lists:flatten(Row) || Row <- Shift1Rows]},
			{"shift2_rows",[lists:flatten(Row) || Row <- Shift2Rows]},
			{"shift3_rows",[lists:flatten(Row) || Row <- Shift3Rows]},
			{"shift1_row",[lists:flatten(Row) || Row <- [Shift1Row]]},
			{"shift2_row",[lists:flatten(Row) || Row <- [Shift2Row]]},
			{"shift3_row",[lists:flatten(Row) || Row <- [Shift3Row]]},
			{"day_row",[lists:flatten(Row) || Row <- [DayRow]]}
		]
	};
data(_) ->
	{ok,[]}.

get_shift_data(ShiftStart,Fields,Actions) ->
	HourStartFinish=lists:map(
		fun(Hour) ->
			{ts_add(ShiftStart,Hour*3600),ts_add(ShiftStart,Hour*3600+3599)}
		end,
		[0,1,2,3,4,5,6,7]
	),
	EmptyRow=[0,0,0,0,0,0,[0,0],[0,0],0,0],
	Rows=lists:map(
		fun({Start,Finish}) ->
			Request=[
				{table,"journal2"},
				{fields,lists:filter(fun("") -> false; (_) -> true end,Fields)},
				{conditions,
					[
						{"INDX",gte,Start},
						{"INDX",lt,Finish}
					]
				},
				{orders,[{"INDX",asc}]}
			],
			Data=scada_db:get_data(Request),
			Data2=iif(
				length(Data)==0,
				lists:map(
					fun(
						[
							TKG_1,
							TKG_2,
							TKG_3,
							TKG_4,
							TPP_1,
							TPP_2,
							TPP_3,
							TPP_4,
							TPP_5,
							TPP_6,
							TPP_7,
							TPP_8,
							TPP_9,
							TPP_10,
							TPP_11,
							TPP_12,
							TPP_13,
							TPP_14,
							TPP_15,
							TPP_16
						]
					) ->
						{AverageTKG,MaxTKG,_MaxTKGNum,MinTKG,_MinTKGNum}=calc_statistics(
							[
								TKG_1,
								TKG_2,
								TKG_3,
								TKG_4
							]
						),
						{AverageTPP,MaxTPP,MaxTPPNum,MinTPP,MinTPPNum}=calc_statistics(
							[
								TPP_1,
								TPP_2,
								TPP_3,
								TPP_4,
								TPP_5,
								TPP_6,
								TPP_7,
								TPP_8,
								TPP_9,
								TPP_10,
								TPP_11,
								TPP_12,
								TPP_13,
								TPP_14,
								TPP_15,
								TPP_16
							]
						),
						[
							TKG_1,
							TKG_2,
							TKG_3,
							TKG_4,
							MaxTKG-MinTKG,
							AverageTKG,
							[
								MaxTPP,
								MaxTPPNum
							],
							[
								MinTPP,
								MinTPPNum
							],
							MaxTPP-MinTPP,
							AverageTPP
						]
					end,
					Data
				),
				[EmptyRow]
			),
			{_,ProcessedData}=lists:foldl(
				fun(Row,{Count,Acc}) ->
					case Acc of
						[] ->
							{Count+1,Row};
						_ ->
							{Count+1,process_actions(Row,Acc,Actions,Count)}
					end
				end,
				{1,[]},
				Data2
			),
			ProcessedData
		end,
		HourStartFinish
	),
	{_,ShiftRow}=lists:foldl(
		fun(Row2,{Count2,Acc2}) ->
			case Row2 of
				[] ->
					{Count2,Acc2};
				_ ->
					case Acc2 of
						[] ->
							{Count2+1,Row2};
						_ ->
							{Count2+1,process_actions(Row2,Acc2,Actions,Count2)}
					end
			end
		end,
		{1,[]},
		lists:filter(
			fun(R) ->
				R/=EmptyRow
			end,
			Rows
		)
	),
	{[[begin {_Date,{Hour,_Minute,_Second}}=ts_add(ShiftStart,RowNum*3600),Hour end]++RowData || {RowNum,RowData} <- lists:zip(lists:seq(0,length(Rows)-1),Rows)],iif(ShiftRow==[],ShiftRow,EmptyRow)}.

process_actions(Row1,Row2,Actions,Count) ->
	ZippedLists=lists:zip3(Row1,Row2,Actions),
	lists:map(
		fun({V1,V2,Action}) ->
			process_action(V1,V2,Action,Count)
		end,
		ZippedLists
	).

process_action([V1,N1],[V2,N2],max,_Count) ->
	iif(V1>V2,[V2,N2],[V1,N1]);
process_action([V1,N1],[V2,N2],min,_Count) ->
	iif(V1<V2,[V2,N2],[V1,N1]);
process_action(V1,V2,max,_Count) ->
	erlang:max(V1,V2);
process_action(V1,V2,min,_Count) ->
	erlang:max(V1,V2);
process_action(V1,V2,{sum,Divider},_Count) ->
	V1/Divider+V2;
process_action(V1,V2,avg,Count) ->
	(V2*(Count-1)+V1)/Count.

iif(Condition,FalseValue,TrueValue) ->
	case Condition of
		false ->
			FalseValue;
		true ->
			TrueValue
	end.

calc_statistics([]) ->
	{0.0,0.0,0,0.0,0};
calc_statistics([Value|Rest]) ->
	calc_statistics(Rest,{Value,2,Value,1,Value,1}).
	
calc_statistics([],{Average,_Count,MaxValue,MaxNum,MinValue,MinNum}) ->
	{Average,MaxValue,MaxNum,MinValue,MinNum};
calc_statistics([Value|Rest],{Average,Count,MaxValue,MaxNum,MinValue,MinNum}) ->
	NewAverage=(Average*(Count-1)+Value)/Count,
	{NewMaxValue,NewMaxNum}=iif(Value>MaxValue,{MaxValue,MaxNum},{Value,Count}),
	{NewMinValue,NewMinNum}=iif(Value<MinValue,{MinValue,MinNum},{Value,Count}),
	calc_statistics(Rest,{NewAverage,Count+1,NewMaxValue,NewMaxNum,NewMinValue,NewMinNum}).
