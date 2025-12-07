@echo off
chcp 65001 >nul
echo ========================================
echo Starting Laravel Backend
echo Port: 5000
echo ========================================
echo.

REM Set PHP path
set PHP_PATH=C:\xampp\php\php.exe

if not exist "%PHP_PATH%" (
    echo ERROR: PHP tidak ditemukan di %PHP_PATH%
    pause
    exit /b 1
)

echo Checking if port 5000 is available...
netstat -ano | findstr ":5000" | findstr "LISTENING" >nul
if not errorlevel 1 (
    echo WARNING: Port 5000 sudah digunakan!
    echo Silakan stop aplikasi lain yang menggunakan port 5000
    pause
    exit /b 1
)

echo Starting Laravel server...
echo Backend API: http://127.0.0.1:5000/api/v1
echo.
echo Tekan Ctrl+C untuk menghentikan
echo ========================================
echo.

"%PHP_PATH%" artisan serve --port=5000 --host=127.0.0.1

pause

