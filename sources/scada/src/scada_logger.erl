%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @author Владимир Щербина <vns.scherbina@gmail.com>
%% @copyright 2017
%% @version 1.1.0
%% @doc Модуль <b>{@module}</b> реализует регистрацию значений тегов в базе данных
%% на периодической или событийной основе.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
-module(scada_logger).

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
		reload_config/0,
		restore_table_data/3,
		delete_table_data/3,
		restore_all_tables_data/2,
		delete_all_tables_data/2
	]
).

-include("logs.hrl").

-record(
	table,
	{
		type=periodic,
		name="",
		index_field="",
		fields=[],
		period=60000,
		offset=10000,
		task_name=undefined

	}
).

-record(state,{
	tables=gb_trees:empty()
}).

-define(day_hours,[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23]).

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

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (TableName,Start,Finish) -> ok
%% @doc <i>Восстановление данных в базе для указанной талицы за указанный период</i>
%% <p>
%% <b>TableName</b> - имя таблицы баз данных;<br/>
%% <b>Start</b> - начало периода;<br/>
%% <b>Finish</b> - окончание периода.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
restore_table_data(TableName,Start,Finish) ->
	ArchivePath=scada_backup:get_archive_path(),
	restore_table_data(ArchivePath,TableName,Start,Finish).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (TableName,Start,Finish) -> ok
%% @doc <i>Удаление данных в базе для указанной талицы за указанный период</i>
%% <p>
%% <b>TableName</b> - имя таблицы баз данных;<br/>
%% <b>Start</b> - начало периода;<br/>
%% <b>Finish</b> - окончание периода.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
delete_table_data(TableName,Start,Finish) ->
	Request=[
		{table,TableName},
		{conditions,
			[
				{"INDX",gte,Start},
				{"INDX",lte,Finish}
			]
		}
	],
	scada_db:delete_data(Request).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Start,Finish) -> ok
%% @doc <i>Восстановление данных в базе для всех таблиц за указанный период</i>
%% <p>
%% <b>Start</b> - начало периода;<br/>
%% <b>Finish</b> - окончание периода.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
restore_all_tables_data(Start,Finish) ->
	TablesNames=gen_server:call(?MODULE,get_tables_names,infinity),
	lists:foreach(
		fun(TableName) ->
			restore_table_data(TableName,Start,Finish)
		end,
		["ALARMS"|TablesNames]
	).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Start,Finish) -> ok
%% @doc <i>Удаление данных в базе для всех талиц за указанный период</i>
%% <p>
%% <b>Start</b> - начало периода;<br/>
%% <b>Finish</b> - окончание периода.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
delete_all_tables_data(Start,Finish) ->
	TablesNames=gen_server:call(?MODULE,get_tables_names,infinity),
	lists:foreach(
		fun(TableName) ->
			delete_table_data(TableName,Start,Finish)
		end,
		TablesNames
	).

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
	?log_sys(io_lib:format("scada_logger starting...~n",[])),
	scada_share:subscribe(scada_logger_insert_data,fun store_insert_data/1),
	scada_share:subscribe(scada_logger_delete_all_and_insert_data,fun delete_all_and_store_insert_data/1),
	scada_share:subscribe(scada_logger_update_data,fun store_update_data/1),
	State=update_config(),
	?log_sys(io_lib:format("scada_logger started.~n",[])),
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
		fun({_Key,Table}) ->
			TableName=Table#table.name,
			UpdaterTaskName=list_to_atom(lists:flatten("logger_updater_"++TableName)),
			cron:remove(UpdaterTaskName)
		end,
		gb_trees:to_list(State#state.tables)
	),
	ArchiveTaskName=list_to_atom(lists:flatten("logger_archiver")),
	cron:remove(ArchiveTaskName),
	NewState=update_config(),
	{reply,ok,NewState};

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%% @spec (get_tables_names,_From,State) -> TablesNames
%% @doc Callback функция для gen_server:call().
%% Для запроса получения списка таблиц баз данных.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% 
handle_call(get_tables_names,_From,State) ->
	TablesNames=lists:map(
		fun({_Key,Table}) ->
			Table#table.name
		end,
		gb_trees:to_list(State#state.tables)
	),
	{reply,TablesNames,State};

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%% @spec (get_tables_names,_From,State) -> TablesNames
%% @doc Callback функция для gen_server:call().
%% Для запроса получения списка таблиц баз данных.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% 
handle_call(archive_all_tables,_From,State) ->
	spawn(
		fun() ->
			lists:foreach(
				fun({_Key,Table}) ->
					TaskFun=create_archiver_fun(Table#table.name,Table#table.index_field,Table#table.fields),
					TaskFun(undefined)
				end,
				gb_trees:to_list(State#state.tables)
			)
		end
	),
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
handle_info(Other, State) ->
	?log_sys(io_lib:format("scada_logger: Unknown message ~p~n",[Other])),
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
		fun({_Key,Table}) ->
			TableName=Table#table.name,
			UpdaterTaskName=list_to_atom(lists:flatten("logger_updater_"++TableName)),
			cron:remove(UpdaterTaskName)
		end,
		gb_trees:to_list(State#state.tables)
	),
	ArchiveTaskName=list_to_atom(lists:flatten("logger_archiver")),
	AlarmsArchiverTaskName=list_to_atom(lists:flatten("logger_archiver_"++"ALARMS")),
	cron:remove(ArchiveTaskName),
	cron:remove(AlarmsArchiverTaskName),
	normal.


%%%%%%%%%%%%%%%%%%%%%%%
%%% private функции %%%
%%%%%%%%%%%%%%%%%%%%%%%

update_config() ->
	ConfigPath=scada:get_app_env(config_dir,lists:flatten(code:lib_dir(scada)++"/priv/config")),
	Filename=lists:flatten([ConfigPath,"/",scada:get_app_env(tables,"tables.conf")]),
	TablesProps=case file:consult(Filename) of
        {ok,Properties} ->
            Properties;
        _Other ->
            ?log_sys(io_lib:format("scada_logger: cannot load config \'~ts\'~n",[Filename])),
            erlang:error({error,{scada_logger,{update_config,_Other}}})
    end,
	Tables=lists:foldl(
		fun create_updater_process/2,
		gb_trees:empty(),
		TablesProps
	),
	create_archiver_process(
		"ALARMS",
		"ALM_NATIVETIMELAST",
		[
			"ALM_TAGNAME",
			"ALM_TAGDESC",
			"ALM_VALUE",
			"ALM_UNIT",
			"ALM_MSGTYPE",
			"ALM_DESCR",
			"ALM_ALMSTATUS",
			"ALM_ALMPRIORITY"
		]
	),
	TaskFun=fun(_) -> gen_server:call(?MODULE,archive_all_tables,60000) end,
	TaskName=list_to_atom(lists:flatten("logger_archiver")),
	cron:add(TaskName,TaskFun,3600000,60000,ok),
	#state{
		tables=Tables
	}.

create_updater_process({periodic,TableName,TablePeriod,TableOffset,TagsList},Tbls) ->
io:format("~p~n",[TableName]),
	TaskName=list_to_atom(lists:flatten("logger_updater_"++TableName)),
	CreateTableRequest=build_periodic_table_create_request(TableName,TagsList),
	scada_db:create_table(CreateTableRequest),
	TaskFun=fun(Arg) ->
		CorrectedDatetime=case TablePeriod>=60000 of
			true ->
				{{Y,M,D},{H,Mn,_}}=scada_share:system_datetime(),
				{{Y,M,D},{H,Mn,0}};
			false ->
				scada_share:system_datetime()
		end,
		TagsWithValuesList=lists:foldr(
			fun({tag,TagName,FieldName,_FieldType},Acc) ->
					case scada_tags:get_field(TagName,FieldName) of
						undefined ->
							Acc;
						TagValue ->
							[{TagName,TagValue}|Acc]
					end;
				({tag,TagName,FieldName,DBFieldName,_FieldType},Acc) ->
					case scada_tags:get_field(TagName,FieldName) of
						undefined ->
							Acc;
						TagValue ->
							[{DBFieldName,TagValue}|Acc]
					end;
				({expr,FieldName,_FieldType,Expression},Acc) ->
					case catch(scada:eval_expression(Expression)) of
						{'EXIT',_} ->
							Acc;
						ExpressionCurrentValue ->
							[{FieldName,ExpressionCurrentValue}|Acc]
					end
			end,
			[],
			TagsList
		),
		InsertTableRequest=build_periodic_table_insert_request(
			TableName,
			TagsWithValuesList,
			CorrectedDatetime
		),
		scada_share:send_local(scada_logger_insert_data,InsertTableRequest),
		Arg
	end,
	cron:add(TaskName,TaskFun,TablePeriod,TableOffset,ok),
	Fields=lists:map(
		fun({tag,TagName,_FieldName,_FieldType}) ->
				TagName;
			({tag,_TagName,_FieldName,DBFieldName,_FieldType}) ->
				DBFieldName;
			({expr,FieldName,_FieldType,_Expression}) ->
				FieldName
		end,
		TagsList
	),
	Table=#table{
		type=periodic,
		name=TableName,
		index_field="INDX",
		fields=Fields,
		period=TablePeriod,
		offset=TableOffset,
		task_name=TaskName
	},
	gb_trees:enter(TableName,Table,Tbls);

create_updater_process({onchange,TableName,TagsList},Tbls) ->
io:format("~p~n",[TableName]),
	TaskName=list_to_atom(lists:flatten("logger_updater_"++TableName)),
	CreateTableRequest=build_periodic_table_create_request(TableName,TagsList),
	scada_db:create_table(CreateTableRequest),
	TaskFun=fun(Arg) ->
		CorrectedDatetime=scada_share:system_datetime(),
		TagsWithValuesList=lists:foldr(
			fun({tag,TagName,FieldName,_FieldType},Acc) ->
					case scada_tags:get_field(TagName,FieldName) of
						undefined ->
							Acc;
						TagValue ->
							[{TagName,TagValue}|Acc]
					end;
				({tag,TagName,FieldName,DBFieldName,_FieldType},Acc) ->
					case scada_tags:get_field(TagName,FieldName) of
						undefined ->
							Acc;
						TagValue ->
							[{DBFieldName,TagValue}|Acc]
					end;
				({expr,FieldName,_FieldType,Expression},Acc) ->
					case catch(scada:eval_expression(Expression)) of
						{'EXIT',_} ->
							Acc;
						ExpressionCurrentValue ->
							[{FieldName,ExpressionCurrentValue}|Acc]
					end
			end,
			[],
			TagsList
		),
		case Arg/=TagsWithValuesList of
			true ->
				InsertTableRequest=build_periodic_table_insert_request(
					TableName,
					TagsWithValuesList,
					CorrectedDatetime
				),
				scada_share:send_local(scada_logger_insert_data,InsertTableRequest);
			false ->
				ok
		end,
		TagsWithValuesList
	end,
	cron:add(TaskName,TaskFun,1000,0,ok),
	Fields=lists:map(
		fun({tag,TagName,_FieldName,_FieldType}) ->
				TagName;
			({tag,_TagName,_FieldName,DBFieldName,_FieldType}) ->
				DBFieldName;
			({expr,FieldName,_FieldType,_Expression}) ->
				FieldName
		end,
		TagsList
	),
	Table=#table{
		type=onchange,
		name=TableName,
		index_field="INDX",
		fields=Fields,
		task_name=TaskName
	},
	gb_trees:enter(TableName,Table,Tbls);

create_updater_process({realtime,TableName,TagsList},Tbls) ->
io:format("~p~n",[TableName]),
	TaskName=list_to_atom(lists:flatten("logger_updater_"++TableName)),
	CreateTableRequest=build_periodic_table_create_request(TableName,TagsList),
	scada_db:create_table(CreateTableRequest),
	TaskFun=fun(Arg) ->
		CorrectedDatetime=scada_share:system_datetime(),
		TagsWithValuesList=lists:foldr(
			fun({tag,TagName,FieldName,_FieldType},Acc) ->
					case scada_tags:get_field(TagName,FieldName) of
						undefined ->
							Acc;
						TagValue ->
							[{TagName,TagValue}|Acc]
					end;
				({tag,TagName,FieldName,DBFieldName,_FieldType},Acc) ->
					case scada_tags:get_field(TagName,FieldName) of
						undefined ->
							Acc;
						TagValue ->
							[{DBFieldName,TagValue}|Acc]
					end;
				({expr,FieldName,_FieldType,Expression},Acc) ->
					case catch(scada:eval_expression(Expression)) of
						{'EXIT',_} ->
							Acc;
						ExpressionCurrentValue ->
							[{FieldName,ExpressionCurrentValue}|Acc]
					end
			end,
			[],
			TagsList
		),
		case Arg/=TagsWithValuesList of
			true ->
				Request=[
					{table,TableName},
					{fields,["INDX"]}
				],
				InsertTableRequest=build_periodic_table_insert_request(
					TableName,
					TagsWithValuesList,
					CorrectedDatetime
				),
				case scada_db:get_data(Request) of
					[] ->
						% io:format("Inserting realtime data~n",[]),
						DeleteRequest=[{table,TableName},{conditions,[]}],
						scada_share:send_local(scada_logger_delete_all_and_insert_data,{DeleteRequest,InsertTableRequest});
					[[_Timestamp]] ->
						% io:format("Updating realtime data~n",[]),
						scada_share:send_local(scada_logger_update_data,InsertTableRequest);
					_ ->
						% io:format("Deleteing and inserting realtime data~n",[]),
						DeleteRequest=[{table,TableName},{conditions,[]}],
						scada_share:send_local(scada_logger_delete_all_and_insert_data,{DeleteRequest,InsertTableRequest})
				end;
			false ->
				ok
		end,
		TagsWithValuesList
	end,
	Table=#table{
		type=realtime,
		name=TableName,
		task_name=TaskName
	},
	cron:add(TaskName,TaskFun,1000,0,ok),
	gb_trees:enter(TableName,Table,Tbls);

create_updater_process({event,TableName,FieldsList,EventsList},Tbls) ->
io:format("~p~n",[TableName]),
	TaskName=list_to_atom(lists:flatten("logger_updater_"++TableName)),
	CreateTableRequest=build_event_table_create_request(TableName,FieldsList),
	scada_db:create_table(CreateTableRequest),
	TaskFun=fun(Arg) ->
		F=fun() ->
			lists:foldl(
				fun({event,Type,Expression,Fields},AccIn) ->
					case catch(scada:eval_expression(Expression)) of
						{'EXIT',_} ->
							AccIn;
						ExpressionCurrentValue ->
							case catch(gb_trees:lookup(Expression,AccIn)) of
								{value,ExpressionLastValue} ->
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

											FieldsWithValues=lists:foldr(
												fun({FieldName,FieldValue},AccIn2) ->
													case (catch(scada:eval_expression(FieldValue))) of
														{'EXIT',_} ->
															?log_sys(io_lib:format("scada_logger: Error evaluating value \'~ts\' of field \'~ts\' for table \'~ts\'~n",[FieldValue,FieldName,TableName])),
															[{FieldName,"NULL"}|AccIn2];
														EvaluatedFieldValue ->
															[{FieldName,EvaluatedFieldValue}|AccIn2]
													end
												end,
												[],
												Fields
											),
											CorrectedDatetime=scada_share:system_datetime(),
											InsertTableRequest=build_event_table_insert_request(
												TableName,
												FieldsWithValues,
												CorrectedDatetime
											),
											scada_share:send_local(scada_logger_insert_data,InsertTableRequest);
										false ->
											do_nothing
									end;
								none ->
									do_nothing;
								_ ->
									do_nothing
							end,
							gb_trees:enter(Expression,ExpressionCurrentValue,AccIn)
					end
				end,
				Arg,
				EventsList
			)
		end,
		case catch(F()) of
			{'EXIT',_Reason} ->
				Arg;
			Result ->
				Result
		end
	end,
	cron:add(TaskName,TaskFun,1000,0,gb_trees:empty()),
	Fields=lists:map(
		fun({FieldName,_FieldType}) ->
			FieldName
		end,
		FieldsList
	),
	Table=#table{
		type=event,
		name=TableName,
		index_field="INDX",
		fields=Fields,
		period=1000,
		offset=0,
		task_name=TaskName
	},
	gb_trees:enter(TableName,Table,Tbls);
create_updater_process(_,AccIn) ->
	AccIn.

create_archiver_process(TableName,IndexField,Fields) ->
	TaskFun=create_archiver_fun(TableName,IndexField,Fields),
	TaskName=list_to_atom(lists:flatten("logger_archiver_"++TableName)),
	cron:add(TaskName,TaskFun,3600000,60000,ok).

create_archiver_fun(TableName,IndexField,Fields) ->
	fun(_Arg) ->
		CurrentTimestamp=scada_share:system_datetime(),
		ArchivePath=scada_backup:get_archive_path(),
		?log_sys(io_lib:format("Archiving table \'~ts\'...~n",[TableName])),
		zip_table_data(ArchivePath,TableName,IndexField,Fields,CurrentTimestamp)
	end.

zip_table_data(ArchivePath,TableName,IndexField,Fields,CurrentTimestamp) ->
	AllFields=[IndexField|Fields],
	{{Year,Month,Day},{Hour,_Minute,_Second}}=previous_hour(CurrentTimestamp),
	Request=[
		{table,TableName},
		{fields,AllFields},
		{conditions,
			[
				{IndexField,gte,{{Year,Month,Day},{Hour,0,0}}},
				{IndexField,lte,{{Year,Month,Day},{Hour,59,59}}}
			]
		},
		{orders,
			[
				{IndexField,asc}
			]
		}
	],
	Filename=lists:flatten(
		[
		ArchivePath,
		io_lib:format("/~4..0w/~2..0w/~2..0w/~ts/~ts_~4..0w~2..0w~2..0w~2..0w",[Year,Month,Day,TableName,TableName,Year,Month,Day,Hour])
		]
	),
	scada_backup:backup(Request,Filename),
	garbage_collect().

unzip_table_data(ArchivePath,TableName,CurrentTimestamp) ->
	{{Year,Month,Day},{_Hour,_Minute,_Second}}=CurrentTimestamp,
	?log_sys(io_lib:format("scada_logger: Restoring table \'~s\' data from archive for the date ~4..0w-~2..0w-~2..0w~n",[TableName,Year,Month,Day])),
	lists:foreach(
		fun(Hour) ->
			ZIPFilename=lists:flatten(
				[
				ArchivePath,
				io_lib:format("/~4..0w/~2..0w/~2..0w/~ts/~ts_~4..0w~2..0w~2..0w~2..0w.zip",[Year,Month,Day,TableName,TableName,Year,Month,Day,Hour])
				]
			),
			scada_backup:restore(ZIPFilename,TableName),
			garbage_collect()
		end,
		?day_hours
	).

restore_table_data(ArchivePath,TableName,Start,Finish) ->
	case less_then_or_equal(Start,Finish) of
		true ->
			unzip_table_data(ArchivePath,TableName,Finish),
			restore_table_data(ArchivePath,TableName,Start,previous_day(Finish));
		false ->
			ok
	end.

previous_day({{Year,Month,Day},{_Hour,_Minute,_Second}}) ->
	case Day==1 of
		false ->
			{{Year,Month,Day-1},{0,0,0}};
		true ->
			case Month==1 of
				false ->
					{{Year,Month-1,1},{0,0,0}};
				true ->
					{{Year-1,12,31},{0,0,0}}
			end
	end.

previous_hour({{Year,Month,Day},{Hour,_Month,_Day}}) ->
	case Hour==0 of
		false ->
			{{Year,Month,Day},{Hour-1,0,0}};
		true ->
			case Day==1 of
				false ->
					{{Year,Month,Day-1},{23,0,0}};
				true ->
					case Month==1 of
						false ->
							{{Year,Month-1,calendar:last_day_of_the_month(Year,Month-1)},{23,0,0}};
						true ->
							{{Year-1,12,31},{23,0,0}}
					end
			end
	end.

build_periodic_table_create_request(TableName,Tags) ->
	Fields=lists:map(
		fun({tag,TagName,_FieldName,FieldType}) ->
				{TagName,FieldType};
			({tag,_TagName,_FieldName,DBFieldName,FieldType}) ->
				{DBFieldName,FieldType};
			({expr,FieldName,FieldType,_Expression}) ->
				{FieldName,FieldType}
		end,
		Tags
	),
	Request=[
		{table,TableName},
		{fields,[{"INDX",datetime}|Fields]},
		{indexes,[{"INDX",unique}]}
	],
	Request.

build_event_table_create_request(TableName,Fields) ->
	Request=[
		{table,TableName},
		{fields,[{"INDX",datetime}|Fields]},
		{indexes,[{"INDX",not_unique}]}
	],
	Request.

build_periodic_table_insert_request(TableName,Fields,Datetime) ->
	Request=[
		{table,TableName},
		{fields,[{"INDX",Datetime}|Fields]
		}
	],
	Request.

build_event_table_insert_request(TableName,Fields,Datetime) ->
	Request=[
		{table,TableName},
		{fields,[{"INDX",Datetime}|Fields]
		}
	],
	Request.

less_then_or_equal({{Year1,Month1,Day1},{_Hour1,_Minute1,_Second1}},{{Year2,Month2,Day2},{_Hour2,_Minute2,_Second2}}) ->
	Date1=Year1*10000+Month1*100+Day1,
	Date2=Year2*10000+Month2*100+Day2,
	Date1=<Date2.

store_insert_data(Request) ->
	scada_db:insert_data(Request).

delete_all_and_store_insert_data({DeleteRequest,InsertRequest}) ->
	scada_db:delete_data(DeleteRequest),
	scada_db:insert_data(InsertRequest).

store_update_data(Request) ->
	scada_db:update_data(Request).