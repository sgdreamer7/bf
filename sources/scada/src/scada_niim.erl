%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @author Владимир Щербина <vns.scherbina@gmail.com>
%% @copyright 2017
%% @version 1.1.0
%% @doc Модуль <b>{@module}</b> реализует пользовательские функции интеграции данных САК "Разгар шахты, горна и лещади"
%% которые запускаются посредством модуля <i>scada_tasks</i>.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
-module(scada_niim).

-export(
	[
		init/0,
		update_data/2,
        process_data/1,
        process_data_for_period/2
	]
).

-include("logs.hrl").
-define(K1,58).
-define(K2,58).
-define(K3,15).
-define(K4,15).
-define(K5,15).

%%%%%%%%%%%%%%%%%%%%%%
%%% public функции %%%
%%%%%%%%%%%%%%%%%%%%%%

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec () -> ok
%% @doc <i>Начальная инициализация при запуске модуля</i>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
init() ->
	InputDataDescription=get_input_data_description(),
    lists:foreach(
        fun({AverageTableName,TablesNames}) ->
            AllFields=lists:foldr(
                fun({_,Fields},AccIn) ->
                    [FieldName || {_,FieldName,_} <- Fields] ++ AccIn
                end,
                [],
                TablesNames
            ),
			Fields=lists:map(
		        fun(Name) ->
		            {Name,float}
		        end,
		        AllFields
			),
			Request=[
				{table,AverageTableName},
				{fields,[{"DT",datetime}|Fields]},
				{indexes,[{"DT",unique}]}
			],
			?log_sys(io_lib:format("~p:init createing table \'~ts\'.~n",[?MODULE,AverageTableName])),
			scada_db:create_table(Request)
        end,
        InputDataDescription
	),
	ok.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Sys,Arg) -> Arg
%% @doc <i>Обновление данных, добавление новых данных</i>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
update_data(_Sys,Arg) ->
	ArgIn=case Arg of
		undefined ->
			?log_sys(io_lib:format("~p:update_data initial start.~n",[?MODULE])),
			gb_trees:empty();
		_ ->
			Arg
	end,
	Datetime=scada_share:system_datetime(),
	process_data(Datetime),
	NewArg=ArgIn,
	NewArg.

%%%%%%%%%%%%%%%%%%%%%%%
%%% private функции %%%
%%%%%%%%%%%%%%%%%%%%%%%

get_input_data_description() ->
    [
        {
            "RAZGAR_GORN_HOUR",
            [
                {
                    "tvd_pu_all",
                    [
                        {"TVD_COL_1","T_IN_01",10.0},
                        {"TVD_COL_2","T_IN_02",10.0},
                        {"TVD_COL_3","T_IN_03",10.0},
                        {"TVD_COL_4","T_IN_04",10.0},
                        {"TVD_COL_5","T_IN_05",10.0},
                        {"TVD_COL_6","T_IN_06",10.0}
                   ]
                },
                {
                    "tvd_pu3_pu2",
                    [
                        {"FVD_2_3C","FL_CL_03",0.2},
                        {"FVD_2_25C","FL_CL_04",0.2},
                        {"FVD_2_18C","FL_CL_05",0.2},
                        {"FVD_2_8C","FL_CL_06",0.2},
                        {"FVD_2_9C","FL_CL_07",0.2},
                        {"FVD_2_12C","FL_CL_08",0.2},
                        {"FVD_2_17C","FL_CL_09",0.2},
                        {"FVD_2_23C","FL_CL_10",0.2},
                        {"FVD_3_2C","FL_CL_11",0.2},
                        {"FVD_3_7C","FL_CL_12",0.2},
                        {"FVD_3_21C","FL_CL_13",0.2},
                        {"FVD_3_25C","FL_CL_14",0.2},
                        {"FVD_3_29C","FL_CL_15",0.2}
                    ]
                },
                {
                    "tvd_pu5_pu4",
                    [
                        {"FVD_4_3C","FL_CL_16",0.2},
                        {"FVD_4_7C","FL_CL_17",0.2},
                        {"FVD_4_10C","FL_CL_18",0.2},
                        {"FVD_4_20C","FL_CL_19",0.2},
                        {"FVD_4_23C","FL_CL_20",0.2},
                        {"FVD_4_26C","FL_CL_21",0.2},
                        {"FVD_4_30C","FL_CL_22",0.2},
                        {"FVD_5_3C","FL_CL_23",0.2},
                        {"FVD_5_7C","FL_CL_24",0.2},
                        {"FVD_5_10C","FL_CL_25",0.2},
                        {"FVD_5_13C","FL_CL_26",0.2}
                    ]
                },
                {
                    "tvd_pu1_pu6",
                    [
                        {"FVD_6_1C","FL_CL_27",0.2}
                    ]
                },
                {
                    "tvd_horn_v_n",
                    [
                        {"TVD_HORN_V_N_XP_3","T1_CL_03",10.0},
                        {"TVD_HORN_V_N_XP_4","T1_CL_04",10.0},
                        {"TVD_HORN_V_N_XP_5","T1_CL_05",10.0},
                        {"TVD_HORN_V_N_XP_6","T1_CL_06",10.0},
                        {"TVD_HORN_V_N_XP_7","T1_CL_07",10.0},
                        {"TVD_HORN_V_N_XP_8","T1_CL_08",10.0},
                        {"TVD_HORN_V_N_XP_9","T1_CL_09",10.0},
                        {"TVD_HORN_V_N_XP_10","T1_CL_10",10.0},
                        {"TVD_HORN_V_N_XP_11","T1_CL_11",10.0},
                        {"TVD_HORN_V_N_XP_12","T1_CL_12",10.0},
                        {"TVD_HORN_V_N_XP_13","T1_CL_13",10.0},
                        {"TVD_HORN_V_N_XP_14","T1_CL_14",10.0},
                        {"TVD_HORN_V_N_XP_15","T1_CL_15",10.0},
                        {"TVD_HORN_V_N_XP_16","T1_CL_16",10.0},
                        {"TVD_HORN_V_N_XP_17","T1_CL_17",10.0},
                        {"TVD_HORN_V_N_XP_18","T1_CL_18",10.0},
                        {"TVD_HORN_V_N_XP_19","T1_CL_19",10.0},
                        {"TVD_HORN_V_N_XP_20","T1_CL_20",10.0},
                        {"TVD_HORN_V_N_XP_21","T1_CL_21",10.0},
                        {"TVD_HORN_V_N_XP_22","T1_CL_22",10.0},
                        {"TVD_HORN_V_N_XP_23","T1_CL_23",10.0},
                        {"TVD_HORN_V_N_XP_24","T1_CL_24",10.0},
                        {"TVD_HORN_V_N_XP_25","T1_CL_25",10.0},
                        {"TVD_HORN_V_N_XP_26","T1_CL_26",10.0},
                        {"TVD_HORN_V_N_XP_27","T1_CL_27",10.0}
                    ]
                },
                {
                    "tvd_horn_n_lesh_v",
                    [
                        {"TVD_HORN_N_LESH_V_XP_3","T2_CL_03",10.0},
                        {"TVD_HORN_N_LESH_V_XP_4","T2_CL_04",10.0},
                        {"TVD_HORN_N_LESH_V_XP_5","T2_CL_05",10.0},
                        {"TVD_HORN_N_LESH_V_XP_6","T2_CL_06",10.0},
                        {"TVD_HORN_N_LESH_V_XP_7","T2_CL_07",10.0},
                        {"TVD_HORN_N_LESH_V_XP_8","T2_CL_08",10.0},
                        {"TVD_HORN_N_LESH_V_XP_9","T2_CL_09",10.0},
                        {"TVD_HORN_N_LESH_V_XP_10","T2_CL_10",10.0},
                        {"TVD_HORN_N_LESH_V_XP_11","T2_CL_11",10.0},
                        {"TVD_HORN_N_LESH_V_XP_12","T2_CL_12",10.0},
                        {"TVD_HORN_N_LESH_V_XP_13","T2_CL_13",10.0},
                        {"TVD_HORN_N_LESH_V_XP_14","T2_CL_14",10.0},
                        {"TVD_HORN_N_LESH_V_XP_15","T2_CL_15",10.0},
                        {"TVD_HORN_N_LESH_V_XP_16","T2_CL_16",10.0},
                        {"TVD_HORN_N_LESH_V_XP_17","T2_CL_17",10.0},
                        {"TVD_HORN_N_LESH_V_XP_18","T2_CL_18",10.0},
                        {"TVD_HORN_N_LESH_V_XP_19","T2_CL_19",10.0},
                        {"TVD_HORN_N_LESH_V_XP_20","T2_CL_20",10.0},
                        {"TVD_HORN_N_LESH_V_XP_21","T2_CL_21",10.0},
                        {"TVD_HORN_N_LESH_V_XP_22","T2_CL_22",10.0},
                        {"TVD_HORN_N_LESH_V_XP_23","T2_CL_23",10.0},
                        {"TVD_HORN_N_LESH_V_XP_24","T2_CL_24",10.0},
                        {"TVD_HORN_N_LESH_V_XP_25","T2_CL_25",10.0},
                        {"TVD_HORN_N_LESH_V_XP_26","T2_CL_26",10.0},
                        {"TVD_HORN_N_LESH_V_XP_27","T2_CL_27",10.0}
                    ]
                },
                {
                    "tvd_lesh_v_n",
                    [
                        {"TVD_LESH_V_N_XP_3","T3_CL_03",10.0},
                        {"TVD_LESH_V_N_XP_4","T3_CL_04",10.0},
                        {"TVD_LESH_V_N_XP_5","T3_CL_05",10.0},
                        {"TVD_LESH_V_N_XP_6","T3_CL_06",10.0},
                        {"TVD_LESH_V_N_XP_7","T3_CL_07",10.0},
                        {"TVD_LESH_V_N_XP_8","T3_CL_08",10.0},
                        {"TVD_LESH_V_N_XP_9","T3_CL_09",10.0},
                        {"TVD_LESH_V_N_XP_10","T3_CL_10",10.0},
                        {"TVD_LESH_V_N_XP_11","T3_CL_11",10.0},
                        {"TVD_LESH_V_N_XP_12","T3_CL_12",10.0},
                        {"TVD_LESH_V_N_XP_13","T3_CL_13",10.0},
                        {"TVD_LESH_V_N_XP_14","T3_CL_14",10.0},
                        {"TVD_LESH_V_N_XP_15","T3_CL_15",10.0},
                        {"TVD_LESH_V_N_XP_16","T3_CL_16",10.0},
                        {"TVD_LESH_V_N_XP_17","T3_CL_17",10.0},
                        {"TVD_LESH_V_N_XP_18","T3_CL_18",10.0},
                        {"TVD_LESH_V_N_XP_19","T3_CL_19",10.0},
                        {"TVD_LESH_V_N_XP_20","T3_CL_20",10.0},
                        {"TVD_LESH_V_N_XP_21","T3_CL_21",10.0},
                        {"TVD_LESH_V_N_XP_22","T3_CL_22",10.0},
                        {"TVD_LESH_V_N_XP_23","T3_CL_23",10.0},
                        {"TVD_LESH_V_N_XP_24","T3_CL_24",10.0},
                        {"TVD_LESH_V_N_XP_25","T3_CL_25",10.0},
                        {"TVD_LESH_V_N_XP_26","T3_CL_26",10.0},
                        {"TVD_LESH_V_N_XP_27","T3_CL_27",10.0}
                    ]
                },
                {
                    "tvd_pu3_pu2",
                    [
                        {"TVD_2_3C","T4_CL_03",10.0},
                        {"TVD_2_25C","T4_CL_04",10.0},
                        {"TVD_2_18C","T4_CL_05",10.0},
                        {"TVD_2_8C","T4_CL_06",10.0},
                        {"TVD_2_9C","T4_CL_07",10.0},
                        {"TVD_2_12C","T4_CL_08",10.0},
                        {"TVD_2_17C","T4_CL_09",10.0},
                        {"TVD_2_23C","T4_CL_10",10.0},
                        {"TVD_3_2C","T4_CL_11",10.0},
                        {"TVD_3_7C","T4_CL_12",10.0},
                        {"TVD_3_21C","T4_CL_13",10.0},
                        {"TVD_3_25C","T4_CL_14",10.0},
                        {"TVD_3_29C","T4_CL_15",10.0}
                    ]
                },
                {
                    "tvd_pu5_pu4",
                    [
                        {"TVD_4_3C","T4_CL_16",10.0},
                        {"TVD_4_7C","T4_CL_17",10.0},
                        {"TVD_4_10C","T4_CL_18",10.0},
                        {"TVD_4_20C","T4_CL_19",10.0},
                        {"TVD_4_23C","T4_CL_20",10.0},
                        {"TVD_4_26C","T4_CL_21",10.0},
                        {"TVD_4_30C","T4_CL_22",10.0},
                        {"TVD_5_3C","T4_CL_23",10.0},
                        {"TVD_5_7C","T4_CL_24",10.0},
                        {"TVD_5_10C","T4_CL_25",10.0},
                        {"TVD_5_13C","T4_CL_26",10.0}
                    ]
                },
                {
                    "tvd_pu1_pu6",
                    [
                        {"TVD_6_1C","T4_CL_27",10.0}
                    ]
                },
                {
                    "fvd_pu_all",
                    [
                        {"FVD_1_3C","FV_VG_01",0.2},
                        {"FVD_1_2C","FV_VG_02",0.2},
                        {"FVD_5_21C","FV_VG_28",0.2},
                        {"FVD_6_30C","FV_VG_29",0.2},
                        {"FVD_6_29C","FV_VG_30",0.2},
                        {"FVD_5_30C","FV_VG_31",0.2},
                        {"FVD_1_5C","FV_VG_32",0.2}
                    ]
                },
                {
                    "tvd_pu_all",
                    [
                        {"TVD_1_3C","T1_VG_01",10.0},
                        {"TVD_1_2C","T1_VG_02",10.0},
                        {"TVD_5_21C","T1_VG_28",10.0},
                        {"TVD_6_30C","T1_VG_29",10.0},
                        {"TVD_6_29C","T1_VG_30",10.0},
                        {"TVD_5_30C","T1_VG_31",10.0},
                        {"TVD_1_5C","T1_VG_32",10.0}
                    ]
                },
                {
                    "fvd_pu_all",
                    [
                        {"FVD_1_1C","FV_TH_01_1",0.2},
                        {"FVD_1_13C","FV_TH_01_2",0.2},
                        {"FVD_5_23C","FV_TH_29_1",0.2},
                        {"FVD_5_20C","FV_TH_29_2",0.2},
                        {"FVD_6_28C","FV_TH_30_1",0.2},
                        {"FVD_6_27C","FV_TH_30_2",0.2},
                        {"FVD_1_4C","FV_TH_32_1",0.2},
                        {"FVD_1_6C","FV_TH_32_2",0.2}
                    ]
                },
                {
                    "tvd_pu_all",
                    [
                        {"TVD_1_1C","T1_TH_01_1",10.0},
                        {"TVD_1_13C","T1_TH_01_2",10.0},
                        {"TVD_5_23C","T1_TH_29_1",10.0},
                        {"TVD_5_20C","T1_TH_29_2",10.0},
                        {"TVD_6_28C","T1_TH_30_1",10.0},
                        {"TVD_6_27C","T1_TH_30_2",10.0},
                        {"TVD_1_4C","T1_TH_32_1",10.0},
                        {"TVD_1_6C","T1_TH_32_2",10.0}
                    ]
                },
                {
                    "fvd_pu_all",
                    [
                        {"FVD_1_12C","FV_NG_02",0.2},
                        {"FVD_5_22C","FV_NG_28",0.2},
                        {"FVD_5_29C","FV_NG_31_1",0.2},
                        {"FVD_5_28C","FV_NG_31_2",0.2}
                    ]
                },
                {
                    "tvd_pu_all",
                    [
                        {"TVD_1_12C","T1_NG_02",10.0},
                        {"TVD_5_22C","T1_NG_28",10.0},
                        {"TVD_5_29C","T1_NG_31_1",10.0},
                        {"TVD_5_28C","T1_NG_31_2",10.0}
                    ]
                },
                {
                    "fvd_pu_all",
                    [
                        {"FVD_1_23C","FV_CL_01",0.2},
                        {"FVD_1_27C","FV_CL_02",0.2},
                        {"FVD_6_4C","FV_CL_28",0.2},
                        {"FVD_6_7C","FV_CL_29",0.2},
                        {"FVD_6_10C","FV_CL_30",0.2},
                        {"FVD_1_16C","FV_CL_31",0.2},
                        {"FVD_1_19C","FV_CL_32",0.2}
                    ]
                },
                {
                    "tvd_lesh_v_n2",
                    [
                        {"TVD_LESH_V_N_XP_1","T1_CL_01",10.0},
                        {"TVD_LESH_V_N_XP_2","T1_CL_02",10.0},
                        {"TVD_LESH_V_N_XP_28","T1_CL_28",10.0},
                        {"TVD_LESH_V_N_XP_29","T1_CL_29",10.0},
                        {"TVD_LESH_V_N_XP_30","T1_CL_30",10.0},
                        {"TVD_LESH_V_N_XP_31","T1_CL_31",10.0},
                        {"TVD_LESH_V_N_XP_32","T1_CL_32",10.0}
                    ]
                },
                {
                    "tvd_pu_all",
                    [
                        {"TVD_1_23C","T2_CL_01",10.0},
                        {"TVD_1_27C","T2_CL_02",10.0},
                        {"TVD_6_4C","T2_CL_28",10.0},
                        {"TVD_6_7C","T2_CL_29",10.0},
                        {"TVD_6_10C","T2_CL_30",10.0},
                        {"TVD_1_16C","T2_CL_31",10.0},
                        {"TVD_1_19C","T2_CL_32",10.0}
                    ]
                },
                {
                    "fvd_pu_all",
                    [
                        {"FVD_4_15C","FV_PO_01",0.2},
                        {"FVD_4_14C","FV_PO_02",0.2},
                        {"FVD_4_13C","FV_PO_03",0.2},
                        {"FVD_6_26C","FV_PO_04",0.2},
                        {"FVD_6_25C","FV_PO_05",0.2},
                        {"FVD_6_24C","FV_PO_06",0.2},
                        {"FVD_6_23C","FV_PO_07",0.2},
                        {"FVD_6_22C","FV_PO_08",0.2},
                        {"FVD_6_21C","FV_PO_09",0.2},
                        {"FVD_6_20C","FV_PO_10",0.2}
                    ]
                },
                {
                    "tvd_pu_all",
                    [
                        {"TVD_4_15C","T1_PO_01",10.0},
                        {"TVD_4_14C","T1_PO_02",10.0},
                        {"TVD_4_13C","T1_PO_03",10.0},
                        {"TVD_6_26C","T1_PO_04",10.0},
                        {"TVD_6_25C","T1_PO_05",10.0},
                        {"TVD_6_24C","T1_PO_06",10.0},
                        {"TVD_6_23C","T1_PO_07",10.0},
                        {"TVD_6_22C","T1_PO_08",10.0},
                        {"TVD_6_21C","T1_PO_09",10.0},
                        {"TVD_6_20C","T1_PO_10",10.0}
                    ]
                },
                {
                    "tbot",
                    [
                        {"TBOT_1_1","T_UR1_01",10.0},
                        {"TBOT_1_2","T_UR1_02",10.0},
                        {"TBOT_1_3","T_UR1_03",10.0},
                        {"TBOT_1_4","T_UR1_04",10.0},
                        {"TBOT_1_5","T_UR1_05",10.0},
                        {"TBOT_1_6","T_UR1_06",10.0},
                        {"TBOT_2_1","T_UR2_01",10.0},
                        {"TBOT_2_2","T_UR2_02",10.0},
                        {"TBOT_2_3","T_UR2_03",10.0},
                        {"TBOT_2_4","T_UR2_04",10.0},
                        {"TBOT_2_5","T_UR2_05",10.0},
                        {"TBOT_2_6","T_UR2_06",10.0},
                        {"TBOT_2_7","T_UR2_07",10.0},
                        {"TBOT_2_8","T_UR2_08",10.0},
                        {"TBOT_2_9","T_UR2_09",10.0},
                        {"TBOT_2_10","T_UR2_10",10.0},
                        {"TBOT_3_1","T_UR3_01",10.0},
                        {"TBOT_3_2","T_UR3_02",10.0},
                        {"TBOT_3_3","T_UR3_03",10.0},
                        {"TBOT_3_4","T_UR3_04",10.0},
                        {"TBOT_3_5","T_UR3_05",10.0},
                        {"TBOT_3_6","T_UR3_06",10.0},
                        {"TBOT_3_7","T_UR3_07",10.0},
                        {"TBOT_3_8","T_UR3_08",10.0},
                        {"TBOT_3_9","T_UR3_09",10.0},
                        {"TBOT_3_10","T_UR3_10",10.0},
                        {"TBOT_3_11","T_UR3_11",10.0},
                        {"TBOT_3_12","T_UR3_12",10.0},
                        {"TBOT_3_13","T_UR3_13",10.0},
                        {"TBOT_3_14","T_UR3_14",10.0},
                        {"TBOT_3_15","T_UR3_15",10.0},
                        {"TBOT_3_16","T_UR3_16",10.0},
                        {"TBOT_3_17","T_UR3_17",10.0},
                        {"TBOT_3_18","T_UR3_18",10.0},
                        {"TBOT_3_19","T_UR3_19",10.0},
                        {"TBOT_3_20","T_UR3_20",10.0},
                        {"TBOT_3_21","T_UR3_21",10.0},
                        {"TBOT_3_22","T_UR3_22",10.0},
                        {"TBOT_3_23","T_UR3_23",10.0},
                        {"TBOT_3_24","T_UR3_24",10.0},
                        {"TBOT_4_1","T_UR4_01",10.0},
                        {"TBOT_4_2","T_UR4_02",10.0},
                        {"TBOT_4_3","T_UR4_03",10.0},
                        {"TBOT_4_4","T_UR4_04",10.0},
                        {"TBOT_4_5","T_UR4_05",10.0},
                        {"TBOT_4_6","T_UR4_06",10.0},
                        {"TBOT_4_7","T_UR4_07",10.0},
                        {"TBOT_4_8","T_UR4_08",10.0},
                        {"TBOT_4_9","T_UR4_09",10.0},
                        {"TBOT_4_10","T_UR4_10",10.0},
                        {"TBOT_4_11","T_UR4_11",10.0},
                        {"TBOT_4_12","T_UR4_12",10.0},
                        {"TBOT_4_13","T_UR4_13",10.0},
                        {"TBOT_4_14","T_UR4_14",10.0},
                        {"TBOT_5_1","T_UR5_01",10.0},
                        {"TBOT_5_2","T_UR5_02",10.0},
                        {"TBOT_5_3","T_UR5_03",10.0},
                        {"TBOT_5_4","T_UR5_04",10.0},
                        {"TBOT_5_5","T_UR5_05",10.0},
                        {"TBOT_5_6","T_UR5_06",10.0},
                        {"TBOT_5_7","T_UR5_07",10.0},
                        {"TBOT_5_8","T_UR5_08",10.0},
                        {"TBOT_5_9","T_UR5_09",10.0},
                        {"TBOT_5_10","T_UR5_10",10.0},
                        {"TBOT_5_11","T_UR5_11",10.0},
                        {"TBOT_5_12","T_UR5_12",10.0},
                        {"TBOT_5_13","T_UR5_13",10.0},
                        {"TBOT_5_14","T_UR5_14",10.0},
                        {"TBOT_6_1","T_UR6_01",10.0},
                        {"TBOT_6_2","T_UR6_02",10.0},
                        {"TBOT_6_3","T_UR6_03",10.0},
                        {"TBOT_6_4","T_UR6_04",10.0},
                        {"TBOT_6_5","T_UR6_05",10.0},
                        {"TBOT_6_6","T_UR6_06",10.0},
                        {"TBOT_6_7","T_UR6_07",10.0},
                        {"TBOT_6_8","T_UR6_08",10.0},
                        {"TBOT_6_9","T_UR6_09",10.0},
                        {"TBOT_6_10","T_UR6_10",10.0},
                        {"TBOT_6_11","T_UR6_11",10.0},
                        {"TBOT_6_12","T_UR6_12",10.0},
                        {"TBOT_6_13","T_UR6_13",10.0},
                        {"TBOT_6_14","T_UR6_14",10.0},
                        {"TBOT_7_1","T_UR7_01",10.0},
                        {"TBOT_7_2","T_UR7_02",10.0},
                        {"TBOT_7_3","T_UR7_03",10.0},
                        {"TBOT_7_4","T_UR7_04",10.0},
                        {"TBOT_7_5","T_UR7_05",10.0},
                        {"TBOT_7_6","T_UR7_06",10.0},
                        {"TBOT_7_7","T_UR7_07",10.0},
                        {"TBOT_7_8","T_UR7_08",10.0},
                        {"TBOT_7_9","T_UR7_09",10.0},
                        {"TBOT_7_10","T_UR7_10",10.0},
                        {"TBOT_7_11","T_UR7_11",10.0},
                        {"TBOT_7_12","T_UR7_12",10.0},
                        {"TBOT_7_13","T_UR7_13",10.0},
                        {"TBOT_7_14","T_UR7_14",10.0}
                    ]
                }
            ]
        },
        {
            "RAZGAR_SHFT_HOUR",
            [
                {
                    "journal11",
                    [
                        {"TSHA_1_1","TB_UR1_1_1",10.0},
                        {"TSHA_1_2","TB_UR1_2_1",10.0},
                        {"TSHA_1_3","TB_UR1_3_1",10.0},
                        {"TSHA_1_4","TB_UR1_4_1",10.0},
                        {"TSHA_1_5","TB_UR1_5_1",10.0},
                        {"TSHA_1_6","TB_UR1_6_1",10.0},
                        {"TSHA_1_7","TB_UR1_1_2",10.0},
                        {"TSHA_1_8","TB_UR1_2_2",10.0},
                        {"TSHA_1_9","TB_UR1_3_2",10.0},
                        {"TSHA_1_10","TB_UR1_4_2",10.0},
                        {"TSHA_1_11","TB_UR1_5_2",10.0},
                        {"TSHA_1_12","TB_UR1_6_2",10.0},
                        {"TSHA_1_13","TB_UR1_1_3",10.0},
                        {"TSHA_1_14","TB_UR1_2_3",10.0},
                        {"TSHA_1_15","TB_UR1_3_3",10.0},
                        {"TSHA_1_16","TB_UR1_4_3",10.0},
                        {"TSHA_1_17","TB_UR1_5_3",10.0},
                        {"TSHA_1_18","TB_UR1_6_3",10.0},
                        {"TSHA_2_1","TB_UR2_1_1",10.0},
                        {"TSHA_2_2","TB_UR2_2_1",10.0},
                        {"TSHA_2_3","TB_UR2_3_1",10.0},
                        {"TSHA_2_4","TB_UR2_4_1",10.0},
                        {"TSHA_2_5","TB_UR2_5_1",10.0},
                        {"TSHA_2_6","TB_UR2_6_1",10.0},
                        {"TSHA_2_7","TB_UR2_1_2",10.0},
                        {"TSHA_2_8","TB_UR2_2_2",10.0},
                        {"TSHA_2_9","TB_UR2_3_2",10.0},
                        {"TSHA_2_10","TB_UR2_4_2",10.0},
                        {"TSHA_2_11","TB_UR2_5_2",10.0},
                        {"TSHA_2_12","TB_UR2_6_2",10.0},
                        {"TSHA_2_13","TB_UR2_1_3",10.0},
                        {"TSHA_2_14","TB_UR2_2_3",10.0},
                        {"TSHA_2_15","TB_UR2_3_3",10.0},
                        {"TSHA_2_16","TB_UR2_4_3",10.0},
                        {"TSHA_2_17","TB_UR2_5_3",10.0},
                        {"TSHA_2_18","TB_UR2_6_3",10.0},
                        {"TSHA_3_1","TB_UR3_1_1",10.0},
                        {"TSHA_3_2","TB_UR3_2_1",10.0},
                        {"TSHA_3_3","TB_UR3_3_1",10.0},
                        {"TSHA_3_4","TB_UR3_4_1",10.0},
                        {"TSHA_3_5","TB_UR3_5_1",10.0},
                        {"TSHA_3_6","TB_UR3_6_1",10.0},
                        {"TSHA_3_7","TB_UR3_1_2",10.0},
                        {"TSHA_3_8","TB_UR3_2_2",10.0},
                        {"TSHA_3_9","TB_UR3_3_2",10.0},
                        {"TSHA_3_10","TB_UR3_4_2",10.0},
                        {"TSHA_3_11","TB_UR3_5_2",10.0},
                        {"TSHA_3_12","TB_UR3_6_2",10.0},
                        {"TSHA_3_13","TB_UR3_1_3",10.0},
                        {"TSHA_3_14","TB_UR3_2_3",10.0},
                        {"TSHA_3_15","TB_UR3_3_3",10.0},
                        {"TSHA_3_16","TB_UR3_4_3",10.0},
                        {"TSHA_3_17","TB_UR3_5_3",10.0},
                        {"TSHA_3_18","TB_UR3_6_3",10.0},
                        {"TSHA_4_1","TB_UR4_1_1",10.0},
                        {"TSHA_4_2","TB_UR4_2_1",10.0},
                        {"TSHA_4_3","TB_UR4_3_1",10.0},
                        {"TSHA_4_4","TB_UR4_4_1",10.0},
                        {"TSHA_4_5","TB_UR4_5_1",10.0},
                        {"TSHA_4_6","TB_UR4_6_1",10.0},
                        {"TSHA_4_7","TB_UR4_1_2",10.0},
                        {"TSHA_4_8","TB_UR4_2_2",10.0},
                        {"TSHA_4_9","TB_UR4_3_2",10.0},
                        {"TSHA_4_10","TB_UR4_4_2",10.0},
                        {"TSHA_4_11","TB_UR4_5_2",10.0},
                        {"TSHA_4_12","TB_UR4_6_2",10.0},
                        {"TSHA_4_13","TB_UR4_1_3",10.0},
                        {"TSHA_4_14","TB_UR4_2_3",10.0},
                        {"TSHA_4_15","TB_UR4_3_3",10.0},
                        {"TSHA_4_16","TB_UR4_4_3",10.0},
                        {"TSHA_4_17","TB_UR4_5_3",10.0},
                        {"TSHA_4_18","TB_UR4_6_3",10.0},
                        {"TSHA_5_1","TB_UR5_1_1",10.0},
                        {"TSHA_5_2","TB_UR5_2_1",10.0},
                        {"TSHA_5_3","TB_UR5_3_1",10.0},
                        {"TSHA_5_4","TB_UR5_4_1",10.0},
                        {"TSHA_5_5","TB_UR5_5_1",10.0},
                        {"TSHA_5_6","TB_UR5_6_1",10.0},
                        {"TSHA_5_7","TB_UR5_1_2",10.0},
                        {"TSHA_5_8","TB_UR5_2_2",10.0},
                        {"TSHA_5_9","TB_UR5_3_2",10.0},
                        {"TSHA_5_10","TB_UR5_4_2",10.0},
                        {"TSHA_5_11","TB_UR5_5_2",10.0},
                        {"TSHA_5_12","TB_UR5_6_2",10.0},
                        {"TSHA_5_13","TB_UR5_1_3",10.0},
                        {"TSHA_5_14","TB_UR5_2_3",10.0},
                        {"TSHA_5_15","TB_UR5_3_3",10.0},
                        {"TSHA_5_16","TB_UR5_4_3",10.0},
                        {"TSHA_5_17","TB_UR5_5_3",10.0},
                        {"TSHA_5_18","TB_UR5_6_3",10.0}
                   ]
                },
                {
                    "tpp",
                    [
                        {"TPP_1","T_PF_01",10.0},
                        {"TPP_2","T_PF_02",10.0},
                        {"TPP_3","T_PF_03",10.0},
                        {"TPP_4","T_PF_04",10.0},
                        {"TPP_5","T_PF_05",10.0},
                        {"TPP_6","T_PF_06",10.0},
                        {"TPP_7","T_PF_07",10.0},
                        {"TPP_8","T_PF_08",10.0},
                        {"TPP_9","T_PF_09",10.0},
                        {"TPP_10","T_PF_10",10.0},
                        {"TPP_11","T_PF_11",10.0},
                        {"TPP_12","T_PF_12",10.0},
                        {"TPP_13","T_PF_13",10.0},
                        {"TPP_14","T_PF_14",10.0},
                        {"TPP_15","T_PF_15",10.0},
                        {"TPP_16","T_PF_16",10.0}
                    ]
                },
                {
                    "journal12",
                    [
                        {"THPL_1_1","T_XP1_1",10.0},
                        {"THPL_1_2","T_XP1_2",10.0},
                        {"THPL_1_3","T_XP1_3",10.0},
                        {"THPL_1_4","T_XP1_4",10.0},
                        {"THPL_1_5","T_XP1_5",10.0},
                        {"THPL_1_6","T_XP1_6",10.0},
                        {"THPL_2_1","T_XP2_1",10.0},
                        {"THPL_2_2","T_XP2_2",10.0},
                        {"THPL_2_3","T_XP2_3",10.0},
                        {"THPL_2_4","T_XP2_4",10.0},
                        {"THPL_2_5","T_XP2_5",10.0},
                        {"THPL_2_6","T_XP2_6",10.0},
                        {"THPL_3_1","T_XP3_1",10.0},
                        {"THPL_3_2","T_XP3_2",10.0},
                        {"THPL_3_3","T_XP3_3",10.0},
                        {"THPL_3_4","T_XP3_4",10.0},
                        {"THPL_3_5","T_XP3_5",10.0},
                        {"THPL_3_6","T_XP3_6",10.0},
                        {"THPL_4_1","T_XP4_1",10.0},
                        {"THPL_4_2","T_XP4_2",10.0},
                        {"THPL_4_3","T_XP4_3",10.0},
                        {"THPL_4_4","T_XP4_4",10.0},
                        {"THPL_4_5","T_XP4_5",10.0},
                        {"THPL_4_6","T_XP4_6",10.0},
                        {"THPL_5_1","T_XP5_1",10.0},
                        {"THPL_5_2","T_XP5_2",10.0},
                        {"THPL_5_3","T_XP5_3",10.0},
                        {"THPL_5_4","T_XP5_4",10.0},
                        {"THPL_5_5","T_XP5_5",10.0},
                        {"THPL_5_6","T_XP5_6",10.0},
                        {"THPL_6_1","T_XP6_1",10.0},
                        {"THPL_6_2","T_XP6_2",10.0},
                        {"THPL_6_3","T_XP6_3",10.0},
                        {"THPL_6_4","T_XP6_4",10.0},
                        {"THPL_6_5","T_XP6_5",10.0},
                        {"THPL_6_6","T_XP6_6",10.0}
                    ]
                },
                {
                    "gd_hd",
                    [
                        {"TGD","DUT_T",10.0},
                        {"FHD","DUT_F",0.2},
                        {"MHD","DUT_PAR",1.0},
                        {"QO2HD","DUT_O2",1.0},
                        {"PGD","DUT_P",1.0}
                    ]
                },
                {
                    "pkg",
                    [
                        {"PKG_V","KOL_P",1.0}
                    ]
                },
                {
                    "ter",
                    [
                        {"FDG","KOL_F",1.0}
                    ]
                },
                {
                    "sio1",
                    [
                        {"FPR_SIO_1","PAR_BAK1",1.0}
                    ]
                },
                {
                    "sio2",
                    [
                        {"FPR_SIO_2","PAR_BAK2",1.0}
                    ]
                },
                {
                    "tkg",
                    [
                        {"TKG_1","T_GO1",1.0},
                        {"TKG_2","T_GO2",1.0},
                        {"TKG_3","T_GO3",1.0},
                        {"TKG_4","T_GO4",1.0}
                    ]
                }
            ]
        }
    ].

format_datetime({{Year,Month,Day},{Hour,Minute,Second}}) ->
	lists:flatten(io_lib:format("~2..0w.~2..0w.~4..0w ~2..0w:~2..0w:~2..0w",[Day,Month,Year,Hour,Minute,Second]));
format_datetime({{Year,Month,Day},{Hour,Minute,Second},Millisecond}) ->
	lists:flatten(io_lib:format("~2..0w.~2..0w.~4..0w ~2..0w:~2..0w:~2..0w.~6..0w",[Day,Month,Year,Hour,Minute,Second,Millisecond])).

calc_delta4(T0,T1,T2,T3,T4) ->
    Dtnl=(T4-T3)/2,
    Dtvl=T3-T2,
    Dtng=T1-T0+T2-T3,
    Dtvg=(T0+T3-2*T1)/2,
    {Dtnl,Dtvl,Dtng,Dtvg}.

calc_delta2(T0,T1,T2) ->
    Dtnl=(T2-T1)/2,
    Dtvl=(T1-T0)/2,
    {Dtnl,Dtvl}.

calc_q(Fng,Dtng,Fvg,Dtvg,Fchl1,Dtchl1,Fchl2,Dtchl2) ->
    Qng=Fng*Dtng,
    Qvg=Fvg*Dtvg,
    Qchl=Fchl1*Dtchl1+Fchl2*Dtchl2,
    {Qng,Qvg,Qchl}.

calc_q4(Fnl,Dtnl,Fvl,Dtvl,Fng,Dtng,Fvg,Dtvg) ->
    Qnl=6*Fnl*Dtnl,
    Qvl=6*Fvl*Dtvl,
    Qng=6*Fng*Dtng,
    Qvg=6*Fvg*Dtvg,
    {Qnl,Qvl,Qng,Qvg}.

calc_q2(Fnl,Dtnl,Fvl,Dtvl) ->
    Qnl=6*Fnl*Dtnl,
    Qvl=6*Fvl*Dtvl,
    {Qnl,Qvl}.

calc_qsha(K,T1,T2) ->
    K*(T2-T1).


process_data_for_period(Datetime1,Datetime2) ->
    Seconds1=calendar:datetime_to_gregorian_seconds(Datetime1),
    Seconds2=calendar:datetime_to_gregorian_seconds(Datetime2),
    case Seconds1=<Seconds2 of
        true ->
            Start=calendar:gregorian_seconds_to_datetime(Seconds1),
            process_data(Start),
            NewSeconds1=Seconds1+3600,
            NewStart=calendar:gregorian_seconds_to_datetime(NewSeconds1),
            process_data_for_period(NewStart,Datetime2);
        false ->
            ok
    end.

process_data(Datetime) ->
    Seconds=calendar:datetime_to_gregorian_seconds(Datetime),
    StartSeconds=((Seconds-3600) div 3600)*3600,
    Start=calendar:gregorian_seconds_to_datetime(StartSeconds),
    Finish=calendar:gregorian_seconds_to_datetime(StartSeconds+3599),
    process_data(Start,Finish).

process_data(Start,Finish) ->
    InputDataDescription=get_input_data_description(),
    lists:foreach(
        fun({AverageTableName,TablesNames}) ->
            process_data(TablesNames,AverageTableName,Start,Finish)
        end,
        InputDataDescription
    ).

process_data(TablesNames,AverageTableName,Start,Finish) ->
    FieldsAndValues=lists:map(
        fun({TableName,Tags}) ->
            Config=lists:map(
                fun({Name,FieldName,Dispersion}) ->
                    {{Name,FieldName},{scada_tags:get_field(Name,"F_LOLO"),scada_tags:get_field(Name,"F_HIHI")},Dispersion}
                end,
                Tags
            ),
            lists:map(
                fun({{SourceField,DestinationField},{LowLimit,HighLimit},Dispersion}) ->
                    TimelineData=get_timeline_values(TableName,[SourceField],Start,Finish),
                    AverageValue=case filter_timeline_data(TimelineData,[{LowLimit,HighLimit}],[Dispersion]) of
                        [] ->
                            0.0;
                        [AvgValue] ->
                            AvgValue
                    end,
                    {DestinationField,AverageValue}        
                end,
                Config
            )
        end,
        TablesNames
    ),
    set_timeline_values(AverageTableName,lists:flatten(FieldsAndValues),Start).

get_timeline_values(TableName,Fields,Start,Finish) ->
	Request=[
		{table,TableName},
		{fields,Fields},
		{conditions,
			[
				{"INDX",gte,Start},
				{"INDX",lt,Finish}
			]
		},
		{orders,[{"INDX",asc}]}
	],
	scada_db:get_data(Request).

set_timeline_values(TableName,FieldsAndValues,Start) ->
	DeleteRequest=[
        {table,TableName},
        {conditions,[{"DT",eq,Start}]}
    ],
    scada_db:delete_data(DeleteRequest),
    InsertRequest=[
		{table,TableName},
		{fields,[{"DT",Start}|FieldsAndValues]}
	],
	scada_db:insert_data(InsertRequest).

filter_timeline_data(TimelineData,Limits,Dispersions) ->
    FilteredByLimitsTimelineData=filter_by_limits(TimelineData,Limits),
    calc_and_filter_by_dispersion(FilteredByLimitsTimelineData,Dispersions).

filter_by_limits(TimelineData,Limits) ->
    case length(TimelineData)>0 of
        false ->
            TimelineData;
        true ->
            [FirstRow|_]=TimelineData,
            case length(FirstRow)==length(Limits) of
                false ->
                    TimelineData;
                true ->
                    FilteredRows=lists:filter(
                        fun(Values) ->
                            check_limits(Values,Limits)
                        end,
                        TimelineData
					),
                    FilteredRows
            end
    end.

check_limits([],[]) ->
    true;
check_limits([Value|Values],[{MinLimit,MaxLimit}|Limits]) ->
    case (Value>=MinLimit) and (Value=<MaxLimit) of
        true ->
            check_limits(Values,Limits);
        false ->
            false
    end.

calc_and_filter_by_dispersion(TimelineData,DispersionLimits) ->
     case TimelineData of
        [] ->
            [];
        _ ->
            [FirstRowValues|RestRows]=TimelineData,
            {MinValues,MaxValues,AverageValues,CountValue}=lists:foldl(
                fun(Values,{Min,Max,Avg,Count}) ->
                    NewMin=map_vectors(Min,Values,fun min_fun/1),
                    NewMax=map_vectors(Max,Values,fun max_fun/1),
                    Counts=lists:map(fun(_) -> Count end,Values),
                    Counts2=lists:map(fun(_) -> Count+1 end,Values),
                    Mul=map_vectors(Avg,Counts,fun mul_fun/1),
                    Sum=map_vectors(Mul,Values,fun add_fun/1),
                    NewAvg=map_vectors(Sum,Counts2,fun div_fun/1),
                    {NewMin,NewMax,NewAvg,Count+1}
                end,
                {FirstRowValues,FirstRowValues,FirstRowValues,1},
                RestRows
    		),
            Zeroes=lists:map(fun(_) -> 0.0 end,FirstRowValues),
            {_,Sums}=lists:foldl(
                fun(Values,{Avg,Sum}) ->
                    Sub=map_vectors(Avg,Values,fun sub_fun/1),
                    Mul=map_vectors(Sub,Sub,fun mul_fun/1),
                    NewSum=map_vectors(Sum,Mul,fun add_fun/1),
                    {Avg,NewSum}
                end,
               	{AverageValues,Zeroes},
               	TimelineData
    		),
            case CountValue>1 of
                false ->
                    [];
                true ->
                    Mult=lists:map(fun(_) -> 1/(CountValue-1) end,FirstRowValues),
                    Dispersions=map_vectors(Sums,Mult,fun mul_fun/1),
                    ZeroConditions=map_vectors(Dispersions,Zeroes,fun eq_fun/1),
                    case all_conditions(ZeroConditions) of
                        false ->
                            LimitConditions=map_vectors(Dispersions,DispersionLimits,fun lte_fun/1),
                            case all_conditions(LimitConditions) of
                                false ->
                                    ToRemoveValues=map_vectors(MinValues,MaxValues,AverageValues,fun max_dist_fun/1),
                                    FilteredRows=lists:filter(
                                        fun(Values) ->
                                            EqConditions=map_vectors(ToRemoveValues,Values,fun neq_fun/1),
                                            all_conditions(EqConditions)
                                        end,
                                        TimelineData
    								),
                                    calc_and_filter_by_dispersion(FilteredRows,DispersionLimits);
                                true ->
                                    AverageValues
                            end;
                        true ->
                            []
                    end
        end
    end.



map_vectors(V1,V2,F) ->
    M=lists:zip(V1,V2),
    lists:map(F,M).

map_vectors(V1,V2,V3,F) ->
    M=lists:zip3(V1,V2,V3),
    lists:map(F,M).

min_fun({MinV,V}) ->
    case V<MinV of
        false ->
            MinV;
        true ->
            V
    end.

max_fun({MaxV,V}) ->
    case V>MaxV of
        false ->
            MaxV;
        true ->
            V
    end.

max_dist_fun({MinV,MaxV,V}) ->
    case abs(MaxV-V)>=abs(V-MinV) of
        false ->
            MinV;
        true ->
            MaxV
    end.

eq_fun({V1,V2}) ->
    V1==V2.

neq_fun({V1,V2}) ->
    V1/=V2.

lt_fun({V1,V2}) ->
    V1<V2.

lte_fun({V1,V2}) ->
    V1=<V2.

add_fun({V1,V2}) ->
    V1+V2.

sub_fun({V1,V2}) ->
    V1-V2.

mul_fun({V1,V2}) ->
    V1*V2.

div_fun({V1,V2}) ->
    V1/V2.

all_conditions(Conditions) ->
    lists:all(
       fun(Condition) ->
           Condition
       end
   ,Conditions).

any_conditions(Conditions) ->
    lists:any(
       fun(Condition) ->
           Condition
       end
   ,Conditions).