# chatbox-emailsmtp-waapi

A full chatbox system with integration to SMTP mail server and WhatsApp API

## About

A complete chatbox system with:
- **Frontend Chatbox** (Port 5001) - Customer-facing chat interface
- **Frontend Admin** (Port 5002) - Admin dashboard for managing conversations
- **Backend Laravel** (Port 5000) - GraphQL API with CSV-based storage

## Features

- Real-time chat between customers and admins
- CSV-based storage for chat history (no database setup required)
- SMTP email notifications
- Email recipient management
- Admin dashboard for conversation management
- GraphQL API for all operations

## Project Structure

```
├── be/              # Laravel backend (Port 5000)
├── fe_chatbox/      # Chatbox frontend (Port 5001)
├── fe_admin/        # Admin frontend (Port 5002)
└── fe/              # Legacy frontend (can be removed)
```

## Quick Start

### Backend Setup

```bash
cd be
composer install
php artisan key:generate
php artisan serve --port=5000
```

### Frontend Setup

#### Chatbox Frontend
```bash
cd fe_chatbox
npm install
npm run dev
# Runs on http://localhost:5001
```

#### Admin Frontend
```bash
cd fe_admin
npm install
npm run dev
# Runs on http://localhost:5002
```

### Start All Services

Run `start-all.bat` to start all services at once.

## Configuration

### Backend Environment

Create `be/.env` file:
```
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:5000

# SMTP Configuration
MAIL_MAILER=smtp
MAIL_HOST=mail.hintstechnology.com
MAIL_PORT=465
MAIL_USERNAME=chatbox@hintstechnology.com
MAIL_PASSWORD=@@chatbox123
MAIL_ENCRYPTION=ssl
MAIL_FROM_ADDRESS=chatbox@hintstechnology.com
MAIL_FROM_NAME="${APP_NAME}"
```

### Frontend Environment (Optional)

Create `.env` files in `fe_chatbox` and `fe_admin`:
```
VITE_GRAPHQL_URL=http://localhost:5000/graphql
```

## License

GPL-3.0 license
