%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @author Владимир Щербина <vns.scherbina@gmail.com>
%% @copyright 2017
%% @version 1.0.0
%% @doc Модуль <b>momentary_values.erl</b> реализует формирование данных
%% для протокола мгновенных значений измеряемых технологических параметров.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
-include("reports.hrl").

%%%%%%%%%%%%%%%%%%%%%%
%%% public функции %%%
%%%%%%%%%%%%%%%%%%%%%%

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec ({struct,Props}) -> term
%% @doc <i>Формирование данных для рапорта</i>
%% <p>
%% <b>Props</b> - список ключей со значениями.
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
data({struct,_Props}) ->
	Timestamp=scada_share:system_datetime(),
	{ok,
		[
			{"name","Мгновенные значения измеряемых технологических параметров работы печи на текущий момент"},
			{"report_date",format_datetime(Timestamp)},
			build_var("FHD"),
			build_var("PGD"),
			build_var("TGD"),
			build_var("MHD"),
			build_var("QO2HD"),
			build_var("FPG_HD"),
			build_var("PPG_HD"),
			build_var("FKG"),
			build_var("PKG_V"),
			build_var("PDO"),
			build_var("PDV"),
			build_var("PDN"),
			build_var("FPG_1"),
			build_var("FPG_2"),
			build_var("FPG_3"),
			build_var("FPG_4"),
			build_var("FPG_5"),
			build_var("FPG_6"),
			build_var("FPG_7"),
			build_var("FPG_8"),
			build_var("FPG_9"),
			build_var("FPG_10"),
			build_var("FPG_11"),
			build_var("FPG_12"),
			build_var("FPG_13"),
			build_var("FPG_14"),
			build_var("FPG_15"),
			build_var("FPG_16"),
			build_var("FPG_17"),
			build_var("FPG_18"),
			build_var("FPG_19"),
			build_var("FPG_20"),
			build_var("FO2"),
			build_var("FPR")
		]
	};
data(_) ->
	{ok,[]}.

build_var(TagName) ->
	case scada_tags:get_field(TagName,"F_CV") of
		undefined ->
			io:format("~ts~n",[TagName]),
			{TagName,0};
		Value ->
			{TagName,Value}
	end.
