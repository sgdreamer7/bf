%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @author Владимир Щербина <vns.scherbina@gmail.com>
%% @copyright 2017
%% @version 1.1.0
%% @doc Модуль <b>{@module}</b> реализует пользовательские функции контроля потребляемой памяти приложениями,
%% которые запускаются посредством модуля <i>scada_tasks</i>.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
-module(scada_memory_monitor).

-export(
	[
		init/0,
		check_and_log/2
	]
).

-include("logs.hrl").

%%%%%%%%%%%%%%%%%%%%%%
%%% public функции %%%
%%%%%%%%%%%%%%%%%%%%%%

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec () -> ok
%% @doc <i>Начальная инициализация при запуске модуля</i>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
init() ->
	ok.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Sys,Arg) -> Arg
%% @doc <i>Контроль и регистрация потребления памяти приложениями</i>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
check_and_log(Sys,Arg) ->
	case Arg of
		undefined ->
			?log_sys(io_lib:format("~p:check_and_log initial start.~n",[?MODULE])),
			?log_sys(io_lib:format("~p: creating table...~p~n",[?MODULE,create_table()])),
			gb_trees:empty();
		_ ->
			do_nothing
	end,
	{Date,Time,_MicroSecs}=gb_trees:get("timestamp",Sys),
	Timestamp={Date,Time},
    case scada_snmp:get_table("localhost",[1,3,6,1,2,1,25,4,2,1]) of
    	undefined ->
    		do_nothing;
    	Processes ->
		    Perfomances=scada_snmp:get_table("localhost",[1,3,6,1,2,1,25,5,1,1]),
		    LookupFun=fun(Key,Tree,DefaultValue) ->
		    	case gb_trees:lookup(Key,Tree) of
		    		{value,Value} ->
		        		Value;
		    		none ->
		        		DefaultValue
		        end
		    end,
		    {ProcessesAndMemories,_}=lists:foldr(
		        fun({Instance,Row},{Acc,Instances}) ->
		            PerfRow=LookupFun(Instance,Perfomances,gb_trees:empty()),
		            ProcessName=LookupFun(2,Row,""),
		            ProcessMemory=LookupFun(2,PerfRow,0),    
		            PrevInstance=LookupFun(ProcessName,Instances,0),
		            InstanceProcessName=lists:flatten(
		                io_lib:format("~ts_~p",[ProcessName,PrevInstance])
		            ),
		            NewInstances=gb_trees:enter(ProcessName,PrevInstance+1,Instances),
		            {gb_trees:enter(InstanceProcessName,ProcessMemory,Acc),NewInstances}
		        end,
		        {gb_trees:empty(),gb_trees:empty()},
		        gb_trees:to_list(Processes)
		    ),
		    Fields=[
		    	{"EPMD",LookupFun("epmd.exe_0",ProcessesAndMemories,0)},
		    	{"INET_GETHOST",LookupFun("inet_gethost.exe_0",ProcessesAndMemories,0)},
		    	{"ERL",LookupFun("erl.exe_0",ProcessesAndMemories,0)},
		    	{"MYSQLD",LookupFun("mysqld.exe_0",ProcessesAndMemories,0)},
		    	{"JAVAWS",LookupFun("javaw.exe_0",ProcessesAndMemories,0)},
		    	{"JAVAWS2",LookupFun("javaw.exe_1",ProcessesAndMemories,0)}
		    ],
		    case Arg=/=Fields of
		    	true ->
				    Request=[
						{table,get_table_name()},
						{fields,[{"INDX",Timestamp}|Fields]}
					],
					scada_db:insert_data(Request,[{timeout,60000}]);
				false ->
					do_nothing
			end,
			Fields
	end.

%%%%%%%%%%%%%%%%%%%%%%%
%%% private функции %%%
%%%%%%%%%%%%%%%%%%%%%%%

create_table() ->
	Request=[
		{table,get_table_name()},
		{fields,
			[
				{"INDX",datetime},
				{"EPMD",float},
				{"INET_GETHOST",float},
				{"ERL",float},
				{"MYSQLD",float},
				{"JAVAWS",float},
				{"JAVAWS2",float}
			]
		},
		{indexes,
			[
				{"INDX",unique}
			]
		}
	],
	scada_db:create_table(Request).

get_table_name() ->
	"memory_stats".