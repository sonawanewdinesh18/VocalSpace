# VocalSpace Backend

FastAPI backend for VocalSpace - AI-Powered Speech Therapy Platform

## 🏗️ Architecture

```
backend/
├── app/
│   ├── api/
│   │   ├── routes/          # API endpoints
│   │   │   ├── auth.py      # Authentication
│   │   │   ├── user.py      # User operations
│   │   │   ├── admin.py     # Admin dashboard
│   │   │   └── ai.py        # AI analysis
│   │   └── dependencies.py  # Auth dependencies
│   ├── core/
│   │   ├── config.py        # Configuration
│   │   └── security.py      # JWT & password hashing
│   ├── db/
│   │   ├── database.py      # Database connection
│   │   ├── models.py        # SQLAlchemy models
│   │   └── init_db.py       # Database initialization
│   └── main.py              # FastAPI app
├── ai_engine/               # Separate AI module
│   ├── speech_analyzer.py   # Wav2Vec2 + forced alignment
│   ├── llm_recommender.py   # LLM sentence generation
│   └── __init__.py
├── uploads/                 # File storage
│   ├── audio/              # User recordings
│   └── profiles/           # Profile pictures
├── .env                     # Environment variables
├── requirements.txt         # Python dependencies
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Python 3.10+
- PostgreSQL 14+
- FFmpeg (for audio processing)
- Ollama (for LLM features)

### Installation

1. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

2. **Install dependencies**
```bash
pip install -r requirements.txt
```

3. **Setup PostgreSQL**
```bash
# Create database
createdb vocalspace

# Or using psql
psql -U postgres
CREATE DATABASE vocalspace;
\q
```

4. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your settings
```

5. **Initialize database**
```bash
python -m app.db.init_db
```

6. **Run the server**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

## 📚 API Documentation

Once running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 🔐 Default Credentials

```
Email: admin@vocalspace.com
Password: admin123
Role: therapist
```

**⚠️ Change these in production!**

## 🤖 AI Engine Setup

### Wav2Vec2 Model

The speech analyzer automatically downloads the model on first use:
- Model: `facebook/wav2vec2-base-960h`
- Size: ~360MB
- First run may take a few minutes

### Ollama Setup (Optional)

For LLM-powered sentence generation:

1. **Install Ollama**
```bash
# macOS/Linux
curl -fsSL https://ollama.com/install.sh | sh

# Windows
# Download from https://ollama.com/download
```

2. **Pull LLaMA model**
```bash
ollama pull llama2
```

3. **Start Ollama server**
```bash
ollama serve
```

If Ollama is not available, the system uses fallback sentences.

## 🗄️ Database Models

### User
- Authentication and profile info
- Role: `user` or `therapist`

### UserProfile
- Detailed user information
- Speech disorder details
- Therapy goals

### PracticeSession
- Audio recordings
- Phoneme-level analysis
- Accuracy scores

### Recommendation
- LLM-generated sentences
- Adaptive based on performance

### UserStats
- Streak tracking
- XP points
- Average accuracy

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- CORS protection
- Input validation with Pydantic
- SQL injection prevention (SQLAlchemy ORM)
- File upload validation

## 📁 File Storage

Files are stored locally in the `uploads/` directory:
- `uploads/audio/` - User recordings
- `uploads/profiles/` - Profile pictures

**Production**: Consider using cloud storage (S3, Azure Blob, etc.)

## 🧪 Testing

```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest
```

## 🚀 Production Deployment

### Environment Variables

Update `.env` for production:
```bash
ENVIRONMENT=production
SECRET_KEY=<generate-strong-key>
DATABASE_URL=<production-db-url>
CORS_ORIGINS=https://yourdomain.com
```

### Database Migrations

```bash
# Install Alembic
pip install alembic

# Initialize migrations
alembic init alembic

# Create migration
alembic revision --autogenerate -m "Initial migration"

# Apply migration
alembic upgrade head
```

### Run with Gunicorn

```bash
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Docker Deployment

```dockerfile
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 📊 Monitoring

- Health check: `GET /health`
- Logs: Check console output
- Database: Monitor PostgreSQL performance

## 🔧 Troubleshooting

### Database Connection Error
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Test connection
psql -U postgres -d vocalspace
```

### Audio Processing Error
```bash
# Install FFmpeg
# Ubuntu/Debian
sudo apt-get install ffmpeg

# macOS
brew install ffmpeg

# Windows
# Download from https://ffmpeg.org/download.html
```

### Model Download Issues
```bash
# Clear cache and retry
rm -rf ~/.cache/huggingface/
python -c "from transformers import Wav2Vec2Processor; Wav2Vec2Processor.from_pretrained('facebook/wav2vec2-base-960h')"
```

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login

### User
- `POST /api/user/profile/complete` - Complete profile
- `GET /api/user/recommendations` - Get sentences
- `GET /api/user/stats` - Get statistics
- `GET /api/user/progress` - Get progress data

### AI Analysis
- `POST /api/ai/analyze` - Analyze speech recording

### Admin
- `GET /api/admin/stats` - Platform statistics
- `GET /api/admin/patients` - Patient list

## 📄 License

MIT License
