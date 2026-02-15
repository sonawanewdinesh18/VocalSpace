# Database Schema Updates

## Summary
Updated database schema to add missing fields and performance indexes.

## Changes Made

### 1. PracticeSession Table
**Added Fields:**
- `mastered` (Boolean, default=False) - Tracks if user scored >= 85% on this sentence
  - Used by AI recommendation system to skip mastered sentences
  - Referenced in `backend/app/api/routes/ai.py`

**Added Indexes:**
- `user_id` - Improves query performance when fetching user sessions
- `created_at` - Speeds up date-based queries and sorting

### 2. UserStats Table
**Added Fields:**
- `level` (Integer, default=1) - Gamification level (1-100)
  - Calculated based on XP points
  - Can be used for unlocking features and achievements

**Added Indexes:**
- `user_id` - Already unique, now also indexed for faster lookups

### 3. Recommendation Table
**Added Indexes:**
- `user_id` - Improves query performance when fetching user recommendations
- `is_active` - Speeds up filtering for active recommendations

## All Tables Analysis

### ✅ Users Table
- **Status**: In use
- **Used by**: auth.py, user.py, admin.py
- **Purpose**: User authentication and basic info
- **Keep**: Yes

### ✅ UserProfile Table
- **Status**: In use
- **Used by**: user.py, ai.py
- **Purpose**: Detailed user profile data (age, gender, speech disorder, etc.)
- **Keep**: Yes

### ✅ UserStats Table
- **Status**: In use
- **Used by**: user.py, ai.py, admin.py
- **Purpose**: Gamification stats (XP, streak, accuracy, level)
- **Keep**: Yes

### ✅ Recommendations Table
- **Status**: In use
- **Used by**: user.py, ai.py
- **Purpose**: AI-generated practice sentences
- **Keep**: Yes

### ✅ PracticeSession Table
- **Status**: In use
- **Used by**: ai.py, user.py, admin.py
- **Purpose**: Session recordings and analysis results
- **Keep**: Yes

## Result
- **Total Tables**: 5
- **Tables Removed**: 0 (all tables are actively used)
- **Fields Added**: 2 (mastered, level)
- **Indexes Added**: 5 (performance optimization)

## Next Steps

### Option 1: Reset Database (Recommended)
Run the reset script to apply changes:
```bash
cd backend
python scripts/reset_database.py
```

### Option 2: Manual Migration
If you want to keep existing data, run these SQL commands:
```sql
-- Add mastered column to practice_sessions
ALTER TABLE practice_sessions ADD COLUMN mastered BOOLEAN DEFAULT FALSE;

-- Add level column to user_stats
ALTER TABLE user_stats ADD COLUMN level INTEGER DEFAULT 1;

-- Add indexes
CREATE INDEX idx_practice_sessions_user_id ON practice_sessions(user_id);
CREATE INDEX idx_practice_sessions_created_at ON practice_sessions(created_at);
CREATE INDEX idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX idx_recommendations_user_id ON recommendations(user_id);
CREATE INDEX idx_recommendations_is_active ON recommendations(is_active);
```

## Performance Benefits
- Faster user session queries (indexed user_id)
- Faster date-based filtering (indexed created_at)
- Faster active recommendation lookups (indexed is_active)
- Better query planning for complex joins

## Future Considerations
Consider adding these tables in the future:
1. **Achievements Table** - For gamification badges and milestones
2. **UserGoals Table** - For tracking therapy goals and progress
3. **FeedbackHistory Table** - For storing AI feedback history
4. **AudioCache Table** - For managing generated audio files
