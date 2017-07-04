%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @author Владимир Щербина <vns.scherbina@gmail.com>
%% @copyright 2017
%% @version 1.1.0
%% @doc Модуль <b>{@module}</b> реализует пользовательские фильтры для erlydtl.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
-module(custom_filters).

-export(
	[
		floatformat/2
	]
).

floatformat(0,_Place) ->
	"-";
floatformat(0.0,_Place) ->
	"-";
floatformat(Number,Place) ->
	erlydtl_filters:floatformat(Number,Place).