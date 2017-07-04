%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @author Владимир Щербина <vns.scherbina@gmail.com>
%% @copyright 2017
%% @version 1.1.0
%% @doc Модуль <b>{@module}</b> реализует быстрый файловый ввод-вывод.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
-module(fastio).

-export(
	[
		f/4
	]
).

%%%%%%%%%%%%%%%%%%%%%%
%%% public функции %%%
%%%%%%%%%%%%%%%%%%%%%%

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Name::string, Len::integer, Fun::fun, Acc::term) -> term
%% @doc <i>Итератор для чтения файла</i>
%% <p>
%% <b>Name</b> - имя файла;<br/>
%% <b>Len</b> - длина буфера для поиска символов конца строки;<br/>
%% <b>Fun</b> - функция вида Fun(LineCount,Line,Acc) для обработки строк файла;<br/>
%% <b>Acc</b> - начальное значение аккумулятора передаваемого в вызов функции Fun.
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
f(Name, Len, Fun, Acc) ->
	case file:open(Name, [ read, raw, binary, read_ahead ]) of
		{ok, Fl} ->
			Result=loop(file_reader(Fl, Len), 1, Fun, Acc),
			file:close(Fl),
			{ok,Result};
		Error ->
			Error
	end.

%%%%%%%%%%%%%%%%%%%%%%%
%%% private функции %%%
%%%%%%%%%%%%%%%%%%%%%%%
loop(eof, _LineCount, _Fun, Acc) ->
	Acc;
loop(Hnd, LineCount, Fun, Acc) ->
	{Hnd_2, Line} = get_line(Hnd),
	NewAcc=Fun(LineCount,Line,Acc),
	loop(Hnd_2,LineCount+1,Fun,NewAcc).

find_8(Buffer, Char, Pos) ->
	case Buffer of
		<< _:Pos/bytes, Char:8, _/bytes >> -> Pos; 
		<< _:Pos/bytes, _:1/bytes, Char:8, _/bytes >> -> Pos + 1;
		<< _:Pos/bytes, _:2/bytes, Char:8, _/bytes >> -> Pos + 2;
		<< _:Pos/bytes, _:3/bytes, Char:8, _/bytes >> -> Pos + 3;
		<< _:Pos/bytes, _:4/bytes, Char:8, _/bytes >> -> Pos + 4;
		<< _:Pos/bytes, _:5/bytes, Char:8, _/bytes >> -> Pos + 5;
		<< _:Pos/bytes, _:6/bytes, Char:8, _/bytes >> -> Pos + 6;
		<< _:Pos/bytes, _:7/bytes, Char:8, _/bytes >> -> Pos + 7;
		<< _:Pos/bytes, _:8/bytes, Char:8, _/bytes >> -> Pos + 8;
		<< _:Pos/bytes, _:9/bytes, Char:8, _/bytes >> -> Pos + 9;
		<< _:Pos/bytes, _:10/bytes, Char:8, _/bytes >> -> Pos + 10;
		<< _:Pos/bytes, _:11/bytes, Char:8, _/bytes >> -> Pos + 11;
		<< _:Pos/bytes, _:12/bytes, Char:8, _/bytes >> -> Pos + 12;
		<< _:Pos/bytes, _:13/bytes, Char:8, _/bytes >> -> Pos + 13;
		<< _:Pos/bytes, _:14/bytes, Char:8, _/bytes >> -> Pos + 14;
		<< _:Pos/bytes, _:15/bytes, Char:8, _/bytes >> -> Pos + 15;
		<< _:Pos/bytes, _:16/bytes, Char:8, _/bytes >> -> Pos + 16;
		<< _:Pos/bytes, _:17/bytes, Char:8, _/bytes >> -> Pos + 17;
		<< _:Pos/bytes, _:18/bytes, Char:8, _/bytes >> -> Pos + 18;
		<< _:Pos/bytes, _:19/bytes, Char:8, _/bytes >> -> Pos + 19;
		<< _:Pos/bytes, _:20/bytes, Char:8, _/bytes >> -> Pos + 20;
		<< _:Pos/bytes, _:21/bytes, Char:8, _/bytes >> -> Pos + 21;
		<< _:Pos/bytes, _:22/bytes, Char:8, _/bytes >> -> Pos + 22;
		<< _:Pos/bytes, _:23/bytes, Char:8, _/bytes >> -> Pos + 23;
		<< _:Pos/bytes, _:24/bytes, Char:8, _/bytes >> -> Pos + 24;
		<< _:Pos/bytes, _:25/bytes, Char:8, _/bytes >> -> Pos + 25;
		<< _:Pos/bytes, _:26/bytes, Char:8, _/bytes >> -> Pos + 26;
		<< _:Pos/bytes, _:27/bytes, Char:8, _/bytes >> -> Pos + 27;
		<< _:Pos/bytes, _:28/bytes, Char:8, _/bytes >> -> Pos + 28;
		<< _:Pos/bytes, _:29/bytes, Char:8, _/bytes >> -> Pos + 29;
		<< _:Pos/bytes, _:30/bytes, Char:8, _/bytes >> -> Pos + 30;
		<< _:Pos/bytes, _:31/bytes, Char:8, _/bytes >> -> Pos + 31;
		<< _:Pos/bytes, _:32/bytes, _/bytes >> -> find_8(Buffer, Char, Pos + 32);
		_ -> not_found
	end.

%% split_char(binary(), byte()) -> {binary(), binary()} | not_found
split_char(Buffer, Char) ->
	case find_8(Buffer, Char, 0) of
		not_found -> not_found;
		Pos ->
			<< Before:Pos/bytes, _:8, After/bytes >> = Buffer,
			{Before, After}
	end.

%% file_reader(File, Len) -> Handle
%% Handle = {NextF, binary()} | eof
%% NextF = fun() -> Handle
file_reader(File, Len) ->	file_reader(File, Len, << >>).
file_reader(File, LenI, BufferB) ->
	NextF = fun() ->
		case file:read(File, LenI) of
			{ok, DataB} -> file_reader(File, LenI, DataB);
			eof -> eof
		end
	end,
	{NextF, BufferB}.

get_line({NextF, BufferB}) ->
	case split_char(BufferB, 10) of
		{LineB, RestB} -> {{NextF, RestB}, LineB};
		not_found ->
			case NextF() of
				eof -> {eof, BufferB};
				Handl_1 ->
					{Handl_2, LineB} = get_line(Handl_1),
					{Handl_2, << BufferB/bytes, LineB/bytes >>}
			end
	end.