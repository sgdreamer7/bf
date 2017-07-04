%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @author Владимир Щербина <vns.scherbina@gmail.com>
%% @copyright 2017
%% @version 1.1.0
%% @doc Модуль <b>{@module}</b> реализует корректировку даты/времени в контроллерах,
%% которые запускаются посредством модуля <i>scada_tasks</i>.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
-module(scada_update_datetime).

-export(
	[
		init/0,
		update_datetime_mpk_1/2,
		update_datetime_mpk_2/2
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
update_datetime_mpk_1(_Sys,Arg) ->
	ArgIn=case Arg of
		undefined ->
			?log_sys(io_lib:format("~p:update_datetime initial start.~n",[?MODULE])),
			gb_trees:empty();
		_ ->
			Arg
	end,
	{{Year,Month,Day},{Hour,Minute,Second}}=scada_share:system_datetime(),
	DateTimeValue=[
		bcd:encode16(Second*100),
		bcd:encode16(Hour*100+Minute),
		bcd:encode16(Month*100+Day),
		bcd:encode16(Year)	
	],
	case scada_share:is_active_node() of
		false ->
			do_nothing;
		true ->
			scada_tags:set_field("REF_DATE_TIME_1","F_CV",DateTimeValue),
			scada_tags:set_field("REF_DATE_TIME_TRIG_1","F_CV",1-scada_tags:get_field("REF_DATE_TIME_TRIG_1","F_CV"))
	end,
	ArgIn.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Sys,Arg) -> Arg
%% @doc <i>Обновление даты/времени</i>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
update_datetime_mpk_2(_Sys,Arg) ->
	ArgIn=case Arg of
		undefined ->
			?log_sys(io_lib:format("~p:update_datetime initial start.~n",[?MODULE])),
			gb_trees:empty();
		_ ->
			Arg
	end,
	{{Year,Month,Day},{Hour,Minute,Second}}=scada_share:system_datetime(),
	DateTimeValue=[
		bcd:encode16(Second*100),
		bcd:encode16(Hour*100+Minute),
		bcd:encode16(Month*100+Day),
		bcd:encode16(Year)
	],
	case scada_share:is_active_node() of
		false ->
			do_nothing;
		true ->
			scada_tags:set_field("REF_DATE_TIME_2","F_CV",DateTimeValue),
			scada_tags:set_field("REF_DATE_TIME_TRIG_2","F_CV",1-scada_tags:get_field("REF_DATE_TIME_TRIG_2","F_CV"))
	end,
	ArgIn.

%%%%%%%%%%%%%%%%%%%%%%%
%%% private функции %%%
%%%%%%%%%%%%%%%%%%%%%%%

