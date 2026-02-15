"""
Generate missing reference audio files for existing users using Edge TTS
Run this if audio files are missing after profile completion
"""

import asyncio
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.db.models import User, UserProfile, Recommendation
from ai_engine.edge_voice_generator import EdgeVoiceGenerator
import os

async def generate_audio_for_users_async():
    """Generate reference audio for all users with active recommendations (async)"""
    
    print("=" * 80)
    print("🎙️  GENERATE MISSING REFERENCE AUDIO (Edge TTS)")
    print("=" * 80)
    print()
    
    db = SessionLocal()
    
    try:
        # Get all users with active recommendations
        users_with_recommendations = db.query(User).join(Recommendation).filter(
            Recommendation.is_active == True
        ).all()
        
        if not users_with_recommendations:
            print("❌ No users with active recommendations found.")
            print()
            print("💡 Users need to complete their profile first to get recommendations.")
            return
        
        print(f"📋 Found {len(users_with_recommendations)} users with recommendations")
        print()
        
        voice_gen = EdgeVoiceGenerator()
        
        total_generated = 0
        total_skipped = 0
        total_errors = 0
        
        for user in users_with_recommendations:
            print(f"\n👤 Processing User: {user.full_name} (ID: {user.id})")
            
            # Get user profile
            profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
            
            if not profile:
                print(f"   ⚠️  No profile found. Skipping...")
                total_skipped += 1
                continue
            
            # Get active recommendations
            recommendation = db.query(Recommendation).filter(
                Recommendation.user_id == user.id,
                Recommendation.is_active == True
            ).first()
            
            if not recommendation or not recommendation.sentences:
                print(f"   ⚠️  No sentences found. Skipping...")
                total_skipped += 1
                continue
            
            print(f"   Age: {profile.age}, Gender: {profile.gender}")
            print(f"   Sentences: {len(recommendation.sentences)}")
            
            # Get voice info
            voice_info = voice_gen.get_voice_info(profile.age, profile.gender)
            print(f"   Voice: {voice_info['description']}")
            print(f"   Model: {voice_info['voice']}")
            print()
            
            # Generate audio for each sentence
            for idx, sentence in enumerate(recommendation.sentences, 1):
                try:
                    # Check if file already exists
                    age_group = voice_info['age_group']
                    gender_code = voice_info['gender']
                    filename = f"ref_{user.id}_{idx}_{age_group}_{gender_code}.mp3"
                    filepath = os.path.join(voice_gen.audio_dir, filename)
                    
                    if os.path.exists(filepath):
                        print(f"   ♻️  Sentence {idx}: Already exists, skipping")
                        total_skipped += 1
                        continue
                    
                    # Generate audio using Edge TTS (async)
                    audio_path = await voice_gen.generate_reference_audio_async(
                        sentence=sentence,
                        age=profile.age,
                        gender=profile.gender,
                        sentence_id=idx,
                        user_id=user.id
                    )
                    
                    if audio_path:
                        print(f"   ✅ Sentence {idx}: Generated successfully")
                        total_generated += 1
                    else:
                        print(f"   ❌ Sentence {idx}: Generation failed")
                        total_errors += 1
                        
                except Exception as e:
                    print(f"   ❌ Sentence {idx}: Error - {e}")
                    total_errors += 1
        
        print()
        print("=" * 80)
        print("📊 GENERATION SUMMARY")
        print("=" * 80)
        print()
        print(f"✅ Generated: {total_generated} files")
        print(f"♻️  Skipped: {total_skipped} files (already exist)")
        print(f"❌ Errors: {total_errors} files")
        print()
        
        if total_generated > 0:
            print("🎉 Audio generation complete!")
            print()
            print("💡 Next steps:")
            print("   1. Restart the backend server")
            print("   2. Refresh the frontend")
            print("   3. Audio should now play correctly")
        else:
            print("⚠️  No new audio files were generated.")
            print()
            print("💡 Possible reasons:")
            print("   - All audio files already exist")
            print("   - No users with recommendations")
            print("   - edge-tts library not installed (pip install edge-tts)")
            print("   - No internet connection (Edge TTS requires online access)")
        
        print()
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print()
        import traceback
        traceback.print_exc()
    finally:
        db.close()


def generate_audio_for_users():
    """Sync wrapper for async function"""
    asyncio.run(generate_audio_for_users_async())


def check_audio_directory():
    """Check if audio directory exists and is writable"""
    
    print("🔍 Checking audio directory...")
    print()
    
    audio_dir = "uploads/audio/reference"
    
    # Check if directory exists
    if not os.path.exists(audio_dir):
        print(f"❌ Directory does not exist: {audio_dir}")
        print(f"   Creating directory...")
        try:
            os.makedirs(audio_dir, exist_ok=True)
            print(f"   ✅ Directory created successfully")
        except Exception as e:
            print(f"   ❌ Failed to create directory: {e}")
            return False
    else:
        print(f"✅ Directory exists: {audio_dir}")
    
    # Check if directory is writable
    test_file = os.path.join(audio_dir, ".test_write")
    try:
        with open(test_file, 'w') as f:
            f.write("test")
        os.remove(test_file)
        print(f"✅ Directory is writable")
    except Exception as e:
        print(f"❌ Directory is not writable: {e}")
        return False
    
    # List existing files
    files = os.listdir(audio_dir)
    if files:
        print(f"📁 Found {len(files)} existing audio files")
    else:
        print(f"📁 No audio files found (will generate)")
    
    print()
    return True


def check_dependencies():
    """Check if required dependencies are installed"""
    
    print("🔍 Checking dependencies...")
    print()
    
    # Check edge-tts
    try:
        import edge_tts
        print("✅ edge-tts is installed (Microsoft Neural Voices)")
    except ImportError:
        print("❌ edge-tts is not installed")
        print("   Install with: pip install edge-tts")
        return False
    
    print()
    return True


if __name__ == "__main__":
    print()
    print("🎙️  VocalSpace - Reference Audio Generator")
    print()
    
    # Check dependencies
    if not check_dependencies():
        print("❌ Missing required dependencies. Please install them first.")
        exit(1)
    
    # Check audio directory
    if not check_audio_directory():
        print("❌ Audio directory check failed. Please fix the issues above.")
        exit(1)
    
    # Generate audio
    generate_audio_for_users()
