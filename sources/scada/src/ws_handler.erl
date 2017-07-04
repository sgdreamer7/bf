%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @author Владимир Щербина <vns.scherbina@gmail.com>
%% @copyright 2017
%% @version 1.1.0
%% @doc Модуль <b>{@module}</b> реализует обработчик соединений по протоколу Websocket.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
-module(ws_handler).
-behaviour(cowboy_websocket_handler).

-export([init/3]).
-export([websocket_init/3]).
-export([websocket_handle/3]).
-export([websocket_info/3]).
-export([websocket_terminate/3]).
-compile([export_all]).
-include_lib("scada/include/tags.hrl").

%%%%%%%%%%%%%%%%%%%%%%
%%% public функции %%%
%%%%%%%%%%%%%%%%%%%%%%

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec ({tcp, http}, _Req, _Opts) -> term
%% @doc <i>Инициализация протокола Websocket</i>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
init({tcp, http}, _Req, _Opts) ->
	{upgrade, protocol, cowboy_websocket}.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (_TransportName, Req, _Opts) -> term
%% @doc <i>Инициализация соединения</i>
%% <p>
%% <b>Req</b> - запрос.
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
websocket_init(_TransportName, Req, _Opts) ->
	{ok, Req, undefined_state}.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec ({text, Msg}, Req, State) -> term
%% @doc <i>Обработка текстового запроса по протоколу Websocket</i>
%% <p>
%% <b>Msg</b> - текст запроса по протоколу Websocket;<br/>
%% <b>Req</b> - запрос по протоколу HTTP;<br/>
%% <b>State</b> - состояние обработчика запроса.
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
websocket_handle({text, Msg}, Req, State) ->
    {ClientIP, Req2} = cowboy_req:peer_addr(Req),
    AllowedIPs=scada:get_app_env(read_write_ip,[{127,0,0,1}]),
    AllowedWriteOperations=lists:member(ClientIP,AllowedIPs),
	List=binary_to_list(Msg),
    {ok,Json}=json2:decode_string(List),
    Reply=process_request(Json,AllowedWriteOperations),
    garbage_collect(),
	{reply, Reply, Req2, State};

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (_Data, Req, State) -> term
%% @doc <i>Обработка других запросов по протоколу Websocket</i>
%% <p>
%% <b>Req</b> - запрос по протоколу HTTP;<br/>
%% <b>State</b> - состояние обработчика запроса.
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
websocket_handle(_Data, Req, State) ->
	{ok, Req, State}.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (_Info, Req, State) -> term
%% @doc <i>Обработка сообщений</i>
%% <p>
%% <b>Req</b> - запрос по протоколу HTTP;<br/>
%% <b>State</b> - состояние обработчика запроса.
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
websocket_info(_Info, Req, State) ->
    {ok, Req, State}.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (_Reason, _Req, _State) -> ok
%% @doc <i>Обработка завершения соединения</i>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
websocket_terminate(_Reason, _Req, _State) ->
	ok.



%%%%%%%%%%%%%%%%%%%%%%%
%%% private функции %%%
%%%%%%%%%%%%%%%%%%%%%%%

process_request({struct,Values},AllowedWriteOperations) ->
    Command=proplists:get_value("command",Values,undefined),
    {struct,Args}=proplists:get_value("args",Values,undefined),
    MsgId=proplists:get_value("msgid",Values,undefined),
    case catch(process_command(Command,Args,AllowedWriteOperations)) of
        {reply,Reply} when is_binary(Reply) ->
            {binary,Reply};
        {reply,Reply} ->
            {text,list_to_binary(json2:encode({struct,[{"command",Command},{"result",Reply},{"msgid",MsgId}]}))};
        _ ->
            {text,list_to_binary(json2:encode({struct,[{"command",""},{"result",""},{"msgid",MsgId}]}))}
    end;
process_request(_NotJson,_AllowedWriteOperations) ->
    {text,list_to_binary(json2:encode({struct,[{"command",""},{"result",""},{"msgid",""}]}))}.

process_command("updated_tag",Args,_) ->
    TagName=proplists:get_value("name",Args,""),
    Reply=case scada_share:get_value({tag,TagName}) of
        undefined ->
            {struct,[{"name",TagName},{"fields",{struct,[]}}]};
        Value ->
            Type=Value#tag.type,
            AllFields=Type:get_field(Value,"A_FIELDS"),
            FieldsNames=string:tokens(AllFields,","),
            FieldsValues=lists:map(
                fun(FieldName) ->
                    FieldValue=Type:get_field(Value,FieldName),
                    {FieldName,FieldValue}
                end,
                FieldsNames
            ),
            {struct,[{"name",TagName},{"fields",{struct,FieldsValues}}]}
    end,
    {reply,Reply};
    % noreply;
process_command("acknowledge_message",Args,true) ->
    MessageID=proplists:get_value("id",Args,""),
    scada_alarms:acknowledge_alarm(MessageID),
    noreply;
process_command("acknowledge_messages",Args,true) ->
    {array,MessagesIDs}=proplists:get_value("ids",Args,undefined),
    lists:foreach(
        fun(MessageID) ->
            scada_alarms:acknowledge_alarm(MessageID)
        end,
        MessagesIDs
    ),
    noreply;
process_command("get_all_messages",_Args,_) ->
    Result=get_messages(),
    {reply,{array,Result}};
process_command("get_messages",Args,_) ->
    Start=proplists:get_value("start",Args,0),
    Finish=proplists:get_value("finish",Args,0),
    Result=get_messages(Start,Finish),
    {reply,{array,Result}};
process_command("get_all_tags",Args,_) ->
    {struct,BoolTags}=proplists:get_value("bool_data",Args,{struct,[]}),
    {struct,FltTags}=proplists:get_value("flt_data",Args,{struct,[]}),
    {struct,StrTags}=proplists:get_value("str_data",Args,{struct,[]}),
    BoolResult=get_tags_values(BoolTags,default_value("bool")),
    FltResult=get_tags_values(FltTags,default_value("flt")),
    StrResult=get_tags_values(StrTags,default_value("str")),
    {
        reply,
        {struct,
            [
                {"bool_data",{struct,BoolResult}},
                {"flt_data",{struct,FltResult}},
                {"str_data",{struct,StrResult}}
            ]
        }
    };
process_command("get_all_tags_untyped",Args,_) ->
    {struct,Tags}=proplists:get_value("data",Args,{struct,[]}),
    {Time,TagsResult}=timer:tc(?MODULE,get_tags_values,[Tags]),
    % io:format("~p, ~p, ~p~n",[erlang:now(),length(Tags),Time]),
    {
        reply,
        {struct,
            [
                {"data",{struct,TagsResult}}
            ]
        }
    };
process_command("immediate_get_all_tags",Args,_) ->
    {struct,BoolTags}=proplists:get_value("bool_data",Args,{struct,[]}),
    {struct,FltTags}=proplists:get_value("flt_data",Args,{struct,[]}),
    {struct,StrTags}=proplists:get_value("str_data",Args,{struct,[]}),
    BoolResult=get_tags_values(BoolTags,default_value("bool")),
    FltResult=get_tags_values(FltTags,default_value("flt")),
    StrResult=get_tags_values(StrTags,default_value("str")),
    {
        reply,
        {struct,
            [
                {"bool_data",{struct,BoolResult}},
                {"flt_data",{struct,FltResult}},
                {"str_data",{struct,StrResult}}
            ]
        }
    };
process_command("get_tags",Args,_) ->
    Type=proplists:get_value("type",Args,"flt"),
    {struct,Tags}=proplists:get_value("data",Args,{struct,[]}),
    Result=get_tags_values(Tags,default_value(Type)),
    {reply,{struct,[{"type",Type},{"data",{struct,Result}}]}};
process_command("immediate_get_tags",Args,_) ->
    Type=proplists:get_value("type",Args,"flt"),
    {struct,Tags}=proplists:get_value("data",Args,{struct,[]}),
    Result=get_tags_values(Tags,default_value(Type)),
    {reply,{struct,[{"type",Type},{"data",{struct,Result}}]}};
process_command("get_tags_list",_Args,_) ->
    Result=get_tags_list(),
    {reply,{array,Result}};
process_command("set_tag",Args,true) ->
    Type=proplists:get_value("type",Args,"flt"),
    TagName=proplists:get_value("name",Args,""),
    TagValue=proplists:get_value("value",Args,0.0),
    set_tag_value(Type,TagName,TagValue),
    noreply;
process_command("get_report",Args,_) ->
    Template=proplists:get_value("template",Args,""),
    Data=proplists:get_value("data",Args,""),
    {struct,ReportArgs}=proplists:get_value("args",Args,{struct,[]}),
    case catch(scada:render_template(Template,Data,{struct,ReportArgs})) of
        {ok,Result} ->
            {reply,{struct,[{result,Result}]}};
        {error,{ModuleName,Error}} ->
            io:format("Error: ~p~n~p~n",[ModuleName,Error]),
            noreply;
        _Error ->
            io:format("Error: ~p~n",[_Error]),
            noreply
    end;
process_command("get_trends_data",Props,_) ->
    StartTS=get_timestamp("start",Props),
    FinishTS=get_timestamp("finish",Props),
    Tables=get_field("tables",Props),
    TablesRows=lists:foldl(
        fun({struct,TableProps},AccIn) ->
            Table=get_field("table",TableProps),
            Fields=get_field("fields",TableProps),
            IndexField=get_field("indexfield",TableProps),
            Scale=get_field("scale",TableProps),
            Shift=get_field("shift",TableProps),
            Request=[
                {table,Table},
                {fields,[IndexField|Fields]},
                {conditions,
                    [
                        {IndexField,gte,StartTS},
                        {IndexField,lte,FinishTS}
                    ]
                },
                {orders,
                    [
                        {IndexField,asc}
                        ]
                }
            ],
            Data=case scada_db:get_data(Request) of
                [] ->
                    NewRequest=[
                        {table,Table},
                        {fields,[IndexField|Fields]},
                        {conditions,
                            [
                                {IndexField,lt,StartTS}
                            ]
                        },
                        {orders,
                            [
                                {IndexField,desc}
                                ]
                        },
                        {limit,1}
                    ],
                    NewDataRows=scada_db:get_data(NewRequest),
                    case NewDataRows of
                        [] ->
                            [];
                        [[_PreviousTimestamp|PreviousFields]] ->
                            [[StartTS|PreviousFields],[FinishTS|PreviousFields]]
                    end;
                DataRows ->
                    NewRequest=[
                        {table,Table},
                        {fields,[IndexField|Fields]},
                        {conditions,
                            [
                                {IndexField,lt,StartTS}
                            ]
                        },
                        {orders,
                            [
                                {IndexField,desc}
                                ]
                        },
                        {limit,1}
                    ],
                    NewDataRows=scada_db:get_data(NewRequest),
                    case NewDataRows of
                        [] ->
                            DataRows;
                        [[_PreviousTimestamp|PreviousFields]] ->
                            [[StartTS|PreviousFields]]++DataRows
                    end
            end,
            % io:format("Data: ~p~n",[Data]),
            FilteredData=case length(Data)>10000 of
                true ->
                    average_data(Data);
                false ->
                    Data
            end,
            % io:format("FilteredData: ~p~n",[length(FilteredData)]),
            case length(FilteredData)>0 of
                true ->
                    [LastRow|FirstRows]=lists:reverse(FilteredData),
                    [_|LastRowFields]=LastRow,
                    CorrectedData=lists:reverse([[FinishTS|LastRowFields],LastRow|FirstRows]),
                    BinData=lists:foldl(
                        fun([Timestamp|FieldsValues],AccIn2) ->
                            % io:format("~p~n",[{AccIn2,Timestamp,FieldsValues}]),
                            list_to_binary([AccIn2,format_datetime(Timestamp)|[format_float(X*Scale+Shift) || X <- FieldsValues]])
                        end,
                        list_to_binary([<<>>]),
                        CorrectedData
                    ),
                    list_to_binary([AccIn,format_int(length(CorrectedData)),format_int(length(Fields)),BinData]);
                false ->
                    AccIn
            end
        end,
        list_to_binary([<<>>]),
        Tables
    ),
    {reply,TablesRows};
process_command("get_hex_trends_data",Props,_) ->
    {reply,Bin}=process_command("get_trends_data",Props,true),
    {reply,binary_to_hexstring(Bin)};
process_command(_UndefinedCommand,_Args,_) ->
    % io:format("~p: undefined command: ~p, args: ~p~n",[?MODULE,UndefinedCommand,Args]),
    noreply.


get_messages(Begin,End) ->
    Msgs=get_messages(),
    L1=length(Msgs),
    Fun=fun(Start,Finish,L,_Messages) when Start==0,Finish==0 ->
        [
            {struct,
                [
                    {"count",L}
                ]
            }
        ];
    (Start,Finish,L,Messages) when Start>=1,Start=<L,Finish>=1,Finish=<L,Start=<Finish->
            lists:sublist(Messages,Start,Finish-Start+1);
    (_Start,_Finish,_L,_Messages) ->
            []
    end,
    Fun(Begin,End,L1,Msgs).


get_messages() ->
    Alarms=scada_alarms:get_alarms(),
    lists:map(
        fun(Alarm) ->
            #alarm{
                id=ID,
                state=State,
                priority=Priority,
                timestamp={{Year,Month,Day},{Hour,Minute,Second}},
                description=Description,
                value=Value,
                units=Units,
                acknowledged=Acknowleged
            }=Alarm,
            DateStr=lists:flatten(io_lib:format("~2..0w.~2..0w.~4..0w",[Day,Month,Year])),
            TimeStr=lists:flatten(io_lib:format("~2..0w:~2..0w:~2..0w",[Hour,Minute,Second])),
            {struct,
                [
                    {"id",ID},
                    {"date",DateStr},
                    {"time",TimeStr},
                    {"description",format_value(Description)},
                    {"priority",Priority},
                    {"value",format_value(Value)},
                    {"units",format_value(Units)},
                    {"state",format_value(State)},
                    {"acknowledged",format_value(Acknowleged)}
                ]
            }
        end,
        Alarms
    ).

get_tags_values(Tags) ->
    lists:map(
        fun({TagNameAtom,OldValue}) ->
            FullTagName=TagNameAtom,
            case FullTagName of
                [] ->
                    {TagNameAtom,OldValue};
                _ ->
                    {TagName,FieldName}=case tokens(FullTagName,".") of
                        [Tag,Field] ->
                            {Tag,Field};
                        [Tag] ->
                            {Tag,"F_CV"};
                        _ ->
                            {FullTagName,"F_CV"}
                    end,
                    TagValue=scada_tags:get_field(TagName,FieldName),
                    CheckFun=fun(undefined) ->
                            "undefined";
                        (Value) ->
                            Value
                    end,
                    CheckedTagValue=CheckFun(TagValue),
                    {TagNameAtom,CheckedTagValue}
            end
        end,
        Tags
    ).


get_tags_values(Tags,DefaultValue) ->
    lists:map(
        fun({TagNameAtom,OldValue}) ->
            FullTagName=TagNameAtom,
            case FullTagName of
                [] ->
                    {TagNameAtom,OldValue};
                _ ->
                    {TagName,FieldName}=case tokens(FullTagName,".") of
                        [Tag,Field] ->
                            {Tag,Field};
                        [Tag] ->
                            {Tag,"F_CV"};
                        _ ->
                            {FullTagName,"F_CV"}
                    end,
                    TagValue=scada_tags:get_field(TagName,FieldName),
                    CheckFun=fun(undefined) ->
                            DefaultValue;
                        % (Value) when is_list(Value) ->
                        %     unicode:characters_to_binary(Value);
                        (Value) ->
                            Value
                    end,
                    CheckedTagValue=CheckFun(TagValue),
                    {TagNameAtom,CheckedTagValue}
            end
        end,
        Tags
    ).

get_tags_list() ->
    Key=tags_list,
    TagsList=case scada_share:get_value(Key) of
        undefined ->
            [];
        Value ->
            Value
    end,
    lists:map(
        fun(TagName) ->
            format_value(TagName)
        end,
        TagsList % lists:sort(TagsList)
    ).

set_tag_value(Type,FullTagName,TagValue) ->
    case tokens(FullTagName,".") of
        [TagName,FieldName] ->
            set_tag_value(Type,TagName,FieldName,TagValue);
        [TagName] ->
            set_tag_value(Type,TagName,"F_CV",TagValue);
        _ ->
            ok
    end.

set_tag_value("bool",TagName,"F_CV",TagValue) ->
    scada_tags:set_field(TagName,"F_CV",get_bool(TagValue));
set_tag_value("str",TagName,"A_ALMCK",TagValue) ->
    scada_tags:set_field(TagName,"A_ALMCK",get_almck(unicode:characters_to_list(list_to_binary(TagValue))));
set_tag_value("str",TagName,FieldName,TagValue) ->
    scada_tags:set_field(TagName,FieldName,unicode:characters_to_list(list_to_binary(TagValue)));
set_tag_value(_Type,TagName,FieldName,TagValue) ->
    scada_tags:set_field(TagName,FieldName,TagValue).

default_value("bool") ->
    0;
default_value("flt") ->
    0.0;
default_value("int") ->
    0;
default_value("str") ->
    0;
default_value(_UnknownType) ->
    0.

format_value(Value) when is_list(Value) ->
    binary_to_list(
        unicode:characters_to_binary(Value)
    );
format_value(Value) ->
    unicode:characters_to_binary(
        lists:flatten(
            io_lib:format("~w",[Value])
        )
    ).

tokens(S,Sep) ->
    tokens(S,Sep,[],[]).

tokens([],_Sep,Tmp,Res) ->
    lists:reverse([lists:reverse(Tmp)|Res]);

tokens(S,Sep,Tmp,Res) ->
    case lists:prefix(Sep,S) of
        true ->
            {_Head,Tail}=lists:split(length(Sep),S),
            tokens(Tail,Sep,[],[lists:reverse(Tmp)|Res]);
        false ->
            [Head|Tail]=S,
            tokens(Tail,Sep,[Head|Tmp],Res)
    end.

format_datetime({{Year,Month,Day},{Hour,Minute,Second}}) ->
    list_to_binary([format_int(Day+Month*100+Year*10000),format_int(Second+Minute*100+Hour*10000)]);
format_datetime({{Year,Month,Day},{Hour,Minute,Second},_Millisecond}) ->
    list_to_binary([format_int(Day+Month*100+Year*10000),format_int(Second+Minute*100+Hour*10000)]).

format_int(Value) ->
    list_to_binary([<<Value:4/big-integer-unit:8>>]).

format_float(Value) ->
    list_to_binary([<<Value:8/big-float-unit:8>>]).

get_timestamp(FieldName,Props) ->
    Timestamp=get_field(FieldName,Props),
    Year=get_field("year",Timestamp),
    Month=get_field("month",Timestamp),
    Day=get_field("day",Timestamp),
    Hour=get_field("hour",Timestamp),
    Minute=get_field("minute",Timestamp),
    Second=get_field("second",Timestamp),
    {{Year,Month,Day},{Hour,Minute,Second}}.

get_field(Fieldname,Props) ->
    get_field(Fieldname,Props,undefined).
    
get_field(Fieldname,Props,Default) ->
    case proplists:get_value(Fieldname,Props,Default) of
        {struct,Fields} ->
            Fields;
        {array,Array} ->
            Array;
        Value ->
            Value   
    end.

get_almck("NONE") ->
    none;
get_almck("OPEN") ->
    open;
get_almck("CLOSE") ->
    close;
get_almck("CHANGE") ->
    change;
get_almck(_ALMCK) ->
    none.

get_bool(true) ->
    1;
get_bool("true") ->
    1;
get_bool(1) ->
    1;
get_bool(1.0) ->
    1;
get_bool(_Value) ->
    0.

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

average_data(Data) ->
    average_data(Data,[],[]).

average_data([],[],Res) ->
    lists:reverse(Res);
average_data([],Avg,Res) ->
    lists:reverse([average(Avg)|Res]);
average_data([[TS|Values]|Data],[],Res) ->
    average_data(Data,[[TS|Values]],Res);
average_data([[{Date,{Hour,Minute,_},_}=TS|Values]|Data],[[{Date,{Hour,Minute,_},_}=AvgTS|AvgValues]|AvgData],Res) ->
    average_data(Data,[[TS|Values],[AvgTS|AvgValues]|AvgData],Res);
average_data([[{Date,{Hour,Minute,_}}=TS|Values]|Data],[[{Date,{Hour,Minute,_}}=AvgTS|AvgValues]|AvgData],Res) ->
    average_data(Data,[[TS|Values],[AvgTS|AvgValues]|AvgData],Res);
average_data([[TS|Values]|Data],AvgData,Res) ->
    average_data(Data,[[TS|Values]],[average(AvgData)|Res]).

average(Data) ->
    average(Data,0,[]).
average([],0,_) ->
    [];
average([],Count,Res) ->
    [TS|Data]=Res,
    AvgTS=case TS of
        {Date,{Hour,Minute,_},_} ->
            {Date,{Hour,Minute,0},0};
        {Date,{Hour,Minute,_}} ->
            {Date,{Hour,Minute,0}}
    end,
    [AvgTS|[Value/Count || Value <- Data]];
average([[TS|Values]|Data],Count,[]) ->
    average(Data,Count+1,[TS|Values]);
average([[TS|Values]|Data],Count,[_ResTS|ResValues]) ->
    average(Data,Count+1,[TS|[ A+B || {A,B} <- lists:zip(Values,ResValues)]]).