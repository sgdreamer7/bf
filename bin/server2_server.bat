@echo off
@set ERL_LIBS=C:/bf/sources
@set HEART_BEAT_TIMEOUT=60
@set HEART_BEAT_BOOT_DELAY=60
@set HEART_COMMAND=C:/bf/bin/server2_server.bat
@set TEMP=C:/bf/temp
@del C:\bf\config\production\snmp2\manager\db\snmpm_config_db
@erl -heart -sname bf_server2 -setcookie scadasecret -smp enabled +S 4:4 +A 8 -config "C:/bf/config/production/apps2" -s scada start
@del C:\bf\config\production\snmp2\manager\db\snmpm_config_db
@exit