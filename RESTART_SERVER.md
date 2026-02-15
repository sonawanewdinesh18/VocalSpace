# 🔄 Server Restart Instructions

## Issue Fixed ✅

The error `ModuleNotFoundError: No module named 'ai_engine.speech_analyzer'` has been resolved!

### What Was Fixed:
- Updated `backend/ai_engine/__init__.py` to import `HybridSpeechAnalyzer` instead of the deleted `SpeechAnalyzer`
- All imports now point to the correct, active files

---

## 🚀 How to Restart the Server

### Step 1: Stop the Current Server
Press `Ctrl + C` in your terminal to stop the server

### Step 2: Clear Python Cache (Important!)
```bash
cd backend
find . -type d -name "__pycache__" -exec rm -rf {} +
# Or on Windows:
# for /d /r %i in (__pycache__) do @rmdir /s /q "%i"
```

### Step 3: Restart the Server
```bash
# Make sure you're in the backend directory
cd backend

# Activate virtual environment (if not already active)
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

## ✅ Expected Output

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [XXXX] using WatchFiles
INFO:     Started server process [XXXX]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

---

## 🔍 Verify Everything Works

1. **Check API Docs:** http://localhost:8000/docs
2. **Check Health:** http://localhost:8000/health
3. **Test Frontend:** http://localhost:5173 (if running)

---

## 🐛 If You Still See Errors

### Clear All Python Cache:
```bash
cd backend
python -c "import pathlib; [p.unlink() for p in pathlib.Path('.').rglob('*.py[co]')]"
python -c "import pathlib; [p.rmdir() for p in pathlib.Path('.').rglob('__pycache__')]"
```

### Reinstall Dependencies:
```bash
pip install --force-reinstall -r requirements.txt
```

### Check Import Paths:
```bash
python -c "from ai_engine import HybridSpeechAnalyzer; print('✅ Import successful!')"
```

---

## 📝 What Changed

### Deleted Files (No Longer Available):
- ❌ `speech_analyzer.py` → Use `hybrid_speech_analyzer.py` instead
- ❌ `production_speech_analyzer.py` → Use `hybrid_speech_analyzer.py` instead
- ❌ `vocalspace_ai_therapist.py` → Not needed

### Active Files (Use These):
- ✅ `hybrid_speech_analyzer.py` - Main speech analyzer
- ✅ `recommendation_engine.py` - Recommendations
- ✅ `adaptive_recommender.py` - Adaptive learning
- ✅ All other files in ai_engine/ are active

---

**Server should now start without errors!** 🎉
