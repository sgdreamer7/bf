%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @author Владимир Щербина <vns.scherbina@gmail.com>
%% @copyright 2017
%% @version 1.1.0
%% @doc Модуль <b>{@module}</b> реализует обработчик страницы загрузки 
%% клиентского приложения hmi для HTTP-сервера.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
-module(get_hmi_handler).

-export([init/3]).
-export([handle/2]).
-export([terminate/3]).

%%%%%%%%%%%%%%%%%%%%%%
%%% public функции %%%
%%%%%%%%%%%%%%%%%%%%%%

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (_Transport, Req, []) -> term
%% @doc <i>Инициализация запроса</i>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
init(_Transport, Req, []) ->
	{ok, Req, undefined}.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Req, State) -> term
%% @doc <i>Обработка запроса</i>
%% <p>
%% <b>Req</b> - запрос по протоколу HTTP;<br/>
%% <b>State</b> - состояние обработчика запроса.
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
handle(Req, State) ->
	{ScreenBin, Req2} = cowboy_req:qs_val(<<"screen">>, Req,<<"0">>),
	{Host, Req3} = cowboy_req:host(Req2),
	{Port, Req4} = cowboy_req:port(Req3),
    MaxHeapSize=scada:get_app_env(client_max_heap_size,800),
    ClientsBackend=scada:get_app_env(clients_backend,[{"localhost",5001}]),
    ClientsBackendBin=list_to_binary(
        string:join(
            lists:map(
                fun({BackendHost,BackendPort}) ->
                    lists:flatten([lists:flatten(io_lib:format("~ts",[BackendHost])),":",io_lib:format("~w",[BackendPort])])
                end,
                ClientsBackend
            ),
            ","
        )
    ),
	ClientsBackcolor=scada:get_app_env(client_backcolor,16#ffffff),
    ClientsLoginPath=scada:get_app_env(clients_login_path,"c:/dp4/temp/pwd.txt"),
    ServerUrlBin=list_to_binary(["http://",lists:flatten(io_lib:format("~ts",[Host])),":",io_lib:format("~w",[Port])]),
    MaxHeapSizeBin=list_to_binary([lists:flatten(io_lib:format("~w",[MaxHeapSize]))]),
    ClientsBackcolorBin=list_to_binary([lists:flatten(io_lib:format("~w",[ClientsBackcolor]))]),
    ClientsLoginPathBin=list_to_binary(lists:flatten(io_lib:format("~ts",[ClientsLoginPath]))),
	Jnlp = get_jnlp(ServerUrlBin,ScreenBin,ClientsBackendBin,MaxHeapSizeBin,ClientsBackcolorBin,ClientsLoginPathBin),
	{ok, Req5} = cowboy_req:reply(200,
		[{<<"content-type">>, <<"application/x-java-jnlp-file">>}],
		Jnlp, Req4),
	{ok, Req5, State}.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (_Reason, _Req, _State) -> ok
%% @doc <i>Завершение запроса</i>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
terminate(_Reason, _Req, _State) ->
	ok.


%%%%%%%%%%%%%%%%%%%%%%%
%%% private функции %%%
%%%%%%%%%%%%%%%%%%%%%%%
%  -XX:MaxPermSize=128M -XX:NewSize=120m -XX:MaxNewSize=120m -XX:ParallelGCThreads=8 -XX:ConcGCThreads=8 -XX:+CMSClassUnloadingEnabled -XX:+UseConcMarkSweepGC -XX:MaxHeapFreeRatio=2 -XX:MinHeapFreeRatio=1
get_jnlp(ServerUrlBin,ScreenBin,ClientsBackendBin,MaxHeapSizeBin,ClientsBackcolorBin,ClientsLoginPathBin) ->
	list_to_binary([<<"<?xml version=\"1.0\" encoding=\"utf-8\" standalone=\"no\"?>
<jnlp spec=\"1.0+\" codebase=\"">>,ServerUrlBin,<<"/\" href=\"hmi?screen=">>,ScreenBin,<<"\">
    <information>
        <locale>ru_RU</locale>
        <title>SCADA-HMI</title>
        <vendor>Владимир Щербина</vendor>
        <homepage href=\"\"/>
        <description>Человеко-машинный интерфейс, клиентское приложение</description>
        <description kind=\"short\">SCADA-HMI</description>
        <offline-allowed/>
    </information>
    <security>
        <all-permissions/>
    </security>
    <update check=\"always\" policy=\"always\"/>
    <resources>
        <j2se version=\"1.6+\" initial-heap-size=\"32m\" max-heap-size=\"">>,MaxHeapSizeBin,<<"m\" java-vm-args=\"-Xverify:none -XX:CompileThreshold=70\"/>
        <jar eager=\"true\" href=\"/jars/hmi.jar\" main=\"true\"/>
        <jar href=\"/jars/lib/core-renderer.jar\"/>
        <jar href=\"/jars/lib/httpclient-4.2.3.jar\"/>
        <jar href=\"/jars/lib/httpcore-4.2.3.jar\"/>
        <jar href=\"/jars/lib/java-getopt-1.0.13.jar\"/>
        <jar href=\"/jars/lib/jcommon-1.0.17.jar\"/>
        <jar href=\"/jars/lib/jfreechart-1.0.13.jar\"/>
        <jar href=\"/jars/lib/ostermillerutils-1.08.00.jar\"/>
        <jar href=\"/jars/lib/pdf-transcoder.jar\"/>
        <jar href=\"/jars/lib/serializer.jar\"/>
        <jar href=\"/jars/lib/xalan.jar\"/>
        <jar href=\"/jars/lib/xercesImpl.jar\"/>
        <jar href=\"/jars/lib/xml-apis-ext.jar\"/>
        <jar href=\"/jars/lib/xml-apis.jar\"/>
        <jar href=\"/jars/lib/pdfbox-1.8.0.jar\"/>
        <jar href=\"/jars/lib/fontbox-1.8.0.jar\"/>
        <jar href=\"/jars/lib/jempbox-1.8.0.jar\"/>
        <jar href=\"/jars/lib/preflight-1.8.0.jar\"/>
        <jar href=\"/jars/lib/xmpbox-1.8.0.jar\"/>
        <jar href=\"/jars/lib/commons-lang3-3.2.1.jar\"/>
        <extension href=\"itext\"/>
    </resources>
    <application-desc main-class=\"com.cmas.hmi.Main\">
        <argument>--url</argument>
        <argument>">>,ServerUrlBin,<<"/svg/main.svg</argument>
        <argument>--screen</argument>
        <argument>">>,ScreenBin,<<"</argument>
        <argument>--backend</argument>
        <argument>">>,ClientsBackendBin,<<"</argument>
        <argument>--backcolor</argument>
        <argument>">>,ClientsBackcolorBin,<<"</argument>
        <argument>--loginpath</argument>
        <argument>">>,ClientsLoginPathBin,<<"</argument>
    </application-desc>
</jnlp>">>]).
        % <j2se version=\"1.6+\" initial-heap-size=\"32m\" max-heap-size=\"">>,MaxHeapSizeBin,<<"m\" java-vm-args=\"-Xverify:none -XX:CompileThreshold=70\"/>
        % <j2se version=\"1.6+\" initial-heap-size=\"32m\" max-heap-size=\"">>,MaxHeapSizeBin,<<"m\" java-vm-args=\"-Xverify:none -XX:CompileThreshold=70 -XX:MaxPermSize=128Ь -XX:NewSize=120m -XX:MaxNewSize=120m -XX:ParallelGCThreads=8 -XX:ConcGCThreads=8 -XX:+CMSClassUnloadingEnabled -XX:+UseConcMarkSweepGC -XX:MaxHeapFreeRatio=2 -XX:MinHeapFreeRatio=1\"/>
        