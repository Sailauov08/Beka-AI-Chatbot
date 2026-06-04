@echo off
title Beka AI - Frontend (port 5174)
cd /d "%~dp0frontend"
echo.
echo ========================================
echo   Frontend: http://localhost:5174
echo   Бұл терезені ЖАППАҢЫЗ — сайт жабылады!
echo ========================================
echo.
call npm.cmd run dev
echo.
echo Frontend тоқтады.
pause
