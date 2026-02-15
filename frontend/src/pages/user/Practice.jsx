import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Mic, Square, Play, Pause, RotateCcw, Send, Volume2, 
  CheckCircle, AlertCircle, TrendingUp, Target, Award, 
  ChevronRight, Info, Zap, Clock
} from 'lucide-react'
import Navbar from '../../components/Navbar'
import DetailedAnalysisResults from '../../components/DetailedAnalysisResults'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const Practice = () => {
  // Practice Sessions State
  const [practiceSessions, setPracticeSessions] = useState([])
  const [currentSessionIndex, setCurrentSessionIndex] = useState(0)
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0)
  
  // Performance Analysis State
  const [performanceAnalysis, setPerformanceAnalysis] = useState(null)
  const [showAnalysis, setShowAnalysis] = useState(true)
  
  // Recording State
  const [isRecording, setIsRecording] = useState(false)
  const [hasRecording, setHasRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState(null)
  
  // Audio Playback State
  const [isPlayingReference, setIsPlayingReference] = useState(false)
  const [isPlayingUser, setIsPlayingUser] = useState(false)
  
  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [showResult, setShowResult] = useState(false)
  
  // Refs
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const recordingTimerRef = useRef(null)
  const referenceAudioRef = useRef(null)
  const userAudioRef = useRef(null)

  useEffect(() => {
    fetchPracticeSessions()
    fetchPerformanceAnalysis()
  }, [])

  const fetchPracticeSessions = async () => {
    try {
      const { data } = await api.get('/user/practice-sessions')
      console.log('Practice sessions:', data)
      setPracticeSessions(data.sessions || [])
    } catch (error) {
      console.error('Error fetching practice sessions:', error)
      toast.error('Failed to load practice sessions')
    }
  }

  const fetchPerformanceAnalysis = async () => {
    try {
      const { data } = await api.get('/user/performance-analysis')
      console.log('Performance analysis:', data)
      setPerformanceAnalysis(data)
    } catch (error) {
      console.error('Error fetching performance analysis:', error)
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
    setShowResult(false)
    toast.info('Ready to record again')
  }

  // Play User Recording
  const playUserRecording = () => {
    if (audioBlob && userAudioRef.current) {
      const url = URL.createObjectURL(audioBlob)
      userAudioRef.current.src = url
      userAudioRef.current.play()
      setIsPlayingUser(true)
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
    
    const currentSession = practiceSessions[currentSessionIndex]
    const currentSentence = currentSession?.sentences[currentSentenceIndex]
    
    if (!currentSentence) {
      toast.error('No sentence selected')
      return
    }
    
    setIsAnalyzing(true)
    
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.wav')
      formData.append('sentence_id', currentSentenceIndex)
      formData.append('sentence_text', currentSentence.text)
      
      if (currentSentence.audio_path) {
        formData.append('reference_audio_path', currentSentence.audio_path)
      }
      
      const { data } = await api.post('/ai/analyze-speech', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      setAnalysisResult(data)
      setShowResult(true)
      toast.success('Analysis complete!')
      
      // Refresh data
      fetchPracticeSessions()
      fetchPerformanceAnalysis()
    } catch (error) {
      console.error('Error analyzing speech:', error)
      toast.error('Analysis failed. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Navigate to next sentence
  const goToNextSentence = () => {
    const currentSession = practiceSessions[currentSessionIndex]
    if (currentSentenceIndex < currentSession.sentences.length - 1) {
      setCurrentSentenceIndex(prev => prev + 1)
      resetSession()
    } else if (currentSessionIndex < practiceSessions.length - 1) {
      // Move to next session
      setCurrentSessionIndex(prev => prev + 1)
      setCurrentSentenceIndex(0)
      resetSession()
      toast.success('Moving to next practice session!')
    } else {
      toast.success('All practice sessions completed! 🎉')
    }
  }

  const resetSession = () => {
    setHasRecording(false)
    setAudioBlob(null)
    setRecordingTime(0)
    setAnalysisResult(null)
    setShowResult(false)
    setIsPlayingReference(false)
    setIsPlayingUser(false)
  }

  if (practiceSessions.length === 0) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] pt-24 px-4">
          <div className="max-w-2xl mx-auto text-center py-12">
            <AlertCircle className="mx-auto mb-4 text-yellow-500" size={64} />
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              No Practice Sessions Available
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Complete some practice on the Dashboard first to unlock targeted practice sessions!
            </p>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-bold transition-all"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </>
    )
  }

  const currentSession = practiceSessions[currentSessionIndex]
  const currentSentence = currentSession?.sentences[currentSentenceIndex]
  const progress = ((currentSessionIndex * currentSession.sentences.length + currentSentenceIndex + 1) / 
    (practiceSessions.reduce((sum, s) => sum + s.sentences.length, 0))) * 100

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] py-24 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header with Performance Analysis */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                  🎯 Targeted Practice
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  Practice sessions based on your performance
                </p>
              </div>
              <button
                onClick={() => setShowAnalysis(!showAnalysis)}
                className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2"
              >
                <Info size={20} />
                {showAnalysis ? 'Hide' : 'Show'} Analysis
              </button>
            </div>

            {/* Performance Analysis Card */}
            <AnimatePresence>
              {showAnalysis && performanceAnalysis && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 mb-6 border-2 border-blue-200 dark:border-blue-800"
                >
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="text-blue-600" size={24} />
                    Your Performance Analysis
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-white dark:bg-slate-900/50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="text-green-500" size={20} />
                        <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                          Average Accuracy
                        </span>
                      </div>
                      <div className="text-3xl font-bold text-green-500">
                        {performanceAnalysis.average_accuracy?.toFixed(1)}%
                      </div>
                    </div>
                    
                    <div className="bg-white dark:bg-slate-900/50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="text-purple-500" size={20} />
                        <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                          Total Sessions
                        </span>
                      </div>
                      <div className="text-3xl font-bold text-purple-500">
                        {performanceAnalysis.total_sessions}
                      </div>
                    </div>
                    
                    <div className="bg-white dark:bg-slate-900/50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="text-orange-500" size={20} />
                        <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                          Trend
                        </span>
                      </div>
                      <div className="text-lg font-bold text-orange-500">
                        {performanceAnalysis.trend}
                      </div>
                    </div>
                  </div>

                  {/* Problem Areas */}
                  {performanceAnalysis.top_weak_words && performanceAnalysis.top_weak_words.length > 0 && (
                    <div className="mb-3">
                      <div className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Words to Practice:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {performanceAnalysis.top_weak_words.slice(0, 10).map((word, idx) => (
                          <span
                            key={idx}
                            className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-3 py-1 rounded-full text-sm font-semibold"
                          >
                            {word}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {performanceAnalysis.top_weak_phonemes && performanceAnalysis.top_weak_phonemes.length > 0 && (
                    <div>
                      <div className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Phonemes to Practice:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {performanceAnalysis.top_weak_phonemes.map((phoneme, idx) => (
                          <span
                            key={idx}
                            className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full text-sm font-mono font-semibold"
                          >
                            /{phoneme}/
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                Overall Progress
              </span>
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Main Practice Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-[#131722] rounded-3xl shadow-2xl p-8 mb-8"
          >
            {/* Session Info */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {currentSession?.title || `Practice Session ${currentSessionIndex + 1}`}
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  {currentSession?.description || 'Focus on your weak areas'}
                </p>
              </div>
              <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                Sentence {currentSentenceIndex + 1} of {currentSession?.sentences.length}
              </div>
            </div>

            {/* Sentence Display */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8 mb-8 border-2 border-blue-200 dark:border-blue-800">
              <p className="text-2xl md:text-3xl font-bold text-center text-slate-900 dark:text-white leading-relaxed">
                "{currentSentence?.text || 'Loading...'}"
              </p>
              {currentSentence?.focus && (
                <p className="text-center text-sm text-blue-600 dark:text-blue-400 mt-4 font-semibold">
                  Focus: {currentSentence.focus}
                </p>
              )}
            </div>

            {/* Reference Audio */}
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
                  className="hidden"
                />
                
                <div className="flex items-center gap-4">
                  <button
                    onClick={playReferenceAudio}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full transition-all duration-300 hover:scale-110"
                  >
                    {isPlayingReference ? <Pause size={24} /> : <Play size={24} />}
                  </button>
                  
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Listen to the correct pronunciation
                  </p>
                </div>
              </div>
            </div>

            {/* Recording Section */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Mic className="text-red-500" size={24} />
                Your Recording
              </h3>
              <div className="bg-slate-100 dark:bg-slate-900/50 rounded-xl p-6">
                <audio
                  ref={userAudioRef}
                  onEnded={() => setIsPlayingUser(false)}
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
                  <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center justify-center gap-2">
                    <Clock size={28} />
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
              {showResult && analysisResult && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-8"
                >
                  <DetailedAnalysisResults 
                    result={analysisResult}
                    referenceAudioPath={currentSentence?.audio_path}
                    userAudioPath={analysisResult.user_audio_path}
                  />
                  
                  <button
                    onClick={goToNextSentence}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-full font-bold text-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 mt-6"
                  >
                    Next Sentence
                    <ChevronRight size={24} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </>
  )
}

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
    </div>
  )
}

export default Practice
