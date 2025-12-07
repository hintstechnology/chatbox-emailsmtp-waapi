# Quick Fix untuk Error Laravel

## Jika Error saat Menjalankan Server

### Step 1: Clear All Caches
```bash
cd be
php artisan optimize:clear
```

### Step 2: Verify File Structure
```bash
# Pastikan file-file ini ada:
Test-Path public\index.php          # Harus True
Test-Path bootstrap\app.php          # Harus True
Test-Path .env                       # Harus True
```

### Step 3: Rebuild Autoload
```bash
composer dump-autoload
```

### Step 4: Run Migrations
```bash
php artisan migrate
```

### Step 5: Start Server dengan Benar
```bash
# Pastikan di folder be/
cd "D:\Hilmy\Kerja\Hints Technology\Chat System\be"
C:\xampp\php\php.exe artisan serve --port=5000 --host=127.0.0.1
```

## Jika Masih Error

### Check Laravel Logs
```bash
Get-Content storage\logs\laravel.log -Tail 50
```

### Enable Debug Mode
Edit `.env`:
```env
APP_DEBUG=true
APP_ENV=local
```

### Verify PHP Version
```bash
C:\xampp\php\php.exe -v
# Harus >= 8.1
```

## Common Issues

### Issue: "Class not found"
**Fix**: `composer dump-autoload`

### Issue: "Route not found"
**Fix**: `php artisan route:clear`

### Issue: "Config not found"
**Fix**: `php artisan config:clear`

### Issue: "Database error"
**Fix**: Check `.env` dan pastikan database sudah dibuat

