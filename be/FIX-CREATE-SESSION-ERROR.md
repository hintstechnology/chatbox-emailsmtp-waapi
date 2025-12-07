# Fix: Create Session Error

## Masalah
Error "Internal server error" saat create session.

## Perbaikan yang Dilakukan

### 1. ✅ Error Handling di CreateSessionMutation
- Ditambahkan validasi untuk `$args['input']`
- Ditambahkan validasi required fields
- Ditambahkan try-catch dengan logging

### 2. ✅ Perbaikan readSession
- Skip header row saat membaca CSV
- Fallback values untuk decrypt yang gagal
- Validasi file exists

### 3. ✅ Perbaikan writeCsvRow
- Pastikan header ditulis dengan benar
- Format konsisten antara write dan read

## Testing

Setelah perbaikan, test dengan:

1. **Restart server:**
```bash
php artisan serve --port=5000 --host=127.0.0.1
```

2. **Test create session:**
- Buka frontend di `http://localhost:5001`
- Isi form chat
- Submit

3. **Check log jika masih error:**
```bash
tail -f storage/logs/laravel.log
```

4. **Check file CSV:**
```bash
ls database/
# Harus ada file baru dengan format: [datetime]-[email]-[session]-chathistory.csv
```

## Troubleshooting

### Masih error?
1. Check `APP_KEY` sudah di-generate: `php artisan key:generate`
2. Check folder `database/` writable
3. Check log: `storage/logs/laravel.log`

### File CSV tidak terbuat?
- Pastikan folder `database/` ada dan writable
- Check permission: `chmod 755 database/` (Linux)

