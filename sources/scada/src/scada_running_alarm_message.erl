%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @author Владимир Щербина <vns.scherbina@gmail.com>
%% @copyright 2017
%% @version 1.1.0
%% @doc Модуль <b>{@module}</b> реализует пользовательские функции формирования,
%% бегущей строки аварийных сообщений,
%% которые запускаются посредством модуля <i>scada_tasks</i>.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
-module(scada_running_alarm_message).

-export(
	[
		init/0,
		update_running_alarm_message/2
	]
).

-include("logs.hrl").


%%%%%%%%%%%%%%%%%%%%%%
%%% public функции %%%
%%%%%%%%%%%%%%%%%%%%%%

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec () -> ok
%% @doc <i>Начальная инициализация при запуске модуля</i>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
init() ->
	ok.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Sys,Arg) -> Arg
%% @doc <i>Обновление данных</i>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
update_running_alarm_message(_Sys,Arg) ->
	ArgIn=case Arg of
		undefined ->
			?log_sys(io_lib:format("~p:update_running_alarm_message initial start.~n",[?MODULE])),
			gb_trees:empty();
		_ ->
			Arg
	end,
	case scada_share:is_active_node() of
		true ->
			TagsToCheck=[
				{"PVD_7_6C","Прогар фурмы №1"},
				{"PVD_7_8C","Прогар фурмы №2"},
				{"PVD_7_10C","Прогар фурмы №3"},
				{"PVD_7_12C","Прогар фурмы №4"},
				{"PVD_8_4C","Прогар фурмы №5"},
				{"PVD_8_8C","Прогар фурмы №6"},
				{"PVD_8_12C","Прогар фурмы №7"},
				{"PVD_8_16C","Прогар фурмы №8"},
				{"PVD_8_20C","Прогар фурмы №9"},
				{"PVD_9_4C","Прогар фурмы №10"},
				{"PVD_9_8C","Прогар фурмы №11"},
				{"PVD_9_12C","Прогар фурмы №12"},
				{"PVD_9_16C","Прогар фурмы №13"},
				{"PVD_9_20C","Прогар фурмы №14"},
				{"PVD_10_4C","Прогар фурмы №15"},
				{"PVD_10_8C","Прогар фурмы №16"},
				{"PVD_10_18C","Прогар фурмы №17"},
				{"PVD_10_20C","Прогар фурмы №18"},
				{"PVD_10_22C","Прогар фурмы №19"},
				{"PVD_7_3C","Прогар фурмы №20"},
				{"LVD_1_VN","Недопустимый уровень воды в барабане сепараторе СИО ВН"},
				{"LVD_1_1","Недопустимый уровень воды в барабане сепараторе СИО печи №1"},
				{"LVD_1_2","Недопустимый уровень воды в барабане сепараторе СИО печи №2"},
				{"FDG_GSS","Недопустимый расход доменного газа на ГСС"}	
			],
			Messages=lists:flatten(
				lists:map(
					fun({TagName,Message}) ->
						Condition=scada_alarms:is_active(TagName)==true,
						case Condition of
							true ->
								Message++" * ";
							false ->
								""
						end
					end,
					TagsToCheck
				)
			),
			case length(Messages) of
				0 ->
					scada_tags:set_field("HORN_ALARM_ENABLE","F_CV",0),
					scada_tags:set_field("RUNNING_ALARM_MESSAGE","F_CV","");
				_ ->
					scada_tags:set_field("HORN_ALARM_ENABLE","F_CV",1),
					RunningMessage=lists:flatten([" * ",Messages]),
					scada_tags:set_field("RUNNING_ALARM_MESSAGE","F_CV",RunningMessage)
			end,
			scada_tags:set_field("HORN_ALARM_DISABLE","F_CV",scada_tags:get_field("RUNNING_ALARM_MESSAGE_ACKNOWLEDGE","F_CV")),
			case scada_tags:get_field("RUNNING_ALARM_MESSAGE_ACKNOWLEDGE","F_CV")==1 of
				true ->
					scada_tags:set_field("RUNNING_ALARM_MESSAGE_ACKNOWLEDGE","F_CV",0),
					lists:foreach(
						fun({TagName,_}) ->
							scada_alarms:acknowledge_alarm(TagName)
						end,
						TagsToCheck
					);
				false ->
					do_nothing
			end;
		false ->
			do_nothing
	end,
	ArgIn.

%%%%%%%%%%%%%%%%%%%%%%%
%%% private функции %%%
%%%%%%%%%%%%%%%%%%%%%%%

