from sqlalchemy.orm import Session
from app.db.database import engine, Base, SessionLocal
from app.db.models import User, UserStats
from app.core.security import get_password_hash

def init_db():
    """Initialize database with tables and default admin"""
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Check if admin exists
        admin = db.query(User).filter(User.email == "admin@vocalspace.com").first()
        if not admin:
            # Create default admin with a simple password
            admin_password = "admin123"
            hashed_password = get_password_hash(admin_password)
            
            admin = User(
                email="admin@vocalspace.com",
                hashed_password=hashed_password,
                full_name="Admin User",
                role="therapist",
                profile_completed=True
            )
            db.add(admin)
            db.commit()
            print("✅ Default admin created: admin@vocalspace.com / admin123")
        else:
            print("ℹ️  Admin already exists")
        
        print("✅ Database initialized successfully")
        
    except Exception as e:
        print(f"❌ Error initializing database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
