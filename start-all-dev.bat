@echo off
cd /d "%~dp0"
echo Backend және Frontend екі бөлек терезеде іске қосылады...
start "Beka Backend" cmd /k "%~dp0start-backend.bat"
timeout /t 2 /nobreak >nul
start "Beka Frontend" cmd /k "%~dp0start-frontend.bat"
echo.
echo Ашық терезелер: Backend (5006) + Frontend (5174)
echo Браузер: http://localhost:5174
echo Екі терезені де жаппаңыз!
pause
