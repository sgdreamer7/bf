drop database dp4;
drop user "report_viewer";
create database dp4;
use dp4;
create user "report_viewer" for login "report_viewer" with default_schema="dbo";
