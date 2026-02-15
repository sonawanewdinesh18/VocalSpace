from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.database import get_db
from app.db.models import User, UserStats, PracticeSession
from app.api.dependencies import get_current_admin
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/stats")
async def get_admin_stats(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Get overall platform statistics"""
    
    total_patients = db.query(User).filter(User.role == "user").count()
    
    # Active today
    today = datetime.now().date()
    active_today = db.query(PracticeSession)\
        .filter(func.date(PracticeSession.created_at) == today)\
        .distinct(PracticeSession.user_id)\
        .count()
    
    # Average improvement
    stats = db.query(UserStats).all()
    avg_improvement = sum(s.average_accuracy for s in stats) / len(stats) if stats else 0
    
    # Total sessions
    total_sessions = db.query(PracticeSession).count()
    
    return {
        "totalPatients": total_patients,
        "activeToday": active_today,
        "avgImprovement": int(avg_improvement),
        "totalSessions": total_sessions
    }

@router.get("/patients")
async def get_patients(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Get list of all patients with their stats"""
    
    users = db.query(User).filter(User.role == "user").all()
    
    patients = []
    for user in users:
        stats = db.query(UserStats).filter(UserStats.user_id == user.id).first()
        profile = user.profile
        
        last_session = db.query(PracticeSession)\
            .filter(PracticeSession.user_id == user.id)\
            .order_by(PracticeSession.created_at.desc())\
            .first()
        
        patients.append({
            "id": user.id,
            "name": user.full_name or user.email,
            "disorder": profile.speech_disorder_type if profile else "N/A",
            "sessions": stats.total_sessions if stats else 0,
            "accuracy": int(stats.average_accuracy) if stats else 0,
            "lastActive": last_session.created_at.strftime("%Y-%m-%d") if last_session else "Never"
        })
    
    return {"patients": patients}
