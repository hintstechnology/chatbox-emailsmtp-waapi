@echo off
chcp 65001 >nul
echo ========================================
echo Installing Backend Dependencies
echo ========================================
echo.

REM Try different Composer locations
set COMPOSER_CMD=

REM Check if composer is in PATH
where composer >nul 2>&1
if not errorlevel 1 (
    set COMPOSER_CMD=composer
    echo [OK] Composer ditemukan di PATH
    goto :install
)

REM Check XAMPP
if exist "C:\xampp\php\composer.bat" (
    set COMPOSER_CMD=C:\xampp\php\composer.bat
    echo [OK] Composer ditemukan di XAMPP
    goto :install
)

REM Check AppData
if exist "%APPDATA%\Composer\vendor\bin\composer.bat" (
    set COMPOSER_CMD=%APPDATA%\Composer\vendor\bin\composer.bat
    echo [OK] Composer ditemukan di AppData
    goto :install
)

REM Check Program Files
if exist "%LOCALAPPDATA%\Programs\Composer\composer.bat" (
    set COMPOSER_CMD=%LOCALAPPDATA%\Programs\Composer\composer.bat
    echo [OK] Composer ditemukan di Program Files
    goto :install
)

REM Check if composer.phar exists
if exist "C:\xampp\php\composer.phar" (
    set COMPOSER_CMD=C:\xampp\php\php.exe C:\xampp\php\composer.phar
    echo [OK] Menggunakan composer.phar dari XAMPP
    goto :install
)

echo [ERROR] Composer tidak ditemukan!
echo.
echo Silakan:
echo 1. Restart terminal/PowerShell setelah install Composer
echo 2. Atau jalankan manual: composer install
echo 3. Atau download composer.phar dan simpan di C:\xampp\php\
echo.
pause
exit /b 1

:install
echo.
echo Menginstall dependencies...
echo Ini mungkin memakan waktu beberapa menit...
echo.

call %COMPOSER_CMD% install

if errorlevel 1 (
    echo.
    echo [ERROR] Gagal install dependencies!
    echo.
    pause
    exit /b 1
)

echo.
echo [OK] Dependencies berhasil diinstall!
echo.
echo Langkah selanjutnya:
echo   1. php artisan key:generate
echo   2. php artisan migrate
echo   3. php artisan serve --port=5000
echo.
pause

