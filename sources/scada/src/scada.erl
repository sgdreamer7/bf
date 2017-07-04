%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @author Владимир Щербина <vns.scherbina@gmail.com>
%% @copyright 2017
%% @version 1.1.0
%% @doc Модуль <b>{@module}</b> реализует основное приложение с запуском web-сервера.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
-module(scada).

-behaviour(gen_server).

-export([start_link/0,stop/0]).

-export([init/1, handle_call/3, handle_cast/2, handle_info/2,
         terminate/2, code_change/3]).

-export(
	[
		start/0,
		build/0,
		compile_all_templates/0,
		compile_template/1,
		render_template/2,
		render_template/3,
		compile_all_datas/0,
		compile_data/1,
        eval_expression/1,
        get_app_env/2,
        log_system_action/1,
        l/0,
        loc/0,
        build_ifix_igs_conf/0,
        build_tags_shared_conf/0,
        test/0	]
).

-include_lib("kernel/include/file.hrl").
-include("logs.hrl").

-define(appname,scada).

%%%%%%%%%%%%%%%%%%%%%%
%%% public функции %%%
%%%%%%%%%%%%%%%%%%%%%%
		
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec () -> ok
%% @doc <i>Запуск приложения</i>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
start() ->
    {MegaSecs, Secs, MicroSecs}=erlang:now(),
    {{Year,Month,Day},{Hour,Minute,Second}}=calendar:now_to_local_time({MegaSecs, Secs, MicroSecs}),
    application:stop(?appname),
    application:stop(cowboy),
    application:stop(ranch),
    application:stop(mimetypes),
    application:stop(crypto),
    application:stop(erlydtl),
    application:stop(syntax_tools),
    application:stop(compiler),
    application:stop(os_mon),
    application:stop(sasl),

    ok=application:start(sasl),
    {ok,{file,KernelLogger}}=application:get_env(kernel,error_logger),
    {ok,{file,SaslLogger}}=application:get_env(sasl,sasl_error_logger),
    NewKernelLogger=lists:flatten(
        [
            KernelLogger,
            io_lib:format("~4..0w.~2..0w.~2..0w.~2..0w.~2..0w.~2..0w.",[Year,Month,Day,Hour,Minute,Second])
        ]
    ),
    NewSaslLogger=lists:flatten(
        [
            SaslLogger,
            io_lib:format("~4..0w.~2..0w.~2..0w.~2..0w.~2..0w.~2..0w.",[Year,Month,Day,Hour,Minute,Second])
        ]
    ),
    filelib:ensure_dir(NewKernelLogger),
    filelib:ensure_dir(NewSaslLogger),
    application:set_env(kernel,error_logger,{file,NewKernelLogger}),
    application:set_env(sasl,sasl_error_logger,{file,NewSaslLogger}),
    application:stop(sasl),

    ok=application:start(sasl),
    ok=application:start(os_mon),
    memsup:set_check_interval(60000),
    disksup:set_check_interval(60000),
	ok=application:start(compiler),
	ok=application:start(syntax_tools),
	ok=application:start(erlydtl),
    ok=application:start(crypto),
    ok=application:start(mimetypes),
    ok=application:start(ranch),
    ok=application:start(cowboy),
	ok=application:start(?appname),
    ok.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec () -> ok
%% @doc <i>Перезагрузка модулей приложения</i>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
l() ->
    Filename=lists:flatten(code:lib_dir(scada)++"/ebin/scada.app"),
    case file:consult(Filename) of
        {ok,[{application,scada,Props}]} ->
            Modules=proplists:get_value(modules,Props,[]),
            lists:foreach(
                fun(Module) ->
                    ?log_sys(io_lib:format("scada: Reloading module \'~p\'...~n",[Module])),
                    c:l(Module)
                end,
                Modules
            );
        _ ->
            ok
    end.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec () -> ok
%% @doc <i>Подсчет статистики LOC (lines of code)</i>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
loc() ->
    Files=filelib:wildcard(code:lib_dir(scada)++"/src/*.erl")++
            [
                code:lib_dir(scada)++"/include/logs.hrl",
                code:lib_dir(scada)++"/include/PowerNet-MIB.hrl",
                code:lib_dir(scada)++"/include/tags.hrl",
                code:lib_dir(scada)++"/include/WESTERMO-LYNX-MIB.hrl"
            ],

    Filters=gb_sets:from_list(
        [
            "lcount",
            "mysql",
            "mysql_auth",
            "mysql_conn",
            "mysql_recv",
            "plists",
            "snmpm_net_if"
        ]
    ),
    FilteredFiles=lists:filter(
        fun(Filename) ->
            Basename=filename:basename(Filename,".erl"),
            gb_sets:is_member(Basename,Filters)==false
        end,
        Files
    ),
    lcount:files(FilteredFiles).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec () -> ok
%% @doc <i>Перекомпиляция приложения</i>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

build() ->
    Dir=lists:flatten(code:lib_dir(?appname)++"/src"),
    case file:set_cwd([Dir]) of
        ok ->
            make:all([load]);
        {error, Reason} ->
            ?log_sys(io_lib:format("scada: Error setting path: ~p~n",[Reason]))
    end.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec () -> ok
%% @doc <i>Компиляция всех шаблонов</i>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
compile_all_templates() ->
    ReportsDir=get_app_env(reports_dir,code:lib_dir(?appname)++"/priv/reports"),
	TemplatesDir=lists:flatten(ReportsDir++"/templates"),
	FilesMask=lists:flatten(
		[
			TemplatesDir,
			"/*.dtl"
		]
	),
	lists:foreach(
		fun(Filename) ->
			Basename=filename:basename(Filename,'.dtl'),
			?log_sys(io_lib:format("scada: Compiling template \'~s\' ... ~n",[Basename])),
			compile_template(Basename),
			?log_sys(io_lib:format("scada: Compiling template \'~s\' done.~n",[Basename]))
		end,
		filelib:wildcard(FilesMask)
	).

	
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Basename::string) -> ok
%% @doc <i>Компиляция шаблона</i>
%% <p>
%% <b>Basename</b> - имя шаблона.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
compile_template(Basename) ->
	ModuleName = list_to_atom(string:to_lower(lists:flatten(["template_", Basename]))),
    ReportsDir=get_app_env(reports_dir,code:lib_dir(?appname)++"/priv/reports"),
	OutDir=lists:flatten(ReportsDir++"/ebin"),
	TemplatesDir=lists:flatten(ReportsDir++"/templates"),
	File=lists:flatten(TemplatesDir++"/"++Basename++".dtl"),
    OutFile=lists:flatten(OutDir++"/"++"template_"++Basename++".beam"),
    case file:read_file_info(File) of
        {ok, FileInfo} ->
            SourceTimestamp=FileInfo#file_info.mtime,
            CompileFun=fun() ->
                io:format("compiling module: ~s~n",[ModuleName]),
                Result=erlydtl_compiler:compile(File, ModuleName, [{out_dir, OutDir},{compiler_options,[verbose]},verbose,report_errors,force_recompile,{custom_filters_modules,[custom_filters]}]),
                ok=file:change_time(OutFile,SourceTimestamp),
                Result
            end,
            case file:read_file_info(OutFile) of
                {ok, OutFileInfo} ->
                    OutTimestamp=OutFileInfo#file_info.mtime,
                    case OutTimestamp==SourceTimestamp of
                        false ->
                           CompileFun();
                        true ->
                            {ok,ModuleName}
                    end;
                _ ->
                    CompileFun()
            end;
        _ ->
            {ok,ModuleName}
    end.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Basename::string, Vars::list) -> {ok,Data}
%% @doc <i>Рендеринг шаблона с использованием переменных</i>
%% <p>
%% <b>Basename</b> - имя шаблона;<br/>
%% <b>Vars</b> - список переменных для шаблона.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
render_template(Basename,Vars) ->
	Module = list_to_atom(string:to_lower(lists:flatten(["template_", Basename]))),
	case catch(Module:render(Vars)) of
        {ok,Data} ->
        	{ok,Data};
        {'EXIT',Reason} ->
            {error,lists:flatten(io_lib:format("failed invoking render method of ~p ~p", [Module, Reason]))};
        Err ->
			Err
    end.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Template::string, Data::string, Args::list) -> {ok,Data}
%% @doc <i>Рендеринг шаблона с использованием источника данных и параметров</i>
%% <p>
%% <b>Template</b> - имя шаблона;<br/>
%% <b>Data</b> - имя источника данных;<br/>
%% <b>Args</b> - список аргументов, передаваемых в источник данных.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
render_template(Template,Data,Args) ->
	DataModule = list_to_atom(string:to_lower(lists:flatten(["data_", Data]))),
	case catch(DataModule:data(Args)) of
        {ok,Vars} ->
			TemplateModule = list_to_atom(string:to_lower(lists:flatten(["template_", Template]))),
        	case catch(TemplateModule:render(Vars)) of
				{ok,Result} ->
                    Response=list_to_binary(
                        lists:map(
                            fun(Element) when is_binary(Element) ->
                                Element;
                            (Element) ->
                                <<Element:8>>
                            end,
                            lists:flatten(Result)
                        )
                    ),
                    % file:write_file("C:/Works/temp/report.html",Response),
					{ok,Response};
				{'EXIT',Reason} ->
				    ?log_sys(io_lib:format("scada: render_template: Error: ~p~n",[Reason])),
				    {error,{TemplateModule, Reason}};
				Err ->
				    ?log_sys(io_lib:format("scada: render_template:Error rendering template~n",[])),
					Err
			end;
        {'EXIT', Reason} ->
            {error,{DataModule, Reason}};
        Err ->
            ?log_sys(io_lib:format("scada: render_template: Error getting data~n",[])),
			Err
	end.


%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec () -> ok
%% @doc <i>Компиляция всех источников данных</i>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
compile_all_datas() ->
    ReportsDir=get_app_env(reports_dir,code:lib_dir(?appname)++"/priv/reports"),
	DataDir=lists:flatten(ReportsDir++"/data"),
	FilesMask=lists:flatten(
		[
			DataDir,
			"/*.erl"
		]
	),
	lists:foreach(
		fun(Filename) ->
			Basename=filename:basename(Filename,'.erl'),
			?log_sys(io_lib:format("scada: Compiling data source \'~s\' ... ~n",[Basename])),
			compile_data(Basename),
			?log_sys(io_lib:format("scada: Compiling data source \'~s\' done.~n",[Basename]))
		end,
		filelib:wildcard(FilesMask)
	).


%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Basename::string) -> ok
%% @doc <i>Компиляция источника данных</i>
%% <p>
%% <b>Basename</b> - имя шаблона.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
compile_data(Basename) ->
	ModuleName = string:to_lower(lists:flatten(["data_", Basename])),
    ReportsDir=get_app_env(reports_dir,code:lib_dir(?appname)++"/priv/reports"),
	OutDir=lists:flatten(ReportsDir++"/ebin"),
	DataDir=lists:flatten(ReportsDir++"/data"),
	File=lists:flatten(DataDir++"/"++Basename++".erl"),
    case file:read_file_info(File) of
        {ok, FileInfo} ->
            SourceTimestamp=FileInfo#file_info.mtime,
            OutFile=lists:flatten(OutDir++"/"++"data_"++Basename++".beam"),
            CompileFun=fun() ->
                io:format("compiling module: ~s~n",[ModuleName]),
                SrcFile=lists:flatten(DataDir++"/"++"data_"++Basename++".erl"),
                ModuleText=case file:read_file(File) of
                    {ok,Bin} ->
                        binary_to_list(Bin);
                    _ ->
                        []
                end,
                RealModuleText=lists:flatten(
                    [
                        "-module('",
                        ModuleName,
                        "'). ",
                        "-compile(export_all). ",
                        ModuleText
                    ]
                ),
                ok=file:write_file(SrcFile,RealModuleText),
                Result=c:c(SrcFile,[{outdir,OutDir},report,return,verbose,load]),
                ok=file:delete(SrcFile),
                ok=file:change_time(OutFile,SourceTimestamp),
                Result
            end,
            case file:read_file_info(OutFile) of
                {ok, OutFileInfo} ->
                    OutTimestamp=OutFileInfo#file_info.mtime,
                    case OutTimestamp==SourceTimestamp of
                        false ->
                            CompileFun();
                        true ->
                            {ok,ModuleName}
                    end;
                _ ->
                    CompileFun()
            end;
        _ ->
            {ok,ModuleName}
    end.


%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Expression::string) -> term
%% @doc <i>Вычисление выражения, заданного строкой</i>
%% <p>
%% <b>Expression</b> - строка, задающая вычисляемое выражение.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%    
eval_expression(Expression) when is_binary(Expression) ->
    eval_expression(binary_to_list(Expression));
eval_expression(Expression) when is_list(Expression) ->
    {ok,Tokens,_EndLocation}=erl_scan:string(Expression++"."),
    {ok,Exprs}=erl_parse:parse_exprs(Tokens),
    case erl_eval:exprs(Exprs,[],{value,fun local_fun_handler/2}) of
        {value,Value,_NewBindings} ->
            Value;
        _ ->
            erlang:error("Evaluating expression "++Expression++"error")
    end.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Key::term,Default::term) -> term
%% @doc <i>Чтение параметра конфигурации приложения</i>
%% <p>
%% <b>Key</b> - терм, задающий имя параметра;<br/>
%% <b>Default</b> - значение параметра по умолчанию.
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% 
get_app_env(Key,Default) ->
    case application:get_env(?appname,Key) of
        {ok,Value} ->
            Value;
        _ ->
            Default
    end.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Message) -> ok
%% @doc <i>Регистрация действий системы</i>
%% <p>
%% <b>Message</b> - сообщение о действиях системы.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
log_system_action(Message) when is_list(Message) ->
    Now=erlang:now(),
    Timestamp=calendar:now_to_local_time(Now),
    {{Year,Month,Day},{Hour,Minute,Second}}=Timestamp,
    {_MegaSec,_Secs,MicroSecs}=Now,
    io:format("~4..0w-~2..0w-~2..0w ~2..0w:~2..0w:~2..0w.~6..0w: ~ts",[Year,Month,Day,Hour,Minute,Second,MicroSecs,Message]).

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
    gen_server:start_link(
    	{local, ?MODULE},
    	?MODULE, 
    	[], 
    	[]
	).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%% @spec () -> ok
%% @doc Функция останова gen_server.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
stop() ->
	gen_server:cast(?MODULE,stop).
    
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%% @spec (Options::list) -> {ok, State}
%% @doc Функция инициализации при запуске gen_server.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
init(_Options) ->
    erlang:process_flag(trap_exit, true),
    ?log_sys(io_lib:format("scada starting...~n",[])),
    WebServerPort=get_app_env(http_port,5001),
    HmiDir=get_app_env(hmi_dir,code:lib_dir(?appname)++"/priv/hmi"),
    filelib:ensure_dir(HmiDir++"/"),
    ReportsDir=get_app_env(reports_dir,code:lib_dir(?appname)++"/priv/reports"),
    filelib:ensure_dir(ReportsDir++"/ebin/"),
    filelib:ensure_dir(ReportsDir++"/data/"),
    filelib:ensure_dir(ReportsDir++"/templates/"),
    code:add_pathz(ReportsDir++"/ebin"),
    JarsDir=get_app_env(jars_dir,code:lib_dir(?appname)++"/priv/jars"),
    ?log_sys(io_lib:format("scada: cowboy starting...~n",[])),
    Dispatch = cowboy_router:compile([
        {'_', [
            {"/", toppage_handler, []},
            {"/hmi", get_hmi_handler, []},
            {"/hmi32", get_hmi32_handler, []},
            {"/itext", get_itext_handler, []},
            {"/jre.exe", jre_handler, []},            
            {"/jre64.exe", jre64_handler, []},            
            {"/ws_endpoint", ws_handler, []},
            {"/report_loading.htm", report_loading_handler, []},
            {"/rest/:resource", rest_cowboy, []},
            {"/rest/:resource/:id/[...]", rest_cowboy, []},
            {"/jars/[...]",cowboy_static_sendfile_opts,[
                {directory,JarsDir},
                {mimetypes,{fun mimetypes:path_to_mimes/2, default}},
                {chunk_size,64*1024}
            ]},
            {"/doc/[...]",cowboy_static_sendfile_opts,[
                {directory,lists:flatten([code:lib_dir(scada),"/doc"])},
                {mimetypes,{fun mimetypes:path_to_mimes/2, default}},
                {chunk_size,64*1024}
            ]},
            {"/[...]", cowboy_static_sendfile_opts, [
                {directory, HmiDir},
                {mimetypes, {fun mimetypes:path_to_mimes/2, default}},
                {chunk_size,64*1024}
            ]}
        ]}
    ]),
    ?log_sys(io_lib:format("scada: cowboy configured.~n",[])),
    cowboy:start_http(scada_http_listener, 100, [{port, WebServerPort}], [
        {env, [{dispatch, Dispatch}]}
    ]),
    ?log_sys(io_lib:format("scada: cowboy started.~n",[])),
    ?log_sys(io_lib:format("scada started.~n",[])),
    {ok, undefined}.


%%%%%%%%%%%%%%%%%%%%%%%%
%%% callback функции %%%
%%%%%%%%%%%%%%%%%%%%%%%%

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%% @spec (Request, From, State) -> ok
%% @doc Callback функция для gen_server:call().
%% Для всех не распознанных запросов.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
handle_call(Request, From, State) ->
    Reply = {error, {unknown_request, Request, From, State}},
    {reply, Reply, State}.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%% @spec (_Msg, State) -> ok
%% @doc Callback функция для gen_server:cast().
%% Для запроса на остановку gen_server.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
handle_cast(stop, State) ->
    {stop, normal, State};
    
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%% @spec (_Msg, State) -> ok
%% @doc Callback функция для gen_server:cast().
%% Для всех не распознанных запросов.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
handle_cast(_Msg, State) ->
    {noreply, State}.

% %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% %% @hidden
% %% @spec (stop, State) -> ok
% %% @doc Callback функция при получении сообщения stop gen_server.
% %% @end
% %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% handle_info(stop, State) ->
%     {stop, normal, State};
    
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%% @spec (Other, State) -> ok
%% @doc Callback функция при получении сообщений gen_server.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
handle_info(Other, State) ->
    ?log_sys(io_lib:format("~p: Unknown message ~p",[?MODULE,Other])),
    {noreply, State}.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%% @spec (_Reason, _State) -> ok
%% @doc Callback функция при завершение работы gen_server.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
terminate(Reason, _State) ->
    ?log_sys(io_lib:format("~p: terminating for reason: ~p~n",[?MODULE,Reason])),
    cowboy:stop_listener(scada_http_listener),
    normal.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%% @spec (_OldVsn, State, _Extra) -> {ok, State}
%% @doc Callback функция для обновление состояния gen_server во время смены кода.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
code_change(_OldVsn, State, _Extra) ->
    {ok, State}.

%%%%%%%%%%%%%%%%%%%%%%%
%%% private функции %%%
%%%%%%%%%%%%%%%%%%%%%%%


local_fun_handler(tag_i,[Tag,Field]) ->
    scada_tags:get_field(Tag,Field);
local_fun_handler(tag_a,[Tag,Field]) ->
    case scada_tags:get_field(Tag,Field) of
        undefined ->
            "";
        TagValue ->
            TagValue
    end;
local_fun_handler(tag_b,[Tag,Field]) ->
    case scada_tags:get_field(Tag,Field) of
        undefined ->
            0;
        TagValue ->
            TagValue
    end;
local_fun_handler(tag_f,[Tag,Field]) ->
    case scada_tags:get_field(Tag,Field) of
        undefined ->
            0.0;
        TagValue ->
            TagValue
    end;
local_fun_handler(avg_tags,[Tags]) ->
    {AllCount,AllSum}=lists:foldl(
        fun(TagName,{Count,Sum}) ->
            case scada_tags:get_field(TagName,"F_CV") of
                undefined ->
                    {Count,Sum};
                TagValue ->
                    LOLO=scada_tags:get_field(TagName,"F_LOLO"),
                    HIHI=scada_tags:get_field(TagName,"F_HIHI"),
                    case ((TagValue>=LOLO) and (TagValue=<HIHI)) of
                            true ->
                                {Count+1,Sum+TagValue};
                            false ->
                                {Count,Sum}
                    end
            end
        end,
        {0,0.0},
        Tags
    ),
    case AllCount>0 of
        true ->
            AllSum/AllCount;
        false ->
            0.0
    end.

build_ifix_igs_conf() ->
    TagsList=get_tags_list(),
    {IgsMPK1Data,IgsMPK2Data,IgsMPKZData,IfixAnalogData,IfixDigitalData}=lists:foldl(
        fun(TagName,{IgsMPK1Acc,IgsMPK2Acc,IgsMPKZAcc,IfixAnalogAcc,IfixDigitalAcc}) ->
            TagType=scada_tags:get_field(TagName,"A_ETAG"),
            TagDesc=remove_quotes(lists:flatten(io_lib:format("~ts",[scada_tags:get_field(TagName,"A_DESC")]))),
            TagDriver=scada_tags:get_field(TagName,"A_IODV"),
            TagAddress=scada_tags:get_field(TagName,"A_IOAD"),
            case lists:member(TagDriver,["scada_driver_modbus"]) of
                false ->
                   {IgsMPK1Acc,IgsMPK2Acc,IgsMPKZAcc,IfixAnalogAcc,IfixDigitalAcc};
                true ->
                    case TagType of
                        "ANALOG" ->
                            NewIgsMPK1Acc=case lists:prefix("MPK_1:",TagAddress) of
                                false ->
                                    IgsMPK1Acc;
                                true ->
                                    {_,Address1}=lists:split(6,TagAddress),
                                    [unicode:characters_to_binary(lists:flatten(io_lib:format("\"~ts\",\"~ts\",Float,1,R/W,100,,,,,,,,,,\"~ts\",~n",[TagName,Address1,TagDesc])))|IgsMPK1Acc]
                            end,
                            NewIgsMPK2Acc=case lists:prefix("MPK_2:",TagAddress) of
                                false ->
                                    IgsMPK2Acc;
                                true ->
                                    {_,Address2}=lists:split(6,TagAddress),
                                    [unicode:characters_to_binary(lists:flatten(io_lib:format("\"~ts\",\"~ts\",Float,1,R/W,100,,,,,,,,,,\"~ts\",~n",[TagName,Address2,TagDesc])))|IgsMPK2Acc]
                            end,
                            NewIgsMPKZAcc=case lists:prefix("MPK_Z:",TagAddress) of
                                false ->
                                    IgsMPKZAcc;
                                true ->
                                    {_,AddressZ}=lists:split(6,TagAddress),
                                    [unicode:characters_to_binary(lists:flatten(io_lib:format("\"~ts\",\"~ts\",Float,1,R/W,100,,,,,,,,,,\"~ts\",~n",[TagName,AddressZ,TagDesc])))|IgsMPKZAcc]
                            end,
                            {Prefix,_}=lists:split(5,TagAddress),
                            NewIfixAnalogAcc=[unicode:characters_to_binary(lists:flatten(io_lib:format("\"AI\";\"~ts\";\"\";\"~ts\";\"ON\";\"0,10\";\"0\";\"IGS\";\"\";\"~ts_CHANNEL.~ts.~ts\";\"None\";\"-1000000,00\";\"1000000,00\";\"\";\"AUTO\";\"DISABLE\";\"NONE\";\"-1000000,00\";\"1000000,00\";\"-1000000,00\";\"1000000,00\";\"0,00\";\"0,00\";\"LOW\";\"YES\";\"NONE\";\"NONE\";\"NONE\";\"ALL\";\"\";\"\";\"\";\"\";\"\";\"\";\"\";\"\";\"\";\"\";\"\";\"\";\"\";\"\";\"\";\"\";\"NONE\";\"YES\";\"NO\";\"REJECT\";\"100\";\"3000\";\"0\";\"NO\";\"NO\";\"0\";\"\";\"NO\";\"100,0\";\"0,0\";\"Milliseconds\";\"DISABLE\";\"0,0000\";\"Absolute\";\"0\";\"NO\";\"NO\";\"YES\";\"0,00\";\"100,00\";\"-1000000,00\";\"1000000,00\"~n",[TagName,TagDesc,Prefix,Prefix,TagName])))|IfixAnalogAcc],
                            {NewIgsMPK1Acc,NewIgsMPK2Acc,NewIgsMPKZAcc,NewIfixAnalogAcc,IfixDigitalAcc};
                        "DIGITAL" ->
                            NewIgsMPK1Acc=case lists:prefix("MPK_1:",TagAddress) of
                                false ->
                                    IgsMPK1Acc;
                                true ->
                                    {_,Address1}=lists:split(6,TagAddress),
                                    [unicode:characters_to_binary(lists:flatten(io_lib:format("\"~ts\",\"~ts\",Boolean,1,R/W,100,,,,,,,,,,\"~ts\",~n",[TagName,Address1,TagDesc])))|IgsMPK1Acc]
                            end,
                            NewIgsMPK2Acc=case lists:prefix("MPK_2:",TagAddress) of
                                false ->
                                    IgsMPK2Acc;
                                true ->
                                    {_,Address2}=lists:split(6,TagAddress),
                                    [unicode:characters_to_binary(lists:flatten(io_lib:format("\"~ts\",\"~ts\",Boolean,1,R/W,100,,,,,,,,,,\"~ts\",~n",[TagName,Address2,TagDesc])))|IgsMPK2Acc]
                            end,
                            NewIgsMPKZAcc=case lists:prefix("MPK_Z:",TagAddress) of
                                false ->
                                    IgsMPKZAcc;
                                true ->
                                    {_,AddressZ}=lists:split(6,TagAddress),
                                    [unicode:characters_to_binary(lists:flatten(io_lib:format("\"~ts\",\"~ts\",Boolean,1,R/W,100,,,,,,,,,,\"~ts\",~n",[TagName,AddressZ,TagDesc])))|IgsMPKZAcc]
                            end,
                            {Prefix,_}=lists:split(5,TagAddress),
                            NewIfixDigitalAcc=[unicode:characters_to_binary(lists:flatten(io_lib:format("\"DI\";\"~ts\";\"\";\"~ts\";\"IGS\";\"\";\"~ts_CHANNEL.~ts.~ts\";\"AUTO\";\"ON\";\"0,10\";\"NO\";\"OPEN\";\"CLOSE\";\"DISABLE\";\"NONE\";\"LOW\";\"COS\";\"DISABLE\";\"NONE\";\"NONE\";\"NONE\";\"YES\";\"ALL\";\"\";\"\";\"\";\"\";\"\";\"\";\"\";\"\";\"\";\"\";\"\";\"\";\"\";\"\";\"\";\"\";\"NONE\";\"YES\";\"NO\";\"REJECT\";\"100\";\"100\";\"0\";\"NO\";\"NO\";\"0\";\"\";\"NO\";\"100,0\";\"0,0\";\"Milliseconds\";\"DISABLE\";\"0,0000\";\"Absolute\";\"0\"~n",[TagName,TagDesc,Prefix,Prefix,TagName])))|IfixDigitalAcc],
                            {NewIgsMPK1Acc,NewIgsMPK2Acc,NewIgsMPKZAcc,IfixAnalogAcc,NewIfixDigitalAcc};
                        _ ->
                            {IgsMPK1Acc,IgsMPK2Acc,IgsMPKZAcc,IfixAnalogAcc,IfixDigitalAcc}
                    end
            end
        end,
        {[],[],[],[],[]},
        TagsList
    ),
    IgsPrefix="Tag Name,Address,Data Type,Respect Data Type,Client Access,Scan Rate,Scaling,Raw Low,Raw High,Scaled Low,Scaled High,Scaled Data Type,Clamp Low,Clamp High,Eng Units,Description,Negate Value",
    IfixAnalogPrefix="[BLOCK TYPE;TAG;NEXT BLK;DESCRIPTION;INITIAL SCAN;SCAN TIME;SMOOTHING;I/O DEVICE;H/W OPTIONS;I/O ADDRESS;SIGNAL CONDITIONING;LOW EGU LIMIT;HIGH EGU LIMIT;EGU TAG;INITIAL A/M STATUS;ALARM ENABLE;ALARM AREA(S);LO LO ALARM LIMIT;LO ALARM LIMIT;HI ALARM LIMIT;HI HI ALARM LIMIT;ROC ALARM LIMIT;DEAD BAND;ALARM PRIORITY;ENABLE OUTPUT;SECURITY AREA 1;SECURITY AREA 2;SECURITY AREA 3;ALARM AREA 1;ALARM AREA 2;ALARM AREA 3;ALARM AREA 4;ALARM AREA 5;ALARM AREA 6;ALARM AREA 7;ALARM AREA 8;ALARM AREA 9;ALARM AREA 10;ALARM AREA 11;ALARM AREA 12;ALARM AREA 13;ALARM AREA 14;ALARM AREA 15;USER FIELD 1;USER FIELD 2;ESIG TYPE;ESIG ALLOW CONT USE;ESIG XMPT ALARM ACK;ESIG UNSIGNED WRITES;PDR Update Rate;PDR Access Time;PDR Deadband;PDR Latch;PDR Disable Output;PDR Array Length;Hist Description;Hist Collect;Hist Interval;Hist Offset;Hist Time Res;Hist Compress;Hist Deadband;Hist Comp Type;Hist Comp Time;Scale Enabled;Scale Clamping;Scale Use EGU;Scale Raw Low;Scale Raw High;Scale Low;Scale High]
!A_NAME;A_TAG;A_NEXT;A_DESC;A_ISCAN;A_SCANT;A_SMOTH;A_IODV;A_IOHT;A_IOAD;A_IOSC;A_ELO;A_EHI;A_EGUDESC;A_IAM;A_IENAB;A_ADI;A_LOLO;A_LO;A_HI;A_HIHI;A_ROC;A_DBAND;A_PRI;A_EOUT;A_SA1;A_SA2;A_SA3;A_AREA1;A_AREA2;A_AREA3;A_AREA4;A_AREA5;A_AREA6;A_AREA7;A_AREA8;A_AREA9;A_AREA10;A_AREA11;A_AREA12;A_AREA13;A_AREA14;A_AREA15;A_ALMEXT1;A_ALMEXT2;A_ESIGTYPE;A_ESIGCONT;A_ESIGACK;A_ESIGTRAP;A_PDR_UPDATERATE;A_PDR_ACCESSTIME;A_PDR_DEADBAND;A_PDR_LATCHDATA;A_PDR_DISABLEOUT;A_PDR_ARRAYLENGTH;A_HIST_DESC;A_HIST_COLLECT;A_HIST_INTERVAL;A_HIST_OFFSET;A_HIST_TIMERES;A_HIST_COMPRESS;A_HIST_DEADBAND;A_HIST_COMPTYPE;A_HIST_COMPTIME;A_SCALE_ENABLED;A_SCALE_CLAMP;A_SCALE_USEEGU;A_SCALE_RAWLOW;A_SCALE_RAWHIGH;A_SCALE_LOW;A_SCALE_HIGH!",
    IfixDigitalPrefix="[BLOCK TYPE;TAG;NEXT BLOCK;DESCRIPTION;I/O DEVICE;H/W OPTIONS;I/O ADDRESS;INITIAL A/M STATUS;INITIAL SCAN;SCAN TIME;INVERT OUTPUT;OPEN TAG;CLOSE TAG;ALARM ENABLE;ALARM AREA(S);ALARM PRIORITY;ALARM TYPE;EVENT MESSAGES;SECURITY AREA 1;SECURITY AREA 2;SECURITY AREA 3;ENABLE OUTPUT;ALARM AREA 1;ALARM AREA 2;ALARM AREA 3;ALARM AREA 4;ALARM AREA 5;ALARM AREA 6;ALARM AREA 7;ALARM AREA 8;ALARM AREA 9;ALARM AREA 10;ALARM AREA 11;ALARM AREA 12;ALARM AREA 13;ALARM AREA 14;ALARM AREA 15;USER FIELD 1;USER FIELD 2;ESIG TYPE;ESIG ALLOW CONT USE;ESIG XMPT ALARM ACK;ESIG UNSIGNED WRITES;PDR Update Rate;PDR Access Time;PDR Deadband;PDR Latch;PDR Disable Output;PDR Array Length;Hist Description;Hist Collect;Hist Interval;Hist Offset;Hist Time Res;Hist Compress;Hist Deadband;Hist Comp Type;Hist Comp Time]
!A_NAME;A_TAG;A_NEXT;A_DESC;A_IODV;A_IOHT;A_IOAD;A_IAM;A_ISCAN;A_SCANT;A_INV;A_OPENDESC;A_CLOSEDESC;A_IENAB;A_ADI;A_PRI;A_ALMCK;A_EVENT;A_SA1;A_SA2;A_SA3;A_EOUT;A_AREA1;A_AREA2;A_AREA3;A_AREA4;A_AREA5;A_AREA6;A_AREA7;A_AREA8;A_AREA9;A_AREA10;A_AREA11;A_AREA12;A_AREA13;A_AREA14;A_AREA15;A_ALMEXT1;A_ALMEXT2;A_ESIGTYPE;A_ESIGCONT;A_ESIGACK;A_ESIGTRAP;A_PDR_UPDATERATE;A_PDR_ACCESSTIME;A_PDR_DEADBAND;A_PDR_LATCHDATA;A_PDR_DISABLEOUT;A_PDR_ARRAYLENGTH;A_HIST_DESC;A_HIST_COLLECT;A_HIST_INTERVAL;A_HIST_OFFSET;A_HIST_TIMERES;A_HIST_COMPRESS;A_HIST_DEADBAND;A_HIST_COMPTYPE;A_HIST_COMPTIME!",
    file:write_file("c:/dp4/config/igs_mpk1_tags.csv",list_to_binary([IgsPrefix,"\n",IgsMPK1Data])),
    file:write_file("c:/dp4/config/igs_mpk2_tags.csv",list_to_binary([IgsPrefix,"\n",IgsMPK2Data])),
    file:write_file("c:/dp4/config/igs_mpkz_tags.csv",list_to_binary([IgsPrefix,"\n",IgsMPKZData])),
    file:write_file("c:/dp4/config/ifix_ai_tags.csv",list_to_binary([IfixAnalogPrefix,"\n",IfixAnalogData])),
    file:write_file("c:/dp4/config/ifix_di_tags.csv",list_to_binary([IfixDigitalPrefix,"\n",IfixDigitalData])).

build_tags_shared_conf() ->
    {ok,TagsList}=file:consult("c:/dp4/config/debug/tags_shared.conf"),
    Tags=lists:foldr(
        fun({tag, TagName, TagType, TagDesc, TagDriver, _TagAddress, TagAlarming, TagAlarmLevel, TagOptions},Acc) ->
            case TagDriver==scada_driver_modbus of
                false ->
                   Acc;
                true ->
                    TagDescStr=lists:flatten(re:replace(lists:flatten(io_lib:format("~ts",[TagDesc])),"\\\"","\\\\\\\"",[global,{return,list},bsr_unicode])),
                    case TagType of
                        scada_tag_analog ->
                            TagOptionsStr=lists:flatten(
                                io_lib:format(
                                    "[{units,\"~ts\"},~w,~w,~w,~w,~w,~w]",
                                    [
                                        proplists:get_value(units,TagOptions),
                                        {lolo,proplists:get_value(lolo,TagOptions)},
                                        {lo,proplists:get_value(lo,TagOptions)},
                                        {hi,proplists:get_value(hi,TagOptions)},
                                        {hihi,proplists:get_value(hihi,TagOptions)},
                                        {scale,proplists:get_value(scale,TagOptions)},
                                        {shift,proplists:get_value(shift,TagOptions)}                                                 
                                    ]
                                )
                            ),
                            [list_to_binary(lists:flatten(io_lib:format("{tag,\"~ts\",~w,\"~ts\",scada_driver_ifix,\"~ts\",~w,~w,~ts}.~n",[TagName, TagType, TagDescStr, lists:flatten(io_lib:format("~ts|DP4.~ts.F_CV",["F",TagName])), TagAlarming, TagAlarmLevel, TagOptionsStr])))|Acc];
                        scada_tag_digital ->
                            [{units,{OpenLabel,CloseLabel}},{alarm,AlarmCondition}]=TagOptions,
                            TagOptionsStr=lists:flatten(
                                io_lib:format(
                                    "[{units,{\"~ts\",\"~ts\"}},{alarm,~w}]",
                                    [
                                        OpenLabel,
                                        CloseLabel,
                                        AlarmCondition
                                    ]
                                )
                            ),
                            [list_to_binary(lists:flatten(io_lib:format("{tag,\"~ts\",~w,\"~ts\",scada_driver_ifix,\"~ts\",~w,~w,~ts}.~n",[TagName, TagType, TagDescStr, lists:flatten(io_lib:format("~ts|DP4.~ts.F_CV",["B",TagName])), TagAlarming, TagAlarmLevel, TagOptionsStr])))|Acc]
                    end
            end
        end,
        [],
        TagsList
    ),
    file:write_file("c:/dp4/config/production/tags_shared.conf",list_to_binary([Tags])).

get_tags_list() ->
    Key=tags_list,
    case scada_share:get_value(Key) of
        undefined ->
            [];
        Value ->
            Value
    end.

remove_quotes(List) ->
    remove_quotes(List,[]).

remove_quotes([],Res) ->
    lists:reverse(Res);
remove_quotes([34|Tail],Res) ->
    remove_quotes(Tail,Res);
remove_quotes([39|Tail],Res) ->
    remove_quotes(Tail,Res);
remove_quotes([Head|Tail],Res) ->
    remove_quotes(Tail,[Head|Res]).


test() ->
    {ok,TagsList}=file:consult("c:/dp4/config/debug/tags_shared.conf"),
    Tags=lists:foldr(
        fun({tag, TagName, TagType, TagDesc, TagDriver, _TagAddress, _TagAlarming, _TagAlarmLevel, _TagOptions},Acc) ->
            case TagDriver==scada_driver_modbus of
                false ->
                   Acc;
                true ->
                    TagDescStr=lists:flatten(re:replace(lists:flatten(io_lib:format("~ts",[TagDesc])),"\\\"","\\\\\\\"",[global,{return,list},bsr_unicode])),
                    case TagType of
                        scada_tag_analog ->
                           Acc;
                        scada_tag_digital ->
                            [list_to_binary(lists:flatten(io_lib:format("\"~ts\"|\"~ts\"~n",[TagName, TagDescStr])))|Acc]
                    end
            end
        end,
        [],
        TagsList
    ),
    file:write_file("c:/dp4/temp/1.conf",list_to_binary([Tags])).