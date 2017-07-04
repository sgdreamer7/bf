%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @author Владимир Щербина <vns.scherbina@gmail.com>
%% @copyright 2017
%% @version 1.1.0
%% @doc Модуль <b>{@module}</b> реализует пользовательские функции регистрации задания загрузки,
%% которые запускаются посредством модуля <i>scada_tasks</i>.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
-module(scada_charge_system).

-export(
	[
		init/0,
		update_charge_system_data/2,
		update_charge_level_data/2
	]
).

-include("logs.hrl").

-define(table_name,"charge_system").

%%%%%%%%%%%%%%%%%%%%%%
%%% public функции %%%
%%%%%%%%%%%%%%%%%%%%%%

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec () -> ok
%% @doc <i>Начальная инициализация при запуске модуля</i>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
init() ->
	Request=[
		{table,?table_name},
		{
			fields,
			[
				{"INDX",datetime},
				{"CHARGE",integer},
				{"CYCLE",integer},
				{"MSG",ascii}
			]
		},
		{indexes,[{"INDX",not_unique}]}
	],
	scada_db:create_table(Request),
	scada_share:subscribe(store_charge_system,fun store_charge_system_data/1),
	ok.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Sys,Arg) -> Arg
%% @doc <i>Обновление данных для протокола загрузки</i>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
update_charge_system_data(_Sys,Arg) ->
	ArgIn=case Arg of
		undefined ->
			?log_sys(io_lib:format("~p:update_charge_system_data initial start.~n",[?MODULE])),
			gb_trees:empty();
		_ ->
			Arg
	end,
	case scada_share:is_active_node() of
		true ->
			Cycles=lists:map(
				fun(CycleNum) ->
					TagName=lists:flatten(io_lib:format("P~w_PROGRAM",[CycleNum])),
					TagValue=scada_tags:get_field(TagName,"F_CV"),
					format_program(erlang:round(TagValue))
				end,
				lists:seq(1,20)
			),
			ProgramA=lists:map(
				fun(Skip) ->
					TagName=lists:flatten(io_lib:format("PA_~w",[Skip])),
					TagValue=scada_tags:get_field(TagName,"F_CV"),
					format_skip_type(erlang:round(TagValue))
				end,
				lists:seq(1,6)
			),
			ProgramB=lists:map(
				fun(Skip) ->
					TagName=lists:flatten(io_lib:format("PB_~w",[Skip])),
					TagValue=scada_tags:get_field(TagName,"F_CV"),
					format_skip_type(erlang:round(TagValue))
				end,
				lists:seq(1,6)
			),
			ProgramC=lists:map(
				fun(Skip) ->
					TagName=lists:flatten(io_lib:format("PC_~w",[Skip])),
					TagValue=scada_tags:get_field(TagName,"F_CV"),
					format_skip_type(erlang:round(TagValue))
				end,
				lists:seq(1,6)
			),
			ProgramD=lists:map(
				fun(Skip) ->
					TagName=lists:flatten(io_lib:format("PD_~w",[Skip])),
					TagValue=scada_tags:get_field(TagName,"F_CV"),
					format_skip_type(erlang:round(TagValue))
				end,
				lists:seq(1,6)
			),
			ProgramE=lists:map(
				fun(Skip) ->
					TagName=lists:flatten(io_lib:format("PE_~w",[Skip])),
					TagValue=scada_tags:get_field(TagName,"F_CV"),
					format_skip_type(erlang:round(TagValue))
				end,
				lists:seq(1,6)
			),
			Charge=case scada_tags:get_field("CHARGE","F_CV") of
				undefined ->
					0;
				Value ->
					Value
			end,
			Cycle=scada_tags:get_field("PX_PROCESSED","F_CV"),
			Message=lists:flatten(
				[
					"Программа циклов: ",
					Cycles,
					"<br/>А: ",
					ProgramA,
					"<br/>Б: ",
					ProgramB,
					"<br/>В: ",
					ProgramC,
					"<br/>Г: ",
					ProgramD,
					"<br/>Д: ",
					ProgramE,
					"."
				]
			),
			Timestamp=scada_share:system_time(),
			Request=[
				{table,?table_name},
				{
					fields,
					[
						{"INDX",Timestamp},
						{"CHARGE",Charge},
						{"CYCLE",Cycle},
						{"MSG",Message}
					]
				}
			],
			case scada_share:is_active_node() of
				true ->
					scada_share:send(store_charge_system,Request);
				false ->
					do_nothing
			end;
		false ->
			do_nothing
	end,
	ArgIn.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Sys,Arg) -> Arg
%% @doc <i>Обновление данных для протокола загрузки</i>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
update_charge_level_data(_Sys,Arg) ->
	ArgIn=case Arg of
		undefined ->
			?log_sys(io_lib:format("~p:update_charge_level_data initial start.~n",[?MODULE])),
			gb_trees:empty();
		_ ->
			Arg
	end,
	case scada_share:is_active_node() of
		true ->
			CHARGE_LEVEL_L_REF=scada_tags:get_field("CHARGE_LEVEL_L_REF","F_CV"),
			CHARGE_LEVEL_R_REF=scada_tags:get_field("CHARGE_LEVEL_R_REF","F_CV"),
			Message=lists:flatten(
				[
					"Задание уровня слева: ",
					custom_filters:floatformat(CHARGE_LEVEL_L_REF,2),
					" м.<br/>Задание уровня справа: ",
					custom_filters:floatformat(CHARGE_LEVEL_R_REF,2),
					" м."
				]
			),
			Charge=case scada_tags:get_field("CHARGE","F_CV") of
				undefined ->
					0;
				Value ->
					Value
			end,
			Cycle=scada_tags:get_field("PX_PROCESSED","F_CV"),
			Timestamp=scada_share:system_time(),
			Request=[
				{table,?table_name},
				{
					fields,
					[
						{"INDX",Timestamp},
						{"CHARGE",Charge},
						{"CYCLE",Cycle},
						{"MSG",unicode:characters_to_binary(Message)}
					]
				}
			],
			case scada_share:is_active_node() of
				true ->
					scada_share:send(store_charge_system,Request);
				false ->
					do_nothing
			end;
		false ->
			do_nothing
	end,
	ArgIn.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Request) -> Arg
%% @doc <i>Сохранение данных для протокола системы загрузки</i>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
store_charge_system_data(Request) ->
	scada_db:insert_data(Request).

%%%%%%%%%%%%%%%%%%%%%%%
%%% private функции %%%
%%%%%%%%%%%%%%%%%%%%%%%

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (ProgramType) -> term
%% @doc <i>Форматирование типа программы</i>
%% <p>
%% <b>ProgramType</b> -тип программы.
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%	
format_program(1) ->
	"А";
format_program(2) ->
	"Б";
format_program(3) ->
	"В";
format_program(4) ->
	"Г";
format_program(5) ->
	"Д";
format_program(_) ->
	"-".

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (SkipType) -> term
%% @doc <i>Форматирование типа скипа</i>
%% <p>
%% <b>SkipType</b> -тип скипа.
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%	
format_skip_type(1) ->
	"К";
format_skip_type(2) ->
	"Р";
format_skip_type(3) ->
	"П";
format_skip_type(4) ->
	"-";
format_skip_type(_) ->
	"".
