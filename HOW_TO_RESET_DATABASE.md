# 🗄️ How to Reset Database

## ⚠️ WARNING
**This script will DELETE ALL DATA in your database!**
- All users will be deleted
- All profiles will be deleted
- All practice sessions will be deleted
- All recommendations will be deleted
- All statistics will be deleted

**Only use this if you want to start fresh!**

---

## 🚀 How to Run reset_database.py

### Step 1: Make Sure PostgreSQL is Running

Check if PostgreSQL is running:
```bash
# Windows (check services):
# Press Win+R, type "services.msc", look for PostgreSQL

# Or check with command:
pg_isready
```

### Step 2: Navigate to Backend Directory

**IMPORTANT:** Run from project root, not backend directory!

```bash
# Navigate to project root (D:\VocalSpace)
cd D:\VocalSpace
```

### Step 3: Activate Virtual Environment

**Windows:**
```bash
backend\venv\Scripts\activate
```

**Mac/Linux:**
```bash
source backend/venv/bin/activate
```

### Step 4: Run the Reset Script

**Method 1 (Recommended):**
```bash
python -m backend.scripts.reset_database
```

**Method 2 (Alternative):**
```bash
cd backend
set PYTHONPATH=%CD%
python scripts/reset_database.py
```

---

## 📋 What You'll See

### Interactive Prompt:
```
============================================================
VocalSpace Database Reset
============================================================

⚠️  WARNING: This will delete ALL data in the database!
   - All users will be deleted
   - All profiles will be deleted
   - All practice sessions will be deleted
   - All recommendations will be deleted
   - All statistics will be deleted

❓ Are you sure you want to continue? (yes/no):
```

### Type "yes" to Continue:
```
🗑️  Dropping all tables...
✅ All tables dropped

📦 Creating fresh tables...
✅ All tables created

👤 Creating default admin user...
✅ Default admin created

🎉 Database reset complete!

📝 Default Admin Credentials:
   Email: admin@vocalspace.com
   Password: admin123

💡 You can now sign up with a new account or use the admin account
```

---

## 🔐 Default Admin Account

After reset, you can login with:
- **Email:** `admin@vocalspace.com`
- **Password:** `admin123`
- **Role:** Therapist (Admin)

**⚠️ IMPORTANT:** Change this password in production!

---

## 🐛 Troubleshooting

### Error: "No module named 'app'"

**Solution:** Run from project root, not backend directory:
```bash
# Go back to project root
cd D:\VocalSpace

# Make sure venv is activated
backend\venv\Scripts\activate

# Run from root
python -m backend.scripts.reset_database
```

### Error: "Could not connect to database"

**Solution 1:** Check if PostgreSQL is running
```bash
# Windows: Check services
# Mac: brew services list
# Linux: sudo systemctl status postgresql
```

**Solution 2:** Check your `.env` file in `backend/` folder:
```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/vocalspace
```

Make sure:
- Username is correct (usually `postgres`)
- Password is correct
- Database name is correct (`vocalspace`)
- Port is correct (usually `5432`)

### Error: "Database 'vocalspace' does not exist"

**Solution:** Create the database first:
```bash
# Using psql:
psql -U postgres
CREATE DATABASE vocalspace;
\q

# Or using pgAdmin (GUI)
```

### Error: "Permission denied"

**Solution:** Make sure your PostgreSQL user has permissions:
```sql
-- Connect to PostgreSQL
psql -U postgres

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE vocalspace TO postgres;
```

---

## 🔄 Alternative: Manual Database Reset

If the script doesn't work, you can reset manually:

### Option 1: Using psql
```bash
# Connect to PostgreSQL
psql -U postgres

# Drop and recreate database
DROP DATABASE vocalspace;
CREATE DATABASE vocalspace;

# Exit
\q

# Then run init_db
cd backend
python -m app.db.init_db
```

### Option 2: Using pgAdmin
1. Open pgAdmin
2. Right-click on `vocalspace` database
3. Select "Delete/Drop"
4. Create new database named `vocalspace`
5. Run: `python -m app.db.init_db`

---

## 📝 After Reset

### 1. Verify Database is Reset
```bash
# Check tables exist
psql -U postgres -d vocalspace -c "\dt"

# Should show:
# - users
# - user_profiles
# - user_stats
# - recommendations
# - practice_sessions
```

### 2. Test Admin Login
- Go to: http://localhost:5173/auth
- Email: `admin@vocalspace.com`
- Password: `admin123`
- Should login successfully

### 3. Create New User Account
- Click "Sign Up"
- Fill in details
- Complete profile
- Start practicing!

---

## 🎯 When to Use Database Reset

### ✅ Good Reasons:
- Development/testing environment
- Want to start fresh with clean data
- Database schema changed significantly
- Testing new features from scratch
- Corrupted data that can't be fixed

### ❌ Bad Reasons:
- Production environment (NEVER!)
- Just want to delete one user (use admin dashboard instead)
- Minor data issues (fix manually instead)

---

## 💾 Backup Before Reset (Recommended)

### Create Backup:
```bash
# Backup entire database
pg_dump -U postgres vocalspace > backup_$(date +%Y%m%d_%H%M%S).sql

# Or backup specific tables
pg_dump -U postgres -t users -t user_profiles vocalspace > users_backup.sql
```

### Restore Backup (if needed):
```bash
# Restore from backup
psql -U postgres vocalspace < backup_20260215_120000.sql
```

---

## 🔧 Quick Commands Reference

```bash
# Full reset process (Windows):
cd backend
venv\Scripts\activate
python scripts/reset_database.py
# Type "yes" when prompted

# Full reset process (Mac/Linux):
cd backend
source venv/bin/activate
python scripts/reset_database.py
# Type "yes" when prompted

# Check if it worked:
python -c "from app.db.database import SessionLocal; db = SessionLocal(); from app.db.models import User; print(f'Users: {db.query(User).count()}'); db.close()"
# Should show: Users: 1 (the admin)
```

---

## ✅ Success Checklist

After running reset_database.py, verify:

- [ ] Script completed without errors
- [ ] Default admin account created
- [ ] Can login with admin@vocalspace.com
- [ ] Database tables exist (users, user_profiles, etc.)
- [ ] Backend server starts without errors
- [ ] Frontend can connect to backend

---

**Need help?** Check the error messages above or review your `.env` configuration!
