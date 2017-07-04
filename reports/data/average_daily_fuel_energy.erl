%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @author Владимир Щербина <vns.scherbina@gmail.com>
%% @copyright 2017
%% @version 1.0.0
%% @doc Модуль <b>average_daily_fuel_energy.erl</b> реализует формирование данных
%% для рапорта о среднесуточных показателях расхода сырья и ТЭР.
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
	Timestamp=get_timestamp("report_date",Props),
	Week=element(1,string:to_integer(get_field("shift",Props))),
	{{Year,Month,_Day},{_Hour,_Minute,_Second}}=Timestamp,
	DayNums=[1,2,3,4,5,6,7,8,9,10,11],
	WeekNums=[1,2,3,4],
	Weeks=lists:map(
		fun(WeekNum) ->
			{
				WeekNum,
				lists:map(
					fun(DayNum) ->
						weekday(Timestamp,DayNum,WeekNum)
					end,
					DayNums
				)
			}
		end,
		WeekNums
	),
	WeekDays=lists:foldl(
		fun({WeekNum,Days},Acc) ->
			iif(WeekNum==Week,Acc,Days)
		end,
		[0,0,0,0,0,0,0,0,0,0,0],
		Weeks
	),
	DaysOfWork=[iif(DayNum==0,1,0) || DayNum <- WeekDays],
	TotalDaysOfWork=lists:foldl(
		fun(DayOfWork,Acc) ->
			Acc+DayOfWork
		end,
		0,
		DaysOfWork
	),
	Parameters=[
		{"Выход доменного газа, м<sup>3</sup>/час",["FDG"],1},
		{"Расход технического кислорода, м<sup>3</sup>/час",["FO2"],1},
		{"Расход сжатого воздуха, м<sup>3</sup>/час",["FVZ"],0},
		{"Расход общий пара, т/час",["FPR"],2},
		{"Расход пара на увлажнение дутья, т/час",["FPR_HD"],2},
		{"Расход общий азота, м<sup>3</sup>/час",["FAZ"],0},
		{"Расход воды водовод 1, м<sup>3</sup>/час",["FVD_1"],0},
		{"Расход воды водовод 2, м<sup>3</sup>/час",["FVD_2"],0},
		{"Расход питательной воды - СИО печи, м<sup>3</sup>/час",["FVD_PIT_1","FVD_PIT_2"],2},
		{"Расход питательной воды - СИО ВН, м<sup>3</sup>/час",["FVD_PIT_VN_1","FVD_PIT_VN_2"],2},
		{"Расход доменного газа на ГСС, м<sup>3</sup>/час",["FDG_GSS"],0}
	],
	FirstRow=[iif(DayNum==0,lists:flatten(io_lib:format("~w",[DayNum])),"-") || DayNum <- WeekDays],
	SecondRow=["Кол-во суток работы"]++[iif(DayOfWork==0,lists:flatten(io_lib:format("~w",[DayOfWork])),"-") || DayOfWork <- DaysOfWork++[TotalDaysOfWork]],
	DaysStartFinish=[iif(DayNum==0,(catch {get_shift_start(Year,Month,DayNum,1),get_shift_finish(Year,Month,DayNum,3)}),undefined) || DayNum <- WeekDays],
	Rows=lists:map(
		fun({ParameterName,ParameterFieldNames,DecimalDigits}) ->
			AvgDaysValues=lists:map(
				fun({DayStart,DayFinish}) ->
					Request=[
						{table,"average_fuel_energy"},
						{fields,
							ParameterFieldNames
						},
						{conditions,
							[
								{"INDX",gte,DayStart},
								{"INDX",lt,DayFinish}
							]
						},
						{orders,[{"INDX",asc}]}
					],
					Data=scada_db:get_data(Request),
					SumValue=lists:foldl(
						fun(Values,Acc) ->
							lists:foldl(
								fun(Value,Acc2) ->
									Acc2+Value
								end,
								0.0,
								Values
							)+Acc
						end,
						0.0,
						Data
					),
					iif(length(Data)==0,(catch SumValue/length(Data)),0.0);
					(undefined) ->
						0.0
				end,
				DaysStartFinish
			),
			SumWeekValue=lists:foldl(
				fun(AvgDayValue,Acc) ->
					Acc+AvgDayValue
				end,
				0.0,
				AvgDaysValues
			),
			AvgWeekValue=iif(TotalDaysOfWork==0,(catch SumWeekValue/TotalDaysOfWork),0.0),
			[ParameterName]++[iif(RowValue==0.0,erlydtl_filters:floatformat(RowValue,DecimalDigits),"-") || RowValue <- AvgDaysValues++[AvgWeekValue]]
		end,
		Parameters
	),
	[FirstDay|OtherWeekDaysOfWork]=lists:filter(fun(0) -> false; (_) -> true end,WeekDays),
	[LastDay|_]=lists:reverse(OtherWeekDaysOfWork),
	ReportDateStr=format_datetime({{Year,Month,FirstDay},{0,0,0}}),
	ReportDateStr2=format_datetime({{Year,Month,LastDay},{0,0,0}}),
	Result={ok,
		[
			{"name","Среднесуточные показатели расхода сырья и ТЭР"},
			{"title_report_date",re:replace(ReportDateStr,":","-",[{return,list},global])},
			{"title_report_date2",re:replace(ReportDateStr2,":","-",[{return,list},global])},
			{"report_date",ReportDateStr},
			{"report_date2",ReportDateStr2},
			{"first_row",[FirstRow]},
			{"rows",[SecondRow]++Rows}
		]
	},
	Result;
data(_) ->
	{ok,[]}.

weekday(ReportDateTime,DayNum,WeekNum) ->
	{Year,Month}=case ReportDateTime of
		{{Y,M,_D},_Time} ->
			{Y,M};
		{{Y,M,_D},_Time,_MicroSecs} ->
			{Y,M}
	end,
	WD=calendar:day_of_the_week({Year,Month,1}),
	WD1=iif(WD<4,8-WD+7,4-WD+7),
	case WeekNum of
		1 ->
			iif(DayNum=<WD1,0,DayNum);
		2 ->
			iif(DayNum=<7,0,WD1+DayNum);
		3 ->
			iif(DayNum=<7,0,WD1+7+DayNum);
		4 ->
			iif(DayNum=<calendar:last_day_of_the_month(Year,Month)-(WD1+14),0,WD1+14+DayNum);
		_ ->
			0
	end.

iif(Condition,FalseValue,TrueValue) ->
	case Condition of
		false ->
			FalseValue;
		true ->
			TrueValue
	end.