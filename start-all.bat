@echo off
echo Starting all services...
echo.

echo Starting Backend (Port 5000)...
start "Backend" cmd /k "cd be && php artisan serve --port=5000 --host=127.0.0.1"

timeout /t 3 /nobreak >nul

echo Starting Chatbox Frontend (Port 5001)...
start "Chatbox Frontend" cmd /k "cd fe_chatbox && npm run dev"

timeout /t 3 /nobreak >nul

echo Starting Admin Frontend (Port 5002)...
start "Admin Frontend" cmd /k "cd fe_admin && npm run dev"

echo.
echo All services started!
echo Backend: http://localhost:5000
echo Chatbox: http://localhost:5001
echo Admin: http://localhost:5002
pause

