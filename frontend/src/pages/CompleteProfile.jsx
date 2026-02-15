import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Calendar, Phone, Upload, ArrowRight, Loader2, ChevronDown, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../utils/api'
import { useAuthStore } from '../store/authStore'
import Navbar from '../components/Navbar'

const CompleteProfile = () => {
  const navigate = useNavigate()
  const { user, updateUser } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [fetchingProfile, setFetchingProfile] = useState(true)
  const [profilePic, setProfilePic] = useState(null)
  const [profilePicPreview, setProfilePicPreview] = useState(null)

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    age: '',
    phoneNumber: '',
    gender: '',
    nativeLanguage: '',
    speechDisorder: '',
    severityLevel: '',
    therapyGoals: '',
    interests: '',
    troubleSpots: ''
  })

  // Fetch existing profile data on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setFetchingProfile(true)
        const { data } = await api.get('/user/profile')
        
        // Update form with existing data
        setFormData({
          fullName: data.fullName || user?.fullName || '',
          age: data.age || '',
          phoneNumber: data.phoneNumber || '',
          gender: data.gender || '',
          nativeLanguage: data.nativeLanguage || '',
          speechDisorder: data.speechDisorder || '',
          severityLevel: data.severityLevel || '',
          therapyGoals: data.therapyGoals || '',
          interests: data.interests || '',
          troubleSpots: data.troubleSpots || ''
        })

        // Set profile image preview if exists
        if (data.profileImage) {
          setProfilePicPreview(data.profileImage)
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
        // If profile doesn't exist, that's okay - user is creating new one
      } finally {
        setFetchingProfile(false)
      }
    }

    fetchProfile()
  }, [user])

  // Dropdown options
  const genderOptions = ['Male', 'Female', 'Non-binary', 'Prefer not to say', 'Other']
  
  const languageOptions = [
    'English', 'Spanish', 'Mandarin Chinese', 'Hindi', 'Arabic', 
    'Portuguese', 'Bengali', 'Russian', 'Japanese', 'Punjabi',
    'German', 'French', 'Italian', 'Korean', 'Vietnamese',
    'Turkish', 'Tamil', 'Urdu', 'Cantonese', 'Other'
  ]

  const speechDisorderOptions = [
    'Stuttering / Stammering',
    'Articulation Disorder',
    'Phonological Disorder',
    'Apraxia of Speech',
    'Dysarthria',
    'Voice Disorder',
    'Fluency Disorder',
    'Language Delay',
    'Cluttering',
    'Selective Mutism',
    'Lisping',
    'Accent Modification',
    'Other'
  ]

  const therapyGoalOptions = [
    'Improve Fluency',
    'Reduce Stuttering',
    'Better Pronunciation',
    'Increase Confidence',
    'Speak Clearly',
    'Control Speech Rate',
    'Improve Articulation',
    'Enhance Communication',
    'Professional Speaking',
    'Social Communication',
    'Public Speaking',
    'Accent Reduction',
    'Voice Quality',
    'Other'
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    
    // Auto-capitalize first letter of each word for specific fields
    if (name === 'fullName' || name === 'interests' || name === 'troubleSpots') {
      const capitalizedValue = value
        .split(' ')
        .map(word => {
          if (word.length === 0) return word
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        })
        .join(' ')
      setFormData({ ...formData, [name]: capitalizedValue })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB')
        return
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file')
        return
      }

      setProfilePic(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfilePicPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    // Show initial toast
    const loadingToast = toast.loading('Saving your profile...')

    try {
      const formDataToSend = new FormData()
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          formDataToSend.append(key, formData[key])
        }
      })

      // Append profile picture if selected
      if (profilePic) {
        formDataToSend.append('profilePic', profilePic)
      }

      // Update loading message
      toast.loading('Generating personalized sentences...', { id: loadingToast })

      const response = await api.post('/user/profile/complete', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      console.log('Profile response:', response.data)

      // Update user in store
      if (response.data.user) {
        updateUser(response.data.user)
      }
      
      // Dismiss loading toast
      toast.dismiss(loadingToast)
      
      // Show success message with details
      if (response.data.recommendationsGenerated && response.data.audioGenerated) {
        toast.success('Profile saved! AI sentences and audio generated successfully! 🎉', { duration: 4000 })
      } else if (response.data.recommendationsGenerated) {
        toast.success('Profile saved! AI sentences generated successfully!', { duration: 4000 })
      } else {
        toast.success('Profile saved successfully!', { duration: 3000 })
        toast.info('Using default practice sentences (Ollama not available)', { duration: 4000 })
      }
      
      // Dispatch event for navbar sync
      window.dispatchEvent(new Event('auth-change'))
      
      // IMPORTANT: Clear any cached data to force refresh
      // This ensures new sentences and audio are loaded
      sessionStorage.removeItem('cached-recommendations')
      localStorage.removeItem('cached-recommendations')
      
      // Small delay to show success message, then navigate
      setTimeout(() => {
        console.log('Navigating to dashboard...')
        navigate('/dashboard', { replace: true, state: { forceRefresh: true } })
      }, 1500)
      
    } catch (error) {
      console.error('Profile save error:', error)
      toast.dismiss(loadingToast)
      toast.error(error.response?.data?.detail || 'Failed to save profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Show loading state while fetching profile
  if (fetchingProfile) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="animate-spin w-12 h-12 text-blue-600 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">Loading profile...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] transition-colors duration-300 py-24 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <div className="bg-white/90 dark:bg-[#131722]/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-8 md:p-12 border border-slate-200/50 dark:border-slate-700/50">
            {/* Header */}
            <div className="text-center mb-10">
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-3">
                {user?.profileCompleted ? 'Update Your Profile' : 'Setup Your Profile'}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-lg">
                {user?.profileCompleted 
                  ? 'Edit your information to keep your AI therapist up to date'
                  : "Let's personalize your AI therapist for maximum accuracy"
                }
              </p>
            </div>

            {/* Profile Picture Upload */}
            <div className="flex justify-center mb-12">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-slate-700 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-4 border-slate-300 dark:border-slate-600 shadow-xl">
                  {profilePicPreview ? (
                    <img src={profilePicPreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={56} className="text-slate-400 dark:text-slate-500" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full cursor-pointer shadow-lg transition-all duration-300 hover:scale-110">
                  <Upload size={20} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Section 1: IDENTITY */}
              <div>
                <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
                  1. IDENTITY
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-100 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        placeholder="Full Name"
                        required
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-100 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        placeholder="Phone Number (Optional)"
                      />
                    </div>
                  </div>

                  {/* Age */}
                  <div>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
                      <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        min="1"
                        max="120"
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-100 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        placeholder="Age"
                        required
                      />
                    </div>
                  </div>

                  {/* Gender */}
                  <div>
                    <div className="relative">
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 rounded-xl bg-slate-100 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
                        required
                      >
                        <option value="" className="bg-white dark:bg-slate-800">Select Gender</option>
                        {genderOptions.map(option => (
                          <option key={option} value={option} className="bg-white dark:bg-slate-800">
                            {option}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" size={20} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: CLINICAL CONTEXT */}
              <div>
                <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
                  2. CLINICAL CONTEXT
                </h3>
                <div className="space-y-4">
                  {/* Native Language */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      Native Language
                    </label>
                    <div className="relative">
                      <select
                        name="nativeLanguage"
                        value={formData.nativeLanguage}
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 rounded-xl bg-slate-100 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
                        required
                      >
                        <option value="" className="bg-white dark:bg-slate-800">Select Language</option>
                        {languageOptions.map(option => (
                          <option key={option} value={option} className="bg-white dark:bg-slate-800">
                            {option}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" size={20} />
                    </div>
                  </div>

                  {/* Speech Disorder Type */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      Speech Disorder Type
                    </label>
                    <div className="relative">
                      <select
                        name="speechDisorder"
                        value={formData.speechDisorder}
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 rounded-xl bg-slate-100 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
                        required
                      >
                        <option value="" className="bg-white dark:bg-slate-800">Select Disorder Type</option>
                        {speechDisorderOptions.map(option => (
                          <option key={option} value={option} className="bg-white dark:bg-slate-800">
                            {option}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" size={20} />
                    </div>
                  </div>

                  {/* Current Severity Level */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      Current Severity Level
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {['Mild', 'Moderate', 'Severe'].map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setFormData({ ...formData, severityLevel: level.toLowerCase() })}
                          className={`py-3.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                            formData.severityLevel === level.toLowerCase()
                              ? 'bg-blue-600 text-white shadow-lg scale-105'
                              : 'bg-slate-100 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Therapy Goals */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      Therapy Goal
                    </label>
                    <div className="relative">
                      <select
                        name="therapyGoals"
                        value={formData.therapyGoals}
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 rounded-xl bg-slate-100 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
                        required
                      >
                        <option value="" className="bg-white dark:bg-slate-800">Select Primary Goal</option>
                        {therapyGoalOptions.map(option => (
                          <option key={option} value={option} className="bg-white dark:bg-slate-800">
                            {option}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" size={20} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: AI CALIBRATION */}
              <div>
                <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
                  3. AI CALIBRATION
                </h3>
                <div className="space-y-4">
                  {/* Interests & Hobbies */}
                  <div>
                    <label className="block text-xs font-semibold text-pink-500 dark:text-pink-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <span className="text-pink-500">❤</span>
                      Interests & Hobbies (Clinical for AI)
                    </label>
                    <textarea
                      name="interests"
                      value={formData.interests}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-3.5 rounded-xl bg-slate-100 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                      placeholder="e.g., Football, Sci-Fi Movies, Cooking, Coding"
                    />
                  </div>

                  {/* Specific Trouble Spots */}
                  <div>
                    <label className="block text-xs font-semibold text-blue-500 dark:text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <span className="text-blue-500">🎯</span>
                      Specific Trouble Spots
                    </label>
                    <textarea
                      name="troubleSpots"
                      value={formData.troubleSpots}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-3.5 rounded-xl bg-slate-100 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                      placeholder="e.g., Words starting with 'S', Speaking on the phone, 'R' sounds..."
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 flex items-center justify-center gap-3 group disabled:opacity-70 disabled:cursor-not-allowed mt-8"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={24} />
                    <span>Generating AI Therapy Plan...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    <span>{user?.profileCompleted ? 'Update AI Therapy Plan' : 'Initialize AI Therapy Plan'}</span>
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
              
              {/* Loading Info */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center text-sm text-slate-600 dark:text-slate-400 mt-4"
                >
                  <p>⏳ This may take 10-30 seconds...</p>
                  <p className="mt-1">Generating personalized sentences and reference audio</p>
                </motion.div>
              )}
            </form>
          </div>
        </motion.div>
      </div>
    </>
  )
}

export default CompleteProfile
