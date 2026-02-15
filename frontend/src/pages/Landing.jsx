import { Link, useNavigate } from 'react-router-dom'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { Mic, Brain, Users, Zap, Star, ArrowRight, Shield, Award, ChevronDown, Check, Sparkles, Target, BarChart3, Linkedin, Github } from 'lucide-react'
import { useState } from 'react'
import Navbar from '../components/Navbar'
import AnimatedBackground from '../components/AnimatedBackground'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'

const Landing = () => {
  const [billingCycle, setBillingCycle] = useState('monthly')
  const [openFaq, setOpenFaq] = useState(null)
  const { isAuthenticated, user } = useAuthStore()
  const { theme } = useThemeStore()
  const navigate = useNavigate()

  // 3D Tilt Effect
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  
  const rotateX = useTransform(mouseY, [-300, 300], [15, -15])
  const rotateY = useTransform(mouseX, [-300, 300], [-15, 15])
  
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    mouseX.set(e.clientX - centerX)
    mouseY.set(e.clientY - centerY)
  }
  
  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

  const handleCTAClick = () => {
    if (isAuthenticated) {
      // Navigate to appropriate dashboard based on role
      if (user?.role === 'therapist') {
        navigate('/admin-dashboard')
      } else if (!user?.profileCompleted) {
        navigate('/complete-profile')
      } else {
        navigate('/dashboard')
      }
    } else {
      // Navigate to sign in page (not sign up)
      navigate('/auth')
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0F19] transition-colors duration-300 relative">
      {/* Animated Background - Works in both light and dark mode */}
      <AnimatedBackground isDark={theme === 'dark'} />

      {/* Content with higher z-index */}
      <div className="relative z-10">
        <Navbar variant="landing" />
      
      {/* Hero Section - Modern SaaS Style with Animated Visualization */}
      <section id="home" className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Content */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-full mb-8"
              >
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">AI-Powered Speech Therapy Platform</span>
              </motion.div>

              {/* Main Heading - Clean & Professional */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight tracking-tight">
                <span className="text-gray-900 dark:text-white">
                  Find Your Voice With 
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  VocalSpace AI 
                </span>
              </h1>

              {/* Subheading - Better Contrast */}
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-10 leading-relaxed">
                Advanced phoneme-level analysis powered by AI. Personalized therapy that evolves with your progress.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <button
                  onClick={handleCTAClick}
                  className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-full text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  {isAuthenticated ? 'Go to Dashboard' : 'Start Free Trial'}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <a 
                  href="#how-it-works" 
                  className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold rounded-full text-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-600 dark:hover:border-blue-500 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Watch Demo
                  <ChevronDown className="w-5 h-5" />
                </a>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span className="font-semibold">HIPAA Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold">95% Accuracy</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  <span className="font-semibold">10,000+ Users</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold">4.9/5 Rating</span>
                </div>
              </div>
            </motion.div>

            {/* Right Side - Animated Visualization */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative flex items-center justify-center"
              style={{ perspective: 1000 }}
            >
              {/* Main Card with Waveforms - Reduced Size with 3D Tilt */}
              <motion.div
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                  rotateX,
                  rotateY,
                  transformStyle: "preserve-3d",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 dark:from-slate-950 dark:via-blue-950 dark:to-purple-950 rounded-2xl p-6 shadow-2xl border border-blue-500/20 max-w-xl w-full hover:shadow-blue-500/20 hover:shadow-3xl transition-shadow duration-300"
              >
                {/* Header */}
                <div className="text-center mb-6">
                  <h3 className="text-lg font-bold text-white mb-1">
                    VocalSpace - Speech Therapy Analysis
                  </h3>
                  <p className="text-blue-200 text-xs">Real-time pronunciation feedback</p>
                </div>

                {/* Reference Audio Section */}
                <div className="mb-4 bg-blue-900/30 rounded-xl p-4 border border-blue-500/30">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-bold text-xs">REFERENCE AUDIO (THERAPIST)</h4>
                    <span className="text-blue-300 text-[10px]">target_sentence.wav</span>
                  </div>
                  
                  {/* Animated Waveform - Reference */}
                  <div className="bg-slate-800/50 rounded-lg p-3 mb-3 h-16 flex items-center justify-center overflow-hidden">
                    <svg className="w-full h-full" viewBox="0 0 400 60">
                      {[...Array(40)].map((_, i) => {
                        const height = Math.sin(i * 0.5) * 15 + Math.random() * 10 + 10
                        return (
                          <motion.rect
                            key={i}
                            x={i * 10}
                            y={30 - height / 2}
                            width="6"
                            height={height}
                            fill="url(#blueGradient)"
                            initial={{ scaleY: 0 }}
                            animate={{ 
                              scaleY: [0.3, 1, 0.8, 1, 0.5, 1],
                              opacity: [0.5, 1, 0.7, 1, 0.6, 1]
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              delay: i * 0.05,
                              ease: "easeInOut"
                            }}
                          />
                        )
                      })}
                      <defs>
                        <linearGradient id="blueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#60a5fa" />
                          <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>

                  {/* Word-Level Timing */}
                  <div className="grid grid-cols-3 gap-2">
                    {['she', 'sells', 'seashells'].map((word, idx) => (
                      <motion.div
                        key={word}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + idx * 0.1 }}
                        className="bg-green-500/20 border border-green-500/50 rounded-lg px-2 py-1.5 text-center"
                      >
                        <div className="text-green-300 font-bold text-xs">{word}</div>
                        <div className="text-green-400 text-[10px]">(0.{idx}s-0.{idx + 3}s)</div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* User Audio Section */}
                <div className="bg-purple-900/30 rounded-xl p-4 border border-purple-500/30">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-bold text-xs">USER AUDIO (PATIENT)</h4>
                    <span className="text-purple-300 text-[10px]">user_recording.wav</span>
                  </div>
                  
                  {/* Animated Waveform - User */}
                  <div className="bg-slate-800/50 rounded-lg p-3 mb-3 h-16 flex items-center justify-center overflow-hidden">
                    <svg className="w-full h-full" viewBox="0 0 400 60">
                      {[...Array(40)].map((_, i) => {
                        const height = Math.sin(i * 0.4) * 14 + Math.random() * 9 + 9
                        return (
                          <motion.rect
                            key={i}
                            x={i * 10}
                            y={30 - height / 2}
                            width="6"
                            height={height}
                            fill="url(#purpleGradient)"
                            initial={{ scaleY: 0 }}
                            animate={{ 
                              scaleY: [0.4, 1, 0.7, 1, 0.6, 1],
                              opacity: [0.6, 1, 0.8, 1, 0.7, 1]
                            }}
                            transition={{
                              duration: 2.2,
                              repeat: Infinity,
                              delay: i * 0.06,
                              ease: "easeInOut"
                            }}
                          />
                        )
                      })}
                      <defs>
                        <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#c084fc" />
                          <stop offset="100%" stopColor="#a855f7" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>

                  {/* Word-Level Timing with Errors */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { word: 'she', status: 'correct' },
                      { word: 'sells', status: 'warning' },
                      { word: 'seashells', status: 'correct' }
                    ].map((item, idx) => (
                      <motion.div
                        key={item.word}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 + idx * 0.1 }}
                        className={`${
                          item.status === 'correct' 
                            ? 'bg-green-500/20 border-green-500/50' 
                            : 'bg-orange-500/20 border-orange-500/50'
                        } border rounded-lg px-2 py-1.5 text-center`}
                      >
                        <div className={`${
                          item.status === 'correct' ? 'text-green-300' : 'text-orange-300'
                        } font-bold text-xs`}>
                          {item.word}
                        </div>
                        <div className={`${
                          item.status === 'correct' ? 'text-green-400' : 'text-orange-400'
                        } text-[10px]`}>
                          (0.{idx}s-0.{idx + 3}s)
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Floating Microphone Icon with Animated Waves */}
                <motion.div
                  className="absolute -right-4 -bottom-4 w-24 h-24"
                  animate={{
                    y: [0, -8, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  style={{ transformStyle: "preserve-3d", transform: "translateZ(50px)" }}
                >
                  {/* Animated Waves */}
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute inset-0 rounded-full border-2 border-blue-400"
                      initial={{ scale: 1, opacity: 0.8 }}
                      animate={{
                        scale: [1, 2, 2.5],
                        opacity: [0.8, 0.4, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.6,
                        ease: "easeOut"
                      }}
                    />
                  ))}
                  
                  {/* Microphone Icon */}
                  <motion.div
                    className="relative z-10 w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl cursor-pointer"
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Mic className="w-12 h-12 text-white" />
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* Floating Stats Cards */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="absolute -left-8 top-1/4 bg-white dark:bg-slate-800 rounded-xl p-3 shadow-xl border border-gray-200 dark:border-gray-700"
                style={{ transformStyle: "preserve-3d", transform: "translateZ(30px)" }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white">95%</div>
                    <div className="text-[10px] text-gray-600 dark:text-gray-400">Accuracy</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2, duration: 0.5 }}
                className="absolute -right-8 bottom-1/4 bg-white dark:bg-slate-800 rounded-xl p-3 shadow-xl border border-gray-200 dark:border-gray-700"
                style={{ transformStyle: "preserve-3d", transform: "translateZ(30px)" }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white">Real-time</div>
                    <div className="text-[10px] text-gray-600 dark:text-gray-400">Feedback</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section - Enhanced */}
      <section id="features" className="py-24 px-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-[#0B0F19]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Everything you need for effective speech therapy, powered by cutting-edge AI technology
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { 
                icon: Brain, 
                title: 'AI-Powered Analysis', 
                desc: 'Advanced phoneme-level feedback using wav2vec2 and forced alignment for precise pronunciation analysis', 
                gradient: 'from-blue-500 to-cyan-500',
                bgGradient: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20'
              },
              { 
                icon: Target, 
                title: 'Adaptive Learning', 
                desc: 'Personalized recommendations that evolve with your progress, focusing on your weak areas', 
                gradient: 'from-purple-500 to-pink-500',
                bgGradient: 'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20'
              },
              { 
                icon: Mic, 
                title: 'Real-time Feedback', 
                desc: 'Instant pronunciation analysis and correction suggestions as you practice', 
                gradient: 'from-green-500 to-emerald-500',
                bgGradient: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
              },
              { 
                icon: BarChart3, 
                title: 'Progress Tracking', 
                desc: 'Detailed visualizations and analytics of your improvement journey over time', 
                gradient: 'from-orange-500 to-red-500',
                bgGradient: 'from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20'
              },
              { 
                icon: Users, 
                title: 'Therapist Dashboard', 
                desc: 'Comprehensive analytics for therapists to track patient progress and outcomes', 
                gradient: 'from-indigo-500 to-blue-500',
                bgGradient: 'from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20'
              },
              { 
                icon: Zap, 
                title: 'Gamified Experience', 
                desc: 'XP points, daily streaks, and achievements to keep you motivated and engaged', 
                gradient: 'from-yellow-500 to-orange-500',
                bgGradient: 'from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20'
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="group relative"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                <div className="relative bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-200 dark:border-gray-700 hover:border-transparent hover:shadow-2xl transition-all duration-300 h-full">
                  <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="text-white" size={28} />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">Simple, effective, and personalized</p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Complete Profile', desc: 'Tell us about your speech goals and challenges' },
              { step: '2', title: 'Get Recommendations', desc: 'AI generates personalized practice sentences' },
              { step: '3', title: 'Practice & Record', desc: 'Record yourself speaking the sentences' },
              { step: '4', title: 'Improve', desc: 'Get detailed feedback and track your progress' },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-accent-pink rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              Choose the plan that's right for you. No hidden fees.
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center gap-4 p-1 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-full font-semibold transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-6 py-2 rounded-full font-semibold transition-all ${
                  billingCycle === 'annual'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Annual
                <span className="ml-2 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
                  Save 20%
                </span>
              </button>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free Plan */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-3xl p-8 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 transition-all duration-300"
            >
              <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Free</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Perfect for trying out</p>
              <div className="mb-6">
                <span className="text-5xl font-extrabold text-gray-900 dark:text-white">$0</span>
                <span className="text-gray-600 dark:text-gray-400">/month</span>
              </div>
              <button
                onClick={handleCTAClick}
                className="block w-full py-3 text-center bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-bold rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
              </button>
              <ul className="mt-8 space-y-4">
                {[
                  '5 practice sessions/month',
                  'Basic phoneme library',
                  'Progress tracking',
                  'Email support',
                  'Community access'
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Pro Plan - Popular */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="relative bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-8 transform scale-105 shadow-2xl"
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-bold">
                MOST POPULAR
              </div>
              <h3 className="text-2xl font-bold mb-2 text-white">Pro</h3>
              <p className="text-blue-100 mb-6">For serious learners</p>
              <div className="mb-6">
                <span className="text-5xl font-extrabold text-white">
                  ${billingCycle === 'monthly' ? '19' : '15'}
                </span>
                <span className="text-blue-100">/month</span>
              </div>
              <button
                onClick={handleCTAClick}
                className="block w-full py-3 text-center bg-white text-blue-600 font-bold rounded-full hover:bg-blue-50 transition-all"
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Start Free Trial'}
              </button>
              <ul className="mt-8 space-y-4">
                {[
                  'Unlimited practice sessions',
                  'Advanced AI analysis',
                  'Custom exercises',
                  'Priority support',
                  'Export reports',
                  'No ads',
                  'Mobile app access'
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                    <span className="text-white">{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Enterprise Plan */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-3xl p-8 border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 transition-all duration-300"
            >
              <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Enterprise</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">For clinics & teams</p>
              <div className="mb-6">
                <span className="text-5xl font-extrabold text-gray-900 dark:text-white">Custom</span>
              </div>
              <button
                onClick={() => {
                  if (isAuthenticated) {
                    // Scroll to contact form
                    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
                  } else {
                    // Go to sign in page
                    navigate('/auth')
                  }
                }}
                className="block w-full py-3 text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-full hover:shadow-lg transition-all"
              >
                {isAuthenticated ? 'Get in Touch' : 'Contact Sales'}
              </button>
              <ul className="mt-8 space-y-4">
                {[
                  'Everything in Pro',
                  'Multiple users',
                  'Admin dashboard',
                  'API access',
                  'Dedicated support',
                  'Custom branding',
                  'SLA guarantee',
                  'Training & onboarding'
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Money-back Guarantee */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <div className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Shield className="w-5 h-5 text-green-600" />
              <span className="font-semibold">30-day money-back guarantee • Cancel anytime</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-4 bg-white dark:bg-[#0B0F19]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
              Loved by Thousands
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              See what our users have to say about their experience
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Johnson',
                role: 'Speech Therapy Patient',
                avatar: 'SJ',
                rating: 5,
                text: 'VocalSpace has transformed my speech therapy journey. The AI feedback is incredibly accurate and helps me improve faster than traditional methods.'
              },
              {
                name: 'Dr. Michael Chen',
                role: 'Speech Therapist',
                avatar: 'MC',
                rating: 5,
                text: 'As a therapist, this platform gives me detailed insights into my patients\' progress. The phoneme-level analysis is a game-changer.'
              },
              {
                name: 'Emily Rodriguez',
                role: 'Parent',
                avatar: 'ER',
                rating: 5,
                text: 'My son loves using VocalSpace! The gamification keeps him engaged, and I can see real progress in his pronunciation.'
              }
            ].map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-gray-50 dark:bg-gray-800 p-8 rounded-3xl border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  "{testimonial.text}"
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Everything you need to know about VocalSpace
            </p>
          </motion.div>

          <div className="space-y-4">
            {[
              {
                q: 'How does VocalSpace work?',
                a: 'VocalSpace uses advanced AI technology to analyze your speech at the phoneme level. You record yourself speaking practice sentences, and our AI provides instant feedback on pronunciation, helping you improve over time.'
              },
              {
                q: 'Is VocalSpace suitable for children?',
                a: 'Yes! VocalSpace is designed for all ages. Our gamification features make it especially engaging for children, with XP points, streaks, and achievements to keep them motivated.'
              },
              {
                q: 'Can I use VocalSpace without a therapist?',
                a: 'Absolutely! VocalSpace is designed for both independent learners and those working with therapists. Our AI provides personalized recommendations and feedback automatically.'
              },
              {
                q: 'What speech disorders does VocalSpace help with?',
                a: 'VocalSpace helps with various speech challenges including stuttering, articulation disorders, accent modification, and pronunciation improvement. Our AI adapts to your specific needs.'
              },
              {
                q: 'Can I cancel my subscription anytime?',
                a: 'Yes, you can cancel your subscription at any time. We also offer a 30-day money-back guarantee if you\'re not satisfied with the service.'
              }
            ].map((faq, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <span className="font-bold text-gray-900 dark:text-white pr-4">{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0 transition-transform ${
                      openFaq === idx ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-6 pb-5"
                  >
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 px-4 bg-white dark:bg-[#0B0F19]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
              About VocalSpace
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              VocalSpace is an adaptive speech therapy platform that uses cutting-edge AI technology to provide phoneme-level pronunciation feedback. Our system analyzes your speech patterns and creates personalized practice sessions that evolve with your progress.
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
              Whether you're working on stuttering, articulation, or accent modification, VocalSpace provides the tools and insights you need to achieve your speech goals.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
              Get In Touch
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Have questions? We'd love to hear from you.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-xl"
          >
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Your Email
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Your Message
                </label>
                <textarea
                  placeholder="Tell us how we can help..."
                  rows="5"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-full hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
              >
                Send Message
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <img src="/logo.png" alt="VocalSpace" className="h-12 w-auto mb-4" />
              <p className="text-gray-400 text-sm leading-relaxed">
                AI-powered speech therapy platform helping thousands improve their communication skills.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                <li><Link to="/auth" className="hover:text-white transition-colors">Sign In</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#about" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">HIPAA Compliance</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              &copy; 2026 VocalSpace. All rights reserved.
            </p>
            <div className="flex gap-6">
              {/* LinkedIn */}
              <a 
                href="https://www.linkedin.com/in/dinesh-sonawane-827360343/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-500 transition-colors duration-300 transform hover:scale-110"
                aria-label="LinkedIn Profile"
              >
                <Linkedin className="w-6 h-6" />
              </a>
              
              {/* GitHub */}
              <a 
                href="https://github.com/sonawanewdinesh18" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-300 transform hover:scale-110"
                aria-label="GitHub Profile"
              >
                <Github className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>
      </footer>
      </div> {/* Close content div */}
    </div>
  )
}

export default Landing
