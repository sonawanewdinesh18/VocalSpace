# 🏗️ VocalSpace - System Architecture

Visual representation of the VocalSpace system architecture and data flow.

## 🎯 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                    (React + Tailwind + Vite)                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │ Landing  │  │   Auth   │  │ Profile  │  │Dashboard │      │
│  │   Page   │  │   Page   │  │Complete  │  │  Pages   │      │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │ Practice │  │ Progress │  │ Phoneme  │  │  Admin   │      │
│  │  Session │  │ Tracking │  │ Library  │  │Dashboard │      │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST API
                              │ (Axios)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API GATEWAY                             │
│                      (FastAPI + Uvicorn)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │   Auth   │  │   User   │  │  Admin   │  │    AI    │      │
│  │  Routes  │  │  Routes  │  │  Routes  │  │  Routes  │      │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│    DATABASE LAYER        │  │      AI ENGINE           │
│   (PostgreSQL + ORM)     │  │  (Separate Module)       │
├──────────────────────────┤  ├──────────────────────────┤
│                          │  │                          │
│  ┌────────────────────┐  │  │  ┌────────────────────┐ │
│  │ Users              │  │  │  │ Speech Analyzer    │ │
│  │ UserProfiles       │  │  │  │ (Wav2Vec2)         │ │
│  │ UserStats          │  │  │  └────────────────────┘ │
│  │ PracticeSessions   │  │  │                          │
│  │ Recommendations    │  │  │  ┌────────────────────┐ │
│  └────────────────────┘  │  │  │ LLM Recommender    │ │
│                          │  │  │ (Ollama/LLaMA)     │ │
└──────────────────────────┘  │  └────────────────────┘ │
                              │                          │
                              └──────────────────────────┘
```

## 🔄 Complete Data Flow

### 1. User Registration Flow

```
User Input (Email/Password)
        │
        ▼
Frontend Validation
        │
        ▼
POST /api/auth/register
        │
        ▼
Backend Validation (Pydantic)
        │
        ▼
Check Email Exists (Database)
        │
        ▼
Hash Password (Bcrypt)
        │
        ▼
Create User Record (Database)
        │
        ▼
Create UserStats Record (Database)
        │
        ▼
Generate JWT Token
        │
        ▼
Return Token + User Data
        │
        ▼
Store in Frontend (Zustand + LocalStorage)
        │
        ▼
Redirect to Complete Profile
```

### 2. Profile Completion Flow

```
User Fills Profile Form
        │
        ▼
Frontend Validation
        │
        ▼
POST /api/user/profile/complete
        │
        ▼
Backend Validation
        │
        ▼
Save Profile (Database)
        │
        ▼
Extract Profile Data
        │
        ▼
Send to LLM Recommender
        │
        ├─ Profile (age, disorder, interests)
        ├─ Trouble Sounds (/S/, /R/, /TH/)
        └─ Therapy Goals
        │
        ▼
LLM Generates 5 Sentences
        │
        ├─ Personalized to user
        ├─ Contains trouble sounds
        └─ Related to interests
        │
        ▼
Save Recommendations (Database)
        │
        ▼
Return Success + User Data
        │
        ▼
Redirect to Dashboard
```

### 3. Practice Session Flow

```
User Selects Sentence
        │
        ▼
Click Record Button
        │
        ▼
Request Microphone Access
        │
        ▼
Start Recording (MediaRecorder API)
        │
        ▼
User Speaks Sentence
        │
        ▼
Stop Recording
        │
        ▼
Create Audio Blob (WAV)
        │
        ▼
POST /api/ai/analyze
        │
        ├─ audio: Blob
        └─ text: "She sells seashells"
        │
        ▼
Backend Receives Audio
        │
        ▼
Save Audio File (uploads/audio/)
        │
        ▼
Send to Speech Analyzer
        │
        ▼
┌─────────────────────────────────────┐
│      SPEECH ANALYSIS PIPELINE       │
├─────────────────────────────────────┤
│                                     │
│  1. Load Audio                      │
│     ├─ Resample to 16kHz            │
│     └─ Noise Reduction              │
│                                     │
│  2. Forced Alignment                │
│     ├─ Word Timings                 │
│     │  "she" → 0.00-0.35s           │
│     │  "sells" → 0.36-0.82s         │
│     └─ Phoneme Timings              │
│        "SH" → 0.00-0.12s            │
│        "IY" → 0.12-0.35s            │
│                                     │
│  3. Phoneme Slicing                 │
│     ├─ Extract each phoneme audio   │
│     └─ audio[0.00:0.12] → SH.wav    │
│                                     │
│  4. Feature Extraction              │
│     ├─ Wav2Vec2 Model               │
│     ├─ User Phoneme → Vector        │
│     └─ Reference → Vector           │
│                                     │
│  5. Similarity Comparison           │
│     ├─ Cosine Similarity            │
│     ├─ Score: 0.0 - 1.0             │
│     └─ Threshold: 0.7               │
│                                     │
│  6. Error Detection                 │
│     ├─ Weak Phonemes (< 0.7)        │
│     ├─ Wrong Phonemes               │
│     └─ Timing Issues                │
│                                     │
│  7. Feedback Generation             │
│     ├─ Overall Accuracy             │
│     ├─ Weak Phoneme List            │
│     └─ Improvement Suggestions      │
│                                     │
└─────────────────────────────────────┘
        │
        ▼
Return Analysis Results
        │
        ├─ accuracy: 85%
        ├─ weakPhonemes: ["/S/", "/SH/"]
        ├─ phonemeScores: [...]
        └─ feedback: "Good job! Pay attention to..."
        │
        ▼
Save Session (Database)
        │
        ├─ PracticeSession record
        ├─ Audio path
        ├─ Accuracy score
        ├─ Weak phonemes
        └─ Phoneme timings
        │
        ▼
Update User Stats
        │
        ├─ Increment total_sessions
        ├─ Update average_accuracy
        ├─ Update streak_days
        └─ Add XP points
        │
        ▼
Check Session Count
        │
        ▼
Every 5 Sessions?
        │
        ├─ Yes → Generate Adaptive Recommendations
        │         │
        │         ├─ Analyze Performance History
        │         ├─ Identify Weak Phonemes
        │         ├─ Send to LLM
        │         ├─ Generate New Sentences
        │         └─ Save Recommendations
        │
        └─ No → Continue
        │
        ▼
Return Results to Frontend
        │
        ▼
Display Analysis
        │
        ├─ Accuracy Score (85%)
        ├─ Weak Phonemes (/S/, /SH/)
        ├─ Feedback Message
        └─ Phoneme-level Scores
```

### 4. Progress Tracking Flow

```
User Visits Progress Page
        │
        ▼
GET /api/user/progress
        │
        ▼
Query Database
        │
        ├─ Last 30 Sessions
        ├─ All Weak Phonemes
        └─ Recent Activity
        │
        ▼
Process Data
        │
        ├─ Accuracy Trend
        │  └─ Group by date
        │
        ├─ Phoneme Errors
        │  ├─ Count frequency
        │  └─ Sort by count
        │
        └─ Recent Sessions
           └─ Format dates
        │
        ▼
Return Processed Data
        │
        ▼
Frontend Renders Charts
        │
        ├─ Line Chart (Accuracy Trend)
        ├─ Bar Chart (Phoneme Errors)
        └─ Session History List
```

### 5. Admin Dashboard Flow

```
Therapist Logs In
        │
        ▼
Redirect to /admin-dashboard
        │
        ▼
GET /api/admin/stats
        │
        ▼
Query Database
        │
        ├─ Count Total Patients
        ├─ Count Active Today
        ├─ Calculate Avg Improvement
        └─ Count Total Sessions
        │
        ▼
GET /api/admin/patients
        │
        ▼
Query All Users (role=user)
        │
        ▼
For Each User:
        │
        ├─ Get UserStats
        ├─ Get UserProfile
        └─ Get Last Session
        │
        ▼
Format Patient Data
        │
        ├─ Name
        ├─ Disorder Type
        ├─ Session Count
        ├─ Accuracy
        └─ Last Active Date
        │
        ▼
Return Dashboard Data
        │
        ▼
Display Analytics
        │
        ├─ Statistics Cards
        └─ Patient Table
```

## 🗄️ Database Schema Relationships

```
┌─────────────────┐
│     users       │
│─────────────────│
│ id (PK)         │◄─────────┐
│ email           │          │
│ hashed_password │          │
│ full_name       │          │
│ role            │          │
│ profile_completed│         │
└─────────────────┘          │
        │                    │
        │ 1:1                │ 1:1
        │                    │
        ▼                    │
┌─────────────────┐          │
│ user_profiles   │          │
│─────────────────│          │
│ id (PK)         │          │
│ user_id (FK)    │──────────┘
│ age             │
│ gender          │
│ disorder_type   │
│ trouble_sounds  │
│ therapy_goal    │
└─────────────────┘

┌─────────────────┐
│   user_stats    │
│─────────────────│
│ id (PK)         │
│ user_id (FK)    │──────────┐
│ total_sessions  │          │
│ avg_accuracy    │          │
│ streak_days     │          │
│ xp_points       │          │
└─────────────────┘          │
                             │
                             │ 1:1
                             │
        ┌────────────────────┘
        │
        │ 1:N
        │
        ▼
┌─────────────────┐
│practice_sessions│
│─────────────────│
│ id (PK)         │
│ user_id (FK)    │
│ sentence        │
│ audio_path      │
│ accuracy        │
│ weak_phonemes   │
│ phoneme_scores  │
│ created_at      │
└─────────────────┘

┌─────────────────┐
│recommendations  │
│─────────────────│
│ id (PK)         │
│ user_id (FK)    │──────────┐
│ sentences (JSON)│          │
│ generated_at    │          │
│ is_active       │          │
└─────────────────┘          │
                             │ 1:N
                             │
                             └──────────┐
                                        │
                                        ▼
                              ┌─────────────────┐
                              │     users       │
                              └─────────────────┘
```

## 🔐 Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      SECURITY LAYERS                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Layer 1: Frontend Security                                 │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ • Input Validation                                    │ │
│  │ • XSS Prevention (React escaping)                     │ │
│  │ • HTTPS Only                                          │ │
│  │ • Secure Token Storage (LocalStorage)                 │ │
│  │ • CORS Headers                                        │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  Layer 2: API Security                                      │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ • JWT Token Validation                                │ │
│  │ • Request Rate Limiting (future)                      │ │
│  │ • Input Sanitization (Pydantic)                       │ │
│  │ • CORS Configuration                                  │ │
│  │ • File Upload Validation                              │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  Layer 3: Authentication                                    │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ • JWT Tokens (HS256)                                  │ │
│  │ • Bcrypt Password Hashing (12 rounds)                 │ │
│  │ • Token Expiration (7 days)                           │ │
│  │ • Role-Based Access Control                           │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  Layer 4: Database Security                                 │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ • SQL Injection Prevention (ORM)                      │ │
│  │ • Parameterized Queries                               │ │
│  │ • Connection Pooling                                  │ │
│  │ • Encrypted Connections (SSL)                         │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  Layer 5: Infrastructure                                    │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ • Environment Variables                               │ │
│  │ • Secure File Permissions                             │ │
│  │ • HTTPS/TLS Certificates                              │ │
│  │ • Firewall Rules                                      │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 🤖 AI/ML Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AI ENGINE ARCHITECTURE                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           SPEECH ANALYZER MODULE                    │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │                                                     │   │
│  │  Input: Audio File + Text                          │   │
│  │     │                                               │   │
│  │     ▼                                               │   │
│  │  Audio Preprocessing                               │   │
│  │     ├─ Load with Librosa                           │   │
│  │     ├─ Resample to 16kHz                           │   │
│  │     └─ Noise Reduction                             │   │
│  │     │                                               │   │
│  │     ▼                                               │   │
│  │  Wav2Vec2 Model                                    │   │
│  │     ├─ facebook/wav2vec2-base-960h                 │   │
│  │     ├─ Feature Extraction                          │   │
│  │     └─ Hidden States                               │   │
│  │     │                                               │   │
│  │     ▼                                               │   │
│  │  Forced Alignment                                  │   │
│  │     ├─ Word-level Timing                           │   │
│  │     └─ Phoneme-level Timing                        │   │
│  │     │                                               │   │
│  │     ▼                                               │   │
│  │  Phoneme Slicing                                   │   │
│  │     ├─ Extract Audio Segments                      │   │
│  │     └─ Individual Phoneme Files                    │   │
│  │     │                                               │   │
│  │     ▼                                               │   │
│  │  Similarity Comparison                             │   │
│  │     ├─ User Vector                                 │   │
│  │     ├─ Reference Vector                            │   │
│  │     └─ Cosine Similarity                           │   │
│  │     │                                               │   │
│  │     ▼                                               │   │
│  │  Output: Analysis Results                          │   │
│  │     ├─ Accuracy Score                              │   │
│  │     ├─ Weak Phonemes                               │   │
│  │     ├─ Phoneme Scores                              │   │
│  │     └─ Feedback                                    │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           LLM RECOMMENDER MODULE                    │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │                                                     │   │
│  │  Input: User Profile + Performance History         │   │
│  │     │                                               │   │
│  │     ▼                                               │   │
│  │  Profile Analysis                                  │   │
│  │     ├─ Age, Interests                              │   │
│  │     ├─ Disorder Type                               │   │
│  │     └─ Trouble Sounds                              │   │
│  │     │                                               │   │
│  │     ▼                                               │   │
│  │  Performance Analysis                              │   │
│  │     ├─ Weak Phoneme Frequency                      │   │
│  │     ├─ Accuracy Trends                             │   │
│  │     └─ Difficulty Level                            │   │
│  │     │                                               │   │
│  │     ▼                                               │   │
│  │  Prompt Generation                                 │   │
│  │     ├─ Personalized Context                        │   │
│  │     ├─ Phoneme Focus                               │   │
│  │     └─ Interest Integration                        │   │
│  │     │                                               │   │
│  │     ▼                                               │   │
│  │  Ollama/LLaMA                                      │   │
│  │     ├─ Local LLM Execution                         │   │
│  │     ├─ Sentence Generation                         │   │
│  │     └─ Quality Filtering                           │   │
│  │     │                                               │   │
│  │     ▼                                               │   │
│  │  Output: 5 Personalized Sentences                 │   │
│  │     ├─ Contains Trouble Sounds                     │   │
│  │     ├─ Age-Appropriate                             │   │
│  │     └─ Interest-Related                            │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 🌐 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   PRODUCTION DEPLOYMENT                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    CDN / CloudFront                 │   │
│  │              (Static Assets + Frontend)             │   │
│  └─────────────────────────────────────────────────────┘   │
│                            │                                │
│                            ▼                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  Load Balancer                      │   │
│  │                  (Nginx / ALB)                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                            │                                │
│              ┌─────────────┴─────────────┐                 │
│              │                           │                 │
│              ▼                           ▼                 │
│  ┌──────────────────────┐    ┌──────────────────────┐     │
│  │   Backend Server 1   │    │   Backend Server 2   │     │
│  │  (FastAPI + Gunicorn)│    │  (FastAPI + Gunicorn)│     │
│  └──────────────────────┘    └──────────────────────┘     │
│              │                           │                 │
│              └─────────────┬─────────────┘                 │
│                            │                                │
│                            ▼                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              PostgreSQL Database                    │   │
│  │              (RDS / Managed Service)                │   │
│  └─────────────────────────────────────────────────────┘   │
│                            │                                │
│                            ▼                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              File Storage (S3 / Blob)               │   │
│  │         (Audio Files + Profile Pictures)            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 📊 Technology Stack Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    TECHNOLOGY STACK                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Frontend Layer                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ React 18 │ Vite │ Tailwind CSS │ Framer Motion     │   │
│  │ Zustand │ Axios │ Recharts │ Lucide React          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Backend Layer                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ FastAPI │ Uvicorn │ Gunicorn │ Pydantic            │   │
│  │ SQLAlchemy │ Alembic │ PyJWT │ Passlib             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  AI/ML Layer                                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Wav2Vec2 │ Transformers │ PyTorch │ Librosa         │   │
│  │ Ollama │ LLaMA │ NumPy │ SciPy                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Database Layer                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ PostgreSQL 14+ │ psycopg2 │ Connection Pooling     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Infrastructure Layer                                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Docker │ Nginx │ Let's Encrypt │ Systemd            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

This architecture ensures:
- ✅ Scalability
- ✅ Security
- ✅ Performance
- ✅ Maintainability
- ✅ Reliability

**Built for production at scale!** 🚀
