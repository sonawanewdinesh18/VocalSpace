import { CheckCircle, XCircle, AlertTriangle, ArrowRight } from 'lucide-react'

const WordLevelComparison = ({ result }) => {
  const { expected_text, transcription, word_analysis, missing_words, weak_words } = result
  
  // Parse expected and transcribed text
  const expectedWords = expected_text?.toLowerCase().split(/\s+/) || []
  const transcribedWords = transcription?.toLowerCase().split(/\s+/) || []
  
  // Build word comparison data
  const buildWordComparison = () => {
    const comparison = []
    const missingSet = new Set(missing_words || [])
    const weakWordsMap = {}
    
    // Build weak words map
    if (weak_words) {
      weak_words.forEach(w => {
        const word = typeof w === 'string' ? w : w.word
        weakWordsMap[word] = w
      })
    }
    
    // Use word_analysis if available
    if (word_analysis) {
      const correctWords = word_analysis.correct_words || []
      const substitutions = word_analysis.substitutions || []
      const incorrectWords = word_analysis.incorrect_words || []
      
      expectedWords.forEach((word, idx) => {
        const isCorrect = correctWords.some(cw => 
          (typeof cw === 'string' ? cw : cw.word) === word
        )
        const isMissing = missingSet.has(word)
        const isWeak = weakWordsMap[word]
        const substitution = substitutions.find(s => s.expected === word)
        
        comparison.push({
          expected: word,
          spoken: substitution ? substitution.spoken : (isCorrect || isWeak ? word : '—'),
          status: isMissing ? 'missing' : 
                  substitution ? 'substituted' :
                  isWeak ? 'weak' :
                  isCorrect ? 'correct' : 'incorrect',
          confidence: substitution?.confidence || (isCorrect ? 0.9 : 0.5),
          accuracy: isWeak ? (typeof isWeak === 'object' ? isWeak.accuracy : 50) : 
                   (isCorrect ? 100 : 0)
        })
      })
    } else {
      // Fallback: simple comparison
      expectedWords.forEach((word, idx) => {
        const isMissing = missingSet.has(word)
        const isWeak = weakWordsMap[word]
        const spoken = transcribedWords[idx] || '—'
        const isCorrect = word === spoken && !isMissing && !isWeak
        
        comparison.push({
          expected: word,
          spoken: isMissing ? '—' : spoken,
          status: isMissing ? 'missing' :
                  isWeak ? 'weak' :
                  isCorrect ? 'correct' : 'substituted',
          confidence: isCorrect ? 0.9 : 0.5,
          accuracy: isWeak ? (typeof isWeak === 'object' ? isWeak.accuracy : 50) : 
                   (isCorrect ? 100 : 0)
        })
      })
    }
    
    return comparison
  }
  
  const wordComparison = buildWordComparison()
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'correct':
        return 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
      case 'weak':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700'
      case 'substituted':
        return 'bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700'
      case 'missing':
        return 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
      default:
        return 'bg-slate-50 dark:bg-slate-900/20 border-slate-300 dark:border-slate-700'
    }
  }
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'correct':
        return <CheckCircle className="text-green-600" size={20} />
      case 'weak':
        return <AlertTriangle className="text-yellow-600" size={20} />
      case 'substituted':
      case 'missing':
        return <XCircle className="text-red-600" size={20} />
      default:
        return <AlertTriangle className="text-slate-600" size={20} />
    }
  }
  
  const getStatusLabel = (status) => {
    switch (status) {
      case 'correct':
        return 'Correct'
      case 'weak':
        return 'Needs Practice'
      case 'substituted':
        return 'Substituted'
      case 'missing':
        return 'Missing'
      default:
        return 'Unknown'
    }
  }
  
  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
          <div className="text-xs text-green-700 dark:text-green-300 mb-1">Correct</div>
          <div className="text-2xl font-bold text-green-600">
            {wordComparison.filter(w => w.status === 'correct').length}
          </div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 border border-yellow-200 dark:border-yellow-800">
          <div className="text-xs text-yellow-700 dark:text-yellow-300 mb-1">Weak</div>
          <div className="text-2xl font-bold text-yellow-600">
            {wordComparison.filter(w => w.status === 'weak').length}
          </div>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 border border-orange-200 dark:border-orange-800">
          <div className="text-xs text-orange-700 dark:text-orange-300 mb-1">Substituted</div>
          <div className="text-2xl font-bold text-orange-600">
            {wordComparison.filter(w => w.status === 'substituted').length}
          </div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 border border-red-200 dark:border-red-800">
          <div className="text-xs text-red-700 dark:text-red-300 mb-1">Missing</div>
          <div className="text-2xl font-bold text-red-600">
            {wordComparison.filter(w => w.status === 'missing').length}
          </div>
        </div>
      </div>
      
      {/* Word-by-Word Comparison */}
      <div className="space-y-3">
        {wordComparison.map((word, idx) => (
          <div
            key={idx}
            className={`border-2 rounded-xl p-4 transition-all ${getStatusColor(word.status)}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                {getStatusIcon(word.status)}
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Word #{idx + 1}
                </span>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                word.status === 'correct' ? 'bg-green-600 text-white' :
                word.status === 'weak' ? 'bg-yellow-600 text-white' :
                'bg-red-600 text-white'
              }`}>
                {getStatusLabel(word.status)}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              {/* Expected */}
              <div className="bg-white dark:bg-slate-900 rounded-lg p-3">
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Expected</div>
                <div className="text-xl font-bold text-slate-900 dark:text-white font-mono">
                  "{word.expected}"
                </div>
              </div>
              
              {/* Arrow */}
              <div className="flex justify-center">
                <ArrowRight className="text-slate-400" size={24} />
              </div>
              
              {/* Spoken */}
              <div className={`rounded-lg p-3 ${
                word.status === 'correct' ? 'bg-green-100 dark:bg-green-900/30' :
                word.status === 'weak' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                'bg-red-100 dark:bg-red-900/30'
              }`}>
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">You Said</div>
                <div className={`text-xl font-bold font-mono ${
                  word.status === 'correct' ? 'text-green-700 dark:text-green-300' :
                  word.status === 'weak' ? 'text-yellow-700 dark:text-yellow-300' :
                  'text-red-700 dark:text-red-300'
                }`}>
                  "{word.spoken}"
                </div>
              </div>
            </div>
            
            {/* Accuracy Bar */}
            {word.status !== 'missing' && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                  <span>Pronunciation Accuracy</span>
                  <span className="font-bold">{word.accuracy}%</span>
                </div>
                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      word.accuracy >= 80 ? 'bg-green-600' :
                      word.accuracy >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                    }`}
                    style={{ width: `${word.accuracy}%` }}
                  />
                </div>
              </div>
            )}
            
            {/* Feedback */}
            {word.status === 'substituted' && (
              <div className="mt-3 text-sm text-orange-700 dark:text-orange-300 bg-orange-100 dark:bg-orange-900/30 rounded-lg p-2">
                💡 You said "{word.spoken}" instead of "{word.expected}". Practice this word slowly.
              </div>
            )}
            {word.status === 'missing' && (
              <div className="mt-3 text-sm text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30 rounded-lg p-2">
                ⚠️ This word was not detected in your recording. Make sure to pronounce it clearly.
              </div>
            )}
            {word.status === 'weak' && (
              <div className="mt-3 text-sm text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg p-2">
                📚 Your pronunciation needs improvement. Practice this word more.
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default WordLevelComparison
