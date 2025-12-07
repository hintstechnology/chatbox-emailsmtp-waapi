# Troubleshooting Guide

## Error: require_once $publicPath.'/index.php'

Jika Anda melihat error ini, kemungkinan masalahnya adalah:

### 1. Working Directory Salah

Pastikan Anda menjalankan `php artisan serve` dari folder `be/`:

```bash
cd be
php artisan serve --port=5000
```

**JANGAN** menjalankan dari root project atau folder lain.

### 2. Path Issue

Jika masih error, coba dengan full path:

```bash
cd "D:\Hilmy\Kerja\Hints Technology\Chat System\be"
C:\xampp\php\php.exe artisan serve --port=5000 --host=127.0.0.1
```

### 3. Clear All Caches

```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
```

### 4. Check File Permissions

Pastikan file `public/index.php` bisa dibaca:

```bash
# Windows
icacls public\index.php

# Linux/Mac
ls -la public/index.php
```

### 5. Verify File Exists

```bash
# Windows PowerShell
Test-Path public\index.php

# Should return: True
```

### 6. Reinstall Dependencies

Jika masih error, coba reinstall:

```bash
composer install --no-dev --optimize-autoloader
```

## Error: Class Not Found

### GraphQL Classes

Jika ada error "Class not found" untuk GraphQL:

```bash
composer dump-autoload
php artisan config:clear
```

### EmailRecipient Model

Pastikan migration sudah dijalankan:

```bash
php artisan migrate
```

## Error: Database Connection

### Check .env

Pastikan `.env` sudah dikonfigurasi:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=chat_system
DB_USERNAME=root
DB_PASSWORD=your_password
```

### Test Connection

```bash
php artisan tinker
```

```php
DB::connection()->getPdo();
// Should return PDO object
```

## Error: GraphQL Schema

Jika ada error dengan GraphQL schema:

```bash
php artisan lighthouse:validate-schema
```

## Error: Email Not Sending

### Check SMTP Config

Pastikan `.env` sudah dikonfigurasi:

```env
MAIL_MAILER=smtp
MAIL_HOST=mail.hintstechnology.com
MAIL_PORT=465
MAIL_USERNAME=chatbox@hintstechnology.com
MAIL_PASSWORD=@@chatbox123
MAIL_ENCRYPTION=ssl
```

### Test with Log Driver

Untuk testing, gunakan log driver:

```env
MAIL_MAILER=log
```

Email akan tersimpan di `storage/logs/laravel.log`

### Check Logs

```bash
tail -f storage/logs/laravel.log
```

## Error: CORS

Jika ada CORS error di frontend:

1. Check `config/cors.php`
2. Pastikan port 5001 sudah ditambahkan di `allowed_origins`
3. Clear config cache: `php artisan config:clear`

## Quick Fix Commands

```bash
# Clear all caches
php artisan optimize:clear

# Rebuild autoload
composer dump-autoload

# Check routes
php artisan route:list

# Check config
php artisan config:show

# Test database
php artisan migrate:status
```

## Still Having Issues?

1. Check `storage/logs/laravel.log` untuk error details
2. Enable debug mode di `.env`: `APP_DEBUG=true`
3. Check PHP version: `php -v` (should be >= 8.1)
4. Check Composer: `composer --version`

