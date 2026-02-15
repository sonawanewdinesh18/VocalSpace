from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.api.routes import auth, user, admin, ai
import os
import json
import base64
import numpy as np
import librosa

app = FastAPI(
    title="VocalSpace API",
    description="AI-Powered Speech Therapy Platform",
    version="1.0.0"
)

# CORS - More permissive for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins in development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Create upload directories
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.AUDIO_DIR, exist_ok=True)
os.makedirs(settings.PROFILE_PICS_DIR, exist_ok=True)

# Static files
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Routes
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(user.router, prefix="/api/user", tags=["User"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI Analysis"])

@app.get("/")
async def root():
    return {
        "message": "VocalSpace API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# WebSocket for real-time audio feedback
@app.websocket("/ws/realtime-feedback")
async def websocket_realtime_feedback(websocket: WebSocket):
    """
    Real-time audio feedback via WebSocket
    
    Client sends: {"audio": base64_encoded_audio_chunk}
    Server responds: {"volume": 0-100, "pitch": Hz, "quality": "good/low"}
    """
    await websocket.accept()
    print("🔌 WebSocket connected for real-time feedback")
    
    try:
        while True:
            # Receive audio chunk from client
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if "audio" in message:
                # Decode base64 audio
                audio_bytes = base64.b64decode(message["audio"])
                
                # Convert to numpy array
                audio_array = np.frombuffer(audio_bytes, dtype=np.float32)
                
                if len(audio_array) > 0:
                    # Quick analysis
                    feedback = analyze_audio_chunk(audio_array)
                    
                    # Send feedback
                    await websocket.send_json(feedback)
            
    except WebSocketDisconnect:
        print("🔌 WebSocket disconnected")
    except Exception as e:
        print(f"❌ WebSocket error: {e}")
        await websocket.close()

def analyze_audio_chunk(audio: np.ndarray, sr: int = 16000) -> dict:
    """
    Quick analysis of audio chunk for real-time feedback
    
    Returns:
        - volume: 0-100
        - pitch: Hz (or 0 if no pitch detected)
        - quality: "good", "low", "silent"
    """
    try:
        # Volume (RMS energy)
        rms = np.sqrt(np.mean(audio**2))
        volume = min(100, int(rms * 1000))  # Scale to 0-100
        
        # Pitch detection (simple autocorrelation)
        pitch = 0
        if len(audio) > 512:
            try:
                # Use librosa for pitch detection
                pitches, magnitudes = librosa.piptrack(y=audio, sr=sr)
                if pitches.size > 0:
                    pitch_values = []
                    for t in range(pitches.shape[1]):
                        index = magnitudes[:, t].argmax()
                        pitch_val = pitches[index, t]
                        if pitch_val > 0:
                            pitch_values.append(pitch_val)
                    
                    if pitch_values:
                        pitch = int(np.median(pitch_values))
            except:
                pitch = 0
        
        # Quality assessment
        if volume < 5:
            quality = "silent"
        elif volume < 20:
            quality = "low"
        else:
            quality = "good"
        
        return {
            "volume": volume,
            "pitch": pitch,
            "quality": quality,
            "timestamp": len(audio) / sr
        }
    except Exception as e:
        print(f"Error in chunk analysis: {e}")
        return {
            "volume": 0,
            "pitch": 0,
            "quality": "error",
            "timestamp": 0
        }
