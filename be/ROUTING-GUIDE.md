# Frontend Routing Guide

## Routes yang Tersedia

### 1. Home Page (`/`)
- **File**: `fe/src/App.tsx`
- **Deskripsi**: Landing page utama dengan hero section dan services
- **Fitur**:
  - Chat dialog (floating)
  - Navigation ke chatbox dan admin
  - Dark mode toggle

### 2. Chatbox Page (`/chatbox`)
- **File**: `fe/src/pages/ChatboxPage.tsx`
- **Deskripsi**: Halaman khusus untuk chatbox
- **Fitur**:
  - Full-screen chat interface
  - Navigation ke home dan admin
  - Dark mode toggle

### 3. Admin Page (`/admin`)
- **File**: `fe/src/admin/page.tsx`
- **Deskripsi**: Halaman admin untuk mengelola sessions dan messages
- **Fitur**:
  - List semua sessions
  - Chat interface untuk reply
  - Settings (admins, SMTP, theme)

## Cara Navigasi

### Dari Code
```typescript
// Navigate to home
(window as any).navigateTo('/');

// Navigate to chatbox
(window as any).navigateTo('/chatbox');

// Navigate to admin
(window as any).navigateTo('/admin');
```

### Dari Component
```typescript
const handleNavigate = () => {
  (window as any).navigateTo('/chatbox');
};
```

## Routing Implementation

Routing menggunakan simple client-side routing dengan:
- `window.location.pathname` untuk current route
- `window.history.pushState` untuk navigation
- `popstate` event untuk browser back/forward

## Future Improvements

Untuk production, pertimbangkan menggunakan:
- React Router (`react-router-dom`)
- Next.js routing (jika menggunakan Next.js)

