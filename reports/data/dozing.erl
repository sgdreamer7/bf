%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @author Владимир Щербина <vns.scherbina@gmail.com>
%% @copyright 2017
%% @version 1.0.0
%% @doc Модуль <b>dozing.erl</b> реализует формирование данных
%% для протокола дозирования.
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
	ShiftStart1=get_shift_start(Year,Month,Day,1),
	ShiftFinish1=get_shift_finish(Year,Month,Day,1),
	ShiftStart2=get_shift_start(Year,Month,Day,2),
	ShiftFinish2=get_shift_finish(Year,Month,Day,2),
	ShiftStart3=get_shift_start(Year,Month,Day,3),
	ShiftFinish3=get_shift_finish(Year,Month,Day,3),
	ReportDateStr=format_date({{Year,Month,Day},{0,0,0}}),
	check_table(),
	create_test_data(Year,Month,Day),
	{Downloads1,Totals1}=get_shift_data(ShiftStart1,ShiftFinish1),
	{Downloads2,Totals2}=get_shift_data(ShiftStart2,ShiftFinish2),
	{Downloads3,Totals3}=get_shift_data(ShiftStart3,ShiftFinish3),
	{Totals1_Fe,Totals1_Coke}=calc_fe_coke(Totals1),
	{Totals2_Fe,Totals2_Coke}=calc_fe_coke(Totals2),
	{Totals3_Fe,Totals3_Coke}=calc_fe_coke(Totals3),
	Totals=calc_totals(calc_totals(Totals1,Totals2),Totals3),
	Totals_Fe=Totals1_Fe+Totals2_Fe+Totals3_Fe,
	Totals_Coke=Totals1_Coke+Totals2_Coke+Totals3_Coke,
	{ok,
		[
			{"name","Протокол дозирования"},
			{"report_date",ReportDateStr},
			{"downloads1",
				Downloads1
			},
			{"totals1",
				format_totals(Totals1)
			},
			{"totals1_fe",
				Totals1_Fe
			},
			{"totals1_coke",
				Totals1_Coke
			},
			{"downloads2",
				Downloads2
			},
			{"totals2",
				format_totals(Totals2)
			},
			{"totals2_fe",
				Totals2_Fe
			},
			{"totals2_coke",
				Totals2_Coke
			},
			{"downloads3",
				Downloads3
			},
			{"totals3",
				format_totals(Totals3)
			},
			{"totals3_fe",
				Totals3_Fe
			},
			{"totals3_coke",
				Totals3_Coke
			},
			{"totals",
				format_totals(Totals)
			},
			{"totals_fe",
				Totals_Fe
			},
			{"totals_coke",
				Totals_Coke
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
			{ProcessedData,Totals}
		) ->
			LGSM=LO1+LO2+LO3+LO4+LA,
			RGSM=RO1+RO2+RO3+RO4+RA,
			NewRow=[
				format_datetime(INDX),
				CYCLE,
				round(LO4),
				round(LO3),
				round(LO2),
				round(LO1),
				round(LD4),
				round(LD3),
				round(LD2),
				round(LD1),
				round(LAM),
				round(LA),
				round(LGSM),
				round(LKM),
				round(LK),
				round(RK),
				round(RKM),
				round(RGSM),
				round(RA),
				round(RAM),
				round(RD1),
				round(RD2),
				round(RD3),
				round(RD4),
				round(RO1),
				round(RO2),
				round(RO3),
				round(RO4)
			],
			NewTotalsRow=[
				round(LO4),
				round(LO3),
				round(LO2),
				round(LO1),
				round(LD4),
				round(LD3),
				round(LD2),
				round(LD1),
				round(LAM),
				round(LA),
				round(LGSM),
				round(LKM),
				round(LK),
				round(RK),
				round(RKM),
				round(RGSM),
				round(RA),
				round(RAM),
				round(RD1),
				round(RD2),
				round(RD3),
				round(RD4),
				round(RO1),
				round(RO2),
				round(RO3),
				round(RO4)
			],
			NewProcessedData=[NewRow|ProcessedData],
			NewTotals=calc_totals(Totals,NewTotalsRow),
			{NewProcessedData,NewTotals}
		end,
		{[],[]},
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

calc_fe_coke([]) ->
	{0.0,0.0};
calc_fe_coke([_,_,_,_,LD4,LD3,LD2,LD1,_,_,LGSM,_,LK,RK,_,RGSM,_,_,RD1,RD2,RD3,RD4,_,_,_,_]) ->
	{LD1+LD2+LD3+LD4+LGSM+RD1+RD2+RD3+RD4+RGSM,LK+RK}.

format_totals([]) ->
	[];
format_totals(Totals) ->
	[Totals].

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