# 📡 VocalSpace - API Documentation

Complete API reference for VocalSpace backend.

## 🔗 Base URL

```
Development: http://localhost:8000/api
Production: https://api.yourdomain.com/api
```

## 🔐 Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## 📚 Endpoints

### Authentication

#### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "fullName": "John Doe"
}
```

**Response:** `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "user",
    "profileCompleted": false
  }
}
```

**Errors:**
- `400` - Email already registered
- `422` - Validation error

---

#### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:** `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "user",
    "profileCompleted": true
  }
}
```

**Errors:**
- `401` - Invalid credentials
- `422` - Validation error

---

### User Profile

#### Complete Profile
```http
POST /user/profile/complete
```
🔒 **Requires Authentication**

**Request Body:**
```json
{
  "fullName": "John Doe",
  "mobile": "+1234567890",
  "age": 25,
  "gender": "male",
  "nativeLanguage": "English",
  "speechDisorderType": "stuttering",
  "currentSeverity": "moderate",
  "therapyGoal": "Improve fluency and confidence",
  "interests": "Sports, music, technology",
  "troubleSounds": "/S/, /R/, /TH/"
}
```

**Response:** `200 OK`
```json
{
  "message": "Profile completed successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "user",
    "profileCompleted": true
  }
}
```

**Errors:**
- `401` - Unauthorized
- `422` - Validation error

---

#### Get Recommendations
```http
GET /user/recommendations
```
🔒 **Requires Authentication**

**Response:** `200 OK`
```json
{
  "sentences": [
    "She sells seashells by the seashore.",
    "The red rabbit ran rapidly around the roses.",
    "Sally's sister sings silly songs on Sundays.",
    "Three thick things think thoughtfully together.",
    "Peter Piper picked a peck of pickled peppers."
  ]
}
```

**Errors:**
- `401` - Unauthorized

---

#### Get User Stats
```http
GET /user/stats
```
🔒 **Requires Authentication**

**Response:** `200 OK`
```json
{
  "streak": 7,
  "xp": 450,
  "accuracy": 85,
  "totalSessions": 23
}
```

**Errors:**
- `401` - Unauthorized

---

#### Get Progress Data
```http
GET /user/progress
```
🔒 **Requires Authentication**

**Response:** `200 OK`
```json
{
  "accuracyTrend": [
    { "date": "2026-01-01", "accuracy": 75 },
    { "date": "2026-01-02", "accuracy": 78 },
    { "date": "2026-01-03", "accuracy": 82 }
  ],
  "phonemeErrors": [
    { "phoneme": "/S/", "errors": 15 },
    { "phoneme": "/R/", "errors": 12 },
    { "phoneme": "/TH/", "errors": 8 }
  ],
  "recentSessions": [
    {
      "date": "2026-01-03 14:30",
      "sentencesCompleted": 1,
      "accuracy": 82
    }
  ]
}
```

**Errors:**
- `401` - Unauthorized

---

### AI Analysis

#### Analyze Speech
```http
POST /ai/analyze
```
🔒 **Requires Authentication**

**Request:** `multipart/form-data`
```
audio: <audio_file.wav>
text: "She sells seashells by the seashore"
```

**Response:** `200 OK`
```json
{
  "accuracy": 85,
  "weakPhonemes": ["/S/", "/SH/"],
  "feedback": "Good job! Your pronunciation is improving. Pay special attention to: /S/, /SH/.",
  "phonemeScores": [
    {
      "phoneme": "SH",
      "word": "she",
      "score": 0.82,
      "start": 0.0,
      "end": 0.12
    },
    {
      "phoneme": "IY",
      "word": "she",
      "score": 0.91,
      "start": 0.12,
      "end": 0.35
    }
  ]
}
```

**Errors:**
- `401` - Unauthorized
- `422` - Invalid file format
- `500` - Analysis failed

---

### Admin

#### Get Platform Stats
```http
GET /admin/stats
```
🔒 **Requires Admin Role**

**Response:** `200 OK`
```json
{
  "totalPatients": 150,
  "activeToday": 45,
  "avgImprovement": 78,
  "totalSessions": 3420
}
```

**Errors:**
- `401` - Unauthorized
- `403` - Forbidden (not admin)

---

#### Get Patients List
```http
GET /admin/patients
```
🔒 **Requires Admin Role**

**Response:** `200 OK`
```json
{
  "patients": [
    {
      "id": 1,
      "name": "John Doe",
      "disorder": "stuttering",
      "sessions": 23,
      "accuracy": 85,
      "lastActive": "2026-02-05"
    },
    {
      "id": 2,
      "name": "Jane Smith",
      "disorder": "articulation",
      "sessions": 15,
      "accuracy": 72,
      "lastActive": "2026-02-04"
    }
  ]
}
```

**Errors:**
- `401` - Unauthorized
- `403` - Forbidden (not admin)

---

## 📊 Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 422 | Validation Error |
| 500 | Internal Server Error |

## 🔒 Security

### JWT Token Structure

```json
{
  "sub": "1",
  "email": "user@example.com",
  "exp": 1738800000
}
```

### Token Expiration

- Default: 7 days (10080 minutes)
- Configurable in `.env`: `ACCESS_TOKEN_EXPIRE_MINUTES`

### Password Requirements

- Minimum 8 characters
- Hashed with bcrypt
- Salt rounds: 12

## 📝 Request Examples

### cURL

```bash
# Register
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","fullName":"John Doe"}'

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Get Stats (with token)
curl -X GET http://localhost:8000/api/user/stats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Analyze Speech
curl -X POST http://localhost:8000/api/ai/analyze \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "audio=@recording.wav" \
  -F "text=She sells seashells"
```

### JavaScript (Axios)

```javascript
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Register
const register = async () => {
  const { data } = await api.post('/auth/register', {
    email: 'user@example.com',
    password: 'password123',
    fullName: 'John Doe'
  })
  return data
}

// Login
const login = async () => {
  const { data } = await api.post('/auth/login', {
    email: 'user@example.com',
    password: 'password123'
  })
  // Store token
  localStorage.setItem('token', data.token)
  return data
}

// Get Stats (with token)
const getStats = async () => {
  const token = localStorage.getItem('token')
  const { data } = await api.get('/user/stats', {
    headers: { Authorization: `Bearer ${token}` }
  })
  return data
}

// Analyze Speech
const analyzeAudio = async (audioBlob, text) => {
  const token = localStorage.getItem('token')
  const formData = new FormData()
  formData.append('audio', audioBlob, 'recording.wav')
  formData.append('text', text)
  
  const { data } = await api.post('/ai/analyze', formData, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  })
  return data
}
```

### Python (Requests)

```python
import requests

BASE_URL = 'http://localhost:8000/api'

# Register
def register():
    response = requests.post(f'{BASE_URL}/auth/register', json={
        'email': 'user@example.com',
        'password': 'password123',
        'fullName': 'John Doe'
    })
    return response.json()

# Login
def login():
    response = requests.post(f'{BASE_URL}/auth/login', json={
        'email': 'user@example.com',
        'password': 'password123'
    })
    data = response.json()
    return data['token']

# Get Stats
def get_stats(token):
    headers = {'Authorization': f'Bearer {token}'}
    response = requests.get(f'{BASE_URL}/user/stats', headers=headers)
    return response.json()

# Analyze Speech
def analyze_audio(token, audio_path, text):
    headers = {'Authorization': f'Bearer {token}'}
    files = {'audio': open(audio_path, 'rb')}
    data = {'text': text}
    response = requests.post(
        f'{BASE_URL}/ai/analyze',
        headers=headers,
        files=files,
        data=data
    )
    return response.json()
```

## 🧪 Testing

### Swagger UI

Interactive API documentation available at:
```
http://localhost:8000/docs
```

Features:
- Try out endpoints
- View request/response schemas
- Test authentication
- Download OpenAPI spec

### ReDoc

Alternative documentation at:
```
http://localhost:8000/redoc
```

## 📈 Rate Limiting

Currently no rate limiting implemented. For production, consider:

```python
# Install
pip install slowapi

# Add to main.py
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.post("/api/auth/login")
@limiter.limit("5/minute")
async def login():
    ...
```

## 🔄 Webhooks (Future)

Planned webhook events:
- `session.completed` - Practice session finished
- `profile.updated` - User profile changed
- `recommendation.generated` - New sentences created

## 📊 Analytics Events (Future)

Track user actions:
- Page views
- Button clicks
- Session duration
- Feature usage

## 🌐 CORS Configuration

Allowed origins configured in `.env`:
```env
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com
```

## 📝 Notes

- All timestamps are in UTC
- File uploads limited to 50MB
- Audio files must be WAV format
- Supported sample rates: 16kHz, 44.1kHz, 48kHz
- Maximum sentence length: 500 characters

## 🔮 Future Endpoints

Planned additions:
- `GET /user/achievements` - User achievements
- `POST /user/feedback` - Submit feedback
- `GET /phonemes` - Phoneme library
- `POST /sessions/share` - Share session
- `GET /leaderboard` - Global leaderboard
- `POST /therapist/assign` - Assign therapist
- `GET /reports/export` - Export progress report

---

**API Version:** 1.0.0  
**Last Updated:** February 5, 2026

For issues or questions, check the [GitHub repository](https://github.com/yourusername/vocalspace).
