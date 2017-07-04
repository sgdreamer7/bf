%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @author Владимир Щербина <vns.scherbina@gmail.com>
%% @copyright 2017
%% @version 1.1.0
%% @doc Модуль <b>{@module}</b> реализует функции доступа к тегам.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
-module(scada_tags).

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
		code_change/3,
		add_tag_shared/1,
		add_tag_local/1		
	]
).

-export(
	[
		get_field/2,
		get_field_with_timestamp/2,
		set_field/3,
		set_field_with_timestamp/4
	]
).

-include("tags.hrl").
-include("logs.hrl").

%%%%%%%%%%%%%%%%%%%%%%
%%% public функции %%%
%%%%%%%%%%%%%%%%%%%%%%

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (TagName::string(),FieldName::string()) -> term()
%% @doc <i>Чтение поля тега</i>
%% <p>
%% <b>TagName</b> - имя тега;<br/>
%% <b>FieldName</b> - имя получаемого поля тега.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
get_field(TagName,"A_TS") ->
	Key={tag,TagName},
	Tag=scada_share:get_value(Key),
	case Tag of
		#tag{timestamp=Timestamp} ->
			{{Year,Month,Day},{Hour,Minute,Second},Microsecond}=Timestamp,
			lists:flatten(io_lib:format("~2..0w.~2..0w.~4..0w ~2..0w:~2..0w:~2..0w.~6..0w",[Day,Month,Year,Hour,Minute,Second,Microsecond]));
		_ ->
			undefined
	end;

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (TagName::string(),FieldName::string()) -> term()
%% @doc <i>Чтение поля тега</i>
%% <p>
%% <b>TagName</b> - имя тега;<br/>
%% <b>FieldName</b> - имя получаемого поля тега.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
get_field(TagName,"A_DT") ->
	Key={tag,TagName},
	Tag=scada_share:get_value(Key),
	case Tag of
		#tag{timestamp=Timestamp} ->
			{{Year,Month,Day},{Hour,Minute,Second},_Microsecond}=Timestamp,
			lists:flatten(io_lib:format("~2..0w.~2..0w.~4..0w ~2..0w:~2..0w:~2..0w",[Day,Month,Year,Hour,Minute,Second]));
		_ ->
			undefined
	end;

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (TagName::string(),FieldName::string()) -> term()
%% @doc <i>Чтение поля тега</i>
%% <p>
%% <b>TagName</b> - имя тега;<br/>
%% <b>FieldName</b> - имя получаемого поля тега.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
get_field(TagName,"A_TIME") ->
	Key={tag,TagName},
	Tag=scada_share:get_value(Key),
	case Tag of
		#tag{timestamp=Timestamp} ->
			{_Date,{Hour,Minute,Second},_Microsecond}=Timestamp,
			lists:flatten(io_lib:format("~2..0w:~2..0w:~2..0w",[Hour,Minute,Second]));
		_ ->
			undefined
	end;

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (TagName::string(),FieldName::string()) -> term()
%% @doc <i>Чтение поля тега</i>
%% <p>
%% <b>TagName</b> - имя тега;<br/>
%% <b>FieldName</b> - имя получаемого поля тега.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
get_field(TagName,"F_TS") ->
	Key={tag,TagName},
	Tag=scada_share:get_value(Key),
	case Tag of
		#tag{timestamp=Timestamp} ->
			{Date,Time,_Microsecond}=Timestamp,
			calendar:datetime_to_gregorian_seconds({Date,Time});
		_ ->
			undefined
	end;

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (TagName::string(),FieldName::string()) -> term()
%% @doc <i>Чтение поля тега</i>
%% <p>
%% <b>TagName</b> - имя тега;<br/>
%% <b>FieldName</b> - имя получаемого поля тега.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
get_field(TagName,FieldName) ->
	Key={tag,TagName},
	Tag=scada_share:get_value(Key),
	case Tag of
		#tag{type=TagType} ->
			case catch(TagType:get_field(Tag,FieldName)) of
				{'EXIT',_ProcessError} ->
					?log_sys(io_lib:format("scada_tags: Error: ~p~n",[_ProcessError])),
					undefined;
				FieldValue ->
					FieldValue
			end;
		_ ->
			undefined
	end.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (TagName::string(),FieldName::string()) -> term()
%% @doc <i>Чтение поля тега с меткой времени</i>
%% <p>
%% <b>TagName</b> - имя тега;<br/>
%% <b>FieldName</b> - имя получаемого поля тега.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
get_field_with_timestamp(TagName,FieldName) ->
	Key={tag,TagName},
	Tag=scada_share:get_value(Key),
	case Tag of
		#tag{type=TagType,timestamp=Timestamp} ->
			case catch(TagType:get_field(Tag,FieldName)) of
				{'EXIT',_ProcessError} ->
					?log_sys(io_lib:format("scada_tags: Error: ~p~n",[_ProcessError])),
					undefined;
				FieldValue ->
					{FieldValue,Timestamp}
			end;
		_ ->
			undefined
	end.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (TagName::string(),FieldName::string(),FieldValue::term()) -> term()
%% @doc <i>Запись поля тега</i>
%% <p>
%% <b>TagName</b> - имя тега;<br/>
%% <b>FieldName</b> - имя устанавливаемого поля тега;<br/>
%% <b>FieldValue</b> - значение устанавливаемого поля тега.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
set_field(TagName,"F_CV",FieldValue) ->
	Key={tag,TagName},
	Tag=scada_share:get_value(Key),
	case Tag of
		#tag{type=TagType,driver=TagDriver,address=TagAddress} ->
			RawFieldValue=TagType:get_raw_value(Tag,FieldValue),
			case catch(TagDriver:set_value(TagAddress,RawFieldValue)) of
				{'EXIT',_DriverError} ->
					?log_sys(io_lib:format("scada_tags: Error: ~p~n",[_DriverError])),
					ok;
				_ ->
					ok
			end;
		_ ->
			ok
	end;

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (TagName::string(),FieldName::string(),FieldValue::term()) -> term()
%% @doc <i>Запись поля тега</i>
%% <p>
%% <b>TagName</b> - имя тега;<br/>
%% <b>FieldName</b> - имя устанавливаемого поля тега;<br/>
%% <b>FieldValue</b> - значение устанавливаемого поля тега.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
set_field(TagName,FieldName,FieldValue) ->
	Key={tag,TagName},
	case catch(scada_share:get_value(Key)) of
		{'EXIT',GetTagError} ->
			?log_sys(io_lib:format("scada_tags: scada_share:get_value: Error: ~p~n",[GetTagError])),
			exit(GetTagError);
		#tag{type=TagType,shared=IsTagShared}=Tag ->
			case catch(TagType:set_field(Tag,FieldName,FieldValue)) of
				{'EXIT',ProcessError} ->
					?log_sys(io_lib:format("scada_tags: TagType:set_field:~nTagName: ~ts~nFieldName: ~p~nFieldValue: ~p~nError: ~p~n",[Tag#tag.name,FieldName,FieldValue,ProcessError])),
					exit(ProcessError);
				ProcessedTag ->
					case IsTagShared of
						true ->
							(catch scada_share:set_value(Key,ProcessedTag#tag{timestamp=scada_share:system_time()})),
							scada_share:send(update_tag_config,{tags_shared,ProcessedTag});
						false ->
							(catch scada_share:set_local_value(Key,ProcessedTag#tag{timestamp=scada_share:system_time()})),
							scada_share:send_local(update_tag_config,{tags_local,ProcessedTag})
					end,						
					ok
			end;
		_ ->
			ok
	end.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (TagName::string(),FieldName::string(),FieldValue::term(),OldTimestamp::term()) -> term()
%% @doc <i>Запись поля тега с проверкой предыдущей метки времени</i>
%% <p>
%% <b>TagName</b> - имя тега;<br/>
%% <b>FieldName</b> - имя устанавливаемого поля тега;<br/>
%% <b>FieldValue</b> - значение устанавливаемого поля тега;<br/>
% <b>OldTimestamp</b> - значение предыдущей метки времени.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
set_field_with_timestamp(TagName,"F_CV",FieldValue,OldTimestamp) ->
	Key={tag,TagName},
	Tag=scada_share:get_value(Key),
	case Tag of
		#tag{type=TagType,driver=TagDriver,address=TagAddress,timestamp=OldFieldTimestamp} ->
			case (OldFieldTimestamp==OldTimestamp) of
				true ->
					RawFieldValue=TagType:get_raw_value(Tag,FieldValue),
					case catch(TagDriver:set_value(TagAddress,RawFieldValue)) of
						{'EXIT',_DriverError} ->
							?log_sys(io_lib:format("scada_tags: Error: ~p~n",[_DriverError]));
						_ ->
							do_nothing
					end,
					true;
				_ ->
					false
			end;
		_ ->
			false
	end;


%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (TagName::string(),FieldName::string(),FieldValue::term(),OldTimestamp::term()) -> term()
%% @doc <i>Запись поля тега с проверкой предыдущей метки времени</i>
%% <p>
%% <b>TagName</b> - имя тега;<br/>
%% <b>FieldName</b> - имя устанавливаемого поля тега;<br/>
%% <b>FieldValue</b> - значение устанавливаемого поля тега;<br/>
% <b>OldTimestamp</b> - значение предыдущей метки времени.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
set_field_with_timestamp(TagName,FieldName,FieldValue,OldTimestamp) ->
	Key={tag,TagName},
	case catch(scada_share:get_value(Key)) of
		{'EXIT',GetTagError} ->
			?log_sys(io_lib:format("scada_tags: scada_share:get_value: Error: ~p~n",[GetTagError])),
			exit(GetTagError);
		#tag{type=TagType,shared=IsTagShared,timestamp=OldFieldTimestamp}=Tag ->
			case catch(TagType:set_field(Tag,FieldName,FieldValue)) of
				{'EXIT',ProcessError} ->
					?log_sys(io_lib:format("scada_tags: TagType:set_field:~nTagName: ~ts~nFieldName: ~p~nFieldValue: ~p~nError: ~p~n",[Tag#tag.name,FieldName,FieldValue,ProcessError])),
					exit(ProcessError);
				ProcessedTag ->
					case (OldFieldTimestamp==OldTimestamp) of
						true ->
							case IsTagShared of
								true ->
									(catch scada_share:set_value(Key,ProcessedTag#tag{timestamp=scada_share:system_time()}));
								false ->
									(catch scada_share:set_local_value(Key,ProcessedTag#tag{timestamp=scada_share:system_time()}))
							end,
							true;
						_ ->
							false
					end
			end;
		_ ->
			false
	end.
	

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec ({tag,_TagName,_TagType,_TagDescription,_TagDriver,_TagAddress,_TagAlarming,_TagAlarmPriority,_TagProps}) -> term()
%% @doc <i>Добавление глобального тега</i>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%	
add_tag_shared({tag,_TagName,_TagType,_TagDescription,_TagDriver,_TagAddress,_TagAlarming,_TagAlarmPriority,_TagProps}=Tag) ->
	{TagNameShared,TagDriverShared,TagAddressShared}=init_tag_shared(Tag),
	TagDriverShared:register_tag(TagNameShared,TagAddressShared,fun update_tag_shared/2);
add_tag_shared(_) ->
	{error,undefined_tag}.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec ({tag,_TagName,_TagType,_TagDescription,_TagDriver,_TagAddress,_TagAlarming,_TagAlarmPriority,_TagProps}) -> term()
%% @doc <i>Добавление локального тега</i>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%	
add_tag_local({tag,_TagName,_TagType,_TagDescription,_TagDriver,_TagAddress,_TagAlarming,_TagAlarmPriority,_TagProps}=Tag) ->
	{TagNameLocal,TagDriverLocal,TagAddressLocal}=init_tag_local(Tag),
	TagDriverLocal:register_tag(TagNameLocal,TagAddressLocal,fun update_tag_local/2);
add_tag_local(_) ->
	{error,undefined_tag}.

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
	?log_sys(io_lib:format("scada_tags starting...~n",[])),
	TagsConfig=scada:get_app_env(tags,[]),
	ConfigPath=scada:get_app_env(config_dir,lists:flatten(code:lib_dir(scada)++"/priv/config")),
	Simulate=scada:get_app_env(simulate,false),
	FilenameShared=lists:flatten([ConfigPath,"/",proplists:get_value(shared,TagsConfig,"tags_shared.conf")]),
	scada_share:subscribe(update_tag_config,fun update_tag_config/1),
	UpdateFilenameShared=lists:flatten([ConfigPath,"/","update.tags_shared.conf"]),
	ConfigShared=load_config_shared(FilenameShared,UpdateFilenameShared,Simulate),
	TagsShared=init_tags_shared(ConfigShared,32),
	lists:foreach(
		fun({TagNameShared,TagDriverShared,TagAddressShared}) ->

			TagDriverShared:register_tag(TagNameShared,TagAddressShared,fun update_tag_shared/2)
		end,
		TagsShared
	),
	FilenameLocal=lists:flatten([ConfigPath,"/",proplists:get_value(local,TagsConfig,"tags_local.conf")]),
	UpdateFilenameLocal=lists:flatten([ConfigPath,"/","update.tags_local.conf"]),
	ConfigLocal=load_config_local(FilenameLocal,UpdateFilenameLocal,Simulate),
	TagsLocal=init_tags_local(ConfigLocal,32),
	lists:foreach(
		fun({TagNameLocal,TagDriverLocal,TagAddressLocal}) ->
			TagDriverLocal:register_tag(TagNameLocal,TagAddressLocal,fun update_tag_local/2)
		end,
		TagsLocal
	),
	TagsList=lists:map(
		fun({TName,_TDriver,_TAddress}) ->
			TName
		end,
		TagsLocal++TagsShared
	),
	Key=tags_list,
	scada_share:set_local_value(Key,TagsList),
	?log_sys(io_lib:format("scada_tags started.~n",[])),
	{ok, undefined}.

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
handle_info({'EXIT',_}, State) ->
	{noreply,State};

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%% @spec (_Info, State) -> ok
%% @doc Callback функция при получении сообщений gen_server.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
handle_info(Other, State) ->
	?log_sys(io_lib:format("scada_tags: Unknown message ~p~n",[Other])),
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
terminate(Reason, _State) ->
	?log_sys(io_lib:format("~p: terminating for reason: ~p~n",[?MODULE,Reason])),
	normal.



%%%%%%%%%%%%%%%%%%%%%%%
%%% private функции %%%
%%%%%%%%%%%%%%%%%%%%%%%

load_config_shared(Filename,UpdateFilename,Simulate) ->
	TagsToUpdate=case catch(consult(UpdateFilename)) of
		{ok,UpdatedTags} ->
			UpdatedTags;
		_Other2 ->
			?log_sys(io_lib:format("scada_tags: cannot load shared tags update config \'~ts\'~n",[UpdateFilename])),
			[]
	end,
	case catch(consult(Filename)) of
		{ok,Tags} ->
			ProcessedTags=lists:foldr(
				fun({tag,TagName,_TagType,_TagDescription,_TagDriver,_TagAddress,_TagAlarming,_TagAlarmPriority,_TagProps}=Tag,AccIn) ->
					lists:keystore(TagName,2,AccIn,Tag)
				end,
				Tags,
				TagsToUpdate
			),
			case Simulate of
				true ->
					lists:map(
						fun({tag,TagName2,TagType2,TagDescription2,scada_driver_modbus,TagAddress2,TagAlarming2,TagAlarmPriority2,TagProps2}) ->
								{tag,TagName2,TagType2,TagDescription2,scada_driver_simulator,TagAddress2,TagAlarming2,TagAlarmPriority2,TagProps2};
							({tag,TagName2,TagType2,TagDescription2,TagDriver2,TagAddress2,TagAlarming2,TagAlarmPriority2,TagProps2}) ->
								{tag,TagName2,TagType2,TagDescription2,TagDriver2,TagAddress2,TagAlarming2,TagAlarmPriority2,TagProps2}
						end,
						ProcessedTags
					);
				false ->
					ProcessedTags
			end;
		Other ->
			?log_sys(io_lib:format("scada_tags: cannot load shared tags config \'~ts\'~n",[Filename])),
			erlang:exit({error,{scada_tags,Other}})
	end.

load_config_local(Filename,UpdateFilename,Simulate) ->
	TagsToUpdate=case catch(consult(UpdateFilename)) of
		{ok,UpdatedTags} ->
			UpdatedTags;
		_Other2 ->
			?log_sys(io_lib:format("scada_tags: cannot load local tags update config \'~ts\'~n",[UpdateFilename])),
			[]
	end,
	case catch(consult(Filename)) of
		{ok,Tags} ->
			ProcessedTags=lists:foldr(
				fun({tag,TagName,_TagType,_TagDescription,_TagDriver,_TagAddress,_TagAlarming,_TagAlarmPriority,_TagProps}=Tag,AccIn) ->
					lists:keystore(TagName,2,AccIn,Tag)
				end,
				Tags,
				TagsToUpdate
			),
			case Simulate of
				true ->
					lists:map(
						fun({tag,TagName2,TagType2,TagDescription2,scada_driver_modbus,TagAddress2,TagAlarming2,TagAlarmPriority2,TagProps2}) ->
								{tag,TagName2,TagType2,TagDescription2,scada_driver_simulator,TagAddress2,TagAlarming2,TagAlarmPriority2,TagProps2};
							({tag,TagName2,TagType2,TagDescription2,TagDriver2,TagAddress2,TagAlarming2,TagAlarmPriority2,TagProps2}) ->
								{tag,TagName2,TagType2,TagDescription2,TagDriver2,TagAddress2,TagAlarming2,TagAlarmPriority2,TagProps2}
						end,
						ProcessedTags
					);
				false ->
					ProcessedTags
			end;
		Other ->
			?log_sys(io_lib:format("scada_tags: cannot load local tags config \'~ts\'~n",[Filename])),
			erlang:exit({error,{scada_tags,Other}})
	end.

consult(File) ->
    case file:open(File, [read,{encoding, utf8}]) of
		{ok, Fd} ->
	    	R = consult_stream(Fd),
	    	file:close(Fd),
	    	R;
		Error ->
	    	Error
    end.

consult_stream(Fd) ->
    consult_stream(Fd, 1, []).

consult_stream(Fd, Line, Acc) ->
    case io:read(Fd, '', Line) of
		{ok,Term,EndLine} ->
		    consult_stream(Fd, EndLine, [Term|Acc]);
		{error,Error,_Line} ->
		    {error,Error};
		{eof,_Line} ->
		    {ok,lists:reverse(Acc)}
    end.

init_tags_shared(Tags,Processes) when is_list(Tags) ->
	plists:map(fun init_tag_shared/1,Tags,{processes,Processes}).

init_tag_shared({tag,TagName,TagType,TagDescription,TagDriver,TagAddress,TagAlarming,TagAlarmPriority,TagProps}) ->
	Tag=#tag{
		name=TagName,
		type=TagType,
		description=TagDescription,
		driver=TagDriver,
		address=TagAddress,
		alarming=TagAlarming,
		alarm_priority=TagAlarmPriority,
		props=TagProps,
		shared=true,
		timestamp=scada_share:system_time()
	},
	case catch(TagType:init(Tag)) of
		{'EXIT',_Error} ->
			?log_sys(io_lib:format("scada_tags: init_tag: Error: ~p~n",[_Error])),
			"";
		InitializedTag ->
			Key={tag,TagName},
			Value=InitializedTag,
			case scada_share:get_value(Key) of
				undefined ->
					scada_share:set_value(Key,Value),
					case catch(TagType:process(InitializedTag,undefined)) of
						{'EXIT',ProcessError} ->
							?log_sys(io_lib:format("scada_tags: TagType:process_tag:~nTagName: ~ts~nTagValue: ~p~nError: ~p~n",[Tag#tag.name,undefined,ProcessError])),
							ok;
						{ProcessedTag,Alarm} ->
							(catch scada_share:set_value(Key,ProcessedTag)),
							case catch(scada_alarms:update_alarms(Alarm)) of
								{'EXIT',AlarmsError} ->
									?log_sys(io_lib:format("scada_tags: scada_alarms:update_alarms: Error: ~p~n",[AlarmsError])),
									ok;
								_ ->
									ok
							end,
							ok
					end;
				_ ->
					ok
			end,
			{TagName,TagDriver,TagAddress}
	end;
init_tag_shared(_Tag) ->
	{"",undefined,""}.


init_tags_local(Tags,Processes) when is_list(Tags) ->
	plists:map(fun init_tag_local/1,Tags,{processes,Processes}).

init_tag_local({tag,TagName,TagType,TagDescription,TagDriver,TagAddress,TagAlarming,TagAlarmPriority,TagProps}) ->
	Tag=#tag{
		name=TagName,
		type=TagType,
		description=TagDescription,
		driver=TagDriver,
		address=TagAddress,
		alarming=TagAlarming,
		alarm_priority=TagAlarmPriority,
		props=TagProps,
		shared=false,
		timestamp=scada_share:system_time()
	},
	case catch(TagType:init(Tag)) of
		{'EXIT',_Error} ->
			?log_sys(io_lib:format("scada_tags: init_tag: Error: ~p~n",[_Error])),
			"";
		InitializedTag ->
			Key={tag,TagName},
			Value=InitializedTag,
			scada_share:set_local_value(Key,Value),
			case catch(TagType:process(InitializedTag,undefined)) of
				{'EXIT',ProcessError} ->
					?log_sys(io_lib:format("scada_tags: TagType:process_tag:~nTagName: ~ts~nTagValue: ~p~nError: ~p~n",[Tag#tag.name,undefined,ProcessError])),
					ok;
				{ProcessedTag,Alarm} ->
					(catch scada_share:set_local_value(Key,ProcessedTag)),
					case catch(scada_alarms:update_alarms(Alarm)) of
						{'EXIT',AlarmsError} ->
							?log_sys(io_lib:format("scada_tags: scada_alarms:update_alarms: Error: ~p~n",[AlarmsError])),
							ok;
						_ ->
							ok
					end,
					ok
			end,
			{TagName,TagDriver,TagAddress}
	end;
init_tag_local(_Tag) ->
	{"",undefined,""}.

update_tag_shared(Name,Value) ->
	Key={tag,Name},
	case catch(scada_share:get_value(Key)) of
		{'EXIT',GetTagError} ->
			?log_sys(io_lib:format("scada_tags: scada_share:get_value: Error: ~p~n",[GetTagError])),
			exit(GetTagError);
		#tag{type=TagType}=Tag ->
			TagPreviousValue=case catch(TagType:get_field(Tag,"F_CV")) of
				{'EXIT',GetFieldError} ->
					?log_sys(io_lib:format("scada_tags: TagType:get_field: Error: ~p~n",[GetFieldError])),
					undefined;
				FieldValue ->
					FieldValue
			end,
			case Value/=TagPreviousValue of
				true ->
					case catch(TagType:process(Tag,Value)) of
						{'EXIT',ProcessError} ->
							?log_sys(io_lib:format("scada_tags: TagType:process_tag:~nTagName: ~ts~nTagValue: ~p~nError: ~p~n",[Tag#tag.name,Value,ProcessError])),
							exit(ProcessError);
						{ProcessedTag,Alarm} ->
							(catch scada_share:set_value(Key,ProcessedTag#tag{timestamp=scada_share:system_time()})),
							case catch(scada_alarms:update_alarms(Alarm)) of
								{'EXIT',AlarmsError} ->
									?log_sys(io_lib:format("scada_tags: scada_alarms:update_alarms: Error: ~p~n",[AlarmsError])),
									exit(AlarmsError);
								_ ->
									ok
							end,
							ok
					end;
				false ->
					ok
			end;
		_ ->
			ok
	end.

update_tag_local(Name,Value) ->
	Key={tag,Name},
	case catch(scada_share:get_value(Key)) of
		{'EXIT',GetTagError} ->
			?log_sys(io_lib:format("scada_tags: scada_share:get_value: Error: ~p~n",[GetTagError])),
			exit(GetTagError);
		#tag{type=TagType}=Tag ->
			TagPreviousValue=case catch(TagType:get_field(Tag,"F_CV")) of
				{'EXIT',GetFieldError} ->
					?log_sys(io_lib:format("scada_tags: TagType:get_field: Error: ~p~n",[GetFieldError])),
					undefined;
				FieldValue ->
					FieldValue
			end,
			case Value==TagPreviousValue of
				false ->
					case catch(TagType:process(Tag,Value)) of
						{'EXIT',ProcessError} ->
							?log_sys(io_lib:format("scada_tags: TagType:process_tag:~nTagName: ~ts~nTagValue: ~p~nError: ~p~n",[Tag#tag.name,Value,ProcessError])),
							exit(ProcessError);
						{ProcessedTag,Alarm} ->
							(catch scada_share:set_local_value(Key,ProcessedTag#tag{timestamp=scada_share:system_time()})),
							case catch(scada_alarms:update_alarms(Alarm)) of
								{'EXIT',AlarmsError} ->
									?log_sys(io_lib:format("scada_tags: scada_alarms:update_alarms: Error: ~p~n",[AlarmsError])),
									exit(AlarmsError);
								_ ->
									ok
							end,
							ok
					end;
				true ->
					ok
			end;
		_ ->
			ok
	end.

update_tag_config({UpdatedTagScope,UpdatedTag}) ->
	ConfigPath=scada:get_app_env(config_dir,lists:flatten(code:lib_dir(scada)++"/priv/config")),
	Filename=lists:flatten([ConfigPath,"/",io_lib:format("update.~s.conf",[UpdatedTagScope])]),
	UpdatedTags=case catch(consult(Filename)) of
		{ok,Tags} ->
				{TagFound,TagsResult}=lists:foldr(
				fun({tag,TagName,TagType,TagDescription,TagDriver,TagAddress,TagAlarming,TagAlarmPriority,TagProps},{Found,AccIn}) ->
					case TagName==UpdatedTag#tag.name of
						true ->
							{true,[TagType:get_config_string(UpdatedTag)|AccIn]};
						false ->
							InitTag=#tag{
								name=TagName,
								type=TagType,
								description=TagDescription,
								driver=TagDriver,
								address=TagAddress,
								alarming=TagAlarming,
								alarm_priority=TagAlarmPriority,
								props=TagProps,
								shared=UpdatedTagScope==tags_shared,
								timestamp=scada_share:system_time()
							},	
							{Found,[TagType:get_config_string((catch TagType:init(InitTag)))|AccIn]}
					end							
				end,
				{false,[]},
				Tags
			),
			case TagFound of
				true ->
					TagsResult;
				false ->
					UpdatedTagType=UpdatedTag#tag.type,
					TagsResult++[UpdatedTagType:get_config_string(UpdatedTag)]
			end;
		_Other ->
			?log_sys(io_lib:format("scada_tags: cannot load update tags config \'~ts\'~n",[Filename])),
			TagType=UpdatedTag#tag.type,
			[TagType:get_config_string(UpdatedTag)]
	end,
	file:write_file(Filename,list_to_binary(UpdatedTags)).