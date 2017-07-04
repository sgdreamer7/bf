%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @author Владимир Щербина <vns.scherbina@gmail.com>
%% @copyright 2017
%% @version 1.0.0
%% @doc Модуль <b>trends.erl</b> реализует формирование данных
%% конфигурации для трендов.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
-include("reports.hrl").

%%%%%%%%%%%%%%%%%%%%%%
%%% public функции %%%
%%%%%%%%%%%%%%%%%%%%%%

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec ({struct,Props}) -> term
%% @doc <i>Формирование конфигурации для трендов</i>
%% <p>
%% <b>Props</b> - список ключей со значениями.
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
data({struct,Props}) ->
 	BackColor=var("backcolor",Props,"0xFFFFFF"),
 	Header=var("header",Props,""),
 	HeaderSize=var("header_size",Props,14),
 	Timescale=var("timescale",Props,900),
	Template=var("template",Props,""),
	Source=var("source",Props,""),
	Args=var("args",Props,""),
 	Indicators={
 		"indicators",
 		lists:map(
 			fun({struct,Indicator}) ->
 				{"inverted",Inverted}=var("inverted",Indicator,false),
 				[
 					var("header",Indicator,""),
 					var("type",Indicator,0),
 					var("group",Indicator,0),
 					var("split",Indicator,""),
 					{"inverted",iif((Inverted==true) or (Inverted==1),1,0)},
 					var("thickness",Indicator,1.0),
 					var("linestyle",Indicator,0),
 					var("color",Indicator,"0x000000"),
 					var("color2",Indicator,"0xFFFFFF"),
 					var("symbolcode",Indicator,0),
 					var("scale",Indicator,1.0),
 					var("shift",Indicator,0.0),
 					var("lower_limit",Indicator,0.0),
 					var("upper_limit",Indicator,0.0),
 					var("lower_bound",Indicator,0.0),
 					var("upper_bound",Indicator,1.0),
 					var("labels",Indicator,[])
 				]
 			end,
	 		get_field("indicators",Props,[])
 		)
 	},
	{ok,
		[
			BackColor,
		 	Header,
		 	HeaderSize,
		 	Timescale,
			Template,
			Source,
			Args,
		 	Indicators
		]
	};
data(_) ->
	{ok,[]}.

%%%%%%%%%%%%%%%%%%%%%%%
%%% private функции %%%
%%%%%%%%%%%%%%%%%%%%%%%
var(Name,Props,Default) ->
	{Name,get_field(Name,Props,Default)}.
	
iif(Condition,TrueValue,FalseValue) ->
	case Condition of
		true ->
			TrueValue;
		false ->
			FalseValue
	end.

