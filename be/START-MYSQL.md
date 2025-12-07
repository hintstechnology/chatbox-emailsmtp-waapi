# Cara Start MySQL

## XAMPP (Windows)

1. Buka **XAMPP Control Panel**
2. Cari **MySQL** di list services
3. Klik tombol **"Start"**
4. Tunggu sampai status berubah menjadi **"Running"** (background hijau)

## WAMP (Windows)

1. Buka **WAMP Control Panel**
2. Klik icon WAMP di system tray
3. Pilih **"Start All Services"** atau **"Start MySQL"**

## Manual (Command Line)

### Check Status
```bash
netstat -ano | findstr :3306
```

Jika ada output, berarti MySQL sudah berjalan.

### Start via Service
```bash
net start MySQL80
# atau
net start MySQL
```

## Verifikasi MySQL Berjalan

```bash
# Test connection
mysql -u root -p

# Atau tanpa password
mysql -u root
```

Jika berhasil masuk ke MySQL prompt, berarti MySQL sudah berjalan.

## Troubleshooting

### Port 3306 sudah digunakan
- Pastikan hanya satu instance MySQL yang berjalan
- Check di Task Manager untuk proses `mysqld.exe`

### MySQL tidak start
- Check error log di XAMPP: `xampp/mysql/data/*.err`
- Pastikan tidak ada konflik port
- Restart komputer jika perlu

