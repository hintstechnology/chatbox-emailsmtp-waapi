# GraphQL Setup Guide

## ✅ Yang Sudah Dikonfigurasi

1. **Backend (Laravel + Lighthouse)**
   - GraphQL endpoint: `http://localhost:5000/graphql`
   - Schema sudah dibuat di `be/graphql/schema.graphql`
   - Resolvers dan Mutations sudah dibuat

2. **Frontend (React + Apollo Client)**
   - Apollo Client sudah dikonfigurasi
   - GraphQL queries dan mutations sudah dibuat
   - Port frontend: `5001`

## 🚀 Cara Menjalankan

### 1. Setup Database MySQL

Lihat file `be/DATABASE-SETUP.md` untuk instruksi lengkap.

**Quick Setup:**
```sql
CREATE DATABASE chat_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Edit `be/.env`:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=chat_system
DB_USERNAME=root
DB_PASSWORD=your_password
```

Jalankan migrations:
```bash
cd be
php artisan migrate
```

### 2. Jalankan Backend

```bash
cd be
php artisan serve --port=5000
```

Backend akan berjalan di: `http://localhost:5000`
GraphQL endpoint: `http://localhost:5000/graphql`

### 3. Jalankan Frontend

```bash
cd fe
npm install  # Jika belum install dependencies
npm run dev
```

Frontend akan berjalan di: `http://localhost:5001`

## 📝 GraphQL Queries & Mutations

### Queries

**Get All Sessions:**
```graphql
query {
  sessions {
    id
    session_id
    name
    email
    whatsapp
    status
    unread_count
  }
}
```

**Get Messages:**
```graphql
query {
  messages(sessionId: "session_123") {
    id
    type
    text
    timestamp
    admin_name
  }
}
```

**Get Admin Sessions:**
```graphql
query {
  adminSessions {
    id
    session_id
    name
    email
    status
    unread_count
  }
}
```

### Mutations

**Create Session:**
```graphql
mutation {
  createSession(input: {
    session_id: "session_123"
    name: "John Doe"
    email: "john@example.com"
    whatsapp: "+1234567890"
    environment: "testing-mock"
  }) {
    id
    session_id
    name
  }
}
```

**Send Message:**
```graphql
mutation {
  sendMessage(input: {
    session_id: "session_123"
    text: "Hello, this is a test message"
  }) {
    id
    text
    timestamp
  }
}
```

**Admin Reply:**
```graphql
mutation {
  adminReply(input: {
    session_id: "session_123"
    message: "Hello, how can I help you?"
    admin_name: "Admin Name"
    admin_email: "admin@example.com"
    admin_avatar: "👤"
  }) {
    id
    text
    admin_name
  }
}
```

**Finish Session:**
```graphql
mutation {
  finishSession(sessionId: "session_123") {
    id
    status
  }
}
```

## 🧪 Testing GraphQL

### Menggunakan Browser

Buka: `http://localhost:5000/graphql`

Atau gunakan GraphQL Playground (jika diinstall):
```bash
composer require mllm/laravel-graphql-playground
php artisan vendor:publish --tag=graphql-playground-config
```

### Menggunakan cURL

```bash
curl -X POST http://localhost:5000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ sessions { id name email } }"}'
```

## 🔧 Troubleshooting

### Error: "Class not found"
- Jalankan: `composer dump-autoload`

### Error: "Route not found"
- Pastikan Lighthouse sudah terpublish: `php artisan vendor:publish --tag=lighthouse-config`

### Error: "Schema validation failed"
- Periksa file `be/graphql/schema.graphql` untuk syntax errors

### CORS Error
- Pastikan `be/config/cors.php` sudah dikonfigurasi dengan port 5001

## 📚 Dokumentasi

- Lighthouse: https://lighthouse-php.com/
- Apollo Client: https://www.apollographql.com/docs/react/

