# Chat System

Sistem chat dengan frontend React dan backend Laravel.

## Struktur Project

```
Chat System/
├── fe/          # Frontend (React + Vite)
└── be/          # Backend (Laravel)
```

## Setup

### Backend (Laravel)

1. Masuk ke folder `be`:
```bash
cd be
```

2. Install dependencies:
```bash
composer install
```

3. Copy `.env.example` ke `.env`:
```bash
cp .env.example .env
```

4. Generate application key:
```bash
php artisan key:generate
```

5. Konfigurasi database di `.env`:
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=chat_system
DB_USERNAME=root
DB_PASSWORD=
```

6. Jalankan migrations:
```bash
php artisan migrate
```

7. Start server:
```bash
php artisan serve --port=5000
```

Backend akan berjalan di `http://localhost:5000`

### Frontend (React)

1. Masuk ke folder `fe`:
```bash
cd fe
```

2. Install dependencies:
```bash
npm install
```

3. Copy `.env.example` ke `.env`:
```bash
cp .env.example .env
```

4. Konfigurasi API URL di `.env`:
```
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

5. Start development server:
```bash
npm run dev
```

Frontend akan berjalan di `http://localhost:5000`

## API Endpoints

### Sessions
- `POST /api/v1/sessions` - Buat session baru
- `GET /api/v1/sessions` - Ambil semua sessions

### Messages
- `POST /api/v1/messages` - Kirim pesan
- `GET /api/v1/messages/{sessionId}` - Ambil pesan untuk session

### Admin
- `GET /api/v1/admin/sessions` - Ambil semua sessions (admin)
- `POST /api/v1/admin/reply` - Kirim balasan admin
- `POST /api/v1/admin/finish-session` - Selesaikan session

## Catatan

- Pastikan backend Laravel berjalan sebelum menjalankan frontend
- CORS sudah dikonfigurasi untuk mengizinkan request dari frontend
- Database harus sudah dibuat sebelum menjalankan migrations

