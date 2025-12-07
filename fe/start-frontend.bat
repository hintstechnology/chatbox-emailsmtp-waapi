@echo off
chcp 65001 >nul
echo ========================================
echo Starting React Frontend
echo Port: 5173
echo ========================================
echo.

if not exist node_modules (
    echo Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo ERROR: npm install gagal!
        pause
        exit /b 1
    )
)

echo Starting development server...
echo Frontend: http://localhost:5173
echo Backend API: http://127.0.0.1:5000/api/v1
echo.
echo Tekan Ctrl+C untuk menghentikan
echo ========================================
echo.

call npm run dev

pause
