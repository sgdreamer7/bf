%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @author Владимир Щербина <vns.scherbina@gmail.com>
%% @copyright 2017
%% @version 1.0.0
%% @doc Модуль <b>journal8.erl</b> реализует формирование данных
%% для документа печного журнала <Режим работы ГСС>.
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
		"FDG_GSS",
		"FPG_GSS",
		"PSG"
	],
	Actions=[
		avg,
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
			{"name","Печной журнал. Режим работы ГСС."},
			{"report_date",ReportDateStr},
			{"shift1_rows",Shift1Rows},
			{"shift2_rows",Shift2Rows},
			{"shift3_rows",Shift3Rows},
			{"shift1_row",[Shift1Row]},
			{"shift2_row",[Shift2Row]},
			{"shift3_row",[Shift3Row]},
			{"day_row",[DayRow]}
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
	EmptyRow=[0,0,0],
	Rows=lists:map(
		fun({Start,Finish}) ->
			Request=[
				{table,"journal8"},
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
							FDG_GSS,
							FPG_GSS,
							PSG
						]
					) ->
						[
							FDG_GSS,
							FPG_GSS,
							PSG
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