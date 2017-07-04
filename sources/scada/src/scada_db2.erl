%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @author Владимир Щербина <vns.scherbina@gmail.com>
%% @copyright 2017
%% @version 1.1.0
%% @doc Модуль <b>{@module}</b> реализует доступ к базам данных.
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
-module(scada_db2).

-export(
	[
		create_table/1,
		insert_data/1,
		insert_data/2,
		get_data/1,
		delete_data/1
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
	ScadaDBDriverName=scada:get_app_env(scada_db_driver,scada_db_mysql),
	ScadaDBDriverName:create_table(Request).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Request) -> ok | {error,Reason}
%% @doc <i>Добавление данных в базу</i>
%% <p>
%% <b>Request</b> - Запрос на добавление данных в базу.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
insert_data(Request) ->
	ScadaDBDriverName=scada:get_app_env(scada_db_driver,scada_db_mysql),
	ScadaDBDriverName:insert_data(Request).

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
	ScadaDBDriverName=scada:get_app_env(scada_db_driver,scada_db_mysql),
	ScadaDBDriverName:insert_data(Request,Options).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Request) -> list
%% @doc <i>Извлечение данных из базы</i>
%% <p>
%% <b>Request</b> - Запрос на извлечение данных из базы.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
get_data(Request) ->
	ScadaDBDriverName=scada:get_app_env(scada_db_driver,scada_db_mysql),
	ScadaDBDriverName:get_data(Request).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% @spec (Request) -> ok
%% @doc <i>Удаление данных из базы</i>
%% <p>
%% <b>Request</b> - Запрос на удаление данных из базы.<br/>
%% </p>
%% @end
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
delete_data(Request) ->
	ScadaDBDriverName=scada:get_app_env(scada_db_driver,scada_db_mysql),
	ScadaDBDriverName:delete_data(Request).