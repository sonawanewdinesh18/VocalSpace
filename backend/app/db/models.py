from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    role = Column(String, default="user")  # user or therapist
    profile_completed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    profile = relationship("UserProfile", back_populates="user", uselist=False)
    sessions = relationship("PracticeSession", back_populates="user")
    recommendations = relationship("Recommendation", back_populates="user")
    stats = relationship("UserStats", back_populates="user", uselist=False)

class UserProfile(Base):
    __tablename__ = "user_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    profile_image = Column(String)
    mobile = Column(String)
    age = Column(Integer)
    gender = Column(String)
    native_language = Column(String)
    speech_disorder_type = Column(String)
    current_severity = Column(String)
    therapy_goal = Column(Text)
    interests = Column(Text)
    trouble_sounds = Column(String)
    
    # Relationships
    user = relationship("User", back_populates="profile")

class Recommendation(Base):
    __tablename__ = "recommendations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    sentences = Column(JSON)  # List of recommended sentences
    generated_at = Column(DateTime(timezone=True), server_default=func.now())
    is_active = Column(Boolean, default=True, index=True)
    
    # Relationships
    user = relationship("User", back_populates="recommendations")

class PracticeSession(Base):
    __tablename__ = "practice_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    sentence = Column(Text)
    
    # Audio Paths
    reference_audio_path = Column(String)  # Correct pronunciation audio
    user_audio_path = Column(String)  # User's recorded audio
    
    # Analysis Results
    accuracy = Column(Float)
    mastered = Column(Boolean, default=False)  # True if user scored >= 85%
    
    # Phoneme Analysis
    weak_phonemes = Column(JSON)  # List of phonemes user struggles with
    phoneme_scores = Column(JSON)  # Score per phoneme {"sh": 78, "s": 95}
    phoneme_timings = Column(JSON)  # Timing data for phonemes
    
    # Word Analysis
    weak_words = Column(JSON)  # Words pronounced incorrectly with scores
    missing_words = Column(JSON)  # Words user didn't say at all
    word_timings = Column(JSON)  # Timing data for each word
    
    # Feedback
    feedback = Column(Text)  # Detailed text feedback
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    # Relationships
    user = relationship("User", back_populates="sessions")

class UserStats(Base):
    __tablename__ = "user_stats"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, index=True)
    total_sessions = Column(Integer, default=0)
    average_accuracy = Column(Float, default=0.0)
    streak_days = Column(Integer, default=0)
    xp_points = Column(Integer, default=0)
    level = Column(Integer, default=1)  # Gamification level (1-100)
    last_practice_date = Column(DateTime(timezone=True))
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="stats")
