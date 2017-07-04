%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @author Владимир Щербина <vns.scherbina@gmail.com>
%% @copyright 2017
%% @version 1.0.0
%% @doc Модуль <b>alarm_messages.erl</b> реализует формирование данных
%% для протокола аварийных и предупредительных сообщений.
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
	Shift=element(1,string:to_integer(get_field("shift",Props))),
	ShiftStart=get_shift_start(Year,Month,Day,Shift),
	ShiftFinish=get_shift_finish(Year,Month,Day,Shift),
	ReportDateStr=format_date({{Year,Month,Day},{0,0,0}}),
	ShiftStartStr=format_datetime(ShiftStart),
	ShiftFinishStr=format_datetime(ShiftFinish),
	Request=[
		{table,"ALARMS"},
		{fields,["ALM_NATIVETIMELAST,ALM_DESCR,ALM_VALUE,ALM_UNIT"]},
		{conditions,
			[
				{"ALM_NATIVETIMELAST",gte,ShiftStart},
				{"ALM_NATIVETIMELAST",lt,ShiftFinish},
				{"ALM_MSGTYPE",eq,"ALARM"}
			]
		},
		{orders,
			[
				{"ALM_NATIVETIMELAST",asc}	]
		}
	],
	Data=scada_db:get_data(Request),
	Messages=lists:map(
		fun([Timestamp,Message,Value,Unit]) ->
			[format_datetime(Timestamp),[Message,": ",Value," ",Unit]]
		end,
		Data
	),
	{ok,
		[
			{"name","Сменный протокол аварийных и предупредительных сообщений"},
			{"report_date",ReportDateStr},
			{"shift",Shift},
			{"shift_start",ShiftStartStr},
			{"shift_finish",ShiftFinishStr},
			{"messages",
				Messages
			}
		]
	};
data(_) ->
	{ok,[]}.


