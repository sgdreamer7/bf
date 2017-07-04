%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @author Владимир Щербина <vns.scherbina@gmail.com>
%% @copyright 2017
%% @version 1.0.0
%% @doc Модуль <b>average_monthly_fuel_energy.erl</b> реализует формирование данных
%% для рапорта о средненедельных показателях расхода сырья и ТЭР.
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
	{{Year,Month,_Day},{_Hour,_Minute,_Second}}=Timestamp,
	DayNums=[1,2,3,4,5,6,7,8,9,10,11],
	WeekNums=[1,2,3,4],
	Weeks=lists:map(
		fun(WeekNum) ->
			Days=lists:map(
				fun(DayNum) ->
					weekday(Timestamp,DayNum,WeekNum)
				end,
				DayNums
			),
			DaysOfWork=[iif(DayNum==0,1,0) || DayNum <- Days],
			[FirstDay|OtherWeekDaysOfWork]=lists:filter(fun(0) -> false; (_) -> true end,Days),
			[LastDay|_]=lists:reverse(OtherWeekDaysOfWork),
			DaysStartFinish={get_shift_start(Year,Month,FirstDay,1),get_shift_finish(Year,Month,LastDay,3)},
			TotalDaysOfWork=lists:foldl(
				fun(DayOfWork,Acc) ->
					Acc+DayOfWork
				end,
				0,
				DaysOfWork
			),
			{
				WeekNum,
				TotalDaysOfWork,
				Days,
				DaysStartFinish
			}
		end,
		WeekNums
	),
	MonthDaysOfWork=lists:foldl(
		fun({_WeekNum,TotalDaysOfWork,_Days,_DaysStartFinish},Acc) ->
			Acc+TotalDaysOfWork
		end,
		0.0,
		Weeks
	),
	WeeklyDaysOfWork=[TotalDaysOfWork || {_WeekNum,TotalDaysOfWork,_Days,_DaysStartFinish} <- Weeks],
	SecondRow=["Кол-во суток работы"]++[iif(DayOfWork==0,lists:flatten(io_lib:format("~w",[DayOfWork])),"-") || DayOfWork <- WeeklyDaysOfWork++[MonthDaysOfWork]],
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
	Rows=lists:map(
		fun({ParameterName,ParameterFieldNames,DecimalDigits}) ->
			AvgWeeksValues=lists:map(
				fun({_WeekNum,_TotalDaysOfWork,_Days,{DayStart,DayFinish}}) ->
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
					iif(length(Data)==0,(catch SumValue/length(Data)),0.0)
				end,
				Weeks
			),
			SumMonthValue=lists:foldl(
				fun(AvgWeekValue,Acc) ->
					Acc+AvgWeekValue
				end,
				0.0,
				AvgWeeksValues
			),
			AvgMonthValue=iif(MonthDaysOfWork==0,(catch SumMonthValue/MonthDaysOfWork),0.0),
			[ParameterName]++[iif(RowValue==0.0,erlydtl_filters:floatformat(RowValue,DecimalDigits),"-") || RowValue <- AvgWeeksValues++[AvgMonthValue]]
		end,
		Parameters
	),
	ReportDateStr=format_datetime({{Year,Month,1},{0,0,0}}),
	ReportDateStr2=format_datetime({{Year,Month,calendar:last_day_of_the_month(Year,Month)},{0,0,0}}),
	Result={ok,
		[
			{"name","Среднесуточные показатели расхода сырья и ТЭР"},
			{"title_report_date",re:replace(ReportDateStr,":","-",[{return,list},global])},
			{"title_report_date2",re:replace(ReportDateStr2,":","-",[{return,list},global])},
			{"report_date",ReportDateStr},
			{"report_date2",ReportDateStr2},
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