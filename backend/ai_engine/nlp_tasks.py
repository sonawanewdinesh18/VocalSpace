"""
NLP TASKS - Natural Language Processing for Speech Therapy
Handles text analysis, phoneme conversion, error detection, and linguistic processing
"""

import re
from typing import Dict, List, Tuple, Optional
from difflib import SequenceMatcher
import numpy as np

try:
    from g2p_en import G2p
    G2P_AVAILABLE = True
except ImportError:
    G2P_AVAILABLE = False
    print("⚠️  g2p_en not installed - using fallback phoneme mapping")


class NLPProcessor:
    """
    NLP Processing for Speech Therapy
    
    Handles:
    - Text normalization
    - Phoneme conversion (G2P)
    - Word-level comparison
    - Error detection
    - Linguistic analysis
    """
    
    def __init__(self):
        """Initialize NLP processor"""
        if G2P_AVAILABLE:
            self.g2p = G2p()
        else:
            self.g2p = None
        
        # Phoneme dictionary for fallback
        self.phoneme_dict = self._load_phoneme_dict()
        
        print("✅ NLP Processor initialized")
    
    def _load_phoneme_dict(self) -> Dict[str, List[str]]:
        """Load basic phoneme dictionary for common words"""
        return {
            # Common words
            'the': ['DH', 'AH'],
            'a': ['AH'],
            'an': ['AE', 'N'],
            'and': ['AE', 'N', 'D'],
            'or': ['AO', 'R'],
            'but': ['B', 'AH', 'T'],
            'in': ['IH', 'N'],
            'on': ['AA', 'N'],
            'at': ['AE', 'T'],
            'to': ['T', 'UW'],
            'for': ['F', 'AO', 'R'],
            'of': ['AH', 'V'],
            'with': ['W', 'IH', 'TH'],
            'by': ['B', 'AY'],
            'from': ['F', 'R', 'AA', 'M'],
            
            # Practice words
            'when': ['W', 'EH', 'N'],
            'where': ['W', 'EH', 'R'],
            'what': ['W', 'AA', 'T'],
            'who': ['HH', 'UW'],
            'why': ['W', 'AY'],
            'how': ['HH', 'AW'],
            
            'she': ['SH', 'IY'],
            'he': ['HH', 'IY'],
            'they': ['DH', 'EY'],
            'we': ['W', 'IY'],
            'you': ['Y', 'UW'],
            'i': ['AY'],
            
            'like': ['L', 'AY', 'K'],
            'love': ['L', 'AH', 'V'],
            'want': ['W', 'AA', 'N', 'T'],
            'need': ['N', 'IY', 'D'],
            'have': ['HH', 'AE', 'V'],
            'has': ['HH', 'AE', 'Z'],
            'had': ['HH', 'AE', 'D'],
            
            'bank': ['B', 'AE', 'NG', 'K'],
            'practice': ['P', 'R', 'AE', 'K', 'T', 'IH', 'S'],
            'every': ['EH', 'V', 'R', 'IY'],
            'day': ['D', 'EY'],
            'time': ['T', 'AY', 'M'],
            'year': ['Y', 'IH', 'R'],
            
            # Sibilants (common trouble sounds)
            'see': ['S', 'IY'],
            'say': ['S', 'EY'],
            'sun': ['S', 'AH', 'N'],
            'sit': ['S', 'IH', 'T'],
            'sell': ['S', 'EH', 'L'],
            'sells': ['S', 'EH', 'L', 'Z'],
            
            'ship': ['SH', 'IH', 'P'],
            'shop': ['SH', 'AA', 'P'],
            'shoe': ['SH', 'UW'],
            'sheep': ['SH', 'IY', 'P'],
            'shell': ['SH', 'EH', 'L'],
            'shells': ['SH', 'EH', 'L', 'Z'],
            'seashells': ['S', 'IY', 'SH', 'EH', 'L', 'Z'],
            
            # R sounds
            'red': ['R', 'EH', 'D'],
            'run': ['R', 'AH', 'N'],
            'runs': ['R', 'AH', 'N', 'Z'],
            'rabbit': ['R', 'AE', 'B', 'IH', 'T'],
            'rose': ['R', 'OW', 'Z'],
            
            # TH sounds
            'the': ['DH', 'AH'],
            'this': ['DH', 'IH', 'S'],
            'that': ['DH', 'AE', 'T'],
            'think': ['TH', 'IH', 'NG', 'K'],
            'thank': ['TH', 'AE', 'NG', 'K'],
            'three': ['TH', 'R', 'IY'],
        }
    
    # ==================== TEXT NORMALIZATION ====================
    
    def normalize_text(self, text: str) -> str:
        """
        Normalize text for comparison
        
        - Lowercase
        - Remove punctuation
        - Remove extra spaces
        """
        # Lowercase
        text = text.lower()
        
        # Remove punctuation
        text = re.sub(r'[^\w\s]', '', text)
        
        # Remove extra spaces
        text = ' '.join(text.split())
        
        return text
    
    # ==================== PHONEME CONVERSION ====================
    
    def text_to_phonemes(self, text: str) -> List[Dict]:
        """
        Convert text to phonemes using G2P
        
        Returns:
            List of {word, phonemes}
        """
        words = self.normalize_text(text).split()
        result = []
        
        for word in words:
            if self.g2p:
                # Use G2P model
                phonemes = self.g2p(word)
                clean_phonemes = [p.upper() for p in phonemes if p.isalpha()]
            else:
                # Use dictionary fallback
                clean_phonemes = self.phoneme_dict.get(word, ['UNK'])
            
            result.append({
                'word': word,
                'phonemes': clean_phonemes
            })
        
        return result
    
    # ==================== WORD-LEVEL COMPARISON ====================
    
    def compare_words(
        self,
        expected_text: str,
        transcribed_text: str
    ) -> Dict:
        """
        Compare expected vs transcribed text at word level
        
        Returns:
            - correct_words
            - incorrect_words
            - missing_words
            - extra_words
            - substitutions
        """
        expected_words = self.normalize_text(expected_text).split()
        transcribed_words = self.normalize_text(transcribed_text).split()
        
        # Use SequenceMatcher for alignment
        matcher = SequenceMatcher(None, expected_words, transcribed_words)
        
        correct_words = []
        incorrect_words = []
        missing_words = []
        extra_words = []
        substitutions = []
        
        for tag, i1, i2, j1, j2 in matcher.get_opcodes():
            if tag == 'equal':
                # Correct words
                for i in range(i1, i2):
                    correct_words.append(expected_words[i])
            
            elif tag == 'replace':
                # Substitutions
                for i, j in zip(range(i1, i2), range(j1, j2)):
                    substitutions.append({
                        'expected': expected_words[i],
                        'spoken': transcribed_words[j],
                        'similarity': self._word_similarity(expected_words[i], transcribed_words[j])
                    })
                    incorrect_words.append(expected_words[i])
            
            elif tag == 'delete':
                # Missing words
                for i in range(i1, i2):
                    missing_words.append(expected_words[i])
            
            elif tag == 'insert':
                # Extra words
                for j in range(j1, j2):
                    extra_words.append(transcribed_words[j])
        
        # Calculate accuracy
        total_words = len(expected_words)
        correct_count = len(correct_words)
        accuracy = (correct_count / total_words * 100) if total_words > 0 else 0
        
        return {
            'accuracy': float(accuracy),
            'total_words': total_words,
            'correct_words': correct_words,
            'incorrect_words': incorrect_words,
            'missing_words': missing_words,
            'extra_words': extra_words,
            'substitutions': substitutions
        }
    
    def _word_similarity(self, word1: str, word2: str) -> float:
        """Calculate similarity between two words using Levenshtein distance"""
        matcher = SequenceMatcher(None, word1, word2)
        return matcher.ratio()
    
    # ==================== ERROR DETECTION ====================
    
    def detect_errors(
        self,
        expected_text: str,
        transcribed_text: str,
        phoneme_scores: Dict[str, float]
    ) -> Dict:
        """
        Detect all types of errors
        
        Returns:
            - missing_words
            - weak_words
            - wrong_phonemes
            - weak_phonemes
            - substituted_words
        """
        # Word-level comparison
        word_comparison = self.compare_words(expected_text, transcribed_text)
        
        # Phoneme-level errors
        wrong_phonemes = []
        weak_phonemes = []
        
        for phoneme, score in phoneme_scores.items():
            if score < 0.65:
                wrong_phonemes.append(phoneme)
            elif score < 0.85:
                weak_phonemes.append(phoneme)
        
        # Weak words (words with low phoneme scores)
        weak_words = []
        expected_phonemes = self.text_to_phonemes(expected_text)
        
        for word_info in expected_phonemes:
            word = word_info['word']
            phonemes = word_info['phonemes']
            
            # Calculate average phoneme score for this word
            word_phoneme_scores = [phoneme_scores.get(p, 0.5) for p in phonemes]
            if word_phoneme_scores:
                avg_score = np.mean(word_phoneme_scores)
                if avg_score < 0.75:
                    weak_words.append({
                        'word': word,
                        'accuracy': int(avg_score * 100),
                        'weak_phonemes': [p for p in phonemes if phoneme_scores.get(p, 0.5) < 0.75]
                    })
        
        return {
            'missing_words': word_comparison['missing_words'],
            'weak_words': weak_words,
            'wrong_phonemes': list(set(wrong_phonemes)),
            'weak_phonemes': list(set(weak_phonemes)),
            'substituted_words': word_comparison['substitutions']
        }
    
    # ==================== LINGUISTIC ANALYSIS ====================
    
    def analyze_patterns(
        self,
        errors: Dict,
        user_profile: Dict
    ) -> Dict:
        """
        Analyze error patterns for diagnosis
        
        Returns:
            - primary_issue
            - secondary_issues
            - pattern_description
            - severity
        """
        # Count error types
        missing_count = len(errors.get('missing_words', []))
        weak_count = len(errors.get('weak_words', []))
        wrong_phoneme_count = len(errors.get('wrong_phonemes', []))
        weak_phoneme_count = len(errors.get('weak_phonemes', []))
        
        # Identify primary issue
        if wrong_phoneme_count > 2:
            primary_issue = f"Multiple phoneme mispronunciations ({', '.join(errors['wrong_phonemes'][:3])})"
        elif weak_phoneme_count > 2:
            primary_issue = f"Weak phoneme production ({', '.join(errors['weak_phonemes'][:3])})"
        elif missing_count > 0:
            primary_issue = f"Word omissions ({missing_count} words)"
        elif weak_count > 0:
            primary_issue = f"Unclear pronunciation ({weak_count} words)"
        else:
            primary_issue = "Minor pronunciation variations"
        
        # Identify secondary issues
        secondary_issues = []
        if weak_count > 0 and wrong_phoneme_count > 0:
            secondary_issues.append("Inconsistent articulation")
        if missing_count > 0:
            secondary_issues.append("Incomplete utterances")
        
        # Pattern description
        wrong_phonemes = errors.get('wrong_phonemes', [])
        if any(p in ['S', 'Z', 'SH', 'ZH'] for p in wrong_phonemes):
            pattern = "Difficulty with sibilant sounds (S, SH, Z)"
        elif any(p in ['R', 'L'] for p in wrong_phonemes):
            pattern = "Difficulty with liquid sounds (R, L)"
        elif any(p in ['TH', 'DH'] for p in wrong_phonemes):
            pattern = "Difficulty with dental fricatives (TH)"
        else:
            pattern = "Mixed articulation challenges"
        
        # Severity assessment
        total_errors = wrong_phoneme_count + weak_phoneme_count + missing_count
        if total_errors >= 5:
            severity = "Severe"
        elif total_errors >= 3:
            severity = "Moderate"
        else:
            severity = "Mild"
        
        return {
            'primary_issue': primary_issue,
            'secondary_issues': secondary_issues,
            'pattern': pattern,
            'severity': severity
        }
    
    # ==================== SENTENCE GENERATION ====================
    
    def generate_practice_sentences(
        self,
        focus_phonemes: List[str],
        difficulty: str,
        count: int = 5
    ) -> List[str]:
        """
        Generate practice sentences focusing on specific phonemes
        
        Args:
            focus_phonemes: List of phonemes to practice
            difficulty: 'easy', 'medium', 'hard'
            count: Number of sentences to generate
        """
        # Sentence templates by difficulty
        templates = {
            'easy': {
                'S': [
                    "See the sun.",
                    "Sam sits still.",
                    "Soft snow falls.",
                    "Six silly seals.",
                    "Sue sells socks."
                ],
                'SH': [
                    "She shops here.",
                    "Sheep sleep well.",
                    "The ship is big.",
                    "Shiny shoes shine.",
                    "Fish swim fast."
                ],
                'R': [
                    "Red roses bloom.",
                    "Run very fast.",
                    "The rat is round.",
                    "Rain falls down.",
                    "Read the book."
                ],
                'TH': [
                    "Think about this.",
                    "Three thin threads.",
                    "Thank you much.",
                    "The path is long.",
                    "Throw the ball."
                ],
                'L': [
                    "Look at me.",
                    "Little lamb leaps.",
                    "Love is lovely.",
                    "Light the lamp.",
                    "Laugh out loud."
                ]
            },
            'medium': {
                'S': [
                    "Sally sells seashells by the seashore.",
                    "Six slippery snails slid slowly.",
                    "Sam's sister sings softly.",
                    "The sun sets in the west.",
                    "Susie sits in the sunshine."
                ],
                'SH': [
                    "She should share her shiny shoes.",
                    "The fish shop sells fresh fish.",
                    "Sheep shear their wool in spring.",
                    "Shelly washes dishes after dinner.",
                    "The ship sails across the ocean."
                ],
                'R': [
                    "The red rabbit runs rapidly around.",
                    "Robert rides his bike every morning.",
                    "Three red roses are really rare.",
                    "The river runs through the forest.",
                    "Randy reads books about robots."
                ],
                'TH': [
                    "Three thick things think together.",
                    "The thoughtful therapist thinks carefully.",
                    "Thirty-three thousand thoughtful thinkers.",
                    "They throw the ball back and forth.",
                    "The path through the forest is narrow."
                ],
                'L': [
                    "Little Lucy loves lollipops and lemonade.",
                    "Larry's llama likes to lick lemons.",
                    "Lovely lilies bloom in the light.",
                    "The lion lives in the jungle.",
                    "Linda learns to play the violin."
                ]
            },
            'hard': {
                'S': [
                    "She sells seashells by the seashore, and the shells she sells are surely seashells.",
                    "Six sick slick slim sycamore saplings.",
                    "The sixth sheik's sixth sheep's sick.",
                    "Susie works in a shoeshine shop where she shines shoes.",
                    "Sam's shop stocks short spotted socks."
                ],
                'SH': [
                    "I wish to wish the wish you wish to wish.",
                    "She sells seashells on the seashore, the shells she sells are seashells I'm sure.",
                    "Freshly fried fresh flesh of fresh flying fish.",
                    "The fish with the grin can swim and spin.",
                    "Shy Shelly says she shall sew sheets."
                ],
                'R': [
                    "Round and round the rugged rock the ragged rascal ran.",
                    "Robert Rowley rolled a round roll round.",
                    "The rural ruler's mural is truly plural.",
                    "Red lorry, yellow lorry, red lorry, yellow lorry.",
                    "Rory the warrior and Roger the worrier were reared wrongly."
                ],
                'TH': [
                    "The thirty-three thieves thought they thrilled the throne.",
                    "Three free throws, three free throws, three free throws.",
                    "I thought a thought but the thought I thought wasn't the thought I thought.",
                    "Through three cheese trees three free fleas flew.",
                    "Thirty-three thousand feathers on a thrush's throat."
                ],
                'L': [
                    "Literally literary literature.",
                    "Larry sent the latter a letter later.",
                    "Lovely lemon liniment, lovely lemon liniment.",
                    "The local yokel yodels loudly.",
                    "Lily ladles little Letty's lentil soup."
                ]
            }
        }
        
        sentences = []
        for phoneme in focus_phonemes:
            if phoneme in templates.get(difficulty, {}):
                sentences.extend(templates[difficulty][phoneme][:2])
        
        # If not enough sentences, add general ones
        if len(sentences) < count:
            general = [
                "Practice makes perfect.",
                "Speak clearly and slowly.",
                "Take your time.",
                "You can do it.",
                "Keep trying hard."
            ]
            sentences.extend(general[:count - len(sentences)])
        
        return sentences[:count]


# Singleton instance
nlp_processor = NLPProcessor()
