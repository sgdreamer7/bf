%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @author Владимир Щербина <vns.scherbina@gmail.com>
%% @copyright 2017
%% @version 1.0.0
%% @doc Модуль <b>journal7.erl</b> реализует формирование данных
%% для документа печного журнала <Система загрузки>.
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
data({struct,Props}) ->
	{{Year,Month,Day},{_Hour,_Minute,_Second}}=get_timestamp("report_date",Props),
	Start=get_shift_start(Year,Month,Day,1),
	Finish=get_shift_finish(Year,Month,Day,3),
	ReportDateStr=format_date({{Year,Month,Day},{0,0,0}}),
	Request=[
		{table,"charge_system"},
		{fields,
			[
				"INDX",
				"CHARGE",
				"CYCLE",
				"MSG"
			]
		},
		{conditions,
			[
				{"INDX",gte,Start},
				{"INDX",lt,Finish}
			]
		},
		{orders,
			[
				{"INDX",asc}
			]
		}
	],
	Data=scada_db:get_data(Request),
	Messages=lists:map(
		fun(Row) ->
			[Timestamp,Charge,Cycle,Message]=Row,
			DateTime=case Timestamp of
				{Date,Time,_MicroSecs} ->
					{Date,Time};
				{Date,Time} ->
					{Date,Time}
			end,
			[Charge,format_datetime(DateTime),Cycle,Message]
		end,
		Data
	),
	{ok,
		[
			{"name","Печной журнал. Система загрузки."},
			{"report_date",ReportDateStr},
			{"messages",
				Messages
			}
		]
	};
data(_) ->
	{ok,[]}.


