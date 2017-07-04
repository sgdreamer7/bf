%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @author Владимир Щербина <vns.scherbina@gmail.com>
%% @copyright 2017
%% @version 1.0.0
%% @doc Модуль <b>downloads_by_shift.erl</b> реализует формирование данных
%% для сменного рапорта по загрузке доменной печи.
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
	{{Year,Month,Day},{_Hour,_Minute,_Second}}=get_timestamp("report_date",Props),
	Shift=element(1,string:to_integer(get_field("shift",Props))),
	ShiftStart=get_shift_start(Year,Month,Day,Shift),
	ShiftFinish=get_shift_finish(Year,Month,Day,Shift),
	ReportDateStr=format_date({{Year,Month,Day},{0,0,0}}),
	ShiftStartStr=format_datetime(ShiftStart),
	ShiftFinishStr=format_datetime(ShiftFinish),
	check_table(),
	create_test_data(Year,Month,Day),
	{Rows,_,Totals,_}=get_shift_data(ShiftStart,ShiftFinish),
	Downloads=case Totals of
		[] ->
			[];
		[
			SinterTotals,
			PelletsTotals,
			CokeTotals,
			D1Totals,
			D2Totals,
			D3Totals,
			D4Totals,
			SinterScreeningTotals,
			_,
			CokeScreeningTotals,
			_,
			_
		] ->
			Rows++
			[
				[
					"ИТОГО",
					SinterTotals,
					PelletsTotals,
					CokeTotals,
					D1Totals,
					D2Totals,
					D3Totals,
					D4Totals,
					SinterScreeningTotals,
					round(checked_division(SinterScreeningTotals,SinterTotals)*10000)/100,
					CokeScreeningTotals,
					round(checked_division(CokeScreeningTotals,CokeTotals)*10000)/100,
					round(
						checked_division(
							SinterTotals+PelletsTotals+D1Totals+D2Totals+D3Totals+D4Totals,
							CokeTotals
						)*100)/100
				]
			]
	end,
	{ok,
		[
			{"name","Сменный рапорт загрузки печи"},
			{"report_date",ReportDateStr},
			{"shift",Shift},
			{"shift_start",ShiftStartStr},
			{"shift_finish",ShiftFinishStr},
			{"downloads",
				Downloads
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

process_shift_data(Data) ->
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
				LAM,
				LA,
				LKM,
				LK,
				RK,
				RKM,
				RA,
				RAM,
				RD1,
				RD2,
				RD3,
				RD4,
				RO1,
				RO2,
				RO3,
				RO4
			],
			{ProcessedData,Totals,AllTotals,PreviousCycle}
		) ->
			Sinter=LA+RA,
			Pellets=LO1+LO2+LO3+LO4+RO1+RO2+RO3+RO4,
			Coke=LK+RK,
			AM=LAM+RAM,
			KM=LKM+RKM,
			case PreviousCycle==CYCLE of
				true ->
					NewTotalsRow=[
						Sinter,
						Pellets,
						Coke,
						LD1+RD1,
						LD2+RD2,
						LD3+RD3,
						LD4+RD4,
						AM,
						KM
					],
					NewTotals=calc_totals(Totals,NewTotalsRow),
					NewAllTotals=AllTotals,
					NewProcessedData=ProcessedData,
					{NewProcessedData,NewTotals,NewAllTotals,CYCLE};
				false ->
					NewTotalsRow=[
						Sinter,
						Pellets,
						Coke,
						LD1+RD1,
						LD2+RD2,
						LD3+RD3,
						LD4+RD4,
						AM,
						KM
					],
					case Totals of
						[] ->
							NewTotals=NewTotalsRow,
							NewAllTotals=AllTotals,
							NewProcessedData=ProcessedData,
							{NewProcessedData,NewTotals,NewAllTotals,CYCLE};
						[
							SinterTotals,
							PelletsTotals,
							CokeTotals,
							D1Totals,
							D2Totals,
							D3Totals,
							D4Totals,
							SinterScreeningTotals,
							CokeScreeningTotals
						] ->
							NewRow=[
								format_datetime(INDX),
								SinterTotals,
								PelletsTotals,
								CokeTotals,
								D1Totals,
								D2Totals,
								D3Totals,
								D4Totals,
								SinterScreeningTotals,
								round(checked_division(SinterScreeningTotals,SinterTotals)*10000)/100,
								CokeScreeningTotals,
								round(checked_division(CokeScreeningTotals,CokeTotals)*10000)/100,
								round(
									checked_division(
										SinterTotals+PelletsTotals+D1Totals+D2Totals+D3Totals+D4Totals,
										CokeTotals
									)*100)/100
							],
							[_|NewAllTotalsRow]=NewRow,
							NewTotals=NewTotalsRow,
							NewAllTotals=calc_totals(AllTotals,NewAllTotalsRow),
							NewProcessedData=[NewRow|ProcessedData],
							{NewProcessedData,NewTotals,NewAllTotals,CYCLE}
					end
			end	
		end,
		{[],[],[],undefined},
		Data
	).

calc_totals(Totals,[]) ->
	Totals;
calc_totals([],Row) ->
	Row;
calc_totals(Totals,Row) ->
	[V1+V2 || {V1,V2} <- lists:zip(Totals,Row)].

get_shift_data(ShiftStart,ShiftFinish) ->
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
				{"INDX",gte,ShiftStart},
				{"INDX",lt,ShiftFinish}
			]
		},
		{orders,[{"INDX",asc}]}
	],
	Data=scada_db:get_data(Request),
	process_shift_data(Data).

checked_division(_,0.0) ->
	0.0;
checked_division(A,B) ->
	A/B.

create_test_data(Year,Month,Day) ->
	case ?isDebuggging of
		true ->
			DeleteRequest=[
				{table,"DOZING"},
				{conditions,[]}
			],
			scada_db:delete_data(DeleteRequest),
			ShiftStart1=get_shift_start(Year,Month,Day,1),
			ShiftStart2=get_shift_start(Year,Month,Day,2),
			ShiftStart3=get_shift_start(Year,Month,Day,3),
			lists:foreach(
				fun(N) ->
					scada_db:insert_data(build_test_insert_request(ts_add(ShiftStart1,N*60),(N rem 20)+1,round(random:uniform()*100))),
					scada_db:insert_data(build_test_insert_request2(ts_add(ShiftStart1,N*60),(N rem 20)+1,round(random:uniform()*100))),
					scada_db:insert_data(build_test_insert_request(ts_add(ShiftStart2,N*60),((N+5) rem 20)+1,round(random:uniform()*100))),
					scada_db:insert_data(build_test_insert_request2(ts_add(ShiftStart2,N*60),((N+5) rem 20)+1,round(random:uniform()*100))),
					scada_db:insert_data(build_test_insert_request(ts_add(ShiftStart3,N*60),((N+10) rem 20)+1,round(random:uniform()*100))),
					scada_db:insert_data(build_test_insert_request2(ts_add(ShiftStart3,N*60),((N+10) rem 20)+1,round(random:uniform()*100)))
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