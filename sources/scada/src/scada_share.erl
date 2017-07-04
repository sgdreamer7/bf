%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @author Владимир Щербина <vns.scherbina@gmail.com>
%% @copyright 2017
%% @version 1.1.0
%% @doc Модуль <b>{@module}</b> реализует функции распределенного синхронизированного хранилища Key/Value.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
-module(scada_share).

-behaviour(gen_server).

-export(
    [
        start_link/0,
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
]).

-export(
    [
        get_value/1,
        get_all_values/0,
        set_value/2,
        set_local_value/2,
        delete_value/1,
        delete_local_value/1,
        subscribe/2,
        send/2,
        send_local/2,
        send_by_order/2,
        system_time/0,
        system_datetime/0,
        system_time_microseconds/0,
        is_active_node/0
    ]
).

-include("logs.hrl").

-define(USE_PROCESS_DICTIONARY,false).

-record(
    state,{
        values,
        local_values,
        callbacks,
        nodes
    }
).

%%%%%%%%%%%%%%%%%%%%%%
%%% public функции %%%
%%%%%%%%%%%%%%%%%%%%%%

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec () -> [{Key,Value}]
%% @doc <i>Чтение всех значений/1</i>
%% <p>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
get_all_values() ->
    scada_share_kv:get_all_values()++scada_share_kv:get_all_local_values().

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Key) -> term() | undefined
%% @doc <i>Чтение значения по ключу</i>
%% <p>
%% <b>Key</b> - ключ.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
get_value(Key) ->
    scada_share_kv:get_value(Key).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Key,Value) -> ok
%% @doc <i>Запись глобального значения ключа</i>
%% <p>
%% <b>Key</b> - ключ;<br/>
%% <b>Value</b> - значение.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
set_value(Key,Value) ->
    scada_share_kv:set_value(Key,Value),
    call_fun_on_all_nodes_exclude_me(scada_share_kv,set_value,[Key,Value]).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Key,Value) -> ok
%% @doc <i>Запись локального значения ключа</i>
%% <p>
%% <b>Key</b> - ключ;<br/>
%% <b>Value</b> - значение.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
set_local_value(Key,Value) ->
    scada_share_kv:set_local_value(Key,Value).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Key) -> ok
%% @doc <i>Удаление глобального значения ключа</i>
%% <p>
%% <b>Key</b> - ключ.<br/>
%% </p>
%% @end
delete_value(Key) ->
    scada_share_kv:delete_value(Key),
    call_fun_on_all_nodes_exclude_me(scada_share_kv,delete_value,[Key]).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Key) -> ok
%% @doc <i>Удаление локального значения ключа</i>
%% <p>
%% <b>Key</b> - ключ.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
delete_local_value(Key) ->
    scada_share_kv:delete_local_value(Key).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Channel,Callback) -> ok
%% @doc <i>Установка callback функции для сообщений по каналу</i>
%% <p>
%% <b>Channel</b> - имя канала;<br/>
%% <b>Callback</b> - callback функция fun/1.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
subscribe(Channel,Callback) ->
    gen_server:call(?MODULE,{subscribe,Channel,Callback},60000).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Channel,Message) -> ok
%% @doc <i>Отправка сообщения по каналу</i>
%% <p>
%% <b>Channel</b> - имя канала;<br/>
%% <b>Message</b> - отправляемое сообщение.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
send(Channel,Message) ->
    send_message_to_all({message,Channel,Message}).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Channel,Message) -> ok
%% @doc <i>Отправка сообщения по каналу первому "живому" узлу</i>
%% <p>
%% <b>Channel</b> - имя канала;<br/>
%% <b>Message</b> - отправляемое сообщение.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
send_by_order(Channel,Message) ->
    send_message_by_order({message,Channel,Message}).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Channel,Message) -> ok
%% @doc <i>Отправка сообщения по каналу только для локального узла</i>
%% <p>
%% <b>Channel</b> - имя канала;<br/>
%% <b>Message</b> - отправляемое сообщение.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
send_local(Channel,Message) ->
    erlang:send({?MODULE,node()},{message,Channel,Message}).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec () -> term
%% @doc <i>Получение системного времени</i>
%% <p>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
system_time() ->
    case get_value(system_time) of
        undefined ->
            {MegaSecs, Secs, MicroSecs}=erlang:now(),
            {Date,Time}=calendar:now_to_local_time({MegaSecs, Secs, MicroSecs}),
            {Date,Time,MicroSecs};
        SystemTS ->
            MicroSecs=SystemTS rem 1000000,
            GregorianSecs=SystemTS div 1000000,
            {Date,Time}=calendar:gregorian_seconds_to_datetime(GregorianSecs),
            {Date,Time,MicroSecs}
    end.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec () -> term
%% @doc <i>Получение системного времени</i>
%% <p>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
system_datetime() ->
    case get_value(system_time) of
        undefined ->
            {MegaSecs, Secs, MicroSecs}=erlang:now(),
            calendar:now_to_local_time({MegaSecs, Secs, MicroSecs});
        SystemTS ->
            GregorianSecs=SystemTS div 1000000,
            calendar:gregorian_seconds_to_datetime(GregorianSecs)
    end.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec () -> term
%% @doc <i>Получение системного времени в микросекундах</i>
%% <p>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
system_time_microseconds() ->
    {Date,Time,MicroSecs}=system_time(),
    GregorianSecs=calendar:datetime_to_gregorian_seconds({Date,Time}),
    GregorianSecs*1000000+MicroSecs.

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
    gen_server:start_link(
        {local, ?MODULE},
        ?MODULE, 
        [], 
        []
    ).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%% @spec () -> ok
%% @doc Функция останова gen_server.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
stop() ->
    gen_server:cast(?MODULE,stop).
    
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%% @spec (Options::list) -> {ok, State}
%% @doc Функция инициализации при запуске gen_server.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
init(_Options) ->
    erlang:process_flag(trap_exit, true),
    ?log_sys_text(io_lib:format("scada_share starting...~n",[])),
    State=#state{
        values=gb_trees:empty(),
        local_values=gb_trees:empty(),
        callbacks=gb_trees:empty(),
        nodes=gb_trees:empty()
    },
    Nodes=get_all_nodes(),
    net_kernel:allow(Nodes),
    lists:foreach(
        fun(Node) ->
            ?log_sys_text(io_lib:format("scada_share: Node: ~p, Ping: ~p~n",[Node,net_adm:ping(Node)]))
        end,
        Nodes
    ),
    send_message_to_all({request_to_sync_me,node()}),
    ?log_sys_text(io_lib:format("scada_share started.~n",[])),
    cron:add(scada_share_system_time_updater,fun system_time_updater/1,100,0,undefined),
    {ok,State}.

%%%%%%%%%%%%%%%%%%%%%%%%
%%% callback функции %%%
%%%%%%%%%%%%%%%%%%%%%%%%


%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%% @spec (Request, From, State) -> ok
%% @doc Callback функция для gen_server:call().
%% Для запроса получения списка активных узлов.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
handle_call(get_nodes, _From, State) ->
    Reply=State#state.nodes,
    {reply, Reply, State};

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%% @spec (Request, From, State) -> ok
%% @doc Callback функция для gen_server:call().
%% Для запроса установки callback функции для канала.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
handle_call({subscribe,Channel,Callback}, _From, State) ->
    NewCallbacks=gb_trees:enter(Channel,Callback,State#state.callbacks),
    NewState=State#state{callbacks=NewCallbacks},
    {reply, ok, NewState};


%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%% @spec (Request, From, State) -> ok
%% @doc Callback функция для gen_server:call().
%% Для всех не распознанных запросов.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
handle_call(Request, From, State) ->
    Reply = {error, {unknown_request, Request, From, State}},
    {reply, Reply, State}.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%% @spec (_Msg, State) -> ok
%% @doc Callback функция для gen_server:cast().
%% Для запроса на остановку gen_server.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
handle_cast(stop, State) ->
    {stop, normal, State};
    
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%% @spec (_Msg, State) -> ok
%% @doc Callback функция для gen_server:cast().
%% Для всех не распознанных запросов.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
handle_cast(_Msg, State) ->
    {noreply, State}.


%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%% @spec (_Info, State) -> ok
%% @doc Callback функция при получении сообщений о синхронизации состояния между узлами.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
handle_info({i_am_alive,Node}, State) ->
    CurrentTimestamp=format_now(erlang:now()),
    Nodes=State#state.nodes,
    NewNodes=gb_trees:enter(Node,CurrentTimestamp,Nodes),
    {noreply, State#state{nodes=NewNodes}};
 
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%% @spec (_Info, State) -> ok
%% @doc Callback функция при получении сообщений о синхронизации состояния между узлами.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
handle_info({request_to_sync_me,Node}, State) ->
    case Node=:=node() of
        false ->
            SharedState=scada_share_kv:get_all_values(),            
            send_message_to_all({set_state,node(),SharedState});
        true ->
            ok
    end,
    {noreply, State};
 
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%% @spec (_Info, State) -> ok
%% @doc Callback функция при получении сообщений об установке состояния.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
handle_info({set_state,Node,ReceivedValues}, State) ->
    case Node=:=node() of
        false ->
            lists:foreach(
                fun({Key,Value}) ->
                    scada_share_kv:set_value(Key,Value)
                end,
                ReceivedValues
            ),
            {noreply,State};
        true ->
            {noreply,State}
    end;

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%% @spec (_Info, State) -> ok
%% @doc Callback функция при получении сообщений по каналу.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
handle_info({message,Channel,Message}, State) ->
    case gb_trees:lookup(Channel,State#state.callbacks) of
        none ->
            undefined;
        {value,Callback} ->
            spawn(
                fun() ->
                    (catch Callback(Message))
                end
            )
    end,
    {noreply, State};

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%% @spec (_Info, State) -> ok
%% @doc Callback функция при получении сообщений gen_server.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
handle_info(_Info, State) ->
    ?log_sys_text(io_lib:format("scada_share: Unknown message ~p~n",[_Info])),
    {noreply, State}.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%% @spec (_Reason, _State) -> ok
%% @doc Callback функция при завершение работы gen_server.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
terminate(Reason, _State) ->
    ?log_sys_text(io_lib:format("~p: terminating for reason: ~p~n",[?MODULE,Reason])),
    cron:remove(scada_share_system_time_updater),
    normal.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%% @spec (_OldVsn, State, _Extra) -> {ok, State}
%% @doc Callback функция для обновление состояния gen_server во время смены кода.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
code_change(_OldVsn, State, _Extra) ->
    {ok, State}.

%%%%%%%%%%%%%%%%%%%%%%%
%%% private функции %%%
%%%%%%%%%%%%%%%%%%%%%%%
send_message_to_all(Message) ->
    Nodes=get_all_nodes(),
    lists:foreach(
        fun(Node) ->
            case lists:member(Node,[node()|nodes()]) of
                true ->
                    erlang:send({?MODULE,Node},Message);
                false ->
                    ok
            end
        end,
        Nodes
    ),
    ok.

send_message_by_order(Message) ->
    Nodes=get_all_nodes(),
    ActiveNodes=gen_server:call(?MODULE,get_nodes,5000),
    send_message_by_order(Message,Nodes,ActiveNodes,false).
    
send_message_by_order(_Message,_Nodes,_ActiveNodes,true) ->
    ok;
send_message_by_order(_Message,[],_ActiveNodes,false) ->
    ok;
send_message_by_order(Message,[Node|Nodes],ActiveNodes,false) ->
    CurrentTimestamp=format_now(erlang:now()),
    case lists:member(Node,[node()|nodes()]) of
        true ->
            case gb_trees:lookup(Node,ActiveNodes) of
                {value,NodeTimestamp} ->
                    case erlang:abs(CurrentTimestamp-NodeTimestamp)=<scada:get_app_env(share_disconnect_timeout,500000) of
                        true ->
                            erlang:send({?MODULE,Node},Message),
                            send_message_by_order(Message,Nodes,ActiveNodes,true);
                        false ->
                           do_nothing
                    end;
                none ->
                    do_nothing
            end;
        false ->
            send_message_by_order(Message,Nodes,ActiveNodes,false)
    end.

is_active_node() ->
    Nodes=get_all_nodes(),
    ActiveNodes=gen_server:call(?MODULE,get_nodes,5000),
    is_active_node(Nodes,ActiveNodes).

is_active_node([],_ActiveNodes) ->
    false;
is_active_node([Node|Nodes],ActiveNodes) ->
    CurrentTimestamp=format_now(erlang:now()),
    case gb_trees:lookup(Node,ActiveNodes) of
        {value,NodeTimestamp} ->
            case erlang:abs(CurrentTimestamp-NodeTimestamp)=<scada:get_app_env(share_disconnect_timeout,500000) of
                true ->
                    Node==node();
                false ->
                    is_active_node(Nodes,ActiveNodes)
            end;
        none ->
            is_active_node(Nodes,ActiveNodes)
    end.

get_all_nodes() ->
    scada:get_app_env(nodes,[node()]).

system_time_updater(Arg) ->
    lists:foreach(
        fun(Node) ->
            spawn(
                fun() ->
                    erlang:send({?MODULE,Node},{i_am_alive,node()})
                end
            )
        end,
        get_all_nodes()
    ),
    case get_value(system_time) of
        undefined ->
            TS=erlang:now(),
            TSFormated=format_now(TS),
            set_value(system_time,TSFormated);
        CurrentSystemTime ->
            case is_active_node() of
                false ->
                    % io:format("passive node ~p: ~p~n",[node(),CurrentSystemTime]),
                    do_nothing;
                true ->
                    TS=erlang:now(),
                    TSFormated=format_now(TS),
                    % io:format("active node ~p: ~p~n",[node(),TSFormated]),
                    set_value(system_time,TSFormated)
            end
    end,
    Arg.

format_now({MegaSecs,Secs,MicroSecs}) ->
    {Date,Time}=calendar:now_to_local_time({MegaSecs, Secs, MicroSecs}),
    GregorianSecs=calendar:datetime_to_gregorian_seconds({Date,Time}),
    GregorianSecs*1000000+MicroSecs.

call_fun_on_all_nodes_exclude_me(Module,Function,Args) ->
    Nodes=get_all_nodes(),
    lists:foreach(
        fun(Node) ->
            case ((lists:member(Node,[node()|nodes()])) and (Node/=node())) of
                true ->
                    rpc:async_call(Node,Module,Function,Args);
                false ->
                    ok
            end
        end,
        Nodes
    ),
    ok.
