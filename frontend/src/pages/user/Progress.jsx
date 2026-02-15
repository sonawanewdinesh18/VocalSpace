import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Navbar from '../../components/Navbar'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const Progress = () => {
  const [progressData, setProgressData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProgress()
  }, [])

  const fetchProgress = async () => {
    try {
      const { data } = await api.get('/user/progress')
      setProgressData(data)
    } catch (error) {
      toast.error('Failed to load progress data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar variant="user" />
        <div className="pt-24 px-4 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  const accuracyData = progressData?.accuracyTrend || []
  const phonemeData = progressData?.phonemeErrors || []

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar variant="user" />
      
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold mb-2">Your Progress</h1>
            <p className="text-gray-600 dark:text-gray-400">Track your improvement over time</p>
          </motion.div>

          {/* Accuracy Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card mb-8"
          >
            <h2 className="text-2xl font-bold mb-6">Accuracy Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={accuracyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="accuracy" stroke="#9333ea" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Phoneme Errors */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card mb-8"
          >
            <h2 className="text-2xl font-bold mb-6">Phoneme Error Frequency</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={phonemeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="phoneme" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="errors" fill="#ec4899" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Session History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card"
          >
            <h2 className="text-2xl font-bold mb-6">Recent Sessions</h2>
            <div className="space-y-4">
              {progressData?.recentSessions?.map((session, idx) => (
                <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{session.date}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{session.sentencesCompleted} sentences</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary-600">{session.accuracy}%</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Accuracy</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Progress
