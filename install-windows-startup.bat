@echo off
chcp 65001 >nul
echo ========================================
echo   Beka AI - Windows автозапуск орнату
echo ========================================
echo.

if not exist "frontend\dist\index.html" (
  echo Алдымен frontend құрастырылады...
  cd frontend
  call npm.cmd run build
  cd ..
  if not exist "frontend\dist\index.html" (
    echo Қате: build сәтсіз. frontend папкасында npm.cmd install орындаңыз.
    pause
    exit /b 1
  )
)

set "STARTUP=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "LINK=%STARTUP%\Beka-AI-Chatbot.bat"

copy /Y "%~dp0autostart-beka.bat" "%LINK%" >nul
if errorlevel 1 (
  echo Қате: Startup папкасына көшіру сәтсіз!
  pause
  exit /b 1
)

echo.
echo [OK] Автозапуск орнатылды!
echo.
echo Файл: %LINK%
echo.
echo Енді ноутбук қосылғанда:
echo   1) Сервер өзі іске қосылады
echo   2) Браузерде http://localhost:5006 ашылады
echo.
echo MongoDB: services.msc - MongoDB - Automatic
echo.
echo Өшіру: Win+R - shell:startup - Beka-AI-Chatbot.bat жойыңыз
echo.
pause
