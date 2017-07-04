-module(tags).
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
	Key=tags_list,
    TagsList=case scada_share:get_value(Key) of
        undefined ->
            [];
        Value ->
            Value
    end,
    {_,TagsNames}=lists:foldl(
        fun(TagName,{Count,AccIn}) ->
            {Count+1,[unicode:characters_to_binary(lists:flatten(io_lib:format("<tr><td>~ts</td><td><a href=\'/rest/tags/~ts\' target=\'_blank\'>~ts</a></td></tr>",[format_value(Count),format_value(TagName),format_value(TagName)])))|AccIn]}
        end,
        {1,[]},
        TagsList
    ),
	[<<"<html><head></head><body><h1>МК \"Завод\", Доменная печь.</h1><hr/><h1>АСУТП ДП:</h1><hr/><p><h2>Теги</h2></p><table border=\'2\'><thead><tr><th>Поле</th><th>Значение</th></tr></thead><tbody>">>,lists:reverse(TagsNames),<<"</tbody></table></body></html>">>].

get(TagNameBin,_Params) ->
    TagName=binary_to_list(TagNameBin),
	AllFields=scada_tags:get_field(TagName,"A_FIELDS"),
    FieldsNames=string:tokens(AllFields,","),
    FieldsValues=lists:map(
        fun(FieldName) ->
            FieldValue=scada_tags:get_field(TagName,FieldName),
            unicode:characters_to_binary(lists:flatten(io_lib:format("<tr><td>~ts</td><td>~ts</td></tr>",[format_value(FieldName),format_value(FieldValue)])))
        end,
        FieldsNames
    ),
	[<<"<html><head></head><body><h1>МК \"Завод\", Доменная печь.</h1><hr/><h1>АСУТП ДП:</h1><hr/><p><h2>Тег: ">>,TagNameBin,<<"</h2></p><table border=\'2\'><thead><tr><th>Поле</th><th>Значение</th></tr></thead><tbody>">>,FieldsValues,<<"</tbody></table></body></html>">>].

delete(_) -> 
	ok.

post(_) -> 
	ok.

to_html(Content) ->
	Content.

html_layout(_Req,Body) ->
	[Body].

format_value(Value) when is_list(Value) ->
    unicode:characters_to_binary(
        lists:flatten(
            io_lib:format("~ts",[Value])
        )
    );
format_value(Value) ->
    unicode:characters_to_binary(
        lists:flatten(
            io_lib:format("~w",[Value])
        )
    ).