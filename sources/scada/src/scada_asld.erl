%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @author Владимир Щербина <vns.scherbina@gmail.com>
%% @copyright 2017
%% @version 1.1.0
%% @doc Модуль <b>{@module}</b> реализует задачи по аспирации литейного двора,
%% которые запускаются посредством модуля <i>scada_tasks</i>.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
-module(scada_asld).

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
			update_analog("ASLD_IN_TEMPERATURE",25.0,30.0,600000000,TS),
			update_analog("ASLD_IN_PRESSURE",1.3,1.5,600000000,TS),
			update_analog("ASLD_VZ_DELTA_PRESSURE",2.2,2.4,600000000,TS),
			update_analog("ASLD_VZ_PRESSURE",0.5,0.55,300000000,TS),
			update_analog("ASLD_OUT_PRESSURE",3.5,3.9,600000000,TS),
			update_analog("ASLD_OUT_ASH",18.0,19.0,1200000000,TS),
			update_analog("M801_COIL_TEMPERATURE_1",50.0,80.0,600000000,TS),
			update_analog("M801_COIL_TEMPERATURE_2",50.0,80.0,500000000,TS),
			update_analog("M801_COIL_TEMPERATURE_3",50.0,80.0,400000000,TS),
			update_analog("M801_COIL_TEMPERATURE_4",50.0,80.0,300000000,TS),
			update_analog("M801_COIL_TEMPERATURE_5",50.0,80.0,200000000,TS),
			update_analog("M801_COIL_TEMPERATURE_6",50.0,80.0,100000000,TS),
			case getBoolTag("M801_ON") of
				1 ->
					update_analog("M801_SPEED",90.0,99.0,200000000,TS);
				_ ->
					update_analog("M801_SPEED",50.0,55.0,200000000,TS)
			end,
			update_analog("M801_GEAR_TEMPERATURE_1",45.0,50.0,600000000,TS),
			update_analog("M801_GEAR_TEMPERATURE_2",45.0,50.0,500000000,TS),
			case getBoolTag("ASLD_MODE_1") of
				1 ->
					setValves(1,1,1,0,0,0,1,0);
				_ ->
					case getBoolTag("ASLD_MODE_2") of
						1 ->
							setValves(1,1,1,0,0,0,0,1);
						_ ->
							case getBoolTag("ASLD_MODE_3") of
								1 ->
									setValves(1,1,0,1,0,0,1,0);
								_ ->
									case getBoolTag("ASLD_MODE_4") of
										1 ->
											setValves(1,1,0,1,0,0,0,1);
										_ ->
											case getBoolTag("ASLD_MODE_5") of
												1 ->
													setValves(0,0,1,0,1,1,1,0);
												_ ->
													case getBoolTag("ASLD_MODE_6") of
														1 ->
															setValves(0,0,1,0,1,1,0,1);
														_ ->
															case getBoolTag("ASLD_MODE_7") of
																1 ->
																	setValves(0,0,0,1,1,1,1,0);
																_ ->
																	case getBoolTag("ASLD_MODE_8") of
																		1 ->
																			setValves(0,0,0,1,1,1,0,1);
																		_ ->
																			setValves(1,0,0,0,0,0,0,0)
																	end
															end
													end
											end
									end
							end	
					end
			end,
			setBoolTag("M803_ON",getBoolTag("M803_START")),
			setBoolTag("M804_ON",getBoolTag("M804_START")),
			setBoolTag("M805_ON",getBoolTag("M805_START")),
			setBoolTag("M806_ON",getBoolTag("M806_START")),
			setBoolTag("M807_ON",getBoolTag("M807_START")),
			setBoolTag("M808_ON",getBoolTag("M808_START")),
			setBoolTag("M809_ON",getBoolTag("M809_START")),
			setBoolTag("M810_ON",getBoolTag("M810_START")),
			setBoolTag("M811_ON",getBoolTag("M811_START")),
			setBoolTag("M812_ON",getBoolTag("M812_START")),
			setBoolTag("M813_ON",getBoolTag("M813_START")),
			setBoolTag("M814_ON",getBoolTag("M814_START")),
			setBoolTag("M833_ON",getBoolTag("M833_START")),
			setBoolTag("M834_ON",getBoolTag("M834_START")),
			setBoolTag("M835_ON",getBoolTag("M835_START")),
			setBoolTag("M836_ON",getBoolTag("M836_START")),
			setBoolTag("M837_ON",getBoolTag("M837_START")),
			setBoolTag("M838_ON",getBoolTag("M838_START")),
			setBoolTag("M839_ON",getBoolTag("M839_START")),
			setBoolTag("M840_ON",getBoolTag("M840_START")),
			setBoolTag("M841_ON",getBoolTag("M841_START")),
			setBoolTag("M842_ON",getBoolTag("M842_START")),
			setBoolTag("M843_ON",getBoolTag("M843_START")),
			setBoolTag("M844_ON",getBoolTag("M844_START")),
			setBoolTag("M801_ON",getBoolTag("M801_START")),
			setBoolTag("M802_ON",getBoolTag("M801_START")),
			setBoolTag("M815_ON",getBoolTag("M815_START")),
			setBoolTag("M816_ON",getBoolTag("M816_START")),
			setBoolTag("M817_ON",getBoolTag("M817_START")),
			setBoolTag("M851_ON",getBoolTag("M851_START")),
			setBoolTag("ASLD_INTERMEDIATE_BUNKER_LEVEL_OK",1),
			setBoolTag("ASLD_OUT_BUNKER_LEVEL_OK",1),
			setBoolTag("ASLD_BUNKER_1_LEVEL_OK",1),
			setBoolTag("ASLD_BUNKER_2_LEVEL_OK",1),
			setBoolTag("ASLD_BUNKER_3_LEVEL_OK",1),
			setBoolTag("ASLD_BUNKER_4_LEVEL_OK",1),
			setBoolTag("ASLD_BUNKER_5_LEVEL_OK",1),
			setBoolTag("ASLD_BUNKER_6_LEVEL_OK",1),
			setBoolTag("ASLD_BUNKER_7_LEVEL_OK",1),
			setBoolTag("ASLD_BUNKER_8_LEVEL_OK",1),
			setBoolTag("ASLD_BUNKER_9_LEVEL_OK",1),
			setBoolTag("ASLD_BUNKER_10_LEVEL_OK",1),
			setBoolTag("ASLD_BUNKER_11_LEVEL_OK",1),
			setBoolTag("ASLD_BUNKER_12_LEVEL_OK",1),
			setBoolTag("M845_READY",1),
			case {getBoolTag("M845_ON_1"),getBoolTag("M845_ON_2")} of
				{1,0} ->
					setBoolTag("M845_WORK",1);
				{0,1} ->
					setBoolTag("M845_WORK",1);
				{1,1} ->
					setBoolTag("M845_WORK",1);
				_ ->
					setBoolTag("M845_WORK",0)
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

setValves(V1,V2,V3,V4,V5,V6,V7,V8) ->
	setValve(1,V1),
	setValve(2,V2),
	setValve(3,V3),
	setValve(4,V4),
	setValve(5,V5),
	setValve(6,V6),
	setValve(7,V7),
	setValve(8,V8).

setValve(Valve,State) ->
	OpenedTagName=lists:flatten(io_lib:format("M65~w_OPENED",[Valve])),
	ClosedTagName=lists:flatten(io_lib:format("M65~w_CLOSED",[Valve])),
	setBoolTag(OpenedTagName,State),
	setBoolTag(ClosedTagName,1-State).

