@echo off
chcp 65001 >nul
echo ========================================
echo Backend Setup Script
echo ========================================
echo.

REM Set PHP and Composer paths
set PHP_PATH=C:\xampp\php\php.exe
set COMPOSER_PATH=C:\xampp\php\composer.bat

if not exist "%PHP_PATH%" (
    echo ERROR: PHP tidak ditemukan di C:\xampp\php\php.exe
    echo Pastikan XAMPP sudah terinstall.
    pause
    exit /b 1
)

echo [1/5] Membuat file .env...
if not exist .env (
    if exist .env.example (
        copy .env.example .env >nul
        echo   [OK] File .env berhasil dibuat dari .env.example
    ) else (
        echo   [WARNING] File .env.example tidak ditemukan
        echo   Membuat file .env dasar...
        (
            echo APP_NAME="Chat System"
            echo APP_ENV=local
            echo APP_KEY=
            echo APP_DEBUG=true
            echo APP_URL=http://localhost:5000
            echo.
            echo DB_CONNECTION=mysql
            echo DB_HOST=127.0.0.1
            echo DB_PORT=3306
            echo DB_DATABASE=chat_system
            echo DB_USERNAME=root
            echo DB_PASSWORD=
        ) > .env
        echo   [OK] File .env berhasil dibuat
    )
) else (
    echo   [OK] File .env sudah ada
)
echo.

echo [2/5] Install dependencies dengan Composer...
if not exist vendor (
    if exist "%COMPOSER_PATH%" (
        echo   Menggunakan Composer dari XAMPP...
        call "%COMPOSER_PATH%" install
    ) else (
        echo   [WARNING] Composer tidak ditemukan di XAMPP
        echo   Mencoba menggunakan Composer dari PATH...
        composer install
    )
    if errorlevel 1 (
        echo   [ERROR] Gagal install dependencies!
        echo   Pastikan Composer sudah terinstall.
        echo   Download dari: https://getcomposer.org/
        pause
        exit /b 1
    )
    echo   [OK] Dependencies berhasil diinstall
) else (
    echo   [OK] Dependencies sudah terinstall
)
echo.

echo [3/5] Generate application key...
"%PHP_PATH%" artisan key:generate
if errorlevel 1 (
    echo   [WARNING] Gagal generate key, mungkin sudah ada
) else (
    echo   [OK] Application key berhasil di-generate
)
echo.

echo [4/5] Database setup...
echo   [INFO] Pastikan:
echo   - MySQL sudah berjalan
echo   - Database 'chat_system' sudah dibuat
echo   - Konfigurasi di .env sudah benar
echo.
set /p RUN_MIGRATE="Jalankan migrations sekarang? (y/n): "
if /i "%RUN_MIGRATE%"=="y" (
    "%PHP_PATH%" artisan migrate
    if errorlevel 1 (
        echo   [WARNING] Migration gagal, periksa konfigurasi database
    ) else (
        echo   [OK] Migrations berhasil dijalankan
    )
) else (
    echo   [SKIP] Migrations dilewati
    echo   Jalankan manual: php artisan migrate
)
echo.

echo [5/5] Setup selesai!
echo.
echo ========================================
echo Backend siap dijalankan!
echo ========================================
echo.
echo Untuk menjalankan server:
echo   start-server.bat
echo.
echo Atau manual:
echo   php artisan serve --port=5000
echo.
pause

