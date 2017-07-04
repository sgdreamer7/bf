-module(action_event).
-author('Maxim Sokhatsky').
-include_lib("n2o/include/wf.hrl").
-compile(export_all).

render_action(#event{source=undefined}) -> [];

render_action(#event{postback={binary,Value},target=Control,type=Type}) ->
    PostbackBin = wf_event:new(binary,Value),
    [wf:f("document.getElementById('~s').addEventListener('~s',function (event){", [Control,Type]),PostbackBin,"});"];

render_action(#event{postback=Postback,actions=Actions,source=Source,target=Control,type=Type,delegate=Delegate}) ->
    Data = "[" ++ string:join([begin 
        {Key, Id} = if  is_atom(Src)-> S = atom_to_list(Src),
                        {"atom('"++S++"')", S};
                    true -> {"utf8.toByteArray('" ++ Src ++ "')", Src} end,
        "tuple(" ++ Key ++ ", querySource('" ++ Id ++ "'))" end || Src <- Source]
    ++ ["tuple(tuple(utf8.toByteArray('"++ Control ++"'), bin('detail')), event.detail)"],",") ++ "]",
    PostbackBin = wf_event:new(Postback, Control, Delegate, event, Data),
    [wf:f("document.getElementById('~s').addEventListener('~s',function (event){", [Control,Type]),PostbackBin,"});"].

