# Frontend Troubleshooting Guide

## Error: "Failed to resolve import @apollo/client"

### Solusi

1. **Pastikan package sudah terinstall**:
```bash
cd fe
npm install @apollo/client graphql
```

2. **Clear Vite cache**:
```bash
# Windows PowerShell
Remove-Item -Path "node_modules\.vite" -Recurse -Force -ErrorAction SilentlyContinue

# Atau hapus folder manual:
# node_modules/.vite
```

3. **Restart dev server**:
```bash
# Stop server (Ctrl+C)
npm run dev
```

4. **Jika masih error, reinstall dependencies**:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Verifikasi

Check apakah package sudah terinstall:
```bash
npm list @apollo/client graphql
```

Harus menampilkan:
```
├─┬ @apollo/client@4.0.9
└── graphql@16.12.0
```

## Error: "Cannot find module"

### Solusi

1. **Clear semua cache**:
```bash
# Clear Vite cache
Remove-Item -Path "node_modules\.vite" -Recurse -Force

# Clear npm cache
npm cache clean --force

# Reinstall
npm install
```

2. **Check node_modules**:
```bash
Test-Path "node_modules\@apollo\client"
# Harus return: True
```

## Error: Port 5001 already in use

### Solusi

1. **Find process using port**:
```bash
netstat -ano | findstr :5001
```

2. **Kill process**:
```bash
taskkill /PID <PID> /F
```

3. **Atau gunakan port lain**:
Edit `vite.config.ts`:
```typescript
server: {
  port: 5002, // Change port
}
```

## Error: GraphQL connection failed

### Solusi

1. **Pastikan backend berjalan**:
```bash
# Check backend
curl http://localhost:5000/graphql
```

2. **Check environment variable**:
Buat file `fe/.env`:
```env
VITE_GRAPHQL_URL=http://localhost:5000/graphql
```

3. **Restart frontend**:
```bash
npm run dev
```

## Quick Fix Commands

```bash
# Clear all and reinstall
cd fe
Remove-Item -Path "node_modules\.vite" -Recurse -Force -ErrorAction SilentlyContinue
npm install
npm run dev
```

