%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @author Владимир Щербина <vns.scherbina@gmail.com>
%% @copyright 2017
%% @version 1.1.0
%% @doc Модуль <b>{@module}</b> реализует доступ к базам данных Microsoft SQL Server.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
-module(scada_db_mssql).
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
		create_table/1,
		insert_data/1,
		insert_data/2,
		get_data/1,
		delete_data/1,
		update_data/1,
		update_data/2
	]
).

-record(conn_state,{
	dsn="",
	uid="",
	pwd="",
	conn=undefined,
	conn2=undefined
}).

-include("logs.hrl").

%%%%%%%%%%%%%%%%%%%%%%
%%% public функции %%%
%%%%%%%%%%%%%%%%%%%%%%

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Request) -> ok | {error,Reason}
%% @doc <i>Создание таблицы баз данных</i>
%% <p>
%% <b>Request</b> - Запрос на создание таблицы баз данных.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
create_table(Request) ->
	SQLRequest=build_create_table_request(Request),
	case catch(gen_server:call(?MODULE,{sql2,SQLRequest,3600000},3600000)) of
		{'EXIT',Reason} ->
			io:format("scada_db_mssql: create_table: ~n~ts~nExit with reason: ~p~n",[SQLRequest,Reason]),
			{error,Reason};
		{error,Error} ->
			io:format("scada_db_mssql: create_table: ~n~ts~nError: ~p~n",[SQLRequest,Error]),
			{error,Error};
		_ ->
			ok
	end.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Request) -> ok | {error,Reason}
%% @doc <i>Добавление данных в базу</i>
%% <p>
%% <b>Request</b> - Запрос на добавление данных в базу.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
insert_data(Request) ->
	insert_data(Request,[]).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Request,Options::[{format,raw}] | [] ) -> ok | {error,Reason}
%% @doc <i>Добавление данных в базу с указанием опций обработки запроса</i>
%% <p>
%% <b>Request</b> - Запрос на добавление данных в базу;<br/>
%% <b>Options</b> - Список опций.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
insert_data(Request,Options) ->
	Table=proplists:get_value(table,Request,[]),
	Fields=proplists:get_value(fields,Request,[]),
	FormatMethod=proplists:get_value(format,Options,default),
	_Timeout=proplists:get_value(timeout,Options,5000),
	FieldsList=lists:foldr(
		fun({_FieldName,undefined},Acc) ->
			Acc;
		({FieldName,FieldValue},Acc) ->
			[{FieldName,format_value(FormatMethod,FieldValue)}|Acc]			
		end,
		[],
		Fields
	),
	{FieldsNamesList,FieldsValuesList}=lists:unzip(FieldsList),
	SQLRequest=lists:flatten(
		[
			"insert into ",
			Table,
			"(",
			string:join(FieldsNamesList,","),
			")",
			" values(",
			string:join(FieldsValuesList,","),
			")",
			";"
		]
	),
	case catch(gen_server:call(?MODULE,{sql2,SQLRequest,3600000},3600000)) of
		{'EXIT',Reason} ->
			% io:format("scada_db_mssql: insert_data: ~n~ts~nExit with reason: ~p~n",[SQLRequest,Reason]),
			{error,Reason};
		{error,Error} ->
			% io:format("scada_db_mssql: insert_data: ~n~ts~nError: ~p~n",[SQLRequest,Error]),
			{error,Error};
		_ ->
			ok
	end.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Request) -> list
%% @doc <i>Извлечение данных из базы</i>
%% <p>
%% <b>Request</b> - Запрос на извлечение данных из базы.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
get_data(Request) ->
	Table=proplists:get_value(table,Request,[]),
	Fields=proplists:get_value(fields,Request,[]),
	Conditions=proplists:get_value(conditions,Request,[]),
	Orders=proplists:get_value(orders,Request,[]),
	Limit=proplists:get_value(limit,Request,0),
	SQLRequest=lists:flatten(
		[
			"select ",
			build_limit_sql(Limit),
			string:join(Fields,","),
			" from ",
			Table,
			build_conditions_sql(Conditions),
			build_orders_sql(Orders),
			";"
		]
	),
	% io:format("scada_db_mssql: get_data: ~n~ts~n",[SQLRequest]),
	case catch(gen_server:call(?MODULE,{sql,SQLRequest,3600000},3600000)) of
		{'EXIT',_Reason} ->
			% io:format("scada_db_mssql: get_data: ~n~ts~nExit with reason: ~p~n",[SQLRequest,Reason]),
			[];
		{error,_Error} ->
			% io:format("scada_db_mssql: get_data: ~n~ts~nError: ~p~n",[SQLRequest,Error]),
			[];
		{selected,FieldsNames,FieldsValues} ->
			% io:format("~p~n",[{FieldsNames,FieldsValues}]),
			FieldsPos=lists:seq(1,length(FieldsNames)),
			lists:map(
				fun(FieldsValuesRow) ->
					[case element(Pos,FieldsValuesRow) of null -> 0.0; Value -> checkSQLValue(Value) end || Pos <- FieldsPos]
				end,
				FieldsValues
			);
		_ ->
			[]
	end.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Request) -> ok
%% @doc <i>Удаление данных из базы</i>
%% <p>
%% <b>Request</b> - Запрос на удаление данных из базы.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
delete_data(Request) ->
	Table=proplists:get_value(table,Request,[]),
	Conditions=proplists:get_value(conditions,Request,[]),
	SQLRequest=lists:flatten(
		[
			"delete",
			" from ",
			Table,
			build_conditions_sql(Conditions),
			";"
		]
	),
%	io:format("~s~n~n",[SQLRequest]),
	case catch(gen_server:call(?MODULE,{sql2,SQLRequest,3600000},3600000)) of
		{'EXIT',Reason} ->
			% io:format("scada_db_mssql: delete_data: ~n~ts~nExit with reason: ~p~n",[SQLRequest,Reason]),
			{error,Reason};
		{error,Error} ->
			% io:format("scada_db_mssql: delete_data: ~n~ts~nError: ~p~n",[SQLRequest,Error]),
			{error,Error};
		_ ->
			ok
	end.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Request) -> ok | {error,Reason}
%% @doc <i>Обновление данных в базе</i>
%% <p>
%% <b>Request</b> - Запрос на обновление данных в базе.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
update_data(Request) ->
	update_data(Request,[]).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Request,Options::[{format,raw}] | [] ) -> ok | {error,Reason}
%% @doc <i>Обновление данных в базе с указанием опций обработки запроса</i>
%% <p>
%% <b>Request</b> - Запрос на обновление данных в базе;<br/>
%% <b>Options</b> - Список опций.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
update_data(Request,Options) ->
	Table=proplists:get_value(table,Request,[]),
	Fields=proplists:get_value(fields,Request,[]),
	Conditions=proplists:get_value(conditions,Request,[]),
	FormatMethod=proplists:get_value(format,Options,default),
	_Timeout=proplists:get_value(timeout,Options,1000),
	FieldsList=lists:foldr(
		fun({_FieldName,undefined},Acc) ->
			Acc;
		({FieldName,FieldValue},Acc) ->
			[lists:flatten(" "++FieldName++"="++format_value(FormatMethod,FieldValue))|Acc]			
		end,
		[],
		Fields
	),
	SQLRequest=lists:flatten(
		[
			"update ",
			Table,
			" set",
			string:join(FieldsList,","),
			build_conditions_sql(Conditions),
			";"
		]
	),
	case catch(gen_server:call(?MODULE,{sql2,SQLRequest,3600000},3600000)) of
		{'EXIT',Reason} ->
			% io:format("scada_db_mssql: insert_data: ~n~ts~nExit with reason: ~p~n",[SQLRequest,Reason]),
			{error,Reason};
		{error,Error} ->
			% io:format("scada_db_mssql: insert_data: ~n~ts~nError: ~p~n",[SQLRequest,Error]),
			{error,Error};
		_ ->
			ok
	end.

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
	application:stop(odbc),
	ok=application:start(odbc),
    DSN=scada:get_app_env(dsn,undefined),
    UID=scada:get_app_env(username,""),
    PWD=scada:get_app_env(password,""),
    case catch(odbc:connect(lists:flatten(["DSN=",DSN,";","UID=",UID,";","PWD=",PWD,";"]),[{binary_strings,off}])) of
    	{ok,OdbcRef} ->
		    case catch(odbc:connect(lists:flatten(["DSN=",DSN,";","UID=",UID,";","PWD=",PWD,";"]),[{binary_strings,off}])) of
		    	{ok,OdbcRef2} ->
			    	State=#conn_state{
			    		dsn=DSN,
						uid=UID,
						pwd=PWD,
						conn=OdbcRef,
						conn2=OdbcRef2
			    	},
			    	Request=[
						{table,"ALARMS"},
						{
							fields,
							[
								{"ALM_NATIVETIMELAST",datetime},
								{"ALM_TAGNAME",{ascii,512}},
								{"ALM_TAGDESC",{ascii,512}},
								{"ALM_VALUE",{ascii,40}},
								{"ALM_UNIT",{ascii,20}},
								{"ALM_MSGTYPE",{ascii,11}},
								{"ALM_DESCR",{ascii,1024}},
								{"ALM_ALMSTATUS",{ascii,9}},
								{"ALM_ALMPRIORITY",{ascii,10}}
							]
						},
						{
							indexes,
							[
								{"ALM_NATIVETIMELAST",not_unique},
								{"ALM_TAGNAME",not_unique}				
							]
						}
					],
					SQLRequest=build_create_table_request(Request),
					Res=odbc:sql_query(OdbcRef2,SQLRequest,3600000),
					?log_sys_text(io_lib:format("scada_db_mssql starting...~n",[])),
					io:format("~ts~n~p~n",[SQLRequest,Res]),
					?log_sys_text(io_lib:format("scada_db_mssql started.~n",[])),
		    		{ok,State};
		    	_Other2 ->
					io:format("scada_db_mssql: cannot connect to MSSQL server (2).~n~p~n",[_Other2]),
					{stop,cannot_connect}
			end;
		_Other ->
			io:format("scada_db_mssql: cannot connect to MSSQL server.~n~p~n",[_Other]),
			{stop,cannot_connect}
	end.

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
handle_call({sql,SQLRequest,Timeout},_From,State) ->
	{Result,NewState}=case odbc:sql_query(State#conn_state.conn,SQLRequest,Timeout) of
		{error,connection_closed} ->
			DSN=State#conn_state.dsn,
    		UID=State#conn_state.uid,
    		PWD=State#conn_state.pwd,
    		case catch(odbc:connect(lists:flatten(["DSN=",DSN,";","UID=",UID,";","PWD=",PWD,";"]),[{binary_strings,off}])) of
    			{ok,NewOdbcRef} ->
    				{odbc:sql_query(NewOdbcRef,SQLRequest,Timeout),State#conn_state{conn=NewOdbcRef}};
    			_ ->
    				{{error,cannot_connect_server},State}
    		end;
    	Res ->
    		{Res,State}
    end,
	{reply,Result,NewState};

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%% @spec (stop,_From,State) -> ok
%% @doc Callback функция для gen_server:call().
%% Для запроса останова.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% 
handle_call({sql2,SQLRequest,Timeout},_From,State) ->
	{Result,NewState}=case odbc:sql_query(State#conn_state.conn2,SQLRequest,Timeout) of
		{error,connection_closed} ->
			DSN=State#conn_state.dsn,
    		UID=State#conn_state.uid,
    		PWD=State#conn_state.pwd,
    		case catch(odbc:connect(lists:flatten(["DSN=",DSN,";","UID=",UID,";","PWD=",PWD,";"]),[{binary_strings,off}])) of
    			{ok,NewOdbcRef} ->
    				{odbc:sql_query(NewOdbcRef,SQLRequest,Timeout),State#conn_state{conn2=NewOdbcRef}};
    			_ ->
    				{{error,cannot_connect_server},State}
    		end;
    	Res ->
    		{Res,State}
    end,
	{reply,Result,NewState};

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
	?log_sys_text(io_lib:format("~p: terminating for reason: ~p~n",[?MODULE,Reason])),
	normal.


%%%%%%%%%%%%%%%%%%%%%%%
%%% private функции %%%
%%%%%%%%%%%%%%%%%%%%%%%

build_create_table_request(Request) ->
	Table=proplists:get_value(table,Request,[]),
	Fields=proplists:get_value(fields,Request,[]),
	Indexes=proplists:get_value(indexes,Request,[]),
	FieldsList=lists:map(
		fun({FieldName,FieldType}) ->
			FieldTypeStr=case FieldType of
				float ->
					"float";
				integer ->
					"integer";
				binary ->
					"float";
				ascii ->
					"text";
				datetime ->
					"datetime2";
				{ascii,_N} ->
					"text"
			end,
			lists:flatten([FieldName," ",FieldTypeStr])
		end,
		Fields
	),
	CreateIndexesList=lists:map(
		fun({FieldName,Unique}) ->
			case Unique of
				unique ->
					lists:flatten([" create unique index ix_",Table,"_",FieldName," on ",Table,"(",FieldName,") with (ignore_dup_key=on);"]);
				_ ->
					lists:flatten([" create index ix_",Table,"_",FieldName," on ",Table,"(",FieldName,");"])
			end
		end,
		Indexes
	),
	FieldsStr=string:join(FieldsList,","),
	lists:flatten(
		[
			"if not exists (select * from sysobjects where name=\'",
			Table,
			"\' and xtype=\'U\') begin ",
			"create table ",
			Table,
			"(",
			FieldsStr,
			")",
			";",
			CreateIndexesList,
			" end;"
		]
	).

build_conditions_sql([]) ->
	"";
build_conditions_sql(Conditions) ->
	SQLConditions=lists:map(
		fun(Condition) ->
			{Field,Expression,Value}=Condition,
			lists:flatten(
				[
					Field,
					build_condition(Expression,Value)
				]
			)
		end,
		Conditions
	),
	lists:flatten([" where ",string:join(SQLConditions," and ")]).
			
build_orders_sql([]) ->
	"";
build_orders_sql(Orders) ->
	SQLOrders=lists:map(
		fun(Order) ->
			{Field,OrderDirection}=Order,
			case OrderDirection of
				asc ->
					lists:flatten([Field," asc"]);
				desc ->
					lists:flatten([Field," desc"]);
				_ ->
					lists:flatten([Field," asc"])
			end
		end,
		Orders
	),
	lists:flatten([" order by ",string:join(SQLOrders,",")]).

build_limit_sql(Limit) when Limit>0 ->
	lists:flatten(io_lib:format(" top ~..0w ",[Limit]));
build_limit_sql(_Limit) ->
	"".
		
format_value(raw,Value) when is_binary(Value)->
	binary_to_list(Value);
format_value(raw,Value) when is_list(Value)->
	Value;
format_value(raw,Value) ->
	io_lib:format("~w",[Value]);
format_value(_,Value) ->
	format_value(Value).

format_value({{Year,Month,Day},{Hour,Minute,Second}}) ->
	io_lib:format("\'~4..0w-~2..0w-~2..0w ~2..0w:~2..0w:~2..0w\'",[Year,Month,Day,Hour,Minute,Second]);
format_value({{Year,Month,Day},{Hour,Minute,Second},Microsecond}) ->
	io_lib:format("\'~4..0w-~2..0w-~2..0w ~2..0w:~2..0w:~2..0w.~7..0w\'",[Year,Month,Day,Hour,Minute,Second,Microsecond*10]);
format_value(Value) when is_list(Value) ->
	"\'"++binary_to_hexstring(list_to_binary(lists:flatten(io_lib:format("~ts",[Value]))))++"\'";
format_value(Value) when is_binary(Value) ->
	"\'"++binary_to_hexstring(Value)++"\'";
format_value(Value) ->
	io_lib:format("~w",[Value]).

format_expression(eq) -> "=";
format_expression(neq) -> "!=";
format_expression(gt) -> ">";
format_expression(gte) -> ">=";
format_expression(lt) -> "<";
format_expression(lte) -> "<=";
format_expression(_) -> "=".

build_condition(eq,Value) when is_list(Value) ->
	lists:flatten(
		[
			" like ",
			format_value(Value)
		]
	);
build_condition(eq,Value) when is_binary(Value) ->
	lists:flatten(
		[
			" like ",
			format_value(Value)
		]
	);
build_condition(Expression,Value) ->
	lists:flatten(
		[
			format_expression(Expression),
			format_value(Value)
		]
	).

% replace(Str) ->
% 	lists:flatten([re:replace(Str,"\'","\'\'",[global,{return,list},bsr_unicode])]).

checkSQLValue(<<>>)  ->
	% {{0,0,0},{0,0,0}};
	"";
checkSQLValue(Value) when is_binary(Value) ->
	Bin=unicode:characters_to_binary(Value,{utf16,little}),
	Res=hexstring_to_binary(binary_to_list(Bin)),
	Res;
checkSQLValue(Value) when is_list(Value) ->
	Bin=unicode:characters_to_binary(Value,{utf16,little}),
	Res=hexstring_to_binary(binary_to_list(Bin)),
	Res;
checkSQLValue(Value) ->
	Value.

binary_to_hexstring(Bin) ->
    binary_to_hexstring(Bin,[]).

half_byte_to_hex(0) -> "0";
half_byte_to_hex(1) -> "1";
half_byte_to_hex(2) -> "2";
half_byte_to_hex(3) -> "3";
half_byte_to_hex(4) -> "4";
half_byte_to_hex(5) -> "5";
half_byte_to_hex(6) -> "6";
half_byte_to_hex(7) -> "7";
half_byte_to_hex(8) -> "8";
half_byte_to_hex(9) -> "9";
half_byte_to_hex(10) -> "A";
half_byte_to_hex(11) -> "B";
half_byte_to_hex(12) -> "C";
half_byte_to_hex(13) -> "D";
half_byte_to_hex(14) -> "E";
half_byte_to_hex(15) -> "F".

binary_to_hexstring(<<>>,Res) ->
    lists:reverse(lists:flatten(Res));
binary_to_hexstring(<<HalfByte1:4,HalfByte2:4,Rest/binary>>,Res) ->
    binary_to_hexstring(Rest,[half_byte_to_hex(HalfByte2),half_byte_to_hex(HalfByte1)|Res]).

hexstring_to_binary(Str) ->
	hexstring_to_binary(Str,[]).

hexstring_to_binary([],Res) ->
    list_to_binary(lists:reverse(lists:flatten(Res)));
hexstring_to_binary([HalfByte1,HalfByte2|Rest],Res) ->
	hexstring_to_binary(Rest,[hex_half_byte_to_bin(HalfByte1,HalfByte2)|Res]).

hex_half_byte_to_bin(HalfByte1,HalfByte2) ->
	V1=hex_to_half_byte(HalfByte1),
	V2=hex_to_half_byte(HalfByte2),
	list_to_binary([<<V1:4,V2:4>>]).

hex_to_half_byte($0) -> 0;
hex_to_half_byte($1) -> 1;
hex_to_half_byte($2) -> 2;
hex_to_half_byte($3) -> 3;
hex_to_half_byte($4) -> 4;
hex_to_half_byte($5) -> 5;
hex_to_half_byte($6) -> 6;
hex_to_half_byte($7) -> 7;
hex_to_half_byte($8) -> 8;
hex_to_half_byte($9) -> 9;
hex_to_half_byte($A) -> 10;
hex_to_half_byte($B) -> 11;
hex_to_half_byte($C) -> 12;
hex_to_half_byte($D) -> 13;
hex_to_half_byte($E) -> 14;
hex_to_half_byte($F) -> 15.

