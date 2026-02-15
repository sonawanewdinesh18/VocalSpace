import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, Volume2, CheckCircle, XCircle, AlertTriangle, Target, TrendingUp, Clock, Activity } from 'lucide-react'

const SimpleAnalysisResults = ({ result, referenceAudioPath, userAudioPath }) => {
  const [playingReference, setPlayingReference] = useState(false)
  const [playingUser, setPlayingUser] = useState(false)
  const [referenceProgress, setReferenceProgress] = useState(0)
  const [userProgress, setUserProgress] = useState(0)
  
  const referenceAudioRef = useRef(null)
  const userAudioRef = useRef(null)

  const playReference = () => {
    if (referenceAudioRef.current) {
      if (playingReference) {
        referenceAudioRef.current.pause()
      } else {
        referenceAudioRef.current.play()
      }
    }
  }
  
  const playUser = () => {
    if (userAudioRef.current) {
      if (playingUser) {
        userAudioRef.current.pause()
      } else {
        userAudioRef.current.play()
      }
    }
  }

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 90) return 'text-green-600 dark:text-green-400'
    if (accuracy >= 75) return 'text-blue-600 dark:text-blue-400'
    if (accuracy >= 60) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getAccuracyBg = (accuracy) => {
    if (accuracy >= 90) return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
    if (accuracy >= 75) return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
    if (accuracy >= 60) return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
    return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
  }

  const getAccuracyMessage = (accuracy) => {
    if (accuracy >= 90) return { emoji: '🌟', title: 'Excellent!', message: 'Your pronunciation is very clear!' }
    if (accuracy >= 75) return { emoji: '✨', title: 'Great Job!', message: 'You\'re speaking clearly with minor areas to improve.' }
    if (accuracy >= 60) return { emoji: '👍', title: 'Good Progress!', message: 'Keep practicing the highlighted words.' }
    return { emoji: '💪', title: 'Keep Practicing!', message: 'Focus on the words and sounds below.' }
  }

  // Process word-level comparison
  const processWordComparison = () => {
    const expectedWords = result.expected_text.toLowerCase().split(' ')
    const spokenWords = result.transcription.toLowerCase().split(' ')
    
    const comparison = []
    const maxLength = Math.max(expectedWords.length, spokenWords.length)
    
    for (let i = 0; i < maxLength; i++) {
      const expected = expectedWords[i] || ''
      const spoken = spokenWords[i] || ''
      
      let status = 'correct'
      if (!spoken && expected) {
        status = 'missing'
      } else if (expected !== spoken) {
        status = 'wrong'
      }
      
      comparison.push({
        expected,
        spoken,
        status,
        index: i
      })
    }
    
    return comparison
  }

  // Calculate timing differences
  const calculateTimingDifferences = () => {
    if (!result.word_timings || result.word_timings.length === 0) {
      return []
    }
    
    return result.word_timings.map((userTiming, idx) => {
      const refTiming = result.word_timings_reference?.[idx]
      
      if (!refTiming) {
        return {
          word: userTiming.word,
          userStart: userTiming.start,
          userEnd: userTiming.end,
          userDuration: userTiming.end - userTiming.start,
          refStart: null,
          refEnd: null,
          refDuration: null,
          difference: null
        }
      }
      
      const userDuration = userTiming.end - userTiming.start
      const refDuration = refTiming.end - refTiming.start
      const difference = Math.abs(userDuration - refDuration)
      
      return {
        word: userTiming.word,
        userStart: userTiming.start,
        userEnd: userTiming.end,
        userDuration,
        refStart: refTiming.start,
        refEnd: refTiming.end,
        refDuration,
        difference
      }
    })
  }

  // Process phoneme timing differences
  const processPhonemeTimings = () => {
    if (!result.phoneme_timings || result.phoneme_timings.length === 0) {
      return []
    }

    return result.phoneme_timings.map(pt => {
      const phonemeResult = result.phoneme_results?.find(
        pr => pr.phoneme === pt.phoneme && pr.word === pt.word && pr.start === pt.start
      )
      
      return {
        phoneme: pt.phoneme,
        word: pt.word,
        start: pt.start,
        end: pt.end,
        duration: pt.end - pt.start,
        accuracy: phonemeResult ? Math.round(phonemeResult.score) : 0
      }
    })
  }

  const feedback = getAccuracyMessage(result.accuracy)
  const wordComparison = processWordComparison()
  const timingDifferences = calculateTimingDifferences()
  const phonemeTimings = processPhonemeTimings()

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl p-8 border-2 ${getAccuracyBg(result.accuracy)}`}
      >
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">{feedback.emoji}</div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            {feedback.title}
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
            {feedback.message}
          </p>
          <div className={`text-7xl font-bold ${getAccuracyColor(result.accuracy)} mb-4`}>
            {result.accuracy}%
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            You said {result.words_correct} out of {result.words_total} words correctly
          </div>
        </div>
      </motion.div>

      {/* Audio Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-slate-900 rounded-2xl p-6 border-2 border-slate-200 dark:border-slate-700"
      >
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <Volume2 className="text-blue-600" size={24} />
          Listen & Compare
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Reference Audio */}
          <div className="border-2 border-blue-300 dark:border-blue-700 rounded-xl p-5 bg-blue-50 dark:bg-blue-900/20">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-slate-900 dark:text-white">Correct Pronunciation</h4>
              <span className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full font-semibold">
                REFERENCE
              </span>
            </div>
            
            <audio
              ref={referenceAudioRef}
              src={referenceAudioPath ? `http://localhost:8000${referenceAudioPath}` : ''}
              onPlay={() => setPlayingReference(true)}
              onPause={() => setPlayingReference(false)}
              onEnded={() => setPlayingReference(false)}
              onTimeUpdate={(e) => {
                const progress = (e.target.currentTime / e.target.duration) * 100
                setReferenceProgress(progress || 0)
              }}
              className="hidden"
            />
            
            <button
              onClick={playReference}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 mb-3"
            >
              {playingReference ? <Pause size={20} /> : <Play size={20} />}
              {playingReference ? 'Pause' : 'Play'} Reference
            </button>
            
            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-100"
                style={{ width: `${referenceProgress}%` }}
              />
            </div>
          </div>

          {/* User Audio */}
          <div className="border-2 border-purple-300 dark:border-purple-700 rounded-xl p-5 bg-purple-50 dark:bg-purple-900/20">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-slate-900 dark:text-white">Your Recording</h4>
              <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                result.accuracy >= 85 ? 'bg-green-600 text-white' :
                result.accuracy >= 70 ? 'bg-yellow-600 text-white' :
                'bg-red-600 text-white'
              }`}>
                {result.accuracy}%
              </span>
            </div>
            
            <audio
              ref={userAudioRef}
              src={userAudioPath ? `http://localhost:8000/${userAudioPath}` : ''}
              onPlay={() => setPlayingUser(true)}
              onPause={() => setPlayingUser(false)}
              onEnded={() => setPlayingUser(false)}
              onTimeUpdate={(e) => {
                const progress = (e.target.currentTime / e.target.duration) * 100
                setUserProgress(progress || 0)
              }}
              className="hidden"
            />
            
            <button
              onClick={playUser}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 mb-3"
            >
              {playingUser ? <Pause size={20} /> : <Play size={20} />}
              {playingUser ? 'Pause' : 'Play'} Your Recording
            </button>
            
            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-600 transition-all duration-100"
                style={{ width: `${userProgress}%` }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* What You Said - Word by Word Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-slate-900 rounded-2xl p-6 border-2 border-slate-200 dark:border-slate-700"
      >
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Target className="text-purple-600" size={24} />
          What You Said - Word by Word
        </h3>
        
        <div className="space-y-4">
          {/* Expected */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
              Expected:
            </div>
            <div className="text-lg font-medium text-slate-900 dark:text-white">
              "{result.expected_text}"
            </div>
          </div>
          
          {/* You Said */}
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
              You said:
            </div>
            <div className="text-lg font-medium text-slate-900 dark:text-white">
              "{result.transcription}"
            </div>
          </div>

          {/* Word-by-Word Breakdown */}
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
            <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">
              Word-by-Word Analysis:
            </div>
            <div className="space-y-2">
              {wordComparison.map((word, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 bg-white dark:bg-slate-900 rounded">
                  {word.status === 'correct' && (
                    <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
                  )}
                  {word.status === 'wrong' && (
                    <XCircle className="text-red-600 flex-shrink-0" size={20} />
                  )}
                  {word.status === 'missing' && (
                    <AlertTriangle className="text-orange-600 flex-shrink-0" size={20} />
                  )}
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Expected:</span>
                      <span className={`font-semibold ${
                        word.status === 'correct' ? 'text-green-600 dark:text-green-400' :
                        word.status === 'wrong' ? 'text-red-600 dark:text-red-400' :
                        'text-orange-600 dark:text-orange-400'
                      }`}>
                        {word.expected || '(none)'}
                      </span>
                      
                      {word.status !== 'correct' && (
                        <>
                          <span className="text-slate-400">→</span>
                          <span className="text-sm text-slate-600 dark:text-slate-400">You said:</span>
                          <span className="font-semibold text-purple-600 dark:text-purple-400">
                            {word.spoken || '(missing)'}
                          </span>
                        </>
                      )}
                    </div>
                    
                    {word.status === 'wrong' && (
                      <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                        ❌ Wrong pronunciation
                      </div>
                    )}
                    {word.status === 'missing' && (
                      <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                        ⚠️ Word not detected
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Word-Level Timing Differences */}
      {timingDifferences.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-slate-900 rounded-2xl p-6 border-2 border-slate-200 dark:border-slate-700"
        >
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Clock className="text-blue-600" size={24} />
            Word-Level Timing Comparison
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-slate-200 dark:border-slate-700">
                  <th className="text-left p-3 font-semibold text-slate-700 dark:text-slate-300">Word</th>
                  <th className="text-center p-3 font-semibold text-blue-600 dark:text-blue-400">Reference Time</th>
                  <th className="text-center p-3 font-semibold text-purple-600 dark:text-purple-400">Your Time</th>
                  <th className="text-center p-3 font-semibold text-orange-600 dark:text-orange-400">Difference</th>
                </tr>
              </thead>
              <tbody>
                {timingDifferences.map((timing, idx) => (
                  <tr key={idx} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800">
                    <td className="p-3 font-medium text-slate-900 dark:text-white">
                      {timing.word}
                    </td>
                    <td className="p-3 text-center text-slate-600 dark:text-slate-400">
                      {timing.refStart !== null ? (
                        <div>
                          <div className="text-xs">{timing.refStart.toFixed(2)}s - {timing.refEnd.toFixed(2)}s</div>
                          <div className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                            ({timing.refDuration.toFixed(2)}s)
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400">N/A</span>
                      )}
                    </td>
                    <td className="p-3 text-center text-slate-600 dark:text-slate-400">
                      <div>
                        <div className="text-xs">{timing.userStart.toFixed(2)}s - {timing.userEnd.toFixed(2)}s</div>
                        <div className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                          ({timing.userDuration.toFixed(2)}s)
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      {timing.difference !== null ? (
                        <span className={`font-semibold ${
                          timing.difference < 0.1 ? 'text-green-600 dark:text-green-400' :
                          timing.difference < 0.3 ? 'text-yellow-600 dark:text-yellow-400' :
                          'text-red-600 dark:text-red-400'
                        }`}>
                          {timing.difference.toFixed(2)}s
                        </span>
                      ) : (
                        <span className="text-slate-400">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Phoneme-Level Timing */}
      {phonemeTimings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-slate-900 rounded-2xl p-6 border-2 border-slate-200 dark:border-slate-700"
        >
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Activity className="text-purple-600" size={24} />
            Phoneme-Level Analysis
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-slate-200 dark:border-slate-700">
                  <th className="text-left p-3 font-semibold text-slate-700 dark:text-slate-300">Phoneme</th>
                  <th className="text-left p-3 font-semibold text-slate-700 dark:text-slate-300">Word</th>
                  <th className="text-center p-3 font-semibold text-slate-700 dark:text-slate-300">Timing</th>
                  <th className="text-center p-3 font-semibold text-slate-700 dark:text-slate-300">Duration</th>
                  <th className="text-center p-3 font-semibold text-slate-700 dark:text-slate-300">Accuracy</th>
                </tr>
              </thead>
              <tbody>
                {phonemeTimings.map((pt, idx) => (
                  <tr key={idx} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800">
                    <td className="p-3 font-mono font-bold text-purple-600 dark:text-purple-400">
                      /{pt.phoneme}/
                    </td>
                    <td className="p-3 text-slate-900 dark:text-white">
                      {pt.word}
                    </td>
                    <td className="p-3 text-center text-xs text-slate-600 dark:text-slate-400">
                      {pt.start.toFixed(3)}s - {pt.end.toFixed(3)}s
                    </td>
                    <td className="p-3 text-center text-slate-600 dark:text-slate-400">
                      {pt.duration.toFixed(3)}s
                    </td>
                    <td className="p-3 text-center">
                      <span className={`font-bold ${
                        pt.accuracy >= 80 ? 'text-green-600 dark:text-green-400' :
                        pt.accuracy >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
                        'text-red-600 dark:text-red-400'
                      }`}>
                        {pt.accuracy}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Areas to Improve */}
      {(result.weak_words?.length > 0 || result.missing_words?.length > 0 || result.weak_phonemes?.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-slate-900 rounded-2xl p-6 border-2 border-slate-200 dark:border-slate-700"
        >
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <TrendingUp className="text-orange-600" size={24} />
            Areas to Improve
          </h3>
          
          {/* Weak Words */}
          {result.weak_words && result.weak_words.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                <AlertTriangle className="text-yellow-600" size={18} />
                Words to Practice
              </h4>
              <div className="flex flex-wrap gap-2">
                {result.weak_words.map((wordInfo, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full font-semibold text-sm"
                  >
                    {typeof wordInfo === 'string' ? wordInfo : wordInfo.word}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Missing Words */}
          {result.missing_words && result.missing_words.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                <XCircle className="text-red-600" size={18} />
                Missing Words (Not Detected)
              </h4>
              <div className="flex flex-wrap gap-2">
                {result.missing_words.map((word, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-full font-semibold text-sm"
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Weak Phonemes */}
          {result.weak_phonemes && result.weak_phonemes.length > 0 && (
            <div>
              <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                <AlertTriangle className="text-purple-600" size={18} />
                Sounds to Practice
              </h4>
              <div className="flex flex-wrap gap-2">
                {result.weak_phonemes.map((phoneme, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full font-mono font-semibold text-sm"
                  >
                    /{phoneme}/
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Simple Feedback */}
      {result.feedback && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 border-2 border-blue-200 dark:border-blue-800"
        >
          <div className="flex items-start gap-3">
            <CheckCircle className="text-blue-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Feedback
              </h3>
              <p className="text-slate-700 dark:text-slate-300">
                {result.feedback}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default SimpleAnalysisResults
