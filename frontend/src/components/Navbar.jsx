import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'
import { Home, DollarSign, FileText, Sparkles, Settings, Mic, TrendingUp, BookOpen } from 'lucide-react'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated, logout } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Check if we're on a dashboard page (user or admin)
  const isDashboardPage = 
    location.pathname === '/dashboard' || 
    location.pathname.startsWith('/user/') || 
    location.pathname.startsWith('/admin')

  const handleLogout = () => {
    logout()
    setIsMobileMenuOpen(false)
    navigate('/')
  }

  const handleDashboardClick = () => {
    if (user?.role === 'therapist') {
      navigate('/admin-dashboard')
    } else {
      navigate('/dashboard')
    }
  }

  const homeNavLinks = ['Features', 'How it Works', 'About Us', 'Pricing', 'Contact']

  return (
    <nav className="fixed w-full z-50 top-0 left-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-all duration-300">
      <div className="w-full px-6 md:px-10 h-20 flex justify-between items-center">
        {/* LEFT: Logo */}
        <Link to="/" className="flex items-center shrink-0">
          <img 
            src="/logo.png" 
            alt="VocalSpace" 
            className="h-12 w-auto object-contain hover:opacity-90 transition-opacity" 
          />
        </Link>

        {/* CENTER: Dynamic Navigation Links */}
        <div className="hidden md:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
          {!isDashboardPage ? (
            <>
              <Link
                to="/"
                className="text-gray-600 dark:text-gray-300 font-medium hover:text-blue-600 dark:hover:text-blue-400 transition flex items-center gap-2"
              >
                <Home size={18} />
                Home
              </Link>
              {homeNavLinks.map((item) => {
                const icons = {
                  'Features': <Sparkles size={18} />,
                  'How it Works': <Settings size={18} />,
                  'About Us': <FileText size={18} />,
                  'Pricing': <DollarSign size={18} />,
                  'Contact': <FileText size={18} />
                }
                return (
                  <a
                    key={item}
                    href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                    className="text-gray-600 dark:text-gray-300 font-medium hover:text-blue-600 dark:hover:text-blue-400 transition flex items-center gap-2"
                  >
                    {icons[item]}
                    {item}
                  </a>
                )
              })}
            </>
          ) : (
            <>
              <NavLink to="/" icon={<Home size={18} />}>Home</NavLink>
              <NavLink to="/dashboard" icon={<Home size={18} />}>Dashboard</NavLink>
              <NavLink to="/user/practice" icon={<Mic size={18} />}>Practice</NavLink>
              <NavLink to="/user/progress" icon={<TrendingUp size={18} />}>Progress</NavLink>
              <NavLink to="/user/phonemes" icon={<BookOpen size={18} />}>Phoneme Library</NavLink>
            </>
          )}
        </div>

        {/* RIGHT: Auth & Theme Toggle */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {/* User Avatar Circle */}
                <Link
                  to="/complete-profile"
                  className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold shadow-md hover:scale-110 transition border border-white dark:border-gray-700"
                  title="Profile Settings"
                >
                  {user?.fullName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                </Link>

                {!isDashboardPage && (
                  <button
                    onClick={handleDashboardClick}
                    className="px-4 py-2 bg-blue-50 dark:bg-gray-800 text-blue-700 dark:text-blue-400 rounded-full font-semibold border border-blue-200 dark:border-gray-700 hover:bg-blue-100 dark:hover:bg-gray-700 transition"
                  >
                    Dashboard
                  </button>
                )}

                <button
                  onClick={handleLogout}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full shadow-md transition-transform hover:scale-105 text-sm"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/auth"
                  className="text-gray-700 dark:text-white font-semibold hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth?mode=signup"
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-full shadow-lg hover:scale-105 transition transform"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          <button
            onClick={toggleTheme}
            className="p-2 ml-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-yellow-400 hover:scale-110 transition border border-gray-200 dark:border-gray-700"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-2xl text-gray-700 dark:text-white ml-2"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-6 flex flex-col space-y-4 shadow-xl">
          {!isDashboardPage ? (
            <>
              <Link 
                to="/" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="text-gray-700 dark:text-gray-300 font-medium hover:text-blue-600 dark:hover:text-blue-400 transition"
              >
                Home
              </Link>
              {homeNavLinks.map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-gray-700 dark:text-gray-300 font-medium hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  {item}
                </a>
              ))}
            </>
          ) : (
            <>
              <Link 
                to="/" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="text-gray-700 dark:text-gray-300 font-medium hover:text-blue-600 dark:hover:text-blue-400 transition"
              >
                Home
              </Link>
              <Link 
                to="/dashboard" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="text-gray-700 dark:text-gray-300 font-medium hover:text-blue-600 dark:hover:text-blue-400 transition"
              >
                Dashboard
              </Link>
              <Link 
                to="/user/practice" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="text-gray-700 dark:text-gray-300 font-medium hover:text-blue-600 dark:hover:text-blue-400 transition"
              >
                Practice
              </Link>
              <Link 
                to="/user/progress" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="text-gray-700 dark:text-gray-300 font-medium hover:text-blue-600 dark:hover:text-blue-400 transition"
              >
                Progress
              </Link>
              <Link 
                to="/user/phonemes" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="text-gray-700 dark:text-gray-300 font-medium hover:text-blue-600 dark:hover:text-blue-400 transition"
              >
                Phoneme Library
              </Link>
            </>
          )}

          {isAuthenticated ? (
            <>
              {!isDashboardPage && (
                <button
                  onClick={() => {
                    handleDashboardClick()
                    setIsMobileMenuOpen(false)
                  }}
                  className="text-left text-blue-600 dark:text-blue-400 font-bold hover:text-blue-700 dark:hover:text-blue-300 transition"
                >
                  Go to Dashboard
                </button>
              )}
              <Link
                to="/complete-profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-700 dark:text-gray-300 font-medium hover:text-blue-600 dark:hover:text-blue-400 transition"
              >
                Profile Settings
              </Link>
              <button 
                onClick={handleLogout} 
                className="text-left text-red-600 dark:text-red-400 font-bold hover:text-red-700 dark:hover:text-red-300 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/auth" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="text-gray-700 dark:text-gray-300 font-medium hover:text-blue-600 dark:hover:text-blue-400 transition"
              >
                Sign In
              </Link>
              <Link 
                to="/auth?mode=signup" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="text-gray-700 dark:text-gray-300 font-medium hover:text-blue-600 dark:hover:text-blue-400 transition"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}

// NavLink component for active state styling with icon
function NavLink({ to, children, icon }) {
  const location = useLocation()
  const isActive =
    (to === '/' && location.pathname === '/') ||
    (to !== '/' && location.pathname === to) ||
    (to === '/dashboard' && location.pathname === '/dashboard')

  return (
    <Link
      to={to}
      className="relative group"
    >
      <div className={`flex items-center gap-2 text-sm font-medium transition-colors duration-200 ${
        isActive
          ? 'text-blue-600 dark:text-blue-400 font-bold'
          : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
      }`}>
        {icon}
        {children}
      </div>
      
      {/* Rounded circle indicator below active link */}
      {isActive && (
        <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
          <div className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
        </div>
      )}
    </Link>
  )
}
