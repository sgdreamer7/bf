%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @author Владимир Щербина <vns.scherbina@gmail.com>
%% @copyright 2017
%% @version 1.1.0
%% @doc Модуль <b>{@module}</b> реализует драйвер протокола SNMP.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
-module(scada_driver_snmp).

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
		register_tag/3,	
		set_value/2
	]
).

-include("logs.hrl").
-record(
	state,
	{
		callbacks
	}
).

%%%%%%%%%%%%%%%%%%%%%%
%%% public функции %%%
%%%%%%%%%%%%%%%%%%%%%%

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (TagName,Address,Callback) -> ok
%% @doc <i>Регистрация функции обработки тега при получении его значения</i>
%% <p>
%% <b>TagName</b> - строковое значение, имя тега;<br/>
%% <b>Address</b> - строковое значение, задающее адрес привязки значения тега;<br/>
%% <b>Callback</b> - функция fun/2, которая должна вызываться драйвером
%					 при получении новых данных по адресу Address.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
register_tag(TagName,Address,Callback) ->
	gen_server:call(?MODULE,{register_tag,TagName,Address,Callback}).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Address,Value) -> term() | undefined
%% @doc <i>Запись значения в драйвер</i>
%% <p>
%% <b>Address</b> - строковое значение, задающее адрес записываемых данных;<br/>
%% <b>Value</b> - значение записываемых данных.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
set_value(_Address,_Value) ->
	ok.

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
		Options,
		[]
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
init(_Options) ->
	erlang:process_flag(trap_exit, true),
	?log_sys(io_lib:format("scada_driver_snmp starting...~n",[])),
	application:stop(snmp),
	ok=application:start(snmp),
	State=#state{
		callbacks=gb_trees:empty()
	},
	UpdaterFun=fun() ->
		update_all_data()
	end,
	cron:add(scada_driver_snmp_updater,UpdaterFun,scada:get_app_env(snmp_update_period,1)*1000,500),
	?log_sys(io_lib:format("scada_driver_snmp started.~n",[])),
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
%% @spec ({get_callbacks,Key},_From,State) -> ok
%% @doc Callback функция для gen_server:call().
%% Для запроса получение callbacks обработки тегов.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% 
handle_call(get_callbacks,_From,State) ->
	Callbacks=State#state.callbacks,
	{reply,Callbacks,State};

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%% @spec ({register_tag,TagName,Address,Callback},_From,State) -> ok
%% @doc Callback функция для gen_server:call().
%% Для запроса регистрации тега и адреса.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% 
handle_call({register_tag,TagName,Address,Callback},_From,State) ->
	Callbacks=State#state.callbacks,
	case parse_address(Address) of
		{AgentName,ParsedOID} ->
			Key={AgentName,ParsedOID},
			TagsCallbacks=case gb_trees:lookup(Key,Callbacks) of
				{value,Value} ->
					Value;
				none ->
					gb_trees:empty()
			end,
			NewTagsCallbacks=gb_trees:enter(TagName,Callback,TagsCallbacks),
			NewCallbacks=gb_trees:enter(Key,NewTagsCallbacks,Callbacks),
			NewState=State#state{callbacks=NewCallbacks},
			{reply,ok,NewState};
		_ ->
			?log_sys(io_lib:format("scada_driver_snmp: cannot parse address \'~ts\' for the tag \'~ts\'~n",[Address,TagName])),
			{reply,ok,State}
	end;

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%% @spec (stop,_From,State) -> ok
%% @doc Callback функция для gen_server:call().
%% Для запроса останова.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% 
handle_call(stop,_From,State) ->
	application:stop(snmp),
	{stop,normal,State}.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%% @spec (_Info, State) -> ok
%% @doc Callback функция при получении сообщений gen_server.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
handle_info(Other, State) ->
	?log_sys(io_lib:format("scada_driver_snmp Unknown message ~p~n",[Other])),
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
terminate(_Reason, _State) ->
	?log_sys(io_lib:format("~p: terminating ...~n",[?MODULE])),
	cron:remove(scada_driver_snmp_updater),
	normal.

%%%%%%%%%%%%%%%%%%%%%%%
%%% private функции %%%
%%%%%%%%%%%%%%%%%%%%%%%
update_all_data() ->
	Callbacks=gen_server:call(?MODULE,get_callbacks),
	Iterator=gb_trees:iterator(Callbacks),
	process_callbacks(gb_trees:next(Iterator)).

process_callbacks(none) ->
	ok;
process_callbacks({{AgentName,OID},TagsCallbacks,Iterator}) ->
	Value=scada_snmp:get_value(AgentName,OID,[{timeout,scada:get_app_env(snmp_request_timeout,100)}]),
	TagsIterator=gb_trees:iterator(TagsCallbacks),
	process_tags_callbacks(gb_trees:next(TagsIterator),Value),
	process_callbacks(gb_trees:next(Iterator)).

process_tags_callbacks(none,_Value) ->
	ok;
process_tags_callbacks({TagName,Callback,TagsIterator},Value) ->
	case Value of
		undefined ->
			do_nothing;
		_ ->
			Callback(TagName,Value)
	end,
	process_tags_callbacks(gb_trees:next(TagsIterator),Value).

tokens(S,Sep) ->
    tokens(S,Sep,[],[]).

tokens([],_Sep,Tmp,Res) ->
    lists:reverse([lists:reverse(Tmp)|Res]);

tokens(S,Sep,Tmp,Res) ->
    case lists:prefix(Sep,S) of
        true ->
            {_Head,Tail}=lists:split(length(Sep),S),
            tokens(Tail,Sep,[],[lists:reverse(Tmp)|Res]);
        false ->
            [Head|Tail]=S,
            tokens(Tail,Sep,[Head|Tmp],Res)
    end.

get_integer(S) ->
	case string:to_integer(S) of
		{error,_Reason} ->
			-1;
		{IntValue,_Rest} ->
			IntValue
	end.

parse_address(Address) ->
	case tokens(Address,":") of
		[AgentName,OID] ->
			ParsedOID=lists:map(
				fun(N) ->
					get_integer(N)
				end,
				tokens(OID,".")
			),
			{AgentName,ParsedOID};
		_ ->
			undefined
	end.