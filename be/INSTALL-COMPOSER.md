# Install Composer untuk Backend

## Masalah
Composer tidak ditemukan di sistem. Backend Laravel memerlukan Composer untuk install dependencies.

## Solusi

### Opsi 1: Install Composer Global (Recommended)

1. Download Composer dari: https://getcomposer.org/download/
2. Download file `Composer-Setup.exe` untuk Windows
3. Install Composer (akan otomatis menambahkan ke PATH)
4. Restart terminal/PowerShell
5. Verifikasi: `composer --version`

### Opsi 2: Install Composer Manual

1. Download `composer.phar` dari: https://getcomposer.org/download/
2. Simpan di folder `C:\xampp\php\` atau folder PHP Anda
3. Buat file `composer.bat` di folder yang sama dengan isi:
```batch
@echo off
php "%~dp0composer.phar" %*
```

### Opsi 3: Gunakan Composer dari XAMPP (jika ada)

Jika XAMPP sudah include Composer, biasanya ada di:
- `C:\xampp\php\composer.bat`
- Atau install via XAMPP Control Panel

## Setelah Composer Terinstall

1. Jalankan setup:
```bash
cd be
setup-backend.bat
```

2. Atau manual:
```bash
composer install
php artisan key:generate
php artisan migrate
php artisan serve --port=5000
```

## Quick Install Composer (PowerShell)

Jalankan di PowerShell sebagai Administrator:

```powershell
# Download dan install Composer
Invoke-WebRequest -Uri "https://getcomposer.org/installer" -OutFile "composer-setup.php"
php composer-setup.php
php -r "unlink('composer-setup.php');"
Move-Item composer.phar C:\xampp\php\composer.phar
```

Lalu buat `C:\xampp\php\composer.bat`:
```batch
@echo off
php "%~dp0composer.phar" %*
```

