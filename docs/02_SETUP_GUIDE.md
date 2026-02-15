# 🚀 VocalSpace - Complete Setup Guide

This guide will help you set up VocalSpace from scratch on your local machine.

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- [ ] **Node.js 18+** - [Download](https://nodejs.org/)
- [ ] **Python 3.10+** - [Download](https://www.python.org/downloads/)
- [ ] **PostgreSQL 14+** - [Download](https://www.postgresql.org/download/)
- [ ] **Git** - [Download](https://git-scm.com/downloads)
- [ ] **FFmpeg** - [Download](https://ffmpeg.org/download.html)
- [ ] **Ollama** (Optional) - [Download](https://ollama.com/download)

## 🎯 Step-by-Step Setup

### Step 1: Clone or Navigate to Project

```bash
cd vocalspace
```

### Step 2: Backend Setup

#### 2.1 Create Python Virtual Environment

```bash
cd backend
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate
```

#### 2.2 Install Python Dependencies

```bash
pip install -r requirements.txt
```

This will install:
- FastAPI & Uvicorn
- PostgreSQL driver
- JWT authentication
- Wav2Vec2 & Transformers
- Audio processing libraries
- And more...

**Note**: First installation may take 5-10 minutes due to ML libraries.

#### 2.3 Setup PostgreSQL Database

**Option A: Using psql**
```bash
psql -U postgres
CREATE DATABASE vocalspace;
\q
```

**Option B: Using pgAdmin**
1. Open pgAdmin
2. Right-click "Databases"
3. Create → Database
4. Name: `vocalspace`
5. Save

#### 2.4 Configure Environment Variables

```bash
# Copy example env file
cp .env.example .env

# Edit .env file with your settings
# Windows: notepad .env
# macOS/Linux: nano .env
```

**Minimum required settings:**
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/vocalspace
SECRET_KEY=your-super-secret-key-change-this-in-production
```

**Generate a secure SECRET_KEY:**
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

#### 2.5 Initialize Database

```bash
python -m app.db.init_db
```

You should see:
```
✅ Default admin created: admin@vocalspace.com / admin123
✅ Database initialized successfully
```

#### 2.6 Start Backend Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Verify backend is running:**
- Open browser: `http://localhost:8000`
- You should see: `{"message": "VocalSpace API", "version": "1.0.0"}`
- API docs: `http://localhost:8000/docs`

### Step 3: Frontend Setup

Open a **new terminal** (keep backend running):

#### 3.1 Navigate to Frontend

```bash
cd frontend
```

#### 3.2 Install Node Dependencies

```bash
npm install
# or
yarn install
```

This will install:
- React & React Router
- Tailwind CSS
- Framer Motion
- Axios
- Zustand
- And more...

#### 3.3 Configure Environment

```bash
# Copy example env file
cp .env.example .env
```

**Default settings (should work as-is):**
```env
VITE_API_URL=http://localhost:8000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

#### 3.4 Add Your Logo

```bash
# Place your logo.png in the public folder
# The logo should be square (recommended: 512x512px)
cp /path/to/your/logo.png public/logo.png
```

**Don't have a logo yet?** The app will work without it, but you'll see a broken image icon.

#### 3.5 Start Frontend Server

```bash
npm run dev
# or
yarn dev
```

**Verify frontend is running:**
- Open browser: `http://localhost:3000`
- You should see the VocalSpace landing page

### Step 4: Optional - Setup Ollama (LLM)

For AI-powered sentence generation:

#### 4.1 Install Ollama

**macOS/Linux:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**Windows:**
Download installer from [ollama.com/download](https://ollama.com/download)

#### 4.2 Pull LLaMA Model

```bash
ollama pull llama2
```

This downloads ~4GB model (may take 10-20 minutes).

#### 4.3 Start Ollama Server

```bash
ollama serve
```

**Note**: If Ollama is not available, the system will use fallback sentences.

## ✅ Verification Checklist

Test each component:

### Backend Tests

1. **Health Check**
```bash
curl http://localhost:8000/health
# Expected: {"status":"healthy"}
```

2. **API Documentation**
- Visit: `http://localhost:8000/docs`
- You should see Swagger UI with all endpoints

3. **Admin Login**
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@vocalspace.com","password":"admin123"}'
# Expected: {"token":"...", "user":{...}}
```

### Frontend Tests

1. **Landing Page**
- Visit: `http://localhost:3000`
- Check: Logo, navigation, sections load

2. **Sign In**
- Click "Sign In"
- Enter: `admin@vocalspace.com` / `admin123`
- Should redirect to Admin Dashboard

3. **Create User Account**
- Sign out
- Click "Sign Up"
- Create a test account
- Complete profile
- Check personalized sentences appear

4. **Practice Session**
- Click "Start Practice"
- Allow microphone access
- Record a sentence
- Check analysis results

## 🎨 Customization

### Change Theme Colors

Edit `frontend/tailwind.config.js`:
```javascript
colors: {
  primary: {
    600: '#9333ea', // Change this
  },
  accent: {
    pink: '#ec4899',
    red: '#ef4444',
    blue: '#3b82f6',
  }
}
```

### Modify Logo Size

Edit `frontend/src/components/Navbar.jsx`:
```jsx
<img src="/logo.png" alt="VocalSpace" className="h-10 w-10" />
// Change h-10 w-10 to your preferred size
```

## 🐛 Common Issues & Solutions

### Issue: "Module not found" errors

**Solution:**
```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Issue: Database connection failed

**Solution:**
1. Check PostgreSQL is running:
```bash
# Windows
services.msc → PostgreSQL
# macOS
brew services list
# Linux
sudo systemctl status postgresql
```

2. Verify credentials in `.env`
3. Test connection:
```bash
psql -U postgres -d vocalspace
```

### Issue: Port already in use

**Solution:**
```bash
# Find process using port 8000
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:8000 | xargs kill -9
```

### Issue: Microphone not working

**Solution:**
1. Check browser permissions
2. Use HTTPS in production (required for getUserMedia)
3. Try different browser (Chrome recommended)

### Issue: AI model download fails

**Solution:**
```bash
# Clear cache
rm -rf ~/.cache/huggingface/

# Manual download
python -c "from transformers import Wav2Vec2Processor; Wav2Vec2Processor.from_pretrained('facebook/wav2vec2-base-960h')"
```

### Issue: Ollama not working

**Solution:**
1. Check Ollama is running: `ollama list`
2. Verify model is pulled: `ollama pull llama2`
3. Check backend .env: `OLLAMA_HOST=http://localhost:11434`
4. System will use fallback sentences if Ollama unavailable

## 📱 Mobile Testing

Test on mobile devices:

1. **Find your local IP:**
```bash
# Windows
ipconfig
# macOS/Linux
ifconfig
```

2. **Update frontend .env:**
```env
VITE_API_URL=http://YOUR_IP:8000/api
```

3. **Update backend CORS:**
```env
CORS_ORIGINS=http://localhost:3000,http://YOUR_IP:3000
```

4. **Access from mobile:**
- Visit: `http://YOUR_IP:3000`

## 🚀 Next Steps

1. **Change default admin password**
2. **Add your logo**
3. **Customize colors**
4. **Test all features**
5. **Create test user accounts**
6. **Record practice sessions**
7. **Review analytics**

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Wav2Vec2 Model](https://huggingface.co/facebook/wav2vec2-base-960h)
- [Ollama Documentation](https://ollama.com/docs)

## 💡 Tips

- Keep both terminals open (backend + frontend)
- Check browser console for errors (F12)
- Monitor backend logs for API errors
- Use Swagger UI (`/docs`) to test API endpoints
- Start with admin account to explore features
- Create user account to test full flow

## 🎉 Success!

If you've completed all steps, you should have:
- ✅ Backend running on port 8000
- ✅ Frontend running on port 3000
- ✅ Database initialized with admin user
- ✅ AI models downloaded
- ✅ Full authentication flow working
- ✅ Practice sessions functional

**Ready to transform speech therapy with AI!** 🎯

## 📞 Need Help?

If you encounter issues:
1. Check the troubleshooting section above
2. Review backend logs in terminal
3. Check browser console (F12)
4. Verify all prerequisites are installed
5. Ensure all services are running

---

**Happy Coding!** 🚀
