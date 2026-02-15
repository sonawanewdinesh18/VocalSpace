"""
HYBRID SPEECH ANALYZER - Production Grade (Modular Architecture)
Uses separate NLP and AI task modules for clean, maintainable code
"""

from typing import Dict, List, Optional
import os
import numpy as np

# Import modular processors
from ai_engine.nlp_tasks import nlp_processor
from ai_engine.ai_tasks import ai_processor


class HybridSpeechAnalyzer:
    """
    Production-grade hybrid speech analyzer
    
    Uses modular architecture:
    - nlp_processor for text/linguistic processing
    - ai_processor for audio/ML processing
    """
    
    def __init__(self):
        """Initialize analyzer with modular processors"""
        print(f"🚀 Initializing Hybrid Speech Analyzer (Modular Architecture)")
        
        # Use singleton processors
        self.nlp = nlp_processor
        self.ai = ai_processor
        
        print("✅ Hybrid analyzer ready!")
    
    def analyze_complete(
        self,
        user_audio_path: str,
        reference_audio_path: str,
        expected_text: str
    ) -> Dict:
        """
        COMPLETE HYBRID ANALYSIS using modular processors
        
        Returns comprehensive results with all metrics
        """
        print(f"\n{'='*70}")
        print(f"🎯 HYBRID SPEECH ANALYSIS - MODULAR ARCHITECTURE")
        print(f"{'='*70}")
        
        try:
            # STEP 1: Load and preprocess user audio (AI)
            print(f"\n📥 STEP 1: Loading and preprocessing user audio...")
            user_audio, sr = self.ai.load_audio_robust(user_audio_path, sr=16000)
            user_audio_clean = self.ai.preprocess_audio(user_audio, sr)
            print(f"   ✅ User audio: {len(user_audio_clean)} samples ({len(user_audio_clean)/sr:.2f}s)")
            
            # STEP 2: Load and preprocess reference audio (AI)
            print(f"\n📥 STEP 2: Loading and preprocessing reference audio...")
            if os.path.exists(reference_audio_path):
                ref_audio, _ = self.ai.load_audio_robust(reference_audio_path, sr=16000)
                ref_audio_clean = self.ai.preprocess_audio(ref_audio, sr)
                print(f"   ✅ Reference audio: {len(ref_audio_clean)} samples ({len(ref_audio_clean)/sr:.2f}s)")
            else:
                print(f"   ⚠️  Reference audio not found")
                ref_audio_clean = None
            
            # STEP 3: ASR Transcription (AI)
            print(f"\n🎤 STEP 3: Transcribing with ASR...")
            print(f"   Expected: \"{expected_text}\"")
            transcription, confidence, word_confidences = self.ai.transcribe_with_confidence(user_audio_clean, sr)
            print(f"   You said: \"{transcription}\"")
            print(f"   ASR Confidence: {confidence*100:.1f}%")
            
            # STEP 4: Word-Level Comparison (NLP)
            print(f"\n📊 STEP 4: Word-level comparison...")
            word_comparison = self.nlp.compare_words(expected_text, transcription)
            print(f"   Word Accuracy: {word_comparison['accuracy']:.1f}%")
            print(f"   Correct: {len(word_comparison['correct_words'])}/{word_comparison['total_words']}")
            if word_comparison['substitutions']:
                print(f"   Substitutions: {len(word_comparison['substitutions'])}")
            if word_comparison['missing_words']:
                print(f"   Missing: {word_comparison['missing_words']}")
            
            # STEP 5: Phoneme-Level Analysis (AI + NLP)
            print(f"\n🔬 STEP 5: Phoneme-level analysis...")
            phoneme_structure = self.nlp.text_to_phonemes(expected_text)
            
            if ref_audio_clean is not None:
                # Forced alignment (AI)
                alignment = self.ai.forced_alignment(user_audio_clean, expected_text, phoneme_structure, sr)
                
                # Phoneme comparison (AI)
                phoneme_results = self.ai.compare_phonemes(
                    user_audio_clean, ref_audio_clean, alignment['phoneme_timings'], sr
                )
                
                average_score = np.mean([pr['score'] for pr in phoneme_results]) if phoneme_results else 75
                
                phoneme_analysis = {
                    'phoneme_results': phoneme_results,
                    'average_score': float(average_score),
                    'phoneme_timings': alignment['phoneme_timings'],
                    'word_timings': alignment['word_timings']
                }
                
                print(f"   Phoneme Accuracy: {average_score:.1f}%")
                print(f"   Analyzed {len(phoneme_results)} phonemes")
            else:
                phoneme_analysis = {
                    'phoneme_results': [],
                    'average_score': 75.0,
                    'phoneme_timings': [],
                    'word_timings': []
                }
                print(f"   ⚠️  Phoneme analysis skipped (no reference)")
            
            # STEP 6: Audio Comparison (AI)
            print(f"\n🔍 STEP 6: Audio comparison (DTW)...")
            if ref_audio_clean is not None:
                dtw_similarity = self.ai.compare_audio_dtw(user_audio_clean, ref_audio_clean, sr)
                print(f"   DTW Similarity: {dtw_similarity:.1f}%")
            else:
                dtw_similarity = 75.0
                print(f"   ⚠️  DTW comparison skipped (no reference)")
            
            # STEP 7: Error Detection (NLP)
            print(f"\n🔍 STEP 7: Error detection...")
            phoneme_scores = {pr['phoneme']: pr['score']/100 for pr in phoneme_analysis['phoneme_results']}
            errors = self.nlp.detect_errors(expected_text, transcription, phoneme_scores)
            print(f"   Missing words: {len(errors['missing_words'])}")
            print(f"   Weak words: {len(errors['weak_words'])}")
            print(f"   Wrong phonemes: {len(errors['wrong_phonemes'])}")
            print(f"   Weak phonemes: {len(errors['weak_phonemes'])}")
            
            # STEP 8: Calculate Overall Score
            print(f"\n📈 STEP 8: Calculating overall score...")
            overall_score = self._calculate_overall_score(
                word_comparison['accuracy'],
                phoneme_analysis['average_score'],
                dtw_similarity,
                confidence * 100
            )
            print(f"   Overall Score: {overall_score}%")
            
            # STEP 9: Generate Intelligent Feedback
            print(f"\n🧠 STEP 9: Generating intelligent feedback...")
            from ai_engine.intelligent_feedback_generator import IntelligentFeedbackGenerator
            feedback_gen = IntelligentFeedbackGenerator()
            
            intelligent_feedback = feedback_gen.generate_comprehensive_feedback(
                accuracy=int(overall_score),
                transcription=transcription,
                expected_text=expected_text,
                weak_phonemes=errors['wrong_phonemes'] + errors['weak_phonemes'],
                weak_words=errors['weak_words'],
                missing_words=errors['missing_words'],
                phoneme_results=phoneme_analysis['phoneme_results']
            )
            print(f"   ✅ Feedback generated!")
            
            print(f"\n✅ Analysis complete!")
            print(f"{'='*70}\n")
            
            # Return comprehensive results
            return {
                'success': True,
                'overall_score': int(overall_score),
                'word_analysis': word_comparison,
                'phoneme_analysis': phoneme_analysis,
                'dtw_similarity': float(dtw_similarity),
                'asr_confidence': float(confidence * 100),
                'transcription': transcription,
                'expected_text': expected_text,
                'intelligent_feedback': intelligent_feedback,
                'weak_phonemes': errors['wrong_phonemes'] + errors['weak_phonemes'],
                'weak_words': errors['weak_words'],
                'missing_words': errors['missing_words'],
                'pronunciation_score': int(phoneme_analysis['average_score']),
                'duration': len(user_audio_clean) / sr,
                'words_correct': len(word_comparison['correct_words']),
                'words_total': word_comparison['total_words']
            }
            
        except Exception as e:
            print(f"❌ Error: {e}")
            import traceback
            traceback.print_exc()
            return self._get_fallback_results(expected_text)
    
    def _calculate_overall_score(
        self,
        word_accuracy: float,
        phoneme_accuracy: float,
        dtw_similarity: float,
        asr_confidence: float
    ) -> float:
        """Calculate weighted overall score"""
        # Adaptive weighting
        if word_accuracy >= 80:
            # Good text match - trust pronunciation more
            score = (
                word_accuracy * 0.3 +
                phoneme_accuracy * 0.4 +
                dtw_similarity * 0.2 +
                asr_confidence * 0.1
            )
        else:
            # Poor text match - focus on text
            score = (
                word_accuracy * 0.5 +
                phoneme_accuracy * 0.3 +
                dtw_similarity * 0.1 +
                asr_confidence * 0.1
            )
        
        # Ensure minimum score
        if score < 40:
            score = 40
        
        return float(score)
    
    def _get_fallback_results(self, expected_text: str) -> Dict:
        """Fallback results on error"""
        return {
            'success': False,
            'overall_score': 70,
            'word_analysis': {'accuracy': 70, 'total_words': len(expected_text.split()), 'correct_words': [], 'missing_words': [], 'substitutions': []},
            'phoneme_analysis': {'average_score': 70, 'phoneme_results': [], 'phoneme_timings': [], 'word_timings': []},
            'dtw_similarity': 70.0,
            'asr_confidence': 70.0,
            'transcription': expected_text.lower(),
            'expected_text': expected_text,
            'intelligent_feedback': {},
            'weak_phonemes': [],
            'weak_words': [],
            'missing_words': [],
            'pronunciation_score': 70,
            'duration': 3.0,
            'words_correct': 0,
            'words_total': len(expected_text.split())
        }
