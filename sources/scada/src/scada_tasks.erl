%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @author Владимир Щербина <vns.scherbina@gmail.com>
%% @copyright 2017
%% @version 1.1.0
%% @doc Модуль <b>{@module}</b> реализует функциональность пользовательских задач,
%% запускаемых периодически или по событию.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
-module(scada_tasks).

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
		reload_config/0
	]
).

-include("logs.hrl").

-record(
	task,
	{
		name="",
		period=60000,
		offset=10000,
		module=undefined,
		function=undefined
	}
).

-record(state,{
	tasks=gb_trees:empty()
}).

%%%%%%%%%%%%%%%%%%%%%%
%%% public функции %%%
%%%%%%%%%%%%%%%%%%%%%%

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec () -> ok
%% @doc <i>Перезагрузка конфигурации</i>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
reload_config() ->
	gen_server:call(?MODULE,reload_config,infinity).


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
	?log_sys(io_lib:format("scada_tasks starting...~n",[])),
	State=update_config(),
	?log_sys(io_lib:format("scada_tasks started.~n",[])),
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
%% @spec (reload_config,_From,State) -> ok
%% @doc Callback функция для gen_server:call().
%% Для запроса перезагрузки конфигурации.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% 
handle_call(reload_config,_From,State) ->
	lists:foreach(
		fun({_Key,Task}) ->
			cron:remove(Task#task.name)
		end,
		gb_trees:to_list(State#state.tasks)
	),
	NewState=update_config(),
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
	?log_sys(io_lib:format("scada_tasks: Unknown message ~p~n",[Other])),
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
terminate(Reason, State) ->
	?log_sys(io_lib:format("~p: terminating for reason: ~p~n",[?MODULE,Reason])),
	lists:foreach(
		fun({_Key,Task}) ->
			cron:remove(Task#task.name)
		end,
		gb_trees:to_list(State#state.tasks)
	),
	normal.



%%%%%%%%%%%%%%%%%%%%%%%
%%% private функции %%%
%%%%%%%%%%%%%%%%%%%%%%%

update_config() ->
	ConfigPath=scada:get_app_env(config_dir,lists:flatten(code:lib_dir(scada)++"/priv/config")),
	Filename=lists:flatten([ConfigPath,"/",scada:get_app_env(tasks,"tasks.conf")]),
	TasksProps=case file:consult(Filename) of
        {ok,Properties} ->
            Properties;
        _Other ->
            ?log_sys(io_lib:format("scada_tasks: cannot load config \'~ts\'~n",[Filename])),
            erlang:error({error,{scada_tasks,{update_config,_Other}}})
    end,
	Tasks=lists:foldl(
		fun(TaskDescription,Tsks) ->
			create_task(TaskDescription,Tsks)
		end,
		gb_trees:empty(),
		TasksProps
	),
	#state{
		tasks=Tasks
	}.

create_task({periodic_task,Name,Period,Offset,Module,Function},Tsks) ->
	TaskName=list_to_atom(lists:flatten("tasks_updater_"++Name)),
	Task=#task{
		name=TaskName,
		period=Period,
		offset=Offset,
		module=list_to_atom(lists:flatten(Module)),
		function=list_to_atom(lists:flatten(Function))
	},
	?log_sys(io_lib:format("scada_tasks: Running ~p:init/0: ~p~n",[Task#task.module,catch(apply(Task#task.module,init,[]))])),
	TaskFun=fun(Arg) ->
		case catch(erlang:apply(Task#task.module,Task#task.function,[to_gb_tree([{"timestamp",scada_share:system_time()}]),Arg])) of
			{'EXIT',{Reason,Callstack}} ->
				?log_sys(io_lib:format("scada_tasks: Error executing task \'~s\'.~nReason: ~p~nCallstack: ~p~n",[Name,Reason,Callstack])),
				Arg;
			{'EXIT',Reason} ->
				?log_sys(io_lib:format("scada_tasks: Error executing task \'~s\'. Reason: ~p~n",[Name,Reason])),
				Arg;
			NewArg ->
				NewArg
		end
	end,
	cron:add(TaskName,TaskFun,Period,Offset,undefined),
	gb_trees:enter(TaskName,Task,Tsks);
create_task({event_task,Name,Type,Expression,Module,Function},Tsks) ->
	TaskName=list_to_atom(lists:flatten("tasks_updater_"++Name)),
	Task=#task{
		name=TaskName,
		module=list_to_atom(lists:flatten(Module)),
		function=list_to_atom(lists:flatten(Function))
	},
	?log_sys(io_lib:format("scada_tasks: Running ~p:init/0: ~p~n",[Task#task.module,catch(apply(Task#task.module,init,[]))])),
	TaskFun=fun({ExpressionLastValue,Arg}) ->
		ExpressionCurrentValue=(catch scada:eval_expression(Expression)),
		case ExpressionLastValue==undefined of
			true ->
				{ExpressionCurrentValue,Arg};
			false ->
				OkToProcess=case Type of
					change ->
						ExpressionCurrentValue/=ExpressionLastValue;
					true ->
						(ExpressionCurrentValue==true) and (ExpressionLastValue==false);
					false ->
						(ExpressionCurrentValue==false) and (ExpressionLastValue==true)
				end,
				case OkToProcess of
					true ->
						case catch(erlang:apply(Task#task.module,Task#task.function,[to_gb_tree([{"timestamp",scada_share:system_time()},{"trigger",ExpressionCurrentValue}]),Arg])) of
							{'EXIT',{Reason,Callstack}} ->
								?log_sys_text(io_lib:format("scada_tasks: Error executing task \'~s\'.~nReason: ~p~nCallstack: ~p~n",[Name,Reason,Callstack])),
								{ExpressionCurrentValue,Arg};
							{'EXIT',Reason} ->
								?log_sys_text(io_lib:format("scada_tasks: Error executing task \'~s\'. Reason: ~p~n",[Name,Reason])),
								{ExpressionCurrentValue,Arg};
							NewArg ->
								{ExpressionCurrentValue,NewArg}
						end;
					false ->
						{ExpressionCurrentValue,Arg}
				end
		end
	end,
	cron:add(TaskName,TaskFun,100,0,{undefined,undefined}),
	gb_trees:enter(TaskName,Task,Tsks);
create_task(_,Tsks) ->
	Tsks.

to_gb_tree(KeysValues) ->
	to_gb_tree(KeysValues,gb_trees:empty()).

to_gb_tree([],Acc) ->
	Acc;
to_gb_tree([{Key,Value}|Tail],Acc) ->
	to_gb_tree(Tail,gb_trees:enter(Key,Value,Acc)).
	