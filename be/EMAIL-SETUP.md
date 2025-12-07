# Email SMTP Setup

## Konfigurasi SMTP

Edit file `be/.env` dan tambahkan konfigurasi berikut:

```env
MAIL_MAILER=smtp
MAIL_HOST=mail.hintstechnology.com
MAIL_PORT=465
MAIL_USERNAME=chatbox@hintstechnology.com
MAIL_PASSWORD=@@chatbox123
MAIL_ENCRYPTION=ssl
MAIL_FROM_ADDRESS=chatbox@hintstechnology.com
MAIL_FROM_NAME="${APP_NAME}"

# Admin email untuk menerima notifikasi
ADMIN_EMAIL=chatbox@hintstechnology.com
```

## Cara Kerja Email Notification

### 1. User Message (sendMessage)
- **Flow**: User mengirim pesan → Disimpan ke database → Email dikirim ke admin
- **Email Template**: `resources/views/emails/new-message.blade.php`
- **Recipient**: Admin email (dari config `ADMIN_EMAIL`)

### 2. Admin Reply (adminReply)
- **Flow**: Admin membalas → Disimpan ke database → Email dikirim ke user
- **Email Template**: `resources/views/emails/admin-reply.blade.php`
- **Recipient**: User email (dari session)

### 3. Session Finished (finishSession)
- **Flow**: Admin finish session → Status diupdate → Email summary dikirim ke user
- **Email Template**: `resources/views/emails/session-finished.blade.php`
- **Recipient**: User email (dari session)

## Testing Email

### Test dengan Tinker

```bash
php artisan tinker
```

```php
use App\Services\EmailService;
use App\Models\Session;
use App\Models\Message;

$session = Session::first();
$message = Message::where('type', 'user')->first();

$emailService = new EmailService();
$emailService->sendNewMessageNotification($message, $session);
```

### Test dengan Mail Log (Development)

Untuk development, gunakan mail log driver:

```env
MAIL_MAILER=log
```

Email akan disimpan di `storage/logs/laravel.log`

## Troubleshooting

### Error: "Connection could not be established"
- Pastikan SMTP host dan port benar
- Pastikan firewall tidak memblokir port 465
- Coba gunakan port 587 dengan TLS jika SSL tidak bekerja

### Error: "Authentication failed"
- Periksa username dan password di `.env`
- Pastikan password tidak ada spasi di awal/akhir
- Pastikan account email aktif

### Email tidak terkirim
- Check `storage/logs/laravel.log` untuk error details
- Pastikan queue worker berjalan jika menggunakan queue
- Test dengan mail log driver terlebih dahulu

## Catatan Penting

1. **Database First**: Semua chat disimpan ke database TERLEBIH DAHULU sebelum email dikirim
2. **Error Handling**: Jika email gagal dikirim, proses tetap berhasil (chat sudah tersimpan)
3. **Logging**: Semua aktivitas email di-log untuk debugging

