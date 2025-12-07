# Database MySQL Setup

## 1. Buat Database

Jalankan di MySQL:

```sql
CREATE DATABASE chat_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 2. Konfigurasi .env

Edit file `be/.env` dan sesuaikan konfigurasi database:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=chat_system
DB_USERNAME=root
DB_PASSWORD=your_password_here
```

**Catatan:** Ganti `your_password_here` dengan password MySQL Anda.

## 3. Run Migrations

Setelah database dibuat dan `.env` dikonfigurasi, jalankan:

```bash
cd be
php artisan migrate
```

Ini akan membuat tabel:
- `sessions` - Menyimpan data session chat
- `messages` - Menyimpan pesan-pesan dalam session

## 4. Verifikasi

Untuk memverifikasi database terhubung dengan benar:

```bash
php artisan tinker
```

Kemudian di tinker:
```php
DB::connection()->getPdo();
// Harus menampilkan informasi PDO connection
```

## Troubleshooting

### Error: "Access denied for user"
- Periksa username dan password di `.env`
- Pastikan user MySQL memiliki akses ke database

### Error: "Database not found"
- Pastikan database `chat_system` sudah dibuat
- Periksa nama database di `.env` sesuai dengan yang dibuat

### Error: "PDO extension not found"
- Aktifkan extension `pdo_mysql` di `php.ini`
- Restart web server (jika menggunakan Apache/Nginx)

