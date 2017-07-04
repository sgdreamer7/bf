%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @author Владимир Щербина <vns.scherbina@gmail.com>
%% @copyright 2017
%% @version 1.1.0
%% @doc Модуль <b>{@module}</b> реализует функции высокоуровневой обработки протокола Modbus/TCP.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
-module(modbus_device).

-behaviour(gen_server).

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
		read_coils/6,
		read_inputs/6,
		read_hregs/6,
		read_iregs/6,
		write_coil/6,
		write_coils/6,
		write_hregs/6,
		write_hreg_bit/7
	]
).

-include("logs.hrl").

-define(OPCODE_READ_COILS,    	16#01).
-define(OPCODE_READ_INPUTS,   	16#02).
-define(OPCODE_READ_HREGS,    	16#03).
-define(OPCODE_READ_IREGS,    	16#04).
-define(OPCODE_WRITE_COIL,    	16#05).
-define(OPCODE_WRITE_HREG,    	16#06).
-define(OPCODE_WRITE_COILS,   	16#0f).
-define(OPCODE_WRITE_HREGS,   	16#10).
-define(OPCODE_WRITE_HREG_MASK,	16#16).

-record(rtu_req, { address, function_code, start, data, timeout }).
-record(tcp_req, { tid, rtu_req, from, ts }).
-record(state, { host, port, socket, reqs, tid }).

-define(CRC16Def,[16#0000, 16#C0C1, 16#C181, 16#0140, 16#C301,  
16#03C0, 16#0280, 16#C241,
                    16#C601, 16#06C0, 16#0780, 16#C741, 16#0500,  
16#C5C1, 16#C481, 16#0440,
                    16#CC01, 16#0CC0, 16#0D80, 16#CD41, 16#0F00,  
16#CFC1, 16#CE81, 16#0E40,
                    16#0A00, 16#CAC1, 16#CB81, 16#0B40, 16#C901,  
16#09C0, 16#0880, 16#C841,
                    16#D801, 16#18C0, 16#1980, 16#D941, 16#1B00,  
16#DBC1, 16#DA81, 16#1A40,
                    16#1E00, 16#DEC1, 16#DF81, 16#1F40, 16#DD01,  
16#1DC0, 16#1C80, 16#DC41,
                    16#1400, 16#D4C1, 16#D581, 16#1540, 16#D701,  
16#17C0, 16#1680, 16#D641,
                    16#D201, 16#12C0, 16#1380, 16#D341, 16#1100,  
16#D1C1, 16#D081, 16#1040,
                    16#F001, 16#30C0, 16#3180, 16#F141, 16#3300,  
16#F3C1, 16#F281, 16#3240,
                    16#3600, 16#F6C1, 16#F781, 16#3740, 16#F501,  
16#35C0, 16#3480, 16#F441,
                    16#3C00, 16#FCC1, 16#FD81, 16#3D40, 16#FF01,  
16#3FC0, 16#3E80, 16#FE41,
                    16#FA01, 16#3AC0, 16#3B80, 16#FB41, 16#3900,  
16#F9C1, 16#F881, 16#3840,
                    16#2800, 16#E8C1, 16#E981, 16#2940, 16#EB01,  
16#2BC0, 16#2A80, 16#EA41,
                    16#EE01, 16#2EC0, 16#2F80, 16#EF41, 16#2D00,  
16#EDC1, 16#EC81, 16#2C40,
                    16#E401, 16#24C0, 16#2580, 16#E541, 16#2700,  
16#E7C1, 16#E681, 16#2640,
                    16#2200, 16#E2C1, 16#E381, 16#2340, 16#E101,  
16#21C0, 16#2080, 16#E041,
                    16#A001, 16#60C0, 16#6180, 16#A141, 16#6300,  
16#A3C1, 16#A281, 16#6240,
                    16#6600, 16#A6C1, 16#A781, 16#6740, 16#A501,  
16#65C0, 16#6480, 16#A441,
                    16#6C00, 16#ACC1, 16#AD81, 16#6D40, 16#AF01,  
16#6FC0, 16#6E80, 16#AE41,
                    16#AA01, 16#6AC0, 16#6B80, 16#AB41, 16#6900,  
16#A9C1, 16#A881, 16#6840,
                    16#7800, 16#B8C1, 16#B981, 16#7940, 16#BB01,  
16#7BC0, 16#7A80, 16#BA41,
                    16#BE01, 16#7EC0, 16#7F80, 16#BF41, 16#7D00,  
16#BDC1, 16#BC81, 16#7C40,
                    16#B401, 16#74C0, 16#7580, 16#B541, 16#7700,  
16#B7C1, 16#B681, 16#7640,
                    16#7200, 16#B2C1, 16#B381, 16#7340, 16#B101,  
16#71C0, 16#7080, 16#B041,
                    16#5000, 16#90C1, 16#9181, 16#5140, 16#9301,  
16#53C0, 16#5280, 16#9241,
                    16#9601, 16#56C0, 16#5780, 16#9741, 16#5500,  
16#95C1, 16#9481, 16#5440,
                    16#9C01, 16#5CC0, 16#5D80, 16#9D41, 16#5F00,  
16#9FC1, 16#9E81, 16#5E40,
                    16#5A00, 16#9AC1, 16#9B81, 16#5B40, 16#9901,  
16#59C0, 16#5880, 16#9841,
                    16#8801, 16#48C0, 16#4980, 16#8941, 16#4B00,  
16#8BC1, 16#8A81, 16#4A40,
                    16#4E00, 16#8EC1, 16#8F81, 16#4F40, 16#8D01,  
16#4DC0, 16#4C80, 16#8C41,
                    16#4400, 16#84C1, 16#8581, 16#4540, 16#8701,  
16#47C0, 16#4680, 16#8641,
                    16#8201, 16#42C0, 16#4380, 16#8341, 16#4100,  
16#81C1, 16#8081, 16#4040]).

%%%%%%%%%%%%%%%%%%%%%%
%%% public функции %%%
%%%%%%%%%%%%%%%%%%%%%%

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Host,Port,DeviceAddr,Timeout,Offset,Count) -> list() 
%% @doc <i>Чтение блока регистров 0x</i>
%% <p>
%% <b>Host</b> - IP адрес устройства;<br/>
%% <b>Port</b> - TCP порт устройства;<br/>
%% <b>DeviceAddr</b> - Modbus адрес устройства;<br/>
%% <b>Timeout</b> - таймаут соединения в миллисекундах;<br/>
%% <b>Offset</b> - адрес начала блока регистров;<br/>
%% <b>Count</b> - количество регистров в блоке.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
read_coils(Host,Port,DeviceAddr,Timeout,Offset,Count) ->
	Opcode=?OPCODE_READ_COILS,
	ProcessFun=fun bytes_to_bit_list/2,
	read_data(Host,Port,DeviceAddr,Timeout,Offset,Count,Opcode,ProcessFun).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Host,Port,DeviceAddr,Timeout,Offset,Count) -> list()
%% @doc <i>Чтение блока регистров 1x</i>
%% <p>
%% <b>Host</b> - IP адрес устройства;<br/>
%% <b>Port</b> - TCP порт устройства;<br/>
%% <b>DeviceAddr</b> - Modbus адрес устройства;<br/>
%% <b>Timeout</b> - таймаут соединения в миллисекундах;<br/>
%% <b>Offset</b> - адрес начала блока регистров;<br/>
%% <b>Count</b> - количество регистров в блоке.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
read_inputs(Host,Port,DeviceAddr,Timeout,Offset,Count) ->
	Opcode=?OPCODE_READ_INPUTS,
	ProcessFun=fun bytes_to_bit_list/2,
	read_data(Host,Port,DeviceAddr,Timeout,Offset,Count,Opcode,ProcessFun).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Host,Port,DeviceAddr,Timeout, Offset,Count) -> list()
%% @doc <i>Чтение блока регистров 3x</i>
%% <p>
%% <b>Host</b> - IP адрес устройства;<br/>
%% <b>Port</b> - TCP порт устройства;<br/>
%% <b>DeviceAddr</b> - Modbus адрес устройства;<br/>
%% <b>Timeout</b> - таймаут соединения в миллисекундах;<br/>
%% <b>Offset</b> - адрес начала блока регистров;<br/>
%% <b>Count</b> - количество регистров в блоке.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
read_iregs(Host,Port,DeviceAddr,Timeout,Offset,Count) ->
	Opcode=?OPCODE_READ_IREGS,
	ProcessFun=fun bytes_to_words/2,
	read_data(Host,Port,DeviceAddr,Timeout,Offset,Count,Opcode,ProcessFun).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Host,Port,DeviceAddr,Timeout, Offset,Count) -> list()
%% @doc <i>Чтение блока регистров 4x</i>
%% <p>
%% <b>Host</b> - IP адрес устройства;<br/>
%% <b>Port</b> - TCP порт устройства;<br/>
%% <b>DeviceAddr</b> - Modbus адрес устройства;<br/>
%% <b>Timeout</b> - таймаут соединения в миллисекундах;<br/>
%% <b>Offset</b> - адрес начала блока регистров;<br/>
%% <b>Count</b> - количество регистров в блоке.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
read_hregs(Host,Port,DeviceAddr,Timeout, Offset,Count) ->
	Opcode=?OPCODE_READ_HREGS,
	ProcessFun=fun bytes_to_words/2,
	read_data(Host,Port,DeviceAddr,Timeout,Offset,Count,Opcode,ProcessFun).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Host,Port,DeviceAddr,Timeout, Offset,Coil) -> list()
%% @doc <i>Запись регистра 0x</i>
%% <p>
%% <b>Host</b> - IP адрес устройства;<br/>
%% <b>Port</b> - TCP порт устройства;<br/>
%% <b>DeviceAddr</b> - Modbus адрес устройства;<br/>
%% <b>Timeout</b> - таймаут соединения в миллисекундах;<br/>
%% <b>Offset</b> - адрес регистра;<br/>
%% <b>Coil</b> - значение регистра.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
write_coil(Host,Port,DeviceAddr,Timeout,Offset,Coil) ->
	Opcode=?OPCODE_WRITE_COIL,
	write_data(Host,Port,DeviceAddr,Timeout,Offset,Coil,Opcode).


%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Host,Port,DeviceAddr,Timeout, Offset,Coils) -> list()
%% @doc <i>Запись блока регистров 0x</i>
%% <p>
%% <b>Host</b> - IP адрес устройства;<br/>
%% <b>Port</b> - TCP порт устройства;<br/>
%% <b>DeviceAddr</b> - Modbus адрес устройства;<br/>
%% <b>Timeout</b> - таймаут соединения в миллисекундах;<br/>
%% <b>Offset</b> - адрес начала блока регистров;<br/>
%% <b>Coils</b> - значение регистров.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
write_coils(Host,Port,DeviceAddr,Timeout,Offset,Coils) ->
	Opcode=?OPCODE_WRITE_COILS,
	write_data(Host,Port,DeviceAddr,Timeout,Offset,Coils,Opcode).


%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Host,Port,DeviceAddr,Timeout, Offset,Values) -> list()
%% @doc <i>Запись блока регистров 4x</i>
%% <p>
%% <b>Host</b> - IP адрес устройства;<br/>
%% <b>Port</b> - TCP порт устройства;<br/>
%% <b>DeviceAddr</b> - Modbus адрес устройства;<br/>
%% <b>Timeout</b> - таймаут соединения в миллисекундах;<br/>
%% <b>Offset</b> - адрес начала блока регистров;<br/>
%% <b>Values</b> - значение регистров.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
write_hregs(Host,Port,DeviceAddr,Timeout, Offset,[Value]) ->
	Opcode=?OPCODE_WRITE_HREG,
	write_data(Host,Port,DeviceAddr,Timeout,Offset,Value,Opcode);
write_hregs(Host,Port,DeviceAddr,Timeout, Offset,Values) ->
	Opcode=?OPCODE_WRITE_HREGS,
	write_data(Host,Port,DeviceAddr,Timeout,Offset,Values,Opcode).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Host,Port,DeviceAddr,Timeout, RegisterOffset,BitOffset,BitValue) -> list()
%% @doc <i>Запись бита в регистре 4x</i>
%% <p>
%% <b>Host</b> - IP адрес устройства;<br/>
%% <b>Port</b> - TCP порт устройства;<br/>
%% <b>DeviceAddr</b> - Modbus адрес устройства;<br/>
%% <b>Timeout</b> - таймаут соединения в миллисекундах;<br/>
%% <b>RegisterOffset</b> - адрес регистра;<br/>
%% <b>BitOffset</b> - адрес бита;<br/>
%% <b>Values</b> - значение бита.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
write_hreg_bit(Host,Port,DeviceAddr,Timeout, RegisterOffset,BitOffset,BitValue) ->
	Opcode=?OPCODE_WRITE_HREG_MASK,
	Value=case BitValue of
		0 ->
			[16#FFFF-(1 bsl BitOffset),0];
		1 ->
			[16#FFFF-(1 bsl BitOffset),1 bsl BitOffset]
	end,
	write_data(Host,Port,DeviceAddr,Timeout,RegisterOffset,Value,Opcode).

%%%%%%%%%%%%%%%%%%%%%%%%%%
%%% gen_server функции %%%
%%%%%%%%%%%%%%%%%%%%%%%%%%

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%% @spec (Options::list) -> {ok,State}
%% @doc Функция инициализации при запуске gen_server.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
init({Host,Port}) ->
	erlang:process_flag(trap_exit,true),
	State = #state{host=Host,port=Port,reqs=gb_trees:empty(),socket=undefined},
	NewState=open_connection(State),
	{ok,NewState}.

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
%% @spec ({send,Request},From,State) -> ok
%% @doc Callback функция для gen_server:call().
%% Для отправки запроса.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% 
handle_call({send,Request},From,OldState) ->
	State=check_state_for_old_reqs(OldState),
	NewTid=check_tid(State#state.tid),
	TheRequest=#tcp_req{tid=NewTid,rtu_req=Request,from=From,ts=now()},
	Message=build_req_message(TheRequest),
	Reqs=State#state.reqs,
	case State#state.socket of
		undefined ->
			NewState=open_connection(State),			
			{reply,{error,connection_closed},NewState};
		_ ->
			NewState=State#state{reqs=gb_trees:enter(NewTid,TheRequest,Reqs),tid=NewTid},
			case catch(gen_tcp:send(State#state.socket,Message)) of
				ok ->
					{noreply,NewState};
				{error,closed} ->
					NewState2=open_connection(NewState),			
					{reply,{error,connection_closed},NewState2};
				Other ->
					{reply,Other,NewState}
			end
	end.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%% @spec (_Info,State) -> ok
%% @doc Callback функция при получении сообщений gen_server.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
handle_info({'EXIT',_},State) ->
	{stop,normal,State};


%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%% @spec (_Info,State) -> ok
%% @doc Callback функция при получении сообщений gen_server.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
handle_info({tcp,_Socket,Message},State) ->
	NewState=case Message of
		[TidHigh,TidLow,0,0,0,_TcpSizeLow|RTU] ->
			Tid=(TidHigh bsl 8)+TidLow,
			Reqs=State#state.reqs,
			case gb_trees:lookup(Tid,Reqs) of
				none ->
					% io:format("unknown tid received: ~p~n",[Message]),
					State; %{error,unknown_tid_received};
				{value,Req} ->
					SourceRequest=Req#tcp_req.rtu_req,
					OrigAddress = SourceRequest#rtu_req.address,	
					OrigCode = SourceRequest#rtu_req.function_code,
					BadCode = OrigCode + 128,
					Reply=case RTU of
						[OrigAddress,OrigCode|ResponseData] ->
							{SizeOfData,DataBytes}=case OrigCode of
								?OPCODE_READ_COILS -> [Size|Data]=ResponseData,{Size,Data};
								?OPCODE_READ_INPUTS -> [Size|Data]=ResponseData,{Size,Data};
								?OPCODE_READ_HREGS -> [Size|Data]=ResponseData,{Size,Data};
								?OPCODE_READ_IREGS -> [Size|Data]=ResponseData,{Size,Data};
								?OPCODE_WRITE_COIL -> {0,[]};
								?OPCODE_WRITE_HREG -> {0,[]};
								?OPCODE_WRITE_COILS -> {0,[]};
								?OPCODE_WRITE_HREGS -> {0,[]};
								?OPCODE_WRITE_HREG_MASK -> {0,[]};
								_ -> {0,[]}
							end,
							case SizeOfData>0 of
								true ->
									{ok,DataBytes};
								false ->
									{ok,no_data}
							end;
						[OrigAddress,BadCode,ErrorCode|_] ->
							% io:format("Message: ~p~n",[Message]),
							case ErrorCode of
								1 -> {error,illegal_function};
								2 -> {error,illegal_data_address};
								3 -> {error,illegal_data_value};
								4 -> {error,slave_device_failure};
								5 -> {error,acknowledge};
								6 -> {error,slave_device_busy};
								8 -> {error,memory_parity_error};
								10 -> {error,gateway_path_unavailable};
								11 -> {error,gateway_target_device_failed_to_respond};
								_ -> {error,unknown_response_code}
							end;
						_JunkResponse ->
							io:format("Message: ~p~n",[Message]),
							io:format("Junk response: ~p~n",[_JunkResponse]),
							{error,junk_response}
					end,
					gen_server:reply(Req#tcp_req.from,Reply),
					NewReqs=gb_trees:delete_any(Tid,Reqs),
					State#state{reqs=NewReqs}
			end;
		_JunkMessage ->
			io:format("junk message received: ~p~n",[_JunkMessage]),
			State %{error,junk_message}
	end,
	{noreply,NewState};

handle_info({tcp_closed,_Socket},State) ->
	NewState=open_connection(State),
	{noreply,NewState};

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%% @spec (_Info,State) -> ok
%% @doc Callback функция при получении сообщений gen_server.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
handle_info(Other,State) ->
	?log_sys(io_lib:format("~p: Unknown message ~p~n",[?MODULE,Other])),
	{noreply,State}.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%% @spec (_OldVsn,State,_Extra) -> {ok,State}
%% @doc Callback функция для обновление состояния gen_server во время смены кода.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
code_change(_OldVsn,State,_Extra) ->
	{ok,State}.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%% @spec (_Reason,_State) -> ok
%% @doc Callback функция при завершение работы gen_server.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
terminate(_Reason,State) ->
	(catch gen_tcp:close(State#state.socket)),
	normal.


%%%%%%%%%%%%%%%%%%%%%%%
%%% private функции %%%
%%%%%%%%%%%%%%%%%%%%%%%
open_connection(State) ->
	% io:format("Opening connection to ~p~n",[State#state.host]),
	Socket=case catch(gen_tcp:connect(State#state.host,State#state.port,[{active,true},{packet,0}],1000)) of
		{ok,S} ->
			S;
		_Other ->
			undefined
	end,
	State#state{socket=Socket,reqs=gb_trees:empty(),tid=0}.

print_req(Host,#rtu_req{address=DeviceAddr,function_code=Opcode,start=Offset,data=Count},Error) ->
	{Direction,Addresses}=case Opcode of
		?OPCODE_READ_COILS -> {"Read",lists:flatten(io_lib:format("0x~5..0w-0x~5..0w",[Offset+1,Offset+Count]))};
		?OPCODE_READ_INPUTS -> {"Read",lists:flatten(io_lib:format("1x~5..0w-1x~5..0w",[Offset+1,Offset+Count]))};
		?OPCODE_READ_HREGS -> {"Read",lists:flatten(io_lib:format("4x~5..0w-4x~5..0w",[Offset+1,Offset+Count]))};
		?OPCODE_READ_IREGS -> {"Read",lists:flatten(io_lib:format("3x~5..0w-3x~5..0w",[Offset+1,Offset+Count]))};
		?OPCODE_WRITE_COIL -> {"Write",lists:flatten(io_lib:format("0x~5..0w",[Offset+1]))};
		?OPCODE_WRITE_HREG -> {"Write",lists:flatten(io_lib:format("4x~5..0w",[Offset+1]))};
		?OPCODE_WRITE_COILS -> {"Write",lists:flatten(io_lib:format("0x~5..0w-0x~5..0w",[Offset+1,Offset+length(Count)]))};
		?OPCODE_WRITE_HREGS -> {"Write",lists:flatten(io_lib:format("4x~5..0w-4x~5..0w",[Offset+1,Offset+length(Count)]))};
		_ -> {"-",""}
	end,
	case Host=="MPK1" of
		true->
			case Error of
				{error,connection_closed} ->
					ok;
				_ ->
					io:format("~p: Host: ~s, Device: ~3..0w, ~s: ~s, ~p~n",[calendar:local_time(),Host,DeviceAddr,Direction,Addresses,Error])
			end;
		false ->
			ok
	end.

read_data(Host,Port,DeviceAddr,Timeout,Offset,Count,Opcode,ProcessFun) ->
	Request = #rtu_req{address=DeviceAddr,function_code=Opcode,start=Offset,data=Count,timeout=Timeout},
	ConnectionName=list_to_atom(lists:flatten(io_lib:format("modbus_device_connection_~s_~p_read",[Host,Port]))),
	case whereis(ConnectionName) of
		undefined ->
			_ConnectionStartResult=(catch gen_server:start({local,ConnectionName},?MODULE,{Host,Port},[]));
		_ ->
			ok
	end,
	case catch(gen_server:call(ConnectionName,{send,Request},Timeout)) of
		{'EXIT',ExitReason} ->
			print_req(Host,Request,{'EXIT',ExitReason}),
			{error,ExitReason};
		{ok,no_data} ->
			[];
		{ok,Data} ->
			ProcessFun(Data,Count);
		{error,_CommError}=Error ->
			print_req(Host,Request,Error),
			Error;
		Other ->
			print_req(Host,Request,Other),
			Other
	end.

write_data(Host,Port,DeviceAddr,Timeout,Offset,Data,Opcode) ->
	Request = #rtu_req{address=DeviceAddr,function_code=Opcode,start=Offset,data=Data,timeout=Timeout},
	ConnectionName=list_to_atom(lists:flatten(io_lib:format("modbus_device_connection_~s_~p_write",[Host,Port]))),
	case whereis(ConnectionName) of
		undefined ->
			_ConnectionStartResult=(catch gen_server:start({local,ConnectionName},?MODULE,{Host,Port},[]));
		_ ->
			ok
	end,
	case catch(gen_server:call(ConnectionName,{send,Request},Timeout)) of
		{'EXIT',ExitReason} ->
			print_req(Host,Request,{'EXIT',ExitReason}),
			{error,ExitReason};
		{ok,no_data} ->
			ok;
		{ok,_Data} ->
			ok;
		{error,_CommError}=Error ->
			print_req(Host,Request,Error),
			Error;
		Other ->
			print_req(Host,Request,Other),
			{error,write}
	end.

check_state_for_old_reqs(OldState) ->
	Reqs=OldState#state.reqs,
	CurrentTS=now(),
	NewReqs=lists:foldl(
		fun({Tid,Req},AccIn) ->
			case timer:now_diff(CurrentTS,Req#tcp_req.ts)<Req#tcp_req.rtu_req#rtu_req.timeout*1000*2 of
				true ->
					gb_trees:enter(Tid,Req,AccIn);
				false ->
					print_req("",Req#tcp_req.rtu_req,"Removing request"),
					AccIn
			end
		end,
		gb_trees:empty(),
		gb_trees:to_list(Reqs)
	),
	OldState#state{reqs=NewReqs}.

bytes_to_words(Bytes,_Count) when (length(Bytes) rem 2)==0 ->
	bytes_to_words2(Bytes,[]);
bytes_to_words(_Bytes,_Count) ->
	[].


bytes_to_words2([],Acc)->
	Acc;  
bytes_to_words2(Bytes,Acc) ->
	Tail = lists:nthtail(2,Bytes),
	Value = lists:nth(1,Bytes) * 256 + lists:nth(2,Bytes),
	bytes_to_words2(Tail,Acc ++ [Value]).


bytes_to_bit_list(Data,Count) ->
	bytes_to_bit_list(list_to_binary(Data),Count,[]).

bytes_to_bit_list(_Data,0,Acc) ->
	Acc;
bytes_to_bit_list(Data,Count,Acc) ->
	BitPos=Count-1,
	Byte=binary:at(Data,BitPos div 8),
	Mask=16#01 bsl (BitPos rem 8),
	B=case (Byte band Mask) of
		16#00 ->
			0;
		_ ->
			1
	end,
	bytes_to_bit_list(Data,BitPos,[B|Acc]).

check_tid(TID) ->
	case TID<16#ffff of
		true ->
			TID+1;
		false ->
			1
	end.

build_req_message(Request) when is_record(Request,tcp_req) ->
	RtuRequest = Request#tcp_req.rtu_req,
	TID = Request#tcp_req.tid,
	RtuRequestMessage = build_req_message(RtuRequest),
	case RtuRequestMessage of
		function_not_implemented -> erlang:error(function_not_implemented);
		_ ->
			RtuRequestMessageAsList = binary_to_list(RtuRequestMessage),
			{RtuRequestMessageNoChecksum,_Checksum} = lists:split(length(RtuRequestMessageAsList)-2,RtuRequestMessageAsList),

			RtuReq = list_to_binary(RtuRequestMessageNoChecksum),

			RtuRequestSize = size(RtuReq),
			
			<<TID:16,0,0,RtuRequestSize:16,RtuReq/binary>>
	end;

build_req_message(Request) when is_record(Request,rtu_req) ->
	Message = case Request#rtu_req.function_code of 
		?OPCODE_READ_COILS ->
			<<(Request#rtu_req.address):8,(Request#rtu_req.function_code):8,(Request#rtu_req.start):16,(Request#rtu_req.data):16>>;
		?OPCODE_READ_INPUTS ->
			<<(Request#rtu_req.address):8,(Request#rtu_req.function_code):8,(Request#rtu_req.start):16,(Request#rtu_req.data):16>>;
		?OPCODE_READ_HREGS ->
			<<(Request#rtu_req.address):8,(Request#rtu_req.function_code):8,(Request#rtu_req.start):16,(Request#rtu_req.data):16>>; 
		?OPCODE_READ_IREGS ->
			<<(Request#rtu_req.address):8,(Request#rtu_req.function_code):8,(Request#rtu_req.start):16,(Request#rtu_req.data):16>>;
		?OPCODE_WRITE_COIL ->
			ValuesBin=case Request#rtu_req.data of
				1 ->
					<<16#ff,16#00>>;
				_ ->
					<<16#00,16#00>>
			end,
			<<(Request#rtu_req.address):8,(Request#rtu_req.function_code):8,(Request#rtu_req.start):16,ValuesBin/binary>>;
		?OPCODE_WRITE_COILS ->
			Quantity = length(Request#rtu_req.data),
			ValuesBin = list_bit_to_binary(Request#rtu_req.data),
			ByteCount = length(binary_to_list(ValuesBin)),
			<<(Request#rtu_req.address):8,(Request#rtu_req.function_code):8,(Request#rtu_req.start):16,Quantity:16,ByteCount:8,ValuesBin/binary>>;
		?OPCODE_WRITE_HREG ->
			ValueBin = list_word16_to_binary([Request#rtu_req.data]),
			<<(Request#rtu_req.address):8,(Request#rtu_req.function_code):8,(Request#rtu_req.start):16,ValueBin/binary>>;
		?OPCODE_WRITE_HREGS ->
			Quantity = length(Request#rtu_req.data),
			ValuesBin = list_word16_to_binary(Request#rtu_req.data),
			ByteCount = length(binary_to_list(ValuesBin)),
			<<(Request#rtu_req.address):8,(Request#rtu_req.function_code):8,(Request#rtu_req.start):16,Quantity:16,ByteCount:8,ValuesBin/binary>>;
		?OPCODE_WRITE_HREG_MASK ->
			ValuesBin = list_word16_to_binary(Request#rtu_req.data),
			<<(Request#rtu_req.address):8,(Request#rtu_req.function_code):8,(Request#rtu_req.start):16,ValuesBin/binary>>;
		_ ->
			erlang:error(function_not_implemented)
	end,
	Checksum = checksum(Message),
	<<Message/binary,Checksum/binary>>.

list_bit_to_binary(Values)  when is_list(Values) ->
	L=length(Values),
	AlignedValues=case L rem 8 of
		0 ->
			Values;
		Remainder ->
			Values++[0 || _ <- lists:seq(1,8-Remainder)]
	end,
	list_to_binary(
		bit_as_bytes(AlignedValues)		
	).

bit_as_bytes(L) when is_list(L) ->
	bit_as_bytes(L,[]).

bit_as_bytes([],Res) ->
	lists:reverse(Res);
bit_as_bytes([B0,B1,B2,B3,B4,B5,B6,B7|Rest],Res) ->
	bit_as_bytes(Rest,[<<B7:1,B6:1,B5:1,B4:1,B3:1,B2:1,B1:1,B0:1>>|Res]).
  
list_word16_to_binary(Values) when is_list(Values) ->
	list_to_binary(
		lists:map(
			fun(X) ->
				RoundedValue=round(X),
				<<RoundedValue:16>>
			end,
			Values
		)
	).
	
checksum(Data) when is_binary(Data)->
	list_to_binary(checksum(binary_to_list(Data)));
checksum(Data) when is_list(Data) ->
	Value = calc(Data),
	[Value rem 256,Value div 256].

calc(List) ->
   calc(List,16#FFFF).
calc(<<>>,CRC) ->
   CRC;
calc([],CRC) ->
   CRC;
calc(<<Value:8,Rest/binary>>,CRC) when Value =< 255->
   Index = (CRC bxor Value) band 255,
   NewCRC = (CRC bsr 8) bxor crc_index(Index),
   calc(Rest,NewCRC);
calc([Value|Rest],CRC) when Value =< 255->
   Index = (CRC bxor Value) band 255,
   NewCRC = (CRC bsr 8) bxor crc_index(Index),
   calc(Rest,NewCRC).

crc_index(N) ->
   lists:nth(N+1,?CRC16Def).
