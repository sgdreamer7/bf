%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @author Владимир Щербина <vns.scherbina@gmail.com>
%% @copyright 2017
%% @version 1.0.0
%% @doc Модуль <b>charge_program_by_shift.erl</b> реализует формирование данных
%% для сменного протокола загрузки.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
-include("reports.hrl").

-define(table_name,"charge_program").

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
	check_table(),
	ShiftStart=get_shift_start(Year,Month,Day,Shift),
	ShiftFinish=get_shift_finish(Year,Month,Day,Shift),
	ReportDateStr=format_date({{Year,Month,Day},{0,0,0}}),
	ShiftStartStr=format_datetime(ShiftStart),
	ShiftFinishStr=format_datetime(ShiftFinish),
	Data=get_shift_data(ShiftStart,ShiftFinish),
	Rows=process_shift_data(Data),
	{ok,
		[
			{"name","Сменный протокол загрузки"},
			{"report_date",ReportDateStr},
			{"shift",Shift},
			{"shift_start",ShiftStartStr},
			{"shift_finish",ShiftFinishStr},
			{"rows",
				Rows
			}
		]
	};
data(_) ->
	{ok,[]}.

check_table() ->
	Request=[
		{table,?table_name},
		{
			fields,
			[
				{"INDX",datetime},
				{"CHARGE",integer},
				{"CYCLE",integer},
				{"PROGRAM",ascii},
				{"SKIP1",ascii},
				{"SKIP2",ascii},
				{"SKIP3",ascii},
				{"SKIP4",ascii},
				{"SKIP5",ascii},
				{"SKIP6",ascii},
				{"COKE_SKIPS",integer},
				{"SINTER_SKIPS",integer}
			]
		},
		{indexes,[{"INDX",not_unique}]}
	],
	scada_db:create_table(Request).

get_shift_data(ShiftStart,ShiftFinish) ->
	Request=[
		{table,?table_name},
		{fields,
			[
				"INDX",
				"CHARGE",
				"CYCLE",
				"PROGRAM",
				"SKIP1",
				"SKIP2",
				"SKIP3",
				"SKIP4",
				"SKIP5",
				"SKIP6",
				"COKE_SKIPS",
				"SINTER_SKIPS"
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
	scada_db:get_data(Request).

process_shift_data(Data) ->
	lists:map(
		fun(
			[
				INDX,
				CHARGE,
				CYCLE,
				PROGRAM,
				SKIP1,
				SKIP2,
				SKIP3,
				SKIP4,
				SKIP5,
				SKIP6,
				COKE_SKIPS,
				SINTER_SKIPS
			]
		) ->
			{Date,Time}=INDX,
			[
				format_datetime({Date,Time}),
				CHARGE,
				CYCLE,
				PROGRAM,
				SKIP1,
				SKIP2,
				SKIP3,
				SKIP4,
				SKIP5,
				SKIP6,
				COKE_SKIPS,
				SINTER_SKIPS
			]
		end,
		Data
	).
