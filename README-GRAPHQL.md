# Chat System - GraphQL Integration

## ✅ Perubahan yang Telah Dilakukan

### 1. Frontend (Port 5001)
- ✅ Port diubah dari 5000 ke **5001** di `vite.config.ts`
- ✅ Apollo Client diinstall dan dikonfigurasi
- ✅ GraphQL queries dan mutations dibuat di `fe/src/utils/graphql.ts`
- ✅ API service diupdate untuk menggunakan GraphQL di `fe/src/utils/api.ts`
- ✅ App dibungkus dengan ApolloProvider di `fe/src/main.tsx`

### 2. Backend (Port 5000)
- ✅ Lighthouse GraphQL diinstall
- ✅ GraphQL schema dibuat di `be/graphql/schema.graphql`
- ✅ Resolvers dibuat:
  - `MessagesQuery` - Query untuk mendapatkan messages
  - `AdminSessionsQuery` - Query untuk mendapatkan sessions (admin)
- ✅ Mutations dibuat:
  - `AdminReplyMutation` - Admin reply ke session
  - `FinishSessionMutation` - Finish session
- ✅ Custom fields dibuat:
  - `UnreadCountField` - Menghitung unread messages
  - `TimestampField` - Convert timestamp ke milliseconds
- ✅ CORS dikonfigurasi untuk port 5001

### 3. Database MySQL
- ✅ Migrations sudah dibuat untuk tabel `sessions` dan `messages`
- ✅ Dokumentasi setup database di `be/DATABASE-SETUP.md`

## 🚀 Quick Start

### 1. Setup Database

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

### 2. Run Migrations

```bash
cd be
php artisan migrate
```

### 3. Start Backend

```bash
cd be
php artisan serve --port=5000
```

GraphQL endpoint: `http://localhost:5000/graphql`

### 4. Start Frontend

```bash
cd fe
npm install  # Jika belum
npm run dev
```

Frontend: `http://localhost:5001`

## 📡 GraphQL Endpoints

### Queries
- `sessions` - Get all sessions
- `session(sessionId: String!)` - Get single session
- `messages(sessionId: String!)` - Get messages for session
- `adminSessions` - Get all sessions (admin view)

### Mutations
- `createSession(input: CreateSessionInput!)` - Create new session
- `sendMessage(input: SendMessageInput!)` - Send user message
- `adminReply(input: AdminReplyInput!)` - Admin reply to session
- `finishSession(sessionId: String!)` - Mark session as finished

## 🔄 CRUD Operations

Semua CRUD operations sudah terhubung:

### Create
- ✅ Create Session (via GraphQL mutation)
- ✅ Send Message (via GraphQL mutation)
- ✅ Admin Reply (via GraphQL mutation)

### Read
- ✅ Get Sessions (via GraphQL query)
- ✅ Get Messages (via GraphQL query)
- ✅ Get Admin Sessions (via GraphQL query)

### Update
- ✅ Finish Session (via GraphQL mutation)
- ✅ Assign Admin (otomatis saat admin reply)

### Delete
- Tidak diperlukan untuk chat system

## 📁 File Structure

```
be/
├── graphql/
│   └── schema.graphql          # GraphQL schema
├── app/
│   ├── GraphQL/
│   │   ├── Queries/
│   │   │   ├── MessagesQuery.php
│   │   │   └── AdminSessionsQuery.php
│   │   ├── Mutations/
│   │   │   ├── AdminReplyMutation.php
│   │   │   └── FinishSessionMutation.php
│   │   └── Fields/
│   │       ├── UnreadCountField.php
│   │       └── TimestampField.php
│   └── Models/
│       ├── Session.php
│       └── Message.php
└── config/
    └── cors.php                 # CORS config (updated)

fe/
├── src/
│   ├── utils/
│   │   ├── graphql.ts          # GraphQL client & queries
│   │   └── api.ts              # API service (updated to GraphQL)
│   └── main.tsx                # ApolloProvider wrapper
└── vite.config.ts             # Port 5001
```

## 🧪 Testing

### Test GraphQL Endpoint

```bash
curl -X POST http://localhost:5000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ sessions { id name email } }"}'
```

### Test Frontend

1. Buka `http://localhost:5001`
2. Klik "Contact Us Now"
3. Isi form dan start chat
4. Test semua fungsi CRUD

## 📚 Dokumentasi Lengkap

- `GRAPHQL-SETUP.md` - Setup guide lengkap
- `be/DATABASE-SETUP.md` - Database setup guide

## ⚠️ Catatan Penting

1. **Database harus dibuat terlebih dahulu** sebelum menjalankan migrations
2. **Backend harus berjalan** sebelum frontend bisa berfungsi
3. **Port 5000 untuk backend**, **port 5001 untuk frontend**
4. Semua data disimpan di **MySQL database**

