# Quick Start Backend

## Status Setup
✅ PHP ditemukan: `C:\xampp\php\php.exe`  
❌ Composer belum terinstall  
✅ File `.env` sudah dibuat  

## Langkah Selanjutnya

### 1. Install Composer

**Cara cepat (PowerShell sebagai Admin):**
```powershell
# Download installer
Invoke-WebRequest -Uri "https://getcomposer.org/installer" -OutFile "$env:TEMP\composer-setup.php"

# Install
cd C:\xampp\php
php "$env:TEMP\composer-setup.php"
php -r "unlink('$env:TEMP\composer-setup.php');"

# Buat batch file
@"
@echo off
php "%~dp0composer.phar" %*
"@ | Out-File -FilePath "composer.bat" -Encoding ASCII
```

**Atau download manual:**
- Download: https://getcomposer.org/Composer-Setup.exe
- Install dan restart terminal

### 2. Install Dependencies

Setelah Composer terinstall:
```bash
cd be
composer install
```

### 3. Generate Key

```bash
php artisan key:generate
```

### 4. Setup Database

1. Buka MySQL (via XAMPP Control Panel)
2. Buat database:
```sql
CREATE DATABASE chat_system;
```

3. Edit file `.env` dan sesuaikan jika perlu:
```
DB_USERNAME=root
DB_PASSWORD=your_password
```

### 5. Run Migrations

```bash
php artisan migrate
```

### 6. Start Server

```bash
php artisan serve --port=5000
```

Atau gunakan script:
```bash
start-server.bat
```

## Server akan berjalan di: http://localhost:5000

## Test API

Buka browser: `http://localhost:5000/api/v1/sessions`

Harus menampilkan: `{"sessions":[]}`

