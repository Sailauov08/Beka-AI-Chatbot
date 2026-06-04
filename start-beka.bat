@echo off
title Beka AI - іске қосу
cd /d "%~dp0"

if not exist "frontend\dist\index.html" (
  echo Build жасалуда...
  cd frontend
  call npm.cmd run build
  cd ..
)

echo.
echo Сервер ФОНДА іске қосылады (терезені жабуға БОЛАДЫ)...
wscript.exe "%~dp0start-server-hidden.vbs"
timeout /t 4 /nobreak >nul

echo.
echo ========================================
echo   [OK] Сервер жүріп тұр!
echo   Chrome: http://localhost:5006
echo.
echo   Бұл терезені ЖАБУҒА БОЛАДЫ.
echo   Серверді тоқтату: stop-beka.bat
echo ========================================
echo.
start http://localhost:5006
pause
