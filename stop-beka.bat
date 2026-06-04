@echo off
echo Beka AI серверін тоқтату (порт 5006)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5006 ^| findstr LISTENING') do (
  taskkill /F /PID %%a >nul 2>&1
  echo PID %%a тоқтатылды.
)
echo Дайын.
timeout /t 3 /nobreak >nul
