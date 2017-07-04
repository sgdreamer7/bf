%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @author Владимир Щербина <vns.scherbina@gmail.com>
%% @copyright 2017
%% @version 1.0.0
%% @doc Модуль <b>journal9.erl</b> реализует формирование данных
%% для документа печного журнала <Режим работы воздухонагревателя>.
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
	io:format("~p, ~p~n",[get_field("shift",Props),string:to_integer(get_field("shift",Props))]),
	VNNum=element(1,string:to_integer(get_field("shift",Props))),
	ReportDateStr=format_date({{Year,Month,Day},{0,0,0}}),
	Start=get_shift_start(Year,Month,Day,1),
	Finish=get_shift_finish(Year,Month,Day,3),
	Fields=[
		"INDX",
		lists:flatten(io_lib:format("VN_~1..0w_MODE",[VNNum])),
		"TGD",
		lists:flatten(io_lib:format("TPP_VN_~1..0w",[VNNum])),
		lists:flatten(io_lib:format("TD_VN_~1..0w",[VNNum])),
		lists:flatten(io_lib:format("TSTYK_VN_~1..0w",[VNNum])),
		lists:flatten(io_lib:format("TKG_VN_~1..0w",[VNNum])),
		lists:flatten(io_lib:format("FSG_VN_~1..0w",[VNNum]))
	],
	Actions=[
		last,
		last,
		avg,
		max,
		max,
		max,
		max,
		{sum,60.0}
	],
	Request=[
		{table,lists:flatten(io_lib:format("journal9_~1..0w",[VNNum]))},
		{fields,Fields},
		{conditions,
			[
				{"INDX",gte,Start},
				{"INDX",lt,Finish}
			]
		},
		{orders,[{"INDX",asc}]}
	],
	Data=scada_db:get_data(Request),
	{_,Modes}=lists:foldr(
		fun(Row,{PreviousMode,Acc}) ->
			[_INDX,Mode|_]=Row,
			case Mode==PreviousMode of
				false ->
					{Mode,[[Row]|Acc]};
				true ->
					[LastModeRows|RestAcc]=Acc,
					{Mode,[[Row|LastModeRows]|RestAcc]}
			end
		end,
		{-1,[]},
		Data
	),
	AllRows=lists:foldr(
		fun(ModeRows,Acc2) ->
			{_,ModeRow,FirstTimestamp}=lists:foldl(
				fun(Row,{Count,Acc3,FirstTS}) ->
					case Acc3 of
						[] ->
							[INDX,_Mode|_]=Row,
							{Count+1,Row,INDX};
						_ ->
							{Count+1,process_actions(Row,Acc3,Actions,Count),FirstTS}
					end
				end,
				{1,[],undefined},
				ModeRows
			),
			[
				LastTimestamp,
				VNMode,
				TGD,
				TPP_VN,
				TD_VN,
				TSTYK_VN,
				TKG_VN,
				FSG_VN
			]=ModeRow,
			NewRow=case erlang:round(VNMode) of
				1 ->
					[
						get_shift(FirstTimestamp),
						"НАГРЕВ",
						format_datetime(FirstTimestamp),
						format_datetime(LastTimestamp),
						0,
						TPP_VN,
						TD_VN,
						TSTYK_VN,
						TKG_VN,
						FSG_VN
					];
				2 ->
					[
						get_shift(FirstTimestamp),
						"ОТДЕЛЕНИЕ",
						format_datetime(FirstTimestamp),
						format_datetime(LastTimestamp),
						0,
						0,
						0,
						0,
						0,
						0
					];
				3 ->
					[
						get_shift(FirstTimestamp),
						"ДУТЬЕ",
						format_datetime(FirstTimestamp),
						format_datetime(LastTimestamp),
						TGD,
						0,
						0,
						0,
						0,
						0
					];
				4 ->
					[
						get_shift(FirstTimestamp),
						"ТЯГА",
						format_datetime(FirstTimestamp),
						format_datetime(LastTimestamp),
						0,
						TPP_VN,
						TD_VN,
						TSTYK_VN,
						TKG_VN,
						0
					];
				_ ->
					[
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0
					]
			end,
			[NewRow]++Acc2
		end,
		[],
		Modes
	),
	{ok,
		[
			{"name",lists:flatten(io_lib:format("Печной журнал. Режим работы воздухонагревателя №~2..0w.",[vn_num(VNNum)]))},
			{"report_date",ReportDateStr},
			{"rows",AllRows}
		]
	};
data(_) ->
	{ok,[]}.

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
	(V2*(Count-1)+V1)/Count;
process_action(V1,_V2,last,_Count) ->
	V1.

iif(Condition,FalseValue,TrueValue) ->
	case Condition of
		false ->
			FalseValue;
		true ->
			TrueValue
	end.

vn_num(1) ->
	12;
vn_num(2) ->
	13;
vn_num(3) ->
	14;
vn_num(4) ->
	19;
vn_num(_) ->
	0.


