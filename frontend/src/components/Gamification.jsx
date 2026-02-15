import { motion } from 'framer-motion'
import { Trophy, Star, Zap, Award, Target, TrendingUp, Crown, Medal } from 'lucide-react'

const Gamification = ({ stats }) => {
  // Calculate level based on XP
  const calculateLevel = (xp) => {
    return Math.floor(xp / 100) + 1
  }

  // Calculate XP progress to next level
  const calculateLevelProgress = (xp) => {
    const currentLevelXP = xp % 100
    return currentLevelXP
  }

  // Get level title
  const getLevelTitle = (level) => {
    if (level >= 50) return { title: 'Speech Master', icon: <Crown />, color: 'text-yellow-500' }
    if (level >= 30) return { title: 'Expert Speaker', icon: <Trophy />, color: 'text-purple-500' }
    if (level >= 20) return { title: 'Advanced Learner', icon: <Medal />, color: 'text-blue-500' }
    if (level >= 10) return { title: 'Intermediate', icon: <Star />, color: 'text-green-500' }
    if (level >= 5) return { title: 'Beginner', icon: <Zap />, color: 'text-orange-500' }
    return { title: 'Novice', icon: <Target />, color: 'text-slate-500' }
  }

  // Define achievements
  const achievements = [
    {
      id: 'first_session',
      title: 'First Steps',
      description: 'Complete your first practice session',
      icon: <Star size={24} />,
      unlocked: stats.totalSessions >= 1,
      color: 'bg-blue-500'
    },
    {
      id: 'streak_3',
      title: '3-Day Streak',
      description: 'Practice for 3 days in a row',
      icon: <Zap size={24} />,
      unlocked: stats.streak >= 3,
      color: 'bg-orange-500'
    },
    {
      id: 'streak_7',
      title: 'Week Warrior',
      description: 'Practice for 7 days in a row',
      icon: <Trophy size={24} />,
      unlocked: stats.streak >= 7,
      color: 'bg-purple-500'
    },
    {
      id: 'perfect_score',
      title: 'Perfect Pronunciation',
      description: 'Score 95% or higher',
      icon: <Award size={24} />,
      unlocked: stats.accuracy >= 95,
      color: 'bg-green-500'
    },
    {
      id: 'sessions_10',
      title: 'Dedicated Learner',
      description: 'Complete 10 practice sessions',
      icon: <Target size={24} />,
      unlocked: stats.totalSessions >= 10,
      color: 'bg-blue-500'
    },
    {
      id: 'sessions_50',
      title: 'Practice Makes Perfect',
      description: 'Complete 50 practice sessions',
      icon: <TrendingUp size={24} />,
      unlocked: stats.totalSessions >= 50,
      color: 'bg-purple-500'
    },
    {
      id: 'xp_500',
      title: 'XP Hunter',
      description: 'Earn 500 XP points',
      icon: <Zap size={24} />,
      unlocked: stats.xp >= 500,
      color: 'bg-yellow-500'
    },
    {
      id: 'xp_1000',
      title: 'XP Master',
      description: 'Earn 1000 XP points',
      icon: <Crown size={24} />,
      unlocked: stats.xp >= 1000,
      color: 'bg-yellow-500'
    }
  ]

  const level = calculateLevel(stats.xp)
  const levelProgress = calculateLevelProgress(stats.xp)
  const levelInfo = getLevelTitle(level)
  const unlockedCount = achievements.filter(a => a.unlocked).length

  return (
    <div className="space-y-6">
      {/* Level Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl p-8 text-white shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-sm opacity-90 mb-1">Your Level</div>
            <div className="text-5xl font-bold">{level}</div>
          </div>
          <div className={`text-6xl ${levelInfo.color}`}>
            {levelInfo.icon}
          </div>
        </div>

        <div className="mb-4">
          <div className="text-xl font-bold mb-2">{levelInfo.title}</div>
          <div className="text-sm opacity-90">
            {100 - levelProgress} XP to next level
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative h-4 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-white rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${levelProgress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </motion.div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Trophy className="text-yellow-500" size={28} />
            Achievements
          </h3>
          <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            {unlockedCount} / {achievements.length}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((achievement, idx) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`relative rounded-xl p-4 border-2 transition-all ${
                achievement.unlocked
                  ? 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-300 dark:border-yellow-700'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-50'
              }`}
            >
              {achievement.unlocked && (
                <div className="absolute top-2 right-2">
                  <div className="bg-green-500 text-white rounded-full p-1">
                    <Award size={16} />
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <div className={`${achievement.color} text-white p-3 rounded-xl ${!achievement.unlocked && 'grayscale'}`}>
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">
                    {achievement.title}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {achievement.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <StatCard
          icon={<Zap className="text-orange-500" size={24} />}
          label="Total XP"
          value={stats.xp}
          color="bg-orange-50 dark:bg-orange-900/20"
        />
        <StatCard
          icon={<Target className="text-blue-500" size={24} />}
          label="Sessions"
          value={stats.totalSessions}
          color="bg-blue-50 dark:bg-blue-900/20"
        />
        <StatCard
          icon={<TrendingUp className="text-green-500" size={24} />}
          label="Avg Score"
          value={`${stats.accuracy}%`}
          color="bg-green-50 dark:bg-green-900/20"
        />
        <StatCard
          icon={<Trophy className="text-purple-500" size={24} />}
          label="Achievements"
          value={`${unlockedCount}/${achievements.length}`}
          color="bg-purple-50 dark:bg-purple-900/20"
        />
      </motion.div>

      {/* Motivational Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl p-6 border-2 border-green-200 dark:border-green-800"
      >
        <div className="flex items-start gap-3">
          <div className="text-3xl">🎯</div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-2">
              Keep Going!
            </h4>
            <p className="text-slate-700 dark:text-slate-300">
              {stats.streak >= 7 ? (
                `Amazing! You've practiced for ${stats.streak} days straight. You're on fire! 🔥`
              ) : stats.streak >= 3 ? (
                `Great job! ${7 - stats.streak} more days to unlock the Week Warrior achievement!`
              ) : stats.totalSessions >= 10 ? (
                `You're making excellent progress! Keep practicing daily to build your streak.`
              ) : (
                `Complete ${10 - stats.totalSessions} more sessions to unlock the Dedicated Learner achievement!`
              )}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

const StatCard = ({ icon, label, value, color }) => (
  <div className={`${color} rounded-2xl p-4`}>
    <div className="mb-2">{icon}</div>
    <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">{label}</div>
    <div className="text-2xl font-bold text-slate-900 dark:text-white">{value}</div>
  </div>
)

export default Gamification
