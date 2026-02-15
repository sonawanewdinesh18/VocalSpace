import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, AlertCircle, Loader2, CheckCircle, X } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../utils/api'
import { useAuthStore } from '../store/authStore'
import Navbar from '../components/Navbar'

const Auth = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin'
  const [mode, setMode] = useState(initialMode)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  // Listen for URL parameter changes
  useEffect(() => {
    const newMode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin'
    setMode(newMode)
    setErrorMsg('')
  }, [searchParams])

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    
    // Auto-capitalize first letter of each word for Full Name
    if (name === 'fullName') {
      const capitalizedValue = value
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
      setFormData({ ...formData, [name]: capitalizedValue })
    } else {
      setFormData({ ...formData, [name]: value })
    }
    
    setErrorMsg('')
  }

  // Handle successful login - navigate to appropriate dashboard
  const handleLoginSuccess = (userData, token) => {
    // Store auth data
    setAuth(userData, token)
    
    // Dispatch event for navbar sync
    window.dispatchEvent(new Event('auth-change'))
    
    // Show success message
    toast.success(`Welcome back, ${userData.fullName || userData.email}!`)
    
    // Navigate based on role and profile completion
    setTimeout(() => {
      if (userData.role === 'therapist') {
        navigate('/admin-dashboard')
      } else if (!userData.profileCompleted) {
        navigate('/complete-profile')
      } else {
        navigate('/dashboard')
      }
    }, 500)
  }

  // Handle successful registration - show modal then switch to login
  const handleRegistrationSuccess = (email) => {
    setRegisteredEmail(email)
    setShowSuccessModal(true)
    
    // Auto close modal and switch to login after 3 seconds
    setTimeout(() => {
      setShowSuccessModal(false)
      setMode('signin')
      setFormData({ ...formData, password: '' }) // Keep email, clear password
      toast.success('Please sign in with your credentials')
    }, 3000)
  }

  // Google OAuth Response Handler
  const handleGoogleResponse = async (response) => {
    console.log('Google response received:', response)
    try {
      setLoading(true)
      setErrorMsg('')
      
      console.log('Sending token to backend...')
      // Send the Google ID token to backend
      const { data } = await api.post('/auth/google', {
        token: response.credential
      })
      
      console.log('Backend response:', data)
      // Handle successful login
      handleLoginSuccess(data.user, data.token)
      
    } catch (error) {
      console.error('Google auth error:', error)
      const message = error.response?.data?.detail || 'Google authentication failed'
      setErrorMsg(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  // Initialize Google Sign-In
  useEffect(() => {
    console.log('Initializing Google Sign-In...')
    console.log('Google Client ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID)
    
    // Load Google Identity Services script
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    
    script.onload = () => {
      console.log('Google script loaded')
      // Initialize Google Sign-In
      if (window.google) {
        console.log('Initializing Google Identity Services...')
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
          auto_select: false,
          cancel_on_tap_outside: false,
          ux_mode: 'popup', // Use popup mode instead of redirect
        })
        console.log('Google Sign-In initialized successfully')
      } else {
        console.error('window.google not available')
      }
    }
    
    script.onerror = () => {
      console.error('Failed to load Google Identity Services script')
      toast.error('Failed to load Google Sign-In')
    }
    
    document.body.appendChild(script)

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  // Email/Password Authentication
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    try {
      if (mode === 'signup') {
        // Registration
        const { data } = await api.post('/auth/register', {
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName
        })
        
        // Show success modal and switch to login
        handleRegistrationSuccess(formData.email)
        
      } else {
        // Login
        const { data } = await api.post('/auth/login', {
          email: formData.email,
          password: formData.password
        })
        
        // Handle successful login
        handleLoginSuccess(data.user, data.token)
      }
    } catch (error) {
      const message = error.response?.data?.detail || 
                     (mode === 'signup' ? 'Registration failed' : 'Login failed')
      setErrorMsg(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  // Google OAuth Authentication - Trigger full popup using native button
  const handleGoogleAuth = () => {
    console.log('Google button clicked')
    
    try {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        console.log('Rendering Google Sign-In button to trigger popup...')
        
        // Create a temporary hidden container for the Google button
        const tempContainer = document.createElement('div')
        tempContainer.id = 'google-signin-temp'
        tempContainer.style.position = 'fixed'
        tempContainer.style.top = '-9999px' // Hide off-screen
        tempContainer.style.left = '-9999px'
        tempContainer.style.opacity = '0'
        document.body.appendChild(tempContainer)
        
        // Render the official Google Sign-In button
        window.google.accounts.id.renderButton(
          tempContainer,
          {
            theme: 'filled_blue',
            size: 'large',
            type: 'standard',
            text: 'signin_with',
            shape: 'rectangular',
            width: 300,
          }
        )
        
        // Auto-click the button to trigger the popup
        setTimeout(() => {
          const googleBtn = tempContainer.querySelector('div[role="button"]')
          if (googleBtn) {
            console.log('Triggering Google account chooser popup...')
            googleBtn.click()
            
            // Clean up the temporary container after a delay
            setTimeout(() => {
              if (document.body.contains(tempContainer)) {
                document.body.removeChild(tempContainer)
              }
            }, 2000)
          } else {
            console.error('Google button not found in container')
            toast.error('Failed to initialize Google Sign-In')
            // Clean up
            if (document.body.contains(tempContainer)) {
              document.body.removeChild(tempContainer)
            }
          }
        }, 200)
        
      } else {
        console.error('Google Sign-In not initialized')
        toast.error('Google Sign-In not available. Please refresh the page.')
      }
    } catch (error) {
      console.error('Google auth error:', error)
      toast.error('Google Sign-In not available')
    }
  }

  // Success Modal Component
  const SuccessModal = () => (
    <AnimatePresence>
      {showSuccessModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowSuccessModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-[#131722] rounded-3xl p-8 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              {/* Success Icon */}
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              
              {/* Title */}
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Registration Successful! 🎉
              </h3>
              
              {/* Message */}
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Your account has been created successfully.
                <br />
                <span className="font-semibold text-slate-900 dark:text-white">
                  {registeredEmail}
                </span>
              </p>
              
              {/* Info */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  Redirecting to login page in 3 seconds...
                </p>
              </div>
              
              {/* Button */}
              <button
                onClick={() => {
                  setShowSuccessModal(false)
                  setMode('signin')
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-full font-bold hover:shadow-lg transition-all duration-300"
              >
                Sign In Now
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] transition-colors duration-300 relative overflow-hidden">
        {/* Background Ambient Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none opacity-50"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none opacity-50"></div>

        <div className="flex items-center justify-center min-h-screen px-4 py-24 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md"
          >
            <div className="bg-white/80 dark:bg-[#131722]/80 backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-white/5 ring-1 ring-black/5">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="flex justify-center mb-6">
                  <img 
                    src="/logo.png" 
                    alt="VocalSpace" 
                    className="h-24 w-auto object-contain drop-shadow-xl" 
                  />
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
                  {mode === 'signin' 
                    ? 'Please enter your details to sign in.' 
                    : 'Start your speech therapy journey today.'}
                </p>
              </div>

              {/* Google Button */}
              <div className="mb-8">
                <button
                  onClick={handleGoogleAuth}
                  type="button"
                  className="w-full bg-[#1A73E8] hover:bg-[#1557b0] text-white font-bold py-3 rounded-full flex items-center justify-center gap-4 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  <div className="bg-white p-1.5 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  </div>
                  <span className="text-sm md:text-base">
                    {mode === 'signin' ? 'Sign in with Google' : 'Sign up with Google'}
                  </span>
                </button>
              </div>

              {/* Divider */}
              <div className="relative mb-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white dark:bg-[#131722] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">
                    OR
                  </span>
                </div>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 flex items-center gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-600 dark:text-red-300 text-sm font-medium">{errorMsg}</p>
                </motion.div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {mode === 'signup' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">
                      Full Name
                    </label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                        <User size={20} />
                      </div>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all duration-300"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                      <Mail size={20} />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all duration-300"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">
                    Password
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                      <Lock size={20} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-12 pr-12 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all duration-300"
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {mode === 'signup' && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 ml-1">
                      Must be at least 6 characters
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-100 py-3.5 rounded-full font-bold text-lg shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={24} />
                  ) : (
                    <>
                      <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              {/* Footer */}
              <div className="mt-8 text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
                  {' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode(mode === 'signin' ? 'signup' : 'signin')
                      setErrorMsg('')
                      setFormData({ email: '', password: '', fullName: '' })
                    }}
                    className="text-blue-500 dark:text-blue-400 font-bold hover:underline transition-all"
                  >
                    {mode === 'signin' ? 'Create Account' : 'Sign In'}
                  </button>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal />
    </>
  )
}

export default Auth
