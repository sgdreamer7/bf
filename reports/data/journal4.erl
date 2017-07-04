%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @author Владимир Щербина <vns.scherbina@gmail.com>
%% @copyright 2017
%% @version 1.0.0
%% @doc Модуль <b>journal4.erl</b> реализует формирование данных
%% для документа печного журнала <Выпуск шлака>.
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
	ShiftStart1=get_shift_start(Year,Month,Day,1),
	ShiftStart2=get_shift_start(Year,Month,Day,2),
	ShiftStart3=get_shift_start(Year,Month,Day,3),
	ReportDateStr=format_date({{Year,Month,Day},{0,0,0}}),
	{Shift1Rows,Shift1Row}=get_shift_data(ShiftStart1),
	{Shift2Rows,Shift2Row}=get_shift_data(ShiftStart2),
	{Shift3Rows,Shift3Row}=get_shift_data(ShiftStart3),
	{ok,
		[
			{"name","Печной журнал. Выпуск шлака."},
			{"report_date",ReportDateStr},
			{"shift1_rows",Shift1Rows},
			{"shift2_rows",Shift2Rows},
			{"shift3_rows",Shift3Rows},
			{"shift1_row",Shift1Row},
			{"shift2_row",Shift2Row},
			{"shift3_row",Shift3Row}
		]
	};
data(_) ->
	{ok,[]}.

get_shift_data(ShiftStart) ->
	Fields=[
		"NUM",
		"DTGRAPHIC",
		"DTBEGIN",
		"DTEND",
		"NTAP",
		"SCOOPCOUNT",
		"SLAGSCOOPCOUNT",
		"CALCMASS",
		"TEMP",
		"SI",
		"MN",
		"CR",
		"P",
		"S",
		"SIO2",
		"CAO",
		"MRO",
		"FEO",
		"AL2O3",
		"MNO",
		"CAS",
		"SUMSLAG",
		"BASESLAG",
		"W1_1",
		"W1_2",
		"W1_3",
		"W1_4",
		"W1_5",
		"W1_6",
		"W1_7",
		"W2_1",
		"W2_2",
		"W2_3",
		"W2_4",
		"W2_5",
		"W2_6",
		"W2_7",
		"W3_1",
		"W3_2",
		"W3_3",
		"W3_4",
		"W3_5",
		"W3_6",
		"W3_7",
		"W4_1",
		"W4_2",
		"W4_3",
		"W4_4",
		"W4_5",
		"W4_6",
		"W4_7",
		"W5_1",
		"W5_2",
		"W5_3",
		"W5_4",
		"W5_5",
		"W5_6",
		"W5_7",
		"W6_1",
		"W6_2",
		"W6_3",
		"W6_4",
		"W6_5",
		"W6_6",
		"W6_7",
		"W7_1",
		"W7_2",
		"W7_3",
		"W7_4",
		"W7_5",
		"W7_6",
		"W7_7",
		"W8_1",
		"W8_2",
		"W8_3",
		"W8_4",
		"W8_5",
		"W8_6",
		"W8_7",
		"W9_1",
		"W9_2",
		"W9_3",
		"W9_4",
		"W9_5",
		"W9_6",
		"W9_7",
		"W10_1",
		"W10_2",
		"W10_3",
		"W10_4",
		"W10_5",
		"W10_6",
		"W10_7"
	],
	Request=[
		{table,"taps"},
		{fields,lists:filter(fun("") -> false; (_) -> true end,Fields)},
		{conditions,
			[
				{"DTBegin",gte,ShiftStart},
				{"DTBegin",lt,ts_add(ShiftStart,3600*8)}
			]
		},
		{orders,[{"NUM",asc}]}
	],
	Data=scada_db:get_data(Request),
	{ShiftRows,ShiftRow}=lists:foldr(
		fun(Row,{ShiftRowsAccIn,ShiftRowAccIn}) ->
			[
				NUM,
				DTGRAPHIC,
				DTBEGIN,
				DTEND,
				NTAP,
				SCOOPCOUNT,
				SLAGSCOOPCOUNT,
				CALCMASS,
				TEMP,
				SI,
				MN,
				CR,
				P,
				S,
				SIO2,
				CAO,
				MRO,
				FEO,
				AL2O3,
				MNO,
				CAS,
				SUMSLAG,
				BASESLAG,
				W1_1,
				W1_2,
				W1_3,
				W1_4,
				W1_5,
				W1_6,
				W1_7,
				W2_1,
				W2_2,
				W2_3,
				W2_4,
				W2_5,
				W2_6,
				W2_7,
				W3_1,
				W3_2,
				W3_3,
				W3_4,
				W3_5,
				W3_6,
				W3_7,
				W4_1,
				W4_2,
				W4_3,
				W4_4,
				W4_5,
				W4_6,
				W4_7,
				W5_1,
				W5_2,
				W5_3,
				W5_4,
				W5_5,
				W5_6,
				W5_7,
				W6_1,
				W6_2,
				W6_3,
				W6_4,
				W6_5,
				W6_6,
				W6_7,
				W7_1,
				W7_2,
				W7_3,
				W7_4,
				W7_5,
				W7_6,
				W7_7,
				W8_1,
				W8_2,
				W8_3,
				W8_4,
				W8_5,
				W8_6,
				W8_7,
				W9_1,
				W9_2,
				W9_3,
				W9_4,
				W9_5,
				W9_6,
				W9_7,
				W10_1,
				W10_2,
				W10_3,
				W10_4,
				W10_5,
				W10_6,
				W10_7
			]=Row,
			DTBEGINDIF_SECCONDS=ts_dif(DTGRAPHIC,DTBEGIN),
			DTBEGINDIF=case DTBEGINDIF_SECCONDS<0 of
				true ->
					lists:flatten(["-",format_time(ts(-DTBEGINDIF_SECCONDS))]);
				false ->
					case DTBEGINDIF_SECCONDS>0 of
						true ->
							format_time(ts(DTBEGINDIF_SECCONDS));
						false ->
							"00:00:00"
					end
			end,
			DTENDGRAPHIC=case DTEND of
				{{0,0,0},{0,0,0}} ->
					{{0,0,0},{0,0,0}};
				_ ->
					ts_add(DTGRAPHIC,ts_dif(DTBEGIN,DTEND))
			end,
			NewShiftRows=[[NUM,NTAP,format_time(DTBEGIN),format_time(DTEND),SLAGSCOOPCOUNT,"-","-",0.0,"-",0.0,SLAGSCOOPCOUNT,SLAGSCOOPCOUNT,SIO2,AL2O3,CAO,MRO,MNO,FEO,BASESLAG,0.0,CAS]|ShiftRowsAccIn],
			NewShiftRow=[A+B || {A,B} <- lists:zip([0.0,SLAGSCOOPCOUNT,SLAGSCOOPCOUNT],ShiftRowAccIn)],
			{NewShiftRows,NewShiftRow}
		end,
		{[],[0.0,0.0,0.0]},
		Data
	),
	{ShiftRows,[ShiftRow]}.
