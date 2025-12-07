@echo off
chcp 65001 >nul
echo ========================================
echo Starting Laravel Backend Server
echo Port: 5000
echo ========================================
echo.

REM Try to find PHP
set PHP_PATH=
if exist "C:\xampp\php\php.exe" set PHP_PATH=C:\xampp\php\php.exe
if exist "C:\wamp64\bin\php\php8.1.0\php.exe" set PHP_PATH=C:\wamp64\bin\php\php8.1.0\php.exe
if exist "C:\wamp64\bin\php\php8.2.0\php.exe" set PHP_PATH=C:\wamp64\bin\php\php8.2.0\php.exe
if exist "C:\wamp64\bin\php\php8.3.0\php.exe" set PHP_PATH=C:\wamp64\bin\php\php8.3.0\php.exe
if "%PHP_PATH%"=="" set PHP_PATH=php

REM Check if .env exists
if not exist .env (
    echo [WARNING] File .env tidak ditemukan!
    echo Membuat file .env dari template...
    if exist .env.example (
        copy .env.example .env >nul
        echo File .env berhasil dibuat.
        echo.
        echo [PENTING] Edit file .env dan konfigurasi database!
        echo.
    ) else (
        echo ERROR: File .env.example juga tidak ditemukan!
        echo Silakan buat file .env secara manual.
        pause
        exit /b 1
    )
)

REM Check if vendor exists
if not exist vendor (
    echo [INFO] Dependencies belum terinstall.
    echo Menjalankan composer install...
    echo.
    
    REM Try to find composer
    set COMPOSER_PATH=
    if exist "C:\xampp\php\composer.bat" set COMPOSER_PATH=C:\xampp\php\composer.bat
    if exist "C:\wamp64\bin\php\php8.1.0\composer.bat" set COMPOSER_PATH=C:\wamp64\bin\php\php8.1.0\composer.bat
    if "%COMPOSER_PATH%"=="" set COMPOSER_PATH=composer
    
    call "%COMPOSER_PATH%" install
    if errorlevel 1 (
        echo.
        echo ERROR: Composer install gagal!
        echo Pastikan Composer sudah terinstall.
        pause
        exit /b 1
    )
    echo.
)

REM Check if APP_KEY is set
findstr /C:"APP_KEY=" .env | findstr /V "APP_KEY=$" >nul
if errorlevel 1 (
    echo [INFO] APP_KEY belum di-generate. Menjalankan key:generate...
    "%PHP_PATH%" artisan key:generate
    echo.
)

echo [INFO] Starting server...
echo Backend akan berjalan di: http://localhost:5000
echo API Base URL: http://localhost:5000/api/v1
echo.
echo Tekan Ctrl+C untuk menghentikan server
echo ========================================
echo.

"%PHP_PATH%" artisan serve --port=5000

if errorlevel 1 (
    echo.
    echo ERROR: Gagal menjalankan server!
    echo.
    echo Kemungkinan penyebab:
    echo 1. PHP tidak ditemukan atau tidak di PATH
    echo 2. Port 5000 sudah digunakan
    echo 3. Dependencies belum terinstall dengan benar
    echo.
    echo Coba jalankan manual:
    echo   php artisan serve --port=5000
    echo.
    pause
)
