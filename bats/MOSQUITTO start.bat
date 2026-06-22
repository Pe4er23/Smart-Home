@echo off
chcp 65001 > nul
echo ======================================================
echo Потрібен брокер Mosquitto
echo Команда запуску з корінної папки: .\mosquitto_sub.exe -h localhost -t "home/kitchen/lamp"
echo Або команда: start
echo Потрібно переміститися до корінної папки за допомогою команди "cd "
echo Переміститься до дефолтної папки: default
echo ======================================================
echo.

:loop
set /p user_cmd="%cd%> "

if /i "%user_cmd%"=="start" (
    .\mosquitto_sub.exe -h localhost -t "home/kitchen/lamp"
    goto loop
)
if /i "%user_cmd%"=="default" (
	cd /d "..\Mosquitto"
	goto loop
)
if /i "%user_cmd%"=="exit" (
    exit
)


%user_cmd%

echo.
goto loop