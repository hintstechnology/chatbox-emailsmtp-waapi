# Quick Fix: GraphQL 500 Error

## ✅ Masalah yang Sudah Diperbaiki

1. ✅ **DateTime scalar** - Sudah ditambahkan di schema
2. ✅ **Auth config** - Sudah dibuat (`config/auth.php`)
3. ✅ **GraphQL schema** - Sudah divalidasi dan valid
4. ✅ **CreateSession mutation** - Sudah dibuat dengan custom resolver

## ⚠️ Masalah yang Perlu Diatasi: Database Connection

Error: "No connection could be made because the target machine actively refused it"

### Langkah-langkah Fix:

### 1. Start MySQL

**XAMPP:**
- Buka XAMPP Control Panel
- Klik "Start" pada MySQL

**Atau via Command:**
```bash
# Check apakah MySQL berjalan
netstat -ano | findstr :3306
```

### 2. Buat Database

Buka MySQL (phpMyAdmin atau command line):

```sql
CREATE DATABASE chat_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**Atau import SQL file:**
```bash
mysql -u root -p < database.sql
```

### 3. Konfigurasi .env

Edit `be/.env` dan pastikan:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=chat_system
DB_USERNAME=root
DB_PASSWORD=
```

**Catatan:** Jika MySQL tidak pakai password, biarkan `DB_PASSWORD=` kosong.

### 4. Test Connection

```bash
php artisan migrate:status
```

Jika berhasil, akan menampilkan list migrations.

### 5. Run Migrations

```bash
php artisan migrate
```

Ini akan membuat tabel:
- `sessions`
- `messages`
- `email_recipients`

### 6. Restart Server

```bash
# Stop server (Ctrl+C)
php artisan serve --port=5000 --host=127.0.0.1
```

## Verifikasi

Setelah semua langkah di atas:

1. **Test GraphQL:**
```bash
curl -X POST http://localhost:5000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ sessions { id name } }"}'
```

2. **Test di Frontend:**
- Buka `http://localhost:5001`
- Coba buat session baru
- Error 500 seharusnya sudah teratasi

## Status

- ✅ GraphQL Schema: Valid
- ✅ DateTime Scalar: Sudah ditambahkan
- ✅ Auth Config: Sudah dibuat
- ⚠️ Database: Perlu dibuat dan dikonfigurasi
- ⚠️ Migrations: Perlu dijalankan

Setelah database setup, semua akan berfungsi dengan baik!

