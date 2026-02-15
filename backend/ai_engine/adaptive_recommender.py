"""
Adaptive Recommendation Engine - POST-Recommendations
Generates sentences based on user's actual performance history
"""

import ollama
from typing import List, Dict
from app.core.config import settings
from collections import Counter

class AdaptiveRecommender:
    def __init__(self, host: str = None, model: str = None):
        """Initialize adaptive recommender with Ollama"""
        self.host = host or settings.OLLAMA_HOST
        self.model = model or settings.OLLAMA_MODEL
    
    def generate_adaptive_sentences(
        self, 
        profile: Dict, 
        performance_history: List[Dict]
    ) -> List[str]:
        """
        Generate sentences adapted to user's performance
        
        Args:
            profile: User profile (age, gender, disorder, etc.)
            performance_history: List of past sessions with:
                - weak_words: Words user struggled with
                - missing_words: Words user missed
                - weak_phonemes: Phonemes needing practice
                - accuracy: Session accuracy score
        
        Returns:
            List of 6 adaptive sentences targeting weak areas
        """
        
        # Analyze performance to identify patterns
        analysis = self._analyze_performance(performance_history)
        
        # Build adaptive prompt
        prompt = self._build_adaptive_prompt(profile, analysis)
        
        try:
            response = ollama.chat(
                model=self.model,
                messages=[
                    {
                        'role': 'system',
                        'content': 'You are an expert speech therapist specializing in adaptive learning and personalized therapy.'
                    },
                    {
                        'role': 'user',
                        'content': prompt
                    }
                ]
            )
            
            # Parse response
            sentences = self._parse_sentences(response['message']['content'])
            return sentences[:6]
            
        except Exception as e:
            print(f"⚠️  Adaptive LLM Error: {e}")
            print(f"💡 Using targeted fallback sentences")
            return self._get_targeted_fallback(profile, analysis)
    
    def _analyze_performance(self, history: List[Dict]) -> Dict:
        """Analyze performance history to identify patterns"""
        
        # Collect all weak words
        all_weak_words = []
        for session in history:
            weak_words = session.get('weak_words', [])
            if isinstance(weak_words, list):
                for word_info in weak_words:
                    if isinstance(word_info, dict):
                        all_weak_words.append(word_info.get('word', ''))
                    else:
                        all_weak_words.append(str(word_info))
        
        # Collect all missing words
        all_missing_words = []
        for session in history:
            missing = session.get('missing_words', [])
            if isinstance(missing, list):
                all_missing_words.extend(missing)
        
        # Collect all weak phonemes
        all_weak_phonemes = []
        for session in history:
            phonemes = session.get('weak_phonemes', [])
            if isinstance(phonemes, list):
                all_weak_phonemes.extend(phonemes)
        
        # Count frequencies
        weak_word_counts = Counter(all_weak_words)
        missing_word_counts = Counter(all_missing_words)
        weak_phoneme_counts = Counter(all_weak_phonemes)
        
        # Calculate average accuracy
        accuracies = [s.get('accuracy', 0) for s in history if 'accuracy' in s]
        avg_accuracy = sum(accuracies) / len(accuracies) if accuracies else 0
        
        # Identify top problem areas
        top_weak_words = [word for word, count in weak_word_counts.most_common(10) if word]
        top_missing_words = [word for word, count in missing_word_counts.most_common(10) if word]
        top_weak_phonemes = [ph for ph, count in weak_phoneme_counts.most_common(5) if ph]
        
        # Determine difficulty trend
        if len(accuracies) >= 3:
            recent_avg = sum(accuracies[-3:]) / 3
            if recent_avg > 85:
                trend = "improving - increase difficulty"
            elif recent_avg < 65:
                trend = "struggling - simplify"
            else:
                trend = "stable - maintain level"
        else:
            trend = "insufficient data - maintain level"
        
        return {
            'top_weak_words': top_weak_words,
            'top_missing_words': top_missing_words,
            'top_weak_phonemes': top_weak_phonemes,
            'average_accuracy': avg_accuracy,
            'total_sessions': len(history),
            'trend': trend,
            'weak_word_frequency': dict(weak_word_counts.most_common(10)),
            'phoneme_frequency': dict(weak_phoneme_counts.most_common(5))
        }
    
    def _build_adaptive_prompt(self, profile: Dict, analysis: Dict) -> str:
        """Build prompt targeting user's specific weak areas"""
        
        age = profile.get('age', 25)
        gender = profile.get('gender', 'unknown')
        disorder = profile.get('speech_disorder_type', 'articulation')
        severity = profile.get('current_severity', 'moderate')
        interests = profile.get('interests', 'general topics')
        
        # Determine complexity based on age
        if age <= 10:
            complexity = "very simple"
            word_count = "5-8 words"
            vocabulary = "elementary (grades 1-3)"
        elif age <= 15:
            complexity = "simple to moderate"
            word_count = "8-12 words"
            vocabulary = "middle school (grades 4-8)"
        elif age <= 25:
            complexity = "moderate"
            word_count = "10-15 words"
            vocabulary = "high school to college"
        elif age <= 50:
            complexity = "advanced"
            word_count = "12-18 words"
            vocabulary = "professional adult"
        else:
            complexity = "clear and dignified"
            word_count = "10-15 words"
            vocabulary = "mature professional"
        
        # Adjust complexity based on performance trend
        if "increase difficulty" in analysis['trend']:
            word_count = word_count.replace("5-8", "7-10").replace("8-12", "10-14")
        elif "simplify" in analysis['trend']:
            word_count = word_count.replace("10-15", "8-12").replace("12-18", "10-14")
        
        prompt = f"""You are an expert speech therapist creating ADAPTIVE practice sentences based on performance data.

PATIENT PROFILE:
- Age: {age} years ({complexity} complexity)
- Gender: {gender}
- Speech Challenge: {disorder} ({severity} severity)
- Interests: {interests}

PERFORMANCE ANALYSIS ({analysis['total_sessions']} sessions):
- Average Accuracy: {analysis['average_accuracy']:.1f}%
- Performance Trend: {analysis['trend']}

IDENTIFIED PROBLEM AREAS:
1. WEAK WORDS (user struggles with these):
   {', '.join(analysis['top_weak_words'][:8]) if analysis['top_weak_words'] else 'None identified'}

2. MISSING WORDS (user often skips):
   {', '.join(analysis['top_missing_words'][:8]) if analysis['top_missing_words'] else 'None identified'}

3. WEAK PHONEMES (needs practice):
   {', '.join(analysis['top_weak_phonemes']) if analysis['top_weak_phonemes'] else 'None identified'}

CRITICAL REQUIREMENTS:
1. TARGET WEAK AREAS:
   - MUST include 2-3 weak words per sentence
   - MUST include 1-2 commonly missed words per sentence
   - MUST heavily feature weak phonemes
   - Focus on patterns user struggles with

2. AGE-APPROPRIATE:
   - Use {vocabulary} vocabulary
   - Sentence length: {word_count}
   - Match cognitive level of {age}-year-old

3. PROGRESSIVE DIFFICULTY:
   - Sentence 1-2: Easier (focus on single weak area)
   - Sentence 3-4: Moderate (combine 2 weak areas)
   - Sentence 5-6: Challenging (combine 3+ weak areas)

4. PERSONALIZATION:
   - Relate to interests: {interests}
   - Make engaging and relevant
   - Build confidence while challenging

5. THERAPEUTIC STRATEGY:
   - If accuracy < 70%: Simplify and focus on basics
   - If accuracy 70-85%: Maintain level, target weak spots
   - If accuracy > 85%: Increase complexity, add challenges

GENERATE EXACTLY 6 SENTENCES:
- Each sentence on a new line
- No numbering or bullets
- Natural, conversational style
- Therapeutically valuable

Example format:
The red rabbit ran rapidly around the roses.
Sally's sister sings silly songs on Sundays.
"""
        
        return prompt
    
    def _parse_sentences(self, text: str) -> List[str]:
        """Parse sentences from LLM response"""
        lines = text.strip().split('\n')
        sentences = []
        
        for line in lines:
            # Remove numbering, bullets, etc.
            line = line.strip()
            line = line.lstrip('0123456789.-) ')
            
            # Skip empty lines and headers
            if not line or len(line) < 10:
                continue
            
            # Ensure it ends with punctuation
            if not line[-1] in '.!?':
                line += '.'
            
            sentences.append(line)
        
        return sentences
    
    def _get_targeted_fallback(self, profile: Dict, analysis: Dict) -> List[str]:
        """Generate fallback sentences targeting identified weak areas"""
        
        weak_phonemes = analysis.get('top_weak_phonemes', [])
        age = profile.get('age', 25)
        
        # Age-appropriate fallback sentences targeting common issues
        if age <= 12:
            # Simple sentences for children
            sentences = [
                "The red rabbit ran really fast.",
                "She sells seashells by the seashore.",
                "Three thick things think together.",
                "Sally sings silly songs on Sundays.",
                "The cat sat on the mat.",
                "Peter Piper picked pickled peppers."
            ]
        elif age <= 18:
            # Moderate sentences for teens
            sentences = [
                "The student studied seriously for the science test.",
                "She sells seashells by the seashore every summer.",
                "Three thoughtful teachers think about their students.",
                "The red rabbit ran rapidly around the roses.",
                "Sally's sister sings silly songs on Sundays.",
                "Peter Piper picked a peck of pickled peppers."
            ]
        else:
            # Advanced sentences for adults
            sentences = [
                "The professional presenter prepared the presentation carefully.",
                "She sells seashells by the seashore during summer vacation.",
                "Three thoughtful therapists think thoroughly about treatment plans.",
                "The rapid rabbit ran remarkably fast around the rose garden.",
                "Sally's sophisticated sister sings several silly songs on Sundays.",
                "Peter Piper picked a peck of perfectly pickled peppers."
            ]
        
        return sentences

