%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @author Владимир Щербина <vns.scherbina@gmail.com>
%% @copyright 2017
%% @version 1.1.0
%% @doc Модуль <b>{@module}</b> реализует задачи по аспирации бункерной эстакады,
%% которые запускаются посредством модуля <i>scada_tasks</i>.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
-module(scada_asbe).

-export(
	[
		init/0,
		update_data/2
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
%% @doc <i>Обновление даты/времени</i>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
update_data(_Sys,Arg) ->
	ArgIn=case Arg of
		undefined ->
			?log_sys(io_lib:format("~p:update_datetime initial start.~n",[?MODULE])),
			gb_trees:empty();
		_ ->
			Arg
	end,
	case scada_share:is_active_node() of
		false ->
			do_nothing;
		true ->
			TS=scada_share:system_time_microseconds(),
			update_analog("ASBE_IN_TEMPERATURE",15.0,20.0,600000000,TS),
			update_analog("ASBE_IN_PRESSURE",1.3,1.5,500000000,TS),
			update_analog("ASBE_VZ_DELTA_PRESSURE",2.2,2.5,500000000,TS),
			update_analog("ASBE_VZ_PRESSURE",0.5,0.55,300000000,TS),
			update_analog("ASBE_OUT_PRESSURE",3.5,3.9,500000000,TS),
			update_analog("ASBE_OUT_ASH",18.0,19.2,1200000000,TS),
			update_analog("M901_COIL_TEMPERATURE_1",50.0,80.0,600000000,TS),
			update_analog("M901_COIL_TEMPERATURE_2",50.0,80.0,500000000,TS),
			update_analog("M901_COIL_TEMPERATURE_3",50.0,80.0,400000000,TS),
			update_analog("M901_COIL_TEMPERATURE_4",50.0,80.0,300000000,TS),
			update_analog("M901_COIL_TEMPERATURE_5",50.0,80.0,200000000,TS),
			update_analog("M901_COIL_TEMPERATURE_6",50.0,80.0,100000000,TS),
			case getBoolTag("M901_ON") of
				1 ->
					update_analog("M901_SPEED",90.0,99.0,200000000,TS);
				_ ->
					update_analog("M901_SPEED",50.0,55.0,200000000,TS)
			end,
			update_analog("M901_GEAR_TEMPERATURE_1",45.0,50.0,600000000,TS),
			update_analog("M901_GEAR_TEMPERATURE_2",45.0,50.0,500000000,TS),
			setBoolTag("M903_ON",getBoolTag("M903_START")),
			setBoolTag("M904_ON",getBoolTag("M904_START")),
			setBoolTag("M905_ON",getBoolTag("M905_START")),
			setBoolTag("M906_ON",getBoolTag("M906_START")),
			setBoolTag("M907_ON",getBoolTag("M907_START")),
			setBoolTag("M908_ON",getBoolTag("M908_START")),
			setBoolTag("M909_ON",getBoolTag("M909_START")),
			setBoolTag("M910_ON",getBoolTag("M910_START")),
			setBoolTag("M911_ON",getBoolTag("M911_START")),
			setBoolTag("M912_ON",getBoolTag("M912_START")),
			setBoolTag("M933_ON",getBoolTag("M933_START")),
			setBoolTag("M934_ON",getBoolTag("M934_START")),
			setBoolTag("M935_ON",getBoolTag("M935_START")),
			setBoolTag("M936_ON",getBoolTag("M936_START")),
			setBoolTag("M937_ON",getBoolTag("M937_START")),
			setBoolTag("M938_ON",getBoolTag("M938_START")),
			setBoolTag("M939_ON",getBoolTag("M939_START")),
			setBoolTag("M940_ON",getBoolTag("M940_START")),
			setBoolTag("M941_ON",getBoolTag("M941_START")),
			setBoolTag("M942_ON",getBoolTag("M942_START")),
			setBoolTag("M901_ON",getBoolTag("M901_START")),
			setBoolTag("M902_ON",getBoolTag("M901_START")),
			setBoolTag("M913_ON",getBoolTag("M913_START")),
			setBoolTag("M914_ON",getBoolTag("M914_START")),
			setBoolTag("M915_ON",getBoolTag("M915_START")),
			setBoolTag("M916_ON",getBoolTag("M916_START")),
			setBoolTag("ASBE_OUT_BUNKER_LEVEL_OK",1),
			setBoolTag("ASBE_BUNKER_1_LEVEL_OK",1),
			setBoolTag("ASBE_BUNKER_2_LEVEL_OK",1),
			setBoolTag("ASBE_BUNKER_3_LEVEL_OK",1),
			setBoolTag("ASBE_BUNKER_4_LEVEL_OK",1),
			setBoolTag("ASBE_BUNKER_5_LEVEL_OK",1),
			setBoolTag("ASBE_BUNKER_6_LEVEL_OK",1),
			setBoolTag("ASBE_BUNKER_7_LEVEL_OK",1),
			setBoolTag("ASBE_BUNKER_8_LEVEL_OK",1),
			setBoolTag("ASBE_BUNKER_9_LEVEL_OK",1),
			setBoolTag("ASBE_BUNKER_10_LEVEL_OK",1),
			setBoolTag("M943_READY",1),
			case {getBoolTag("M943_ON_1"),getBoolTag("M943_ON_2")} of
				{1,0} ->
					setBoolTag("M943_WORK",1);
				{0,1} ->
					setBoolTag("M943_WORK",1);
				{1,1} ->
					setBoolTag("M943_WORK",1);
				_ ->
					setBoolTag("M943_WORK",0)
			end,					
			ok
	end,
	ArgIn.

%%%%%%%%%%%%%%%%%%%%%%%
%%% private функции %%%
%%%%%%%%%%%%%%%%%%%%%%%

update_analog(TagName,LowLimit,HighLimit,Period,Timestamp) ->
	Value=(math:sin((Timestamp rem Period)/Period*2*math:pi())+1)/2*(HighLimit-LowLimit)+LowLimit,
	scada_tags:set_field(TagName,"F_CV",Value).

getBoolTag(TagName) ->
	scada_tags:get_field(TagName,"F_CV").
setBoolTag(TagName,Value) ->
	scada_tags:set_field(TagName,"F_CV",Value).
