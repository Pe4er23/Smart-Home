@echo off
chcp 65001 > nul
cd /d "%~dp0.."
cd /d "smart-home"
echo ======================================================
echo BACKEND
echo Команда запуска: php artisan serve
echo ======================================================
echo.

:loop
set /p user_cmd="%cd%> "

if /i "%user_cmd%"=="start" (
    php artisan serve
    goto loop
)

if /i "%user_cmd%"=="exit" (
    exit
)

%user_cmd%

echo.
goto loop