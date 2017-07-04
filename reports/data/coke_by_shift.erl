%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @author Владимир Щербина <vns.scherbina@gmail.com>
%% @copyright 2017
%% @version 1.0.0
%% @doc Модуль <b>coke_by_shift.erl</b> реализует формирование данных
%% для сменного рапорта по дозированию кокса.
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
	{Downloads,TotalsData}=get_shift_data(ShiftStart,ShiftFinish),
	Totals=process_totals(TotalsData,length(Downloads)),
	{ok,
		[
			{"name","Сменный протокол дозирования кокса"},
			{"report_date",ReportDateStr},
			{"shift",Shift},
			{"shift_start",ShiftStartStr},
			{"shift_finish",ShiftFinishStr},
			{"downloads",
				Downloads
			},
			{"totals",
				Totals
			}
		]
	};
data(_) ->
	{ok,[]}.

process_totals([],_) ->
	[];
process_totals(
	[
		HUMIDITY,
		REF_TECH,
		REF_CORR,
		FACT_DOWN,
		FACT_UP,
		FACT_PERC,
		TIME_DOWN,
		TIME_UP,
		TIME_DOWN_PERC,
		TIME_UP_PERC
	],
	N) ->
	[
		[
			checked_division(HUMIDITY,N),
			REF_TECH,
			REF_CORR,
			FACT_DOWN,
			FACT_UP,
			checked_division(FACT_PERC,N),
			TIME_DOWN,
			TIME_UP,
			checked_division(TIME_DOWN_PERC,N),
			checked_division(TIME_UP_PERC,N)
		]
	].

process_shift_data(Data) ->
	lists:foldr(
		fun(
			[
				INDX,
				CYCLE,
				_SKIP,
				SIDE,
				HUMIDITY,
				REF_TECH,
				REF_CORR,
				FACT_DOWN,
				FACT_UP,
				TIME_DOWN,
				TIME_UP
			],
			{ProcessedData,Totals}
		) ->
			FACT_PERC=100*checked_division(REF_TECH-FACT_UP,REF_TECH),
			TIME_DOWN_PERC=1000*checked_division(TIME_DOWN,FACT_UP),
			TIME_UP_PERC=1000*checked_division(TIME_UP,FACT_UP),
			NewTotalsRow=[
				HUMIDITY,
				REF_TECH,
				REF_CORR,
				FACT_DOWN,
				FACT_UP,
				FACT_PERC,
				TIME_DOWN,
				TIME_UP,
				TIME_DOWN_PERC,
				TIME_UP_PERC
			],
			NewTotals=calc_totals(Totals,NewTotalsRow),
			SideStr=case SIDE of
				1 ->
					"Левый";
				2 ->
					"Правый";
				_ ->
					"-"
			end,
			NewRow=[
				format_datetime(INDX),
				CYCLE,
				SideStr,
				HUMIDITY,
				REF_TECH,
				REF_CORR,
				FACT_DOWN,
				FACT_UP,
				FACT_PERC,
				TIME_DOWN,
				TIME_UP,
				TIME_DOWN_PERC,
				TIME_UP_PERC
			],
			NewProcessedData=[NewRow|ProcessedData],
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

checked_division(_,0.0) ->
	0.0;
checked_division(A,B) ->
	A/B.

get_shift_data(ShiftStart,ShiftFinish) ->
	Request=[
		{table,"DOZING_COKE"},
		{fields,
			[
				"INDX",
				"CYCLE",
				"SKIP",
				"SIDE",
				"HUMIDITY",
				"REF_TECH",
				"REF_CORR",
				"FACT_DOWN",
				"FACT_UP",
				"TIME_DOWN",
				"TIME_UP"
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

check_table() ->
	Request=[
		{table,"DOZING_COKE"},
		{fields,
			[
				{"INDX",datetime},
				{"CYCLE",integer},
				{"SKIP",integer},
				{"SIDE",integer},
				{"HUMIDITY",float},
				{"REF_TECH",float},
				{"REF_CORR",float},
				{"FACT_DOWN",float},
				{"FACT_UP",float},
				{"TIME_DOWN",float},
				{"TIME_UP",float}
			]
		},
		{indexes,[{"INDX",not_unique}]}
	],
	scada_db:create_table(Request).

create_test_data(Year,Month,Day) ->
	case ?isDebuggging of
		true ->
			DeleteRequest=[
				{table,"DOZING_COKE"},
				{conditions,[]}
			],
			scada_db:delete_data(DeleteRequest),
			ShiftStart1=get_shift_start(Year,Month,Day,1),
			ShiftStart2=get_shift_start(Year,Month,Day,2),
			ShiftStart3=get_shift_start(Year,Month,Day,3),
			lists:foreach(
				fun(N) ->
					scada_db:insert_data(build_test_insert_request(ts_add(ShiftStart1,N*60),(N rem 20)+1)),
					scada_db:insert_data(build_test_insert_request2(ts_add(ShiftStart1,N*60),(N rem 20)+1)),
					scada_db:insert_data(build_test_insert_request(ts_add(ShiftStart2,N*60),((N+5) rem 20)+1)),
					scada_db:insert_data(build_test_insert_request2(ts_add(ShiftStart2,N*60),((N+5) rem 20)+1)),
					scada_db:insert_data(build_test_insert_request(ts_add(ShiftStart3,N*60),((N+10) rem 20)+1)),
					scada_db:insert_data(build_test_insert_request2(ts_add(ShiftStart3,N*60),((N+10) rem 20)+1))
				end,
				lists:seq(1,20)
			);
		false ->
			do_nothing
	end.

build_test_insert_request(Timestamp,Cycle) ->
	[
		{table,"DOZING_COKE"},
		{fields,
			[
				{"INDX",Timestamp},
				{"CYCLE",Cycle},
				{"SKIP",1},
				{"SIDE",1},
				{"HUMIDITY",random:uniform()},
				{"REF_TECH",round(random:uniform()*10000)},
				{"REF_CORR",round(random:uniform()*10000)},
				{"FACT_DOWN",round(random:uniform()*10000)},
				{"FACT_UP",round(random:uniform()*10000)},
				{"TIME_DOWN",round(random:uniform()*100)},
				{"TIME_UP",round(random:uniform()*100)}
			]
		}
	].

build_test_insert_request2(Timestamp,Cycle) ->
	[
		{table,"DOZING_COKE"},
		{fields,
			[
				{"INDX",Timestamp},
				{"CYCLE",Cycle},
				{"SKIP",2},
				{"SIDE",2},
				{"HUMIDITY",random:uniform()},
				{"REF_TECH",round(random:uniform()*10000)},
				{"REF_CORR",round(random:uniform()*10000)},
				{"FACT_DOWN",round(random:uniform()*10000)},
				{"FACT_UP",round(random:uniform()*10000)},
				{"TIME_DOWN",round(random:uniform()*100)},
				{"TIME_UP",round(random:uniform()*100)}
			]
		}
	].