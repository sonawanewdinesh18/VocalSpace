"""
Database Reset Script
This script drops all tables and recreates them with fresh schema
Run from project root: python -m backend.scripts.reset_database
"""

import sys
import os

# Add backend directory to Python path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, backend_dir)

from app.db.database import engine, Base
from app.db.models import User, UserProfile, UserStats, Recommendation, PracticeSession
from app.db.init_db import init_db

def reset_database():
    """Drop all tables and recreate them"""
    print("🗑️  Dropping all tables...")
    
    # Use CASCADE to drop tables with dependencies
    from sqlalchemy import text
    with engine.connect() as conn:
        # Drop all tables with CASCADE
        conn.execute(text("DROP SCHEMA public CASCADE"))
        conn.execute(text("CREATE SCHEMA public"))
        conn.execute(text("GRANT ALL ON SCHEMA public TO postgres"))
        conn.execute(text("GRANT ALL ON SCHEMA public TO public"))
        conn.commit()
    
    print("✅ All tables dropped")
    
    print("\n📦 Creating fresh tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ All tables created")
    
    print("\n👤 Creating default admin user...")
    init_db()
    print("✅ Default admin created")
    
    print("\n🎉 Database reset complete!")
    print("\n📝 Default Admin Credentials:")
    print("   Email: admin@vocalspace.com")
    print("   Password: admin123")
    print("\n💡 You can now sign up with a new account or use the admin account")

if __name__ == "__main__":
    print("=" * 60)
    print("VocalSpace Database Reset")
    print("=" * 60)
    print("\n⚠️  WARNING: This will delete ALL data in the database!")
    print("   - All users will be deleted")
    print("   - All profiles will be deleted")
    print("   - All practice sessions will be deleted")
    print("   - All recommendations will be deleted")
    print("   - All statistics will be deleted")
    
    confirm = input("\n❓ Are you sure you want to continue? (yes/no): ")
    
    if confirm.lower() in ['yes', 'y']:
        reset_database()
    else:
        print("\n❌ Database reset cancelled")
