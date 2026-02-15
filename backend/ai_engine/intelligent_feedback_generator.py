"""
Intelligent Feedback Generator
Based on ELSA Speak, BoldVoice, and professional speech therapy practices

Features:
1. Detailed mistake identification
2. Specific practice exercises
3. Step-by-step improvement tips
4. Adaptive difficulty
5. Progress-based recommendations
"""

from typing import Dict, List, Tuple
import numpy as np

class IntelligentFeedbackGenerator:
    """
    Generate intelligent, actionable feedback like ELSA Speak
    """
    
    def __init__(self):
        # Phoneme-specific exercises (based on speech therapy research)
        self.phoneme_exercises = {
            'R': {
                'name': '/r/ sound',
                'common_issues': ['Pronouncing as /w/', 'Not enough tongue curl', 'Too soft'],
                'exercises': [
                    'Say "red, right, run" slowly 10 times',
                    'Practice tongue position: curl tip back',
                    'Say "car, far, star" with emphasis on /r/',
                    'Record and compare with native speaker'
                ],
                'tips': [
                    'Curl your tongue tip back toward roof of mouth',
                    'Keep sides of tongue touching upper teeth',
                    'Make sound from back of throat',
                    'Practice in front of mirror'
                ]
            },
            'TH': {
                'name': '/θ/ and /ð/ sounds',
                'common_issues': ['Pronouncing as /t/ or /d/', 'Tongue position wrong', 'Not enough air'],
                'exercises': [
                    'Say "think, thank, thought" 10 times',
                    'Practice "the, this, that, these"',
                    'Tongue between teeth: "three, throw, through"',
                    'Feel air on hand while saying /th/'
                ],
                'tips': [
                    'Place tongue between teeth',
                    'Blow air gently over tongue',
                    'Don\'t press tongue too hard',
                    'Practice voiceless (think) and voiced (this) separately'
                ]
            },
            'L': {
                'name': '/l/ sound',
                'common_issues': ['Dark L vs Light L', 'Tongue position', 'Too much tension'],
                'exercises': [
                    'Say "light, like, love" slowly',
                    'Practice "ball, call, fall" (dark L)',
                    'Alternate: "la-la-la" then "al-al-al"',
                    'Say "little, level, local" clearly'
                ],
                'tips': [
                    'Touch tongue tip to ridge behind upper teeth',
                    'Keep tongue relaxed',
                    'Light L: tongue tip up at start',
                    'Dark L: back of tongue raised at end'
                ]
            },
            'S': {
                'name': '/s/ sound',
                'common_issues': ['Lisp', 'Too much air', 'Tongue position'],
                'exercises': [
                    'Say "see, sit, sun" with clear /s/',
                    'Practice "snake, snow, star"',
                    'Hiss like snake: "ssssss" for 5 seconds',
                    'Say "bus, yes, miss" with final /s/'
                ],
                'tips': [
                    'Keep tongue tip near but not touching teeth',
                    'Create narrow channel for air',
                    'Teeth should be close together',
                    'Air flows over center of tongue'
                ]
            },
            'SH': {
                'name': '/ʃ/ sound',
                'common_issues': ['Confusing with /s/', 'Lip rounding', 'Air flow'],
                'exercises': [
                    'Say "she, ship, show" clearly',
                    'Practice "shush" sound: "shhhh"',
                    'Say "fish, wish, dish" with clear /sh/',
                    'Alternate /s/ and /sh/: "see-she, sip-ship"'
                ],
                'tips': [
                    'Round lips slightly',
                    'Tongue further back than /s/',
                    'Wider air channel than /s/',
                    'Softer, quieter sound than /s/'
                ]
            },
            'V': {
                'name': '/v/ sound',
                'common_issues': ['Pronouncing as /f/', 'Not enough voicing', 'Lip position'],
                'exercises': [
                    'Say "very, voice, video" clearly',
                    'Feel vibration: touch throat while saying /v/',
                    'Practice "five, have, love"',
                    'Alternate /f/ and /v/: "fan-van, fine-vine"'
                ],
                'tips': [
                    'Touch upper teeth to lower lip',
                    'Voice should vibrate (not just air)',
                    'Feel vibration in throat',
                    'More vibration than /f/ sound'
                ]
            },
            'W': {
                'name': '/w/ sound',
                'common_issues': ['Confusing with /v/', 'Lip rounding', 'Too tense'],
                'exercises': [
                    'Say "we, will, want" with rounded lips',
                    'Practice "water, window, world"',
                    'Exaggerate lip rounding: "woo-woo-woo"',
                    'Say "quick, queen, question"'
                ],
                'tips': [
                    'Round lips into small circle',
                    'Start with lips rounded, then release',
                    'No teeth touching lips',
                    'Quick glide into next sound'
                ]
            }
        }
        
        # Word-level exercises
        self.word_difficulty_levels = {
            'easy': ['cat', 'dog', 'run', 'sit', 'big', 'red'],
            'medium': ['practice', 'sentence', 'important', 'different'],
            'hard': ['thoroughly', 'pronunciation', 'requirements', 'specifically']
        }
    
    def generate_comprehensive_feedback(
        self,
        accuracy: int,
        transcription: str,
        expected_text: str,
        weak_phonemes: List[str],
        weak_words: List[Dict],
        missing_words: List[str],
        phoneme_results: List[Dict]
    ) -> Dict:
        """
        Generate comprehensive, intelligent feedback
        
        Returns detailed analysis with:
        1. Overall assessment
        2. Specific mistakes
        3. Practice exercises
        4. Improvement tips
        5. Next steps
        """
        
        feedback = {
            'overall_assessment': self._generate_overall_assessment(accuracy),
            'detailed_mistakes': self._identify_detailed_mistakes(
                transcription, expected_text, weak_phonemes, weak_words, missing_words, phoneme_results
            ),
            'practice_exercises': self._generate_practice_exercises(weak_phonemes, weak_words),
            'improvement_tips': self._generate_improvement_tips(accuracy, weak_phonemes),
            'next_steps': self._generate_next_steps(accuracy, weak_phonemes, weak_words),
            'progress_insights': self._generate_progress_insights(accuracy, phoneme_results)
        }
        
        return feedback
    
    def _generate_overall_assessment(self, accuracy: int) -> Dict:
        """Generate overall performance assessment"""
        if accuracy >= 90:
            level = 'Excellent'
            message = 'Outstanding! Your pronunciation is very clear and natural.'
            emoji = '🌟'
            color = 'green'
        elif accuracy >= 80:
            level = 'Very Good'
            message = 'Great job! You\'re speaking clearly with minor areas to improve.'
            emoji = '✨'
            color = 'blue'
        elif accuracy >= 70:
            level = 'Good'
            message = 'Good progress! Focus on the specific sounds that need work.'
            emoji = '👍'
            color = 'yellow'
        elif accuracy >= 60:
            level = 'Fair'
            message = 'Keep practicing! You\'re making progress but need more work.'
            emoji = '💪'
            color = 'orange'
        else:
            level = 'Needs Improvement'
            message = 'Don\'t give up! Consistent practice will help you improve.'
            emoji = '🎯'
            color = 'red'
        
        return {
            'level': level,
            'message': message,
            'emoji': emoji,
            'color': color,
            'score': accuracy
        }
    
    def _identify_detailed_mistakes(
        self,
        transcription: str,
        expected_text: str,
        weak_phonemes: List[str],
        weak_words: List[Dict],
        missing_words: List[str],
        phoneme_results: List[Dict]
    ) -> List[Dict]:
        """Identify specific mistakes with explanations"""
        mistakes = []
        
        # Missing words
        if missing_words:
            for word in missing_words[:3]:
                mistakes.append({
                    'type': 'missing_word',
                    'severity': 'high',
                    'word': word,
                    'issue': f'You didn\'t say "{word}"',
                    'explanation': 'This word was expected but not detected in your speech.',
                    'fix': f'Practice saying "{word}" clearly and slowly.'
                })
        
        # Weak words
        if weak_words:
            for word_info in weak_words[:3]:
                word = word_info['word']
                accuracy = word_info.get('accuracy', 0)
                mistakes.append({
                    'type': 'weak_word',
                    'severity': 'medium' if accuracy >= 50 else 'high',
                    'word': word,
                    'accuracy': accuracy,
                    'issue': f'"{word}" pronunciation needs improvement ({accuracy}%)',
                    'explanation': 'Your pronunciation of this word was unclear or incorrect.',
                    'fix': f'Break down "{word}" into syllables and practice each part.'
                })
        
        # Weak phonemes
        if weak_phonemes:
            for phoneme in weak_phonemes[:5]:
                if phoneme in self.phoneme_exercises:
                    exercise_info = self.phoneme_exercises[phoneme]
                    mistakes.append({
                        'type': 'weak_phoneme',
                        'severity': 'medium',
                        'phoneme': phoneme,
                        'name': exercise_info['name'],
                        'issue': f'The {exercise_info["name"]} sound needs practice',
                        'explanation': f'Common issues: {", ".join(exercise_info["common_issues"][:2])}',
                        'fix': exercise_info['exercises'][0]
                    })
        
        return mistakes
    
    def _generate_practice_exercises(
        self,
        weak_phonemes: List[str],
        weak_words: List[Dict]
    ) -> List[Dict]:
        """Generate specific practice exercises"""
        exercises = []
        
        # Phoneme-specific exercises
        for phoneme in weak_phonemes[:3]:
            if phoneme in self.phoneme_exercises:
                info = self.phoneme_exercises[phoneme]
                exercises.append({
                    'title': f'Practice {info["name"]}',
                    'type': 'phoneme',
                    'target': phoneme,
                    'duration': '5-10 minutes',
                    'exercises': info['exercises'],
                    'tips': info['tips']
                })
        
        # Word-specific exercises
        for word_info in weak_words[:2]:
            word = word_info['word']
            exercises.append({
                'title': f'Master the word "{word}"',
                'type': 'word',
                'target': word,
                'duration': '3-5 minutes',
                'exercises': [
                    f'Say "{word}" slowly 10 times',
                    f'Break into syllables and practice each',
                    f'Use "{word}" in 5 different sentences',
                    f'Record yourself saying "{word}" and listen back'
                ],
                'tips': [
                    'Focus on each sound in the word',
                    'Don\'t rush - clarity over speed',
                    'Practice in front of a mirror',
                    'Compare with native pronunciation'
                ]
            })
        
        # General exercises
        exercises.append({
            'title': 'Daily Practice Routine',
            'type': 'general',
            'duration': '15-20 minutes',
            'exercises': [
                'Warm up: hum for 30 seconds',
                'Practice tongue twisters slowly',
                'Read aloud for 5 minutes',
                'Record and review your speech',
                'Practice difficult sounds 10 times each'
            ],
            'tips': [
                'Practice at the same time each day',
                'Start slow, increase speed gradually',
                'Focus on quality, not quantity',
                'Be patient with yourself'
            ]
        })
        
        return exercises
    
    def _generate_improvement_tips(
        self,
        accuracy: int,
        weak_phonemes: List[str]
    ) -> List[Dict]:
        """Generate actionable improvement tips"""
        tips = []
        
        # General tips based on accuracy
        if accuracy < 70:
            tips.append({
                'category': 'Foundation',
                'priority': 'high',
                'tip': 'Slow down your speech',
                'explanation': 'Speaking slowly helps you focus on each sound and improves clarity.',
                'action': 'Practice speaking at half your normal speed for 5 minutes daily.'
            })
        
        if accuracy < 80:
            tips.append({
                'category': 'Technique',
                'priority': 'high',
                'tip': 'Use a mirror while practicing',
                'explanation': 'Watching your mouth helps you see if you\'re making the right shapes.',
                'action': 'Practice in front of a mirror for 10 minutes daily.'
            })
        
        # Phoneme-specific tips
        for phoneme in weak_phonemes[:2]:
            if phoneme in self.phoneme_exercises:
                info = self.phoneme_exercises[phoneme]
                tips.append({
                    'category': 'Sound Practice',
                    'priority': 'medium',
                    'tip': f'Focus on {info["name"]}',
                    'explanation': info['tips'][0],
                    'action': info['exercises'][0]
                })
        
        # Always include these universal tips
        tips.extend([
            {
                'category': 'Listening',
                'priority': 'medium',
                'tip': 'Listen to native speakers',
                'explanation': 'Exposure to correct pronunciation helps train your ear.',
                'action': 'Listen to podcasts or audiobooks for 15 minutes daily.'
            },
            {
                'category': 'Recording',
                'priority': 'medium',
                'tip': 'Record yourself regularly',
                'explanation': 'Hearing yourself helps identify areas for improvement.',
                'action': 'Record 5 minutes of speech daily and review it.'
            },
            {
                'category': 'Consistency',
                'priority': 'high',
                'tip': 'Practice every day',
                'explanation': 'Daily practice, even for 10 minutes, is more effective than occasional long sessions.',
                'action': 'Set a daily reminder to practice at the same time.'
            }
        ])
        
        return tips
    
    def _generate_next_steps(
        self,
        accuracy: int,
        weak_phonemes: List[str],
        weak_words: List[Dict]
    ) -> Dict:
        """Generate personalized next steps"""
        if accuracy >= 90:
            focus = 'Maintain your excellent pronunciation and challenge yourself with advanced content.'
            goals = [
                'Practice with longer, more complex sentences',
                'Work on speaking speed while maintaining clarity',
                'Try different accents or speaking styles',
                'Help others by sharing your progress'
            ]
        elif accuracy >= 75:
            focus = 'You\'re doing well! Focus on polishing specific sounds and words.'
            goals = [
                f'Master the {len(weak_phonemes)} sounds that need work',
                'Practice weak words in context',
                'Increase practice time to 20 minutes daily',
                'Record yourself weekly to track progress'
            ]
        else:
            focus = 'Build a strong foundation with consistent daily practice.'
            goals = [
                'Practice 15 minutes every day without fail',
                'Focus on one sound at a time',
                'Start with simple words and sentences',
                'Celebrate small improvements'
            ]
        
        return {
            'focus': focus,
            'goals': goals,
            'recommended_practice_time': '15-20 minutes daily' if accuracy < 75 else '10-15 minutes daily',
            'estimated_improvement_time': self._estimate_improvement_time(accuracy)
        }
    
    def _generate_progress_insights(
        self,
        accuracy: int,
        phoneme_results: List[Dict]
    ) -> Dict:
        """Generate insights about progress"""
        if not phoneme_results:
            return {}
        
        scores = [pr['score'] for pr in phoneme_results]
        avg_score = np.mean(scores)
        consistency = 100 - np.std(scores)
        
        return {
            'average_phoneme_score': round(avg_score, 1),
            'consistency_score': round(consistency, 1),
            'strongest_sounds': self._get_strongest_sounds(phoneme_results),
            'improvement_areas': self._get_improvement_areas(phoneme_results),
            'insight': self._generate_insight_message(avg_score, consistency)
        }
    
    def _get_strongest_sounds(self, phoneme_results: List[Dict]) -> List[str]:
        """Identify strongest phonemes"""
        phoneme_scores = {}
        for pr in phoneme_results:
            p = pr['phoneme']
            if p not in phoneme_scores:
                phoneme_scores[p] = []
            phoneme_scores[p].append(pr['score'])
        
        avg_scores = {p: np.mean(scores) for p, scores in phoneme_scores.items()}
        strongest = sorted(avg_scores.items(), key=lambda x: x[1], reverse=True)[:3]
        return [p for p, score in strongest if score >= 80]
    
    def _get_improvement_areas(self, phoneme_results: List[Dict]) -> List[str]:
        """Identify areas needing improvement"""
        phoneme_scores = {}
        for pr in phoneme_results:
            p = pr['phoneme']
            if p not in phoneme_scores:
                phoneme_scores[p] = []
            phoneme_scores[p].append(pr['score'])
        
        avg_scores = {p: np.mean(scores) for p, scores in phoneme_scores.items()}
        weakest = sorted(avg_scores.items(), key=lambda x: x[1])[:3]
        return [p for p, score in weakest if score < 70]
    
    def _generate_insight_message(self, avg_score: float, consistency: float) -> str:
        """Generate insight message"""
        if avg_score >= 85 and consistency >= 85:
            return "Excellent! You're consistently pronouncing sounds correctly."
        elif avg_score >= 75 and consistency >= 75:
            return "Good progress! Your pronunciation is becoming more consistent."
        elif consistency < 60:
            return "Focus on consistency. Some sounds are good, others need work."
        else:
            return "Keep practicing! Consistent effort will lead to improvement."
    
    def _estimate_improvement_time(self, accuracy: int) -> str:
        """Estimate time to reach next level"""
        if accuracy >= 90:
            return "You're at an excellent level! Continue practicing to maintain."
        elif accuracy >= 80:
            return "2-3 weeks of daily practice to reach excellent level"
        elif accuracy >= 70:
            return "4-6 weeks of daily practice to reach very good level"
        elif accuracy >= 60:
            return "6-8 weeks of daily practice to reach good level"
        else:
            return "8-12 weeks of consistent daily practice to reach good level"
