# Test Backend API

## Server Status
✅ Backend berjalan di port 5000

## Test Endpoints

### 1. Test Root
```bash
curl http://localhost:5000/
```
Expected: `{"message":"Chat System API"}`

### 2. Test Sessions (GET)
```bash
curl http://localhost:5000/api/v1/sessions
```
Expected: `{"sessions":[]}`

### 3. Test Create Session (POST)
```bash
curl -X POST http://localhost:5000/api/v1/sessions \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"test123\",\"name\":\"Test User\",\"email\":\"test@test.com\",\"whatsapp\":\"+1234567890\"}"
```

### 4. Test Messages (GET)
```bash
curl http://localhost:5000/api/v1/messages/test123
```

### 5. Test Send Message (POST)
```bash
curl -X POST http://localhost:5000/api/v1/messages \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"test123\",\"message\":\"Hello\"}"
```

## Browser Test

Buka di browser:
- http://localhost:5000/api/v1/sessions
- http://localhost:5000/

