%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @author Владимир Щербина <vns.scherbina@gmail.com>
%% @copyright 2017
%% @version 1.1.0
%% @doc Модуль <b>{@module}</b> реализует драйвер для внутреннего хранения данных.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
-module(scada_driver_internal_memory).

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
set_value(Address,Value) ->
	ok=gen_server:call(?MODULE,{set_value,Address,Value},60000).

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
init(_) ->
	erlang:process_flag(trap_exit, true),
	?log_sys(io_lib:format("scada_driver_internal starting...~n",[])),
	State=gb_trees:empty(),
	?log_sys(io_lib:format("scada_driver_internal started.~n",[])),
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
%% @spec ({register_tag,TagName,Address,Callback},_From,State) -> ok
%% @doc Callback функция для gen_server:call().
%% Для запроса регистрации тега и адреса.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% 
handle_call({register_tag,TagName,Address,Callback},_From,State) ->
	Callbacks=case gb_trees:lookup(Address,State) of
		{value,Value} ->
			Value;
		none ->
			gb_trees:empty()
	end,
	NewCallbacks=gb_trees:enter(TagName,Callback,Callbacks),
	NewState=gb_trees:enter(Address,NewCallbacks,State),
	{reply,ok,NewState};

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%% @spec ({set_value,Address,Value},_From,State) -> ok
%% @doc Callback функция для gen_server:call().
%% Для запроса записи данных по адресу.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% 
handle_call({set_value,Address,Value},_From,State) ->
	case gb_trees:lookup(Address,State) of
		{value,Callbacks} ->
			Iterator=gb_trees:iterator(Callbacks),
			process_callbacks(gb_trees:next(Iterator),Value);
		none ->
			ok
	end,
	{reply,ok,State};

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
handle_info(_Other, State) ->
	% ?log_sys(io_lib:format("scada_driver_internal: Unknown message ~p~n",[Other])),
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
	normal.

%%%%%%%%%%%%%%%%%%%%%%%
%%% private функции %%%
%%%%%%%%%%%%%%%%%%%%%%%

process_callbacks(none,_Value) ->
	ok;
process_callbacks({TagName,Callback,Iterator},Value) ->
	Callback(TagName,Value),
	process_callbacks(gb_trees:next(Iterator),Value).