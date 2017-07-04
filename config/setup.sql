# Создание базы данных
create database dp4;
# Создание пользователя для добавления и извлечения данных
create user 'report_viewer' identified by 'report_viewer';
# Установка разрешения для пользователя
grant all on dp4.* to 'report_viewer';