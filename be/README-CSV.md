# ✅ Sistem CSV Storage dengan End-to-End Encryption

## 🎉 Migrasi Selesai!

Sistem chat sekarang menggunakan **CSV storage** dengan **end-to-end encryption**. Tidak perlu setup database MySQL lagi!

## 📁 Format File

File CSV disimpan di folder `be/database/` dengan format:
```
[datetime]-[chatbox email]-[session]-chathistory.csv
```

**Contoh:**
```
2025-12-07_14-30-45-user@example.com-session123-chathistory.csv
```

## 🔐 End-to-End Encryption

### Data yang Dienkripsi:
- ✅ `session_id`
- ✅ `name` (nama user)
- ✅ `email` (email user)
- ✅ `whatsapp` (nomor WhatsApp)
- ✅ `text` (isi pesan)
- ✅ `admin_name`, `admin_email`, `admin_avatar`

### Keamanan:
- Menggunakan **Laravel Crypt** (AES-256)
- Menggunakan `APP_KEY` dari `.env` untuk enkripsi
- Dekripsi otomatis saat dibaca
- Data tidak bisa dibaca langsung dari file CSV

## 🚀 Cara Menggunakan

### 1. Pastikan APP_KEY Sudah Di-generate
```bash
php artisan key:generate
```

### 2. Folder Database Akan Otomatis Dibuat
Folder `be/database/` akan dibuat otomatis saat pertama kali digunakan.

### 3. Test Sistem
```bash
# Start server
php artisan serve --port=5000 --host=127.0.0.1

# Buka frontend di http://localhost:5001
# Coba buat session baru
```

### 4. Check File CSV
Setelah ada session baru, check folder:
```bash
ls be/database/
# Akan ada file: [datetime]-[email]-[session]-chathistory.csv
```

## 📦 Backup & Restore

### Backup
```bash
# Windows
xcopy be\database backup\database-%date:~-4,4%%date:~-7,2%%date:~-10,2% /E /I

# Linux/Mac
cp -r be/database/ backup/database-$(date +%Y%m%d)/
```

### Restore
```bash
# Windows
xcopy backup\database-20251207\* be\database\ /E /I

# Linux/Mac
cp -r backup/database-20251207/* be/database/
```

## ⚠️ Catatan Penting

1. **JANGAN UBAH `APP_KEY`** setelah ada data CSV
   - Jika diubah, semua data tidak bisa didekripsi
   - Backup `APP_KEY` juga penting!

2. **Backup Rutin**
   - Backup folder `database/` secara rutin
   - File CSV adalah satu-satunya sumber data

3. **Jangan Edit Manual**
   - Jangan edit file CSV secara manual
   - Data terenkripsi dan format harus konsisten

4. **Email Recipients**
   - Masih menggunakan database (untuk konfigurasi admin)
   - Chat history menggunakan CSV (untuk portability)

## 🔧 Troubleshooting

### File tidak terbuat
- Pastikan folder `be/database/` ada dan writable
- Check permission: `chmod 755 be/database/` (Linux)

### Error enkripsi/dekripsi
- Pastikan `APP_KEY` sudah di-generate: `php artisan key:generate`
- Jangan ubah `APP_KEY` setelah ada data

### File terlalu besar
- Setiap session memiliki file sendiri
- Pertimbangkan archive file lama untuk performa

## 📊 Struktur Data

Setiap file CSV berisi:
1. **Header row** - Nama kolom
2. **Session row** - Data session (encrypted)
3. **Message rows** - Setiap pesan sebagai baris baru (encrypted)

## ✨ Keuntungan

✅ **Tidak perlu setup database** - Langsung bisa digunakan  
✅ **Portable** - Mudah dipindahkan antar server  
✅ **End-to-end encryption** - Data aman di level file  
✅ **Backup mudah** - Cukup copy folder  
✅ **Tidak perlu konfigurasi** - Tidak perlu setup MySQL  

## 🎯 Status

- ✅ CSV Storage - **DONE**
- ✅ End-to-End Encryption - **DONE**
- ✅ GraphQL Integration - **DONE**
- ✅ Email Service Integration - **DONE**

**Sistem siap digunakan!** 🚀

