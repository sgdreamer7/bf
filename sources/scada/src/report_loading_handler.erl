%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @author Владимир Щербина <vns.scherbina@gmail.com>
%% @copyright 2017
%% @version 1.1.0
%% @doc Модуль <b>{@module}</b> реализует обработчик страницы ожидания загрузки рапорта для HTTP-сервера.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
-module(report_loading_handler).

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
	Html = get_html(),
	{ok, Req2} = cowboy_req:reply(200,
		[{<<"content-type">>, <<"text/html">>}],
		Html, Req),
	{ok, Req2, State}.

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

get_html() ->
	<<"<?xml version=\"1.0\" encoding=\"UTF-8\"?>
<!DOCTYPE html
    PUBLIC \"-//W3C//DTD XHTML 1.0 Strict//EN\"
    \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd\">
<html xmlns=\"http://www.w3.org/1999/xhtml\">
	<head>
	</head>
	<body>
		<h1>Формирование и загрузка рапорта...</h1>
	</body>
</html>">>.