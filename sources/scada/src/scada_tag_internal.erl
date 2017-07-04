%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @author Владимир Щербина <vns.scherbina@gmail.com>
%% @copyright 2017
%% @version 1.1.0
%% @doc Модуль <b>{@module}</b> реализует функции обработки внутренних тегов.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
-module(scada_tag_internal).

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
		f_cv
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
		f_cv=undefined
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
	NewProps=Props#props{
		f_cv=Value
	},
	{
		Tag#tag{
			props=NewProps
		},
		#alarm{
			id=Tag#tag.name,
			state="OK",
			priority=Tag#tag.alarm_priority,
			timestamp=scada_share:system_datetime(),
			description=Tag#tag.description,
			value=Value,
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
	Tag#tag.props#props.f_cv;
get_field(_Tag,"A_ETAG") ->
	"INTERNAL";
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
	"F_CV,A_CV,A_DESC,A_IODV,A_IOAD,F_ENAB,F_PRI,A_EGUDESC";
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
set_field(Tag,"A_CV",Value) ->
	Props=Tag#tag.props,
	Tag#tag{props=Props#props{f_cv=Value}};
set_field(Tag,"F_CV",Value) ->
	Props=Tag#tag.props,
	Tag#tag{props=Props#props{f_cv=Value}};
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
			io_lib:format(", []",[]),
			"}.\n"
		]
	)).

%%%%%%%%%%%%%%%%%%%%%%%
%%% private функции %%%
%%%%%%%%%%%%%%%%%%%%%%%

