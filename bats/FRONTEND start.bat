@echo off
chcp 65001 > nul
cd /d "%~dp0.."
cd /d "frontend"
echo ======================================================
echo FRONTEND
echo Команда запуска: npm run dev
echo ======================================================
echo.

:loop
set /p user_cmd="%cd%> "

if /i "%user_cmd%"=="start" (
    npm run dev
    goto loop
)

if /i "%user_cmd%"=="exit" (
    exit
)

%user_cmd%

echo.
goto loop