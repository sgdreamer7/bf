@echo off
start C:/bf/bin/ws3_server.bat
set Timer=30
echo Running client application in %Timer% second(s)...
ping -n %Timer% 127.0.0.1>nul
start C:/bf/bin/ws3_client.bat
exit