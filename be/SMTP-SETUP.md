# SMTP Configuration Guide

## Setup SMTP untuk Email Notifications

### 1. Konfigurasi di `.env` file

Tambahkan atau update konfigurasi berikut di file `be/.env`:

```env
MAIL_MAILER=smtp
MAIL_HOST=mail.hintstechnology.com
MAIL_PORT=465
MAIL_USERNAME=chatbox@hintstechnology.com
MAIL_PASSWORD=@@chatbox123
MAIL_ENCRYPTION=ssl
MAIL_FROM_ADDRESS=chatbox@hintstechnology.com
MAIL_FROM_NAME="Chat System"
```

### 2. Pastikan file `.env` ada

Jika file `.env` tidak ada, copy dari `.env.example`:

```bash
cd be
copy .env.example .env
```

### 3. Generate Application Key (jika belum)

```bash
php artisan key:generate
```

### 4. Clear Config Cache

Setelah mengubah `.env`, clear config cache:

```bash
php artisan config:clear
php artisan cache:clear
```

### 5. Test Email Configuration

Untuk test apakah SMTP sudah berfungsi, cek log di:
- `be/storage/logs/laravel.log`

Atau test dengan membuat session baru dan kirim pesan, lalu cek apakah email terkirim.

### 6. Troubleshooting

Jika email tidak terkirim:

1. **Cek log Laravel**: `be/storage/logs/laravel.log`
2. **Pastikan SMTP credentials benar**: Username dan password harus sesuai
3. **Cek firewall**: Pastikan port 465 tidak di-block
4. **Test koneksi SMTP**: Gunakan tool seperti `telnet` atau `openssl` untuk test koneksi ke `mail.hintstechnology.com:465`

### 7. Email Recipients

Pastikan ada email recipients yang aktif di admin panel:
- Buka `/admin`
- Tab "Email Recipients"
- Tambahkan email yang akan menerima notifikasi
- Pastikan status "Active" dan set sebagai "Primary" jika perlu

