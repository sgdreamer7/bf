%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @author Владимир Щербина <vns.scherbina@gmail.com>
%% @copyright 2017
%% @version 1.1.0
%% @doc Модуль <b>{@module}</b> реализует функции обработки аварий и доступа к ним.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
-module(scada_alarms).

-behaviour(gen_server).

-export(
	[
		start_link/0,
		start_link/1,
		stop/0
	]
).

-export(
	[
		init/1,
		handle_call/3,
		handle_cast/2,
		handle_info/2,
		terminate/2,
		code_change/3
	]
).

-export(
	[
		update_alarms/1,
		get_alarms/0,
		acknowledge_alarm/1,
		is_acknowledged/1,
		is_active/1,
		log_operator_action/1,
		log_system_action/1
	]
).

-include("tags.hrl").
-include("logs.hrl").

%%%%%%%%%%%%%%%%%%%%%%
%%% public функции %%%
%%%%%%%%%%%%%%%%%%%%%%

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Alarm::#alarm{}) -> ok
%% @doc <i>Обновление аварий</i>
%% <p>
%% <b>Alarm</b> - запись типа #alarm{}, описывающая аварию.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
update_alarms(Alarm) when is_record(Alarm,alarm) ->
	check_alarm(Alarm,scada_share:get_value({shared_alarm,Alarm#alarm.id})),
	ok.


%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (AlarmID::string()) -> ok
%% @doc <i>Проверка на квитирование аварии</i>
%% <p>
%% <b>AlarmID</b> - идентификатор аварии.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
is_acknowledged(AlarmID)->
	case scada_share:get_value({shared_alarm,AlarmID}) of
		undefined ->
			false;
		Alarm ->
			Alarm#alarm.acknowledged
	end.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (AlarmID::string()) -> ok
%% @doc <i>Проверка на активность аварии</i>
%% <p>
%% <b>AlarmID</b> - идентификатор аварии.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
is_active(AlarmID)->
	case scada_share:get_value({shared_alarm,AlarmID}) of
		undefined ->
			false;
		Alarm ->
			Alarm#alarm.acknowledged==false
	end.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec () -> [ #alarm{} ]
%% @doc <i>Получение списка активных и не квитированных аварий</i>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
get_alarms() ->
	AllValues=scada_share:get_all_values(),
	FilteredValues=lists:filter(
		fun({{shared_alarm,_},_}) ->
				true;
			(_) ->
				false
		end,
		AllValues
	),
	FilteredAlarms=plists:map(
		fun({{shared_alarm,_AlarmID},Alarm}) ->
			Alarm
		end,
		FilteredValues,
		{processes,32}
	),
	FilteredAlarms2=lists:filter(
		fun(#alarm{priority=Priority}) ->
			Priority<1000
		end,
		FilteredAlarms
	),
	lists:sort(
		fun(A1,A2) ->
			case A1#alarm.acknowledged of
				false ->
					case A2#alarm.acknowledged of
						false ->
							{{Y1,M1,D1},{H1,Mn1,S1}}=A1#alarm.timestamp,
							{{Y2,M2,D2},{H2,Mn2,S2}}=A2#alarm.timestamp,
							TS1=Y1*10000000000+M1*100000000+D1*1000000+H1*10000+Mn1*100+S1,
							TS2=Y2*10000000000+M2*100000000+D2*1000000+H2*10000+Mn2*100+S2,
							TS1>=TS2;
						true ->
							true
					end;
				true ->
					case A2#alarm.acknowledged of
						false ->
							false;
						true ->
							{{Y1,M1,D1},{H1,Mn1,S1}}=A1#alarm.timestamp,
							{{Y2,M2,D2},{H2,Mn2,S2}}=A2#alarm.timestamp,
							TS1=Y1*10000000000+M1*100000000+D1*1000000+H1*10000+Mn1*100+S1,
							TS2=Y2*10000000000+M2*100000000+D2*1000000+H2*10000+Mn2*100+S2,
							TS1>=TS2
					end
			end
		end,
		FilteredAlarms2
	).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Message) -> ok
%% @doc <i>Регистрация действий оператора</i>
%% <p>
%% <b>Message</b> - сообщение о действиях оператора.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
log_operator_action(Message) when is_list(Message) ->
	scada_share:send_local(operator_action,Message).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Message) -> ok
%% @doc <i>Регистрация действий системы</i>
%% <p>
%% <b>Message</b> - сообщение о действиях системы.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
log_system_action(Message) when is_list(Message) ->
	{{Year,Month,Day},{Hour,Minute,Second},MicroSecs}=scada_share:system_time(),
	io:format("~4..0w-~2..0w-~2..0w ~2..0w:~2..0w:~2..0w.~6..0w: ~ts",[Year,Month,Day,Hour,Minute,Second,MicroSecs,Message]),
	Request=[
		{table,"ALARMS"},
		{
			fields,
			[
				{"ALM_NATIVETIMELAST",{{Year,Month,Day},{Hour,Minute,Second},MicroSecs}},
				{"ALM_TAGNAME",format_value("")},
				{"ALM_TAGDESC",format_value("")},
				{"ALM_VALUE",format_value("")},
				{"ALM_UNIT",format_value("")},
				{"ALM_MSGTYPE",format_value("TEXT")},
				{"ALM_DESCR",list_to_binary(
					[
						format_value(node()),
						": ",
						format_value(Message)
					]
				)},
				{"ALM_ALMSTATUS",format_value("")},
				{"ALM_ALMPRIORITY",format_value("")}
			]
		}
	],
	spawn(
		fun() ->
			scada_db:insert_data(Request)
		end
	).


%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (AlarmID::string()) -> ok
%% @doc <i>Квитирование аварии</i>
%% <p>
%% <b>AlarmID</b> - идентификатор квитируемой аварии.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
acknowledge_alarm(AlarmID) ->
	case scada_share:get_value({shared_alarm,AlarmID}) of
		undefined ->
			ok;
		Alarm ->
			NewAlarm=Alarm#alarm{acknowledged=true},
			update_alarms(NewAlarm),
			#alarm{
				timestamp={{Year,Month,Day},{Hour,Minute,Second}},
				description=Description,
				value=Value,
				units=Units
			}=NewAlarm,
			DateStr=lists:flatten(io_lib:format("~2..0w.~2..0w.~4..0w",[Day,Month,Year])),
			TimeStr=lists:flatten(io_lib:format("~2..0w:~2..0w:~2..0w",[Hour,Minute,Second])),
			log_operator_action(
				lists:flatten(
					[
						to_unicode(<<"Квитировано аварийное сообщение.<br/><table border=\'1\'><tr><td>">>),
						DateStr,
						" ",
						TimeStr,
						"</td><td>",
						Description,
						"</td><td>",
						format_value(Value),
						" ",
						Units,
						"</td></tr></table>"
					]
				)
			)
	end.

%%%%%%%%%%%%%%%%%%%%%%%%%%
%%% gen_server функции %%%
%%%%%%%%%%%%%%%%%%%%%%%%%%

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%% @spec () -> {ok, State}
%% @doc Функция запуска gen_server.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
start_link() ->
	start_link([]).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%% @spec (Options) -> {ok, State}
%% @doc Функция запуска gen_server c опциями.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
start_link(Options) ->
	gen_server:start_link(
		{local, ?MODULE},
		?MODULE,
		none,
		Options
	).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%% @spec () -> ok
%% @doc Функция останова gen_server.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
stop() ->
	gen_server:call(?MODULE,stop,infinity).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%% @spec (Options::list) -> {ok, State}
%% @doc Функция инициализации при запуске gen_server.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
init(_) ->
	erlang:process_flag(trap_exit, true),
	?log_sys(io_lib:format("scada_alarms starting...~n",[])),
	scada_share:subscribe(store_alarm,fun store_alarm_in_db/1),
	scada_share:subscribe(operator_action,fun store_operator_action/1),
	State=undefined,
	?log_sys(io_lib:format("scada_alarms started.~n",[])),
	{ok, State}.

%%%%%%%%%%%%%%%%%%%%%%%%
%%% callback функции %%%
%%%%%%%%%%%%%%%%%%%%%%%%

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%% @spec (_Nothing,State) -> ok
%% @doc Callback функция для gen_server:cast().
%% Для всех не распознанных запросов.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%    
handle_cast(_Nothing,State) ->
	{noreply,State}.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%% @spec (stop,_From,State) -> ok
%% @doc Callback функция для gen_server:call().
%% Для запроса останова.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% 
handle_call(stop,_From,State) ->
	{stop,normal,State}.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%% @spec (_Info, State) -> ok
%% @doc Callback функция при получении сообщений gen_server.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
handle_info(Other, State) ->
	?log_sys(io_lib:format("scada_alarms: Unknown message ~p~n",[Other])),
	{noreply,State}.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%% @spec (_OldVsn, State, _Extra) -> {ok, State}
%% @doc Callback функция для обновление состояния gen_server во время смены кода.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
code_change(_OldVsn, State, _Extra) ->
	{ok, State}.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%% @spec (_Reason, _State) -> ok
%% @doc Callback функция при завершение работы gen_server.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
terminate(Reason, _State) ->
	?log_sys(io_lib:format("~p: terminating for reason: ~p~n",[?MODULE,Reason])),
	normal.



%%%%%%%%%%%%%%%%%%%%%%%
%%% private функции %%%
%%%%%%%%%%%%%%%%%%%%%%%

store_alarm_in_db(Alarm) when is_record(Alarm,alarm) ->
	Request=[
		{table,"ALARMS"},
		{
			fields,
			[
				{"ALM_NATIVETIMELAST",Alarm#alarm.timestamp},
				{"ALM_TAGNAME",format_value(Alarm#alarm.id)},
				{"ALM_TAGDESC",format_value(Alarm#alarm.description)},
				{"ALM_VALUE",format_value(Alarm#alarm.value)},
				{"ALM_UNIT",format_value(Alarm#alarm.units)},
				{"ALM_MSGTYPE",format_value("ALARM")},
				{"ALM_DESCR",format_value(Alarm#alarm.description)},
				{"ALM_ALMSTATUS",format_value(Alarm#alarm.state)},
				{"ALM_ALMPRIORITY",format_value(Alarm#alarm.priority)}
			]
		}
	],
	scada_db:insert_data(Request).

store_operator_action(Message) when is_list(Message) ->
	Request=[
		{table,"ALARMS"},
		{
			fields,
			[
				{"ALM_NATIVETIMELAST",scada_share:system_time()},
				{"ALM_TAGNAME",format_value("")},
				{"ALM_TAGDESC",format_value("")},
				{"ALM_VALUE",format_value("")},
				{"ALM_UNIT",format_value("")},
				{"ALM_MSGTYPE",format_value("OPERATOR")},
				{"ALM_DESCR",format_value(Message)},
				{"ALM_ALMSTATUS",format_value("")},
				{"ALM_ALMPRIORITY",format_value("")}
			]
		}
	],
	spawn(
		fun() ->
			scada_db:insert_data(Request)
		end
	).

format_value(Value) when is_list(Value) ->
	unicode:characters_to_binary(quote(Value));
format_value(Value) ->
	unicode:characters_to_binary(
		quote(io_lib:format("~w",[Value]))
	).

quote(Str) ->
	export_text(Str).

to_unicode(Bin) ->
	io_lib:format("~ts",[Bin]).

check_alarm(
	#alarm{state=State,acknowledged=Acknowledged}=Alarm,
	#alarm{acknowledged=OldAcknowledged}
) when (State=="OK") andalso ((Acknowledged==true) orelse (OldAcknowledged==true)) ->
	scada_share:delete_value({shared_alarm,Alarm#alarm.id}),
	case ((Acknowledged==true) andalso (OldAcknowledged/=true)) of
		true ->
			NewAlarm2=Alarm#alarm{timestamp=scada_share:system_datetime(),acknowledged=Acknowledged,value=to_unicode(<<"квитир.">>)},
			scada_share:send(store_alarm,NewAlarm2);
		false ->
			scada_share:send(store_alarm,Alarm)
	end;

check_alarm(
	#alarm{state=State,acknowledged=Acknowledged}=Alarm,
	#alarm{state=OldState,acknowledged=OldAcknowledged}
) when (State/=OldState) orelse ((Acknowledged==true) andalso (OldAcknowledged/=true)) ->
	NewAlarm=Alarm#alarm{timestamp=scada_share:system_datetime()},
	scada_share:set_value({shared_alarm,Alarm#alarm.id},NewAlarm),
	case ((Acknowledged==true) andalso (OldAcknowledged/=true)) of
		true ->
			case State=="OK" of
				true ->
					scada_share:delete_value({shared_alarm,Alarm#alarm.id});
				false ->
					do_nothing
			end,
			NewAlarm2=Alarm#alarm{timestamp=scada_share:system_datetime(),acknowledged=Acknowledged,value=to_unicode(<<"квитир.">>)},
			scada_share:send(store_alarm,NewAlarm2);
		false ->
			scada_share:send(store_alarm,NewAlarm)
	end;

check_alarm(
	#alarm{state=State}=Alarm,
	undefined
) when State/="OK" ->
	NewAlarm=Alarm#alarm{acknowledged=false},
	scada_share:set_value({shared_alarm,NewAlarm#alarm.id},NewAlarm),
	scada_share:send(store_alarm,NewAlarm);

check_alarm(_Alarm,_OldAlarm) ->
	ok.

export_text(T) ->
    export_text(T, []).

export_text([$< | T], Cont) ->
    "&lt;" ++ export_text(T, Cont);
export_text([$" | T], Cont) ->
    "&quot;" ++ export_text(T, Cont);
export_text([$' | T], Cont) ->
    "&rsquo;" ++ export_text(T, Cont);
export_text([13| T], Cont) ->
    "<br/>" ++ export_text(T, Cont);
export_text([$> | T], Cont) ->
    "&gt;" ++ export_text(T, Cont);
export_text([$& | T], Cont) ->
    "&amp;" ++ export_text(T, Cont);
export_text([C | T], Cont) when is_integer(C) ->
    [C | export_text(T, Cont)];
export_text([T | T1], Cont) ->
    export_text(T, [T1 | Cont]);
export_text([], [T | Cont]) ->
    export_text(T, Cont);
export_text([], []) ->
    [];
export_text(Bin, Cont) ->
    export_text(binary_to_list(Bin), Cont).