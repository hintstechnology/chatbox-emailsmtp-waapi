# Cara Menjalankan Chat System

## Quick Start

### Backend (Laravel) - Port 5000

1. Masuk ke folder backend:
```bash
cd be
```

2. Install dependencies (jika belum):
```bash
composer install
```

3. Setup database:
   - Buat database `chat_system` di MySQL
   - Edit file `.env` dan sesuaikan konfigurasi database

4. Generate key dan migrate:
```bash
php artisan key:generate
php artisan migrate
```

5. Jalankan server:
```bash
php artisan serve --port=5000
```

**Atau gunakan script helper:**
- Windows: `start-server.bat`
- Linux/Mac: `./start-server.sh`

Backend akan berjalan di: `http://localhost:5000`

### Frontend (React) - Port 5173

1. Masuk ke folder frontend:
```bash
cd fe
```

2. Install dependencies (jika belum):
```bash
npm install
```

3. Pastikan file `.env` ada dengan isi:
```
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

4. Jalankan development server:
```bash
npm run dev
```

Frontend akan berjalan di: `http://localhost:5173`

## Urutan Menjalankan

1. **Jalankan Backend terlebih dahulu** (port 5000)
2. **Kemudian jalankan Frontend** (port 5173)

## Testing

- Backend API: `http://localhost:5000/api/v1/sessions`
- Frontend: `http://localhost:5173`

## Troubleshooting

### Port 5000 sudah digunakan
Gunakan port lain untuk backend:
```bash
php artisan serve --port=5001
```
Lalu update `VITE_API_BASE_URL` di frontend `.env`

### Port 5173 sudah digunakan
Vite akan otomatis mencari port yang tersedia (5174, 5175, dst)
