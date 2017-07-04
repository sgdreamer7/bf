%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @author Владимир Щербина <vns.scherbina@gmail.com>
%% @copyright 2017
%% @version 1.1.0
%% @doc Модуль <b>{@module}</b> реализует драйвер доступа к системным переменным.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
-module(scada_driver_system).

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
init(_) ->
	erlang:process_flag(trap_exit, true),
	?log_sys(io_lib:format("scada_driver_system starting...~n",[])),
	State=#state{
		callbacks=gb_trees:empty()
	},
	cron:add(scada_driver_system_updater,fun updater/1,500,0,undefined),
	?log_sys(io_lib:format("scada_driver_system started.~n",[])),
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
%% @spec ({build_data,Key},_From,State) -> ok
%% @doc Callback функция для gen_server:call().
%% Для запроса получение данных для тегов.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% 
handle_call(build_data,_From,State) ->
	Data=build_data(),
	{reply,Data,State};


%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%% @spec ({register_tag,TagName,Address,Callback},_From,State) -> ok
%% @doc Callback функция для gen_server:call().
%% Для запроса регистрации тега и адреса.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% 
handle_call({register_tag,TagName,Address,Callback},_From,State) ->
	Callbacks=State#state.callbacks,
	TagsCallbacks=case gb_trees:lookup(Address,Callbacks) of
		{value,Value} ->
			Value;
		none ->
			gb_trees:empty()
	end,
	NewTagsCallbacks=gb_trees:enter(TagName,Callback,TagsCallbacks),
	NewCallbacks=gb_trees:enter(Address,NewTagsCallbacks,Callbacks),
	NewState=State#state{callbacks=NewCallbacks},
	{reply,ok,NewState};

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
	?log_sys(io_lib:format("scada_driver_system Unknown message ~p~n",[Other])),
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
	cron:remove(scada_driver_system_updater),
	normal.

%%%%%%%%%%%%%%%%%%%%%%%
%%% private функции %%%
%%%%%%%%%%%%%%%%%%%%%%%

updater(Arg) ->
	Callbacks=gen_server:call(?MODULE,get_callbacks,1000),
	Data=build_data(), %gen_server:call(?MODULE,build_data,1000),
	Iterator=gb_trees:iterator(Callbacks),
	process_callbacks(gb_trees:next(Iterator),Data),
	Arg.

process_callbacks(none,_Data) ->
	ok;
process_callbacks({Address,TagsCallbacks,Iterator},Data) ->
	Value=case gb_trees:lookup(Address,Data) of
		none ->
			undefined;
		{value,FoundValue} ->
			FoundValue
	end,
	TagsIterator=gb_trees:iterator(TagsCallbacks),
	process_tags_callbacks(gb_trees:next(TagsIterator),Value),
	process_callbacks(gb_trees:next(Iterator),Data).

process_tags_callbacks(none,_Value) ->
	ok;
process_tags_callbacks({TagName,Callback,TagsIterator},Value) ->
	Callback(TagName,Value),
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

build_data() ->
	{{Year,Month,Day},{Hour,Minute,Second},Microseconds}=scada_share:system_time(),
	{NodeName,HostName}=case tokens(lists:flatten(io_lib:format("~s",[node()])),"@") of
		[Node,Host] ->
			{Node,Host};
		_ ->
			{"",""}
	end,
	MemoryTotal=erlang:memory(total),
	MemoryProcesses=erlang:memory(processes),
	MemoryProcessesUsed=erlang:memory(processes_used),
	MemorySystem=erlang:memory(system),
	MemoryAtom=erlang:memory(atom),
	MemoryAtomUsed=erlang:memory(atom_used),
	MemoryBinary=erlang:memory(binary),
	MemoryCode=erlang:memory(code),
	MemoryEts=erlang:memory(ets),
	MemoryOSFree=proplists:get_value(free_memory,memsup:get_system_memory_data(),0),
	DiskFreePercentage=case disksup:get_disk_data() of
		[{_Id,_KByte,Capacity}|_] ->
			Capacity;
		_ ->
			0
	end,
	DataList=[
		{"date",lists:flatten(io_lib:format("~2..0w.~2..0w.~4..0w",[Day,Month,Year]))},
		{"time",lists:flatten(io_lib:format("~2..0w:~2..0w:~2..0w",[Hour,Minute,Second]))},
		{"datetime",lists:flatten(io_lib:format("~2..0w.~2..0w.~4..0w ~2..0w:~2..0w:~2..0w",[Day,Month,Year,Hour,Minute,Second]))},
		{"timestamp",calendar:datetime_to_gregorian_seconds({{Year,Month,Day},{Hour,Minute,Second}})},
		{"datetime_ms",lists:flatten(io_lib:format("~2..0w.~2..0w.~4..0w ~2..0w:~2..0w:~2..0w.~6..0w",[Day,Month,Year,Hour,Minute,Second,Microseconds]))},
		{"node",NodeName},
		{"host",HostName},
		{"memory_total",MemoryTotal},
		{"memory_processes",MemoryProcesses},
		{"memory_processes_used",MemoryProcessesUsed},
		{"memory_system",MemorySystem},
		{"memory_atom",MemoryAtom},
		{"memory_atom_used",MemoryAtomUsed},
		{"memory_binary",MemoryBinary},
		{"memory_code",MemoryCode},
		{"memory_ets",MemoryEts},
		{"memory_os_free",MemoryOSFree},
		{"disk_free_percentage",DiskFreePercentage},
		{"processes_total",erlang:system_info(process_count)},
		{"ports_total",length(erlang:ports())},
		{"simulator_digital_sec_1",Second rem 2}
	],
	lists:foldr(
		fun({Key,Value},Acc) ->
			gb_trees:enter(Key,Value,Acc)
		end,
		gb_trees:empty(),
		DataList
	).