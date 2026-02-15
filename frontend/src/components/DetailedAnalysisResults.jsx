import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Play, Pause, Volume2, CheckCircle, XCircle, AlertTriangle,
  Clock, Target, TrendingUp, Info, ChevronDown, ChevronUp, Activity,
  BarChart3, Radio
} from 'lucide-react'
import IntelligentFeedback from './IntelligentFeedback'
import WordLevelComparison from './WordLevelComparison'

const DetailedAnalysisResults = ({ result, referenceAudioPath, userAudioPath }) => {
  const [playingReference, setPlayingReference] = useState(false)
  const [playingUser, setPlayingUser] = useState(false)
  const [referenceProgress, setReferenceProgress] = useState(0)
  const [userProgress, setUserProgress] = useState(0)
  const [expandedSections, setExpandedSections] = useState({
    audioComparison: true,
    wordComparison: true,
    wordTiming: true,
    phonemeTiming: true,
    audioSlicing: true,
    practiceExercises: true
  })
  
  const referenceAudioRef = useRef(null)
  const userAudioRef = useRef(null)

  // Process phoneme timings - group by word
  const processPhonemeTimings = () => {
    if (!result.phoneme_timings || result.phoneme_timings.length === 0) {
      return []
    }

    // Group phonemes by word
    const wordGroups = {}
    result.phoneme_timings.forEach(pt => {
      if (!wordGroups[pt.word]) {
        wordGroups[pt.word] = {
          word: pt.word,
          phonemes: []
        }
      }
      
      // Find the score for this phoneme from phoneme_results
      const phonemeResult = result.phoneme_results?.find(
        pr => pr.phoneme === pt.phoneme && pr.word === pt.word && pr.start === pt.start
      )
      
      wordGroups[pt.word].phonemes.push({
        phoneme: pt.phoneme,
        start: pt.start,
        end: pt.end,
        accuracy: phonemeResult ? Math.round(phonemeResult.score) : 0
      })
    })

    return Object.values(wordGroups)
  }

  const phonemeTimingsByWord = processPhonemeTimings()

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }
  
  // Audio playback handlers
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
  
  // Sync both audios
  const playSyncedComparison = () => {
    if (referenceAudioRef.current && userAudioRef.current) {
      referenceAudioRef.current.currentTime = 0
      userAudioRef.current.currentTime = 0
      referenceAudioRef.current.play()
      userAudioRef.current.play()
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

  return (
    <div className="space-y-6">
      {/* Overall Score Header */}
      <div className={`rounded-2xl p-6 border-2 ${getAccuracyBg(result.accuracy)}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Target size={28} />
            Analysis Results
          </h2>
          <div className={`text-5xl font-bold ${getAccuracyColor(result.accuracy)}`}>
            {result.accuracy}%
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Words Correct</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {result.words_correct}/{result.words_total}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Duration</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {result.duration}s
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Pronunciation</div>
            <div className={`text-2xl font-bold ${getAccuracyColor(result.pronunciation_score || result.accuracy)}`}>
              {result.pronunciation_score || result.accuracy}%
            </div>
          </div>
        </div>
      </div>

      {/* Intelligent Feedback Section */}
      {result.intelligent_feedback && (
        <IntelligentFeedback feedback={result.intelligent_feedback} />
      )}

      {/* Professional Audio Comparison Section */}
      <CollapsibleSection
        title="🎧 Audio Comparison - Reference vs Your Recording"
        icon={<Radio size={20} />}
        expanded={expandedSections.audioComparison}
        onToggle={() => toggleSection('audioComparison')}
        highlight={true}
      >
        <div className="space-y-6">
          {/* Sync Play Button */}
          <div className="flex justify-center">
            <button
              onClick={playSyncedComparison}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 flex items-center gap-3 shadow-lg"
            >
              <Play size={24} />
              Play Both Together (Synced)
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Reference Audio */}
            <div className="border-2 border-blue-300 dark:border-blue-700 rounded-xl p-5 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Volume2 className="text-blue-600" size={24} />
                  Reference Audio
                </h3>
                <span className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full font-semibold">
                  CORRECT
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
              
              <div className="space-y-3">
                <button
                  onClick={playReference}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
                >
                  {playingReference ? <Pause size={20} /> : <Play size={20} />}
                  {playingReference ? 'Pause' : 'Play'} Reference
                </button>
                
                <div className="bg-white dark:bg-slate-900 rounded-lg p-3">
                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-2">
                    <span>Progress</span>
                    <span>{Math.round(referenceProgress)}%</span>
                  </div>
                  <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-100"
                      style={{ width: `${referenceProgress}%` }}
                    />
                  </div>
                </div>
                
                <p className="text-sm text-slate-600 dark:text-slate-400 text-center italic">
                  Listen to the correct pronunciation
                </p>
              </div>
            </div>

            {/* User Audio */}
            <div className="border-2 border-purple-300 dark:border-purple-700 rounded-xl p-5 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Volume2 className="text-purple-600" size={24} />
                  Your Recording
                </h3>
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
              
              <div className="space-y-3">
                <button
                  onClick={playUser}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
                >
                  {playingUser ? <Pause size={20} /> : <Play size={20} />}
                  {playingUser ? 'Pause' : 'Play'} Your Recording
                </button>
                
                <div className="bg-white dark:bg-slate-900 rounded-lg p-3">
                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-2">
                    <span>Progress</span>
                    <span>{Math.round(userProgress)}%</span>
                  </div>
                  <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-600 transition-all duration-100"
                      style={{ width: `${userProgress}%` }}
                    />
                  </div>
                </div>
                
                <p className="text-sm text-slate-600 dark:text-slate-400 text-center italic">
                  Compare with the reference above
                </p>
              </div>
            </div>
          </div>
          
          {/* Comparison Metrics */}
          {result.dtw_similarity !== undefined && (
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
              <h4 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <BarChart3 size={20} className="text-indigo-600" />
                Audio Similarity Analysis
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-900 rounded-lg p-4 text-center">
                  <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">DTW Similarity</div>
                  <div className={`text-3xl font-bold ${
                    result.dtw_similarity >= 80 ? 'text-green-600' :
                    result.dtw_similarity >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {Math.round(result.dtw_similarity)}%
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-lg p-4 text-center">
                  <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">ASR Confidence</div>
                  <div className={`text-3xl font-bold ${
                    result.asr_confidence >= 80 ? 'text-green-600' :
                    result.asr_confidence >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {Math.round(result.asr_confidence)}%
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-lg p-4 text-center">
                  <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">Pronunciation</div>
                  <div className={`text-3xl font-bold ${
                    result.pronunciation_score >= 80 ? 'text-green-600' :
                    result.pronunciation_score >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {result.pronunciation_score || result.accuracy}%
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Word-Level Comparison - NEW PROFESSIONAL DISPLAY */}
      <CollapsibleSection
        title="📝 Word-by-Word Comparison - What You Said vs Expected"
        icon={<Target size={20} />}
        expanded={expandedSections.wordComparison}
        onToggle={() => toggleSection('wordComparison')}
        highlight={true}
      >
        <WordLevelComparison result={result} />
      </CollapsibleSection>

      {/* Word-Level Timing */}
      <CollapsibleSection
        title="Word-Level Timing"
        icon={<Clock size={20} />}
        expanded={expandedSections.wordTiming}
        onToggle={() => toggleSection('wordTiming')}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Reference Timing */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Reference Timing
            </h4>
            {result.word_timings_reference?.map((word, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <span className="font-mono text-slate-900 dark:text-white">{word.word}</span>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  → {word.start.toFixed(2)}s - {word.end.toFixed(2)}s
                </span>
              </div>
            )) || (
              <div className="text-sm text-slate-500 dark:text-slate-400 italic">
                Timing data not available
              </div>
            )}
          </div>

          {/* User Timing */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-3">
              User Timing
            </h4>
            {result.word_timings?.map((word, idx) => (
              <div 
                key={idx} 
                className={`flex items-center justify-between p-3 rounded-lg ${
                  word.correct 
                    ? 'bg-green-50 dark:bg-green-900/20' 
                    : 'bg-red-50 dark:bg-red-900/20'
                }`}
              >
                <div className="flex items-center gap-2">
                  {word.correct ? (
                    <CheckCircle className="text-green-600" size={16} />
                  ) : (
                    <XCircle className="text-red-600" size={16} />
                  )}
                  <span className="font-mono text-slate-900 dark:text-white">{word.word}</span>
                </div>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  → {word.start.toFixed(2)}s - {word.end.toFixed(2)}s
                </span>
              </div>
            )) || (
              <div className="text-sm text-slate-500 dark:text-slate-400 italic">
                Timing data not available
              </div>
            )}
          </div>
        </div>
      </CollapsibleSection>

      {/* Phoneme-Level Timing */}
      <CollapsibleSection
        title="Phoneme-Level Timing (Inside Words)"
        icon={<Target size={20} />}
        expanded={expandedSections.phonemeTiming}
        onToggle={() => toggleSection('phonemeTiming')}
      >
        {phonemeTimingsByWord && phonemeTimingsByWord.length > 0 ? (
          <div className="space-y-4">
            {phonemeTimingsByWord.map((wordData, idx) => (
              <div key={idx} className="border-2 border-slate-200 dark:border-slate-700 rounded-xl p-4">
                <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-3">
                  Word: "{wordData.word}"
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {wordData.phonemes?.map((phoneme, pIdx) => (
                    <div 
                      key={pIdx}
                      className={`p-3 rounded-lg ${
                        phoneme.accuracy >= 80 
                          ? 'bg-green-50 dark:bg-green-900/20' 
                          : phoneme.accuracy >= 60
                          ? 'bg-yellow-50 dark:bg-yellow-900/20'
                          : 'bg-red-50 dark:bg-red-900/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          /{phoneme.phoneme}/
                        </span>
                        <span className={`font-bold ${
                          phoneme.accuracy >= 80 ? 'text-green-600' :
                          phoneme.accuracy >= 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {phoneme.accuracy}%
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        {phoneme.start.toFixed(3)}s - {phoneme.end.toFixed(3)}s
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            <Info size={48} className="mx-auto mb-3 opacity-50" />
            <p>Phoneme-level timing data not available for this recording</p>
          </div>
        )}
      </CollapsibleSection>

      {/* Missing Words */}
      {result.missing_words && result.missing_words.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-6 border-2 border-red-200 dark:border-red-800">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="text-red-600" size={20} />
            Missing Words
          </h3>
          <div className="bg-white dark:bg-slate-900 rounded-xl p-4 mb-4">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
              Reference audio shows <strong>NONE</strong> because it's the reference audio and doesn't miss any words.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {result.missing_words.map((word, idx) => (
              <span
                key={idx}
                className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full font-semibold"
              >
                {word}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Audio-Level Slicing & ASR Output */}
      <CollapsibleSection
        title="Audio-Level Slicing & ASR Analysis"
        icon={<TrendingUp size={20} />}
        expanded={expandedSections.audioSlicing}
        onToggle={() => toggleSection('audioSlicing')}
      >
        {result.word_analysis && result.word_analysis.length > 0 ? (
          <div className="space-y-4">
            {result.word_analysis.map((wordData, idx) => (
              <div key={idx} className="border-2 border-slate-200 dark:border-slate-700 rounded-xl p-5">
                <div className="mb-4">
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    User says: "{wordData.expected_word}"
                  </h4>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-600 dark:text-slate-400">→ pronounced as</span>
                    <span className="font-bold text-purple-600 dark:text-purple-400">
                      "{wordData.spoken_as || wordData.transcribed}"
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 mb-4">
                  <h5 className="font-semibold text-slate-700 dark:text-slate-300 mb-3">
                    ASR Output:
                  </h5>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-lg text-slate-900 dark:text-white">
                      "{wordData.transcribed || wordData.spoken_as}"
                    </span>
                    {wordData.word_correct ? (
                      <CheckCircle className="text-green-600" size={24} />
                    ) : (
                      <XCircle className="text-red-600" size={24} />
                    )}
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        But pronunciation is
                      </span>
                      {wordData.pronunciation_correct ? (
                        <span className="flex items-center gap-1 text-green-600 font-bold">
                          <CheckCircle size={18} /> correct
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-600 font-bold">
                          <XCircle size={18} /> wrong
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Pronunciation Details */}
                {!wordData.pronunciation_correct && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                    <h5 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2 flex items-center gap-2">
                      <AlertTriangle size={18} />
                      Pronunciation Issues:
                    </h5>
                    <ul className="list-disc list-inside space-y-1 text-sm text-slate-700 dark:text-slate-300">
                      {wordData.issues?.map((issue, iIdx) => (
                        <li key={iIdx}>{issue}</li>
                      )) || (
                        <>
                          <li>Phoneme accuracy: {wordData.phoneme_accuracy || 'N/A'}%</li>
                          <li>Similarity score: {wordData.similarity || 'N/A'}%</li>
                          {wordData.weak_phonemes && (
                            <li>Weak phonemes: {wordData.weak_phonemes.join(', ')}</li>
                          )}
                        </>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            <Info size={48} className="mx-auto mb-3 opacity-50" />
            <p>Detailed word analysis not available for this recording</p>
          </div>
        )}
      </CollapsibleSection>

      {/* Practice Exercises for Mistakes */}
      <CollapsibleSection
        title="Practice Exercises for Your Mistakes"
        icon={<Target size={20} />}
        expanded={expandedSections.practiceExercises}
        onToggle={() => toggleSection('practiceExercises')}
        highlight={true}
      >
        <PracticeExercises result={result} />
      </CollapsibleSection>
    </div>
  )
}

// Collapsible Section Component
const CollapsibleSection = ({ title, icon, expanded, onToggle, children, highlight = false }) => (
  <div className={`rounded-2xl border-2 overflow-hidden ${
    highlight 
      ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/10' 
      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
  }`}>
    <button
      onClick={onToggle}
      className="w-full p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className={highlight ? 'text-green-600' : 'text-blue-600'}>
          {icon}
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          {title}
        </h3>
      </div>
      {expanded ? (
        <ChevronUp className="text-slate-600 dark:text-slate-400" size={24} />
      ) : (
        <ChevronDown className="text-slate-600 dark:text-slate-400" size={24} />
      )}
    </button>
    {expanded && (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="p-5 pt-0"
      >
        {children}
      </motion.div>
    )}
  </div>
)

// Practice Exercises Component
const PracticeExercises = ({ result }) => {
  const exercises = generatePracticeExercises(result)

  if (exercises.length === 0) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="mx-auto mb-3 text-green-600" size={48} />
        <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          Excellent Work!
        </h4>
        <p className="text-slate-600 dark:text-slate-400">
          No major issues detected. Keep practicing to maintain your skills!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {exercises.map((exercise, idx) => (
        <div key={idx} className="border-2 border-green-200 dark:border-green-800 rounded-xl p-5 bg-white dark:bg-slate-900">
          <div className="flex items-start gap-3 mb-4">
            <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
              {idx + 1}
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                {exercise.title}
              </h4>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                {exercise.description}
              </p>
            </div>
          </div>

          {/* Practice Sentences */}
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-4">
            <h5 className="font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Practice Sentences:
            </h5>
            <div className="space-y-2">
              {exercise.sentences.map((sentence, sIdx) => (
                <div key={sIdx} className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  <span className="text-slate-900 dark:text-white">{sentence}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          {exercise.tips && exercise.tips.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h5 className="font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                <Info size={18} className="text-blue-600" />
                Tips:
              </h5>
              <ul className="space-y-2">
                {exercise.tips.map((tip, tIdx) => (
                  <li key={tIdx} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <span className="text-blue-600">→</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// Generate Practice Exercises based on mistakes
const generatePracticeExercises = (result) => {
  const exercises = []

  // Exercise for weak words
  if (result.weak_words && result.weak_words.length > 0) {
    const weakWords = result.weak_words.slice(0, 3)
    exercises.push({
      title: `Practice Difficult Words: ${weakWords.map(w => typeof w === 'string' ? w : w.word).join(', ')}`,
      description: 'These words need more practice. Focus on clear pronunciation and proper enunciation.',
      sentences: weakWords.map(wordInfo => {
        const word = typeof wordInfo === 'string' ? wordInfo : wordInfo.word
        return `The word "${word}" should be pronounced clearly and slowly.`
      }).concat([
        `Practice saying: ${weakWords.map(w => typeof w === 'string' ? w : w.word).join(', ')} - one at a time.`,
        `Now try in a sentence: I will practice ${weakWords.map(w => typeof w === 'string' ? w : w.word)[0]} every day.`
      ]),
      tips: [
        'Say each word slowly, focusing on each sound',
        'Record yourself and compare with the reference',
        'Practice 5 times daily for best results',
        'Break the word into syllables if needed'
      ]
    })
  }

  // Exercise for weak phonemes
  if (result.weak_phonemes && result.weak_phonemes.length > 0) {
    const phonemeExercises = {
      's': {
        sentences: [
          'Sally sells seashells by the seashore.',
          'Six slippery snails slid slowly seaward.',
          'She sees cheese and says please.'
        ],
        tips: [
          'Place tongue behind upper teeth',
          'Let air flow through the gap',
          'Keep sound continuous and smooth'
        ]
      },
      'r': {
        sentences: [
          'The red rabbit ran rapidly around the roses.',
          'Robert rides a really rough road regularly.',
          'Three red roses are really rare.'
        ],
        tips: [
          'Curl tongue slightly back',
          'Don\'t let tongue touch roof of mouth',
          'Make sound from throat, not lips'
        ]
      },
      'th': {
        sentences: [
          'Three thick things think together thoroughly.',
          'The thoughtful therapist thinks things through.',
          'Thirty-three thousand thoughtful thinkers.'
        ],
        tips: [
          'Place tongue between teeth',
          'Blow air gently over tongue',
          'Don\'t bite down on tongue'
        ]
      },
      'l': {
        sentences: [
          'Little Lucy loves lollipops and lemonade.',
          'Larry\'s llama likes to lick lemons.',
          'Lovely lilies bloom in the light.'
        ],
        tips: [
          'Touch tongue to roof of mouth',
          'Let air flow around sides of tongue',
          'Keep sound smooth and flowing'
        ]
      },
      'sh': {
        sentences: [
          'She sells fresh fish at the fish shop.',
          'Shelly should share her shiny shoes.',
          'The shy sheep showed sharp shapes.'
        ],
        tips: [
          'Round lips slightly',
          'Push air through narrow opening',
          'Sound should be soft and continuous'
        ]
      }
    }

    result.weak_phonemes.slice(0, 2).forEach(phoneme => {
      const exerciseData = phonemeExercises[phoneme.toLowerCase()] || {
        sentences: [
          `Practice the /${phoneme}/ sound slowly and clearly.`,
          `Say /${phoneme}/ five times: ${phoneme}, ${phoneme}, ${phoneme}, ${phoneme}, ${phoneme}.`,
          `Now use it in words that contain the /${phoneme}/ sound.`
        ],
        tips: [
          'Focus on tongue and lip position',
          'Practice in front of a mirror',
          'Record and compare with native speakers'
        ]
      }

      exercises.push({
        title: `Master the /${phoneme}/ Sound`,
        description: `The /${phoneme}/ sound needs improvement. Practice these exercises daily.`,
        sentences: exerciseData.sentences,
        tips: exerciseData.tips
      })
    })
  }

  // Exercise for missing words
  if (result.missing_words && result.missing_words.length > 0) {
    exercises.push({
      title: 'Complete Sentence Practice',
      description: 'You missed some words. Practice saying the complete sentence without skipping.',
      sentences: [
        `Make sure to say ALL words: ${result.missing_words.join(', ')}`,
        'Read the sentence slowly, word by word.',
        'Pause briefly between words if needed.',
        'Gradually increase speed while maintaining clarity.'
      ],
      tips: [
        'Read the sentence silently first',
        'Identify each word before speaking',
        'Don\'t rush - accuracy over speed',
        'Practice with a metronome for rhythm'
      ]
    })
  }

  // General improvement exercise
  if (result.accuracy < 80) {
    exercises.push({
      title: 'Overall Pronunciation Improvement',
      description: 'General exercises to improve your overall pronunciation and clarity.',
      sentences: [
        'Practice reading aloud for 10 minutes daily.',
        'Record yourself and listen for mistakes.',
        'Repeat difficult sentences 5 times each.',
        'Focus on speaking slowly and clearly.'
      ],
      tips: [
        'Warm up your voice before practice',
        'Stay hydrated for better voice quality',
        'Practice in a quiet environment',
        'Be patient - improvement takes time',
        'Celebrate small victories'
      ]
    })
  }

  return exercises
}

export default DetailedAnalysisResults
