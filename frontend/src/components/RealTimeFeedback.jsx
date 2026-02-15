import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Volume2, Activity, CheckCircle, AlertCircle, XCircle } from 'lucide-react'

const RealTimeFeedback = ({ isRecording }) => {
  const [volume, setVolume] = useState(0)
  const [pitch, setPitch] = useState(0)
  const [quality, setQuality] = useState('silent')
  const [pitchHistory, setPitchHistory] = useState([])
  
  const wsRef = useRef(null)
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const streamRef = useRef(null)

  useEffect(() => {
    if (isRecording) {
      startRealTimeFeedback()
    } else {
      stopRealTimeFeedback()
    }

    return () => {
      stopRealTimeFeedback()
    }
  }, [isRecording])

  const startRealTimeFeedback = async () => {
    try {
      // Connect WebSocket
      wsRef.current = new WebSocket('ws://localhost:8000/ws/realtime-feedback')
      
      wsRef.current.onopen = () => {
        console.log('🔌 WebSocket connected')
      }

      wsRef.current.onmessage = (event) => {
        const feedback = JSON.parse(event.data)
        setVolume(feedback.volume)
        setPitch(feedback.pitch)
        setQuality(feedback.quality)
        
        // Update pitch history for visualization
        setPitchHistory(prev => {
          const newHistory = [...prev, feedback.pitch]
          return newHistory.slice(-50) // Keep last 50 points
        })
      }

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error)
      }

      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      // Create audio context
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      
      // Create analyser
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 2048
      source.connect(analyserRef.current)

      // Start sending audio chunks
      sendAudioChunks()
    } catch (error) {
      console.error('Error starting real-time feedback:', error)
    }
  }

  const sendAudioChunks = () => {
    if (!analyserRef.current || !wsRef.current) return

    const bufferLength = analyserRef.current.fftSize
    const dataArray = new Float32Array(bufferLength)

    const sendChunk = () => {
      if (!isRecording || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        return
      }

      analyserRef.current.getFloatTimeDomainData(dataArray)

      // Convert to base64
      const audioBase64 = btoa(
        String.fromCharCode(...new Uint8Array(dataArray.buffer))
      )

      // Send to server
      wsRef.current.send(JSON.stringify({ audio: audioBase64 }))

      // Continue sending
      setTimeout(sendChunk, 100) // Send every 100ms
    }

    sendChunk()
  }

  const stopRealTimeFeedback = () => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }

    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    setVolume(0)
    setPitch(0)
    setQuality('silent')
    setPitchHistory([])
  }

  const getQualityColor = () => {
    switch (quality) {
      case 'good': return 'text-green-600 dark:text-green-400'
      case 'low': return 'text-yellow-600 dark:text-yellow-400'
      case 'silent': return 'text-slate-400 dark:text-slate-600'
      default: return 'text-red-600 dark:text-red-400'
    }
  }

  const getQualityIcon = () => {
    switch (quality) {
      case 'good': return <CheckCircle size={20} />
      case 'low': return <AlertCircle size={20} />
      case 'silent': return <XCircle size={20} />
      default: return <XCircle size={20} />
    }
  }

  if (!isRecording) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 border-2 border-blue-200 dark:border-blue-800 mb-6"
    >
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <Activity className="text-blue-600 animate-pulse" size={24} />
        Real-Time Feedback
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Volume Meter */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Volume2 className="text-blue-600" size={20} />
            <span className="font-semibold text-slate-700 dark:text-slate-300">Volume</span>
          </div>
          <div className="relative h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className={`h-full transition-all duration-100 ${
                volume > 70 ? 'bg-green-500' :
                volume > 30 ? 'bg-blue-500' :
                'bg-slate-400'
              }`}
              style={{ width: `${volume}%` }}
              animate={{ width: `${volume}%` }}
            />
          </div>
          <div className="text-center mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {volume}%
          </div>
        </div>

        {/* Pitch Display */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="text-purple-600" size={20} />
            <span className="font-semibold text-slate-700 dark:text-slate-300">Pitch</span>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {pitch > 0 ? `${pitch} Hz` : '--'}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {pitch > 0 ? (
                pitch < 150 ? 'Low' :
                pitch < 250 ? 'Normal' :
                'High'
              ) : 'No pitch detected'}
            </div>
          </div>
        </div>

        {/* Quality Indicator */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            {getQualityIcon()}
            <span className="font-semibold text-slate-700 dark:text-slate-300">Quality</span>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold capitalize ${getQualityColor()}`}>
              {quality}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {quality === 'good' ? 'Clear audio' :
               quality === 'low' ? 'Speak louder' :
               quality === 'silent' ? 'No sound detected' :
               'Check microphone'}
            </div>
          </div>
        </div>
      </div>

      {/* Pitch Tracker Visualization */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4">
        <div className="font-semibold text-slate-700 dark:text-slate-300 mb-3">
          Pitch Tracker
        </div>
        <div className="relative h-24 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
          <svg className="w-full h-full">
            {/* Grid lines */}
            <line x1="0" y1="50%" x2="100%" y2="50%" stroke="currentColor" strokeWidth="1" className="text-slate-300 dark:text-slate-600" strokeDasharray="4" />
            
            {/* Pitch line */}
            {pitchHistory.length > 1 && (
              <polyline
                points={pitchHistory.map((p, i) => {
                  const x = (i / pitchHistory.length) * 100
                  const y = p > 0 ? 100 - ((p / 500) * 100) : 50
                  return `${x},${y}`
                }).join(' ')}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-purple-600 dark:text-purple-400"
              />
            )}
          </svg>
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">
          Your pitch variation over time
        </div>
      </div>

      {/* Tips */}
      <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          💡 <strong>Tip:</strong> {
            volume < 20 ? 'Speak louder for better detection' :
            volume > 80 ? 'You might be too loud, try speaking a bit softer' :
            quality === 'good' ? 'Great! Keep speaking clearly' :
            'Maintain steady volume and clear pronunciation'
          }
        </p>
      </div>
    </motion.div>
  )
}

export default RealTimeFeedback
