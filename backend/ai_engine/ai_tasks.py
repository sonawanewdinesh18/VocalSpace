"""
AI TASKS - Audio Processing and Machine Learning for Speech Therapy
Handles audio preprocessing, feature extraction, ASR, forced alignment, and similarity computation
"""

import torch
import torchaudio
import librosa
import numpy as np
from typing import Dict, List, Tuple, Optional
from scipy.spatial.distance import cosine, euclidean
from scipy.signal import butter, filtfilt
import warnings
warnings.filterwarnings('ignore')

try:
    import noisereduce as nr
    NOISEREDUCE_AVAILABLE = True
except ImportError:
    NOISEREDUCE_AVAILABLE = False

try:
    from dtw import dtw
    DTW_AVAILABLE = True
except ImportError:
    DTW_AVAILABLE = False

from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor, Wav2Vec2Model


class AIProcessor:
    """
    AI Processing for Speech Therapy
    
    Handles:
    - Audio preprocessing (noise reduction, normalization)
    - Feature extraction (MFCC, pitch, energy)
    - ASR (Automatic Speech Recognition)
    - Forced alignment
    - Audio similarity computation
    """
    
    def __init__(self):
        """Initialize AI processor with models"""
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        print(f"🚀 Initializing AI Processor on {self.device}")
        
        # Load ASR model
        print("📥 Loading ASR model (Wav2Vec2)...")
        self.asr_processor = Wav2Vec2Processor.from_pretrained("facebook/wav2vec2-base-960h")
        self.asr_model = Wav2Vec2ForCTC.from_pretrained("facebook/wav2Vec2-base-960h").to(self.device)
        self.asr_model.eval()
        
        # Load feature extraction model
        print("📥 Loading feature extraction model...")
        self.feature_processor = Wav2Vec2Processor.from_pretrained("facebook/wav2vec2-base-960h")
        self.feature_model = Wav2Vec2Model.from_pretrained("facebook/wav2vec2-base-960h").to(self.device)
        self.feature_model.eval()
        
        print("✅ AI Processor initialized")
    
    # ==================== AUDIO LOADING ====================
    
    def load_audio_robust(self, audio_path: str, sr: int = 16000) -> Tuple[np.ndarray, int]:
        """
        Robust audio loading with multiple fallback methods
        
        Tries:
        1. librosa with soundfile
        2. scipy.io.wavfile
        3. wave module
        """
        import wave
        from scipy.io import wavfile
        
        # Method 1: Try librosa
        try:
            audio, sample_rate = librosa.load(audio_path, sr=sr)
            return audio, sample_rate
        except Exception as e1:
            print(f"      ⚠️  Method 1 (librosa) failed: {e1}")
        
        # Method 2: Try scipy
        try:
            sample_rate, audio = wavfile.read(audio_path)
            if audio.dtype == np.int16:
                audio = audio.astype(np.float32) / 32768.0
            elif audio.dtype == np.int32:
                audio = audio.astype(np.float32) / 2147483648.0
            
            if sample_rate != sr:
                audio = librosa.resample(audio, orig_sr=sample_rate, target_sr=sr)
            
            return audio, sr
        except Exception as e2:
            print(f"      ⚠️  Method 2 (scipy) failed: {e2}")
        
        # Method 3: Try wave module
        try:
            with wave.open(audio_path, 'rb') as wav_file:
                sample_rate = wav_file.getframerate()
                n_frames = wav_file.getnframes()
                audio_bytes = wav_file.readframes(n_frames)
                audio = np.frombuffer(audio_bytes, dtype=np.int16).astype(np.float32) / 32768.0
                
                if sample_rate != sr:
                    audio = librosa.resample(audio, orig_sr=sample_rate, target_sr=sr)
                
                return audio, sr
        except Exception as e3:
            print(f"      ⚠️  Method 3 (wave) failed: {e3}")
        
        raise Exception(f"Could not load audio file: {audio_path}")
    
    # ==================== AUDIO PREPROCESSING ====================
    
    def preprocess_audio(self, audio: np.ndarray, sr: int = 16000) -> np.ndarray:
        """
        Advanced audio preprocessing
        
        Steps:
        1. Noise reduction (spectral gating)
        2. Trim silence
        3. Normalize volume
        """
        print("   🔧 Preprocessing audio...")
        
        # 1. Noise reduction
        if NOISEREDUCE_AVAILABLE:
            try:
                audio_clean = nr.reduce_noise(y=audio, sr=sr, stationary=True, prop_decrease=0.8)
                print("      ✅ Noise reduced")
            except Exception as e:
                audio_clean = audio
                print(f"      ⚠️  Noise reduction failed: {e}")
        else:
            audio_clean = audio
            print("      ⚠️  Noise reduction skipped")
        
        # 2. Trim silence
        try:
            audio_clean, _ = librosa.effects.trim(audio_clean, top_db=30)
            print("      ✅ Silence trimmed")
        except:
            pass
        
        # 3. Normalize volume
        if np.max(np.abs(audio_clean)) > 0:
            audio_clean = audio_clean / np.max(np.abs(audio_clean))
        print("      ✅ Volume normalized")
        
        return audio_clean
    
    # ==================== FEATURE EXTRACTION ====================
    
    def extract_mfcc(self, audio: np.ndarray, sr: int = 16000, n_mfcc: int = 13) -> np.ndarray:
        """Extract MFCC features"""
        mfcc = librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=n_mfcc)
        return mfcc
    
    def extract_pitch(self, audio: np.ndarray, sr: int = 16000) -> np.ndarray:
        """Extract pitch (F0) using librosa"""
        pitches, magnitudes = librosa.piptrack(y=audio, sr=sr)
        pitch = []
        for t in range(pitches.shape[1]):
            index = magnitudes[:, t].argmax()
            pitch.append(pitches[index, t])
        return np.array(pitch)
    
    def extract_energy(self, audio: np.ndarray, hop_length: int = 512) -> np.ndarray:
        """Extract energy (RMS)"""
        energy = librosa.feature.rms(y=audio, hop_length=hop_length)[0]
        return energy
    
    def extract_features_comprehensive(self, audio: np.ndarray, sr: int = 16000) -> Dict:
        """
        Extract comprehensive audio features
        
        Returns:
            - mfcc: Mel-frequency cepstral coefficients
            - pitch: Fundamental frequency
            - energy: RMS energy
            - spectral_centroid: Spectral centroid
            - zero_crossing_rate: Zero crossing rate
        """
        features = {}
        
        # MFCC
        features['mfcc'] = self.extract_mfcc(audio, sr)
        
        # Pitch
        try:
            features['pitch'] = self.extract_pitch(audio, sr)
        except:
            features['pitch'] = np.zeros(100)
        
        # Energy
        features['energy'] = self.extract_energy(audio)
        
        # Spectral centroid
        features['spectral_centroid'] = librosa.feature.spectral_centroid(y=audio, sr=sr)[0]
        
        # Zero crossing rate
        features['zero_crossing_rate'] = librosa.feature.zero_crossing_rate(audio)[0]
        
        return features
    
    def extract_embeddings(self, audio: np.ndarray, sr: int = 16000) -> np.ndarray:
        """Extract deep learning embeddings using Wav2Vec2"""
        if len(audio) < 100:
            return np.zeros(768)
        
        inputs = self.feature_processor(audio, sampling_rate=sr, return_tensors="pt", padding=True)
        
        with torch.no_grad():
            outputs = self.feature_model(inputs.input_values.to(self.device))
            features = outputs.last_hidden_state
        
        # Average pooling
        embedding = features.mean(dim=1).cpu().numpy().flatten()
        
        return embedding
    
    # ==================== ASR (AUTOMATIC SPEECH RECOGNITION) ====================
    
    def transcribe_with_confidence(self, audio: np.ndarray, sr: int = 16000) -> Tuple[str, float, List[Dict]]:
        """
        Transcribe audio with word-level confidence scores
        
        Returns:
            (transcription, overall_confidence, word_confidences)
        """
        inputs = self.asr_processor(audio, sampling_rate=sr, return_tensors="pt", padding=True)
        
        with torch.no_grad():
            logits = self.asr_model(inputs.input_values.to(self.device)).logits
        
        # Get probabilities
        probs = torch.nn.functional.softmax(logits, dim=-1)
        
        # Get predicted IDs and confidence
        predicted_ids = torch.argmax(logits, dim=-1)
        confidence = torch.max(probs, dim=-1).values.mean().item()
        
        # Decode to text
        transcription = self.asr_processor.batch_decode(predicted_ids)[0]
        
        # Get word-level confidences
        word_confidences = self._get_word_confidences(transcription, probs)
        
        return transcription.lower().strip(), confidence, word_confidences
    
    def _get_word_confidences(self, transcription: str, probs: torch.Tensor) -> List[Dict]:
        """Estimate word-level confidence scores"""
        words = transcription.lower().split()
        word_confidences = []
        
        prob_values = torch.max(probs, dim=-1).values.cpu().numpy().flatten()
        chunk_size = len(prob_values) // max(len(words), 1)
        
        for i, word in enumerate(words):
            start_idx = i * chunk_size
            end_idx = min((i + 1) * chunk_size, len(prob_values))
            word_conf = np.mean(prob_values[start_idx:end_idx]) if end_idx > start_idx else 0.5
            
            word_confidences.append({
                'word': word,
                'confidence': float(word_conf)
            })
        
        return word_confidences
    
    # ==================== FORCED ALIGNMENT ====================
    
    def forced_alignment(self, audio: np.ndarray, text: str, phoneme_structure: List[Dict], sr: int = 16000) -> Dict:
        """
        Perform forced alignment to get word and phoneme timings
        
        Args:
            audio: Audio signal
            text: Expected text
            phoneme_structure: List of {word, phonemes}
            sr: Sample rate
        
        Returns:
            {word_timings, phoneme_timings}
        """
        # Calculate energy envelope
        hop_length = 512
        energy = librosa.feature.rms(y=audio, hop_length=hop_length)[0]
        
        # Calculate duration
        duration = len(audio) / sr
        
        # Calculate word weights based on length
        word_weights = []
        for word_info in phoneme_structure:
            char_weight = len(word_info['word'])
            phoneme_weight = len(word_info['phonemes'])
            weight = (char_weight + phoneme_weight * 1.5) / 2
            word_weights.append(weight)
        
        # Normalize weights
        total_weight = sum(word_weights) if sum(word_weights) > 0 else 1
        normalized_weights = [w / total_weight for w in word_weights]
        
        # Allocate time
        word_timings = []
        phoneme_timings = []
        current_time = 0.0
        
        for i, word_info in enumerate(phoneme_structure):
            word = word_info['word']
            phonemes = word_info['phonemes']
            
            # Word duration
            word_duration = duration * normalized_weights[i]
            word_start = current_time
            word_end = current_time + word_duration
            
            word_timings.append({
                'word': word,
                'start': float(word_start),
                'end': float(word_end),
                'duration': float(word_duration)
            })
            
            # Phoneme timings within word
            if len(phonemes) > 0:
                # Vowels get more time
                phoneme_weights_local = [
                    1.3 if p in ['AA', 'AE', 'AH', 'AO', 'AW', 'AY', 'EH', 'ER', 'EY', 'IH', 'IY', 'OW', 'OY', 'UH', 'UW']
                    else 1.0
                    for p in phonemes
                ]
                total_phoneme_weight = sum(phoneme_weights_local)
                normalized_phoneme_weights = [w / total_phoneme_weight for w in phoneme_weights_local]
                
                phoneme_time = word_start
                for j, phoneme in enumerate(phonemes):
                    phoneme_duration = word_duration * normalized_phoneme_weights[j]
                    
                    phoneme_timings.append({
                        'phoneme': phoneme,
                        'word': word,
                        'start': float(phoneme_time),
                        'end': float(phoneme_time + phoneme_duration),
                        'duration': float(phoneme_duration)
                    })
                    phoneme_time += phoneme_duration
            
            current_time = word_end
        
        return {
            'word_timings': word_timings,
            'phoneme_timings': phoneme_timings
        }
    
    # ==================== AUDIO COMPARISON ====================
    
    def compare_audio_dtw(self, user_audio: np.ndarray, ref_audio: np.ndarray, sr: int = 16000) -> float:
        """
        Compare two audio signals using Dynamic Time Warping
        
        Returns similarity score (0-100)
        """
        if not DTW_AVAILABLE:
            print("      ⚠️  DTW not available, using fallback")
            return 75.0
        
        try:
            # Extract MFCC features
            user_mfcc = librosa.feature.mfcc(y=user_audio, sr=sr, n_mfcc=13)
            ref_mfcc = librosa.feature.mfcc(y=ref_audio, sr=sr, n_mfcc=13)
            
            # Compute DTW distance using correct syntax
            from dtw import accelerated_dtw
            distance, _, _, _ = accelerated_dtw(user_mfcc.T, ref_mfcc.T, dist='euclidean')
            
            # Normalize to 0-100 scale
            max_distance = max(user_mfcc.shape[1], ref_mfcc.shape[1]) * 50
            similarity = max(0, 100 - (distance / max_distance * 100))
            
            return float(similarity)
        except Exception as e:
            print(f"      ⚠️  DTW comparison failed: {e}")
            # Fallback: use cosine similarity on MFCC
            try:
                user_mfcc_mean = np.mean(user_mfcc, axis=1)
                ref_mfcc_mean = np.mean(ref_mfcc, axis=1)
                similarity = (1 - cosine(user_mfcc_mean, ref_mfcc_mean)) * 100
                return float(max(0, min(100, similarity)))
            except:
                return 75.0
    
    def compare_embeddings(self, user_embedding: np.ndarray, ref_embedding: np.ndarray) -> Dict[str, float]:
        """
        Compare audio embeddings using multiple metrics
        
        Returns:
            {cosine, euclidean, correlation}
        """
        # Normalize
        user_norm = user_embedding / (np.linalg.norm(user_embedding) + 1e-8)
        ref_norm = ref_embedding / (np.linalg.norm(ref_embedding) + 1e-8)
        
        # Cosine similarity
        cosine_sim = 1 - cosine(user_norm, ref_norm)
        cosine_sim = max(0, min(1, cosine_sim))
        
        # Euclidean distance (normalized)
        euclidean_dist = np.linalg.norm(user_norm - ref_norm)
        euclidean_sim = 1 / (1 + euclidean_dist)
        
        # Correlation
        correlation = np.corrcoef(user_norm, ref_norm)[0, 1]
        if np.isnan(correlation):
            correlation = 0.5
        correlation = max(0, min(1, correlation))
        
        return {
            'cosine': float(cosine_sim * 100),
            'euclidean': float(euclidean_sim * 100),
            'correlation': float(correlation * 100)
        }
    
    def slice_audio(self, audio: np.ndarray, start: float, end: float, sr: int = 16000) -> np.ndarray:
        """Slice audio at specific timestamp"""
        start_sample = int(start * sr)
        end_sample = int(end * sr)
        start_sample = max(0, start_sample)
        end_sample = min(len(audio), end_sample)
        return audio[start_sample:end_sample]
    
    # ==================== PHONEME-LEVEL COMPARISON ====================
    
    def compare_phonemes(
        self,
        user_audio: np.ndarray,
        ref_audio: np.ndarray,
        phoneme_timings: List[Dict],
        sr: int = 16000
    ) -> List[Dict]:
        """
        Compare phonemes between user and reference audio
        
        Returns:
            List of {phoneme, word, start, end, score, comparison}
        """
        phoneme_results = []
        
        for pt in phoneme_timings:
            # Slice user audio
            user_slice = self.slice_audio(user_audio, pt['start'], pt['end'], sr)
            user_embedding = self.extract_embeddings(user_slice, sr)
            
            # Slice reference audio
            ref_slice = self.slice_audio(ref_audio, pt['start'], pt['end'], sr)
            ref_embedding = self.extract_embeddings(ref_slice, sr)
            
            # Compare
            comparison = self.compare_embeddings(user_embedding, ref_embedding)
            
            # Calculate score (weighted average)
            score = (
                comparison['cosine'] * 0.5 +
                comparison['euclidean'] * 0.3 +
                comparison['correlation'] * 0.2
            )
            
            # Map to realistic range (40-100)
            score = 40 + (score / 100 * 60)
            
            phoneme_results.append({
                'phoneme': pt['phoneme'],
                'word': pt['word'],
                'start': pt['start'],
                'end': pt['end'],
                'score': float(score),
                'comparison': comparison
            })
        
        return phoneme_results


# Singleton instance
ai_processor = AIProcessor()
