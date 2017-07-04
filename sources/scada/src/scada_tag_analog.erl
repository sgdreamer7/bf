%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @author Владимир Щербина <vns.scherbina@gmail.com>
%% @copyright 2017
%% @version 1.1.0
%% @doc Модуль <b>{@module}</b> реализует функции обработки аналоговых тегов.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
-module(scada_tag_analog).

-export(
	[
		init/1,
		process/2,
		get_field/2,
		set_field/3,
		get_raw_value/2,
		get_config_string/1
	]
).

-include("tags.hrl").

-record(
	props,
	{
		a_cualm,
		f_cv,
		a_egudesc,
		f_hihi,
		f_hi,
		f_lo,
		f_lolo,
		f_scale,
		f_shift
	}
).

%%%%%%%%%%%%%%%%%%%%%%
%%% public функции %%%
%%%%%%%%%%%%%%%%%%%%%%

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Config::#tag{}) -> #tag{}
%% @doc <i>Инициализация тега</i>
%% <p>
%% <b>Config</b> - запись #tag{}, задающая параметры тега.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
init(Config) ->
	Props=#props{
		a_cualm="OK",
		f_cv=undefined,
		f_hihi=proplists:get_value(hihi,Config#tag.props,100.0),
		f_hi=proplists:get_value(hi,Config#tag.props,100.0),
		f_lo=proplists:get_value(lo,Config#tag.props,100.0),
		f_lolo=proplists:get_value(lolo,Config#tag.props,100.0),
		a_egudesc=proplists:get_value(units,Config#tag.props,""),
		f_scale=proplists:get_value(scale,Config#tag.props,1.0),
		f_shift=proplists:get_value(shift,Config#tag.props,0.0)
	},
	Config#tag{props=Props}.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Tag::#tag{},Value::term()) -> {#tag{},#alarm{}}
%% @doc <i>Обработка тега</i>
%% <p>
%% <b>Tag</b> - запись #tag{}, описывающая тег;<br/>
%% <b>Value</b> - задаваемое значение тега (обязательное поле тега "F_CV").<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
process(Tag,Value) ->
	Props=Tag#tag.props,
	ScaledValue=case is_float(Value) of
		true ->
			Props#props.f_scale*Value+Props#props.f_shift;
		false ->
			case is_integer(Value) of
				true ->
					Props#props.f_scale*Value+Props#props.f_shift;
				false ->
					undefined
			end
	end,
	Alarm=check_alarm(
		Tag#tag.alarming,
		ScaledValue,
		Props#props.f_lolo,
		Props#props.f_lo,
		Props#props.f_hi,
		Props#props.f_hihi
	),
	NewProps=Props#props{
		a_cualm=Alarm,
		f_cv=ScaledValue
	},
	{
		Tag#tag{
			props=NewProps
		},
		#alarm{
			id=Tag#tag.name,
			state=Alarm,
			priority=Tag#tag.alarm_priority,
			timestamp=scada_share:system_datetime(),
			description=Tag#tag.description,
			value=ScaledValue,
			units=Props#props.a_egudesc
		}
	}.


%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Tag::#tag{},Field::string()) -> term()
%% @doc <i>Чтение поля тега</i>
%% <p>
%% <b>Tag</b> - запись #tag{}, описывающая тег;<br/>
%% <b>Field</b> - имя получаемого поля тега.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
get_field(Tag,"F_CV") ->
	Tag#tag.props#props.f_cv;
get_field(Tag,"A_CV") ->
	lists:flatten(io_lib:format("~w",[Tag#tag.props#props.f_cv]));
get_field(Tag,"A_CUALM") ->
	Tag#tag.props#props.a_cualm;
get_field(Tag,"F_LOLO") ->
	Tag#tag.props#props.f_lolo;
get_field(Tag,"F_LO") ->
	Tag#tag.props#props.f_lo;
get_field(Tag,"F_HI") ->
	Tag#tag.props#props.f_hi;
get_field(Tag,"F_HIHI") ->
	Tag#tag.props#props.f_hihi;
get_field(Tag,"A_EGUDESC") ->
	Tag#tag.props#props.a_egudesc;
get_field(_Tag,"A_ETAG") ->
	"ANALOG";
get_field(Tag,"A_DESC") ->
	Tag#tag.description;
get_field(Tag,"A_IODV") ->
	atom_to_list(Tag#tag.driver);
get_field(Tag,"A_IOAD") ->
	Tag#tag.address;
get_field(Tag,"F_ENAB") ->
	Tag#tag.alarming;
get_field(Tag,"F_PRI") ->
	Tag#tag.alarm_priority;
get_field(Tag,"F_SCALE") ->
	Tag#tag.props#props.f_scale;
get_field(Tag,"F_SHIFT") ->
	Tag#tag.props#props.f_shift;
get_field(_Tag,"A_FIELDS") ->
	"F_CV,A_CV,A_CUALM,F_LOLO,F_LO,F_HI,F_HIHI,A_EGUDESC,A_DESC,A_IODV,A_IOAD,F_ENAB,F_PRI,F_SCALE,F_SHIFT";
get_field(_Tag,_) ->
	undefined.


%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Tag::#tag{},Field::string(),Value::term()) -> term()
%% @doc <i>Запись поля тега</i>
%% <p>
%% <b>Tag</b> - запись #tag{}, описывающая тег;<br/>
%% <b>Field</b> - имя устанавливаемого поля тега;<br/>
%% <b>Value</b> - значение устанавливаемого поля тега.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
set_field(Tag,"F_LOLO",Value) ->
	Props=Tag#tag.props,
	Tag#tag{props=Props#props{f_lolo=Value}};
set_field(Tag,"F_LO",Value) ->
	Props=Tag#tag.props,
	Tag#tag{props=Props#props{f_lo=Value}};
set_field(Tag,"F_HI",Value) ->
	Props=Tag#tag.props,
	Tag#tag{props=Props#props{f_hi=Value}};
set_field(Tag,"F_HIHI",Value) ->
	Props=Tag#tag.props,
	Tag#tag{props=Props#props{f_hihi=Value}};
set_field(Tag,"A_EGUDESC",Value) ->
	Props=Tag#tag.props,
	Tag#tag{props=Props#props{a_egudesc=Value}};
set_field(Tag,"A_DESC",Value) ->
	Tag#tag{description=Value};
set_field(Tag,"F_ENAB",Value) ->
	CheckFun=fun(0) -> false;
		(1) -> true;
		(0.0) -> false;
		(1.0) -> true;
		(false) -> false;
		(true) -> true;
		(_) ->
			false
	end,
	CheckedValue=CheckFun(Value),
	Tag#tag{alarming=CheckedValue};
set_field(Tag,"F_PRI",Value) ->
	Tag#tag{alarm_priority=Value};
set_field(Tag,"F_SCALE",Value) ->
	Props=Tag#tag.props,
	Tag#tag{props=Props#props{f_scale=Value}};
set_field(Tag,"F_SHIFT",Value) ->
	Props=Tag#tag.props,
	Tag#tag{props=Props#props{f_shift=Value}};
set_field(Tag,_Field,_Value) ->
	Tag.


%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Tag::#tag{},Value::term()) -> term()
%% @doc <i>Вычисление не обработанного значения тега для последующей его записи
%% в драйвер</i>
%% <p>
%% <b>Tag</b> - запись #tag{}, описывающая тег;<br/>
%% <b>Value</b> - обработанное значение поля F_CV тега.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
get_raw_value(Tag,Value) ->
	Props=Tag#tag.props,
	(Value-Props#props.f_shift)/Props#props.f_scale.


%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Tag::#tag{}) -> term()
%% @doc <i>Формирование строки для конфигурации тега</i>
%% <p>
%% <b>Tag</b> - запись #tag{}, описывающая тег.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
get_config_string(Tag) ->
	Props=Tag#tag.props,
	unicode:characters_to_binary(lists:flatten(
		[
			"{tag",
			io_lib:format(", \"~ts\"",[Tag#tag.name]),
			io_lib:format(", ~w",[Tag#tag.type]),
			io_lib:format(", \"~ts\"",[Tag#tag.description]),
			io_lib:format(", ~w",[Tag#tag.driver]),
			io_lib:format(", \"~ts\"",[Tag#tag.address]),
			io_lib:format(", ~w",[Tag#tag.alarming]),
			io_lib:format(", ~w",[Tag#tag.alarm_priority]),
			io_lib:format(", [{units,\"~ts\"},{lolo,~w},{lo,~w},{hi,~w},{hihi,~w},{scaling,~w},{shift,~w}]",[Props#props.a_egudesc,Props#props.f_lolo,Props#props.f_lo,Props#props.f_hi,Props#props.f_hihi,Props#props.f_scale,Props#props.f_shift]),
			"}.\n"
		]
	)).


%%%%%%%%%%%%%%%%%%%%%%%
%%% private функции %%%
%%%%%%%%%%%%%%%%%%%%%%%


check_alarm(false,_Value,_LOLO,_LO,_HI,_HIHI) ->
	"OK";
check_alarm(true,undefined,_LOLO,_LO,_HI,_HIHI) ->
	"ERROR";
check_alarm(true,Value,LOLO,LO,HI,HIHI) when Value=<LOLO,Value=<LO,Value=<HI,Value=<HIHI ->
	"LOLO";
check_alarm(true,Value,LOLO,LO,HI,HIHI) when Value>=LOLO,Value=<LO,Value=<HI,Value=<HIHI ->
	"LO";
check_alarm(true,Value,LOLO,LO,HI,HIHI) when Value>=LOLO,Value>=LO,Value=<HI,Value=<HIHI ->
	"OK";
check_alarm(true,Value,LOLO,LO,HI,HIHI) when Value>=LOLO,Value>=LO,Value>=HI,Value=<HIHI ->
	"HI";
check_alarm(true,Value,LOLO,LO,HI,HIHI) when Value>=LOLO,Value>=LO,Value>=HI,Value>=HIHI ->
	"HIHI";
check_alarm(_Alarming,_Value,_LOLO,_LO,_HI,_HIHI) ->
	"ERROR".

