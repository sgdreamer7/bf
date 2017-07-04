%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @author Владимир Щербина <vns.scherbina@gmail.com>
%% @copyright 2017
%% @version 1.0.0
%% @doc Модуль <b>journal12.erl</b> реализует формирование данных
%% для документа печного журнала <Температура тела холодильных плит>.
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
		"THPL_1_1",
		"THPL_1_2",
		"THPL_1_3",
		"THPL_1_4",
		"THPL_1_5",
		"THPL_1_6",
		"THPL_2_1",
		"THPL_2_2",
		"THPL_2_3",
		"THPL_2_4",
		"THPL_2_5",
		"THPL_2_6",
		"THPL_3_1",
		"THPL_3_2",
		"THPL_3_3",
		"THPL_3_4",
		"THPL_3_5",
		"THPL_3_6",
		"THPL_4_1",
		"THPL_4_2",
		"THPL_4_3",
		"THPL_4_4",
		"THPL_4_5",
		"THPL_4_6",
		"THPL_5_1",
		"THPL_5_2",
		"THPL_5_3",
		"THPL_5_4",
		"THPL_5_5",
		"THPL_5_6",
		"THPL_6_1",
		"THPL_6_2",
		"THPL_6_3",
		"THPL_6_4",
		"THPL_6_5",
		"THPL_6_6"
	],
	Actions=[
		avg,
		max,
		min,
		avg,
		max,
		min,
		avg,
		max,
		min,
		avg,
		max,
		min,
		avg,
		max,
		min,
		avg,
		max,
		min
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
			{"name","Печной журнал. Температура тела холодильных плит."},
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
	EmptyRow=[0,[0,0],[0,0],0,[0,0],[0,0],0,[0,0],[0,0],0,[0,0],[0,0],0,[0,0],[0,0],0,[0,0],[0,0]],
	Rows=lists:map(
		fun({Start,Finish}) ->
			Request=[
				{table,"journal12"},
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
							THPL_1_1,
							THPL_1_2,
							THPL_1_3,
							THPL_1_4,
							THPL_1_5,
							THPL_1_6,
							THPL_2_1,
							THPL_2_2,
							THPL_2_3,
							THPL_2_4,
							THPL_2_5,
							THPL_2_6,
							THPL_3_1,
							THPL_3_2,
							THPL_3_3,
							THPL_3_4,
							THPL_3_5,
							THPL_3_6,
							THPL_4_1,
							THPL_4_2,
							THPL_4_3,
							THPL_4_4,
							THPL_4_5,
							THPL_4_6,
							THPL_5_1,
							THPL_5_2,
							THPL_5_3,
							THPL_5_4,
							THPL_5_5,
							THPL_5_6,
							THPL_6_1,
							THPL_6_2,
							THPL_6_3,
							THPL_6_4,
							THPL_6_5,
							THPL_6_6
						]
					) ->
						{Average1,Max1,Max1Num,Min1,Min1Num}=calc_statistics(
							[
								THPL_1_1,
								THPL_1_2,
								THPL_1_3,
								THPL_1_4,
								THPL_1_5,
								THPL_1_6
							]
						),
						{Average2,Max2,Max2Num,Min2,Min2Num}=calc_statistics(
							[
								THPL_2_1,
								THPL_2_2,
								THPL_2_3,
								THPL_2_4,
								THPL_2_5,
								THPL_2_6
							]
						),
						{Average3,Max3,Max3Num,Min3,Min3Num}=calc_statistics(
							[
								THPL_3_1,
								THPL_3_2,
								THPL_3_3,
								THPL_3_4,
								THPL_3_5,
								THPL_3_6
							]
						),
						{Average4,Max4,Max4Num,Min4,Min4Num}=calc_statistics(
							[
								THPL_4_1,
								THPL_4_2,
								THPL_4_3,
								THPL_4_4,
								THPL_4_5,
								THPL_4_6
							]
						),
						{Average5,Max5,Max5Num,Min5,Min5Num}=calc_statistics(
							[
								THPL_5_1,
								THPL_5_2,
								THPL_5_3,
								THPL_5_4,
								THPL_5_5,
								THPL_5_6
							]
						),
						{Average6,Max6,Max6Num,Min6,Min6Num}=calc_statistics(
							[
								THPL_6_1,
								THPL_6_2,
								THPL_6_3,
								THPL_6_4,
								THPL_6_5,
								THPL_6_6
							]
						),
						[
							Average1,
							[
								Max1,
								Max1Num
							],
							[
								Min1,
								Min1Num
							],
							Average2,
							[
								Max2,
								Max2Num
							],
							[
								Min2,
								Min2Num
							],
							Average3,
							[
								Max3,
								Max3Num
							],
							[
								Min3,
								Min3Num
							],
							Average4,
							[
								Max4,
								Max4Num
							],
							[
								Min4,
								Min4Num
							],
							Average5,
							[
								Max5,
								Max5Num
							],
							[
								Min5,
								Min5Num
							],
							Average6,
							[
								Max6,
								Max6Num
							],
							[
								Min6,
								Min6Num
							]
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
