%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @author Владимир Щербина <vns.scherbina@gmail.com>
%% @copyright 2017
%% @version 1.1.0
%% @doc Модуль <b>{@module}</b> реализует пользовательские функции интеграции данных АСУ "Шихтоподача",
%% которые запускаются посредством модуля <i>scada_tasks</i>.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
-module(scada_materials).

-export(
	[
		init/0,
		update_data/2,
		update_data2/2
	]
).

-include("logs.hrl").
-define(FilePrefix,"E:\\").

%%%%%%%%%%%%%%%%%%%%%%
%%% public функции %%%
%%%%%%%%%%%%%%%%%%%%%%

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec () -> ok
%% @doc <i>Начальная инициализация при запуске модуля</i>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
init() ->
	Request=[
		{table,"DOZING_COKE"},
		{fields,
			[
				{"INDX",datetime},
				{"CYCLE",integer},
				{"SKIP",integer},
				{"SIDE",integer},
				{"HUMIDITY",float},
				{"REF_TECH",float},
				{"REF_CORR",float},
				{"FACT_DOWN",float},
				{"FACT_UP",float},
				{"TIME_DOWN",float},
				{"TIME_UP",float}
			]
		},
		{indexes,[{"INDX",not_unique}]}
	],
	scada_db:create_table(Request),
	Request2=[
		{table,"DOZING"},
		{fields,
			[
				{"INDX",datetime},
				{"CYCLE",integer},
				{"SKIP",integer},
				{"LO4",float},
				{"LO3",float},
				{"LO2",float},
				{"LO1",float},
				{"LD4",float},
				{"LD3",float},
				{"LD2",float},
				{"LD1",float},
				{"LAM",float},
				{"LA",float},
				{"LKM",float},
				{"LK",float},
				{"RK",float},
				{"RKM",float},
				{"RA",float},
				{"RAM",float},
				{"RD1",float},
				{"RD2",float},
				{"RD3",float},
				{"RD4",float},
				{"RO1",float},
				{"RO2",float},
				{"RO3",float},
				{"RO4",float}
			]
		},
		{indexes,[{"INDX",not_unique}]}
	],
	scada_db:create_table(Request2),
	Request3=[
		{table,"taps"},
		{fields,
			[
				{"NUM",integer},
				{"DTGRAPHIC",datetime},
				{"DTBEGIN",datetime},
				{"DTEND",datetime},
				{"NTAP",integer},
				{"SCOOPCOUNT",float},
				{"SLAGSCOOPCOUNT",float},
				{"CALCMASS",float},
				{"TEMP",integer},
				{"SI",float},
				{"MN",float},
				{"CR",float},
				{"P",float},
				{"S",float},
				{"SIO2",float},
				{"CAO",float},
				{"MRO",float},
				{"FEO",float},
				{"AL2O3",float},
				{"MNO",float},
				{"CAS",float},
				{"SUMSLAG",float},
				{"BASESLAG",float},
				{"W1_1",integer},
				{"W1_2",float},
				{"W1_3",float},
				{"W1_4",float},
				{"W1_5",float},
				{"W1_6",float},
				{"W1_7",ascii},
				{"W2_1",integer},
				{"W2_2",float},
				{"W2_3",float},
				{"W2_4",float},
				{"W2_5",float},
				{"W2_6",float},
				{"W2_7",ascii},
				{"W3_1",integer},
				{"W3_2",float},
				{"W3_3",float},
				{"W3_4",float},
				{"W3_5",float},
				{"W3_6",float},
				{"W3_7",ascii},
				{"W4_1",integer},
				{"W4_2",float},
				{"W4_3",float},
				{"W4_4",float},
				{"W4_5",float},
				{"W4_6",float},
				{"W4_7",ascii},
				{"W5_1",integer},
				{"W5_2",float},
				{"W5_3",float},
				{"W5_4",float},
				{"W5_5",float},
				{"W5_6",float},
				{"W5_7",ascii},
				{"W6_1",integer},
				{"W6_2",float},
				{"W6_3",float},
				{"W6_4",float},
				{"W6_5",float},
				{"W6_6",float},
				{"W6_7",ascii},
				{"W7_1",integer},
				{"W7_2",float},
				{"W7_3",float},
				{"W7_4",float},
				{"W7_5",float},
				{"W7_6",float},
				{"W7_7",ascii},
				{"W8_1",integer},
				{"W8_2",float},
				{"W8_3",float},
				{"W8_4",float},
				{"W8_5",float},
				{"W8_6",float},
				{"W8_7",ascii},
				{"W9_1",integer},
				{"W9_2",float},
				{"W9_3",float},
				{"W9_4",float},
				{"W9_5",float},
				{"W9_6",float},
				{"W9_7",ascii},
				{"W10_1",integer},
				{"W10_2",float},
				{"W10_3",float},
				{"W10_4",float},
				{"W10_5",float},
				{"W10_6",float},
				{"W10_7",ascii}
			]
		},
		{indexes,[{"NUM",unique}]}
	],
	scada_db:create_table(Request3),
	ok.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Sys,Arg) -> Arg
%% @doc <i>Обновление данных, добавление новых данных</i>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
update_data(_Sys,Arg) ->
	ArgIn=case Arg of
		undefined ->
			?log_sys(io_lib:format("~p:update_data initial start.~n",[?MODULE])),
			gb_trees:empty();
		_ ->
			Arg
	end,
	odbc:start(),
	{ok,OdbcRef}=odbc:connect("DSN=SHIHTA;UID=rpt;PWD=Siemens4Siemens",[{binary_strings,off}]),
	RequestDBName="SELECT Param1 FROM [master].[dbo].[CAConfig];",
	{selected,_ColNames0,[{DBNameWithSpaces}]}=odbc:sql_query(OdbcRef,RequestDBName),	
	DBName=lists:foldr(
		fun(0,AccIn) ->
				AccIn;
			(C,AccIn) ->
				[C|AccIn]
		end,
		[],
		binary_to_list(DBNameWithSpaces)
	),
	Request1=
	[
		{table,"DOZING_COKE"},
		{fields,
			[
				"INDX"
			]
		},
		{orders,[{"INDX",desc}]},
		{limit,1}
	],
	LastTimestamp1=case scada_db:get_data(Request1) of
		[[LT1]] ->
			LT1;
		_ ->
			{{2013,1,1},{0,0,0}}
	end,
	Request2=lists:flatten(
		io_lib:format(
			"SELECT UnloadTime,BatchNumber,CyclePos,SkippLR,CokeMoisture,SetWeight_T,SetWeight_K,LoadWeight,UnloadWeight,LoadPeriod,UnloadPeriod FROM [~s].[dbo].[UA#CokeDosing] WHERE UnloadTime>=\'~s\';",
			[DBName,format_datetime(LastTimestamp1)]
		)
	),
	{selected,_ColNames,Rows}=odbc:sql_query(OdbcRef,Request2),
	lists:foreach(
		fun({INDX,CYCLE,SKIP,SIDE_LETTER,HUMIDITY,REF_TECH,REF_CORR,FACT_DOWN,FACT_UP,TIME_DOWN,TIME_UP}) ->
			SIDE=case SIDE_LETTER of
				<<27,4>> ->
					1;
				_ ->
					2
			end,
			Request3_D=[
				{table,"DOZING_COKE"},
				{conditions,
					[
						{"INDX",eq,INDX},
						{"CYCLE",eq,CYCLE},
						{"SKIP",eq,SKIP},
						{"SIDE",eq,SIDE}
					]
				}
			],
			scada_db:delete_data(Request3_D),
			Request3=[
				{table,"DOZING_COKE"},
				{fields,[{"INDX",INDX},{"CYCLE",CYCLE},{"SKIP",SKIP},{"SIDE",SIDE},{"HUMIDITY",HUMIDITY},{"REF_TECH",REF_TECH},{"REF_CORR",REF_CORR},{"FACT_DOWN",FACT_DOWN},{"FACT_UP",FACT_UP},{"TIME_DOWN",TIME_DOWN},{"TIME_UP",TIME_UP}]}
			],
			scada_db:insert_data(Request3)
		end,
		Rows
	),
	Request4=
	[
		{table,"DOZING"},
		{fields,
			[
				"INDX"
			]
		},
		{orders,[{"INDX",desc}]},
		{limit,1}
	],
	LastTimestamp2=case scada_db:get_data(Request4) of
		[[LT2]] ->
			LT2;
		_ ->
			{{2013,1,1},{0,0,0}}
	end,
	Request5=lists:flatten(
		io_lib:format(
			"SELECT UnloadTime,BatchNumber,CyclePos,OL4,OL3,OL2,OL1,DL4,DL3,DL2,DL1,AML,AL,KML,KL,KR,KMR,AR,AMR,DR1,DR2,DR3,DR4,OR1,OR2,OR3,OR4 FROM [~s].[dbo].[UA#Dosing] WHERE UnloadTime>=\'~s\';",
			[DBName,format_datetime(LastTimestamp2)]
		)
	),
	{selected,_ColNames2,Rows2}=odbc:sql_query(OdbcRef,Request5),
	lists:foreach(
		fun({INDX,CYCLE,SKIP,LO4,LO3,LO2,LO1,LD4,LD3,LD2,LD1,LAM,LA,LKM,LK,RK,RKM,RA,RAM,RD1,RD2,RD3,RD4,RO1,RO2,RO3,RO4}) ->
			Request6_D=[
				{table,"DOZING"},
				{conditions,
					[
						{"INDX",eq,INDX},
						{"CYCLE",eq,CYCLE},
						{"SKIP",eq,SKIP}
					]
				}
			],
			scada_db:delete_data(Request6_D),
			Request6=[
				{table,"DOZING"},
				{fields,[{"INDX",INDX},{"CYCLE",CYCLE},{"SKIP",SKIP},{"LO4",LO4},{"LO3",LO3},{"LO2",LO2},{"LO1",LO1},{"LD4",LD4},{"LD3",LD3},{"LD2",LD2},{"LD1",LD1},{"LAM",LAM},{"LA",LA},{"LKM",LKM},{"LK",LK},{"RK",RK},{"RKM",RKM},{"RA",RA},{"RAM",RAM},{"RD1",RD1},{"RD2",RD2},{"RD3",RD3},{"RD4",RD4},{"RO1",RO1},{"RO2",RO2},{"RO3",RO3},{"RO4",RO4}]}
			],
			scada_db:insert_data(Request6)
		end,
		Rows2
	),
	% odbc:stop(),
	NewArg=ArgIn,
	NewArg.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Sys,Arg) -> Arg
%% @doc <i>Обновление данных, добавление новых данных</i>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
update_data2(_Sys,Arg) ->
	ArgIn=case Arg of
		undefined ->
			?log_sys(io_lib:format("~p:update_data2 initial start.~n",[?MODULE])),
			gb_trees:empty();
		_ ->
			Arg
	end,
	Request1=
	[
		{table,"taps"},
		{fields,
			[
				"NUM"
			]
		},
		{orders,[{"NUM",desc}]},
		{limit,1}
	],
	LastNum=case scada_db:get_data(Request1) of
		[[LN1]] ->
			LN1;
		_ ->
			1
	end,
	Files1=filelib:wildcard(lists:flatten([?FilePrefix,"??????.dp4*"])),
	{Data1,_}=lists:foldl(
		fun(File,{AccIn,LastTapNum}) ->
			Basename=filename:basename(File),
			% io:format("~ts~n",[Basename]),
			{TapNum,[]}=case string:tokens(Basename,".") of
				[TapNumStr,_,_] ->
					string:to_integer(TapNumStr);
				[TapNumStr,_] ->
					string:to_integer(TapNumStr)
			end,
			% io:format("~w, ~w~n",[TapNum,LastNum]),
			case ((TapNum>=(LastNum-12)) and (TapNum/=LastTapNum)) of
				true ->
					{ok,FileBin}=file:read_file(File),
					FileStr=binary_to_list(FileBin),
					FileStr2=string:substr(FileStr,1,length(FileStr)-1),
					[NumStr,DTBeginEndStr,TBeginStr,TEndStr,_NumberScoopStr,SiStr,MnStr,CrStr,PStr,SStr,_CStr,SiO2Str,CaOStr,MnOStr,FeOStr,Al2O3Str,MrOStr,CaSStr,SumSlagStr,BaseSlagStr]=string:tokens(FileStr2," "),
					{Num,[]}=string:to_integer(NumStr),
					[DayStr,MonthStr,YearStr]=string:tokens(DTBeginEndStr,"."),
					[HourBeginStr,MinuteBeginStr]=string:tokens(TBeginStr,"."),
					[HourEndStr,MinuteEndStr]=string:tokens(TEndStr,"."),
					{Day,[]}=string:to_integer(DayStr),
					{Month,[]}=string:to_integer(MonthStr),
					{Year,[]}=string:to_integer(YearStr),
					{HourBegin,[]}=string:to_integer(HourBeginStr),
					{MinuteBegin,[]}=string:to_integer(MinuteBeginStr),
					{HourEnd,[]}=string:to_integer(HourEndStr),
					{MinuteEnd,[]}=string:to_integer(MinuteEndStr),
					DTBegin=check_dt(Year,Month,Day,HourBegin,MinuteBegin),
					DTEnd=check_dt(Year,Month,Day,HourEnd,MinuteEnd),
					{Si,[]}=string:to_float(SiStr),
					{Mn,[]}=string:to_float(MnStr),
					{Cr,[]}=string:to_float(CrStr),
					{P,[]}=string:to_float(PStr),
					{S,[]}=string:to_float(SStr),
					{SiO2,[]}=string:to_float(SiO2Str),
					{CaO,[]}=string:to_float(CaOStr),
					{MrO,[]}=string:to_float(MrOStr),
					{FeO,[]}=string:to_float(FeOStr),
					{Al2O3,[]}=string:to_float(Al2O3Str),
					{MnO,[]}=string:to_float(MnOStr),
					{CaS,[]}=string:to_float(CaSStr),
					{SumSlag,[]}=string:to_float(SumSlagStr),
					{BaseSlag,[]}=string:to_float(BaseSlagStr),
					{gb_trees:enter(Num,gb_trees:enter(data1,{DTBegin,DTEnd,Si,Mn,Cr,P,S,SiO2,CaO,MrO,FeO,Al2O3,MnO,CaS,SumSlag,BaseSlag},gb_trees:empty()),AccIn),TapNum};
				false ->
					{AccIn,LastTapNum}
			end
		end,
		{gb_trees:empty(),-1},
		Files1
	),
	Files2=filelib:wildcard(lists:flatten([?FilePrefix,"??????.dd4*"])),
	{Data2,_}=lists:foldl(
		fun(File,{AccIn,LastTapNum}) ->
			Basename=filename:basename(File),
			% io:format("~ts~n",[Basename]),
			{TapNum,[]}=case string:tokens(Basename,".") of
				[TapNumStr,_,_] ->
					string:to_integer(TapNumStr);
				[TapNumStr,_] ->
					string:to_integer(TapNumStr)
			end,
			% io:format("~w, ~w~n",[TapNum,LastNum]),
			case ((TapNum>=(LastNum-12)) and (TapNum/=LastTapNum)) of
				true ->
					{ok,FileBin}=file:read_file(File),
					FileStr=binary_to_list(FileBin),
					FileStr2=string:substr(FileStr,1,length(FileStr)-1),
					[_,NumStr,DTBeginEndStr,TGraphicStr,_TBeginStr,_TEndStr]=string:tokens(FileStr2," "),
					{Num,[]}=string:to_integer(NumStr),
					[DayStr,MonthStr,YearStr]=string:tokens(DTBeginEndStr,"."),
					[HourGraphicStr,MinuteGraphicStr]=string:tokens(TGraphicStr,"."),
					{Day,[]}=string:to_integer(DayStr),
					{Month,[]}=string:to_integer(MonthStr),
					{Year,[]}=string:to_integer(YearStr),
					{HourGraphic,[]}=string:to_integer(HourGraphicStr),
					{MinuteGraphic,[]}=string:to_integer(MinuteGraphicStr),
					DTGraphic=check_dt(Year,Month,Day,HourGraphic,MinuteGraphic),
					TD=case gb_trees:lookup(Num,AccIn) of
						{value,TapNumData} ->
							TapNumData;
						none ->
							gb_trees:empty()
					end,
					NewTD=gb_trees:enter(data2,{DTGraphic},TD),
					{gb_trees:enter(Num,NewTD,AccIn),TapNum};
				false ->
					{AccIn,LastTapNum}
			end
		end,
		{Data1,-1},
		Files2
	),
	CheckFun=fun("00") -> ""; (Str) -> Str end,
	Files4=filelib:wildcard(lists:flatten([?FilePrefix,"??????.vm4*"])),
	{Data4,_}=lists:foldl(
		fun(File,{AccIn,LastTapNum}) ->
			Basename=filename:basename(File),
			% io:format("~ts~n",[Basename]),
			{TapNum,[]}=case string:tokens(Basename,".") of
				[TapNumStr,_,_] ->
					string:to_integer(TapNumStr);
				[TapNumStr,_] ->
					string:to_integer(TapNumStr)
			end,
			% io:format("~w, ~w~n",[TapNum,LastNum]),
			case ((TapNum>=(LastNum-12)) and (TapNum/=LastTapNum)) of
				true ->
					{ok,FileBin}=file:read_file(File),
					FileStr=binary_to_list(FileBin),
					FileStr2=string:substr(FileStr,1,length(FileStr)-1),
					FileStr3=re:replace(FileStr2,"    "," 00 ",[global,{return,list},bsr_unicode]),
					[NumStr,_DTBeginEndStr,_TBeginStr,W1_1Str,W1_2Str,W1_3Str,W1_4Str,W1_5Str,W1_6Str,W1_7Str,W2_1Str,W2_2Str,W2_3Str,W2_4Str,W2_5Str,W2_6Str,W2_7Str,W3_1Str,W3_2Str,W3_3Str,W3_4Str,W3_5Str,W3_6Str,W3_7Str,W4_1Str,W4_2Str,W4_3Str,W4_4Str,W4_5Str,W4_6Str,W4_7Str,W5_1Str,W5_2Str,W5_3Str,W5_4Str,W5_5Str,W5_6Str,W5_7Str,W6_1Str,W6_2Str,W6_3Str,W6_4Str,W6_5Str,W6_6Str,W6_7Str,W7_1Str,W7_2Str,W7_3Str,W7_4Str,W7_5Str,W7_6Str,W7_7Str,W8_1Str,W8_2Str,W8_3Str,W8_4Str,W8_5Str,W8_6Str,W8_7Str,W9_1Str,W9_2Str,W9_3Str,W9_4Str,W9_5Str,W9_6Str,W9_7Str,W10_1Str,W10_2Str,W10_3Str,W10_4Str,W10_5Str,W10_6Str,W10_7Str]=string:tokens(FileStr3," "),
					{Num,[]}=string:to_integer(NumStr),
					{W1_1,[]}=string:to_integer(W1_1Str),
					{W1_2,[]}=string:to_float(W1_2Str),
					{W1_3,[]}=string:to_float(W1_3Str),
					{W1_4,[]}=string:to_float(W1_4Str),
					{W1_5,[]}=string:to_float(W1_5Str),
					{W1_6,[]}=string:to_float(W1_6Str),
					W1_7=CheckFun(W1_7Str),
					{W2_1,[]}=string:to_integer(W2_1Str),
					{W2_2,[]}=string:to_float(W2_2Str),
					{W2_3,[]}=string:to_float(W2_3Str),
					{W2_4,[]}=string:to_float(W2_4Str),
					{W2_5,[]}=string:to_float(W2_5Str),
					{W2_6,[]}=string:to_float(W2_6Str),
					W2_7=CheckFun(W2_7Str),
					{W3_1,[]}=string:to_integer(W3_1Str),
					{W3_2,[]}=string:to_float(W3_2Str),
					{W3_3,[]}=string:to_float(W3_3Str),
					{W3_4,[]}=string:to_float(W3_4Str),
					{W3_5,[]}=string:to_float(W3_5Str),
					{W3_6,[]}=string:to_float(W3_6Str),
					W3_7=CheckFun(W3_7Str),
					{W4_1,[]}=string:to_integer(W4_1Str),
					{W4_2,[]}=string:to_float(W4_2Str),
					{W4_3,[]}=string:to_float(W4_3Str),
					{W4_4,[]}=string:to_float(W4_4Str),
					{W4_5,[]}=string:to_float(W4_5Str),
					{W4_6,[]}=string:to_float(W4_6Str),
					W4_7=CheckFun(W4_7Str),
					{W5_1,[]}=string:to_integer(W5_1Str),
					{W5_2,[]}=string:to_float(W5_2Str),
					{W5_3,[]}=string:to_float(W5_3Str),
					{W5_4,[]}=string:to_float(W5_4Str),
					{W5_5,[]}=string:to_float(W5_5Str),
					{W5_6,[]}=string:to_float(W5_6Str),
					W5_7=CheckFun(W5_7Str),
					{W6_1,[]}=string:to_integer(W6_1Str),
					{W6_2,[]}=string:to_float(W6_2Str),
					{W6_3,[]}=string:to_float(W6_3Str),
					{W6_4,[]}=string:to_float(W6_4Str),
					{W6_5,[]}=string:to_float(W6_5Str),
					{W6_6,[]}=string:to_float(W6_6Str),
					W6_7=CheckFun(W6_7Str),
					{W7_1,[]}=string:to_integer(W7_1Str),
					{W7_2,[]}=string:to_float(W7_2Str),
					{W7_3,[]}=string:to_float(W7_3Str),
					{W7_4,[]}=string:to_float(W7_4Str),
					{W7_5,[]}=string:to_float(W7_5Str),
					{W7_6,[]}=string:to_float(W7_6Str),
					W7_7=CheckFun(W7_7Str),
					{W8_1,[]}=string:to_integer(W8_1Str),
					{W8_2,[]}=string:to_float(W8_2Str),
					{W8_3,[]}=string:to_float(W8_3Str),
					{W8_4,[]}=string:to_float(W8_4Str),
					{W8_5,[]}=string:to_float(W8_5Str),
					{W8_6,[]}=string:to_float(W8_6Str),
					W8_7=CheckFun(W8_7Str),
					{W9_1,[]}=string:to_integer(W9_1Str),
					{W9_2,[]}=string:to_float(W9_2Str),
					{W9_3,[]}=string:to_float(W9_3Str),
					{W9_4,[]}=string:to_float(W9_4Str),
					{W9_5,[]}=string:to_float(W9_5Str),
					{W9_6,[]}=string:to_float(W9_6Str),
					W9_7=CheckFun(W9_7Str),
					{W10_1,[]}=string:to_integer(W10_1Str),
					{W10_2,[]}=string:to_float(W10_2Str),
					{W10_3,[]}=string:to_float(W10_3Str),
					{W10_4,[]}=string:to_float(W10_4Str),
					{W10_5,[]}=string:to_float(W10_5Str),
					{W10_6,[]}=string:to_float(W10_6Str),
					W10_7=CheckFun(W10_7Str),
					TD=case gb_trees:lookup(Num,AccIn) of
						{value,TapNumData} ->
							TapNumData;
						none ->
							gb_trees:empty()
					end,
					NewTD=gb_trees:enter(data4,{W1_1,W1_2,W1_3,W1_4,W1_5,W1_6,W1_7,W2_1,W2_2,W2_3,W2_4,W2_5,W2_6,W2_7,W3_1,W3_2,W3_3,W3_4,W3_5,W3_6,W3_7,W4_1,W4_2,W4_3,W4_4,W4_5,W4_6,W4_7,W5_1,W5_2,W5_3,W5_4,W5_5,W5_6,W5_7,W6_1,W6_2,W6_3,W6_4,W6_5,W6_6,W6_7,W7_1,W7_2,W7_3,W7_4,W7_5,W7_6,W7_7,W8_1,W8_2,W8_3,W8_4,W8_5,W8_6,W8_7,W9_1,W9_2,W9_3,W9_4,W9_5,W9_6,W9_7,W10_1,W10_2,W10_3,W10_4,W10_5,W10_6,W10_7},TD),
					{gb_trees:enter(Num,NewTD,AccIn),TapNum};
				false ->
					{AccIn,LastTapNum}
			end

		end,
		{Data2,-1},
		Files4
	),
	lists:foreach(
		fun({Num,DT}) ->
			{DTBegin,DTEnd,Si,Mn,Cr,P,S,SiO2,CaO,MrO,FeO,Al2O3,MnO,CaS,SumSlag,BaseSlag}=case gb_trees:lookup(data1,DT) of
				{value,DT1} ->
					DT1;
				none ->
					{scada_share:system_datetime(),{{0,0,0},{0,0,0}},0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0}
			end,
			{DTGraphic}=case gb_trees:lookup(data2,DT) of
				{value,DT2} ->
					DT2;
				none ->
					{{{0,0,0},{0,0,0}}}
			end,
			{NTap,ScoopCount,CalcMass,Temp,SlagScoopCount}=case gb_trees:lookup(data3,DT) of
				{value,DT3} ->
					DT3;
				none ->
					{0,0.0,0.0,0,0.0}
			end,
			{W1_1,W1_2,W1_3,W1_4,W1_5,W1_6,W1_7,W2_1,W2_2,W2_3,W2_4,W2_5,W2_6,W2_7,W3_1,W3_2,W3_3,W3_4,W3_5,W3_6,W3_7,W4_1,W4_2,W4_3,W4_4,W4_5,W4_6,W4_7,W5_1,W5_2,W5_3,W5_4,W5_5,W5_6,W5_7,W6_1,W6_2,W6_3,W6_4,W6_5,W6_6,W6_7,W7_1,W7_2,W7_3,W7_4,W7_5,W7_6,W7_7,W8_1,W8_2,W8_3,W8_4,W8_5,W8_6,W8_7,W9_1,W9_2,W9_3,W9_4,W9_5,W9_6,W9_7,W10_1,W10_2,W10_3,W10_4,W10_5,W10_6,W10_7}=case gb_trees:lookup(data4,DT) of
				{value,DT4} ->
					DT4;
				none ->
					{0.0,0.0,0.0,0.0,0.0,0.0,"",0.0,0.0,0.0,0.0,0.0,0.0,"",0.0,0.0,0.0,0.0,0.0,0.0,"",0.0,0.0,0.0,0.0,0.0,0.0,"",0.0,0.0,0.0,0.0,0.0,0.0,"",0.0,0.0,0.0,0.0,0.0,0.0,"",0.0,0.0,0.0,0.0,0.0,0.0,"",0.0,0.0,0.0,0.0,0.0,0.0,"",0.0,0.0,0.0,0.0,0.0,0.0,"",0.0,0.0,0.0,0.0,0.0,0.0,""}
			end,
			% io:format("Num=~w~n",[Num]),
			RequestDelete=[
				{table,"taps"},
				{conditions,
					[
						{"NUM",eq,Num}
					]
				}
			],
			scada_db:delete_data(RequestDelete),
			RequestInsert=[
				{table,"taps"},
				{fields,
					[
						{"NUM",Num},
						{"DTGRAPHIC",DTGraphic},
						{"DTBEGIN",DTBegin},
						{"DTEND",DTEnd},
						{"NTAP",NTap},
						{"SCOOPCOUNT",ScoopCount},
						{"SLAGSCOOPCOUNT",SlagScoopCount},
						{"CALCMASS",CalcMass},
						{"TEMP",Temp},
						{"SI",Si},
						{"MN",Mn},
						{"CR",Cr},
						{"P",P},
						{"S",S},
						{"SIO2",SiO2},
						{"CAO",CaO},
						{"MRO",MrO},
						{"FEO",FeO},
						{"AL2O3",Al2O3},
						{"MNO",MnO},
						{"CAS",CaS},
						{"SUMSLAG",SumSlag},
						{"BASESLAG",BaseSlag},
						{"W1_1",W1_1},
						{"W1_2",W1_2},
						{"W1_3",W1_3},
						{"W1_4",W1_4},
						{"W1_5",W1_5},
						{"W1_6",W1_6},
						{"W1_7",W1_7},
						{"W2_1",W2_1},
						{"W2_2",W2_2},
						{"W2_3",W2_3},
						{"W2_4",W2_4},
						{"W2_5",W2_5},
						{"W2_6",W2_6},
						{"W2_7",W2_7},
						{"W3_1",W3_1},
						{"W3_2",W3_2},
						{"W3_3",W3_3},
						{"W3_4",W3_4},
						{"W3_5",W3_5},
						{"W3_6",W3_6},
						{"W3_7",W3_7},
						{"W4_1",W4_1},
						{"W4_2",W4_2},
						{"W4_3",W4_3},
						{"W4_4",W4_4},
						{"W4_5",W4_5},
						{"W4_6",W4_6},
						{"W4_7",W4_7},
						{"W5_1",W5_1},
						{"W5_2",W5_2},
						{"W5_3",W5_3},
						{"W5_4",W5_4},
						{"W5_5",W5_5},
						{"W5_6",W5_6},
						{"W5_7",W5_7},
						{"W6_1",W6_1},
						{"W6_2",W6_2},
						{"W6_3",W6_3},
						{"W6_4",W6_4},
						{"W6_5",W6_5},
						{"W6_6",W6_6},
						{"W6_7",W6_7},
						{"W7_1",W7_1},
						{"W7_2",W7_2},
						{"W7_3",W7_3},
						{"W7_4",W7_4},
						{"W7_5",W7_5},
						{"W7_6",W7_6},
						{"W7_7",W7_7},
						{"W8_1",W8_1},
						{"W8_2",W8_2},
						{"W8_3",W8_3},
						{"W8_4",W8_4},
						{"W8_5",W8_5},
						{"W8_6",W8_6},
						{"W8_7",W8_7},
						{"W9_1",W9_1},
						{"W9_2",W9_2},
						{"W9_3",W9_3},
						{"W9_4",W9_4},
						{"W9_5",W9_5},
						{"W9_6",W9_6},
						{"W9_7",W9_7},
						{"W10_1",W10_1},
						{"W10_2",W10_2},
						{"W10_3",W10_3},
						{"W10_4",W10_4},
						{"W10_5",W10_5},
						{"W10_6",W10_6},
						{"W10_7",W10_7}
					]
				}
			],
			scada_db:insert_data(RequestInsert)
		end,
		gb_trees:to_list(Data4)
	),
	NewArg=ArgIn,
	NewArg.

%%%%%%%%%%%%%%%%%%%%%%%
%%% private функции %%%
%%%%%%%%%%%%%%%%%%%%%%%

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
	lists:flatten(io_lib:format("~4..0w-~2..0w-~2..0w ~2..0w:~2..0w:~2..0w",[Year,Month,Day,Hour,Minute,Second]));
format_datetime({{Year,Month,Day},{Hour,Minute,Second},Millisecond}) ->
	lists:flatten(io_lib:format("~4..0w-~2..0w-~2..0w ~2..0w:~2..0w:~2..0w.~6..0w",[Year,Month,Day,Hour,Minute,Second,Millisecond])).

check_dt(Year,Month,Day,Hour,Minute) ->
	ts_add(ts(Year,Month,Day,0,0,0),Hour*3600+Minute*60).

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