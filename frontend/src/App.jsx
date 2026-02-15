import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'
import { useThemeStore } from './store/themeStore'

// Pages
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import CompleteProfile from './pages/CompleteProfile'
import UserDashboard from './pages/user/Dashboard'
import Practice from './pages/user/Practice'
import Progress from './pages/user/Progress'
import PhonemeLibrary from './pages/user/PhonemeLibrary'
import AdminDashboard from './pages/admin/Dashboard'

// Protected Route Component
const ProtectedRoute = ({ children, requireRole }) => {
  const { user, isAuthenticated } = useAuthStore()
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />
  }
  
  // Check role requirement
  if (requireRole && user?.role !== requireRole) {
    return <Navigate to={user?.role === 'therapist' ? '/admin-dashboard' : '/dashboard'} replace />
  }
  
  // Check profile completion (but allow access to complete-profile page)
  const currentPath = window.location.pathname
  if (user && !user.profileCompleted && currentPath !== '/complete-profile') {
    return <Navigate to="/complete-profile" replace />
  }
  
  return children
}

function App() {
  const { theme } = useThemeStore()
  
  return (
    <div className={theme}>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route 
            path="/complete-profile" 
            element={
              <ProtectedRoute>
                <CompleteProfile />
              </ProtectedRoute>
            } 
          />
          
          {/* User Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute requireRole="user">
                <UserDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/user/practice" 
            element={
              <ProtectedRoute requireRole="user">
                <Practice />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/user/progress" 
            element={
              <ProtectedRoute requireRole="user">
                <Progress />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/user/phonemes" 
            element={
              <ProtectedRoute requireRole="user">
                <PhonemeLibrary />
              </ProtectedRoute>
            } 
          />
          
          {/* Admin Routes */}
          <Route 
            path="/admin-dashboard" 
            element={
              <ProtectedRoute requireRole="therapist">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      <Toaster position="top-right" />
    </div>
  )
}

export default App
