from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import User, UserProfile, UserStats, Recommendation, PracticeSession
from app.api.dependencies import get_current_user
from ai_engine import LLMRecommender
from pydantic import BaseModel
from typing import Optional
import os
import shutil
from datetime import datetime

router = APIRouter()

class CompleteProfileRequest(BaseModel):
    fullName: str
    mobile: Optional[str] = None
    age: int
    gender: str
    nativeLanguage: str
    speechDisorderType: str
    currentSeverity: str
    therapyGoal: str
    interests: Optional[str] = None
    troubleSounds: str

@router.get("/profile")
async def get_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user profile data"""
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    
    if not profile:
        return {
            "fullName": current_user.full_name,
            "age": None,
            "phoneNumber": None,
            "gender": None,
            "nativeLanguage": None,
            "speechDisorder": None,
            "severityLevel": None,
            "therapyGoals": None,
            "interests": None,
            "troubleSpots": None,
            "profileImage": None
        }
    
    return {
        "fullName": current_user.full_name,
        "age": profile.age,
        "phoneNumber": profile.mobile,
        "gender": profile.gender,
        "nativeLanguage": profile.native_language,
        "speechDisorder": profile.speech_disorder_type,
        "severityLevel": profile.current_severity,
        "therapyGoals": profile.therapy_goal,
        "interests": profile.interests,
        "troubleSpots": profile.trouble_sounds,
        "profileImage": profile.profile_image
    }

@router.post("/profile/complete")
async def complete_profile(
    fullName: str = Form(...),
    phoneNumber: Optional[str] = Form(None),
    age: int = Form(...),
    gender: str = Form(...),
    nativeLanguage: str = Form(...),
    speechDisorder: str = Form(...),
    severityLevel: str = Form(...),
    therapyGoals: str = Form(...),
    interests: Optional[str] = Form(None),
    troubleSpots: Optional[str] = Form(None),
    profilePic: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Complete or update user profile and generate initial recommendations"""
    
    # Update user
    current_user.full_name = fullName
    current_user.profile_completed = True
    
    # Create or update profile
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)
    
    # Update profile fields
    profile.mobile = phoneNumber
    profile.age = age
    profile.gender = gender
    profile.native_language = nativeLanguage
    profile.speech_disorder_type = speechDisorder
    profile.current_severity = severityLevel
    profile.therapy_goal = therapyGoals
    profile.interests = interests
    profile.trouble_sounds = troubleSpots
    
    # Handle profile image upload
    if profilePic:
        # Create uploads directory if it doesn't exist
        os.makedirs("uploads/profiles", exist_ok=True)
        
        # Save profile image
        file_extension = os.path.splitext(profilePic.filename)[1]
        filename = f"profile_{current_user.id}{file_extension}"
        file_path = os.path.join("uploads/profiles", filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(profilePic.file, buffer)
        
        profile.profile_image = f"/uploads/profiles/{filename}"
    
    # IMPORTANT: Save profile FIRST before generating recommendations
    db.commit()
    db.refresh(current_user)
    db.refresh(profile)
    
    print(f"✅ Profile saved successfully for user {current_user.id}")
    
    # Generate recommendations using INTELLIGENT SYSTEM
    # This happens AFTER profile is saved, so profile is always stored
    recommendations_generated = False
    audio_generated = False
    recommendation_type = "pre"  # Profile-based
    
    try:
        from ai_engine.recommendation_engine import RecommendationEngine
        
        print(f"🤖 Generating INTELLIGENT recommendations for user {current_user.id}...")
        print(f"   Strategy: PRE-Recommendations (Profile-Based)")
        
        # Use the intelligent recommendation engine
        rec_engine = RecommendationEngine()
        
        # Get performance history (if any)
        from app.db.models import PracticeSession
        performance_history = db.query(PracticeSession)\
            .filter(PracticeSession.user_id == current_user.id)\
            .order_by(PracticeSession.created_at.desc())\
            .limit(10)\
            .all()
        
        # Convert to dict format
        history_data = [
            {
                'weak_words': session.weak_words or [],
                'missing_words': session.missing_words or [],
                'weak_phonemes': session.weak_phonemes or [],
                'accuracy': session.accuracy
            }
            for session in performance_history
        ]
        
        # Generate recommendations (force PRE type for profile updates)
        result = rec_engine.generate_recommendations(
            profile={
                'age': age,
                'gender': gender,
                'native_language': nativeLanguage,
                'speech_disorder_type': speechDisorder,
                'current_severity': severityLevel,
                'therapy_goal': therapyGoals,
                'interests': interests or '',
                'trouble_sounds': troubleSpots or ''
            },
            performance_history=history_data,
            force_type='pre'  # Force profile-based for profile updates
        )
        
        sentences = result['sentences']
        recommendation_type = result['type']
        
        print(f"✅ Generated {len(sentences)} {recommendation_type.upper()}-recommendations")
        print(f"   Reason: {result['reason']}")
        
        # Generate reference audio for each sentence with HIGH-QUALITY neural voices
        try:
            print(f"🎙️  Generating reference audio files with neural voices...")
            
            # Try Edge TTS first (best quality, real male/female voices)
            try:
                from ai_engine.edge_voice_generator import EdgeVoiceGenerator
                voice_gen = EdgeVoiceGenerator()
                
                print(f"   Using Edge TTS (Microsoft Neural Voices)")
                voice_info = voice_gen.get_voice_info(age, gender)
                print(f"   Voice: {voice_info['description']}")
                print(f"   Model: {voice_info['voice']}")
                
                # Clean up old audio files first
                voice_gen.cleanup_old_audio(current_user.id)
                
                # Generate batch audio with Edge TTS (ASYNC)
                audio_results = await voice_gen.generate_batch_audio_async(
                    sentences=sentences,
                    age=age,
                    gender=gender,
                    user_id=current_user.id
                )
                audio_generated = True
                print(f"✅ Reference audio generated with {voice_info['gender']} neural voice")
                
            except ImportError as ie:
                print(f"⚠️  Edge TTS not installed: {ie}")
                print(f"   Install with: pip install edge-tts")
                raise Exception("edge-tts not available")
                
        except Exception as audio_error:
            print(f"⚠️  Warning: Could not generate audio files: {audio_error}")
            print("💡 Audio generation requires edge-tts: pip install edge-tts")
            import traceback
            traceback.print_exc()
        
        # Deactivate old recommendations
        db.query(Recommendation)\
            .filter(Recommendation.user_id == current_user.id)\
            .update({'is_active': False})
        
        # Save new recommendations
        recommendation = Recommendation(
            user_id=current_user.id,
            sentences=sentences,
            is_active=True
        )
        db.add(recommendation)
        db.commit()
        recommendations_generated = True
        print(f"✅ {recommendation_type.upper()}-recommendations saved to database")
        
    except Exception as e:
        print(f"⚠️  Warning: Could not generate AI recommendations: {e}")
        print("💡 Tip: Install Ollama and pull llama3 model for AI recommendations")
        print("   Visit: https://ollama.ai/download")
        print("📝 Profile is still saved - using default sentences")
        # Continue without recommendations - profile is still saved
    
    return {
        "success": True,
        "message": "Profile saved successfully",
        "recommendationsGenerated": recommendations_generated,
        "audioGenerated": audio_generated,
        "user": {
            "id": current_user.id,
            "email": current_user.email,
            "fullName": current_user.full_name,
            "role": current_user.role,
            "profileCompleted": current_user.profile_completed
        },
        "profile": {
            "fullName": current_user.full_name,
            "age": profile.age,
            "phoneNumber": profile.mobile,
            "gender": profile.gender,
            "nativeLanguage": profile.native_language,
            "speechDisorder": profile.speech_disorder_type,
            "severityLevel": profile.current_severity,
            "therapyGoals": profile.therapy_goal,
            "interests": profile.interests,
            "troubleSpots": profile.trouble_sounds,
            "profileImage": profile.profile_image
        }
    }

@router.get("/recommendations")
async def get_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user's personalized sentence recommendations with audio paths"""
    recommendation = db.query(Recommendation)\
        .filter(Recommendation.user_id == current_user.id, Recommendation.is_active == True)\
        .order_by(Recommendation.generated_at.desc())\
        .first()
    
    if not recommendation:
        return {"sentences": []}
    
    # Get user profile for age group determination
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    
    # Determine age group for audio path using AdvancedVoiceGenerator logic
    age = profile.age if profile else 25
    gender_raw = profile.gender if profile and profile.gender else 'Male'
    
    # Use AdvancedVoiceGenerator to get proper age group and gender code
    from ai_engine.advanced_voice_generator import AdvancedVoiceGenerator
    voice_gen = AdvancedVoiceGenerator()
    voice_config = voice_gen.get_voice_config(age, gender_raw)
    
    age_group = voice_config['age_group']
    gender_code = voice_config['gender']
    
    # Format sentences with audio paths matching AdvancedVoiceGenerator format
    formatted_sentences = []
    for idx, sentence_text in enumerate(recommendation.sentences, 1):
        audio_filename = f"ref_{current_user.id}_{idx}_{age_group}_{gender_code}.mp3"
        formatted_sentences.append({
            "id": idx,
            "sentence": sentence_text,
            "audio_path": f"/uploads/audio/reference/{audio_filename}",
            "difficulty": "medium"
        })
    
    return {"sentences": formatted_sentences}

@router.get("/stats")
async def get_user_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user statistics"""
    stats = db.query(UserStats).filter(UserStats.user_id == current_user.id).first()
    
    if not stats:
        stats = UserStats(user_id=current_user.id)
        db.add(stats)
        db.commit()
    
    return {
        "streak": stats.streak_days,
        "xp": stats.xp_points,
        "accuracy": int(stats.average_accuracy),
        "totalSessions": stats.total_sessions
    }

@router.get("/progress")
async def get_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user progress data for charts"""
    sessions = db.query(PracticeSession)\
        .filter(PracticeSession.user_id == current_user.id)\
        .order_by(PracticeSession.created_at.desc())\
        .limit(30)\
        .all()
    
    # Accuracy trend
    accuracy_trend = [
        {
            "date": session.created_at.strftime("%Y-%m-%d"),
            "accuracy": int(session.accuracy)
        }
        for session in reversed(sessions)
    ]
    
    # Phoneme errors
    phoneme_errors = {}
    for session in sessions:
        for phoneme in session.weak_phonemes or []:
            phoneme_errors[phoneme] = phoneme_errors.get(phoneme, 0) + 1
    
    phoneme_data = [
        {"phoneme": phoneme, "errors": count}
        for phoneme, count in sorted(phoneme_errors.items(), key=lambda x: x[1], reverse=True)[:10]
    ]
    
    # Recent sessions
    recent_sessions = [
        {
            "date": session.created_at.strftime("%Y-%m-%d %H:%M"),
            "sentencesCompleted": 1,
            "accuracy": int(session.accuracy)
        }
        for session in sessions[:10]
    ]
    
    return {
        "accuracyTrend": accuracy_trend,
        "phonemeErrors": phoneme_data,
        "recentSessions": recent_sessions
    }


@router.get("/sessions/recent")
async def get_recent_sessions(
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user's recent practice sessions with ENHANCED details"""
    sessions = db.query(PracticeSession)\
        .filter(PracticeSession.user_id == current_user.id)\
        .order_by(PracticeSession.created_at.desc())\
        .limit(limit)\
        .all()
    
    return {
        "sessions": [
            {
                "id": session.id,
                "sentence_id": 1,  # You might want to add this to the model
                "sentence_text": session.sentence,
                
                # Audio paths - ENHANCED
                "user_audio_path": session.user_audio_path,
                "reference_audio_path": session.reference_audio_path,
                
                # Overall metrics
                "accuracy": int(session.accuracy),
                "created_at": session.created_at.isoformat(),
                
                # Phoneme analysis
                "weak_phonemes": session.weak_phonemes or [],
                "phoneme_scores": session.phoneme_scores or {},
                
                # Word analysis - ENHANCED
                "weak_words": session.weak_words or [],
                "missing_words": session.missing_words or [],
                
                # Feedback
                "feedback": session.feedback or ""
            }
            for session in sessions
        ]
    }


@router.get("/practice-sessions")
async def get_practice_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get targeted practice sessions based on user performance
    Returns organized practice sessions focusing on weak areas
    """
    
    # Get user's performance history
    sessions = db.query(PracticeSession)\
        .filter(PracticeSession.user_id == current_user.id)\
        .order_by(PracticeSession.created_at.desc())\
        .limit(20)\
        .all()
    
    if len(sessions) < 3:
        # Not enough data for targeted practice
        # Return general practice from recommendations
        recommendation = db.query(Recommendation)\
            .filter(Recommendation.user_id == current_user.id, Recommendation.is_active == True)\
            .order_by(Recommendation.generated_at.desc())\
            .first()
        
        if not recommendation:
            return {"sessions": []}
        
        # Get user profile for audio paths
        profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
        age = profile.age if profile else 25
        gender_raw = profile.gender if profile and profile.gender else 'Male'
        
        # Use AdvancedVoiceGenerator to get proper age group and gender code
        from ai_engine.advanced_voice_generator import AdvancedVoiceGenerator
        voice_gen = AdvancedVoiceGenerator()
        voice_config = voice_gen.get_voice_config(age, gender_raw)
        
        age_group = voice_config['age_group']
        gender_code = voice_config['gender']
        
        # Create general practice session
        practice_sentences = []
        for idx, sentence_text in enumerate(recommendation.sentences, 1):
            audio_filename = f"ref_{current_user.id}_{idx}_{age_group}_{gender_code}.mp3"
            practice_sentences.append({
                "id": idx,
                "text": sentence_text,
                "audio_path": f"/uploads/audio/reference/{audio_filename}",
                "focus": "General practice"
            })
        
        return {
            "sessions": [
                {
                    "id": 1,
                    "title": "General Practice",
                    "description": "Practice your personalized sentences",
                    "type": "general",
                    "sentences": practice_sentences
                }
            ]
        }
    
    # Analyze performance to create targeted sessions
    from ai_engine.adaptive_recommender import AdaptiveRecommender
    
    recommender = AdaptiveRecommender()
    
    # Convert sessions to performance history
    history_data = [
        {
            'weak_words': session.weak_words or [],
            'missing_words': session.missing_words or [],
            'weak_phonemes': session.weak_phonemes or [],
            'accuracy': session.accuracy
        }
        for session in sessions
    ]
    
    # Analyze performance
    analysis = recommender._analyze_performance(history_data)
    
    # Create targeted practice sessions
    practice_sessions = []
    
    # Session 1: Focus on most problematic words
    if analysis['top_weak_words']:
        weak_word_sentences = _generate_sentences_for_words(
            analysis['top_weak_words'][:5],
            current_user.id
        )
        practice_sessions.append({
            "id": 1,
            "title": "Word Accuracy Practice",
            "description": f"Focus on words you struggle with most",
            "type": "weak_words",
            "sentences": weak_word_sentences
        })
    
    # Session 2: Focus on phonemes
    if analysis['top_weak_phonemes']:
        phoneme_sentences = _generate_sentences_for_phonemes(
            analysis['top_weak_phonemes'],
            current_user.id
        )
        practice_sessions.append({
            "id": 2,
            "title": "Phoneme Practice",
            "description": f"Practice difficult sounds: {', '.join(analysis['top_weak_phonemes'][:3])}",
            "type": "phonemes",
            "sentences": phoneme_sentences
        })
    
    # Session 3: Mixed challenge
    if analysis['top_weak_words'] and analysis['top_weak_phonemes']:
        mixed_sentences = _generate_mixed_sentences(
            analysis['top_weak_words'][:3],
            analysis['top_weak_phonemes'][:2],
            current_user.id
        )
        practice_sessions.append({
            "id": 3,
            "title": "Combined Challenge",
            "description": "Practice both words and sounds together",
            "type": "mixed",
            "sentences": mixed_sentences
        })
    
    return {"sessions": practice_sessions}


@router.get("/performance-analysis")
async def get_performance_analysis(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get detailed performance analysis for the user
    """
    
    # Get recent sessions
    sessions = db.query(PracticeSession)\
        .filter(PracticeSession.user_id == current_user.id)\
        .order_by(PracticeSession.created_at.desc())\
        .limit(20)\
        .all()
    
    if not sessions:
        return {
            "total_sessions": 0,
            "average_accuracy": 0,
            "trend": "No data yet",
            "top_weak_words": [],
            "top_weak_phonemes": [],
            "top_missing_words": []
        }
    
    # Use adaptive recommender's analysis
    from ai_engine.adaptive_recommender import AdaptiveRecommender
    
    recommender = AdaptiveRecommender()
    
    # Convert sessions to performance history
    history_data = [
        {
            'weak_words': session.weak_words or [],
            'missing_words': session.missing_words or [],
            'weak_phonemes': session.weak_phonemes or [],
            'accuracy': session.accuracy
        }
        for session in sessions
    ]
    
    # Get analysis
    analysis = recommender._analyze_performance(history_data)
    
    return analysis


def _generate_sentences_for_words(words: List[str], user_id: int) -> List[Dict]:
    """Generate practice sentences focusing on specific words"""
    sentences = []
    
    for idx, word in enumerate(words[:5], 1):
        # Create simple sentences with the target word
        sentence_templates = [
            f"The {word} is very important to practice.",
            f"I can say {word} clearly and correctly.",
            f"Please repeat {word} after me slowly.",
            f"The word {word} needs more practice.",
            f"Let's practice saying {word} together."
        ]
        
        sentence_text = sentence_templates[idx % len(sentence_templates)]
        
        sentences.append({
            "id": idx,
            "text": sentence_text,
            "audio_path": None,  # Generate on demand
            "focus": f"Word: {word}"
        })
    
    return sentences


def _generate_sentences_for_phonemes(phonemes: List[str], user_id: int) -> List[Dict]:
    """Generate practice sentences focusing on specific phonemes"""
    sentences = []
    
    # Phoneme-focused sentence templates
    phoneme_sentences = {
        's': "Sally sells seashells by the seashore.",
        'r': "The red rabbit ran rapidly around the roses.",
        'th': "Three thick things think together thoroughly.",
        'l': "Little Lucy loves lollipops and lemonade.",
        'sh': "She sells fresh fish at the fish shop.",
        'ch': "Charlie chose cheese and chocolate chips.",
        'z': "Zebras zigzag through the zoo zone.",
        'v': "Victor visits various villages very often.",
        'f': "Five friendly frogs found fresh fruit.",
        'p': "Peter Piper picked pickled peppers perfectly."
    }
    
    for idx, phoneme in enumerate(phonemes[:5], 1):
        sentence_text = phoneme_sentences.get(
            phoneme.lower(),
            f"Practice the {phoneme} sound carefully and clearly."
        )
        
        sentences.append({
            "id": idx,
            "text": sentence_text,
            "audio_path": None,
            "focus": f"Sound: /{phoneme}/"
        })
    
    return sentences


def _generate_mixed_sentences(words: List[str], phonemes: List[str], user_id: int) -> List[Dict]:
    """Generate sentences combining problematic words and phonemes"""
    sentences = []
    
    # Create sentences that include both target words and phonemes
    for idx in range(1, 6):
        word = words[idx % len(words)] if words else "practice"
        phoneme = phonemes[idx % len(phonemes)] if phonemes else "s"
        
        # Try to create a sentence with both
        sentence_text = f"The {word} requires careful practice with the {phoneme} sound."
        
        sentences.append({
            "id": idx,
            "text": sentence_text,
            "audio_path": None,
            "focus": f"Word: {word}, Sound: /{phoneme}/"
        })
    
    return sentences
