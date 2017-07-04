%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @author Владимир Щербина <vns.scherbina@gmail.com>
%% @copyright 2017
%% @version 1.1.0
%% @doc Модуль <b>{@module}</b> реализует интерфейс взаимодествия
%% с устройствами по протоколу SNMP.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
-module(scada_snmp).

-behaviour(snmpm_user).

-export(
    [
        handle_error/3,
        handle_agent/5,
        handle_pdu/4,
        handle_trap/3,
        handle_inform/3,
        handle_report/3
    ]
).

-export(
    [
        get_value/2,
        get_value/3,
        get_values/2,
        get_values/3,
        get_table/2,
        get_table/3
    ]
).

-include("PowerNet-MIB.hrl").
-include("WESTERMO-LYNX-MIB.hrl").

%%%%%%%%%%%%%%%%%%%%%%
%%% public функции %%%
%%%%%%%%%%%%%%%%%%%%%%

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Agent,OID) -> term() | undefined
%% @doc <i>Чтение значения объекта</i>
%% <p>
%% <b>Agent</b> - идентификатор snmp-агента;<br/>
%% <b>OID</b> - идентификатор объекта.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
get_value(Agent,OID) ->
    get_value(Agent,OID,[]).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Agent,OID,SendOptions) -> term() | undefined
%% @doc <i>Чтение значения объекта, с указанием опций по передаче информации</i>
%% <p>
%% <b>Agent</b> - идентификатор snmp-агента;<br/>
%% <b>OID</b> - идентификатор объекта;<br/>
%% <b>SendOptions</b> - список опций.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
get_value(Agent,OID,SendOptions) ->
    case snmpm:sync_get2("snmpuser",Agent,[OID],SendOptions) of
        {ok,{_,_,VarBinds},_} ->
            case VarBinds of
                [{varbind, _Oid, _, Val, _}] ->
                    case Val of
                        'NULL' ->
                            undefined;
                        noSuchObject ->
                            undefined;
                        _ ->
                            Val
                    end;
                _ ->
                    undefined
            end;
        _Other ->
            undefined
    end.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Agent,OIDs) -> list() | undefined
%% @doc <i>Чтение значений объектов</i>
%% <p>
%% <b>Agent</b> - идентификатор snmp-агента;<br/>
%% <b>OIDs</b> - список идентификаторов объектов.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
get_values(Agent,OIDs) ->
    get_values(Agent,OIDs,[]).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Agent,OIDs,SendOptions) -> list() | undefined
%% @doc <i>Чтение значений объектов, с указанием опций по передаче информации</i>
%% <p>
%% <b>Agent</b> - идентификатор snmp-агента;<br/>
%% <b>OIDs</b> - список идентификаторов объектов;<br/>
%% <b>SendOptions</b> - список опций.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
get_values(Agent,OIDs,SendOptions) ->
    lists:map(
        fun(OID) ->
            {OID,get_value(Agent,OID,SendOptions)}
        end,
        OIDs 
    ).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Agent,TableEntryOID) -> term() | undefined
%% @doc <i>Чтение значений таблицы</i>
%% <p>
%% <b>Agent</b> - идентификатор snmp-агента;<br/>
%% <b>OID</b> - идентификатор записи таблицы.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
get_table(Agent,TableEntryOID) ->
    get_table(Agent,TableEntryOID,[]).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Agent,TableEntryOID,SendOptions) -> term() | undefined
%% @doc <i>Чтение значений таблицы, с указанием опций по передаче информации</i>
%% <p>
%% <b>Agent</b> - идентификатор snmp-агента;<br/>
%% <b>OID</b> - идентификатор записи таблицы;<br/>
%% <b>SendOptions</b> - список опций.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
get_table(Agent,TableEntryOID,SendOptions) ->
    case snmpm:sync_get_next2("snmpuser",Agent,[TableEntryOID],SendOptions) of
        {ok,{_,_,VarBinds},_} ->
            case VarBinds of
                [{varbind, NextOID, _, Val, _}] ->
                    Value=case Val of
                        'NULL' ->
                            undefined;
                        noSuchObject ->
                            undefined;
                        _ ->
                            Val
                    end,
                    [Instance,Column|_]=lists:reverse(NextOID),
                    Acc=gb_trees:enter(Instance,gb_trees:enter(Column,Value,gb_trees:empty()),gb_trees:empty()),
                    get_table(Agent,TableEntryOID,NextOID,SendOptions,Acc);
                _ ->
                    gb_trees:empty()
            end;
        _Other ->
            undefined
    end.

get_table(Agent,TableEntryOID,NextOID,SendOptions,Acc) ->
    case lists:prefix(TableEntryOID,NextOID) of
        true ->
            case snmpm:sync_get_next2("snmpuser",Agent,[NextOID],SendOptions) of
                {ok,{_,_,VarBinds},_} ->
                    case VarBinds of
                        [{varbind, NewNextOID, _, Val, _}] ->
                            Value=case Val of
                                'NULL' ->
                                    undefined;
                                noSuchObject ->
                                    undefined;
                                _ ->
                                    Val
                            end,
                            [Instance,Column|_]=lists:reverse(NewNextOID),
                            Row=case gb_trees:lookup(Instance,Acc) of
                                {value,FoundRow} ->
                                    FoundRow;
                                none ->
                                    gb_trees:empty()
                            end,
                            NewAcc=gb_trees:enter(Instance,gb_trees:enter(Column,Value,Row),Acc),
                            get_table(Agent,TableEntryOID,NewNextOID,SendOptions,NewAcc);
                        _ ->
                            Acc
                    end;
                _Other ->
                    Acc
            end;
        false ->
            Acc
    end.


%%%%%%%%%%%%%%%%%%%%%%%%%%
%%% snmpm_user функции %%%
%%%%%%%%%%%%%%%%%%%%%%%%%%

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
handle_error(_ReqId, _Reason, _UserData) ->
    ignore.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
handle_agent(_Addr, _Port, _Type, _SnmpInfo, _UserData) ->
    ignore.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
handle_pdu(_TargetName, _ReqId, _SnmpPduInfo, _UserData) ->
    ignore.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
handle_trap(_TargetName, _SnmpTrapInfo, _UserData) ->
    ignore.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
handle_inform(_TargetName, _SnmpInformInfo, _UserData) ->
    ignore.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @hidden
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
handle_report(_TargetName, _SnmpReportInfo, _UserData) ->
    ignore.


%%%%%%%%%%%%%%%%%%%%%%%
%%% private функции %%%
%%%%%%%%%%%%%%%%%%%%%%%
