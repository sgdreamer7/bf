%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @author Владимир Щербина <vns.scherbina@gmail.com>
%% @copyright 2017
%% @version 1.1.0
%% @doc Модуль <b>{@module}</b> реализует функции хранилища Key/Value.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
-module(scada_share_kv).

-behaviour(gen_server).

-export(
    [
        start/3,
        stop/1
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
        set_value/2,
        set_local_value/2,
        delete_value/1,
        delete_local_value/1,
        get_all_values/0,
        get_all_local_values/0
	]
).

-include("logs.hrl").

%%%%%%%%%%%%%%%%%%%%%%
%%% public функции %%%
%%%%%%%%%%%%%%%%%%%%%%

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec () -> term() | undefined
%% @doc <i>Чтение всех значений</i>
%% <p>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
get_all_values() ->
    lists:foldr(
        fun(RegName,AccIn) ->
            RegNameStr=atom_to_list(RegName),
            case lists:prefix("kv_shared_",RegNameStr) of
                true ->
                    case catch(gen_server:call(RegName,get_key_value,1000)) of
                        {'EXIT',_} ->
                            AccIn;
                        {Key,Value} ->
                            [{Key,Value}|AccIn]
                    end;
                false ->
                    AccIn
            end
        end,
        [],
        erlang:registered()
    ).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec () -> term() | undefined
%% @doc <i>Чтение всех локальных значений</i>
%% <p>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
get_all_local_values() ->
    lists:foldr(
        fun(RegName,AccIn) ->
            RegNameStr=atom_to_list(RegName),
            case lists:prefix("kv_local_",RegNameStr) of
                true ->
                    case catch(gen_server:call(RegName,get_key_value,1000)) of
                        {'EXIT',_} ->
                            AccIn;
                        {Key,Value} ->
                            [{Key,Value}|AccIn]
                    end;
                false ->
                    AccIn
            end
        end,
        [],
        erlang:registered()
    ).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Key) -> term() | undefined
%% @doc <i>Чтение значения по ключу</i>
%% <p>
%% <b>Key</b> - ключ.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
get_value(Key) ->
    SharedName=key_to_name(Key,shared),
    case catch(gen_server:call(SharedName,get_value,5000)) of
        {'EXIT',_} ->
            LocalName=key_to_name(Key,local),
            case catch(gen_server:call(LocalName,get_value,5000)) of
                {'EXIT',_} ->
                    undefined;
                LocalValue ->
                    LocalValue
            end;
        SharedValue ->
            SharedValue
    end.

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
    Name=key_to_name(Key,shared),
    case catch(gen_server:call(Name,{set_value,Value},5000)) of
        {'EXIT',_} ->
            case catch(start(Name,Key,Value)) of
                {'EXIT',_} ->
                    error;
                _ ->
                    ok
            end;
        _ ->
            ok
    end.

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
    Name=key_to_name(Key,local),
    case catch(gen_server:call(Name,{set_value,Value},5000)) of
        {'EXIT',_} ->
            case catch(start(Name,Key,Value)) of
                {'EXIT',_} ->
                    error;
                _ ->
                    ok
            end;
        _ ->
            ok
    end.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Key) -> ok
%% @doc <i>Удаление глобального значения ключа</i>
%% <p>
%% <b>Key</b> - ключ.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
delete_value(Key) ->
    Name=key_to_name(Key,shared),
    stop(Name).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Key) -> ok
%% @doc <i>Удаление локального значения ключа</i>
%% <p>
%% <b>Key</b> - ключ.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
delete_local_value(Key) ->
    Name=key_to_name(Key,local),
    stop(Name).


%%%%%%%%%%%%%%%%%%%%%%%%%%
%%% gen_server функции %%%
%%%%%%%%%%%%%%%%%%%%%%%%%%

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%% @spec (Name,Key,Value) -> {ok, State}
%% @doc Функция запуска gen_server.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
start(Name,Key,Value) ->
    gen_server:start(
    	{local, Name},
    	?MODULE, 
    	[{value,{Key,Value}}], 
    	[]
	).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%% @spec (Name) -> ok
%% @doc Функция останова gen_server.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
stop(Name) ->
	gen_server:cast(Name,stop).
    
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%% @spec (Options::list) -> {ok, State}
%% @doc Функция инициализации при запуске gen_server.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
init(Options) ->
    {Key,Value}=proplists:get_value(value,Options,undefined),
    {ok,{Key,Value}}.

%%%%%%%%%%%%%%%%%%%%%%%%
%%% callback функции %%%
%%%%%%%%%%%%%%%%%%%%%%%%


%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%% @spec (Request, From, State) -> ok
%% @doc Callback функция для gen_server:call().
%% Для запроса получения ключа и значения.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
handle_call(get_key_value, _From, {Key,Value}) ->
    {reply, {Key,Value}, {Key,Value}};

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%% @spec (Request, From, State) -> ok
%% @doc Callback функция для gen_server:call().
%% Для запроса получения значения.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
handle_call(get_value, _From, {Key,Value}) ->
    {reply, Value, {Key,Value}};


%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%% @spec (Request, From, State) -> ok
%% @doc Callback функция для gen_server:call().
%% Для запроса записи локального значения по ключу.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
handle_call({set_value,Value}, _From, {Key,_OldValue}) ->
    {reply, ok, {Key,Value}};

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
%% @doc Callback функция при получении сообщений gen_server.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
handle_info(_Info, State) ->
    {registered_name,Name}=process_info(self(),registered_name),
    ?log_sys_text(io_lib:format("~p: Unknown message ~p~n",[Name,_Info])),
    {noreply, State}.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%% @spec (_Reason, _State) -> ok
%% @doc Callback функция при завершение работы gen_server.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
terminate(Reason, _State) ->
    {registered_name,Name}=process_info(self(),registered_name),
    ?log_sys_text(io_lib:format("~p: terminating for reason: ~p~n",[Name,Reason])),
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
key_to_name(Key,Prefix) ->
    list_to_atom(lists:flatten(io_lib:format("~ts",[io_lib:format("kv_~p_~p",[Prefix,Key])]))).
