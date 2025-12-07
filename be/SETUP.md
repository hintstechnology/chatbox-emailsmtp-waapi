# Cara Menjalankan Backend Laravel

## Prerequisites

Pastikan sudah terinstall:
- PHP >= 8.1
- Composer
- MySQL/MariaDB
- Extension PHP: pdo_mysql, mbstring, openssl, tokenizer, xml, ctype, json

## Langkah-langkah Setup

### 1. Install Dependencies

```bash
cd be
composer install
```

### 2. Setup Environment

File `.env` sudah dibuat. Edit file `.env` dan sesuaikan konfigurasi database:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=chat_system
DB_USERNAME=root
DB_PASSWORD=your_password
```

**Penting:** Buat database `chat_system` di MySQL terlebih dahulu:

```sql
CREATE DATABASE chat_system;
```

### 3. Generate Application Key

```bash
php artisan key:generate
```

### 4. Run Migrations

```bash
php artisan migrate
```

Ini akan membuat tabel `sessions` dan `messages` di database.

### 5. Start Development Server

```bash
php artisan serve --port=5000
```

Server akan berjalan di `http://localhost:5000`

## Testing API

Setelah server berjalan, test dengan:

```bash
# Test endpoint
curl http://localhost:5000/api/v1/sessions
```

Atau buka di browser: `http://localhost:5000/api/v1/sessions`

## Troubleshooting

### Error: "Class 'PDO' not found"
Install extension PHP:
```bash
# Windows (XAMPP/WAMP)
# Edit php.ini dan uncomment: extension=pdo_mysql

# Linux
sudo apt-get install php-mysql
```

### Error: "Access denied for user"
Periksa username dan password MySQL di file `.env`

### Error: "Database not found"
Buat database terlebih dahulu:
```sql
CREATE DATABASE chat_system;
```

### Port 5000 sudah digunakan
Gunakan port lain:
```bash
php artisan serve --port=5001
```

## API Endpoints

Base URL: `http://localhost:5000/api/v1`

- `POST /api/v1/sessions` - Buat session baru
- `GET /api/v1/sessions` - Ambil semua sessions
- `POST /api/v1/messages` - Kirim pesan
- `GET /api/v1/messages/{sessionId}` - Ambil pesan untuk session
- `GET /api/v1/admin/sessions` - Ambil semua sessions (admin)
- `POST /api/v1/admin/reply` - Kirim balasan admin
- `POST /api/v1/admin/finish-session` - Selesaikan session

