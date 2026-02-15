from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import User, PracticeSession, UserStats, Recommendation, UserProfile
from app.api.dependencies import get_current_user
from ai_engine.hybrid_speech_analyzer import HybridSpeechAnalyzer
from app.core.config import settings
import os
import uuid
from datetime import datetime, timedelta

router = APIRouter()

# Initialize AI components
hybrid_analyzer = HybridSpeechAnalyzer()  # Production-grade hybrid analyzer

async def regenerate_recommendations_internal(user_id: int, db: Session):
    """Internal function to regenerate recommendations (called automatically)"""
    try:
        from ai_engine.recommendation_engine import RecommendationEngine
        from ai_engine.voice_generator import VoiceGenerator
        
        # Get user profile
        profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
        if not profile:
            print(f"⚠️  No profile found for user {user_id}")
            return
        
        # Get performance history
        sessions = db.query(PracticeSession)\
            .filter(PracticeSession.user_id == user_id)\
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
            for session in sessions
        ]
        
        # Use intelligent recommendation engine
        rec_engine = RecommendationEngine()
        result = rec_engine.generate_recommendations(
            profile={
                'age': profile.age,
                'gender': profile.gender,
                'native_language': profile.native_language,
                'speech_disorder_type': profile.speech_disorder_type,
                'current_severity': profile.current_severity,
                'therapy_goal': profile.therapy_goal,
                'interests': profile.interests or '',
                'trouble_sounds': profile.trouble_sounds or ''
            },
            performance_history=history_data
        )
        
        sentences = result['sentences']
        
        # Generate audio
        try:
            voice_gen = VoiceGenerator()
            voice_gen.cleanup_old_audio(user_id)
            voice_gen.generate_batch_audio(
                sentences=sentences,
                age=profile.age,
                gender=profile.gender,
                user_id=user_id
            )
        except Exception as audio_error:
            print(f"⚠️  Audio generation failed: {audio_error}")
        
        # Deactivate old recommendations
        db.query(Recommendation)\
            .filter(Recommendation.user_id == user_id)\
            .update({'is_active': False})
        
        # Save new recommendations
        recommendation = Recommendation(
            user_id=user_id,
            sentences=sentences,
            is_active=True
        )
        db.add(recommendation)
        db.commit()
        
        print(f"✅ Automatic {result['type'].upper()}-recommendations generated and saved")
        
    except Exception as e:
        print(f"❌ Error in automatic recommendation regeneration: {e}")
        # Don't raise - this is background task


async def generate_adaptive_recommendations(user_id: int, db: Session):
    """Legacy function - redirects to new system"""
    await regenerate_recommendations_internal(user_id, db)


@router.post("/analyze-speech")
async def analyze_speech_detailed(
    audio: UploadFile = File(...),
    sentence_id: int = Form(...),
    sentence_text: str = Form(...),
    reference_audio_path: str = Form(None),  # Reference audio path from frontend
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    ENHANCED: Comprehensive speech analysis with ACCURATE transcription
    
    Improvements:
    - Better Wav2Vec2 model (large instead of base)
    - Enhanced audio preprocessing
    - Fuzzy word matching with Levenshtein distance
    - Detailed error analysis
    - Reference audio path properly passed
    """
    try:
        # Create user-specific audio directory
        audio_dir = f"uploads/audio/user_{current_user.id}"
        os.makedirs(audio_dir, exist_ok=True)
        
        # Save uploaded audio with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        audio_filename = f"recording_s{sentence_id}_{timestamp}.wav"
        user_audio_path = os.path.join(audio_dir, audio_filename)
        
        with open(user_audio_path, "wb") as buffer:
            content = await audio.read()
            buffer.write(content)
        
        print(f"\n🎯 Starting HYBRID speech analysis...")
        print(f"   User: {current_user.email}")
        print(f"   Sentence: \"{sentence_text}\"")
        print(f"   User Audio: {user_audio_path}")
        print(f"   Reference Audio: {reference_audio_path}")
        
        # HYBRID: Use advanced hybrid analyzer with noise reduction & DTW
        result = hybrid_analyzer.analyze_complete(
            user_audio_path=user_audio_path,
            reference_audio_path=reference_audio_path.lstrip('/') if reference_audio_path else None,
            expected_text=sentence_text
        )
        
        # Extract metrics from hybrid analyzer
        accuracy = result.get('overall_score', 0)
        
        # Word analysis
        word_analysis = result.get('word_analysis', {})
        words_correct = len(word_analysis.get('correct_words', []))
        words_total = word_analysis.get('total_words', len(sentence_text.split()))
        missing_words = word_analysis.get('missing_words', [])
        
        # Phoneme analysis
        phoneme_analysis = result.get('phoneme_analysis', {})
        weak_phonemes = result.get('weak_phonemes', [])
        weak_words = result.get('weak_words', [])
        
        # Build phoneme_scores dict for compatibility
        phoneme_scores = {}
        for pr in phoneme_analysis.get('phoneme_results', []):
            p = pr['phoneme']
            if p not in phoneme_scores:
                phoneme_scores[p] = []
            phoneme_scores[p].append(pr['score'])
        phoneme_scores = {p: int(sum(scores)/len(scores)) for p, scores in phoneme_scores.items()}
        
        transcription = result.get('transcription', '')
        
        # Generate simple feedback
        if accuracy >= 90:
            feedback = "Excellent! Your pronunciation is very clear."
        elif accuracy >= 75:
            feedback = "Good job! You're speaking clearly."
        elif accuracy >= 60:
            feedback = "Keep practicing! Focus on clarity."
        else:
            feedback = "Practice more! Pay attention to each word."
        
        if missing_words:
            feedback += f" Missing: {', '.join(missing_words[:3])}."
        if weak_words:
            feedback += f" Practice: {', '.join([w.get('word', '') for w in weak_words[:3]])}."
        
        # Generate detailed error messages
        errors = []
        
        # Phoneme errors
        for phoneme, score in phoneme_scores.items():
            if score < 75:
                errors.append(f"Phoneme /{phoneme}/ needs improvement ({score}% accuracy)")
        
        # Word errors
        if weak_words:
            for word_info in weak_words[:3]:
                errors.append(
                    f"Word '{word_info['word']}' → You said '{word_info.get('spoken_as', '?')}' "
                    f"({word_info.get('accuracy', 0)}% match)"
                )
        
        # Missing words
        if missing_words:
            errors.append(f"Missing or unclear: {', '.join(missing_words)}")
        
        # Add feedback
        errors.append(feedback)
        
        # Calculate duration
        import wave
        try:
            with wave.open(user_audio_path, 'rb') as wav_file:
                frames = wav_file.getnframes()
                rate = wav_file.getframerate()
                duration = frames / float(rate)
        except:
            duration = 3.0
        
        # ENHANCED: Save practice session with all data
        session = PracticeSession(
            user_id=current_user.id,
            sentence=sentence_text,
            
            # Audio paths
            user_audio_path=user_audio_path,
            reference_audio_path=reference_audio_path,
            
            # Analysis results
            accuracy=accuracy,
            
            # Phoneme analysis
            weak_phonemes=weak_phonemes,
            phoneme_scores=phoneme_scores,
            phoneme_timings=phoneme_analysis.get('phoneme_timings', []),
            
            # Word analysis
            weak_words=[w.get('word', '') if isinstance(w, dict) else w for w in weak_words],
            missing_words=missing_words,
            word_timings=phoneme_analysis.get('word_timings', []),
            
            # Feedback
            feedback=feedback
        )
        db.add(session)
        
        # Update user stats
        stats = db.query(UserStats).filter(UserStats.user_id == current_user.id).first()
        if stats:
            stats.total_sessions += 1
            if stats.average_accuracy == 0:
                stats.average_accuracy = accuracy
            else:
                total = stats.total_sessions
                stats.average_accuracy = ((stats.average_accuracy * (total - 1)) + accuracy) / total
            
            today = datetime.now().date()
            if stats.last_practice_date:
                last_date = stats.last_practice_date.date()
                if last_date == today:
                    pass
                elif last_date == today - timedelta(days=1):
                    stats.streak_days += 1
                else:
                    stats.streak_days = 1
            else:
                stats.streak_days = 1
            
            stats.last_practice_date = datetime.now()
            stats.xp_points += int(accuracy / 10)
        
        db.commit()
        db.refresh(session)
        
        # Smart Post-Recommendation Logic
        if accuracy >= 85:
            # User mastered this - mark for skipping
            session.mastered = True
            print(f"   🎉 User mastered this sentence (score: {accuracy}%)")
        else:
            # User needs practice - mark as priority
            session.mastered = False
            print(f"   💪 User needs practice (score: {accuracy}%)")
        
        db.commit()
        
        print(f"\n✅ Analysis complete!")
        print(f"   Accuracy: {accuracy}%")
        print(f"   Words: {words_correct}/{words_total}")
        print(f"   Weak Phonemes: {', '.join(weak_phonemes) if weak_phonemes else 'None'}")
        print(f"   DTW Similarity: {result.get('dtw_similarity', 0):.1f}%")
        
        # Return comprehensive analysis
        return {
            "success": True,
            "session_id": session.id,
            
            # Audio paths
            "user_audio_path": user_audio_path,
            "reference_audio_path": reference_audio_path,
            
            # Overall metrics
            "accuracy": int(accuracy),
            "duration": round(float(duration), 2),
            "pronunciation_score": int(phoneme_analysis.get('average_score', accuracy)),
            
            # Word analysis
            "words_correct": int(words_correct),
            "words_total": int(words_total),
            "weak_words": weak_words,
            "missing_words": missing_words,
            "word_timings": phoneme_analysis.get('word_timings', []),
            "word_analysis": word_analysis,  # NEW: Detailed word analysis
            
            # Phoneme analysis
            "phoneme_errors": phoneme_scores,
            "weak_phonemes": weak_phonemes,
            "phoneme_timings": phoneme_analysis.get('phoneme_timings', []),
            "phoneme_results": phoneme_analysis.get('phoneme_results', []),
            
            # Audio comparison
            "dtw_similarity": result.get('dtw_similarity', 0),
            "asr_confidence": result.get('asr_confidence', 0),
            
            # Transcription
            "transcription": transcription,
            "expected_text": sentence_text.lower(),
            
            # Feedback
            "errors": errors,
            "feedback": feedback,
            
            # Intelligent feedback
            "intelligent_feedback": result.get('intelligent_feedback', {}),
            
            # Post-recommendation status
            "mastered": accuracy >= 85,
            "recommendation_status": "mastered" if accuracy >= 85 else "needs_practice"
        }
        
    except Exception as e:
        print(f"❌ Error analyzing speech: {e}")
        import traceback
        traceback.print_exc()
        
        if 'user_audio_path' in locals() and os.path.exists(user_audio_path):
            os.remove(user_audio_path)
        raise HTTPException(status_code=500, detail=f"Speech analysis failed: {str(e)}")


@router.post("/regenerate-recommendations")
async def regenerate_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Regenerate recommendations based on performance history
    Triggered automatically after every 5 practice sessions
    """
    try:
        from ai_engine.recommendation_engine import RecommendationEngine
        from ai_engine.voice_generator import VoiceGenerator
        
        print(f"\n🔄 Regenerating recommendations for user {current_user.id}")
        
        # Get user profile
        profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        # Get performance history
        sessions = db.query(PracticeSession)\
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
            for session in sessions
        ]
        
        # Use intelligent recommendation engine
        rec_engine = RecommendationEngine()
        result = rec_engine.generate_recommendations(
            profile={
                'age': profile.age,
                'gender': profile.gender,
                'native_language': profile.native_language,
                'speech_disorder_type': profile.speech_disorder_type,
                'current_severity': profile.current_severity,
                'therapy_goal': profile.therapy_goal,
                'interests': profile.interests or '',
                'trouble_sounds': profile.trouble_sounds or ''
            },
            performance_history=history_data
        )
        
        sentences = result['sentences']
        rec_type = result['type']
        reason = result['reason']
        
        print(f"✅ Generated {len(sentences)} {rec_type.upper()}-recommendations")
        print(f"   Reason: {reason}")
        
        # Generate audio
        try:
            voice_gen = VoiceGenerator()
            voice_gen.cleanup_old_audio(current_user.id)
            
            audio_results = voice_gen.generate_batch_audio(
                sentences=sentences,
                age=profile.age,
                gender=profile.gender,
                user_id=current_user.id
            )
            print(f"✅ Generated {len(audio_results)} audio files")
        except Exception as audio_error:
            print(f"⚠️  Audio generation failed: {audio_error}")
        
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
        
        print(f"✅ New recommendations saved and activated")
        
        return {
            "success": True,
            "type": rec_type,
            "reason": reason,
            "sentences": sentences,
            "message": f"Generated {len(sentences)} new {rec_type}-recommendations"
        }
        
    except Exception as e:
        print(f"❌ Error regenerating recommendations: {e}")
        raise HTTPException(status_code=500, detail=str(e))
