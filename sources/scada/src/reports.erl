-module(reports).
-behaviour(rest).
-compile({parse_transform, rest}).
-record(report,{}).
-export([init/0, exists/1, get/0, get/2, post/1, delete/1,to_html/1,html_layout/2]).
-rest_record(report).

init() -> 
	ok.
exists(_ReportID) -> 
	true.
get() -> 
	[<<"<html><head><script src=\'/userscripts/reports.js\'></script><script src=\'/userscripts/all_reports.js\'></script></head><body></body></html>">>].

get(ReportID,Params) ->
    Template=binary_to_list(ReportID),
    case Params of
    	[] ->
    		<<"">>;
    	[DataBin|OtherParams] ->
    		Data=binary_to_list(DataBin),
    		ReportArgs=collect_args(OtherParams),
		    case catch(scada:render_template(Template,Data,{struct,ReportArgs})) of
		        {ok,Result} ->
		            Result;
		        {error,{ModuleName,Error}} ->
		            list_to_binary(io_lib:format("Error: ~p~n~p~n",[ModuleName,Error]));
		        _Error ->
		            list_to_binary(io_lib:format("Error: ~p~n",[_Error]))
		    end
	end.

delete(_) -> 
	ok.

post(_) -> 
	ok.

to_html(Content) ->
	Content.

collect_args(Args) ->
	collect_args(Args,[]).

collect_args([],AccIn) ->
	AccIn;
collect_args([ArgNameBin],AccIn) ->
	collect_args([],[{binary_to_list(ArgNameBin),undefined}|AccIn]);
collect_args([ArgNameBin,ArgValueBin|Tail],AccIn) ->
	ArgName=binary_to_list(ArgNameBin),
	case ArgName of
		"report_date" ->
			collect_args(Tail,[{ArgName,build_timestamp(ArgValueBin)}|AccIn]);
		"report_date2" ->
			collect_args(Tail,[{ArgName,build_timestamp(ArgValueBin)}|AccIn]);
		_ ->
			collect_args(Tail,[{ArgName,binary_to_list(ArgValueBin)}|AccIn])
	end.

build_timestamp(Bin) ->
	Str=binary_to_list(Bin),
	case io_lib:fread("~d-~d-~d-~d-~d-~d", Str) of
	    {error, _} ->
	    	{
	    		struct,
	    		[
	    			{"year",0},
	    			{"month",0},
	    			{"day",0},
	    			{"hour",0},
	    			{"minute",0},
	    			{"second",0}
	    		]
	    	};
	    {ok,[Year,Month,Day,Hour,Minute,Second],[]} ->
    		{
	    		struct,
	    		[
	    			{"year",Year},
	    			{"month",Month},
	    			{"day",Day},
	    			{"hour",Hour},
	    			{"minute",Minute},
	    			{"second",Second}
	    		]
	    	};
	    _Other ->
	    	{
	    		struct,
	    		[
	    			{"year",0},
	    			{"month",0},
	    			{"day",0},
	    			{"hour",0},
	    			{"minute",0},
	    			{"second",0}
	    		]
	    	}
	end.

html_layout(_Req,Body) ->
	[Body].