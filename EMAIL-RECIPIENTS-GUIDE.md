# Email Recipients Management Guide

## Overview

Sistem email recipients memungkinkan admin untuk mengelola email-email yang akan menerima notifikasi dari chatbox. Setiap pesan yang dikirim user melalui chatbox akan dikirim ke semua email recipients yang aktif.

## Fitur

### 1. Email Recipients Management
- ✅ Tambah email recipient baru
- ✅ Edit email recipient (nama, status aktif/non-aktif)
- ✅ Hapus email recipient
- ✅ Set primary email recipient
- ✅ Toggle aktif/non-aktif email recipient

### 2. Primary Email
- Email yang ditandai sebagai "Primary" akan selalu menerima notifikasi
- Hanya satu email yang bisa menjadi primary pada satu waktu
- Jika tidak ada primary, semua email aktif akan menerima notifikasi

## Cara Menggunakan

### 1. Setup Database

Jalankan migration:
```bash
cd be
php artisan migrate
```

Atau import SQL file:
```bash
mysql -u root -p chat_system < be/database.sql
```

### 2. Akses Admin Panel

1. Buka `http://localhost:5001/admin`
2. Klik tab **"Email Recipients"**
3. Tambah email recipients yang akan menerima notifikasi

### 3. Tambah Email Recipient

1. Masukkan email address (required)
2. Masukkan nama (optional)
3. Pilih "Active" untuk mengaktifkan
4. Pilih "Set as Primary" jika ingin menjadikannya primary
5. Klik "Add Email Recipient"

### 4. Manage Email Recipients

- **Set Primary**: Klik icon star untuk menjadikan email sebagai primary
- **Toggle Active**: Klik icon check untuk mengaktifkan/nonaktifkan
- **Delete**: Klik icon trash untuk menghapus

## Flow Email Notification

### User Mengirim Pesan
1. User mengirim pesan melalui chatbox
2. Pesan disimpan ke database MySQL
3. Sistem mengambil semua **active email recipients** dari database
4. Email notification dikirim ke semua email recipients yang aktif
5. Jika ada primary email, primary akan selalu menerima

### Admin Reply
- Email dikirim langsung ke user (tidak menggunakan recipients)

### Session Finished
- Email summary dikirim langsung ke user (tidak menggunakan recipients)

## Database Schema

```sql
CREATE TABLE email_recipients (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NULL,
  is_active TINYINT(1) DEFAULT 1,
  is_primary TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL
);
```

## GraphQL API

### Queries
- `emailRecipients` - Get all email recipients
- `activeEmailRecipients` - Get only active recipients

### Mutations
- `createEmailRecipient` - Add new recipient
- `updateEmailRecipient` - Update recipient
- `deleteEmailRecipient` - Delete recipient
- `setPrimaryEmailRecipient` - Set primary recipient

## Default Email

Saat pertama kali setup, default email `chatbox@hintstechnology.com` akan otomatis ditambahkan sebagai primary recipient.

## Troubleshooting

### Email tidak terkirim
1. Pastikan ada minimal 1 email recipient yang aktif
2. Check SMTP configuration di `.env`
3. Check logs di `storage/logs/laravel.log`

### Primary email tidak berfungsi
1. Pastikan primary email adalah active
2. Reload email recipients di admin panel

### Email duplicate
- Email harus unique, tidak bisa ada duplikat

