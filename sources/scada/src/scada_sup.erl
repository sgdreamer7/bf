%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @author Владимир Щербина <vns.scherbina@gmail.com>
%% @copyright 2017
%% @version 1.1.0
%% @doc Модуль <b>{@module}</b> реализует супервизор OTP приложения.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
-module(scada_sup).

-behaviour(supervisor).

%% API
-export([start_link/0,init/1]).

%% Helper macro for declaring children of supervisor
-define(CHILD(I, Type), {I, {I, start_link, []}, permanent, infinity, Type, [I]}).

%% ===================================================================
%% API functions
%% ===================================================================

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%% @spec () -> {ok, State}
%% @doc Функция запуска супервизора.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
start_link() ->
    supervisor:start_link({local, ?MODULE}, ?MODULE, []).

%% ===================================================================
%% Supervisor callbacks
%% ===================================================================

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%% @spec ([]) -> {ok, State}
%% @doc Функция инициализации дерева супервизора.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
init([]) ->
	% ScadaDBDriverName=scada:get_app_env(scada_db_driver,scada_db_mysql),
	% DB = ?CHILD(ScadaDBDriverName, worker),
	% DB = ?CHILD(scada_db_mysql, worker),
	DB2 = ?CHILD(scada_db_mssql, worker),
	CRON = ?CHILD(cron, worker),
	SHARE = ?CHILD(scada_share, worker),
	ALARMS = ?CHILD(scada_alarms,worker),
	DRIVERS= ?CHILD(scada_drivers_sup, supervisor),
	TAGS = ?CHILD(scada_tags,worker),
	MAIN = ?CHILD(scada, worker),
	LOGGER = ?CHILD(scada_logger, worker),
	TASKS = ?CHILD(scada_tasks, worker),
    {ok, 
    	{ 
    		{one_for_all, 10, 600}, 
    		[
    			% DB,
    			DB2,
				CRON,
				SHARE,
				ALARMS,
				DRIVERS,
				TAGS,
				MAIN,
				LOGGER,
				TASKS
    		]
    	}
    }.


%%%%%%%%%%%%%%%%%%%%%%%
%%% private функции %%%
%%%%%%%%%%%%%%%%%%%%%%%

