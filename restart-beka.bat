@echo off
title Beka AI - қайта іске қосу
cd /d "%~dp0"

echo Ескі сервер тоқтатылады (порт 5006)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5006 ^| findstr LISTENING') do (
  taskkill /F /PID %%a >nul 2>&1
)

timeout /t 2 /nobreak >nul

if not exist "frontend\dist\index.html" (
  echo Build жасалуда...
  cd frontend
  call npm.cmd run build
  cd ..
)

cd backend
set SERVE_FRONTEND=true
echo.
echo ========================================
echo   http://localhost:5006
echo   Терезені ЖАППАҢЫЗ!
echo ========================================
echo.
node server.js
pause
