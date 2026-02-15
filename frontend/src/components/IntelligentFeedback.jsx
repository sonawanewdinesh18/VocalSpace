import { motion } from 'framer-motion'
import { 
  Target, AlertCircle, BookOpen, Lightbulb, TrendingUp, 
  CheckCircle, XCircle, Clock, Award, Zap
} from 'lucide-react'

const IntelligentFeedback = ({ feedback }) => {
  if (!feedback || Object.keys(feedback).length === 0) {
    return null
  }

  const { 
    overall_assessment, 
    detailed_mistakes, 
    practice_exercises, 
    improvement_tips,
    next_steps,
    progress_insights 
  } = feedback

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
      case 'medium': return 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20'
      default: return 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20'
    }
  }

  const getPriorityBadge = (priority) => {
    const colors = {
      high: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
      medium: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
      low: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
    }
    return colors[priority] || colors.medium
  }

  return (
    <div className="space-y-6">
      {/* Overall Assessment */}
      {overall_assessment && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl p-6 border-2 ${
            overall_assessment.color === 'green' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' :
            overall_assessment.color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' :
            overall_assessment.color === 'yellow' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' :
            overall_assessment.color === 'orange' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800' :
            'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="text-4xl">{overall_assessment.emoji}</div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                {overall_assessment.level}
              </h3>
              <p className="text-lg text-slate-700 dark:text-slate-300">
                {overall_assessment.message}
              </p>
            </div>
            <div className="text-4xl font-bold text-slate-900 dark:text-white">
              {overall_assessment.score}%
            </div>
          </div>
        </motion.div>
      )}

      {/* Detailed Mistakes */}
      {detailed_mistakes && detailed_mistakes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-900 rounded-2xl p-6 border-2 border-slate-200 dark:border-slate-700"
        >
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <AlertCircle size={24} className="text-red-600" />
            Areas to Improve
          </h3>
          <div className="space-y-3">
            {detailed_mistakes.map((mistake, idx) => (
              <div
                key={idx}
                className={`rounded-xl p-4 border-2 ${getSeverityColor(mistake.severity)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <XCircle size={20} className="text-red-600 flex-shrink-0" />
                    <h4 className="font-bold text-slate-900 dark:text-white">
                      {mistake.issue}
                    </h4>
                  </div>
                  {mistake.accuracy && (
                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                      {mistake.accuracy}%
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 ml-7">
                  {mistake.explanation}
                </p>
                <div className="ml-7 mt-3 p-3 bg-white dark:bg-slate-800 rounded-lg">
                  <p className="text-sm font-semibold text-green-700 dark:text-green-400 flex items-center gap-2">
                    <CheckCircle size={16} />
                    How to fix: {mistake.fix}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Practice Exercises */}
      {practice_exercises && practice_exercises.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-900 rounded-2xl p-6 border-2 border-slate-200 dark:border-slate-700"
        >
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <BookOpen size={24} className="text-blue-600" />
            Practice Exercises
          </h3>
          <div className="space-y-4">
            {practice_exercises.map((exercise, idx) => (
              <div
                key={idx}
                className="border-2 border-slate-200 dark:border-slate-700 rounded-xl p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-bold text-lg text-slate-900 dark:text-white">
                    {exercise.title}
                  </h4>
                  <span className="text-sm px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full flex items-center gap-1">
                    <Clock size={14} />
                    {exercise.duration}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Exercises:
                    </p>
                    <ul className="space-y-2">
                      {exercise.exercises.map((ex, exIdx) => (
                        <li
                          key={exIdx}
                          className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2"
                        >
                          <span className="text-blue-600 font-bold">•</span>
                          {ex}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Tips:
                    </p>
                    <ul className="space-y-2">
                      {exercise.tips.map((tip, tipIdx) => (
                        <li
                          key={tipIdx}
                          className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2"
                        >
                          <Lightbulb size={14} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Improvement Tips */}
      {improvement_tips && improvement_tips.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-slate-900 rounded-2xl p-6 border-2 border-slate-200 dark:border-slate-700"
        >
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Lightbulb size={24} className="text-yellow-600" />
            Improvement Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {improvement_tips.map((tip, idx) => (
              <div
                key={idx}
                className="border-2 border-slate-200 dark:border-slate-700 rounded-xl p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-bold text-slate-900 dark:text-white">
                    {tip.tip}
                  </h4>
                  <span className={`text-xs px-2 py-1 rounded-full ${getPriorityBadge(tip.priority)}`}>
                    {tip.priority}
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                  {tip.explanation}
                </p>
                <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                    Action: {tip.action}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Progress Insights */}
      {progress_insights && Object.keys(progress_insights).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl p-6 border-2 border-purple-200 dark:border-purple-800"
        >
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp size={24} className="text-purple-600" />
            Your Progress
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-white dark:bg-slate-800 rounded-xl">
              <div className="text-2xl font-bold text-purple-600">
                {progress_insights.average_phoneme_score}%
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                Avg Score
              </div>
            </div>
            <div className="text-center p-3 bg-white dark:bg-slate-800 rounded-xl">
              <div className="text-2xl font-bold text-blue-600">
                {progress_insights.consistency_score}%
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                Consistency
              </div>
            </div>
            <div className="text-center p-3 bg-white dark:bg-slate-800 rounded-xl">
              <div className="text-2xl font-bold text-green-600">
                {progress_insights.strongest_sounds?.length || 0}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                Strong Sounds
              </div>
            </div>
            <div className="text-center p-3 bg-white dark:bg-slate-800 rounded-xl">
              <div className="text-2xl font-bold text-orange-600">
                {progress_insights.improvement_areas?.length || 0}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                To Improve
              </div>
            </div>
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300 italic">
            {progress_insights.insight}
          </p>
        </motion.div>
      )}

      {/* Next Steps */}
      {next_steps && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border-2 border-green-200 dark:border-green-800"
        >
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Target size={24} className="text-green-600" />
            Your Next Steps
          </h3>
          <p className="text-lg text-slate-700 dark:text-slate-300 mb-4">
            {next_steps.focus}
          </p>
          <div className="space-y-3 mb-4">
            <h4 className="font-semibold text-slate-900 dark:text-white">Goals:</h4>
            {next_steps.goals?.map((goal, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 text-slate-700 dark:text-slate-300"
              >
                <Zap size={16} className="text-green-600 flex-shrink-0 mt-1" />
                <span>{goal}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <Clock size={16} className="text-blue-600" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Practice Time
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {next_steps.recommended_practice_time}
              </p>
            </div>
            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <Award size={16} className="text-purple-600" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Expected Progress
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {next_steps.estimated_improvement_time}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default IntelligentFeedback
