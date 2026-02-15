"""
Edge TTS Voice Generator - High Quality Neural Voices
Uses Microsoft Edge TTS with real male/female neural voices
"""

import edge_tts
import asyncio
import os
from typing import Dict, List
from pathlib import Path

class EdgeVoiceGenerator:
    """
    Generate age and gender appropriate voices using Edge TTS
    Provides HIGH QUALITY neural voices with real male/female distinction
    """
    
    # Age group configuration with appropriate voices
    AGE_GROUPS = {
        'child': {
            'range': (1, 10),
            'male': {
                'voice': 'en-US-GuyNeural',  # Young male voice
                'rate': '-10%',  # Slightly slower
                'description': 'Male child voice (1-10 years)'
            },
            'female': {
                'voice': 'en-US-JennyNeural',  # Young female voice
                'rate': '-10%',
                'description': 'Female child voice (1-10 years)'
            }
        },
        'teenager': {
            'range': (11, 18),
            'male': {
                'voice': 'en-US-GuyNeural',
                'rate': '+0%',
                'description': 'Male teenager voice (11-18 years)'
            },
            'female': {
                'voice': 'en-US-JennyNeural',
                'rate': '+0%',
                'description': 'Female teenager voice (11-18 years)'
            }
        },
        'young_adult': {
            'range': (19, 40),
            'male': {
                'voice': 'en-IN-PrabhatNeural',  # Indian English Male
                'rate': '+0%',
                'description': 'Male young adult voice (19-40 years)'
            },
            'female': {
                'voice': 'en-IN-NeerjaNeural',  # Indian English Female
                'rate': '+0%',
                'description': 'Female young adult voice (19-40 years)'
            }
        },
        'middle_age': {
            'range': (41, 60),
            'male': {
                'voice': 'en-US-ChristopherNeural',  # Mature male
                'rate': '-5%',
                'description': 'Male middle-aged voice (41-60 years)'
            },
            'female': {
                'voice': 'en-US-AriaNeural',  # Mature female
                'rate': '-5%',
                'description': 'Female middle-aged voice (41-60 years)'
            }
        },
        'senior': {
            'range': (61, 100),
            'male': {
                'voice': 'en-US-ChristopherNeural',
                'rate': '-15%',  # Slower for seniors
                'description': 'Male senior voice (61+ years)'
            },
            'female': {
                'voice': 'en-US-AriaNeural',
                'rate': '-15%',
                'description': 'Female senior voice (61+ years)'
            }
        }
    }
    
    def __init__(self, audio_dir: str = "uploads/audio/reference"):
        """Initialize Edge TTS voice generator"""
        self.audio_dir = audio_dir
        os.makedirs(audio_dir, exist_ok=True)
        self.available = True
        
        print("✅ Edge TTS initialized (high-quality neural voices)")
    
    def get_age_group(self, age: int) -> str:
        """Determine age group from age"""
        for group, config in self.AGE_GROUPS.items():
            min_age, max_age = config['range']
            if min_age <= age <= max_age:
                return group
        return 'young_adult'  # Default
    
    def get_voice_config(self, age: int, gender: str) -> Dict:
        """Get voice configuration for age and gender"""
        age_group = self.get_age_group(age)
        
        # Properly detect gender - check for female keywords, default to male
        gender_lower = gender.lower() if gender else ''
        gender_key = 'female' if gender_lower in ['female', 'f', 'woman', 'girl'] else 'male'
        
        config = self.AGE_GROUPS[age_group][gender_key].copy()
        config['age_group'] = age_group
        config['gender'] = gender_key
        
        return config
    
    async def generate_reference_audio_async(
        self, 
        sentence: str, 
        age: int, 
        gender: str,
        sentence_id: int,
        user_id: int
    ) -> str:
        """
        Generate age and gender appropriate reference audio (async)
        
        Args:
            sentence: The practice sentence
            age: User's age (1-100)
            gender: User's gender (Male/Female)
            sentence_id: Unique sentence identifier
            user_id: User ID
            
        Returns:
            Path to generated audio file
        """
        try:
            # Get voice configuration
            voice_config = self.get_voice_config(age, gender)
            
            # Debug logging
            print(f"🎙️  Voice Generation Debug:")
            print(f"   Input Gender: '{gender}' (type: {type(gender).__name__})")
            print(f"   Detected Gender: '{voice_config['gender']}'")
            print(f"   Age: {age} → Age Group: '{voice_config['age_group']}'")
            
            # Create filename
            age_group = voice_config['age_group']
            gender_code = voice_config['gender']
            filename = f"ref_{user_id}_{sentence_id}_{age_group}_{gender_code}.mp3"
            filepath = os.path.join(self.audio_dir, filename)
            
            # Skip if already exists
            if os.path.exists(filepath):
                print(f"♻️  Using cached audio: {filename}")
                return f"/uploads/audio/reference/{filename}"
            
            # Generate audio using Edge TTS
            voice = voice_config['voice']
            rate = voice_config['rate']
            
            communicate = edge_tts.Communicate(sentence, voice, rate=rate)
            await communicate.save(filepath)
            
            print(f"✅ Generated: {filename}")
            print(f"   {voice_config['description']}")
            print(f"   Voice: {voice}")
            print(f"   Rate: {rate}")
            
            return f"/uploads/audio/reference/{filename}"
            
        except Exception as e:
            print(f"❌ Error generating audio: {e}")
            return None
    
    def generate_reference_audio(
        self, 
        sentence: str, 
        age: int, 
        gender: str,
        sentence_id: int,
        user_id: int
    ) -> str:
        """
        Generate reference audio (sync wrapper)
        """
        return asyncio.run(self.generate_reference_audio_async(
            sentence, age, gender, sentence_id, user_id
        ))
    
    async def generate_batch_audio_async(
        self,
        sentences: List[str],
        age: int,
        gender: str,
        user_id: int
    ) -> List[Dict]:
        """
        Generate audio for multiple sentences (async)
        """
        results = []
        
        voice_config = self.get_voice_config(age, gender)
        
        print(f"\n🎙️  Generating {len(sentences)} reference audio files...")
        print(f"   User: {user_id}, Age: {age}, Gender: {gender}")
        print(f"   Voice: {voice_config['description']}")
        print(f"   Using: {voice_config['voice']}")
        
        for idx, sentence in enumerate(sentences, 1):
            audio_path = await self.generate_reference_audio_async(
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
    
    def generate_batch_audio(
        self,
        sentences: List[str],
        age: int,
        gender: str,
        user_id: int
    ) -> List[Dict]:
        """
        Generate audio for multiple sentences (sync wrapper)
        """
        return asyncio.run(self.generate_batch_audio_async(
            sentences, age, gender, user_id
        ))
    
    def cleanup_old_audio(self, user_id: int):
        """Remove old reference audio for a user"""
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
    
    def get_voice_info(self, age: int, gender: str) -> Dict:
        """Get information about the voice that will be used"""
        voice_config = self.get_voice_config(age, gender)
        return {
            'age_group': voice_config['age_group'],
            'gender': voice_config['gender'],
            'description': voice_config['description'],
            'voice': voice_config['voice'],
            'rate': voice_config['rate']
        }


# For backward compatibility
AdvancedVoiceGenerator = EdgeVoiceGenerator
