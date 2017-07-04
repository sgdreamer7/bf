%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @author Владимир Щербина <vns.scherbina@gmail.com>
%% @copyright 2017
%% @version 1.0.0
%% @doc Модуль <b>journal11.erl</b> реализует формирование данных
%% для документа печного журнала <Температура футеровки и гарнисажа шахты печи>.
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
		"TSHA_1_1",
		"TSHA_1_2",
		"TSHA_1_3",
		"TSHA_1_4",
		"TSHA_1_5",
		"TSHA_1_6",
		"TSHA_1_7",
		"TSHA_1_8",
		"TSHA_1_9",
		"TSHA_1_10",
		"TSHA_1_11",
		"TSHA_1_12",
		"TSHA_1_13",
		"TSHA_1_14",
		"TSHA_1_15",
		"TSHA_1_16",
		"TSHA_1_17",
		"TSHA_1_18",
		"TSHA_2_1",
		"TSHA_2_2",
		"TSHA_2_3",
		"TSHA_2_4",
		"TSHA_2_5",
		"TSHA_2_6",
		"TSHA_2_7",
		"TSHA_2_8",
		"TSHA_2_9",
		"TSHA_2_10",
		"TSHA_2_11",
		"TSHA_2_12",
		"TSHA_2_13",
		"TSHA_2_14",
		"TSHA_2_15",
		"TSHA_2_16",
		"TSHA_2_17",
		"TSHA_2_18",
		"TSHA_3_1",
		"TSHA_3_2",
		"TSHA_3_3",
		"TSHA_3_4",
		"TSHA_3_5",
		"TSHA_3_6",
		"TSHA_3_7",
		"TSHA_3_8",
		"TSHA_3_9",
		"TSHA_3_10",
		"TSHA_3_11",
		"TSHA_3_12",
		"TSHA_3_13",
		"TSHA_3_14",
		"TSHA_3_15",
		"TSHA_3_16",
		"TSHA_3_17",
		"TSHA_3_18",
		"TSHA_4_1",
		"TSHA_4_2",
		"TSHA_4_3",
		"TSHA_4_4",
		"TSHA_4_5",
		"TSHA_4_6",
		"TSHA_4_7",
		"TSHA_4_8",
		"TSHA_4_9",
		"TSHA_4_10",
		"TSHA_4_11",
		"TSHA_4_12",
		"TSHA_4_13",
		"TSHA_4_14",
		"TSHA_4_15",
		"TSHA_4_16",
		"TSHA_4_17",
		"TSHA_4_18",
		"TSHA_5_1",
		"TSHA_5_2",
		"TSHA_5_3",
		"TSHA_5_4",
		"TSHA_5_5",
		"TSHA_5_6",
		"TSHA_5_7",
		"TSHA_5_8",
		"TSHA_5_9",
		"TSHA_5_10",
		"TSHA_5_11",
		"TSHA_5_12",
		"TSHA_5_13",
		"TSHA_5_14",
		"TSHA_5_15",
		"TSHA_5_16",
		"TSHA_5_17",
		"TSHA_5_18"
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
			{"name","Печной журнал. Температура футеровки и гарнисажа шахты печи."},
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
	EmptyRow=[0,[0,[0,0]],[0,[0,0]],0,[0,[0,0]],[0,[0,0]],0,[0,[0,0]],[0,[0,0]],0,[0,[0,0]],[0,[0,0]],0,[0,[0,0]],[0,[0,0]]],
	Rows=lists:map(
		fun({Start,Finish}) ->
			Request=[
				{table,"journal11"},
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
							TSHA_1_1,
							TSHA_1_2,
							TSHA_1_3,
							TSHA_1_4,
							TSHA_1_5,
							TSHA_1_6,
							TSHA_1_7,
							TSHA_1_8,
							TSHA_1_9,
							TSHA_1_10,
							TSHA_1_11,
							TSHA_1_12,
							TSHA_1_13,
							TSHA_1_14,
							TSHA_1_15,
							TSHA_1_16,
							TSHA_1_17,
							TSHA_1_18,
							TSHA_2_1,
							TSHA_2_2,
							TSHA_2_3,
							TSHA_2_4,
							TSHA_2_5,
							TSHA_2_6,
							TSHA_2_7,
							TSHA_2_8,
							TSHA_2_9,
							TSHA_2_10,
							TSHA_2_11,
							TSHA_2_12,
							TSHA_2_13,
							TSHA_2_14,
							TSHA_2_15,
							TSHA_2_16,
							TSHA_2_17,
							TSHA_2_18,
							TSHA_3_1,
							TSHA_3_2,
							TSHA_3_3,
							TSHA_3_4,
							TSHA_3_5,
							TSHA_3_6,
							TSHA_3_7,
							TSHA_3_8,
							TSHA_3_9,
							TSHA_3_10,
							TSHA_3_11,
							TSHA_3_12,
							TSHA_3_13,
							TSHA_3_14,
							TSHA_3_15,
							TSHA_3_16,
							TSHA_3_17,
							TSHA_3_18,
							TSHA_4_1,
							TSHA_4_2,
							TSHA_4_3,
							TSHA_4_4,
							TSHA_4_5,
							TSHA_4_6,
							TSHA_4_7,
							TSHA_4_8,
							TSHA_4_9,
							TSHA_4_10,
							TSHA_4_11,
							TSHA_4_12,
							TSHA_4_13,
							TSHA_4_14,
							TSHA_4_15,
							TSHA_4_16,
							TSHA_4_17,
							TSHA_4_18,
							TSHA_5_1,
							TSHA_5_2,
							TSHA_5_3,
							TSHA_5_4,
							TSHA_5_5,
							TSHA_5_6,
							TSHA_5_7,
							TSHA_5_8,
							TSHA_5_9,
							TSHA_5_10,
							TSHA_5_11,
							TSHA_5_12,
							TSHA_5_13,
							TSHA_5_14,
							TSHA_5_15,
							TSHA_5_16,
							TSHA_5_17,
							TSHA_5_18
						]
					) ->
						{Average1,Max1,Max1Num,Max1BlockNum,Min1,Min1Num,Min1BlockNum}=calc_statistics(
							1,
							[
								TSHA_1_1,
								TSHA_1_2,
								TSHA_1_3,
								TSHA_1_4,
								TSHA_1_5,
								TSHA_1_6,
								TSHA_1_7,
								TSHA_1_8,
								TSHA_1_9,
								TSHA_1_10,
								TSHA_1_11,
								TSHA_1_12,
								TSHA_1_13,
								TSHA_1_14,
								TSHA_1_15,
								TSHA_1_16,
								TSHA_1_17,
								TSHA_1_18
							]
						),
						{Average2,Max2,Max2Num,Max2BlockNum,Min2,Min2Num,Min2BlockNum}=calc_statistics(
							2,
							[
								TSHA_2_1,
								TSHA_2_2,
								TSHA_2_3,
								TSHA_2_4,
								TSHA_2_5,
								TSHA_2_6,
								TSHA_2_7,
								TSHA_2_8,
								TSHA_2_9,
								TSHA_2_10,
								TSHA_2_11,
								TSHA_2_12,
								TSHA_2_13,
								TSHA_2_14,
								TSHA_2_15,
								TSHA_2_16,
								TSHA_2_17,
								TSHA_2_18
							]
						),
						{Average3,Max3,Max3Num,Max3BlockNum,Min3,Min3Num,Min3BlockNum}=calc_statistics(
							3,
							[
								TSHA_3_1,
								TSHA_3_2,
								TSHA_3_3,
								TSHA_3_4,
								TSHA_3_5,
								TSHA_3_6,
								TSHA_3_7,
								TSHA_3_8,
								TSHA_3_9,
								TSHA_3_10,
								TSHA_3_11,
								TSHA_3_12,
								TSHA_3_13,
								TSHA_3_14,
								TSHA_3_15,
								TSHA_3_16,
								TSHA_3_17,
								TSHA_3_18
							]
						),
						{Average4,Max4,Max4Num,Max4BlockNum,Min4,Min4Num,Min4BlockNum}=calc_statistics(
							4,
							[
								TSHA_4_1,
								TSHA_4_2,
								TSHA_4_3,
								TSHA_4_4,
								TSHA_4_5,
								TSHA_4_6,
								TSHA_4_7,
								TSHA_4_8,
								TSHA_4_9,
								TSHA_4_10,
								TSHA_4_11,
								TSHA_4_12,
								TSHA_4_13,
								TSHA_4_14,
								TSHA_4_15,
								TSHA_4_16,
								TSHA_4_17,
								TSHA_4_18
							]
						),
						{Average5,Max5,Max5Num,Max5BlockNum,Min5,Min5Num,Min5BlockNum}=calc_statistics(
							5,
							[
								TSHA_5_1,
								TSHA_5_2,
								TSHA_5_3,
								TSHA_5_4,
								TSHA_5_5,
								TSHA_5_6,
								TSHA_5_7,
								TSHA_5_8,
								TSHA_5_9,
								TSHA_5_10,
								TSHA_5_11,
								TSHA_5_12,
								TSHA_5_13,
								TSHA_5_14,
								TSHA_5_15,
								TSHA_5_16,
								TSHA_5_17,
								TSHA_5_18
							]
						),
						[
							Average1,
							[
								Max1,
								[
									Max1BlockNum,
									Max1Num
								]
							],
							[
								Min1,
								[
									Min1BlockNum,
									Min1Num
								]
							],
							Average2,
							[
								Max2,
								[
									Max2BlockNum,
									Max2Num
								]
							],
							[
								Min2,
								[
									Min2BlockNum,
									Min2Num
								]
							],
							Average3,
							[
								Max3,
								[
									Max3BlockNum,
									Max3Num
								]
							],
							[
								Min3,
								[
									Min3BlockNum,
									Min3Num
								]
							],
							Average4,
							[
								Max4,
								[
									Max4BlockNum,
									Max4Num
								]
							],
							[
								Min4,
								[
									Min4BlockNum,
									Min4Num
								]
							],
							Average5,
							[
								Max5,
								[
									Max5BlockNum,
									Max5Num
								]
							],
							[
								Min5,
								[
									Min5BlockNum,
									Min5Num
								]
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

calc_statistics(_Level,[]) ->
	{0.0,0.0,0,0,0.0,0,0};
calc_statistics(Level,[Value|Rest]) ->
	calc_statistics(Level,Rest,{Value,2,Value,1,block_number(Level,1),Value,1,block_number(Level,1)}).
	
calc_statistics(_Level,[],{Average,_Count,MaxValue,MaxNum,MaxBlockNum,MinValue,MinNum,MinBlockNum}) ->
	{Average,MaxValue,MaxNum,MaxBlockNum,MinValue,MinNum,MinBlockNum};
calc_statistics(Level,[Value|Rest],{Average,Count,MaxValue,MaxNum,MaxBlockNum,MinValue,MinNum,MinBlockNum}) ->
	NewAverage=(Average*(Count-1)+Value)/Count,
	{NewMaxValue,NewMaxNum,NewMaxBlockNum}=iif(Value>MaxValue,{MaxValue,MaxNum,MaxBlockNum},{Value,Count,block_number(Level,Count)}),
	{NewMinValue,NewMinNum,NewMinBlockNum}=iif(Value<MinValue,{MinValue,MinNum,MinBlockNum},{Value,Count,block_number(Level,Count)}),
	calc_statistics(Level,Rest,{NewAverage,Count+1,NewMaxValue,NewMaxNum,NewMaxBlockNum,NewMinValue,NewMinNum,NewMinBlockNum}).

block_number(Level,Num) ->
	Level*100+Num.