import ollama
from typing import List, Dict
from app.core.config import settings

class LLMRecommender:
    def __init__(self, host: str = None, model: str = None):
        """Initialize LLM recommender with Ollama"""
        self.host = host or settings.OLLAMA_HOST
        self.model = model or settings.OLLAMA_MODEL
        
    def generate_sentences(self, profile: Dict) -> List[str]:
        """
        Generate personalized practice sentences based on user profile
        
        Args:
            profile: User profile dict with keys:
                - age, gender, native_language, speech_disorder_type,
                - current_severity, therapy_goal, interests, trouble_sounds
        
        Returns:
            List of 5 personalized sentences
        """
        prompt = self._build_prompt(profile)
        
        try:
            response = ollama.chat(
                model=self.model,
                messages=[
                    {
                        'role': 'system',
                        'content': 'You are a speech therapy expert. Generate practice sentences that are appropriate, engaging, and target specific phonemes.'
                    },
                    {
                        'role': 'user',
                        'content': prompt
                    }
                ]
            )
            
            # Parse response
            sentences = self._parse_sentences(response['message']['content'])
            return sentences[:6]  # Return exactly 6 sentences
            
        except Exception as e:
            print(f"⚠️  LLM Error: {e}")
            print(f"💡 Using fallback sentences (Ollama not available)")
            # Fallback sentences - always return something
            return self._get_fallback_sentences(profile.get('trouble_sounds', ''))
    
    def _build_prompt(self, profile: Dict) -> str:
        """Build intelligent prompt based on complete profile analysis"""
        trouble_sounds = profile.get('trouble_sounds', 'S, R')
        age = profile.get('age', 25)
        interests = profile.get('interests', 'general topics')
        disorder = profile.get('speech_disorder_type', 'articulation')
        severity = profile.get('current_severity', 'moderate')
        goal = profile.get('therapy_goal', 'improve clarity')
        gender = profile.get('gender', 'unknown')
        native_language = profile.get('native_language', 'English')
        
        # Determine age-appropriate complexity
        if age <= 10:
            complexity = "very simple"
            word_count = "5-8 words"
            vocabulary = "elementary school level (grades 1-3)"
            sentence_type = "short, simple sentences with basic vocabulary"
        elif age <= 15:
            complexity = "simple to moderate"
            word_count = "8-12 words"
            vocabulary = "middle school level (grades 4-8)"
            sentence_type = "clear sentences with age-appropriate vocabulary"
        elif age <= 25:
            complexity = "moderate"
            word_count = "10-15 words"
            vocabulary = "high school to college level"
            sentence_type = "natural, engaging sentences with varied structure"
        elif age <= 50:
            complexity = "moderate to advanced"
            word_count = "12-18 words"
            vocabulary = "adult professional level"
            sentence_type = "sophisticated sentences with rich vocabulary"
        else:
            complexity = "moderate with clear structure"
            word_count = "10-15 words"
            vocabulary = "mature adult level, clear and dignified"
            sentence_type = "well-structured sentences, not too complex"
        
        prompt = f"""You are an expert speech therapist creating personalized practice sentences.

PATIENT PROFILE:
- Age: {age} years old ({complexity} complexity required)
- Gender: {gender}
- Native Language: {native_language}
- Speech Challenge: {disorder} ({severity} severity)
- Primary Trouble Sounds: {trouble_sounds}
- Personal Interests: {interests}
- Therapy Goal: {goal}

CRITICAL REQUIREMENTS:
1. AGE-APPROPRIATE COMPLEXITY:
   - Use {vocabulary} vocabulary
   - Sentence length: {word_count}
   - Style: {sentence_type}
   - MUST match the cognitive and linguistic level of a {age}-year-old

2. PHONEME TARGETING:
   - Each sentence MUST contain 3-5 instances of trouble sounds: {trouble_sounds}
   - Distribute trouble sounds naturally throughout the sentence
   - Focus on initial, medial, and final positions

3. PERSONALIZATION:
   - Relate to interests: {interests}
   - Make content engaging and relevant to their life
   - Use examples they can connect with

4. THERAPEUTIC VALUE:
   - Target {severity} severity level
   - Support goal: {goal}
   - Progressive difficulty across the 6 sentences

5. NATURAL LANGUAGE:
   - Sound conversational and natural
   - Avoid forced or awkward phrasing
   - Be culturally appropriate

GENERATE EXACTLY 6 SENTENCES:
- Sentences 1-2: Easier (more basic structure)
- Sentences 3-4: Moderate (standard complexity)
- Sentences 5-6: Challenging (slightly more complex)

Format: Return ONLY the 6 sentences, one per line, numbered 1-6. No explanations.
"""
        return prompt
    
    def _parse_sentences(self, response: str) -> List[str]:
        """Parse LLM response to extract sentences"""
        lines = response.strip().split('\n')
        sentences = []
        
        for line in lines:
            # Remove numbering and clean
            line = line.strip()
            if not line:
                continue
            
            # Remove common prefixes
            for prefix in ['1.', '2.', '3.', '4.', '5.', '6.', '1)', '2)', '3)', '4)', '5)', '6)']:
                if line.startswith(prefix):
                    line = line[len(prefix):].strip()
                    break
            
            if line and len(line) > 10:  # Valid sentence
                sentences.append(line)
        
        return sentences
    
    def _get_fallback_sentences(self, trouble_sounds: str) -> List[str]:
        """Fallback sentences when LLM is unavailable - Simple and clear"""
        # Simple, clear sentences for practice
        return [
            "The sun shines bright in the sky.",
            "I like to read books every day.",
            "She runs fast in the park.",
            "We play games with our friends.",
            "The cat sleeps on the soft bed.",
            "He drinks water after running."
        ]
    
    def generate_adaptive_sentences(self, profile: Dict, performance_history: List[Dict]) -> List[str]:
        """
        Generate sentences adapted to user's performance history
        
        Args:
            profile: User profile
            performance_history: List of past session results with weak phonemes
        
        Returns:
            List of 5 adaptive sentences
        """
        # Analyze performance history
        weak_phonemes = self._analyze_weak_phonemes(performance_history)
        
        # Update profile with performance insights
        enhanced_profile = profile.copy()
        enhanced_profile['trouble_sounds'] = ', '.join(weak_phonemes[:5])
        
        prompt = self._build_adaptive_prompt(enhanced_profile, weak_phonemes)
        
        try:
            response = ollama.chat(
                model=self.model,
                messages=[
                    {
                        'role': 'system',
                        'content': 'You are a speech therapy expert specializing in adaptive learning.'
                    },
                    {
                        'role': 'user',
                        'content': prompt
                    }
                ]
            )
            
            sentences = self._parse_sentences(response['message']['content'])
            return sentences[:5]
            
        except Exception as e:
            print(f"LLM Error: {e}")
            return self._get_fallback_sentences(enhanced_profile.get('trouble_sounds', ''))
    
    def _analyze_weak_phonemes(self, performance_history: List[Dict]) -> List[str]:
        """Analyze performance history to identify consistently weak phonemes"""
        phoneme_errors = {}
        
        for session in performance_history:
            for phoneme in session.get('weak_phonemes', []):
                phoneme_errors[phoneme] = phoneme_errors.get(phoneme, 0) + 1
        
        # Sort by frequency
        sorted_phonemes = sorted(phoneme_errors.items(), key=lambda x: x[1], reverse=True)
        return [p[0] for p in sorted_phonemes]
    
    def _build_adaptive_prompt(self, profile: Dict, weak_phonemes: List[str]) -> str:
        """Build adaptive prompt based on performance"""
        prompt = f"""Generate 5 adaptive practice sentences for speech therapy:

Patient Profile:
- Age: {profile.get('age', 'unknown')}
- Interests: {profile.get('interests', 'general')}

Performance Analysis:
- Consistently weak phonemes: {', '.join(weak_phonemes[:5])}
- These sounds need extra focus and practice

Requirements:
1. HEAVILY emphasize the weak phonemes: {', '.join(weak_phonemes[:3])}
2. Include 3-5 instances of each weak phoneme per sentence
3. Make sentences progressively challenging
4. Keep them engaging and age-appropriate
5. Vary sentence structure

Format: Return ONLY 5 sentences, one per line, numbered 1-5.
"""
        return prompt
