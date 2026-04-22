@echo off
chcp 65001 > nul
cd /d "%~dp0.."
cd /d "smart-home"
echo ======================================================
echo MQTT Listener
echo Команда запуска: php artisan mqtt:listen
echo ======================================================
echo.

:loop
set /p user_cmd="%cd%> "

if /i "%user_cmd%"=="start" (
    php artisan mqtt:listen
    goto loop
)

if /i "%user_cmd%"=="exit" (
    exit
)

%user_cmd%

echo.
goto loop