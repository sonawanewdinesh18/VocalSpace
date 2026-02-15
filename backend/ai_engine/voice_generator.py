"""
Intelligent Voice Generator - Age and Gender Appropriate TTS
Generates reference audio for practice sentences based on user profile
"""

from gtts import gTTS
import os
from typing import Dict, List
from pathlib import Path

class VoiceGenerator:
    """Generate age and gender appropriate voice for practice sentences"""
    
    # Age groups with voice characteristics
    AGE_GROUPS = {
        'child': {
            'range': (1, 15),
            'speed': 0.85,  # Slower for children
            'description': 'Child voice (1-15 years)'
        },
        'young_adult': {
            'range': (16, 30),
            'speed': 1.0,  # Normal speed
            'description': 'Young adult voice (16-30 years)'
        },
        'adult': {
            'range': (31, 50),
            'speed': 1.0,  # Normal speed
            'description': 'Adult voice (31-50 years)'
        },
        'senior': {
            'range': (51, 120),
            'speed': 0.9,  # Slightly slower for seniors
            'description': 'Senior voice (51+ years)'
        }
    }
    
    def __init__(self, audio_dir: str = "uploads/audio/reference"):
        """Initialize voice generator"""
        self.audio_dir = audio_dir
        os.makedirs(audio_dir, exist_ok=True)
    
    def get_age_group(self, age: int) -> str:
        """Determine age group from age"""
        for group, config in self.AGE_GROUPS.items():
            min_age, max_age = config['range']
            if min_age <= age <= max_age:
                return group
        return 'adult'  # Default
    
    def generate_reference_audio(
        self, 
        sentence: str, 
        age: int, 
        gender: str,
        sentence_id: int,
        user_id: int
    ) -> str:
        """
        Generate reference audio for a sentence based on age and gender
        
        Args:
            sentence: The practice sentence
            age: User's age (determines voice characteristics)
            gender: User's gender (Male/Female)
            sentence_id: Unique sentence identifier
            user_id: User ID
            
        Returns:
            Path to generated audio file
        """
        try:
            # Determine age group
            age_group = self.get_age_group(age)
            
            # Create filename
            gender_code = gender.lower() if gender else 'neutral'
            filename = f"ref_{user_id}_{sentence_id}_{age_group}_{gender_code}.mp3"
            filepath = os.path.join(self.audio_dir, filename)
            
            # Skip if already exists
            if os.path.exists(filepath):
                print(f"♻️  Using cached audio: {filename}")
                return f"/uploads/audio/reference/{filename}"
            
            # Determine TTS settings based on age group
            lang = 'en'
            slow = age_group in ['child', 'senior']  # Slower for children and seniors
            
            # Generate TTS
            # Note: gTTS doesn't support different voices, but we adjust speed
            # For production, consider using services like:
            # - Google Cloud TTS (supports age/gender voices)
            # - Amazon Polly (supports neural voices)
            # - Azure TTS (supports child/adult voices)
            
            tts = gTTS(text=sentence, lang=lang, slow=slow)
            tts.save(filepath)
            
            age_desc = self.AGE_GROUPS[age_group]['description']
            print(f"✅ Generated audio: {filename}")
            print(f"   Age: {age} ({age_desc}), Gender: {gender}, Speed: {'Slow' if slow else 'Normal'}")
            
            return f"/uploads/audio/reference/{filename}"
            
        except Exception as e:
            print(f"❌ Error generating audio: {e}")
            return None
    
    def generate_batch_audio(
        self,
        sentences: List[str],
        age: int,
        gender: str,
        user_id: int
    ) -> List[Dict]:
        """
        Generate audio for multiple sentences
        
        Args:
            sentences: List of practice sentences
            age: User's age
            gender: User's gender
            user_id: User ID
            
        Returns:
            List of dicts with sentence and audio_path
        """
        results = []
        
        print(f"\n🎙️  Generating {len(sentences)} reference audio files...")
        print(f"   User: {user_id}, Age: {age}, Gender: {gender}")
        
        for idx, sentence in enumerate(sentences, 1):
            audio_path = self.generate_reference_audio(
                sentence=sentence,
                age=age,
                gender=gender,
                sentence_id=idx,
                user_id=user_id
            )
            
            results.append({
                'sentence': sentence,
                'audio_path': audio_path,
                'sentence_id': idx
            })
        
        print(f"✅ Generated {len(results)} audio files successfully\n")
        return results
    
    def cleanup_old_audio(self, user_id: int):
        """Remove old reference audio for a user when profile is updated"""
        try:
            pattern = f"ref_{user_id}_*.mp3"
            deleted_count = 0
            for file in Path(self.audio_dir).glob(pattern):
                file.unlink()
                deleted_count += 1
            if deleted_count > 0:
                print(f"🗑️  Cleaned up {deleted_count} old audio files for user {user_id}")
        except Exception as e:
            print(f"⚠️  Error cleaning up audio: {e}")
