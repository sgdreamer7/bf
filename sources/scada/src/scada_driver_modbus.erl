%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @author Владимир Щербина <vns.scherbina@gmail.com>
%% @copyright 2017
%% @version 1.1.0
%% @doc Модуль <b>{@module}</b> реализует драйвер протокола Modbus/TCP.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
-module(scada_driver_modbus).

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
	rec,
	{
		task_name,
		host,
		port,
		device_address,
		timeout,
		delay,
		reg_type,
		address,
		quantity,
		data_type,
		priority,
		data,
		callbacks,
		process_fun
	}
).
-record(
	state,
	{
		config,
		cache
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
set_value(Address,Value) ->
	WriteFun=gen_server:call(?MODULE,{set_value,Address,Value},5000),
	case repeat(2,WriteFun) of
		error ->
			% io:format("scada_driver_modbus: set_value: error: Address: ~p, Value: ~p~n",[Address,Value]),
			ok;
		_ ->
			ok
	end,
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
init(Options) ->
	erlang:process_flag(trap_exit, true),
	?log_sys(io_lib:format("scada_driver_modbus starting...~n",[])),
	ConfigPath=scada:get_app_env(config_dir,lists:flatten(code:lib_dir(scada)++"/priv/config")),
	Filename=lists:flatten([ConfigPath,"/",proplists:get_value(config,Options,"driver_modbus.conf")]),
	{Timings,Config}=load_config(Filename),
	{_Keys,Recs}=lists:unzip(gb_trees:to_list(Config)),
	PreparedRecsCache=lists:foldl(
		fun(Rec,AccIn) ->
			Host=Rec#rec.host,
			{OldRecsWithPriority,OldRecsWithoutPriority}=case gb_trees:lookup(Host,AccIn) of
				none ->
					{array:new(),array:new()};
				{value,CachedHostRecs} ->
					CachedHostRecs
			end,
			NewHostRecs=case Rec#rec.priority of
				true ->
					{array:set(array:size(OldRecsWithPriority),Rec,OldRecsWithPriority),OldRecsWithoutPriority};
				false ->
					{OldRecsWithPriority,array:set(array:size(OldRecsWithoutPriority),Rec,OldRecsWithoutPriority)}
			end,
			gb_trees:enter(Host,NewHostRecs,AccIn)
		end,
		gb_trees:empty(),
		Recs
	),
	lists:foreach(
		fun({HostName,{PreparedRecsWithPriority,PreparedRecsWithoutPriority}}) ->
			PreparedHostRecs=permutate_recs(PreparedRecsWithPriority,PreparedRecsWithoutPriority),
			ProcessFun=fun(Arg) ->
				lists:foldl(
					fun(PreparedRec,Acc) ->
						RecFun=PreparedRec#rec.process_fun,
						case gb_trees:lookup(PreparedRec#rec.device_address,Acc) of
							none ->
								case RecFun(undefined) of
									ok ->
										Acc;
									error ->
										gb_trees:enter(PreparedRec#rec.device_address,PreparedRec,Acc)
								end;
							{value,_} ->
								Acc
						end
					end,
					gb_trees:empty(),
					PreparedHostRecs
				),
				Arg
			end,
			TaskName=list_to_atom(lists:flatten(io_lib:format("scada_driver_modbus_updater_~s",[HostName]))),
			{TaskPeriod,TaskOffset}=case gb_trees:lookup(HostName,Timings) of
				none ->
					{1000,0};
				{value,{_Period,_Offset}=Timing} ->
					Timing
			end,
			cron:add(TaskName,ProcessFun,TaskPeriod,TaskOffset,undefined)
		end,
		gb_trees:to_list(PreparedRecsCache)
	),
	State=#state{
		config=Config,
		cache=gb_trees:empty()
	},
	?log_sys(io_lib:format("scada_driver_modbus started.~n",[])),
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
handle_call({get_callbacks,Key},_From,State) ->
	Config=State#state.config,
	Callbacks=case gb_trees:lookup(Key,Config) of
		{value,Rec} ->
			Rec#rec.callbacks;
		none ->
			gb_trees:empty()
	end,
	{reply,Callbacks,State};

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%% @spec ({register_tag,TagName,Address,Callback},_From,State) -> ok
%% @doc Callback функция для gen_server:call().
%% Для запроса регистрации тега и адреса.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% 
handle_call({register_tag,TagName,Address,Callback},_From,State) ->
	Cache=State#state.cache,
	Config=State#state.config,
	{NewCache,Key,Index}=find_address_in_cache(Address,Cache,Config),
	case gb_trees:lookup(Key,Config) of
		{value,Rec} ->
			Callbacks=Rec#rec.callbacks,
			TagsCallbacks=case gb_trees:lookup(Index,Callbacks) of
				{value,Value} ->
					Value;
				none ->
					gb_trees:empty()
			end,
			NewTagsCallbacks=gb_trees:enter(TagName,Callback,TagsCallbacks),
			NewCallbacks=gb_trees:enter(Index,NewTagsCallbacks,Callbacks),
			NewRec=Rec#rec{callbacks=NewCallbacks},
			NewConfig=gb_trees:enter(Key,NewRec,Config),
			NewState=State#state{config=NewConfig,cache=NewCache},
			{reply,ok,NewState};
		none ->
			?log_sys(io_lib:format("scada_driver_modbus: cannot find address \'~ts\' for the tag \'~ts\' in driver configuration~n",[Address,TagName])),
			NewState=State#state{cache=NewCache},
			{reply,ok,NewState}
	end;

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%% @spec ({set_value,Address,Value},_From,State) -> ok
%% @doc Callback функция для gen_server:call().
%% Для запроса записи данных по адресу.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% 
handle_call({set_value,Address,Value},_From,State) ->
	Cache=State#state.cache,
	Config=State#state.config,
	EmptyFun=fun() ->
		ok
	end,
	{NewCache,Key,Index}=find_address_in_cache(Address,Cache,Config),
	WriteFun=case Index of
		{data,_Indx} ->
			case Key of
				undefined ->
					EmptyFun;
				_ ->
					case gb_trees:lookup(Key,Config) of
						{value,Rec} ->
							case parse_address(Address) of
								{data,[_DeviceName,RegTypeAndAddressWithoutBit,RegTypeAndAddressWithoutBit,"-1"]} ->
									{RegType,RegAddress}=get_type_and_address(RegTypeAndAddressWithoutBit),
									case RegType of
										coil ->
											fun() ->
												catch modbus_device:write_coils( Rec#rec.host, Rec#rec.port, Rec#rec.device_address, Rec#rec.timeout,RegAddress-1,[round(Value)])
											end;
										hreg ->
											case Rec#rec.data_type of
												int16 ->
													fun() ->
														catch modbus_device:write_hregs( Rec#rec.host, Rec#rec.port, Rec#rec.device_address, Rec#rec.timeout,RegAddress-1,[round(Value)])
													end;
												sint16 ->
													fun() ->
														catch modbus_device:write_hregs( Rec#rec.host, Rec#rec.port, Rec#rec.device_address, Rec#rec.timeout,RegAddress-1,[round(Value)])
													end;
												int32 ->
													fun() ->
														catch modbus_device:write_hregs( Rec#rec.host, Rec#rec.port, Rec#rec.device_address, Rec#rec.timeout,RegAddress-1,from_int32(Value))
													end;
												sint32 ->
													fun() ->
														catch modbus_device:write_hregs( Rec#rec.host, Rec#rec.port, Rec#rec.device_address, Rec#rec.timeout,RegAddress-1,from_sint32(Value))
													end;
												float32 ->
													fun() ->
														catch modbus_device:write_hregs( Rec#rec.host, Rec#rec.port, Rec#rec.device_address, Rec#rec.timeout,RegAddress-1,from_float32(Value))
													end;
												_ ->
													EmptyFun
											end;
										_ ->
											EmptyFun
									end;
								{data,[_DeviceName,RegTypeAndAddressWithoutBit1,RegTypeAndAddressWithoutBit2,"-1"]}  when RegTypeAndAddressWithoutBit1/=RegTypeAndAddressWithoutBit2 ->
									{RegType1,RegAddress1}=get_type_and_address(RegTypeAndAddressWithoutBit1),
									case RegType1 of
										coil ->
											RoundedValues=lists:map(
												fun(CoilValue) ->
													round(CoilValue)
												end,
												Value
											),
											fun() ->
												catch modbus_device:write_coils( Rec#rec.host, Rec#rec.port, Rec#rec.device_address, Rec#rec.timeout,RegAddress1-1,RoundedValues)
											end;
										hreg ->
											case Rec#rec.data_type of
												int16 ->
													RoundedValues=lists:map(
														fun(IntValue) ->
															round(IntValue)
														end,
														Value
													),
													fun() ->
														(catch modbus_device:write_hregs( Rec#rec.host, Rec#rec.port, Rec#rec.device_address, Rec#rec.timeout,RegAddress1-1,RoundedValues))
													end;
												sint16 ->
													RoundedValues=lists:map(
														fun(IntValue) ->
															round(IntValue)
														end,
														Value
													),
													fun() ->
														(catch modbus_device:write_hregs( Rec#rec.host, Rec#rec.port, Rec#rec.device_address, Rec#rec.timeout,RegAddress1-1,RoundedValues))
													end;
												int32 ->
													ConvertedValues=lists:map(
														fun(IntValue) ->
															from_int32(IntValue)
														end,
														Value
													),
													fun() ->
														(catch modbus_device:write_hregs( Rec#rec.host, Rec#rec.port, Rec#rec.device_address, Rec#rec.timeout,RegAddress1-1,ConvertedValues))
													end;
												sint32 ->
													ConvertedValues=lists:map(
														fun(IntValue) ->
															from_sint32(IntValue)
														end,
														Value
													),
													fun() ->
														(catch modbus_device:write_hregs( Rec#rec.host, Rec#rec.port, Rec#rec.device_address, Rec#rec.timeout,RegAddress1-1,ConvertedValues))
													end;
												float32 ->
													ConvertedValues=lists:map(
														fun(FloatValue) ->
															from_float32(FloatValue)
														end,
														Value
													),
													fun() ->
														(catch modbus_device:write_hregs( Rec#rec.host, Rec#rec.port, Rec#rec.device_address, Rec#rec.timeout,RegAddress1-1,ConvertedValues))
													end;
												_ ->
													EmptyFun
											end;
										_ ->
											EmptyFun
									end;
								{data,[_DeviceName,RegTypeAndAddressWithoutBit,RegTypeAndAddressWithoutBit,BitAddress]} ->
									{RegType,RegAddress}=get_type_and_address(RegTypeAndAddressWithoutBit),
									case RegType of
										hreg ->
											case Rec#rec.data_type of
												bool ->
													fun() ->
														(catch modbus_device:write_hreg_bit( Rec#rec.host, Rec#rec.port, Rec#rec.device_address, Rec#rec.timeout,RegAddress-1,get_integer(BitAddress),Value))
													end;
												_ ->
													EmptyFun
											end;
										_ ->
											EmptyFun
									end;
								_ ->
									EmptyFun
							end;
						_ ->
							EmptyFun
					end
			end;
		_ ->
			EmptyFun
	end,
	NewState=State#state{cache=NewCache},
	{reply,WriteFun,NewState};

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
	?log_sys(io_lib:format("scada_driver_modbus: Unknown message ~p~n",[Other])),
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
terminate(_Reason, State) ->
	?log_sys(io_lib:format("~p: terminating ...~n",[?MODULE])),
	{_Keys,Recs}=lists:unzip(gb_trees:to_list(State#state.config)),
	PreparedRecsCache=lists:foldl(
		fun(Rec,AccIn) ->
			Host=Rec#rec.host,
			OldRecs=case gb_trees:lookup(Host,AccIn) of
				none ->
					gb_trees:empty();
				{value,CachedRecs} ->
					CachedRecs
			end,
			NewRecs=gb_trees:enter(Rec#rec.task_name,Rec,OldRecs),
			gb_trees:enter(Host,NewRecs,AccIn)
		end,
		gb_trees:empty(),
		Recs
	),
	lists:foreach(
		fun({HostName,_RecsCache}) ->
			TaskName=list_to_atom(lists:flatten(io_lib:format("scada_driver_modbus_updater_~s",[HostName]))),
			cron:remove(TaskName)
		end,
		gb_trees:to_list(PreparedRecsCache)
	),
	normal.



%%%%%%%%%%%%%%%%%%%%%%%
%%% private функции %%%
%%%%%%%%%%%%%%%%%%%%%%%
load_config(Filename) ->
	case file:consult(Filename) of
		{ok,ConfigProps} ->
			TimingsList=proplists:get_value(timings,ConfigProps,[]),
			Devices=proplists:get_value(devices,ConfigProps,[]),
			Timings=lists:foldl(
				fun({HostName,Period,Offset},AccIn) ->
					gb_trees:enter(HostName,{Period,Offset},AccIn)
				end,
				gb_trees:empty(),
				TimingsList
			),
			{Timings,process_devices(Devices)};
		_ ->
			?log_sys(io_lib:format("scada_driver_modbus: cannot load config \'~ts\'~n",[Filename])),
			erlang:error(io_lib:format("scada_driver_modbus: cannot load config \'~ts\'~n",[Filename])) %{gb_trees:empty(),gb_trees:empty()}
	end.

process_devices(Devices) ->
	process_devices(Devices,gb_trees:empty()).

process_devices([],Acc) ->
	Acc;
process_devices([Device|Rest],Acc) ->
	NewAcc=process_device(Device,Acc),
	process_devices(Rest,NewAcc).

process_device({device,DeviceProps},Acc) when is_list(DeviceProps) ->
	DeviceName=proplists:get_value(name,DeviceProps,"Default"),
	Host=proplists:get_value(host,DeviceProps,"127.0.0.1"),
	Port=proplists:get_value(port,DeviceProps,502),
	DeviceAddress=proplists:get_value(address,DeviceProps,0),
	Recs=proplists:get_value(recs,DeviceProps,[]),
	process_recs(Recs,DeviceName,Host,Port,DeviceAddress,Acc);
process_device(_Device,Acc) ->
	Acc.

process_recs(Recs,DeviceName,Host,Port,DeviceAddress,Acc) when is_list(Recs) ->
	process_recs2(Recs,DeviceName,Host,Port,DeviceAddress,Acc);
process_recs(_Recs,_DeviceName,_Host,_Port,_DeviceAddress,Acc) ->
	Acc.

process_recs2([],_DeviceName,_Host,_Port,_DeviceAddress,Acc) ->
	Acc;
process_recs2([Rec|Rest],DeviceName,Host,Port,DeviceAddress,Acc) ->
	NewAcc=process_rec(Rec,DeviceName,Host,Port,DeviceAddress,Acc),
	process_recs2(Rest,DeviceName,Host,Port,DeviceAddress,NewAcc).

process_rec({rec,RecProps},DeviceName,Host,Port,DeviceAddress,Acc) when is_list(RecProps) ->
	RecName=proplists:get_value(name,RecProps,""),
	RegType=proplists:get_value(reg_type,RecProps,hreg),
	RegAddress=proplists:get_value(address,RecProps,1),
	Quantity=proplists:get_value(quantity,RecProps,1),
	DataType=proplists:get_value(data_type,RecProps,int16),
	Timeout=proplists:get_value(timeout,RecProps,1000),
	Delay=proplists:get_value(delay,RecProps,0),
	Priority=proplists:get_value(priority,RecProps,false),
	Key={DeviceName,RecName},
	TaskName=list_to_atom(lists:flatten(["scada_driver_modbus_",DeviceName,"_",RecName,"_updater"])),
	TaskFun=fun(_Arg) ->
		case Delay>0 of
			true ->
				timer:sleep(Delay);
			false ->
				ok
		end,
		ReadRegsResult=read_regs(RegType,Host, Port, DeviceAddress, Timeout, RegAddress,Quantity),
		GetValueFun=case ReadRegsResult of
			{error, _Reason} ->
				fun(Indx) ->
					case Indx of
						{comm,RecName} ->
							0;
						{comm_data,RecName} ->
							lists:flatten(io_lib:format("~w",[_Reason]));
						{data,_AnyIndex} ->
							undefined;
						_ ->
							undefined
					end
				end;
			Data ->
				ConvertedData=convert_data(DataType,RegType,Data),
				fun(Indx) ->
					case Indx of
						{data,{StartIndex,EndIndex}} ->
							values_range(StartIndex,EndIndex,ConvertedData);
						{data,SingleIndex} ->
							case catch(array:get(SingleIndex,ConvertedData)) of
								{'EXIT',_Reason} ->
									undefined;
								FoundValue ->
									FoundValue
							end;
						{comm,RecName} ->
							1;
						{comm_data,RecName} ->
							lists:flatten(io_lib:format("Raw data: ~w, Converted data: ~w",[Data,array:to_list(ConvertedData)]));
						_ ->
							undefined
					end
				end
		end,
		Callbacks=gen_server:call(?MODULE,{get_callbacks,Key}),
		CallbacksList=gb_trees:to_list(Callbacks),
		lists:foreach(
			fun({Index,TagsCallbacks}) ->
				Value=GetValueFun(Index),
				case Value of
					undefined ->
						ok;
					_ ->
						lists:foreach(
							fun({TagName,Callback}) ->
								Callback(TagName,Value)
							end,
							gb_trees:to_list(TagsCallbacks)
						)
				end
			end,
			CallbacksList
		),
		case ReadRegsResult of
			{error, _Reason2} ->
				error;
			_ ->
				ok
		end
	end,
	Rec=#rec{
		task_name=TaskName,
		host=Host,
		port=Port,
		device_address=DeviceAddress,
		timeout=Timeout,
		delay=Delay,
		reg_type=RegType,
		address=RegAddress,
		quantity=Quantity,
		data_type=DataType,
		priority=Priority,
		data=array:new(
			Quantity,
			[
				{fixed,true},
				{default,undefined}
			]
		),
		callbacks=gb_trees:empty(),
		process_fun=TaskFun
	},
	gb_trees:enter(Key,Rec,Acc);
process_rec(_Rec,_DeviceName,_Host,_Port,_DeviceAddress,Acc) ->
	Acc.

permutate_recs(RecsWithPriority,RecsWithoutPriority) ->
	permutate_recs(RecsWithPriority,RecsWithoutPriority,0,0,[]).

permutate_recs(RecsWithPriority,RecsWithoutPriority,IndexWithPriority,IndexWithoutPriority,Acc) ->
	case IndexWithoutPriority>=array:size(RecsWithoutPriority) of
		true ->
			lists:reverse(Acc);
		false ->
			NewIndexWithPriority=case IndexWithPriority>=array:size(RecsWithPriority) of
				true ->
					0;
				false ->
					IndexWithPriority
			end,
			NewAcc=case array:size(RecsWithPriority)>0 of
				true ->
					[array:get(IndexWithoutPriority,RecsWithoutPriority),array:get(NewIndexWithPriority,RecsWithPriority)|Acc];
				false ->
					[array:get(IndexWithoutPriority,RecsWithoutPriority)|Acc]
			end,
			permutate_recs(RecsWithPriority,RecsWithoutPriority,NewIndexWithPriority+1,IndexWithoutPriority+1,NewAcc)
	end.
	


values_range(StartIndex,EndIndex,Data) when StartIndex=<EndIndex ->
	values_range(StartIndex,EndIndex,Data,[]).

values_range(StartIndex,EndIndex,Data,Acc) when StartIndex=<EndIndex ->
	Value=case catch(array:get(EndIndex,Data)) of
		{'EXIT',_Reason} ->
			undefined;
		FoundValue ->
			FoundValue
	end,
	values_range(StartIndex,EndIndex-1,Data,[Value|Acc]);
values_range(_StartIndex,_EndIndex,_Data,Acc) ->
	Acc.




convert_data(bool,coil,Data) ->
	array:from_list(Data,undefined);
convert_data(bool,input,Data) ->
	array:from_list(Data,undefined);
convert_data(bool,ireg,Data) ->
	Array=array:new(length(Data)*16,[{fixed,true},{default,undefined}]),
	{_LastIndex,ConvertedData}=lists:foldl(
		fun(Word,{Index,Acc}) ->
			Acc2=array:set(Index*16+0,bool_to_bit((Word band 16#0001)/=0),Acc),
			Acc3=array:set(Index*16+1,bool_to_bit((Word band 16#0002)/=0),Acc2),
			Acc4=array:set(Index*16+2,bool_to_bit((Word band 16#0004)/=0),Acc3),
			Acc5=array:set(Index*16+3,bool_to_bit((Word band 16#0008)/=0),Acc4),
			Acc6=array:set(Index*16+4,bool_to_bit((Word band 16#0010)/=0),Acc5),
			Acc7=array:set(Index*16+5,bool_to_bit((Word band 16#0020)/=0),Acc6),
			Acc8=array:set(Index*16+6,bool_to_bit((Word band 16#0040)/=0),Acc7),
			Acc9=array:set(Index*16+7,bool_to_bit((Word band 16#0080)/=0),Acc8),
			Acc10=array:set(Index*16+8,bool_to_bit((Word band 16#0100)/=0),Acc9),
			Acc11=array:set(Index*16+9,bool_to_bit((Word band 16#0200)/=0),Acc10),
			Acc12=array:set(Index*16+10,bool_to_bit((Word band 16#0400)/=0),Acc11),
			Acc13=array:set(Index*16+11,bool_to_bit((Word band 16#0800)/=0),Acc12),
			Acc14=array:set(Index*16+12,bool_to_bit((Word band 16#1000)/=0),Acc13),
			Acc15=array:set(Index*16+13,bool_to_bit((Word band 16#2000)/=0),Acc14),
			Acc16=array:set(Index*16+14,bool_to_bit((Word band 16#4000)/=0),Acc15),
			Acc17=array:set(Index*16+15,bool_to_bit((Word band 16#8000)/=0),Acc16),
			{Index+1,Acc17}
		end,
		{0,Array},
		Data
	),
	ConvertedData;
convert_data(bool,hreg,Data) ->
	Array=array:new(length(Data)*16,[{fixed,true},{default,undefined}]),
	{_LastIndex,ConvertedData}=lists:foldl(
		fun(Word,{Index,Acc}) ->
			Acc2=array:set(Index*16+0,bool_to_bit((Word band 16#0001)/=0),Acc),
			Acc3=array:set(Index*16+1,bool_to_bit((Word band 16#0002)/=0),Acc2),
			Acc4=array:set(Index*16+2,bool_to_bit((Word band 16#0004)/=0),Acc3),
			Acc5=array:set(Index*16+3,bool_to_bit((Word band 16#0008)/=0),Acc4),
			Acc6=array:set(Index*16+4,bool_to_bit((Word band 16#0010)/=0),Acc5),
			Acc7=array:set(Index*16+5,bool_to_bit((Word band 16#0020)/=0),Acc6),
			Acc8=array:set(Index*16+6,bool_to_bit((Word band 16#0040)/=0),Acc7),
			Acc9=array:set(Index*16+7,bool_to_bit((Word band 16#0080)/=0),Acc8),
			Acc10=array:set(Index*16+8,bool_to_bit((Word band 16#0100)/=0),Acc9),
			Acc11=array:set(Index*16+9,bool_to_bit((Word band 16#0200)/=0),Acc10),
			Acc12=array:set(Index*16+10,bool_to_bit((Word band 16#0400)/=0),Acc11),
			Acc13=array:set(Index*16+11,bool_to_bit((Word band 16#0800)/=0),Acc12),
			Acc14=array:set(Index*16+12,bool_to_bit((Word band 16#1000)/=0),Acc13),
			Acc15=array:set(Index*16+13,bool_to_bit((Word band 16#2000)/=0),Acc14),
			Acc16=array:set(Index*16+14,bool_to_bit((Word band 16#4000)/=0),Acc15),
			Acc17=array:set(Index*16+15,bool_to_bit((Word band 16#8000)/=0),Acc16),
			{Index+1,Acc17}
		end,
		{0,Array},
		Data
	),
	ConvertedData;
convert_data(int16,ireg,Data) ->
	array:from_list(Data,undefined);
convert_data(int16,hreg,Data) ->
	array:from_list(Data,undefined);
convert_data(sint16,ireg,Data) ->
	Len=length(Data),
	case Len>0 of
		true ->
			Array=array:new(Len,[{fixed,true},{default,undefined}]),
			to_sint16(Data,0,Array);
		false ->
			array:new(1,[{fixed,true},{default,undefined}])
	end;
convert_data(sint16,hreg,Data) ->
	Len=length(Data),
	case Len>0 of
		true ->
			Array=array:new(Len,[{fixed,true},{default,undefined}]),
			to_sint16(Data,0,Array);
		false ->
			array:new(1,[{fixed,true},{default,undefined}])
	end;
convert_data(int32,ireg,Data) ->
	Len=length(Data),
	case Len>1 of
		true ->
			Array=array:new(Len div 2,[{fixed,true},{default,undefined}]),
			case Len rem 2 of
				0 ->
					to_int32(Data,0,Array);
				_ ->
					Array
			end;
		false ->
			array:new(1,[{fixed,true},{default,undefined}])
	end;
convert_data(sint32,ireg,Data) ->
	Len=length(Data),
	case Len>1 of
		true ->
			Array=array:new(Len div 2,[{fixed,true},{default,undefined}]),
			case Len rem 2 of
				0 ->
					to_sint32(Data,0,Array);
				_ ->
					Array
			end;
		false ->
			array:new(1,[{fixed,true},{default,undefined}])
	end;
convert_data(int32,hreg,Data) ->
	Len=length(Data),
	case Len>1 of
		true ->
			Array=array:new(Len div 2,[{fixed,true},{default,undefined}]),
			case Len rem 2 of
				0 ->
					to_int32(Data,0,Array);
				_ ->
					Array
			end;
		false ->
			array:new(1,[{fixed,true},{default,undefined}])
	end;
convert_data(sint32,hreg,Data) ->
	Len=length(Data),
	case Len>1 of
		true ->
			Array=array:new(Len div 2,[{fixed,true},{default,undefined}]),
			case Len rem 2 of
				0 ->
					to_sint32(Data,0,Array);
				_ ->
					Array
			end;
		false ->
			array:new(1,[{fixed,true},{default,undefined}])
	end;
convert_data(float32,ireg,Data) ->
	Len=length(Data),
	case Len>1 of
		true ->
			Array=array:new(Len div 2,[{fixed,true},{default,undefined}]),
			case Len rem 2 of
				0 ->
					to_float32(Data,0,Array);
				_ ->
					Array
			end;
		false ->
			array:new(1,[{fixed,true},{default,undefined}])
	end;
convert_data(float32,hreg,Data) ->
	Len=length(Data),
	case Len>1 of
		true ->
			Array=array:new(Len div 2,[{fixed,true},{default,undefined}]),
			case Len rem 2 of
				0 ->
					to_float32(Data,0,Array);
				_ ->
					Array
			end;
		false ->
			array:new(1,[{fixed,true},{default,undefined}])
	end;
convert_data(_,_,_Data) ->
	array:new(1,[{fixed,true},{default,undefined}]).

to_int32([],_Index,Array) ->
	Array;
to_int32([LowWord,HighWord|Rest],Index,Array) ->
	<<Value:32/unsigned-big-integer>>=list_to_binary([<<LowWord:16/integer,HighWord:16/integer>>]),
	to_int32(Rest,Index+1,array:set(Index,Value,Array)).

to_sint32([],_Index,Array) ->
	Array;
to_sint32([LowWord,HighWord|Rest],Index,Array) ->
	<<Value:32/signed-big-integer>>=list_to_binary([<<LowWord:16/integer,HighWord:16/integer>>]),
	to_int32(Rest,Index+1,array:set(Index,Value,Array)).

to_sint16([],_Index,Array) ->
	Array;
to_sint16([Word|Rest],Index,Array) ->
	<<Value:16/signed-integer>>=list_to_binary([<<Word:16>>]),
	to_sint16(Rest,Index+1,array:set(Index,Value,Array)).

to_float32([],_Index,Array) ->
	Array;
to_float32([HighWord,LowWord|Rest],Index,Array) ->
	Value=case catch(conv_float32(LowWord,HighWord)) of
		{'EXIT',_Reason} ->
			0.0;
		ConvValue ->
			ConvValue
	end,
	to_float32(Rest,Index+1,array:set(Index,Value,Array)).

conv_float32(LowWord,HighWord) ->
	<<Value:32/big-float>>=list_to_binary([<<LowWord:16/integer,HighWord:16/integer>>]),
	Value.

from_int32(Value) ->
	<<LowWord:16/integer,HighWord:16/integer>>=list_to_binary([<<Value:32/unsigned-big-integer>>]),
	[LowWord,HighWord].

from_sint32(Value) ->
	<<LowWord:16/integer,HighWord:16/integer>>=list_to_binary([<<Value:32/signed-big-integer>>]),
	[LowWord,HighWord].

from_float32(Value) ->
	<<LowWord:16/integer,HighWord:16/integer>>=list_to_binary([<<Value:32/big-float>>]),
	[HighWord,LowWord].

% read_regs(_Type, _Host, _Port, _DeviceAddress, _Timeout, _RegAddress, _Quantity,0) ->
% 	{error,repeat_count_exceeded};
% read_regs(Type,Host, Port, DeviceAddress, Timeout, RegAddress,Quantity,N) ->
% 	case read_regs(Type,Host, Port, DeviceAddress, Timeout, RegAddress,Quantity) of
% 		{error,_} ->
% 			read_regs(Type,Host, Port, DeviceAddress, Timeout, RegAddress,Quantity,N-1);
% 		Result ->
% 			Result
% 	end.

read_regs(hreg,Host, Port, DeviceAddress, Timeout, RegAddress,Quantity) ->
	modbus_device:read_hregs( Host, Port, DeviceAddress, Timeout, RegAddress-1,Quantity);
read_regs(coil,Host, Port, DeviceAddress, Timeout, RegAddress,Quantity) ->
	modbus_device:read_coils( Host, Port, DeviceAddress, Timeout, RegAddress-1,Quantity);
read_regs(input,Host, Port, DeviceAddress, Timeout, RegAddress,Quantity) ->
	modbus_device:read_inputs( Host, Port, DeviceAddress, Timeout, RegAddress-1,Quantity);
read_regs(ireg,Host, Port, DeviceAddress, Timeout, RegAddress,Quantity) ->
	modbus_device:read_iregs( Host, Port, DeviceAddress, Timeout, RegAddress-1,Quantity);
read_regs(_,_Host, _Port, _DeviceAddress, _Timeout, _RegAddress,_Quantity) ->
	[].

bool_to_bit(true) ->
	1;
bool_to_bit(false) ->
	0.

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

get_type_and_address([$0|Rest]) ->
	{coil,get_integer(Rest)};
get_type_and_address([$1|Rest]) ->
	{input,get_integer(Rest)};
get_type_and_address([$3|Rest]) ->
	{ireg,get_integer(Rest)};
get_type_and_address([$4|Rest]) ->
	{hreg,get_integer(Rest)};
get_type_and_address(_) ->
	{undefined,-1}.

get_integer(S) ->
	case string:to_integer(S) of
		{error,_Reason} ->
			-1;
		{IntValue,_Rest} ->
			IntValue
	end.

find_address_in_cache(Address,Cache,Config) ->
	case gb_trees:lookup(Address,Cache) of
		{value,FoundValue} ->
			{CachedKey,CachedIndex}=FoundValue,
			{Cache,CachedKey,CachedIndex};
		none ->
			find_address_in_cache(Address,Cache,Config,parse_address(Address))
	end.

find_address_in_cache(Address,Cache,Config,{data,[DeviceName,RegTypeAndAddressWithoutBit,RegTypeAndAddressWithoutBit,"-1"]}) ->
	{RegType,RegAddress}=get_type_and_address(RegTypeAndAddressWithoutBit),
	FoldrFun=fun({{DevName,RecName},Rec},Acc) ->
		RecAddress=Rec#rec.address,
		RecQuantity=Rec#rec.quantity,
		MaxAddress=RecAddress+RecQuantity,
		RecRegType=Rec#rec.reg_type,
		Condition=(DeviceName==DevName) andalso
			(RecRegType==RegType) andalso
			(RecAddress=<RegAddress) andalso
			(MaxAddress>RegAddress)
		,
		case Condition of
			false ->
				Acc;
			true ->
				RecDataType=Rec#rec.data_type,
				FoundIndex=case RecDataType of
					int32 ->
						(RegAddress-RecAddress) div 2;
					sint32 ->
						(RegAddress-RecAddress) div 2;
					float32 ->
						(RegAddress-RecAddress) div 2;
					_ ->	
						RegAddress-RecAddress
				end,
				FoundKey={DevName,RecName},
				{AccCache,_,_}=Acc,
				NewCache=gb_trees:enter(Address,{FoundKey,{data,FoundIndex}},AccCache),
				{NewCache,FoundKey,{data,FoundIndex}}
		end
	end,
	lists:foldr(
		FoldrFun,
		{Cache,undefined,-1},
		gb_trees:to_list(Config)
	);

find_address_in_cache(Address,Cache,Config,{data,[DeviceName,RegTypeAndAddressWithoutBit1,RegTypeAndAddressWithoutBit2,"-1"]}) when RegTypeAndAddressWithoutBit1/=RegTypeAndAddressWithoutBit2 ->
	{RegType1,RegAddress1}=get_type_and_address(RegTypeAndAddressWithoutBit1),
	{RegType2,RegAddress2}=get_type_and_address(RegTypeAndAddressWithoutBit2),
	FoldrFun=fun({{DevName,RecName},Rec},Acc) ->
		RecAddress=Rec#rec.address,
		RecQuantity=Rec#rec.quantity,
		MaxAddress=RecAddress+RecQuantity,
		RecRegType=Rec#rec.reg_type,
		Condition=
			(DeviceName==DevName) andalso
			(RecRegType==RegType1) andalso
			(RecRegType==RegType2) andalso
			(RecAddress=<RegAddress1) andalso
			(RecAddress=<RegAddress2) andalso
			(MaxAddress>RegAddress1) andalso
			(MaxAddress>RegAddress2),
		case Condition of
			false ->
				Acc;
			true ->
				RecDataType=Rec#rec.data_type,
				FoundIndex=case RecDataType of
					int32 ->
						{(RegAddress1-RecAddress) div 2,(RegAddress2-RecAddress) div 2};
					sint32 ->
						{(RegAddress1-RecAddress) div 2,(RegAddress2-RecAddress) div 2};
					float32 ->
						{(RegAddress1-RecAddress) div 2,(RegAddress2-RecAddress) div 2};
					_ ->	
						{RegAddress1-RecAddress,RegAddress2-RecAddress}
				end,
				FoundKey={DevName,RecName},
				{AccCache,_,_}=Acc,
				NewCache=gb_trees:enter(Address,{FoundKey,{data,FoundIndex}},AccCache),
				{NewCache,FoundKey,{data,FoundIndex}}
		end
	end,
	lists:foldr(
		FoldrFun,
		{Cache,undefined,-1},
		gb_trees:to_list(Config)
	);

find_address_in_cache(Address,Cache,Config,{data,[DeviceName,RegTypeAndAddress,RegTypeAndAddress,BitAddress]}) ->
	{RegType,RegAddress}=get_type_and_address(RegTypeAndAddress),
	BitIndex=get_integer(BitAddress),
	FoldrFun=fun({{DevName,RecName},Rec},Acc) ->
		RecAddress=Rec#rec.address,
		RecQuantity=Rec#rec.quantity,
		MaxAddress=RecAddress+RecQuantity,
		RecRegType=Rec#rec.reg_type,
		RecDataType=Rec#rec.data_type,
		Condition=
			(
				(BitIndex>=0) orelse
				(BitIndex<16)
			) andalso
			(DeviceName==DevName) andalso
			(RecDataType==bool) andalso
			(
				(RecRegType==ireg) orelse
				(RecRegType==hreg)
			) andalso
			(RecRegType==RegType) andalso
			(RecAddress=<RegAddress) andalso
			(MaxAddress>RegAddress),
		case Condition of
			false ->
				Acc;
			true ->
				FoundIndex=(RegAddress-Rec#rec.address)*16+BitIndex,
				FoundKey={DevName,RecName},
				{AccCache,_IgnoreKey,_IgnoreIndex}=Acc,
				NewCache=gb_trees:enter(Address,{FoundKey,{data,FoundIndex}},AccCache),
				{NewCache,FoundKey,{data,FoundIndex}}
		end
	end,
	lists:foldr(
		FoldrFun,
		{Cache,undefined,-1},
		gb_trees:to_list(Config)
	);

find_address_in_cache(Address,Cache,Config,{comm,RecordName}) ->
	FoldrFun=fun({{DevName,RecName},_Rec},Acc) ->
		case RecName==RecordName of
			false ->
				Acc;
			true ->
				FoundIndex=RecName,
				FoundKey={DevName,RecName},
				{AccCache,_IgnoreKey,_IgnoreIndex}=Acc,
				NewCache=gb_trees:enter(Address,{FoundKey,{comm,FoundIndex}},AccCache),
				{NewCache,FoundKey,{comm,FoundIndex}}
		end
	end,
	lists:foldr(
		FoldrFun,
		{Cache,undefined,-1},
		gb_trees:to_list(Config)
	);
find_address_in_cache(Address,Cache,Config,{comm_data,RecordName}) ->
	FoldrFun=fun({{DevName,RecName},_Rec},Acc) ->
		case RecName==RecordName of
			false ->
				Acc;
			true ->
				FoundIndex=RecName,
				FoundKey={DevName,RecName},
				{AccCache,_IgnoreKey,_IgnoreIndex}=Acc,
				NewCache=gb_trees:enter(Address,{FoundKey,{comm,FoundIndex}},AccCache),
				{NewCache,FoundKey,{comm_data,FoundIndex}}
		end
	end,
	lists:foldr(
		FoldrFun,
		{Cache,undefined,-1},
		gb_trees:to_list(Config)
	);
find_address_in_cache(_Address,Cache,_Config,UndefinedAddressPattern) ->
	?log_sys(io_lib:format("scada_driver_modbus: undefined address pattern \'~p\'~n",[UndefinedAddressPattern])),
	{Cache,undefined,-1}.

repeat(0,_Fun) ->
	error;
repeat(N,Fun) ->
	case Fun() of
		ok ->
			ok;
		_Other ->
			repeat(N-1,Fun)
	end.

parse_address(Address) ->
	case tokens(Address,":") of
		["$COMM",RecName] ->
			{comm,RecName};
		["$COMM_DATA",RecName] ->
			{comm_data,RecName};
		[DeviceName,RegTypeAndAddress] ->
			case tokens(RegTypeAndAddress,".") of
					[RegTypeAndAddressWithoutBit,BitAddress] ->
						{data,[DeviceName,RegTypeAndAddressWithoutBit,RegTypeAndAddressWithoutBit,BitAddress]};
					_ ->
						{data,[DeviceName,RegTypeAndAddress,RegTypeAndAddress,"-1"]}
			end;
		[DeviceName,RegTypeAndAddress1,RegTypeAndAddress2] ->
			{data,[DeviceName,RegTypeAndAddress1,RegTypeAndAddress2,"-1"]};
		_ ->
			{undefined,Address}
	end.
