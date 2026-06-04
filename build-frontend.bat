@echo off
title Beka AI - Frontend build
cd /d "%~dp0frontend"
echo Frontend құрастырылуда (бір рет немесе код өзгергенде)...
call npm.cmd run build
if errorlevel 1 (
  echo Қате! node_modules жоқ болса: npm.cmd install
  pause
  exit /b 1
)
echo Дайын! frontend\dist папкасы жасалды.
pause
