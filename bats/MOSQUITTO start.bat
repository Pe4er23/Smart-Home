@echo off
chcp 65001 > nul
echo ======================================================
echo Нужен брокер Mosquitto
echo Команда запуска из коренной папки: .\mosquitto_sub.exe -h localhost -t "home/kitchen/lamp"
echo Нужно переместится в коренную папку с помощью команды "cd "
echo ======================================================
echo.

:loop
set /p user_cmd="%cd%> "

if /i "%user_cmd%"=="start" (
    .\mosquitto_sub.exe -h localhost -t "home/kitchen/lamp"
    goto loop
)
if /i "user_cmd%"=="default" (
	cd /d "D:\Mosquitto"
	goto loop
)
if /i "%user_cmd%"=="exit" (
    exit
)


%user_cmd%

echo.
goto loop