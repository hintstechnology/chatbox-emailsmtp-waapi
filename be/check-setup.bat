@echo off
chcp 65001 >nul
echo ========================================
echo Checking Backend Setup
echo ========================================
echo.

REM Check PHP
echo [1] Checking PHP...
set PHP_PATH=
if exist "C:\xampp\php\php.exe" (
    set PHP_PATH=C:\xampp\php\php.exe
    echo   [OK] PHP ditemukan: C:\xampp\php\php.exe
) else if exist "C:\wamp64\bin\php\php8.1.0\php.exe" (
    set PHP_PATH=C:\wamp64\bin\php\php8.1.0\php.exe
    echo   [OK] PHP ditemukan: C:\wamp64\bin\php\php8.1.0\php.exe
) else (
    where php >nul 2>&1
    if errorlevel 1 (
        echo   [ERROR] PHP tidak ditemukan!
        echo   Pastikan PHP sudah terinstall atau ada di PATH
    ) else (
        set PHP_PATH=php
        echo   [OK] PHP ditemukan di PATH
    )
)

if not "%PHP_PATH%"=="" (
    "%PHP_PATH%" --version
    echo.
)

REM Check Composer
echo [2] Checking Composer...
set COMPOSER_PATH=
if exist "C:\xampp\php\composer.bat" (
    set COMPOSER_PATH=C:\xampp\php\composer.bat
    echo   [OK] Composer ditemukan: C:\xampp\php\composer.bat
) else (
    where composer >nul 2>&1
    if errorlevel 1 (
        echo   [WARNING] Composer tidak ditemukan!
        echo   Install dari: https://getcomposer.org/
    ) else (
        set COMPOSER_PATH=composer
        echo   [OK] Composer ditemukan di PATH
    )
)

if not "%COMPOSER_PATH%"=="" (
    "%COMPOSER_PATH%" --version
    echo.
)

REM Check .env
echo [3] Checking .env file...
if exist .env (
    echo   [OK] File .env ditemukan
    findstr /C:"APP_KEY=" .env | findstr /V "APP_KEY=$" >nul
    if errorlevel 1 (
        echo   [WARNING] APP_KEY belum di-set
    ) else (
        echo   [OK] APP_KEY sudah di-set
    )
) else (
    echo   [ERROR] File .env tidak ditemukan!
    if exist .env.example (
        echo   [INFO] File .env.example ditemukan, bisa di-copy
    )
)
echo.

REM Check vendor
echo [4] Checking dependencies...
if exist vendor (
    echo   [OK] Dependencies sudah terinstall
) else (
    echo   [WARNING] Dependencies belum terinstall
    echo   Jalankan: composer install
)
echo.

REM Check database config
echo [5] Checking database configuration...
if exist .env (
    findstr /C:"DB_DATABASE=" .env >nul
    if errorlevel 1 (
        echo   [WARNING] DB_DATABASE tidak dikonfigurasi
    ) else (
        echo   [OK] Database configuration ditemukan
    )
)
echo.

echo ========================================
echo Setup Check Complete
echo ========================================
echo.
pause

