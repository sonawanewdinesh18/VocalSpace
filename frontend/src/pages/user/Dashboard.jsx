import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Mic, Square, Play, Pause, RotateCcw, Send, Volume2, 
  ChevronLeft, ChevronRight, CheckCircle, Clock, Target,
  TrendingUp, Award, Zap, AlertCircle, Info, Trophy
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../utils/api'
import Navbar from '../../components/Navbar'
import SimpleAnalysisResults from '../../components/SimpleAnalysisResults'
import RealTimeFeedback from '../../components/RealTimeFeedback'
import Gamification from '../../components/Gamification'

const UserDashboard = () => {
  // State Management
  const [sentences, setSentences] = useState([])
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0)
  const [stats, setStats] = useState({ streak: 0, xp: 0, accuracy: 0, totalSessions: 0 })
  
  // Recording State
  const [isRecording, setIsRecording] = useState(false)
  const [hasRecording, setHasRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState(null)
  const [isPlayingRecording, setIsPlayingRecording] = useState(false)
  
  // Reference Audio State
  const [isPlayingReference, setIsPlayingReference] = useState(false)
  const [referenceProgress, setReferenceProgress] = useState(0)
  
  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [showAnalysis, setShowAnalysis] = useState(false)
  
  // Session History
  const [recentSessions, setRecentSessions] = useState([])
  
  // Gamification
  const [showGamification, setShowGamification] = useState(false)
  
  // Refs
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const recordingTimerRef = useRef(null)
  const referenceAudioRef = useRef(null)
  const userAudioRef = useRef(null)
  
  // Fetch data on mount
  useEffect(() => {
    fetchSentences()
    fetchStats()
    fetchRecentSessions()
  }, [])
  
  // Fetch personalized sentences
  const fetchSentences = async () => {
    try {
      const timestamp = new Date().getTime()
      const { data } = await api.get(`/user/recommendations?t=${timestamp}`)
      console.log('Fetched recommendations:', data)
      setSentences(data.sentences || [])
    } catch (error) {
      console.error('Error fetching sentences:', error)
      toast.error('Failed to load practice sentences')
    }
  }
  
  // Fetch user stats
  const fetchStats = async () => {
    try {
      const { data } = await api.get('/user/stats')
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }
  
  // Fetch recent practice sessions
  const fetchRecentSessions = async () => {
    try {
      const { data } = await api.get('/user/sessions/recent')
      setRecentSessions(data.sessions || [])
    } catch (error) {
      console.error('Error fetching sessions:', error)
    }
  }
  
  // Start Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        setAudioBlob(audioBlob)
        setHasRecording(true)
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      
      // Start timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 10) {
            stopRecording()
            return prev
          }
          return prev + 1
        })
      }, 1000)
      
      toast.success('Recording started')
    } catch (error) {
      console.error('Error starting recording:', error)
      toast.error('Failed to access microphone')
    }
  }
  
  // Stop Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      clearInterval(recordingTimerRef.current)
      toast.success('Recording stopped')
    }
  }
  
  // Retry Recording
  const retryRecording = () => {
    setHasRecording(false)
    setAudioBlob(null)
    setRecordingTime(0)
    setAnalysisResult(null)
    setShowAnalysis(false)
    toast.info('Ready to record again')
  }
  
  // Play User Recording
  const playUserRecording = () => {
    if (audioBlob && userAudioRef.current) {
      const url = URL.createObjectURL(audioBlob)
      userAudioRef.current.src = url
      userAudioRef.current.play()
      setIsPlayingRecording(true)
    }
  }
  
  // Play Reference Audio
  const playReferenceAudio = () => {
    if (referenceAudioRef.current) {
      if (isPlayingReference) {
        referenceAudioRef.current.pause()
        setIsPlayingReference(false)
      } else {
        referenceAudioRef.current.play()
        setIsPlayingReference(true)
      }
    }
  }
  
  // Submit for Analysis
  const submitForAnalysis = async () => {
    if (!audioBlob) {
      toast.error('Please record audio first')
      return
    }
    
    setIsAnalyzing(true)
    
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.wav')
      formData.append('sentence_id', currentSentenceIndex)
      formData.append('sentence_text', sentences[currentSentenceIndex].sentence)
      
      // Pass reference audio path
      if (sentences[currentSentenceIndex].audio_path) {
        formData.append('reference_audio_path', sentences[currentSentenceIndex].audio_path)
      }
      
      const { data } = await api.post('/ai/analyze-speech', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      setAnalysisResult(data)
      setShowAnalysis(true)
      toast.success('Analysis complete!')
      
      // Refresh stats
      fetchStats()
      fetchRecentSessions()
    } catch (error) {
      console.error('Error analyzing speech:', error)
      toast.error('Analysis failed. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }
  
  // Navigate sentences
  const goToPrevious = () => {
    if (currentSentenceIndex > 0) {
      setCurrentSentenceIndex(prev => prev - 1)
      resetSession()
    }
  }
  
  const goToNext = () => {
    if (currentSentenceIndex < sentences.length - 1) {
      setCurrentSentenceIndex(prev => prev + 1)
      resetSession()
    }
  }
  
  const resetSession = () => {
    setHasRecording(false)
    setAudioBlob(null)
    setRecordingTime(0)
    setAnalysisResult(null)
    setShowAnalysis(false)
    setIsPlayingReference(false)
    setIsPlayingRecording(false)
  }
  
  const currentSentence = sentences[currentSentenceIndex]
  
  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] py-24 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Stats Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
          >
            <StatCard icon={<Zap />} label="Streak" value={`${stats.streak} days`} color="text-orange-500" />
            <StatCard icon={<Award />} label="XP Points" value={stats.xp} color="text-purple-500" />
            <StatCard icon={<Target />} label="Accuracy" value={`${stats.accuracy}%`} color="text-blue-500" />
            <StatCard icon={<TrendingUp />} label="Sessions" value={stats.totalSessions} color="text-green-500" />
          </motion.div>

          {/* Gamification Toggle Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-8"
          >
            <button
              onClick={() => setShowGamification(!showGamification)}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
            >
              <Trophy size={24} />
              {showGamification ? 'Hide' : 'Show'} Achievements & Level
            </button>
          </motion.div>

          {/* Gamification Section */}
          <AnimatePresence>
            {showGamification && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8"
              >
                <Gamification stats={stats} />
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Main Practice Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-[#131722] rounded-3xl shadow-2xl p-8 mb-8"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                🎯 Today's Practice
              </h2>
              <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                Sentence {currentSentenceIndex + 1} of {sentences.length}
              </div>
            </div>
            
            {sentences.length > 0 ? (
              <>
                {/* Sentence Display */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8 mb-8 border-2 border-blue-200 dark:border-blue-800">
                  <p className="text-2xl md:text-3xl font-bold text-center text-slate-900 dark:text-white leading-relaxed">
                    "{currentSentence?.sentence || 'Loading...'}"
                  </p>
                </div>

                {/* Reference Audio Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Volume2 className="text-blue-500" size={24} />
                    Reference Audio
                  </h3>
                  <div className="bg-slate-100 dark:bg-slate-900/50 rounded-xl p-6">
                    <audio
                      ref={referenceAudioRef}
                      src={currentSentence?.audio_path ? `http://localhost:8000${currentSentence.audio_path}` : ''}
                      onEnded={() => setIsPlayingReference(false)}
                      onTimeUpdate={(e) => {
                        const progress = (e.target.currentTime / e.target.duration) * 100
                        setReferenceProgress(progress)
                      }}
                      onError={(e) => {
                        console.error('Audio error:', e)
                        toast.error('Failed to load reference audio')
                      }}
                      className="hidden"
                    />
                    
                    <div className="flex items-center gap-4 mb-4">
                      <button
                        onClick={playReferenceAudio}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full transition-all duration-300 hover:scale-110"
                      >
                        {isPlayingReference ? <Pause size={24} /> : <Play size={24} />}
                      </button>
                      
                      <div className="flex-1">
                        <div className="h-2 bg-slate-300 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 transition-all duration-300"
                            style={{ width: `${referenceProgress}%` }}
                          />
                        </div>
                      </div>
                      
                      <button
                        onClick={() => {
                          if (referenceAudioRef.current) {
                            referenceAudioRef.current.currentTime = 0
                            referenceAudioRef.current.play()
                            setIsPlayingReference(true)
                          }
                        }}
                        className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        <RotateCcw size={20} />
                      </button>
                    </div>
                    
                    <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
                      Listen carefully to the reference pronunciation
                    </p>
                  </div>
                </div>
                
                {/* Real-Time Feedback */}
                <RealTimeFeedback isRecording={isRecording} />
                
                {/* Recording Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Mic className="text-red-500" size={24} />
                    Your Recording
                  </h3>
                  <div className="bg-slate-100 dark:bg-slate-900/50 rounded-xl p-6">
                    <audio
                      ref={userAudioRef}
                      onEnded={() => setIsPlayingRecording(false)}
                      className="hidden"
                    />
                    
                    <div className="flex flex-wrap items-center justify-center gap-4 mb-4">
                      {!isRecording && !hasRecording && (
                        <button
                          onClick={startRecording}
                          className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 flex items-center gap-2"
                        >
                          <Mic size={24} />
                          Start Recording
                        </button>
                      )}
                      
                      {isRecording && (
                        <button
                          onClick={stopRecording}
                          className="bg-slate-800 hover:bg-slate-900 text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 flex items-center gap-2 animate-pulse"
                        >
                          <Square size={24} />
                          Stop Recording
                        </button>
                      )}
                      
                      {hasRecording && !isRecording && (
                        <>
                          <button
                            onClick={playUserRecording}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-bold transition-all duration-300 hover:scale-105 flex items-center gap-2"
                          >
                            <Play size={20} />
                            Listen
                          </button>
                          
                          <button
                            onClick={retryRecording}
                            className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-full font-bold transition-all duration-300 hover:scale-105 flex items-center gap-2"
                          >
                            <RotateCcw size={20} />
                            Retry
                          </button>
                          
                          <button
                            onClick={submitForAnalysis}
                            disabled={isAnalyzing}
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full font-bold transition-all duration-300 hover:scale-105 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isAnalyzing ? (
                              <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                                Analyzing...
                              </>
                            ) : (
                              <>
                                <Send size={20} />
                                Submit for Analysis
                              </>
                            )}
                          </button>
                        </>
                      )}
                    </div>
                    
                    <div className="text-center">
                      <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                        {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {isRecording ? 'Recording...' : hasRecording ? 'Recording ready' : 'Max 10 seconds'}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Analysis Results */}
                <AnimatePresence>
                  {showAnalysis && analysisResult && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-8"
                    >
                      <SimpleAnalysisResults 
                        result={analysisResult}
                        referenceAudioPath={sentences[currentSentenceIndex]?.audio_path}
                        userAudioPath={analysisResult.user_audio_path}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Navigation */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-700">
                  <button
                    onClick={goToPrevious}
                    disabled={currentSentenceIndex === 0}
                    className="flex items-center gap-2 px-6 py-3 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={20} />
                    Previous
                  </button>
                  
                  <div className="flex gap-2">
                    {sentences.map((_, idx) => (
                      <div
                        key={idx}
                        className={`w-3 h-3 rounded-full transition-all ${
                          idx === currentSentenceIndex
                            ? 'bg-blue-600 w-8'
                            : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                  
                  <button
                    onClick={goToNext}
                    disabled={currentSentenceIndex === sentences.length - 1}
                    className="flex items-center gap-2 px-6 py-3 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <ChevronRight size={20} />
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  No practice sentences available. Please complete your profile first.
                </p>
                <button
                  onClick={() => window.location.href = '/complete-profile'}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-bold transition-all"
                >
                  Complete Profile
                </button>
              </div>
            )}
          </motion.div>
          
          {/* Recent Sessions */}
          {recentSessions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-[#131722] rounded-3xl shadow-2xl p-8"
            >
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                📜 Recent Practice Sessions
              </h2>
              <div className="space-y-4">
                {recentSessions.map((session, idx) => (
                  <SessionCard key={idx} session={session} />
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  )
}

// Stat Card Component
const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-white dark:bg-[#131722] rounded-2xl p-6 shadow-lg">
    <div className={`${color} mb-2`}>{icon}</div>
    <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">{label}</div>
    <div className="text-2xl font-bold text-slate-900 dark:text-white">{value}</div>
  </div>
)


// Analysis Results Component
const AnalysisResults = ({ result }) => {
  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 80) return 'text-green-500'
    if (accuracy >= 60) return 'text-yellow-500'
    return 'text-red-500'
  }
  
  const getAccuracyBg = (accuracy) => {
    if (accuracy >= 80) return 'bg-green-100 dark:bg-green-900/20'
    if (accuracy >= 60) return 'bg-yellow-100 dark:bg-yellow-900/20'
    return 'bg-red-100 dark:bg-red-900/20'
  }
  
  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 border-2 border-blue-200 dark:border-blue-800">
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
        <CheckCircle className="text-green-500" size={24} />
        Analysis Results
      </h3>
      
      {/* Overall Score */}
      <div className={`${getAccuracyBg(result.accuracy)} rounded-xl p-6 mb-6`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-lg font-bold text-slate-900 dark:text-white">Overall Accuracy</span>
          <span className={`text-4xl font-bold ${getAccuracyColor(result.accuracy)}`}>
            {result.accuracy}%
          </span>
        </div>
        <div className="w-full bg-slate-300 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              result.accuracy >= 80 ? 'bg-green-500' :
              result.accuracy >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${result.accuracy}%` }}
          />
        </div>
      </div>
      
      {/* Word Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-900/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="text-green-500" size={20} />
            <span className="font-bold text-slate-900 dark:text-white">Words Correct</span>
          </div>
          <div className="text-3xl font-bold text-green-500">
            {result.words_correct} / {result.words_total}
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-900/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="text-blue-500" size={20} />
            <span className="font-bold text-slate-900 dark:text-white">Duration</span>
          </div>
          <div className="text-3xl font-bold text-blue-500">
            {result.duration}s
          </div>
        </div>
      </div>
      
      {/* Weak Words */}
      {result.weak_words && result.weak_words.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 mb-4 border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="text-yellow-600" size={20} />
            <span className="font-bold text-slate-900 dark:text-white">Words to Improve</span>
          </div>
          <div className="space-y-2">
            {result.weak_words.map((wordInfo, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900 dark:text-white">
                    "{wordInfo.word}"
                  </span>
                  <span className="text-sm font-semibold text-yellow-600">
                    {wordInfo.accuracy}% match
                  </span>
                </div>
                {wordInfo.spoken_as && (
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    You said: "{wordInfo.spoken_as}"
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Missing Words */}
      {result.missing_words && result.missing_words.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 mb-4 border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="text-red-600" size={20} />
            <span className="font-bold text-slate-900 dark:text-white">Missing Words</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {result.missing_words.map((word, idx) => (
              <span
                key={idx}
                className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-3 py-1 rounded-full text-sm font-semibold"
              >
                {word}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Phoneme Errors */}
      {result.weak_phonemes && result.weak_phonemes.length > 0 && (
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 mb-4 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-2 mb-3">
            <Info className="text-purple-600" size={20} />
            <span className="font-bold text-slate-900 dark:text-white">Phoneme Analysis</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {result.weak_phonemes.map((phoneme, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900/50 rounded-lg p-2 text-center"
              >
                <div className="text-lg font-bold text-purple-600">/{phoneme}/</div>
                {result.phoneme_errors && result.phoneme_errors[phoneme] && (
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    {result.phoneme_errors[phoneme]}%
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Feedback */}
      {result.feedback && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-2">
            <Info className="text-blue-600" size={20} />
            <span className="font-bold text-slate-900 dark:text-white">Feedback</span>
          </div>
          <p className="text-slate-700 dark:text-slate-300">{result.feedback}</p>
        </div>
      )}
      
      {/* Transcription Comparison */}
      {result.transcription && (
        <div className="mt-4 bg-slate-100 dark:bg-slate-900/50 rounded-xl p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">
                Expected:
              </div>
              <div className="text-slate-900 dark:text-white font-mono">
                {result.expected_text}
              </div>
            </div>
            <div>
              <div className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">
                You said:
              </div>
              <div className="text-slate-900 dark:text-white font-mono">
                {result.transcription}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Session Card Component
const SessionCard = ({ session }) => {
  const [expanded, setExpanded] = useState(false)
  
  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 80) return 'text-green-500'
    if (accuracy >= 60) return 'text-yellow-500'
    return 'text-red-500'
  }
  
  return (
    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 hover:shadow-lg transition-all">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1">
          <div className="font-bold text-slate-900 dark:text-white mb-1">
            "{session.sentence_text}"
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {new Date(session.created_at).toLocaleString()}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className={`text-2xl font-bold ${getAccuracyColor(session.accuracy)}`}>
            {session.accuracy}%
          </div>
          <ChevronRight
            className={`text-slate-400 transition-transform ${expanded ? 'rotate-90' : ''}`}
            size={20}
          />
        </div>
      </div>
      
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700"
          >
            {/* Weak Words */}
            {session.weak_words && session.weak_words.length > 0 && (
              <div className="mb-3">
                <div className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Weak Words:
                </div>
                <div className="flex flex-wrap gap-2">
                  {session.weak_words.map((wordInfo, idx) => (
                    <span
                      key={idx}
                      className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded text-sm"
                    >
                      {typeof wordInfo === 'string' ? wordInfo : wordInfo.word}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Missing Words */}
            {session.missing_words && session.missing_words.length > 0 && (
              <div className="mb-3">
                <div className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Missing Words:
                </div>
                <div className="flex flex-wrap gap-2">
                  {session.missing_words.map((word, idx) => (
                    <span
                      key={idx}
                      className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-1 rounded text-sm"
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Weak Phonemes */}
            {session.weak_phonemes && session.weak_phonemes.length > 0 && (
              <div className="mb-3">
                <div className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Weak Phonemes:
                </div>
                <div className="flex flex-wrap gap-2">
                  {session.weak_phonemes.map((phoneme, idx) => (
                    <span
                      key={idx}
                      className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded text-sm font-mono"
                    >
                      /{phoneme}/
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Audio Playback */}
            {session.user_audio_path && (
              <div className="mt-3">
                <audio
                  controls
                  className="w-full"
                  src={`http://localhost:8000/${session.user_audio_path}`}
                >
                  Your browser does not support audio playback.
                </audio>
              </div>
            )}
            
            {/* Feedback */}
            {session.feedback && (
              <div className="mt-3 text-sm text-slate-600 dark:text-slate-400 italic">
                {session.feedback}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default UserDashboard
