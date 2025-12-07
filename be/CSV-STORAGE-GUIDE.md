# CSV Storage dengan End-to-End Encryption

## Overview

Sistem chat sekarang menggunakan **CSV storage** dengan **end-to-end encryption** untuk menyimpan semua chat history. Tidak perlu setup database MySQL lagi!

## Format File

File CSV disimpan di folder `database/` dengan format:
```
[datetime]-[chatbox email]-[session]-chathistory.csv
```

Contoh:
```
2025-12-07_14-30-45-user@example.com-session123-chathistory.csv
```

## Struktur File CSV

Setiap file CSV berisi:
1. **Header row** - Kolom: `type`, `session_id`, `name`, `email`, `whatsapp`, `environment`, `assigned_admin`, `status`, `created_at`, `updated_at`
2. **Session row** - Data session (baris pertama setelah header)
3. **Message rows** - Setiap pesan ditambahkan sebagai baris baru

## Enkripsi End-to-End

### Fitur Keamanan

1. **Semua data sensitif dienkripsi:**
   - `session_id`
   - `name`
   - `email`
   - `whatsapp`
   - `text` (isi pesan)
   - `admin_name`, `admin_email`, `admin_avatar`

2. **Menggunakan Laravel Crypt:**
   - Menggunakan `APP_KEY` dari `.env` untuk enkripsi
   - AES-256 encryption
   - Setiap field dienkripsi secara terpisah

3. **Dekripsi otomatis:**
   - Data didekripsi saat dibaca
   - Transparan untuk aplikasi (enkripsi/dekripsi otomatis)

## Lokasi File

```
be/
└── database/
    ├── 2025-12-07_14-30-45-user@example.com-session123-chathistory.csv
    ├── 2025-12-07_15-20-10-another@example.com-session456-chathistory.csv
    └── ...
```

## Keuntungan

1. ✅ **Tidak perlu setup database** - File CSV langsung bisa digunakan
2. ✅ **Portable** - Mudah dipindahkan antar server (copy folder `database/`)
3. ✅ **End-to-end encryption** - Data aman di level file
4. ✅ **Backup mudah** - Cukup backup folder `database/`
5. ✅ **Tidak perlu konfigurasi** - Tidak perlu setup MySQL connection

## Cara Backup

```bash
# Backup semua chat history
cp -r be/database/ backup/database-$(date +%Y%m%d)/

# Atau di Windows
xcopy be\database backup\database-%date:~-4,4%%date:~-7,2%%date:~-10,2% /E /I
```

## Cara Restore

```bash
# Restore dari backup
cp -r backup/database-20251207/* be/database/

# Atau di Windows
xcopy backup\database-20251207\* be\database\ /E /I
```

## Migrasi dari MySQL ke CSV

Jika sebelumnya menggunakan MySQL, data akan otomatis menggunakan CSV untuk session baru. Data lama di MySQL tidak akan terpengaruh.

## Troubleshooting

### File tidak terbuat
- Pastikan folder `database/` ada dan writable
- Check permission folder: `chmod 755 database/` (Linux) atau pastikan folder tidak read-only (Windows)

### Error enkripsi/dekripsi
- Pastikan `APP_KEY` di `.env` sudah di-generate: `php artisan key:generate`
- Jangan ubah `APP_KEY` setelah ada data, atau data tidak bisa didekripsi

### File terlalu besar
- Setiap session memiliki file sendiri
- File akan bertambah besar seiring banyaknya pesan
- Untuk performa lebih baik, pertimbangkan archive file lama

## Catatan Penting

⚠️ **JANGAN UBAH `APP_KEY`** setelah ada data CSV, karena semua data akan tidak bisa didekripsi!

⚠️ **Backup folder `database/`** secara rutin untuk mencegah kehilangan data.

⚠️ **Jangan edit file CSV secara manual** karena data terenkripsi dan format harus konsisten.

