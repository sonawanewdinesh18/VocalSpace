import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, TrendingUp, Activity, Award } from 'lucide-react'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { useAuthStore } from '../../store/authStore'
import { useNavigate } from 'react-router-dom'

const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const { logout } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    try {
      const [statsRes, patientsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/patients')
      ])
      setStats(statsRes.data)
      setPatients(patientsRes.data.patients || [])
    } catch (error) {
      toast.error('Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Admin Navbar */}
      <nav className="fixed top-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg z-50 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <img src="/logo.png" alt="VocalSpace" className="h-10 w-10" />
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-pink bg-clip-text text-transparent">
                VocalSpace Admin
              </span>
            </div>
            <button onClick={handleLogout} className="btn-secondary">Logout</button>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold mb-2">Therapist Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">Monitor patient progress and analytics</p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {[
              { icon: Users, label: 'Total Patients', value: stats?.totalPatients || 0, color: 'text-primary-600', bg: 'bg-primary-100 dark:bg-primary-900/20' },
              { icon: Activity, label: 'Active Today', value: stats?.activeToday || 0, color: 'text-accent-blue', bg: 'bg-accent-blue/10' },
              { icon: TrendingUp, label: 'Avg Improvement', value: `${stats?.avgImprovement || 0}%`, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/20' },
              { icon: Award, label: 'Total Sessions', value: stats?.totalSessions || 0, color: 'text-accent-pink', bg: 'bg-accent-pink/10' },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="card hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`${stat.bg} p-3 rounded-lg`}>
                    <stat.icon className={stat.color} size={32} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Patients List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card"
          >
            <h2 className="text-2xl font-bold mb-6">Patient Overview</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4">Name</th>
                    <th className="text-left py-3 px-4">Disorder</th>
                    <th className="text-left py-3 px-4">Sessions</th>
                    <th className="text-left py-3 px-4">Accuracy</th>
                    <th className="text-left py-3 px-4">Last Active</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((patient, idx) => (
                    <tr key={idx} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-3 px-4 font-medium">{patient.name}</td>
                      <td className="py-3 px-4">{patient.disorder}</td>
                      <td className="py-3 px-4">{patient.sessions}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-sm ${
                          patient.accuracy >= 80 ? 'bg-green-100 text-green-800' :
                          patient.accuracy >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {patient.accuracy}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{patient.lastActive}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
