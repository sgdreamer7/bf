%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @author Владимир Щербина <vns.scherbina@gmail.com>
%% @copyright 2017
%% @version 1.1.0
%% @doc Модуль <b>{@module}</b> реализует функции обработки дискретных тегов.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
-module(scada_tag_digital).

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
		a_opendesc,
		a_closedesc,
		a_almck,
		close_value,
		open_value
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
	{OpenDesc,CloseDesc}=proplists:get_value(units,Config#tag.props,{"OPEN","CLOSE"}),
	{OpenValue,CloseValue}=proplists:get_value(substitution,Config#tag.props,{0,1}),
	Props=#props{
		a_cualm="OK",
		f_cv=undefined,
		a_opendesc=OpenDesc,
		a_closedesc=CloseDesc,
		a_almck=proplists:get_value(alarm,Config#tag.props,none),
		close_value=CloseValue,
		open_value=OpenValue
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
	CheckFun=fun(0) -> 0;
		(1) -> 1;
		(0.0) -> 0;
		(1.0) -> 1;
		(false) -> 0;
		(true) -> 1;
		(V) when V==Props#props.open_value -> 0;
		(V) when V==Props#props.close_value -> 1;
		(_) ->
			0
	end,
	CheckedValue=CheckFun(Value),
	Alarm=check_alarm(
		Tag#tag.alarming,
		Tag#tag.props#props.f_cv,
		CheckedValue,
		Props#props.a_almck
	),
	NewProps=Props#props{
		a_cualm=Alarm,
		f_cv=CheckedValue
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
			value=get_units(Props,CheckedValue),
			units=""
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
	case ((Tag#tag.props#props.a_opendesc=="") or (Tag#tag.props#props.a_closedesc=="")) of
		true ->
			lists:flatten(io_lib:format("~w",[Tag#tag.props#props.f_cv]));
		false ->
			case Tag#tag.props#props.f_cv of
				0 ->
					Tag#tag.props#props.a_opendesc;
				1 ->
					Tag#tag.props#props.a_closedesc;
				_ ->
					lists:flatten(io_lib:format("~w",[Tag#tag.props#props.f_cv]))
			end
	end;
get_field(Tag,"A_CUALM") ->
	Tag#tag.props#props.a_cualm;
get_field(Tag,"A_OPENDESC") ->
	Tag#tag.props#props.a_opendesc;
get_field(Tag,"A_CLOSEDESC") ->
	Tag#tag.props#props.a_closedesc;
get_field(Tag,"A_ALMCK") ->
	get_almck(Tag#tag.props#props.a_almck);
get_field(_Tag,"A_ETAG") ->
	"DIGITAL";
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
get_field(_Tag,"A_EGUDESC") ->
	"";
get_field(_Tag,"A_FIELDS") ->
	"F_CV,A_CV,A_CUALM,A_OPENDESC,A_CLOSEDESC,A_ALMCK,A_DESC,A_IODV,A_IOAD,F_ENAB,F_PRI,A_EGUDESC";
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
set_field(Tag,"A_ALMCK",Value) ->
	Props=Tag#tag.props,
	Tag#tag{props=Props#props{a_almck=Value}};
set_field(Tag,"A_OPENDESC",Value) ->
	Props=Tag#tag.props,
	Tag#tag{props=Props#props{a_opendesc=Value}};
set_field(Tag,"A_CLOSEDESC",Value) ->
	Props=Tag#tag.props,
	Tag#tag{props=Props#props{a_closedesc=Value}};
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
get_raw_value(_Tag,Value) ->
	Value.

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
			case (Props#props.open_value==0) and (Props#props.close_value==1) of
				true ->
					io_lib:format(", [{units,\"~ts\",\"~ts\"},{alarm,~w}]",[Props#props.a_opendesc,Props#props.a_closedesc,Props#props.a_almck]);
				false ->
					io_lib:format(", [{units,\"~ts\",\"~ts\"},{alarm,~w},{substitution,{~w,~w}}]",[Props#props.a_opendesc,Props#props.a_closedesc,Props#props.a_almck,Props#props.open_value,Props#props.close_value])
			end,
			"}.\n"
		]
	)).

%%%%%%%%%%%%%%%%%%%%%%%
%%% private функции %%%
%%%%%%%%%%%%%%%%%%%%%%%

check_alarm(false,_PreviousValue,_Value,_ALMCK) ->
	"OK";
check_alarm(true,_PreviousValue,undefined,_ALMCK) ->
	"ERROR";
check_alarm(true,_PreviousValue,_Value,none)  ->
	"OK";
check_alarm(true,_PreviousValue,0,open) ->
	"OPEN";
check_alarm(true,_PreviousValue,1,open) ->
	"OK";
check_alarm(true,_PreviousValue,0,close) ->
	"OK";
check_alarm(true,_PreviousValue,1,close) ->
	"CLOSE";
check_alarm(true,0,0,change) ->
	"OK";
check_alarm(true,0,1,change) ->
	"CHANGE";
check_alarm(true,1,0,change) ->
	"CHANGE";
check_alarm(true,1,1,change) ->
	"OK";
check_alarm(_Alarming,_PreviousValue,_Value,_ALMCK) ->
	"ERROR".

get_units(Props,0) ->
	Props#props.a_opendesc;
get_units(Props,1) ->
	Props#props.a_closedesc;
get_units(_Props,Value) ->
	Value.

get_almck(none) ->
	"NONE";
get_almck(open) ->
	"OPEN";
get_almck(close) ->
	"CLOSE";
get_almck(change) ->
	"CHANGE";
get_almck(_ALMCK) ->
	"ERROR".
