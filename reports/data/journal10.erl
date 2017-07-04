%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @author Владимир Щербина <vns.scherbina@gmail.com>
%% @copyright 2017
%% @version 1.0.0
%% @doc Модуль <b>journal10.erl</b> реализует формирование данных
%% для документа печного журнала <Работа воздушных фурм>.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
-include("reports.hrl").

-define(threshold,10.0).

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
		"FPG_1",
		"FPG_2",
		"FPG_3",
		"FPG_4",
		"FPG_5",
		"FPG_6",
		"FPG_7",
		"FPG_8",
		"FPG_9",
		"FPG_10",
		"FPG_11",
		"FPG_12",
		"FPG_13",
		"FPG_14",
		"FPG_15",
		"FPG_16",
		"FPG_17",
		"FPG_18",
		"FPG_19",
		"FPG_20"
	],
	Actions=[
		max,
		max,
		max,
		max,
		max,
		max,
		max,
		max,
		max,
		max,
		max,
		max,
		max,
		max,
		max,
		max,
		max,
		max,
		max,
		max
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
			{"name","Печной журнал. Работа воздушных фурм."},
			{"report_date",ReportDateStr},
			{"shift1_rows",Shift1Rows},
			{"shift2_rows",Shift2Rows},
			{"shift3_rows",Shift3Rows},
			{"shift1_row",[Shift1Row]},
			{"shift2_row",[Shift2Row]},
			{"shift3_row",[Shift3Row]},
			{"day_row",[DayRow]},
			{"shift1_sum",lists:foldl(fun(Furm,Acc) -> Acc+Furm end,0,Shift1Row)},
			{"shift2_sum",lists:foldl(fun(Furm,Acc) -> Acc+Furm end,0,Shift2Row)},
			{"shift3_sum",lists:foldl(fun(Furm,Acc) -> Acc+Furm end,0,Shift3Row)},
			{"day_sum",lists:foldl(fun(Furm,Acc) -> Acc+Furm end,0,DayRow)}
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
	EmptyRow=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	Rows=lists:map(
		fun({Start,Finish}) ->
			Request=[
				{table,"journal10"},
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
							FPG_1,
							FPG_2,
							FPG_3,
							FPG_4,
							FPG_5,
							FPG_6,
							FPG_7,
							FPG_8,
							FPG_9,
							FPG_10,
							FPG_11,
							FPG_12,
							FPG_13,
							FPG_14,
							FPG_15,
							FPG_16,
							FPG_17,
							FPG_18,
							FPG_19,
							FPG_20
						]
					) ->
						[
							iif(FPG_1>?threshold,0,1),
							iif(FPG_2>?threshold,0,1),
							iif(FPG_3>?threshold,0,1),
							iif(FPG_4>?threshold,0,1),
							iif(FPG_5>?threshold,0,1),
							iif(FPG_6>?threshold,0,1),
							iif(FPG_7>?threshold,0,1),
							iif(FPG_8>?threshold,0,1),
							iif(FPG_9>?threshold,0,1),
							iif(FPG_10>?threshold,0,1),
							iif(FPG_11>?threshold,0,1),
							iif(FPG_12>?threshold,0,1),
							iif(FPG_13>?threshold,0,1),
							iif(FPG_14>?threshold,0,1),
							iif(FPG_15>?threshold,0,1),
							iif(FPG_16>?threshold,0,1),
							iif(FPG_17>?threshold,0,1),
							iif(FPG_18>?threshold,0,1),
							iif(FPG_19>?threshold,0,1),
							iif(FPG_20>?threshold,0,1)
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