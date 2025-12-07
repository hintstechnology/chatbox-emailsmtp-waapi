# Fix: GraphQL 500 Error - createSession

## Masalah

Error 500 saat createSession terjadi karena:
1. **Auth guard tidak dikonfigurasi** - Error: "Auth guard [] is not defined"
2. **AttemptAuthentication middleware** mencoba menggunakan auth guard yang tidak ada

## Solusi yang Diterapkan

### 1. Buat Config Auth
✅ File `config/auth.php` sudah dibuat dengan konfigurasi default guard 'web'

### 2. Disable AttemptAuthentication Middleware
✅ Middleware `AttemptAuthentication` di-disable di `config/lighthouse.php` karena tidak diperlukan untuk public API

### 3. Custom CreateSession Mutation
✅ Dibuat `CreateSessionMutation` custom untuk handle `updateOrCreate` logic (jika session_id sudah ada, update; jika belum, create)

## File yang Diubah

1. ✅ `be/config/auth.php` - Auth configuration
2. ✅ `be/config/lighthouse.php` - Disable AttemptAuthentication middleware
3. ✅ `be/app/GraphQL/Mutations/CreateSessionMutation.php` - Custom mutation
4. ✅ `be/graphql/schema.graphql` - Update untuk menggunakan custom mutation

## Verifikasi

Test apakah error sudah teratasi:

```bash
# Test GraphQL mutation
curl -X POST http://localhost:5000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { createSession(input: { session_id: \"test123\", name: \"Test User\", email: \"test@test.com\", whatsapp: \"+1234567890\" }) { id session_id name } }"
  }'
```

## Jika Masih Error

1. **Clear cache**:
```bash
php artisan config:clear
php artisan cache:clear
```

2. **Check database connection**:
```bash
php artisan migrate:status
```

3. **Check logs**:
```bash
tail -f storage/logs/laravel.log
```

