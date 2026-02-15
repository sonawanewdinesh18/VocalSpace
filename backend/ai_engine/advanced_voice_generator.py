"""
Advanced Voice Generator - Age and Gender Appropriate TTS
Generates realistic reference audio with proper voice characteristics for each demographic
"""

from gtts import gTTS
import os
from typing import Dict, List, Tuple
from pathlib import Path
import subprocess

class AdvancedVoiceGenerator:
    """
    Generate age and gender appropriate voices for practice sentences
    
    Age Groups:
    - Child (1-10): Child voices (male/female)
    - Teenager (11-18): Teen voices (male/female)
    - Young Adult (19-40): Young adult voices (male/female)
    - Middle Age (41-60): Mature adult voices (male/female)
    - Senior (61-100): Senior voices (male/female)
    """
    
    # Detailed age group configuration
    AGE_GROUPS = {
        'child': {
            'range': (1, 10),
            'male': {
                'pitch': '+50Hz',  # Higher pitch for child
                'speed': 0.85,     # Slower speech
                'description': 'Male child voice (1-10 years)',
                'gtts_lang': 'en',
                'gtts_tld': 'com.au'  # Australian English (clearer for children)
            },
            'female': {
                'pitch': '+80Hz',  # Even higher for female child
                'speed': 0.85,
                'description': 'Female child voice (1-10 years)',
                'gtts_lang': 'en',
                'gtts_tld': 'co.uk'  # British English
            }
        },
        'teenager': {
            'range': (11, 18),
            'male': {
                'pitch': '+20Hz',  # Slightly higher for teen
                'speed': 1.0,
                'description': 'Male teenager voice (11-18 years)',
                'gtts_lang': 'en',
                'gtts_tld': 'com'  # US English
            },
            'female': {
                'pitch': '+40Hz',
                'speed': 1.0,
                'description': 'Female teenager voice (11-18 years)',
                'gtts_lang': 'en',
                'gtts_tld': 'ca'  # Canadian English
            }
        },
        'young_adult': {
            'range': (19, 40),
            'male': {
                'pitch': '0Hz',    # Normal pitch
                'speed': 1.0,
                'description': 'Male young adult voice (19-40 years)',
                'gtts_lang': 'en',
                'gtts_tld': 'com'  # US English
            },
            'female': {
                'pitch': '+15Hz',  # Slightly higher
                'speed': 1.0,
                'description': 'Female young adult voice (19-40 years)',
                'gtts_lang': 'en',
                'gtts_tld': 'com'  # US English
            }
        },
        'middle_age': {
            'range': (41, 60),
            'male': {
                'pitch': '-10Hz',  # Slightly lower for mature voice
                'speed': 0.95,
                'description': 'Male middle-aged voice (41-60 years)',
                'gtts_lang': 'en',
                'gtts_tld': 'com'  # US English
            },
            'female': {
                'pitch': '+5Hz',
                'speed': 0.95,
                'description': 'Female middle-aged voice (41-60 years)',
                'gtts_lang': 'en',
                'gtts_tld': 'co.uk'  # British English
            }
        },
        'senior': {
            'range': (61, 100),
            'male': {
                'pitch': '-20Hz',  # Lower pitch for senior
                'speed': 0.85,     # Slower, clearer speech
                'description': 'Male senior voice (61+ years)',
                'gtts_lang': 'en',
                'gtts_tld': 'com.au'  # Australian English
            },
            'female': {
                'pitch': '-5Hz',
                'speed': 0.85,
                'description': 'Female senior voice (61+ years)',
                'gtts_lang': 'en',
                'gtts_tld': 'co.uk'  # British English
            }
        }
    }
    
    def __init__(self, audio_dir: str = "uploads/audio/reference"):
        """Initialize advanced voice generator"""
        self.audio_dir = audio_dir
        os.makedirs(audio_dir, exist_ok=True)
        
        # Check if ffmpeg is available for pitch adjustment
        self.has_ffmpeg = self._check_ffmpeg()
        if not self.has_ffmpeg:
            print("⚠️  ffmpeg not found - pitch adjustment disabled")
            print("💡 Install ffmpeg for better voice quality: https://ffmpeg.org/download.html")
    
    def _check_ffmpeg(self) -> bool:
        """Check if ffmpeg is installed"""
        try:
            subprocess.run(['ffmpeg', '-version'], 
                         stdout=subprocess.DEVNULL, 
                         stderr=subprocess.DEVNULL)
            return True
        except FileNotFoundError:
            return False
    
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
    
    def generate_reference_audio(
        self, 
        sentence: str, 
        age: int, 
        gender: str,
        sentence_id: int,
        user_id: int
    ) -> str:
        """
        Generate age and gender appropriate reference audio
        
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
            
            # Generate base TTS with gTTS
            temp_file = filepath.replace('.mp3', '_temp.mp3')
            
            # Use appropriate language variant for voice diversity
            tts = gTTS(
                text=sentence,
                lang=voice_config['gtts_lang'],
                tld=voice_config['gtts_tld'],
                slow=(voice_config['speed'] < 0.95)
            )
            tts.save(temp_file)
            
            # Apply pitch adjustment if ffmpeg is available
            if self.has_ffmpeg and voice_config['pitch'] != '0Hz':
                self._adjust_pitch(temp_file, filepath, voice_config['pitch'])
                os.remove(temp_file)
            else:
                os.rename(temp_file, filepath)
            
            print(f"✅ Generated: {filename}")
            print(f"   {voice_config['description']}")
            print(f"   Pitch: {voice_config['pitch']}, Speed: {voice_config['speed']}x")
            
            return f"/uploads/audio/reference/{filename}"
            
        except Exception as e:
            print(f"❌ Error generating audio: {e}")
            # Fallback to simple generation
            return self._generate_fallback_audio(sentence, age, gender, sentence_id, user_id)
    
    def _adjust_pitch(self, input_file: str, output_file: str, pitch: str):
        """Adjust audio pitch using ffmpeg"""
        try:
            # Convert pitch string to semitones
            # +50Hz ≈ +5 semitones, +20Hz ≈ +2 semitones, etc.
            pitch_value = int(pitch.replace('Hz', ''))
            semitones = pitch_value / 10  # Rough conversion
            
            # Use ffmpeg to adjust pitch
            cmd = [
                'ffmpeg', '-i', input_file,
                '-af', f'asetrate=44100*{1 + semitones/12},aresample=44100',
                '-y', output_file
            ]
            
            subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
            
        except Exception as e:
            print(f"⚠️  Pitch adjustment failed: {e}")
            # Fallback: just copy the file
            os.rename(input_file, output_file)
    
    def _generate_fallback_audio(
        self,
        sentence: str,
        age: int,
        gender: str,
        sentence_id: int,
        user_id: int
    ) -> str:
        """Fallback to simple gTTS generation"""
        try:
            age_group = self.get_age_group(age)
            gender_code = 'male' if gender and gender.lower() in ['male', 'm'] else 'female'
            filename = f"ref_{user_id}_{sentence_id}_{age_group}_{gender_code}.mp3"
            filepath = os.path.join(self.audio_dir, filename)
            
            # Simple gTTS generation
            slow = age_group in ['child', 'senior']
            tts = gTTS(text=sentence, lang='en', slow=slow)
            tts.save(filepath)
            
            print(f"✅ Generated (fallback): {filename}")
            return f"/uploads/audio/reference/{filename}"
            
        except Exception as e:
            print(f"❌ Fallback generation failed: {e}")
            return None
    
    def generate_batch_audio(
        self,
        sentences: List[str],
        age: int,
        gender: str,
        user_id: int
    ) -> List[Dict]:
        """
        Generate audio for multiple sentences with age/gender appropriate voices
        
        Args:
            sentences: List of practice sentences
            age: User's age (1-100)
            gender: User's gender (Male/Female)
            user_id: User ID
            
        Returns:
            List of dicts with sentence and audio_path
        """
        results = []
        
        voice_config = self.get_voice_config(age, gender)
        
        print(f"\n🎙️  Generating {len(sentences)} reference audio files...")
        print(f"   User: {user_id}, Age: {age}, Gender: {gender}")
        print(f"   Voice: {voice_config['description']}")
        print(f"   Settings: Pitch {voice_config['pitch']}, Speed {voice_config['speed']}x")
        
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
    
    def get_voice_info(self, age: int, gender: str) -> Dict:
        """Get information about the voice that will be used"""
        voice_config = self.get_voice_config(age, gender)
        return {
            'age_group': voice_config['age_group'],
            'gender': voice_config['gender'],
            'description': voice_config['description'],
            'pitch': voice_config['pitch'],
            'speed': voice_config['speed'],
            'language_variant': voice_config['gtts_tld']
        }


# For backward compatibility, create alias
VoiceGenerator = AdvancedVoiceGenerator
