%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @author Владимир Щербина <vns.scherbina@gmail.com>
%% @copyright 2017
%% @version 1.0.0
%% @doc Модуль <b>reports.hrl</b> реализует наиболее употребимые функции
%% при формировании рапортов.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
-define(FirstShiftHour,23).
-define(FirstShiftMinute,0).
-define(SecondShiftHour,07).
-define(SecondShiftMinute,0).
-define(ThirdShiftHour,15).
-define(ThirdShiftMinute,0).

%%%%%%%%%%%%%%%%%%%%%%
%%% public функции %%%
%%%%%%%%%%%%%%%%%%%%%%

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Fieldname,Props) -> term
%% @doc <i>Получение значения по ключу из списка записей</i>
%% <p>
%% <b>Fieldname</b> - имя ключа;<br/>
%% <b>Props</b> - список ключей со значениями.
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
get_field(Fieldname,Props) ->
	get_field(Fieldname,Props,undefined).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Fieldname,Props,Default) -> term
%% @doc <i>Получение значения по ключу из списка записей</i>
%% <p>
%% <b>Fieldname</b> - имя ключа;<br/>
%% <b>Props</b> - список ключей со значениями;<br/>
%% <b>Default</b> - значение ключа по умолчанию.
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%	
get_field(Fieldname,Props,Default) ->
	case proplists:get_value(Fieldname,Props,Default) of
		{struct,Fields} ->
			Fields;
		{array,Array} ->
			Array;
		Value ->
			Value	
	end.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (V) -> term
%% @doc <i>Вычисление даты и времени по количеству секунд</i>
%% <p>
%% <b>V</b> - количество секунд.
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%	
ts(V) when is_integer(V) ->
	calendar:gregorian_seconds_to_datetime(V);
ts(_) ->
	0.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Year,Month,Day,Hour,Minute,Second) -> term
%% @doc <i>Формирование даты и времени по компонентам</i>
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
ts(Year,Month,Day,Hour,Minute,Second) ->
	{{Year,Month,Day},{Hour,Minute,Second}}.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec ({{Year,Month,Day},{Hour,Minute,Second}}) -> term
%% @doc <i>Вычисление секунд из даты и времени</i>
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
ts_val({{0,0,0},_}) ->
	calendar:datetime_to_gregorian_seconds({{2014,8,14},{17,0,0}});
ts_val({{Year,Month,Day},{Hour,Minute,Second}}) ->
	calendar:datetime_to_gregorian_seconds({{Year,Month,Day},{Hour,Minute,Second}}).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Timestamp,SecondsShift) -> term
%% @doc <i>Прибавление секунд к дате и времени</i>
%% <p>
%% <b>Timestamp</b> - дата и время;<br/>
%% <b>SecondsShift</b> - количество прибавляемых секунд.
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
ts_add(Timestamp,SecondsShift) ->
	Seconds=ts_val(Timestamp),
	ts(Seconds+SecondsShift).
	
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Start,Finish) -> term
%% @doc <i>Вычисление разницы в секундах между двумя датами/временами</i>
%% <p>
%% <b>Start</b> - начальная дата и время;<br/>
%% <b>Finish</b> - конечная дата и время.
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
ts_dif(Start,Finish) ->
	V1=ts_val(Start),
	V2=ts_val(Finish),
	V2-V1.
	
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Year,Month,Day,Shift) -> term
%% @doc <i>Вычисление начала смены по компонентам даты и номеру смены</i>
%% <p>
%% <b>Year</b> - значение года;<br/>
%% <b>Month</b> - значение месяца;<br/>
%% <b>Day</b> - значение дня месяца;<br/>
%% <b>Shift</b> - номер смены.
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
get_shift_start(Year,Month,Day,1) ->
	ts_add(ts(Year,Month,Day,?FirstShiftHour,?FirstShiftMinute,0),-24*3600);
get_shift_start(Year,Month,Day,2) ->
	ts(Year,Month,Day,?SecondShiftHour,?SecondShiftMinute,0);
get_shift_start(Year,Month,Day,3) ->
	ts(Year,Month,Day,?ThirdShiftHour,?ThirdShiftMinute,0).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Year,Month,Day,Shift) -> term
%% @doc <i>Вычисление окончания смены по компонентам даты и номеру смены</i>
%% <p>
%% <b>Year</b> - значение года;<br/>
%% <b>Month</b> - значение месяца;<br/>
%% <b>Day</b> - значение дня месяца;<br/>
%% <b>Shift</b> - номер смены.
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
get_shift_finish(Year,Month,Day,Shift) ->
	ts_add(get_shift_start(Year,Month,Day,Shift),8*3600).


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
get_shift({Date,Time,_MicroSecs}) ->
	get_shift({Date,Time});
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
%% @spec ({{Year,Month,Day},{Hour,Minute,Second}}) -> term
%% @doc <i>Форматирование даты и времени</i>
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
format_datetime({{Year,Month,Day},{Hour,Minute,Second}}) ->
	lists:flatten(io_lib:format("~2..0w.~2..0w.~4..0w ~2..0w:~2..0w:~2..0w",[Day,Month,Year,Hour,Minute,Second]));
format_datetime({{Year,Month,Day},{Hour,Minute,Second},Millisecond}) ->
	lists:flatten(io_lib:format("~2..0w.~2..0w.~4..0w ~2..0w:~2..0w:~2..0w.~6..0w",[Day,Month,Year,Hour,Minute,Second,Millisecond])).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec ({{Year,Month,Day},{Hour,Minute,Second}}) -> term
%% @doc <i>Форматирование даты</i>
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
format_date({{Year,Month,Day},{_Hour,_Minute,_Second}}) ->
	lists:flatten(io_lib:format("~2..0w.~2..0w.~4..0w",[Day,Month,Year]));
format_date({{Year,Month,Day},{_Hour,_Minute,_Second},_Millisecond}) ->
	lists:flatten(io_lib:format("~2..0w.~2..0w.~4..0w",[Day,Month,Year])).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec ({{Year,Month,Day},{Hour,Minute,Second}}) -> term
%% @doc <i>Форматирование времени</i>
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
format_time({{_Year,_Month,_Day},{Hour,Minute,Second}}) ->
	lists:flatten(io_lib:format("~2..0w:~2..0w:~2..0w",[Hour,Minute,Second]));
format_time({{_Year,_Month,_Day},{Hour,Minute,Second},_Millisecond}) ->
	lists:flatten(io_lib:format("~2..0w:~2..0w:~2..0w",[Hour,Minute,Second])).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Fieldname,Props) -> term
%% @doc <i>Получение значения даты и времени по ключу из списка записей</i>
%% <p>
%% <b>Fieldname</b> - имя ключа;<br/>
%% <b>Props</b> - список ключей со значениями.
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
get_timestamp(FieldName,Props) ->
	Timestamp=get_field(FieldName,Props),
	Year=get_field("year",Timestamp,0),
	Month=get_field("month",Timestamp,0),
	Day=get_field("day",Timestamp,0),
	Hour=get_field("hour",Timestamp,0),
	Minute=get_field("minute",Timestamp,0),
	Second=get_field("second",Timestamp,0),
	ts(Year,Month,Day,Hour,Minute,Second).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Element,List) -> term
%% @doc <i>Добавление элемента в список</i>
%% <p>
%% <b>Element</b> - добавляемый элемент;<br/>
%% <b>List</b> - список.
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
append_element(Element,List) ->
	lists:reverse([Element|lists:reverse(List)]).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (In) -> term
%% @doc <i>Форматирование строки в коды Unicode</i>
%% <p>
%% <b>In</b> - входящая строка.
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
to_unicode(In) ->
	io_lib:format("~ts",[In]).