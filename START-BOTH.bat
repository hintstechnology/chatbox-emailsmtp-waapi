@echo off
echo ========================================
echo Starting Chat System
echo ========================================
echo.
echo Script ini akan membuka 2 terminal:
echo 1. Backend Laravel (port 5000)
echo 2. Frontend React (port 5173)
echo.
echo Pastikan:
echo - PHP dan Composer sudah terinstall
echo - Node.js dan npm sudah terinstall
echo - MySQL sudah berjalan
echo - Database 'chat_system' sudah dibuat
echo.
pause

REM Start Backend in new window
start "Backend Laravel - Port 5000" cmd /k "cd /d %~dp0be && start-server.bat"

REM Wait a bit
timeout /t 3 /nobreak >nul

REM Start Frontend in new window
start "Frontend React - Port 5173" cmd /k "cd /d %~dp0fe && start-frontend.bat"

echo.
echo ========================================
echo Kedua server sedang dimulai...
echo ========================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Jangan tutup window ini sampai selesai menggunakan aplikasi.
echo.
pause

