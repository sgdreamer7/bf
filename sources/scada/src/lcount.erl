%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @doc Модуль <b>{@module}</b> реализует подсчет количества строк в текстах программ.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%% ``The contents of this file are subject to the Erlang Public License, 
%%% Version 1.1, (the "License"); you may not use this file except in 
%%% compliance with the License. You should have received a copy of the 
%%% Erlang Public License along with this software. If not, it can be 
%%% retrieved via the world wide web at http://www.erlang.org/. 
%%% 
%%% Software distributed under the License is distributed on an "AS IS" 
%%% basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See 
%%% the License for the specific language governing rights and limitations 
%%% under the License. 
%%% 
%%% The Initial Developer of the Original Code is Ericsson Utvecklings AB. 
%%% Portions created by Ericsson are Copyright 1999, Ericsson Utvecklings 
%%% AB. All Rights Reserved.'' 
%%% 
%%% ---------------------------------------------------------- 
%%% File:            lcount.erl 
%%% Author:          Ulf Wiger     <[hidden email] 
%%% Description:     Counts lines in Erlang and C modules 
%%% 
%%% Modules used:    file, io, lists 
%%% 
%%% ---------------------------------------------------------- 
-module(lcount). 

-vsn("1.1"). 
-date('1997-01-14'). 
-author('Ulf Wiger'). 

-export([file/1, file/2, file/3, file/4, 
         files/1, files/2, files/3, files/4, 
         series/2, series/3]). 

-export([total_lines_per_block/0, 
         total_lines_per_block/3, 
         total_lines_per_block/4]). 


-record(stats, {code = 0, 
                comments = 0, 
                other = 0, 
                longest = {0, 0}, 
                mean = 0}). 

-define(TAB_LENGTH, 8). 

series(Fs, Option) -> series(Fs, Option, erl). 

series([Fs|T], Option, Type) -> 
    io:format("~n===== ~p:~n", [Fs]), 
    files(standard_io, Fs, Type, Option), 
    series(T, Option, Type); 
series([], _, _) -> 
    ok. 

total_lines_per_block() -> 
    total_lines_per_block(standard_io, "*CRA*","*CNA*"). 

total_lines_per_block(OutFile, SubSyst, Block) -> 
    total_lines_per_block(OutFile, "$NC1_TOP",SubSyst,Block). 

total_lines_per_block(OutFile, Dir, SubSyst, Block) -> 
    Fd = prepare_file(OutFile), 
    PathExpr = filename:join([Dir,SubSyst,Block]), 
    Dirs = sysFs:ls(PathExpr, [{sort,alpha}]), 
    _Res = process_dirs(Dirs, Fd), 
%    report_total(Fd, Res), 
    close_file(Fd). 

% report_total(Fd, [{Sub,Bname,Bid,E,C,J,T}|Rest]) -> 
%     do_report(Fd, Sub,Bname,Bid,E,C,J,T), 
%     report_total(Fd, Rest); 
% report_total(_, []) -> 
%     ok. 

do_report(Fd, Sub,Bname,Bid,E,C,J,T) -> 
    ok = io:format(Fd,"~s\t~s\t~s\t~s\t~s\t~s\t~s~n", 
                   [Sub,Bname,Bid, kilo(E),kilo(C),kilo(J),kilo(T)]). 

%% ugly hack to facilitate export into MS Excel which expects "Swedish" floats 
kilo(0) -> "0"; 
kilo(N) -> 
    S0 = integer_to_list(N), 
    Len = length(S0), 
    S = if Len < 3 -> lists:duplicate(3-Len, $0) ++ S0; 
           true -> S0 
        end, 
    [D3,D2,D1|T] = lists:reverse(S), 
    if T == [] -> 
            lists:reverse(T) ++ [$0,$,,D1,D2,D3]; 
       true -> 
            lists:reverse(T) ++ [$,,D1,D2,D3] 
    end. 


prepare_file(standard_io) -> standard_io; 
prepare_file(Fd) when is_pid(Fd) -> Fd; 
prepare_file(Fname) when is_list(Fname) -> 
    case file:open(Fname, [write]) of 
        {ok, Fd} -> 
            ok = io:format(Fd, 
                           "Subsystem\tBlock name\tBlock no\t" 
                           "Erlang KNCL\tC/C++ KNCL\tJava KNCL\tTotal KNCL~n", 
                           []), 
            Fd; 
        {error, Reason} -> 
            exit(Reason) 
    end. 

close_file(standard_io) -> ok; 
close_file(Fd) -> 
    file:close(Fd). 

process_dirs([D|Dirs], Fd) -> 
    case catch {subsyst(D), block(D)} of 
        {'EXIT',_} -> 
            process_dirs(Dirs, Fd); 
        {Sub, {Bname, Bid}} -> 
            io:format("Block: ~p~n", [D]), 
            Erl = sum_dir(ls(D,erl), erl, 0), 
            C = sum_dir(ls(D,c), c, 0), 
            Java = sum_dir(ls(D,java), java, 0), 
            do_report(Fd, Sub, Bname, Bid, Erl,C,Java, (Erl+C+Java)), 
            process_dirs(Dirs, Fd) 
    end; 
process_dirs([], _) -> 
    ok. 

sum_dir([F|Fs], Type, Acc) -> 
    case catch analyze_file(standard_io, F, Type, []) of 
        {'EXIT',_} -> 
            sum_dir(Fs, Type, Acc); 
        S -> 
            sum_dir(Fs, Type, S#stats.code + Acc) 
    end; 
sum_dir([], _, Acc) -> 
    Acc. 

subsyst(D) -> 
    case re:split(D, "_CRA") of 
        {ok, [SubS, _]} -> 
            SubS; 
        _ -> 
            D 
    end. 

%%%subsyst([$_,$C,$R,$A|_], Acc) -> 
%%%    lists:reverse(cut_to(Acc, $/)); 
%%%subsyst([H|T], Acc) -> 
%%%    subsyst(T, [H|Acc]). 

% cut_to([H|T], H) -> []; 
% cut_to([H|T], X) -> [H|cut_to(T, X)]. 

%%%block(D) -> block(D, []). 
block(D) -> 
    case re:split(D, "_CNA") of 
        {ok, [Block, Id]} -> 
            {Block, Id}; 
        _ -> 
            case re:split(D, "-") of 
                {ok, [App, Vsn]} -> 
                    {App, Vsn}; 
                _ -> 
                    {D, ""} 
            end 
    end. 

% block([$_,$C,$N,$A|T], Acc) -> 
%     {lists:reverse(cut_to(Acc, $/)), [$C,$N,$A|T]}; 
% block([H|T], Acc) -> 
%     block(T, [H|Acc]). 


%% 
%% User interface: Read file F and analyze 
%% 
file(F) -> 
    file(F, erl). 

file(F, Type) -> 
    file(standard_io, F, Type). 

file(RptFd, F, Type) -> 
    file(RptFd, F, Type, all). 

file(RptFd, F, Type, Option) -> 
    case catch analyze_file(RptFd, F, Type, Option) of 
        {'EXIT', Reason} -> 
            {error, Reason}; 
        Stats -> 
            report_stats(RptFd, F, Stats, Option) 
    end. 

files(Fs) -> 
    files(standard_io, Fs, erl, all). 

files(Fs, Type) -> files(standard_io, Fs, Type, all). 

files(RptFd, Fs, Type) -> 
    files(RptFd, Fs, Type, all). 

files(RptFd, [X|T], java, Option) when is_integer(X) -> 
    case ls([X|T], java) of 
        L when length(L) > 0 -> 
            analyze_files(RptFd, L, c, Option); 
        _ -> 
            {error, pattern} 
    end; 
files(RptFd, [X|T], Type, Option) when is_integer(X) -> 
    case ls([X|T], Type) of 
        L when length(L) > 0 -> 
            analyze_files(RptFd, L, Type, Option); 
        _ -> 
            {error, pattern} 
    end; 
files(RptFd, Files, Type, Option) when is_list(Files) -> 
    analyze_files(RptFd, Files, Type, Option). 


ls(Pat, erl) when is_list(Pat) -> 
    Res = os:cmd("find " ++ Pat ++ " -name '*.[he]rl' -follow -print"), 
    string:tokens(Res, "\n"); 
ls(Pat, c) when is_list(Pat) -> 
    Res = os:cmd("find " ++ Pat ++ 
                   " \\( \\( \\( -name '*.[hcx]' " 
                   "-o -name '*.cc' \\) -o -name '*.icc' \\) " 
                   "-o -name '*.hh' \\) -follow -print"), 
    string:tokens(Res, "\n"); 
ls(Pat, java) when is_list(Pat) -> 
    Res = os:cmd("find " ++ Pat ++ " -name '*.java' -follow -print"), 
    string:tokens(Res, "\n"); 
ls(Pat, _Type) when is_atom(Pat) -> 
    Res = os:cmd("ls -R " ++ atom_to_list(Pat)), 
    string:tokens(Res, "\n"). 

analyze_file(Fd, F, Type, Option) -> 
    case file:read_file(F) of 
        {ok, Bin} -> 
            String = binary_to_list(Bin), 
            Data = line_types(String, Type, 1, 0, []), 
            stats(Data, Option); 
        {error, Reason} -> 
            if Option == all -> 
                    io:format(Fd, "*** Error reading file ~p: ~p.~n", 
                              [F, Reason]); 
               true -> 
                    silent 
            end, 
            exit(Reason) 
    end. 

analyze_files(Fd, L, Type, Option) when is_list(L) -> 
    {Code, Cmts, Cnt} = 
        lists:foldl( 
          fun(F, {Code, Cmts, Cnt}) -> 
                  Res = (catch begin 
                                   S = analyze_file(Fd, F, Type, Option), 
                                   report_stats(Fd, F, S, Option), 
                                   {Code + S#stats.code, 
                                    Cmts + S#stats.comments, 
                                    Cnt + 1} 
                               end), 
                  case Res of 
                      {'EXIT', _} -> 
                          {Code, Cmts, Cnt}; 
                      Acc  -> 
                          Acc 
                  end 
          end, {0, 0, 0}, L), 
    if Option /= grand_summary -> 
            io:format(Fd, 
                      "~n******** Total: *********~n" 
                      "   Number of modules:~9w~n" 
                      "   Lines of code:    ~9w~n" 
                      "   Comments:         ~9w~n" 
                      "*************************~n", [Cnt, Code, Cmts]); 
       true -> 
            ok 
    end. 

%% 
%% Check lines and build a list [{Type, Line_number, Line_length}]: 
%%   - lines whose first non-white char is '%' are comments, 
%%   - lines with all whitespace are other, 
%%   - everything else is a line of code. 
%% 
%% Exception: blank lines within multiline comments (/* ... */) 
%% are counted as comment lines (it's a feature ;). 
%% 
line_types([$ |T], Type, Line, Chars, Acc) -> 
    line_types(T, Type, Line, Chars+1, Acc); 
line_types([9|T], Type, Line, Chars, Acc) -> 
    line_types(T, Type, Line, Chars+?TAB_LENGTH, Acc); 
line_types([10|T], Type, Line, Chars, Acc) -> 
    line_types(T, Type, Line+1, 0, [{other, Line, Chars}|Acc]); 
line_types([$%|T], erl, Line, Chars, Acc) -> 
    {Rest, Chars1} = skip_to_eol(T, Chars+1), 
    line_types(Rest, erl, Line+1, 0, [{comment, Line, Chars1}|Acc]); 
line_types([$/,$/|T], c, Line, Chars, Acc) -> 
    {Rest, Chars1} = skip_to_eol(T, Chars+2), 
    line_types(Rest, c, Line+1, 0, [{comment, Line, Chars1}|Acc]); 
line_types([$/,$*|T], c, Line, Chars, Acc) -> 
    {Rest, Line1, Chars1, Acc1} = skip_comment(T, Line, Chars+2, Acc), 
    line_types(Rest, c, Line1, Chars1, Acc1); 
line_types([_Other|T], Type, Line, Chars, Acc) -> 
    {Rest, Chars1} = skip_to_eol(T, Chars+1), 
    line_types(Rest, Type, Line+1, 0, [{code, Line, Chars1}|Acc]); 
line_types([], _Type, Line, Chars, Acc) -> 
    lists:reverse([{other, Line, Chars}|Acc]). 



skip_to_eol([10|Rest], Chars) -> 
    {Rest, Chars}; 
skip_to_eol([9|Rest], Chars) -> 
    skip_to_eol(Rest, Chars+?TAB_LENGTH); 
skip_to_eol([_|Rest], Chars) -> 
    skip_to_eol(Rest, Chars+1); 
skip_to_eol([], Chars) -> 
    {[], Chars}. 

skip_comment([$*,$/|T], Line, Chars, Acc) -> 
    {Rest, Chars1} = skip_to_eol(T, Chars+2), 
    {Rest, Line+1, 0, [{comment, Line, Chars1}|Acc]}; 
skip_comment([10|T], Line, Chars, Acc) -> 
    skip_comment(T, Line+1, 0, [{comment, Line, Chars}|Acc]); 
skip_comment([9|T], Line, Chars, Acc) -> 
    skip_comment(T, Line, Chars+?TAB_LENGTH, Acc); 
skip_comment([_Other|T], Line, Chars, Acc) -> 
    skip_comment(T, Line, Chars+1, Acc); 
skip_comment([], Line, Chars, Acc) -> 
    {[], Line, Chars, Acc}. 

%% 
%% Build statistics of list returned from line_types/4. 
%% 
stats(Data, Option) -> 
   stats(Data, #stats{}, 0, Option). 


stats([{code, L, Length}|T], S, Sum, Option) -> 
    Add = 1 + (Length-1) div 80,  % break line into X lines of =< 80 chars 
    stats(T, S#stats{code = S#stats.code+Add, 
                     longest = longest({Length, L}, S#stats.longest)}, 
          Sum + Length, Option); 
stats([{comment, L, Length}|T], S, Sum, Option) -> 
    stats(T, S#stats{comments = S#stats.comments+1, 
                     longest = longest({Length, L}, S#stats.longest)}, Sum, Option); 
stats([{other, _L, _Length}|T], S, Sum, Option) -> 
    stats(T, S#stats{other = S#stats.other+1}, Sum, Option); 
stats([], S, _Sum, _Option) when S#stats.code == 0 -> 
    S#stats{mean = "N/A"};  % to avoid divide-by-zero (UW 970522) 
stats([], S, Sum, _Option) -> 
    S#stats{mean = Sum / S#stats.code}. 

report_stats(_Fd, _F, _S, summary) -> ok; 
report_stats(_Fd, _F, _S, grand_summary) -> ok; 
report_stats(Fd, F, S, _Option) -> 
    {Lmax, Lline} = S#stats.longest, 
    Total = S#stats.code + S#stats.comments + S#stats.other, 
    io:format(Fd, "Stats for ~p:~n", [F]), 
    io:format(Fd, "  Lines of code:       ~5w.~n", [S#stats.code]), 
    io:format(Fd, "  Comments:            ~5w.~n", [S#stats.comments]), 
    io:format(Fd, "  Blank lines:         ~5w.~n", [S#stats.other]), 
    io:format(Fd, "  Total:               ~5w.~n", [Total]), 
    io:format(Fd, "  Longest line:        ~5w (line ~p).~n", 
              [Lmax, Lline]), 
    io:format(Fd, "  Average line length:  ~6.1f.~n", [S#stats.mean]). 

% report_grand_summary(Fd, S) -> 
%     io:format(Fd, "GRAND SUMMARY:~n", []), 
%     io:format(Fd, "  Lines of code:       ~5w.~n", [S#stats.code]), 
%     io:format(Fd, "  Comments:            ~5w.~n", [S#stats.comments]), 
%     io:format(Fd, "  Blank lines:         ~5w.~n", [S#stats.other]). 


longest({N, Ln}, {M, _Lm}) when N > M -> 
    {N, Ln}; 
longest({_N, _Ln}, {M, Lm}) -> 
    {M, Lm}. 

    

% match_files([F|T]) -> 
%     case f_match(lists:reverse(F)) of 
%         true -> 
%             [F|match_files(T)]; 
%         false -> 
%             match_files(T) 
%     end; 
% match_files([]) -> 
%     []. 

% f_match([$l,$r,$e,$.|_]) -> 
%     true; 
% f_match([$l,$r,$h,$.|_]) -> 
%     true; 
% f_match(_) -> 
%     false. 
