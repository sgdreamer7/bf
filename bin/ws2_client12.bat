@set Timer=20
@echo Running client application in %Timer% second(s)...
@ping -n %Timer% 127.0.0.1>nul
javaws -Xnosplash http://bf-server2:5001/hmi?screen=1
exit