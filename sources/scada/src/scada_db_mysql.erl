%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @author Владимир Щербина <vns.scherbina@gmail.com>
%% @copyright 2017
%% @version 1.1.0
%% @doc Модуль <b>{@module}</b> реализует доступ к базам данных MySQL.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
-module(scada_db_mysql).
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

-include("mysql.hrl").
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
					"bool";
				ascii ->
					"text";
				datetime ->
					"datetime(6)";
				{ascii,N} ->
					lists:flatten(io_lib:format("char(~..0w)",[N]))
			end,
			lists:flatten([FieldName," ",FieldTypeStr])
		end,
		Fields
	),
	IndexesList=lists:map(
		fun({FieldName,Unique}) ->
			FieldPrefix=case Unique of
				unique ->
					"unique ";
				_ ->
					""
			end,
			lists:flatten([FieldPrefix,"key ix_",Table,"_",FieldName,"(",FieldName,")"])
		end,
		Indexes
	),
	FieldsStr=case IndexesList of
		[] ->
			string:join(FieldsList,",");
		_ ->
			string:join(FieldsList++IndexesList,",")
	end,
	SQLRequest=lists:flatten(
		[
			"create table if not exists ",
			Table,
			"(",
			FieldsStr,
			")",
			";"
		]
	),
	case mysql:fetch(mysql,SQLRequest,60000) of
		{error,MYSQLResult} ->
			io:format("scada_db_mysql: create_table: ~n~ts~nMYSQL error: ~p~n",[SQLRequest,mysql:get_result_reason(MYSQLResult)]),
			{error,MYSQLResult};
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
	Timeout=proplists:get_value(timeout,Options,1000),
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
			"insert ignore into ",
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
	% case Table=="ALARMS" of true -> io:format("scada_db_mysql: insert_data: ~n~ts~n",[SQLRequest]); false -> ok end,
	case mysql:fetch(mysql,SQLRequest,Timeout) of
		{error,MYSQLResult} ->
			io:format("scada_db_mysql: insert_data: ~n~ts~nMYSQL error: ~p~n",[SQLRequest,mysql:get_result_reason(MYSQLResult)]),
			{error,MYSQLResult};
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
			string:join(Fields,","),
			" from ",
			Table,
			build_conditions_sql(Conditions),
			build_orders_sql(Orders),
			build_limit_sql(Limit),
			";"
		]
	),
	% io:format("scada_db_mysql: get_data: ~n~ts~n",[SQLRequest]),
	case catch(mysql:fetch(mysql,SQLRequest,3600000)) of
		{data,MYSQLResult} ->
			FieldInfo=mysql:get_result_field_info(MYSQLResult),
			FieldTypes=lists:map(
				fun({_TableName,_FieldName,_FieldLength,FieldType}) ->
					FieldType
				end,
				FieldInfo
			),
			Rows=mysql:get_result_rows(MYSQLResult),
			lists:map(
				fun(Row) ->
					lists:zipwith(
						fun(Type,Value) ->
							convert_typed_value(Type,Value)
						end,
						FieldTypes,
						Row
					)
				end,
				Rows
			);
		Other ->
			io:format("Error getting data: ~p~n",[Other]),
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
	case catch(mysql:fetch(mysql,SQLRequest,3600000)) of
		{updated, _MySQLRes} ->
			ok;
		Other ->
			io:format("Error deleting data: ~p~n",[Other]),
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
	Timeout=proplists:get_value(timeout,Options,1000),
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
	case mysql:fetch(mysql,SQLRequest,Timeout) of
		{error,MYSQLResult} ->
			io:format("scada_db_mysql: insert_data: ~n~ts~nMYSQL error: ~p~n",[SQLRequest,mysql:get_result_reason(MYSQLResult)]),
			{error,MYSQLResult};
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
	MYSQLPoolID=mysql,
    MYSQLPort=scada:get_app_env(mysql_port,undefined),
    MYSQLUsername=scada:get_app_env(username,""),
    MYSQLPassword=scada:get_app_env(password,""),
    MYSQLDatabase=scada:get_app_env(database,""),
    case catch(mysql:start_link(MYSQLPoolID, "localhost", MYSQLPort, MYSQLUsername, MYSQLPassword, MYSQLDatabase,fun custom_log_fun/4,utf8)) of
    	{ok,_Pid} ->
			Request=[
				{table,"ALARMS"},
				{
					fields,
					[
						{"ALM_NATIVETIMELAST",datetime},
						{"ALM_TAGNAME",{ascii,30}},
						{"ALM_TAGDESC",{ascii,40}},
						{"ALM_VALUE",{ascii,40}},
						{"ALM_UNIT",{ascii,13}},
						{"ALM_MSGTYPE",{ascii,11}},
						{"ALM_DESCR",ascii},
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
			case create_table(Request) of
				ok ->
					?log_sys_text(io_lib:format("scada_db_mysql starting...~n",[])),
					?log_sys_text(io_lib:format("scada_db_mysql started.~n",[])),
					{ok, undefined};
				{error,CreateAlarmsTableError} = AlarmsError ->
					io:format("scada_db_mysql: error creating table \'Alarms\': ~p~n",[CreateAlarmsTableError]),
					{stop,AlarmsError}
			end;
		_ ->
			io:format("scada_db_mysql: cannot connect to MySQL server."),
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

build_conditions_sql([]) ->
	"";
build_conditions_sql(Conditions) ->
	SQLConditions=lists:map(
		fun(Condition) ->
			{Field,Expression,Value}=Condition,
			lists:flatten(
				[
					Field,
					format_expression(Expression),
					format_value(Value)
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
	lists:flatten(io_lib:format(" limit ~..0w",[Limit]));
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
	io_lib:format("\'~4..0w-~2..0w-~2..0w ~2..0w:~2..0w:~2..0w.~6..0w\'",[Year,Month,Day,Hour,Minute,Second,Microsecond]);
format_value(Value) when is_list(Value) ->
	io_lib:format("\"~ts\"",[Value]);
format_value(Value) when is_binary(Value) ->
	"\""++binary_to_list(Value)++"\"";
format_value(Value) ->
	io_lib:format("~w",[Value]).

format_expression(eq) -> "=";
format_expression(neq) -> "!=";
format_expression(gt) -> ">";
format_expression(gte) -> ">=";
format_expression(lt) -> "<";
format_expression(lte) -> "<=";
format_expression(_) -> "=".


convert_typed_value('TIMESTAMP',{datetime, {{Year, Month, Day}, {Hour, Minute, Second}}}) ->
	{{Year, Month, Day}, {Hour, Minute, Second}};
convert_typed_value('DATETIME',{datetime, {{Year, Month, Day}, {Hour, Minute, Second}}}) ->
	{{Year, Month, Day}, {Hour, Minute, Second}};
convert_typed_value('TIMESTAMP',{datetime, {{Year, Month, Day}, {Hour, Minute, Second}, Millisecond}}) ->
	{{Year, Month, Day}, {Hour, Minute, Second}, Millisecond};
convert_typed_value('DATETIME',{datetime, {{Year, Month, Day}, {Hour, Minute, Second}, Millisecond}}) ->
	{{Year, Month, Day}, {Hour, Minute, Second}, Millisecond};
convert_typed_value('TIME',{time, {Hour, Minute, Second}}) ->
	{{0, 1, 1}, {Hour, Minute, Second}};
convert_typed_value('DATE',{date, {Year, Month, Day}}) ->
	{{Year, Month, Day}, {0, 0, 0}};
convert_typed_value('STRING',BinStr) ->
	binary_to_list(BinStr);
convert_typed_value('DOUBLE',undefined) ->
	0.0;
convert_typed_value('DOUBLE',Value) ->
	float(Value);
convert_typed_value('FLOAT',undefined) ->
	0.0;
convert_typed_value('FLOAT',Value) ->
	float(Value);
convert_typed_value('TINY',undefined) ->
	0;
convert_typed_value('TINY',Value) ->
	round(Value);
convert_typed_value(_Type,Value) ->
	Value.

custom_log_fun(_A,_B,_C,_D) ->
    ok.

