%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @author Владимир Щербина <vns.scherbina@gmail.com>
%% @copyright 2017
%% @version 1.1.0
%% @doc Модуль <b>{@module}</b> реализует обработчик страницы загрузки компонента
%%% iText клиентского приложения hmi для HTTP-сервера.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
-module(get_itext_handler).

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
	{Host, Req3} = cowboy_req:host(Req),
	{Port, Req4} = cowboy_req:port(Req3),
	ServerUrlBin=list_to_binary(["http://",lists:flatten(io_lib:format("~ts",[Host])),":",io_lib:format("~w",[Port])]),
	Jnlp = get_jnlp(ServerUrlBin),
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

get_jnlp(ServerUrlBin) ->
	list_to_binary([<<"<?xml version=\"1.0\" encoding=\"UTF-8\"?>
<jnlp spec=\"1.0+\" codebase=\"">>,ServerUrlBin,<<"/\" href=\"itext\">
    <information>
        <title>jnlpcomponent1</title>
        <vendor>BRUNO_LO</vendor>
    </information>
    <security>
        <all-permissions/>
    </security>
    <resources>
        <jar href=\"/jars/lib/iText-2.0.8.jar\" download=\"eager\"/>
    </resources>
    <component-desc/>
</jnlp>">>]).