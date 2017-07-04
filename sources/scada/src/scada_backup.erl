%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @author Владимир Щербина <vns.scherbina@gmail.com>
%% @copyright 2017
%% @version 1.1.0
%% @doc Модуль <b>{@module}</b> реализует функции архивирования и восстановления таблиц баз данных.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
-module(scada_backup).

-export(
	[
		backup/2,
		restore/2,
		get_archive_path/0
	]
).

-compile(export_all).

%%%%%%%%%%%%%%%%%%%%%%
%%% public функции %%%
%%%%%%%%%%%%%%%%%%%%%%
		
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Request,Filename::String) -> ok
%% @doc <i>Архивация таблицы баз данных</i>
%% <p>
%% <b>Request</b> - запрос для модуля <i>scada_db</i> на извлечение данных;<br/>
%% <b>Filename</b> - имя файла для сохранения данных из таблицы.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
backup(Request,Filename) ->
	FilenameWithExtension=lists:flatten([Filename,".csv"]),
	Fields=proplists:get_value(fields,Request,[]),
	Data=scada_db:get_data(Request),
	filelib:ensure_dir(FilenameWithExtension),
	{ok,Handle}=file:open(FilenameWithExtension,[write,raw,binary,{delayed_write, 16#fffff, 5000}]),
	FieldsHeader=string:join(Fields,";"),
	file:write(Handle,FieldsHeader),
	lists:foreach(
		fun(Row) ->
			RowData=lists:map(
				fun(Field) ->
					field_to_string(Field)
				end,
				Row
			),
			file:write(Handle,["\n"|string:join(RowData,";")])
		end,
		Data
	),
	file:close(Handle),
	FilenameWithoutExtension=filename:basename(FilenameWithExtension,".csv"),
	DirName=filename:dirname(FilenameWithExtension),
	ZIPFilename=lists:flatten(
		[
			DirName,
			"/",
			FilenameWithoutExtension,
			".zip"
		]
	),
	FileList=[
		lists:flatten(
			[
				FilenameWithoutExtension,
				".csv"
			]
		)
	],
	zip:zip(ZIPFilename,FileList,[{cwd,DirName}]),
	file:delete(FilenameWithExtension).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (ZIPFilename::String,TableName::String) -> ok
%% @doc <i>Восстановление данных для таблицы баз данных</i>
%% <p>
%% <b>ZIPFilename</b> - имя ZIP-файла с архивными данными;<br/>
%% <b>TableName</b> - имя таблицы баз данных.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
restore(ZIPFilename,TableName) ->
	FilenameWithoutExtension=filename:basename(ZIPFilename,".zip"),
	Filename=lists:flatten(
		[
		get_archive_path(),
		"/",
		FilenameWithoutExtension,
		".csv"
		]
	),
	filelib:ensure_dir(ZIPFilename),
	FileList=[
		lists:flatten(
			[
				FilenameWithoutExtension,
				".csv"
			]
		)
	],
	zip:unzip(ZIPFilename,[{cwd,get_archive_path()},{file_list,FileList}]),
	case file:read_file(Filename) of
		{ok,FileBin} ->
			Lines=tokens(unicode:characters_to_list(FileBin),10),
			case length(Lines)>0 of
				true ->
					[FirstLine|DataLines]=Lines,
					FieldsNames=tokens(FirstLine,$;),
					lists:foreach(
						fun(Line) ->
							case TableName=="DP4_WS1_jvm_memory_0" of
								true ->
									io:format("~p~n",[Line]);
								false ->
									do_nothing
							end,
							FieldsValues=tokens(Line,$;),
							Fields=lists:zip(FieldsNames,[unicode:characters_to_binary(Value) || Value <- FieldsValues]),
							Request=[
								{table,TableName},
								{fields,Fields}
							],
							scada_db:insert_data(Request,[{format,raw}])
						end,
						DataLines
					);
				false ->
					do_nothing
			end;
		_ ->
			do_nothing
	end,
	file:delete(Filename).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec () -> String
%% @doc <i>Получение пути к каталогу с архивом</i>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
get_archive_path() ->
	scada:get_app_env(archive_path, code:lib_dir(scada)++"/priv/archive").

%%%%%%%%%%%%%%%%%%%%%%%
%%% private функции %%%
%%%%%%%%%%%%%%%%%%%%%%%

field_to_string({{Year,Month,Day},{Hour,Minute,Second}}) ->
	lists:flatten(io_lib:format("\"~4..0w-~2..0w-~2..0w ~2..0w:~2..0w:~2..0w\"",[Year,Month,Day,Hour,Minute,Second]));
field_to_string({{Year,Month,Day},{Hour,Minute,Second},Millisecond}) ->
	lists:flatten(io_lib:format("\"~4..0w-~2..0w-~2..0w ~2..0w:~2..0w:~2..0w.~6..0w\"",[Year,Month,Day,Hour,Minute,Second,Millisecond]));
field_to_string(Field) when is_list(Field) ->
	lists:flatten(["\"",Field,"\""]);
field_to_string(Field) when is_binary(Field) ->
	lists:flatten(["\"",binary_to_list(Field),"\""]);
field_to_string(Field) ->
	lists:flatten(io_lib:format("~p",[Field])).


tokens(String,Separator) -> 
	tokens (String,[],[],0,Separator).

tokens([],Tokens,Buffer,_,_Separator) ->
	case Buffer of
		[] ->
			lists:reverse(Tokens);
		_ ->
			lists:reverse([lists:reverse(Buffer)|Tokens])
	end;
tokens([Separator|String],Tokens,[],_,Separator) ->
	tokens(String,Tokens,[],0,Separator);
tokens([Separator|String],Tokens,Buffer,QuoteCount,Separator) ->
	case (QuoteCount rem 2)==0 of
		true ->
			tokens(String,[lists:reverse(Buffer)|Tokens],[],0,Separator);
		false ->
			tokens(String,Tokens,[Separator|Buffer],QuoteCount,Separator)
	end;
tokens([$"|String],Tokens,[],QuoteCount,Separator) ->
	tokens(String,Tokens,[$"],QuoteCount+1,Separator);
tokens([$"|String],Tokens,[$"|_]=Buffer,QuoteCount,Separator) ->
	tokens(String,Tokens,[$"|Buffer],QuoteCount+1,Separator);
tokens([$"|String],Tokens,Buffer,QuoteCount,Separator) ->
	tokens(String,Tokens,[$"|Buffer],QuoteCount+1,Separator);
tokens([Character|String],Tokens,Buffer,QuoteCount,Separator) ->
	tokens(String,Tokens,[Character|Buffer],QuoteCount,Separator).