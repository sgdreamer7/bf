%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @author Владимир Щербина <vns.scherbina@gmail.com>
%% @copyright 2017
%% @version 1.0.0
%% @doc Модуль <b>cycles.erl</b> реализует формирование данных
%% для протокола циклов по загрузке доменной печи.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
-include("reports.hrl").

-define(isDebuggging,false).

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
	ReportDate=get_timestamp("report_date",Props),
	ReportDate2=get_timestamp("report_date2",Props),
	ReportDateStr=format_datetime(ReportDate),
	ReportDateStr2=format_datetime(ReportDate2),
	check_table(),
	% DeleteRequest=[
	% 	{table,"DOZING"},
	% 	{conditions,[]}
	% ],
	% scada_db:delete_data(DeleteRequest),
	repeat_days(ReportDate,ReportDate2),
	{Cycles,_,_,_,_}=get_period_data(ReportDate,ReportDate2),
		{ok,
		[
			{"name","Протокол циклов"},
			{"title_report_date",re:replace(ReportDateStr,":","-",[{return,list},global])},
			{"title_report_date2",re:replace(ReportDateStr2,":","-",[{return,list},global])},
			{"report_date",ReportDateStr},
			{"report_date2",ReportDateStr2},
			{"cycles",
				Cycles
			}
		]
	};
data(_) ->
	{ok,[]}.


check_table() ->
	Request=[
		{table,"DOZING"},
		{fields,
			[
				{"INDX",datetime},
				{"CYCLE",integer},
				{"SKIP",integer},
				{"LO4",float},
				{"LO3",float},
				{"LO2",float},
				{"LO1",float},
				{"LD4",float},
				{"LD3",float},
				{"LD2",float},
				{"LD1",float},
				{"LAM",float},
				{"LA",float},
				{"LKM",float},
				{"LK",float},
				{"RK",float},
				{"RKM",float},
				{"RA",float},
				{"RAM",float},
				{"RD1",float},
				{"RD2",float},
				{"RD3",float},
				{"RD4",float},
				{"RO1",float},
				{"RO2",float},
				{"RO3",float},
				{"RO4",float}
			]
		},
		{indexes,[{"INDX",not_unique}]}
	],
	scada_db:create_table(Request).

process_period_data(Data) ->
	lists:foldr(
		fun(
			[
				INDX,
				CYCLE,
				_SKIP,
				LO4,
				LO3,
				LO2,
				LO1,
				LD4,
				LD3,
				LD2,
				LD1,
				_LAM,
				LA,
				_LKM,
				LK,
				RK,
				_RKM,
				RA,
				_RAM,
				RD1,
				RD2,
				RD3,
				RD4,
				RO1,
				RO2,
				RO3,
				RO4
			],
			{ProcessedData,Totals,PreviousCycle,StartTS,LastTS}
		) ->
			Sinter=LA+RA,
			Pellets=LO1+LO2+LO3+LO4+RO1+RO2+RO3+RO4,
			Coke=LK+RK,
			case (PreviousCycle>=CYCLE) and (PreviousCycle/=undefined) of
				true ->
					NewTotalsRow=[
						Sinter,
						Pellets,
						Coke,
						LD1+RD1,
						LD2+RD2,
						LD3+RD3,
						LD4+RD4
					],
					NewTotals=calc_totals(Totals,NewTotalsRow),
					NewProcessedData=ProcessedData,
					{NewProcessedData,NewTotals,CYCLE,INDX,LastTS};
				false ->
					NewTotalsRow=[
						Sinter,
						Pellets,
						Coke,
						LD1+RD1,
						LD2+RD2,
						LD3+RD3,
						LD4+RD4
					],
					case Totals of
						[] ->
							NewTotals=NewTotalsRow,
							NewProcessedData=ProcessedData,
							{NewProcessedData,NewTotals,CYCLE,INDX,INDX};
						[
							SinterTotals,
							PelletsTotals,
							CokeTotals,
							D1Totals,
							D2Totals,
							D3Totals,
							D4Totals
						] ->
							NewRow=[
								format_date(StartTS),
								format_time(StartTS),
								format_date(LastTS),
								format_time(LastTS),
								SinterTotals,
								PelletsTotals,
								CokeTotals,
								D1Totals,
								D2Totals,
								D3Totals,
								D4Totals,
								round(
									checked_division(
										SinterTotals+PelletsTotals+D1Totals+D2Totals+D3Totals+D4Totals,
										CokeTotals
									)*100)/100
							],
							NewTotals=NewTotalsRow,
							NewProcessedData=[NewRow|ProcessedData],
							{NewProcessedData,NewTotals,CYCLE,INDX,INDX}
					end
			end	
		end,
		{[],[],undefined,{{0,0,0},{0,0,0}},{{0,0,0},{0,0,0}}},
		[[
				{{0,0,0},{0,0,0}},
				undefined,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
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
			]|Data]
	).

calc_totals(Totals,[]) ->
	Totals;
calc_totals([],Row) ->
	Row;
calc_totals(Totals,Row) ->
	[V1+V2 || {V1,V2} <- lists:zip(Totals,Row)].

get_period_data(PeriodStart,PeriodFinish) ->
	Request=[
		{table,"DOZING"},
		{fields,
			[
				"INDX",
				"CYCLE",
				"SKIP",
				"LO4",
				"LO3",
				"LO2",
				"LO1",
				"LD4",
				"LD3",
				"LD2",
				"LD1",
				"LAM",
				"LA",
				"LKM",
				"LK",
				"RK",
				"RKM",
				"RA",
				"RAM",
				"RD1",
				"RD2",
				"RD3",
				"RD4",
				"RO1",
				"RO2",
				"RO3",
				"RO4"
			]
		},
		{conditions,
			[
				{"INDX",gte,PeriodStart},
				{"INDX",lt,PeriodFinish}
			]
		},
		{orders,[{"INDX",asc}]}
	],
	Data=scada_db:get_data(Request),
	process_period_data(Data).

checked_division(_,0.0) ->
	0.0;
checked_division(A,B) ->
	A/B.

create_test_data(Year,Month,Day) ->
	case ?isDebuggging of
		true ->
			ShiftStart1=get_shift_start(Year,Month,Day,1),
			ShiftStart2=get_shift_start(Year,Month,Day,2),
			ShiftStart3=get_shift_start(Year,Month,Day,3),
			lists:foreach(
				fun(N) ->
					scada_db:insert_data(build_test_insert_request(ts_add(ShiftStart1,N*60),(N rem 20)+1,round(random:uniform()*100))),
					scada_db:insert_data(build_test_insert_request2(ts_add(ShiftStart1,N*60+30),(N rem 20)+1,round(random:uniform()*100))),
					scada_db:insert_data(build_test_insert_request(ts_add(ShiftStart2,N*60),((N+5) rem 20)+1,round(random:uniform()*100))),
					scada_db:insert_data(build_test_insert_request2(ts_add(ShiftStart2,N*60+30),((N+5) rem 20)+1,round(random:uniform()*100))),
					scada_db:insert_data(build_test_insert_request(ts_add(ShiftStart3,N*60),((N+10) rem 20)+1,round(random:uniform()*100))),
					scada_db:insert_data(build_test_insert_request2(ts_add(ShiftStart3,N*60+30),((N+10) rem 20)+1,round(random:uniform()*100)))
				end,
				lists:seq(1,20)
			);
		false ->
			do_nothing
	end.

build_test_insert_request(Timestamp,Cycle,Value) ->
	[
		{table,"DOZING"},
		{fields,
			[
				{"INDX",Timestamp},
				{"CYCLE",Cycle},
				{"SKIP",1},
				{"LO4",0.0},
				{"LO3",0.0},
				{"LO2",0.0},
				{"LO1",0.0},
				{"LD4",0.0},
				{"LD3",0.0},
				{"LD2",0.0},
				{"LD1",0.0},
				{"LAM",0.0},
				{"LA",0.0},
				{"LKM",Value},
				{"LK",Value},
				{"RK",0.0},
				{"RKM",0.0},
				{"RA",0.0},
				{"RAM",0.0},
				{"RD1",0.0},
				{"RD2",0.0},
				{"RD3",0.0},
				{"RD4",0.0},
				{"RO1",0.0},
				{"RO2",0.0},
				{"RO3",0.0},
				{"RO4",0.0}
			]
		}
	].

build_test_insert_request2(Timestamp,Cycle,Value) ->
	[
		{table,"DOZING"},
		{fields,
			[
				{"INDX",Timestamp},
				{"CYCLE",Cycle},
				{"SKIP",2},
				{"LO4",0.0},
				{"LO3",0.0},
				{"LO2",0.0},
				{"LO1",0.0},
				{"LD4",0.0},
				{"LD3",0.0},
				{"LD2",0.0},
				{"LD1",0.0},
				{"LAM",0.0},
				{"LA",0.0},
				{"LKM",0.0},
				{"LK",0.0},
				{"RK",0.0},
				{"RKM",0.0},
				{"RA",Value},
				{"RAM",Value},
				{"RD1",Value},
				{"RD2",Value},
				{"RD3",Value},
				{"RD4",Value},
				{"RO1",Value},
				{"RO2",Value},
				{"RO3",Value},
				{"RO4",Value}
			]
		}
	].

repeat_days(Start,Finish) ->
	case ts_dif(Start,Finish)>=0 of
		true ->
			{{Year,Month,Day},{_Hour,_Minute,_Second}}=Start,
			create_test_data(Year,Month,Day),
			repeat_days(ts_add({{Year,Month,Day},{0,0,0}},86400),Finish);
		false ->
			ok
	end.