%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @author Владимир Щербина <vns.scherbina@gmail.com>
%% @copyright 2017
%% @version 1.1.0
%% @doc Модуль <b>{@module}</b> реализует запуск и выполнение функций по расписанию.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
-module(cron).

-behaviour(gen_server).

-export(
	[
		start_link/0,
		start_link/1,
		start_link/2,
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
		add/4,
		add/5,
		remove/1,
		info/0,
		wakeup/0,
		run_early/1,
		format_now/1
	]
).

-include("logs.hrl").

-record(
	running_job,
	{
		id,
		start_time,
		pid
	}
).

-record(
	job,
	{
		task, 
		id, 
		last_run=nnow(), 
		periocity,
		phase,
		last_state
	}
).

-record(
	state, 
 	{
		jobs=[], 
		running=[], 
		wakeup_timer=none
	}
).


%%%%%%%%%%%%%%%%%%%%%%
%%% public функции %%%
%%%%%%%%%%%%%%%%%%%%%%

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (JobId::atom,Task::function,Periocity::integer,Phase::integer) -> term
%% @doc <i>Добавление задачи</i>
%% <p>
%% <b>JobId</b> - уникальный идентификатор задачи;<br/>
%% <b>Task</b> - функция fun/1, выполняемая в качестве задачи;<br/>
%% <b>Periocity</b> - периодичность повторения задачи в миллисекундах с привязкой времени к 00:00:00;<br/>
%% <b>Phase</b> - смещение в миллисекундах по отношению к моменту времени, расчитанному по Periocity.
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
add(JobId,Task,Periocity,Phase) ->
	add(JobId,Task,Periocity,Phase,undefined).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (JobId::atom,Task::function,Periocity::integer,Phase::integer,InitialState::term) -> term
%% @doc <i>Добавление задачи</i>
%% <p>
%% <b>JobId</b> - уникальный идентификатор задачи;<br/>
%% <b>Task</b> - функция fun/1, выполняемая в качестве задачи;<br/>
%% <b>Periocity</b> - периодичность повторения задачи в миллисекундах с привязкой времени к 00:00:00;<br/>
%% <b>Phase</b> - смещение в миллисекундах по отношению к моменту времени, расчитанному по Periocity.<br/>
%% <b>InitialState</b> - начальное значение аргумента передаваемого Task/1.
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
add(JobId,Task,Periocity,Phase,InitialState) ->
	add(
		#job{
			id=JobId,
			task=Task,
			periocity=Periocity,
			phase=Phase,
			last_state=InitialState
		}
	).


%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (JobId::atom) -> term
%% @doc <i>Удаление задачи</i>
%% <p>
%% <b>JobId</b> - уникальный идентификатор задачи.
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
remove(JobId) when is_atom(JobId) ->
	gen_server:call(?MODULE,{remove,JobId}).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec () -> term
%% @doc <i>Список задач</i>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
info() ->
	gen_server:call(?MODULE,info,infinity).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec () -> term
%% @doc <i>"Пробуждение" задач</i>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
wakeup() ->
	gen_server:cast(?MODULE,wakeup).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (JobId::atom) -> term
%% @doc <i>"Ранний запуск" задачи</i>
%% <p>
%% <b>JobId</b> - уникальный идентификатор задачи.
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
run_early(JobId) when is_atom(JobId) ->
	gen_server:cast(?MODULE,{run_early,JobId}).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec ({MegaSecs,Secs,MicroSecs}) -> term
%% @doc <i>Форматирование времени, возвращаемого функцией erlang:now/0</i>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
format_now({MegaSecs,Secs,MicroSecs}) ->
	{Date,Time}=calendar:now_to_local_time({MegaSecs, Secs, MicroSecs}),
	GregorianSecs=calendar:datetime_to_gregorian_seconds({Date,Time}),
	GregorianSecs*1000+(MicroSecs div 1000).

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
 start_link([],[]).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%% @spec (InitialJobs::list) -> {ok, State}
%% @doc Функция запуска gen_server.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% 
start_link(InitialJobs) ->
 start_link(InitialJobs, []).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%% @spec (InitialJobs::list,Options::list) -> {ok, State}
%% @doc Функция запуска gen_server.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% 
start_link(InitialJobs, Options) ->
 gen_server:start_link({local, ?MODULE},
 ?MODULE,
 _InitArgs=InitialJobs,
 Options).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%% @spec () -> {ok, State}
%% @doc Функция останова gen_server.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% 
stop() ->
 gen_server:call(?MODULE,stop,infinity).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%% @spec (InitialJobs::list) -> {ok, State}
%% @doc Функция инициализации при запуске gen_server.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
init(InitialJobs) ->
	erlang:process_flag(trap_exit, true), 
	?log_sys_text(io_lib:format("cron starting...~n",[])),
	lists:foreach(fun add/1, InitialJobs),
	?log_sys_text(io_lib:format("cron started.~n",[])),
	{
		ok, 
		#state{
			jobs=[],
			running=[]
		}
	}.

%%%%%%%%%%%%%%%%%%%%%%%%
%%% callback функции %%%
%%%%%%%%%%%%%%%%%%%%%%%%

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%% @spec (Request, From, State) -> ok
%% @doc Callback функция для gen_server:call().
%% Для возврата внутреннего соостояния.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
handle_call(info,_From,State) ->
	{reply,_Reply=State,State};

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%% @spec (_Msg, State) -> ok
%% @doc Callback функция для gen_server:call().
%% Для запроса на остановку gen_server.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
handle_call(stop,From,State) ->
	{stop,{requested,From},ok,State};

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%% @spec (_Msg, State) -> ok
%% @doc Callback функция для gen_server:call().
%% Для запроса на удаление задачи.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
handle_call({remove,Job},From,State) when is_record(Job,job) ->
	handle_call({remove,Job#job.id},From,State);

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%% @spec (_Msg, State) -> ok
%% @doc Callback функция для gen_server:call().
%% Для запроса на удаление задачи.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
handle_call({remove,JobId},_From,State=#state{jobs=Jobs,running=RunningJobs}) when is_atom(JobId) ->
	?log_sys_text(io_lib:format("cron: removing job \'~p\'...~n",[JobId])),
	{FoundJobs,RestJobs}=lists:partition(
		fun(#job{id=ElemId}) ->
 			JobId =:= ElemId
 		end,
 		Jobs
 	),
	RemovedJob=case FoundJobs of
		[] ->
			?log_sys_text(io_lib:format("cron: Could not remove job ~p; not found",[JobId])),
			{not_found,JobId};
		[Job] ->
			lists:foreach(
				fun(#running_job{id=ElemId,pid=Pid}) when JobId =:= ElemId ->
					erlang:exit(Pid,removing_job);
				(_) ->
					ok
				end,
				RunningJobs
			),
			{ok,Job}
	end,
	{reply,RemovedJob,State#state{jobs=RestJobs}}.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%% @spec (_Msg, State) -> ok
%% @doc Callback функция для gen_server:cast().
%% Для запроса на "просыпания" задачи.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
handle_cast(wakeup,State=#state{jobs=Jobs,running=Running,wakeup_timer=Timer}) ->
	Now=nnow(),
	Deviation2=Now rem 1000,
	case Deviation2 div 2>2 of
		true ->
			Deviation=(Deviation2 div 2);
		false ->
			Deviation=2
	end,
	clear_wakeup_queue(),
	NotRunningJobs=[ 
		Job || Job <- Jobs, 
		not lists:any(
			fun(#running_job{id=RunningId}) ->
				Job#job.id =:= RunningId
			end,
			Running
		) 
	],
	{EligableToRun,NotEligableToRun}=lists:partition(
		fun(#job{last_run=LastRun,periocity=Periocity,phase=Phase}) ->				
			NextRun3=((LastRun + Periocity) div Periocity)*Periocity+Phase,
			(NextRun3=<Now) or ((abs(NextRun3-Now))>Periocity)
		end,
		NotRunningJobs
	),
	case length(EligableToRun) of
	0 ->
		ok;
	_Length ->
		ok %?log_sys_text(io_lib:format("Running ~p jobs (~p)",[Length,[ Job#job.id || Job <- EligableToRun]]))
	end,
	NowRunning=lists:foldl(
		fun(#job{task=Task,id=Id,last_state=LastState},AccIn) ->
			TaskWrapper=fun() ->
				case Task of
					Task when is_function(Task,0) ->
						case catch(Task()) of
							{'EXIT',Reason} ->
								io:format("~p: Task \'~p\' exited with reason: ~p~n",[calendar:local_time(),Id,Reason]),
								exit({error,Reason});
							Result ->
								exit({ok,Result})
						end;
					Task when is_function(Task,1) ->
						case catch(Task(LastState)) of
							{'EXIT',Reason} ->
								io:format("~p: Task \'~p\' exited with reason: ~p~n",[calendar:local_time(),Id,Reason]),
								exit({error,Reason});
							Result ->
								exit({ok,Result})
						end
				end
			end,
			Pid=spawn_link(TaskWrapper),
			[ #running_job{pid=Pid,id=Id,start_time=Now} | AccIn ]
		end,
		Running,
		EligableToRun
	),
	NewTimer=schedule_wakeup(NotEligableToRun,Timer,Deviation),
	{noreply, State#state{running=NowRunning,wakeup_timer=NewTimer}};

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%% @spec (_Msg, State) -> ok
%% @doc Callback функция для gen_server:cast().
%% Для запроса на добавление задачи.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
handle_cast({add,Job=#job{id=JobId,task=JobFunction,periocity=Periocity,phase=Phase}},State=#state{jobs=AllJobs}) when 
	is_atom(JobId),
	(is_function(JobFunction,0)	or is_function(JobFunction,1)),
	is_number(Periocity),is_number(Phase) ->
	NewState=case lists:any(
		fun(#job{id=Id}) -> 
			Id =:= JobId
		end,
		AllJobs
	) of
		false ->
			wakeup(),
			State#state{jobs=[ Job | AllJobs ]};
		true ->
			?log_sys_text(io_lib:format("cron: Attempted to add duplicate job ~p",[JobId])),
			State
	end,
	{noreply,NewState};

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%% @spec (_Msg, State) -> ok
%% @doc Callback функция для gen_server:cast().
%% Для запроса на ранний запуск.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
handle_cast({run_early,JobId},State=#state{jobs=Jobs}) ->
	{[Job],RestJobs}=lists:partition(
		fun(#job{id=ElemId}) ->
			ElemId =:= JobId
		end,
		Jobs
	),
	NewJob=Job#job{last_run=0},
	wakeup(),
	{noreply,State#state{jobs=[ NewJob | RestJobs ]}}.


%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%% @spec (stop, State) -> ok
%% @doc Callback функция при получении сообщения stop gen_server.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
handle_info({'EXIT', FromPid, Result},State=#state{running=RunningJobs,jobs=Jobs}) when is_pid(FromPid) ->
	{[WasRunning],NewRunningJobs}=lists:partition(
		fun(#running_job{pid=Pid}) ->
			Pid =:= FromPid
		end,
		RunningJobs
	),
	NewJobs=case lists:partition(
		fun(#job{id=ElemId}) ->
			ElemId =:= WasRunning#running_job.id
		end,
		Jobs
	) of
		{[Job],RestJobs} ->
			case Result of
				{ok,LastState} ->
					[ Job#job{last_run=nnow(),last_state=LastState} | RestJobs ];
				_ ->
					[ Job#job{last_run=nnow()} | RestJobs ]
			end;
		{[], RestJobs} ->
			RestJobs
	end,
	wakeup(),
	{noreply,State#state{running=NewRunningJobs,jobs=NewJobs}};

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%% @spec (_Info, State) -> ok
%% @doc Callback функция при получении сообщений gen_server.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
handle_info(Other, State) ->
 ?log_sys_text(io_lib:format("cron: Unknown message ~p",[Other])),
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
terminate(Reason, #state{running=[]}) ->
 ?log_sys_text(io_lib:format("~p: terminating for reason: ~p~n",[?MODULE,Reason])),
 normal;

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%% @spec (_Reason, _State) -> ok
%% @doc Callback функция при завершение работы gen_server.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
terminate(Reason, #state{running=[ #running_job{id=Id, pid=Pid} | Rest ] }) ->
 ?log_sys_text(io_lib:format("cron: Terminating (reason: ~p); waiting on ~p; ~p jobs remaining~n",[Reason,Id,length(Rest)+1])),
 receive
 	{'EXIT',Pid,_PidDeathReason} ->
		 terminate(Reason,#state{running=Rest})
 end.

%%%%%%%%%%%%%%%%%%%%%%%
%%% private функции %%%
%%%%%%%%%%%%%%%%%%%%%%%

add(
	Job=#job{
		id=JobId,
		task=Task,
		periocity=Periocity,
		phase=Phase
	}
) when
	is_atom(JobId),
	(is_function(Task,0) or is_function(Task,1)),
 	is_number(Periocity),
 	is_number(Phase) ->
		gen_server:cast(?MODULE,{add,Job});

add(JobTuple) when is_tuple(JobTuple) ->
	apply(?MODULE,add,tuple_to_list(JobTuple)).

nnow() -> 
	format_now(now()).
 
schedule_wakeup(NotEligableToRun,CurrentTimer,Deviation) when is_list(NotEligableToRun) ->
	case CurrentTimer of
		none ->
			ok;
		CurrentTimer ->
			timer:cancel(CurrentTimer)
	end,
	case NotEligableToRun of
		[] ->
			none;
		NotEligableToRun ->
			NextRunTimes=lists:map(
				fun(#job{last_run=LastRun,periocity=Periocity,phase=Phase}) ->
					NextRun3=((LastRun + Periocity) div Periocity)*Periocity+Phase,
					Delay2=(NextRun3-nnow())+1,
					case Delay2>0 of
						true ->
							NextRun3;
						false ->
							((nnow() + Periocity) div Periocity)*Periocity+Phase
					end
				end,
				NotEligableToRun
			),
			NextRun=lists:min(NextRunTimes),
			Delay=(NextRun-nnow()),
			NewDelay=case Delay-Deviation>0 of
				true ->
					Delay-Deviation;
				false ->
					1
			end,
			{ok,TRef}=timer:apply_after(NewDelay,?MODULE,wakeup,[]),
			TRef
	end.

clear_wakeup_queue() ->
	receive
		{'$gen_cast',wakeup} ->
	clear_wakeup_queue()
		after 0 ->
			ok
	end.