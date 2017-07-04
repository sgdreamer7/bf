%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @author Владимир Щербина <vns.scherbina@gmail.com>
%% @copyright 2017
%% @version 1.1.0
%% @doc Модуль <b>{@module}</b> реализует доступ к базам данных.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
-module(scada_db).

-export(
	[
		create_table/1,
		insert_data/1,
		insert_data/2,
		get_data/1,
		delete_data/1,
		update_data/1,
		update_data/2
	]
).

%%%%%%%%%%%%%%%%%%%%%%
%%% public функции %%%
%%%%%%%%%%%%%%%%%%%%%%

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Request) -> ok | {error,Reason}
%% @doc <i>Создание таблицы баз данных</i>
%% <p>
%% <b>Request</b> - Запрос на создание таблицы баз данных.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
create_table(Request) ->
	% scada_db_mysql:create_table(Request),
	scada_db_mssql:create_table(Request).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Request) -> ok | {error,Reason}
%% @doc <i>Добавление данных в базу</i>
%% <p>
%% <b>Request</b> - Запрос на добавление данных в базу.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
insert_data(Request) ->
	% scada_db_mysql:insert_data(Request),
	scada_db_mssql:insert_data(Request).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Request,Options::[{format,raw}] | [] ) -> ok | {error,Reason}
%% @doc <i>Добавление данных в базу с указанием опций обработки запроса</i>
%% <p>
%% <b>Request</b> - Запрос на добавление данных в базу;<br/>
%% <b>Options</b> - Список опций.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
insert_data(Request,Options) ->
	% scada_db_mysql:insert_data(Request,Options),
	scada_db_mssql:insert_data(Request,Options).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Request) -> list
%% @doc <i>Извлечение данных из базы</i>
%% <p>
%% <b>Request</b> - Запрос на извлечение данных из базы.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
get_data(Request) ->
	scada_db_mssql:get_data(Request).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Request) -> ok
%% @doc <i>Удаление данных из базы</i>
%% <p>
%% <b>Request</b> - Запрос на удаление данных из базы.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
delete_data(Request) ->
	% scada_db_mysql:delete_data(Request),
	scada_db_mssql:delete_data(Request).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Request) -> ok
%% @doc <i>Обновление данных в базе</i>
%% <p>
%% <b>Request</b> - Запрос на обновление данных в базе.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
update_data(Request) ->
	% scada_db_mysql:update_data(Request),
	scada_db_mssql:update_data(Request).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Request,Options::[{format,raw}] | [] ) -> ok | {error,Reason}
%% @doc <i>Обновление данных в базе с указанием опций обработки запроса</i>
%% <p>
%% <b>Request</b> - Запрос на обновление данных в базе;<br/>
%% <b>Options</b> - Список опций.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
update_data(Request,Options) ->
	% scada_db_mysql:update_data(Request,Options),
	scada_db_mssql:update_data(Request,Options).
