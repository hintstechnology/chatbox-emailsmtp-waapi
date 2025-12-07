# Cara Menjalankan Server

## ⚠️ Catatan
PHP dan Composer tidak terdeteksi di PATH. Jalankan secara manual di terminal terpisah.

## Langkah-langkah

### Terminal 1 - Backend (Laravel)

1. Buka terminal/PowerShell baru
2. Masuk ke folder backend:
```bash
cd "D:\Hilmy\Kerja\Hints Technology\Chat System\be"
```

3. Pastikan PHP dan Composer tersedia:
```bash
php --version
composer --version
```

4. Jika belum install dependencies:
```bash
composer install
```

5. Pastikan file `.env` sudah ada dan dikonfigurasi

6. Generate key (jika belum):
```bash
php artisan key:generate
```

7. Run migrations (jika belum):
```bash
php artisan migrate
```

8. Jalankan server:
```bash
php artisan serve --port=5000
```

Backend akan berjalan di: **http://localhost:5000**

### Terminal 2 - Frontend (React)

1. Buka terminal/PowerShell baru
2. Masuk ke folder frontend:
```bash
cd "D:\Hilmy\Kerja\Hints Technology\Chat System\fe"
```

3. Install dependencies (jika belum):
```bash
npm install
```

4. Pastikan file `.env` ada dengan isi:
```
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

5. Jalankan development server:
```bash
npm run dev
```

Frontend akan berjalan di: **http://localhost:5173**

## Quick Commands

### Backend
```bash
cd be
php artisan serve --port=5000
```

### Frontend
```bash
cd fe
npm run dev
```

## Verifikasi

Setelah kedua server berjalan:

1. **Backend API**: Buka browser ke `http://localhost:5000/api/v1/sessions`
   - Harus menampilkan JSON response (bisa kosong `{"sessions":[]}`)

2. **Frontend**: Buka browser ke `http://localhost:5173`
   - Harus menampilkan halaman landing page

## Troubleshooting

### PHP tidak ditemukan
- Pastikan PHP sudah terinstall (XAMPP, WAMP, atau standalone)
- Tambahkan PHP ke PATH environment variable
- Atau gunakan full path: `C:\xampp\php\php.exe artisan serve --port=5000`

### Composer tidak ditemukan
- Install Composer dari https://getcomposer.org/
- Atau gunakan Composer yang ada di XAMPP/WAMP

### Port sudah digunakan
- Backend: `php artisan serve --port=5001` (lalu update frontend .env)
- Frontend: Vite akan otomatis mencari port yang tersedia

### Database error
- Pastikan MySQL berjalan
- Pastikan database `chat_system` sudah dibuat
- Periksa konfigurasi di file `.env`

