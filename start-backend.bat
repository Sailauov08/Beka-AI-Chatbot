@echo off
title Beka AI - Backend (port 5006)
cd /d "%~dp0backend"
echo.
echo ========================================
echo   Backend: http://localhost:5006
echo   MongoDB: ai_chatbot_db
echo   Бұл терезені ЖАППАҢЫЗ — сервер тоқтайды!
echo ========================================
echo.
node server.js
echo.
echo Backend тоқтады. Қате болса жоғарыдағы мәтінді оқыңыз.
pause
