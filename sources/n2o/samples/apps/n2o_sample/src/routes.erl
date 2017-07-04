-module(routes).
-author('Maxim Sokhatsky').
-include_lib("n2o/include/wf.hrl").
-export([init/2, finish/2]).

%% U can use default dynamic routes or define custom static as this
%% Just put needed module name to sys.config:
%% {n2o, [{route,routes}]}
%% Also with dynamic routes u must load all modules before starting Cowboy
%% [code:ensure_loaded(M) || M <- [index, login, ... ]]

finish(State, Ctx) -> {ok, State, Ctx}.
init(State, Ctx) -> 
    Path = wf:path(Ctx#context.req),
    wf:info(?MODULE,"Route: ~p~n",[Path]),
    {ok, State, Ctx#context{path=Path,module=route_prefix(Path)}}.

route_prefix(<<"/ws/",P/binary>>) -> route(P);
route_prefix(<<"/",P/binary>>) -> route(P);
route_prefix(P) -> route(P).

route(<<>>)              -> index;
route(<<"index">>)       -> index;
route(<<"index2">>)       -> index2;
route(<<"login">>)       -> login;
route(<<"favicon.ico">>) -> static_file;
route(<<"static/spa/spa.htm">>) -> login;
route(<<"static/spa/index.htm">>) -> index;
route(_) -> index.
