# Setup Email Recipients - Complete Guide

## ✅ Yang Sudah Dikonfigurasi

### 1. Database
- ✅ File SQL: `be/database.sql` - Complete database schema
- ✅ Migration: `be/database/migrations/2024_01_01_000003_create_email_recipients_table.php`
- ✅ Model: `be/app/Models/EmailRecipient.php`

### 2. Backend (GraphQL)
- ✅ GraphQL Schema updated dengan EmailRecipient type
- ✅ Queries: `emailRecipients`, `activeEmailRecipients`
- ✅ Mutations: `createEmailRecipient`, `updateEmailRecipient`, `deleteEmailRecipient`, `setPrimaryEmailRecipient`
- ✅ EmailService updated untuk menggunakan email dari database

### 3. Frontend Admin
- ✅ Tab "Email Recipients" di admin panel
- ✅ CRUD operations untuk email recipients
- ✅ Set primary email functionality
- ✅ Toggle active/inactive
- ✅ Real-time updates

## 🚀 Setup

### 1. Import Database

**Option A: Menggunakan Migration**
```bash
cd be
php artisan migrate
```

**Option B: Menggunakan SQL File**
```bash
mysql -u root -p chat_system < be/database.sql
```

### 2. Verifikasi Default Email

Setelah migration, default email `chatbox@hintstechnology.com` akan otomatis ditambahkan sebagai primary recipient.

### 3. Akses Admin Panel

1. Buka `http://localhost:5001/admin`
2. Klik tab **"Email Recipients"** (tab pertama)
3. Anda akan melihat default email recipient

## 📋 Cara Menggunakan

### Tambah Email Recipient Baru

1. Di tab "Email Recipients", scroll ke bawah
2. Masukkan:
   - **Email address** (required)
   - **Name** (optional)
   - Centang **Active** untuk mengaktifkan
   - Centang **Set as Primary** jika ingin primary
3. Klik **"Add Email Recipient"**

### Manage Email Recipients

- **Set Primary**: Klik icon ⭐ (star) untuk set sebagai primary
- **Toggle Active**: Klik icon ✓ untuk aktif/nonaktif
- **Delete**: Klik icon 🗑️ untuk hapus

### Primary Email

- Hanya satu email yang bisa menjadi primary
- Primary email akan selalu menerima notifikasi
- Jika tidak ada primary, semua email aktif akan menerima

## 🔄 Flow Email Notification

### User Mengirim Pesan
1. User kirim pesan → Disimpan ke database
2. Sistem ambil **semua active email recipients** dari database
3. Email dikirim ke semua recipients yang aktif
4. Primary email selalu menerima (jika ada)

### Contoh
Jika ada 3 email recipients aktif:
- `admin1@company.com` (primary)
- `admin2@company.com` (active)
- `admin3@company.com` (active)

Maka semua 3 email akan menerima notifikasi saat user kirim pesan.

## 📁 File Structure

```
be/
├── database.sql                                    # Complete SQL schema
├── database/
│   └── migrations/
│       └── 2024_01_01_000003_create_email_recipients_table.php
├── app/
│   ├── Models/
│   │   └── EmailRecipient.php
│   ├── Services/
│   │   └── EmailService.php                       # Updated untuk use database
│   └── GraphQL/
│       ├── Queries/
│       │   └── ActiveEmailRecipientsQuery.php
│       └── Mutations/
│           └── SetPrimaryEmailRecipientMutation.php
└── graphql/
    └── schema.graphql                             # Updated dengan EmailRecipient

fe/
├── src/
│   ├── admin/
│   │   └── page.tsx                               # Updated dengan Email Recipients tab
│   └── utils/
│       ├── api.ts                                 # Updated dengan email functions
│       └── graphql.ts                             # Updated dengan email queries/mutations
```

## 🧪 Testing

### Test Email Recipients

1. **Tambah email recipient baru**:
   - Email: `test@example.com`
   - Name: `Test Recipient`
   - Active: ✓
   - Primary: ✗

2. **Kirim pesan dari chatbox**:
   - Buka chatbox
   - Kirim pesan
   - Check email `test@example.com` dan semua email aktif lainnya

3. **Set Primary**:
   - Klik icon star pada email recipient
   - Email tersebut akan menjadi primary
   - Primary email akan selalu menerima notifikasi

### Test GraphQL

```graphql
# Get all email recipients
query {
  emailRecipients {
    id
    email
    name
    is_active
    is_primary
  }
}

# Create email recipient
mutation {
  createEmailRecipient(input: {
    email: "new@example.com"
    name: "New Recipient"
    is_active: true
    is_primary: false
  }) {
    id
    email
  }
}
```

## ⚠️ Catatan Penting

1. **Database First**: Email recipients disimpan di database MySQL
2. **Active Only**: Hanya email dengan `is_active = true` yang akan menerima notifikasi
3. **Primary Priority**: Primary email selalu menerima, ditambah semua email aktif lainnya
4. **No Duplicates**: Email address harus unique
5. **Fallback**: Jika tidak ada recipients, akan menggunakan default dari `.env`

## 📚 Dokumentasi

- `EMAIL-RECIPIENTS-GUIDE.md` - Detailed guide
- `be/database.sql` - Complete SQL schema
- GraphQL schema di `be/graphql/schema.graphql`

