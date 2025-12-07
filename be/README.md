# Chat System Backend (Laravel)

## Setup

1. Install dependencies:
```bash
composer install
```

2. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

3. Generate application key:
```bash
php artisan key:generate
```

4. Configure database in `.env`:
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=chat_system
DB_USERNAME=root
DB_PASSWORD=
```

5. Run migrations:
```bash
php artisan migrate
```

6. Start the server:
```bash
php artisan serve --port=5000
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Sessions
- `POST /api/v1/sessions` - Create a new session
- `GET /api/v1/sessions` - Get all sessions

### Messages
- `POST /api/v1/messages` - Send a message
- `GET /api/v1/messages/{sessionId}` - Get messages for a session

### Admin
- `GET /api/v1/admin/sessions` - Get all sessions (admin)
- `POST /api/v1/admin/reply` - Send admin reply
- `POST /api/v1/admin/finish-session` - Finish a session

