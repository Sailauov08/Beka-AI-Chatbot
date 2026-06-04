@echo off
cd /d "%~dp0"

if not exist "frontend\dist\index.html" (
  cd frontend
  call npm.cmd run build >nul 2>&1
  cd ..
)

net start MongoDB >nul 2>&1

wscript.exe "%~dp0start-server-hidden.vbs"
timeout /t 6 /nobreak >nul
start http://localhost:5006
exit
