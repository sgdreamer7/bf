%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @author Владимир Щербина <vns.scherbina@gmail.com>
%% @copyright 2017
%% @version 1.1.0
%% @doc Модуль <b>{@module}</b> реализует пользовательские функции регистрации параметров загрузки,
%% которые запускаются посредством модуля <i>scada_tasks</i>.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
-module(scada_charge).

-export(
	[
		init/0,
		update_cycles_data/2
	]
).

-include("logs.hrl").

-define(FirstShiftHour,23).
-define(FirstShiftMinute,0).
-define(SecondShiftHour,07).
-define(SecondShiftMinute,0).
-define(ThirdShiftHour,15).
-define(ThirdShiftMinute,0).
-define(table_name,"charge_program").

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
				{"PROGRAM",ascii},
				{"SKIP1",ascii},
				{"SKIP2",ascii},
				{"SKIP3",ascii},
				{"SKIP4",ascii},
				{"SKIP5",ascii},
				{"SKIP6",ascii},
				{"COKE_SKIPS",integer},
				{"SINTER_SKIPS",integer}
			]
		},
		{indexes,[{"INDX",not_unique}]}
	],
	scada_db:create_table(Request),
	scada_share:subscribe(store_charge_program,fun store_cycles_data/1),
	ok.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Sys,Arg) -> Arg
%% @doc <i>Обновление данных для протокола загрузки</i>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
update_cycles_data(_Sys,Arg) ->
	ArgIn=case Arg of
		undefined ->
			?log_sys(io_lib:format("~p:update_cycles_data initial start.~n",[?MODULE])),
			gb_trees:enter(last_hour,-1,gb_trees:enter(last_shift,0,gb_trees:empty()));
		_ ->
			Arg
	end,
	case scada_share:is_active_node() of
		true ->
			Cycle=scada_tags:get_field("PX_PROCESSED","F_CV"),
			case Cycle==0.0 of
				false ->
					Timestamp=scada_share:system_time(),
					{Date,Time,_MicroSecs}=Timestamp,
					CheckFun=fun(TagName) ->
						case scada_tags:get_field(TagName,"F_CV") of
							undefined ->
								0;
							Value ->
								Value
						end
					end,
					% OldCharge=CheckFun("CHARGE"),
					% OldChargeLastShift=CheckFun("CHARGE_LAST_SHIFT"),
					% OldChargeCurrentHour=CheckFun("CHARGE_CURRENT_HOUR"),
					% OldChargeLastHour=CheckFun("CHARGE_LAST_HOUR"),
					% OldChargeDay=CheckFun("CHARGE_DAY"),
					Shift=get_shift({Date,Time}),
					{Hour,_,_}=Time,
					% {Charge,ChargeLastShift,ChargeDay}=case Shift==gb_trees:get(last_shift,ArgIn) of
					% 	false ->
					% 		case Shift of
					% 			1 ->
					% 				{1,OldCharge,1};
					% 			_ ->
					% 				{1,OldCharge,OldChargeDay+1}
					% 		end;
					% 	true ->
					% 		{OldCharge+1,OldChargeLastShift,OldChargeDay+1}
					% end,
					% {ChargeCurrentHour,ChargeLastHour}=case Hour==gb_trees:get(last_hour,ArgIn) of
					% 	false ->
					% 		{1,OldChargeCurrentHour};
					% 	true ->
					% 		{OldChargeCurrentHour+1,OldChargeLastHour}
					% end,
					% scada_tags:set_field("CHARGE","F_CV",Charge),
					% scada_tags:set_field("CHARGE_LAST_SHIFT","F_CV",ChargeLastShift),
					% scada_tags:set_field("CHARGE_CURRENT_HOUR","F_CV",ChargeCurrentHour),
					% scada_tags:set_field("CHARGE_LAST_HOUR","F_CV",ChargeLastHour),
					% scada_tags:set_field("CHARGE_DAY","F_CV",ChargeDay),
					Charge=CheckFun("CHARGE"),
					PA_Processed=scada_tags:get_field("PA_PROCESSED","F_CV"),
					PB_Processed=scada_tags:get_field("PB_PROCESSED","F_CV"),
					PC_Processed=scada_tags:get_field("PC_PROCESSED","F_CV"),
					PD_Processed=scada_tags:get_field("PD_PROCESSED","F_CV"),
					PE_Processed=scada_tags:get_field("PE_PROCESSED","F_CV"),
					Program=case {PA_Processed,PB_Processed,PC_Processed,PD_Processed,PE_Processed} of
						{1,0,0,0,0} ->
							1;
						{0,1,0,0,0} ->
							2;
						{0,0,1,0,0} ->
							3;
						{0,0,0,1,0} ->
							4;
						{0,0,0,0,1} ->
							5;
						_ ->
							"-"
					end,
					Skips=[get_program_skip_type(Skip,Program) || Skip <- [1,2,3,4,5,6]],
					[Skip1,Skip2,Skip3,Skip4,Skip5,Skip6]=[format_skip_type(SkipType) || SkipType <-Skips],
					{CokeSkips,SinterSkips}=lists:foldl(
						fun(1,{CokeSkipsIn,SinterSkipsIn}) ->
							{CokeSkipsIn+1,SinterSkipsIn};
						(2,{CokeSkipsIn,SinterSkipsIn}) ->
							{CokeSkipsIn,SinterSkipsIn+1};
						(_SkipType,{CokeSkipsIn,SinterSkipsIn}) ->
							{CokeSkipsIn,SinterSkipsIn}
						end,
						{0,0},
						Skips
					),
					Request=[
						{table,?table_name},
						{
							fields,
							[
								{"INDX",Timestamp},
								{"CHARGE",Charge},
								{"CYCLE",Cycle},
								{"PROGRAM",format_program(Program)},
								{"SKIP1",Skip1},
								{"SKIP2",Skip2},
								{"SKIP3",Skip3},
								{"SKIP4",Skip4},
								{"SKIP5",Skip5},
								{"SKIP6",Skip6},
								{"COKE_SKIPS",CokeSkips},
								{"SINTER_SKIPS",SinterSkips}
							]
						}
					],
					case scada_share:is_active_node() of
						true ->
							scada_share:send(store_charge_program,Request);
						false ->
							do_nothing
					end,
					gb_trees:enter(last_hour,Hour,gb_trees:enter(last_shift,Shift,ArgIn));
				true ->
					ArgIn
			end;
		false ->
			ArgIn
	end.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Request) -> Arg
%% @doc <i>Сохранение данных для протокола загрузки</i>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
store_cycles_data(Request) ->
	scada_db:insert_data(Request).

%%%%%%%%%%%%%%%%%%%%%%%
%%% private функции %%%
%%%%%%%%%%%%%%%%%%%%%%%

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec ({{Year,Month,Day},{Hour,Minute,Second}}) -> term
%% @doc <i>Вычисление номера смены</i>
%% <p>
%% <b>Year</b> - значение года;<br/>
%% <b>Month</b> - значение месяца;<br/>
%% <b>Day</b> - значение дня месяца;<br/>
%% <b>Hour</b> - значение часа;<br/>
%% <b>Minute</b> - значение минуты;<br/>
%% <b>Second</b> - значение секунд.
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%	
get_shift({{_Year,_Month,_Day},{Hour,_Minute,_Second}})
	when Hour>=?FirstShiftHour; Hour<?SecondShiftHour ->
		1;
get_shift({{_Year,_Month,_Day},{Hour,_Minute,_Second}})
	when Hour>=?SecondShiftHour; Hour<?ThirdShiftHour ->
		2;
get_shift({{_Year,_Month,_Day},{Hour,_Minute,_Second}})
	when Hour>=?ThirdShiftHour; Hour<?FirstShiftHour ->
		3;
get_shift(_) ->
	0.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Skip,Program) -> term
%% @doc <i>Вычисление типа скипа в программе</i>
%% <p>
%% <b>Skip</b> - номер скипа в программе;<br/>
%% <b>Program</b> - номер программы.
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%	
get_program_skip_type(Skip,Program) ->
	Coke=scada_tags:get_field(format_program_tagname(Skip,Program,"COKE"),"F_CV"),
	Sinter=scada_tags:get_field(format_program_tagname(Skip,Program,"SINTER"),"F_CV"),
	Empty=scada_tags:get_field(format_program_tagname(Skip,Program,"EMPTY"),"F_CV"),
	SkipSkip=scada_tags:get_field(format_program_tagname(Skip,Program,"SKIP"),"F_CV"),
	case {Coke,Sinter,Empty,SkipSkip} of
		{1,0,0,0} ->
			1;
		{0,1,0,0} ->
			2;
		{0,0,1,0} ->
			3;
		{0,0,0,1} ->
			4;
		_ ->
			0
	end.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Skip,Program,Material) -> term
%% @doc <i>Вычисление имени тега для скипа в программе</i>
%% <p>
%% <b>Skip</b> - номер скипа в программе;<br/>
%% <b>Program</b> - номер программы;<br/>
%% <b>Material</b> -тип материала в скипе.
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%	
format_program_tagname(Skip,1,Material) ->
	lists:flatten(io_lib:format("PA_~1..0w_~s",[Skip,Material]));
format_program_tagname(Skip,2,Material) ->
	lists:flatten(io_lib:format("PB_~1..0w_~s",[Skip,Material]));
format_program_tagname(Skip,3,Material) ->
	lists:flatten(io_lib:format("PC_~1..0w_~s",[Skip,Material]));
format_program_tagname(Skip,4,Material) ->
	lists:flatten(io_lib:format("PD_~1..0w_~s",[Skip,Material]));
format_program_tagname(Skip,5,Material) ->
	lists:flatten(io_lib:format("PE_~1..0w_~s",[Skip,Material]));
format_program_tagname(_Skip,_Program,_Material) ->
	"".

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
