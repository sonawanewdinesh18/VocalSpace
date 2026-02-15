"""
Recommendation Engine Orchestrator
Decides whether to use PRE or POST recommendations
"""

from typing import List, Dict
from .llm_recommender import LLMRecommender
from .adaptive_recommender import AdaptiveRecommender

class RecommendationEngine:
    """
    Smart orchestrator that decides which recommendation strategy to use:
    - PRE-Recommendations: Profile-based (new users or profile updates)
    - POST-Recommendations: Performance-based (after practice sessions)
    """
    
    def __init__(self):
        self.pre_recommender = LLMRecommender()
        self.post_recommender = AdaptiveRecommender()
    
    def generate_recommendations(
        self,
        profile: Dict,
        performance_history: List[Dict] = None,
        force_type: str = None
    ) -> Dict:
        """
        Generate recommendations using appropriate strategy
        
        Args:
            profile: User profile data
            performance_history: List of past practice sessions (optional)
            force_type: Force 'pre' or 'post' recommendations (optional)
        
        Returns:
            Dict with:
                - sentences: List of 6 sentences
                - type: 'pre' or 'post'
                - reason: Why this type was chosen
        """
        
        # Determine which recommendation type to use
        rec_type, reason = self._determine_recommendation_type(
            performance_history,
            force_type
        )
        
        print(f"\n🎯 Recommendation Strategy: {rec_type.upper()}")
        print(f"   Reason: {reason}")
        
        if rec_type == 'post' and performance_history:
            # Use POST-recommendations (performance-based)
            print(f"   📊 Analyzing {len(performance_history)} practice sessions...")
            sentences = self.post_recommender.generate_adaptive_sentences(
                profile,
                performance_history
            )
            print(f"   ✅ Generated {len(sentences)} adaptive sentences")
        else:
            # Use PRE-recommendations (profile-based)
            print(f"   👤 Using profile data for personalization...")
            sentences = self.pre_recommender.generate_sentences(profile)
            print(f"   ✅ Generated {len(sentences)} profile-based sentences")
        
        return {
            'sentences': sentences,
            'type': rec_type,
            'reason': reason
        }
    
    def _determine_recommendation_type(
        self,
        performance_history: List[Dict],
        force_type: str = None
    ) -> tuple:
        """
        Determine whether to use PRE or POST recommendations
        
        Returns:
            (type, reason) tuple
        """
        
        # If forced, use that type
        if force_type in ['pre', 'post']:
            return (force_type, f"Forced to use {force_type} recommendations")
        
        # If no performance history, use PRE
        if not performance_history or len(performance_history) == 0:
            return ('pre', "New user - no practice history available")
        
        # If less than 3 sessions, use PRE
        if len(performance_history) < 3:
            return ('pre', f"Only {len(performance_history)} sessions - insufficient data for adaptation")
        
        # If 3+ sessions, use POST
        return ('post', f"Sufficient practice data ({len(performance_history)} sessions) - using adaptive recommendations")
    
    def should_regenerate(
        self,
        last_recommendation_date,
        last_profile_update_date,
        sessions_since_last_recommendation: int
    ) -> tuple:
        """
        Determine if recommendations should be regenerated
        
        Returns:
            (should_regenerate, reason, type) tuple
        """
        
        # Profile was updated after last recommendation
        if last_profile_update_date and last_recommendation_date:
            if last_profile_update_date > last_recommendation_date:
                return (True, "Profile was updated", "pre")
        
        # User has completed 5+ sessions since last recommendation
        if sessions_since_last_recommendation >= 5:
            return (True, f"{sessions_since_last_recommendation} new sessions completed", "post")
        
        # No need to regenerate
        return (False, "Current recommendations still valid", None)

