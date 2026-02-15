# 📁 VocalSpace - Project Structure

Complete overview of the project architecture and file organization.

## 🏗️ High-Level Architecture

```
VocalSpace/
├── frontend/          # React + Vite + Tailwind
├── backend/           # FastAPI + PostgreSQL
│   └── ai_engine/    # Separate AI module
├── README.md
├── SETUP_GUIDE.md
└── QUICK_START.md
```

## 🎨 Frontend Structure

```
frontend/
├── public/
│   ├── logo.png              # Your logo (add this)
│   └── logo-placeholder.svg  # Placeholder SVG
│
├── src/
│   ├── components/
│   │   └── Navbar.jsx        # Navigation component
│   │
│   ├── pages/
│   │   ├── Landing.jsx       # Landing page
│   │   ├── Auth.jsx          # Login/Register
│   │   ├── CompleteProfile.jsx
│   │   │
│   │   ├── user/             # User pages
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Practice.jsx
│   │   │   ├── Progress.jsx
│   │   │   └── PhonemeLibrary.jsx
│   │   │
│   │   └── admin/            # Admin pages
│   │       └── Dashboard.jsx
│   │
│   ├── store/                # State management
│   │   ├── authStore.js      # Authentication
│   │   └── themeStore.js     # Theme (dark/light)
│   │
│   ├── utils/
│   │   └── api.js            # Axios instance
│   │
│   ├── App.jsx               # Main app + routing
│   ├── main.jsx              # Entry point
│   └── index.css             # Global styles
│
├── .env.example              # Environment template
├── .gitignore
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .eslintrc.cjs
└── README.md
```

## 🔧 Backend Structure

```
backend/
├── app/
│   ├── api/
│   │   ├── routes/
│   │   │   ├── auth.py       # Authentication endpoints
│   │   │   ├── user.py       # User operations
│   │   │   ├── admin.py      # Admin dashboard
│   │   │   ├── ai.py         # AI analysis
│   │   │   └── __init__.py
│   │   │
│   │   ├── dependencies.py   # Auth dependencies
│   │   └── __init__.py
│   │
│   ├── core/
│   │   ├── config.py         # Configuration
│   │   ├── security.py       # JWT & hashing
│   │   └── __init__.py
│   │
│   ├── db/
│   │   ├── database.py       # DB connection
│   │   ├── models.py         # SQLAlchemy models
│   │   ├── init_db.py        # DB initialization
│   │   └── __init__.py
│   │
│   ├── main.py               # FastAPI app
│   └── __init__.py
│
├── ai_engine/                # Separate AI module
│   ├── speech_analyzer.py    # Wav2Vec2 + alignment
│   ├── llm_recommender.py    # LLM sentence generation
│   └── __init__.py
│
├── uploads/                  # File storage
│   ├── audio/               # User recordings
│   ├── profiles/            # Profile pictures
│   └── .gitkeep
│
├── .env.example             # Environment template
├── .gitignore
├── requirements.txt
└── README.md
```

## 🗄️ Database Schema

```
┌─────────────────┐
│     users       │
├─────────────────┤
│ id              │
│ email           │
│ hashed_password │
│ full_name       │
│ role            │ (user/therapist)
│ profile_completed│
│ created_at      │
└─────────────────┘
        │
        ├──────────────────────────┐
        │                          │
        ▼                          ▼
┌─────────────────┐      ┌─────────────────┐
│ user_profiles   │      │  user_stats     │
├─────────────────┤      ├─────────────────┤
│ id              │      │ id              │
│ user_id         │      │ user_id         │
│ profile_image   │      │ total_sessions  │
│ mobile          │      │ average_accuracy│
│ age             │      │ streak_days     │
│ gender          │      │ xp_points       │
│ native_language │      │ last_practice   │
│ disorder_type   │      └─────────────────┘
│ severity        │
│ therapy_goal    │
│ interests       │
│ trouble_sounds  │
└─────────────────┘
        │
        ├──────────────────────────┐
        │                          │
        ▼                          ▼
┌─────────────────┐      ┌─────────────────┐
│ recommendations │      │practice_sessions│
├─────────────────┤      ├─────────────────┤
│ id              │      │ id              │
│ user_id         │      │ user_id         │
│ sentences (JSON)│      │ sentence        │
│ generated_at    │      │ audio_path      │
│ is_active       │      │ accuracy        │
└─────────────────┘      │ weak_phonemes   │
                         │ phoneme_scores  │
                         │ word_timings    │
                         │ phoneme_timings │
                         │ feedback        │
                         │ created_at      │
                         └─────────────────┘
```

## 🔄 Data Flow

### Authentication Flow
```
User → Frontend (Auth.jsx)
     → API (auth.py)
     → Database (users)
     → JWT Token
     → Store (authStore.js)
     → Protected Routes
```

### Profile Completion Flow
```
User → CompleteProfile.jsx
     → API (user.py)
     → Database (user_profiles)
     → LLM (llm_recommender.py)
     → Generate Sentences
     → Database (recommendations)
     → User Dashboard
```

### Practice Session Flow
```
User → Practice.jsx
     → Record Audio
     → API (ai.py)
     → Speech Analyzer (speech_analyzer.py)
     ├─ Load Audio
     ├─ Forced Alignment
     ├─ Phoneme Slicing
     ├─ Feature Extraction
     └─ Similarity Comparison
     → Analysis Results
     → Database (practice_sessions)
     → Update Stats (user_stats)
     → Adaptive Recommendations (every 5 sessions)
```

## 🎯 Key Components

### Frontend Components

**Navbar.jsx**
- Variants: landing, user, admin
- Theme toggle
- Authentication state
- Responsive design

**Landing.jsx**
- Hero section
- Features showcase
- How it works
- About & Contact

**Auth.jsx**
- Login/Register forms
- Google OAuth (coming soon)
- Form validation

**Dashboard.jsx** (User)
- Statistics cards
- Personalized sentences
- Quick actions
- Progress overview

**Practice.jsx**
- Audio recording
- Real-time feedback
- Phoneme analysis
- Session tracking

**Progress.jsx**
- Accuracy charts
- Phoneme errors
- Session history

**PhonemeLibrary.jsx**
- Categorized phonemes
- Audio examples
- Practice mode

### Backend Components

**auth.py**
- User registration
- Login
- JWT token generation

**user.py**
- Profile completion
- Get recommendations
- Statistics
- Progress data

**admin.py**
- Platform statistics
- Patient list
- Analytics

**ai.py**
- Speech analysis
- Adaptive recommendations
- Session tracking

**speech_analyzer.py**
- Wav2Vec2 integration
- Forced alignment
- Phoneme extraction
- Similarity comparison

**llm_recommender.py**
- Ollama integration
- Sentence generation
- Adaptive learning
- Performance analysis

## 🔐 Security Features

### Authentication
- JWT tokens
- Password hashing (bcrypt)
- Token expiration
- Secure headers

### API Security
- CORS protection
- Input validation (Pydantic)
- SQL injection prevention (ORM)
- File upload validation

### Data Protection
- Environment variables
- Secure password storage
- Token-based auth
- Role-based access

## 📦 Dependencies

### Frontend
- **React 18** - UI framework
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Axios** - HTTP client
- **Zustand** - State management
- **Recharts** - Charts
- **Lucide React** - Icons

### Backend
- **FastAPI** - Web framework
- **SQLAlchemy** - ORM
- **PostgreSQL** - Database
- **PyJWT** - JWT tokens
- **Passlib** - Password hashing
- **Transformers** - Wav2Vec2
- **Torch** - ML framework
- **Librosa** - Audio processing
- **Ollama** - LLM integration

## 🚀 Deployment Structure

### Development
```
localhost:3000 → Frontend (Vite dev server)
localhost:8000 → Backend (Uvicorn)
localhost:5432 → PostgreSQL
localhost:11434 → Ollama (optional)
```

### Production
```
yourdomain.com → Frontend (Static files)
api.yourdomain.com → Backend (Gunicorn + Uvicorn)
RDS/Cloud SQL → PostgreSQL
Cloud Storage → File uploads
```

## 📝 File Naming Conventions

### Frontend
- Components: `PascalCase.jsx`
- Stores: `camelCase.js`
- Utils: `camelCase.js`
- Styles: `kebab-case.css`

### Backend
- Modules: `snake_case.py`
- Classes: `PascalCase`
- Functions: `snake_case`
- Constants: `UPPER_CASE`

## 🎨 Styling System

### Tailwind Classes
- `btn-primary` - Primary button
- `btn-secondary` - Secondary button
- `card` - Card container
- `input-field` - Form input

### Color Palette
- Primary: Purple (#9333ea)
- Accent Pink: #ec4899
- Accent Red: #ef4444
- Accent Blue: #3b82f6

### Responsive Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🔄 State Management

### Frontend State
- **authStore** - User & token
- **themeStore** - Dark/light mode
- **Local State** - Component-specific

### Backend State
- **Database** - Persistent data
- **Session** - Request context
- **Cache** - (Future: Redis)

## 📊 Analytics & Tracking

### User Metrics
- Total sessions
- Average accuracy
- Streak days
- XP points
- Weak phonemes

### Admin Metrics
- Total patients
- Active users
- Average improvement
- Session trends
- Common errors

## 🧪 Testing Structure

### Frontend Tests (Future)
```
src/
├── __tests__/
│   ├── components/
│   ├── pages/
│   └── utils/
```

### Backend Tests (Future)
```
backend/
├── tests/
│   ├── test_auth.py
│   ├── test_user.py
│   ├── test_admin.py
│   └── test_ai.py
```

---

This structure ensures:
- ✅ Clean separation of concerns
- ✅ Easy team collaboration
- ✅ Scalable architecture
- ✅ Maintainable codebase
- ✅ Production-ready setup
