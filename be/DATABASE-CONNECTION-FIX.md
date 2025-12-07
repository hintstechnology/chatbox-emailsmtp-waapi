# Fix: Database Connection Error

## Masalah

Error: "No connection could be made because the target machine actively refused it"

Ini berarti:
1. MySQL server tidak berjalan, ATAU
2. Database `chat_system` belum dibuat, ATAU
3. Konfigurasi database di `.env` salah

## Solusi

### 1. Pastikan MySQL Berjalan

**XAMPP:**
- Buka XAMPP Control Panel
- Start MySQL service

**WAMP:**
- Buka WAMP Control Panel
- Start MySQL service

**Standalone MySQL:**
```bash
# Windows (Service)
net start MySQL

# Linux
sudo systemctl start mysql
```

### 2. Buat Database

Buka MySQL (phpMyAdmin atau command line):

```sql
CREATE DATABASE chat_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Konfigurasi .env

Edit `be/.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=chat_system
DB_USERNAME=root
DB_PASSWORD=your_password
```

**Penting:** Ganti `your_password` dengan password MySQL Anda. Jika tidak ada password, biarkan kosong: `DB_PASSWORD=`

### 4. Test Connection

```bash
php artisan tinker
```

```php
DB::connection()->getPdo();
// Harus return PDO object tanpa error
```

### 5. Run Migrations

Setelah database dibuat dan connection berhasil:

```bash
php artisan migrate
```

Ini akan membuat semua tabel yang diperlukan.

## Quick Test

```bash
# Test connection
php artisan migrate:status

# Jika berhasil, akan menampilkan list migrations
# Jika error, akan menampilkan connection error
```

## Troubleshooting

### Error: "Access denied for user"
- Periksa username dan password di `.env`
- Pastikan user MySQL memiliki akses

### Error: "Database not found"
- Buat database terlebih dahulu (lihat step 2)

### Error: "Connection refused"
- Pastikan MySQL service berjalan
- Periksa port 3306 tidak diblokir firewall

