%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @author Владимир Щербина <vns.scherbina@gmail.com>
%% @copyright 2017
%% @version 1.1.0
%% @doc Модуль <b>{@module}</b> реализует пользовательские вычисления скорости схода шихты,
%% которые запускаются посредством модуля <i>scada_tasks</i>.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
-module(scada_charge_level_speed).

-export(
	[
		init/0,
		update_data_l/2,
		update_data_r/2
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
%% @doc <i>Вычисление и обновление данных по левой стороне</i>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
update_data_l(_Sys,Arg) ->
	Buffer=case Arg of
		undefined ->
			?log_sys(io_lib:format("~p:update_data_l initial start.~n",[?MODULE])),
			queue:new();
		_ ->
			case queue:len(Arg)<10 of
				true ->
					Arg;
				false ->
					{_,Q}=queue:out(Arg),
					Q
			end
	end,
	Timestamp=scada_share:system_time_microseconds(),
	Level=scada_tags:get_field("CHARGE_LEVEL_L","F_CV"),
	NewBuffer=queue:in({Timestamp,Level},Buffer),
	{value,{FirstTimestamp,FirstLevel}}=queue:peek_r(NewBuffer),
	{value,{LastTimestamp,LastLevel}}=queue:peek(NewBuffer),
	TimestampDifference=FirstTimestamp-LastTimestamp,
	LevelSpeed=case TimestampDifference==0 of
		true ->
			0.0;
		false ->
			case LastLevel=<FirstLevel of
				true ->
					((FirstLevel-LastLevel)*100)/(TimestampDifference/60000000);
				false ->
					0.0
			end
	end,
	scada_tags:set_field("CHARGE_LEVEL_SPEED_L","F_CV",LevelSpeed),
	NewBuffer.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Sys,Arg) -> Arg
%% @doc <i>Вычисление и обновление данных по правой стороне</i>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
update_data_r(_Sys,Arg) ->
	Buffer=case Arg of
		undefined ->
			?log_sys(io_lib:format("~p:update_data_r initial start.~n",[?MODULE])),
			queue:new();
		_ ->
			case queue:len(Arg)<10 of
				true ->
					Arg;
				false ->
					{_,Q}=queue:out(Arg),
					Q
			end
	end,
	Timestamp=scada_share:system_time_microseconds(),
	Level=scada_tags:get_field("CHARGE_LEVEL_R","F_CV"),
	NewBuffer=queue:in({Timestamp,Level},Buffer),
	{value,{FirstTimestamp,FirstLevel}}=queue:peek_r(NewBuffer),
	{value,{LastTimestamp,LastLevel}}=queue:peek(NewBuffer),
	TimestampDifference=FirstTimestamp-LastTimestamp,
	LevelSpeed=case TimestampDifference==0 of
		true ->
			0.0;
		false ->
			case LastLevel=<FirstLevel of
				true ->
					((FirstLevel-LastLevel)*100)/(TimestampDifference/60000000);
				false ->
					0.0
			end
	end,
	scada_tags:set_field("CHARGE_LEVEL_SPEED_R","F_CV",LevelSpeed),
	NewBuffer.

%%%%%%%%%%%%%%%%%%%%%%%
%%% private функции %%%
%%%%%%%%%%%%%%%%%%%%%%%

