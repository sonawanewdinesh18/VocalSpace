import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Volume2, Mic, Play, Square, CheckCircle, AlertCircle, Search, Filter } from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar from '../../components/Navbar'

// Comprehensive Phoneme Library Data
const PHONEME_LIBRARY = [
  // VOWELS
  { id: 1, symbol: '/æ/', name: 'Short A', category: 'vowel', difficulty: 'easy', examples: ['cat', 'bat', 'hat', 'mat'], description: 'As in "cat"' },
  { id: 2, symbol: '/eɪ/', name: 'Long A', category: 'vowel', difficulty: 'easy', examples: ['day', 'say', 'play', 'way'], description: 'As in "day"' },
  { id: 3, symbol: '/ɛ/', name: 'Short E', category: 'vowel', difficulty: 'easy', examples: ['bed', 'red', 'said', 'head'], description: 'As in "bed"' },
  { id: 4, symbol: '/iː/', name: 'Long E', category: 'vowel', difficulty: 'easy', examples: ['see', 'bee', 'tree', 'free'], description: 'As in "see"' },
  { id: 5, symbol: '/ɪ/', name: 'Short I', category: 'vowel', difficulty: 'easy', examples: ['sit', 'bit', 'hit', 'fit'], description: 'As in "sit"' },
  { id: 6, symbol: '/aɪ/', name: 'Long I', category: 'vowel', difficulty: 'easy', examples: ['my', 'fly', 'try', 'sky'], description: 'As in "my"' },
  { id: 7, symbol: '/ɒ/', name: 'Short O', category: 'vowel', difficulty: 'easy', examples: ['hot', 'pot', 'not', 'got'], description: 'As in "hot"' },
  { id: 8, symbol: '/oʊ/', name: 'Long O', category: 'vowel', difficulty: 'easy', examples: ['go', 'no', 'so', 'show'], description: 'As in "go"' },
  { id: 9, symbol: '/ʊ/', name: 'Short U', category: 'vowel', difficulty: 'medium', examples: ['put', 'book', 'look', 'good'], description: 'As in "put"' },
  { id: 10, symbol: '/uː/', name: 'Long U', category: 'vowel', difficulty: 'easy', examples: ['blue', 'true', 'you', 'new'], description: 'As in "blue"' },
  { id: 11, symbol: '/ʌ/', name: 'Short U (cup)', category: 'vowel', difficulty: 'medium', examples: ['cup', 'but', 'run', 'sun'], description: 'As in "cup"' },
  { id: 12, symbol: '/ɔː/', name: 'AW Sound', category: 'vowel', difficulty: 'medium', examples: ['saw', 'law', 'draw', 'call'], description: 'As in "saw"' },
  { id: 13, symbol: '/aʊ/', name: 'OW Sound', category: 'vowel', difficulty: 'medium', examples: ['now', 'how', 'cow', 'brown'], description: 'As in "now"' },
  { id: 14, symbol: '/ɔɪ/', name: 'OY Sound', category: 'vowel', difficulty: 'medium', examples: ['boy', 'toy', 'joy', 'coin'], description: 'As in "boy"' },
  { id: 15, symbol: '/ə/', name: 'Schwa', category: 'vowel', difficulty: 'hard', examples: ['about', 'taken', 'pencil', 'lemon'], description: 'Unstressed vowel' },
  
  // CONSONANTS
  { id: 16, symbol: '/b/', name: 'B Sound', category: 'consonant', difficulty: 'easy', examples: ['ball', 'bat', 'big', 'baby'], description: 'As in "ball"' },
  { id: 17, symbol: '/p/', name: 'P Sound', category: 'consonant', difficulty: 'easy', examples: ['pen', 'pot', 'pop', 'paper'], description: 'As in "pen"' },
  { id: 18, symbol: '/d/', name: 'D Sound', category: 'consonant', difficulty: 'easy', examples: ['dog', 'dad', 'day', 'door'], description: 'As in "dog"' },
  { id: 19, symbol: '/t/', name: 'T Sound', category: 'consonant', difficulty: 'easy', examples: ['top', 'tea', 'ten', 'time'], description: 'As in "top"' },
  { id: 20, symbol: '/g/', name: 'G Sound', category: 'consonant', difficulty: 'easy', examples: ['go', 'get', 'big', 'game'], description: 'As in "go"' },
  { id: 21, symbol: '/k/', name: 'K Sound', category: 'consonant', difficulty: 'easy', examples: ['cat', 'key', 'back', 'kite'], description: 'As in "cat"' },
  { id: 22, symbol: '/m/', name: 'M Sound', category: 'consonant', difficulty: 'easy', examples: ['mom', 'man', 'make', 'time'], description: 'As in "mom"' },
  { id: 23, symbol: '/n/', name: 'N Sound', category: 'consonant', difficulty: 'easy', examples: ['no', 'name', 'sun', 'nine'], description: 'As in "no"' },
  { id: 24, symbol: '/ŋ/', name: 'NG Sound', category: 'consonant', difficulty: 'medium', examples: ['sing', 'ring', 'long', 'king'], description: 'As in "sing"' },
  { id: 25, symbol: '/f/', name: 'F Sound', category: 'consonant', difficulty: 'easy', examples: ['fun', 'fish', 'off', 'life'], description: 'As in "fun"' },
  { id: 26, symbol: '/v/', name: 'V Sound', category: 'consonant', difficulty: 'medium', examples: ['van', 'very', 'love', 'five'], description: 'As in "van"' },
  { id: 27, symbol: '/s/', name: 'S Sound', category: 'consonant', difficulty: 'medium', examples: ['sun', 'see', 'bus', 'miss'], description: 'As in "sun"' },
  { id: 28, symbol: '/z/', name: 'Z Sound', category: 'consonant', difficulty: 'medium', examples: ['zoo', 'zip', 'buzz', 'is'], description: 'As in "zoo"' },
  { id: 29, symbol: '/θ/', name: 'TH (voiceless)', category: 'consonant', difficulty: 'hard', examples: ['think', 'bath', 'math', 'three'], description: 'As in "think"' },
  { id: 30, symbol: '/ð/', name: 'TH (voiced)', category: 'consonant', difficulty: 'hard', examples: ['this', 'that', 'the', 'mother'], description: 'As in "this"' },
  { id: 31, symbol: '/ʃ/', name: 'SH Sound', category: 'consonant', difficulty: 'hard', examples: ['she', 'ship', 'fish', 'wash'], description: 'As in "she"' },
  { id: 32, symbol: '/ʒ/', name: 'ZH Sound', category: 'consonant', difficulty: 'hard', examples: ['measure', 'vision', 'beige', 'garage'], description: 'As in "measure"' },
  { id: 33, symbol: '/tʃ/', name: 'CH Sound', category: 'consonant', difficulty: 'medium', examples: ['chair', 'church', 'much', 'watch'], description: 'As in "chair"' },
  { id: 34, symbol: '/dʒ/', name: 'J Sound', category: 'consonant', difficulty: 'medium', examples: ['jump', 'job', 'age', 'bridge'], description: 'As in "jump"' },
  { id: 35, symbol: '/h/', name: 'H Sound', category: 'consonant', difficulty: 'easy', examples: ['hat', 'he', 'hot', 'house'], description: 'As in "hat"' },
  { id: 36, symbol: '/l/', name: 'L Sound', category: 'consonant', difficulty: 'medium', examples: ['let', 'love', 'ball', 'tell'], description: 'As in "let"' },
  { id: 37, symbol: '/r/', name: 'R Sound', category: 'consonant', difficulty: 'hard', examples: ['red', 'run', 'car', 'more'], description: 'As in "red"' },
  { id: 38, symbol: '/w/', name: 'W Sound', category: 'consonant', difficulty: 'easy', examples: ['we', 'win', 'way', 'water'], description: 'As in "we"' },
  { id: 39, symbol: '/j/', name: 'Y Sound', category: 'consonant', difficulty: 'easy', examples: ['yes', 'you', 'yellow', 'year'], description: 'As in "yes"' },
]

const PhonemeLibrary = () => {
  const [phonemes, setPhonemes] = useState(PHONEME_LIBRARY)
  const [filteredPhonemes, setFilteredPhonemes] = useState(PHONEME_LIBRARY)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [playingPhoneme, setPlayingPhoneme] = useState(null)
  const [recordingPhoneme, setRecordingPhoneme] = useState(null)
  const [userProgress, setUserProgress] = useState({})
  
  const audioRef = useRef(null)
  
  // Filter phonemes
  useEffect(() => {
    let filtered = PHONEME_LIBRARY
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory)
    }
    
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(p => p.difficulty === selectedDifficulty)
    }
    
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.examples.some(ex => ex.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }
    
    setFilteredPhonemes(filtered)
  }, [selectedCategory, selectedDifficulty, searchQuery])
  
  // Group phonemes by first letter
  const groupedPhonemes = filteredPhonemes.reduce((acc, phoneme) => {
    const firstLetter = phoneme.name[0].toUpperCase()
    if (!acc[firstLetter]) {
      acc[firstLetter] = []
    }
    acc[firstLetter].push(phoneme)
    return acc
  }, {})
  
  const playPhoneme = (phoneme) => {
    // In production, this would play actual audio file
    setPlayingPhoneme(phoneme.id)
    toast.success(`Playing: ${phoneme.name}`)
    setTimeout(() => setPlayingPhoneme(null), 2000)
  }
  
  const startPractice = (phoneme) => {
    setRecordingPhoneme(phoneme.id)
    toast.info(`Practice mode: ${phoneme.name}`)
  }
  
  const stopPractice = () => {
    setRecordingPhoneme(null)
    toast.success('Practice complete!')
  }
  
  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] py-24 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4">
              🔤 Phoneme Library
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Master all speech sounds with guided practice and feedback
            </p>
          </motion.div>
          
          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-[#131722] rounded-3xl shadow-2xl p-6 mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search phonemes or examples..."
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              
              {/* Category Filter */}
              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="all">All Types</option>
                  <option value="vowel">Vowels</option>
                  <option value="consonant">Consonants</option>
                </select>
              </div>
              
              {/* Difficulty Filter */}
              <div>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="all">All Levels</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>
            
            {/* Stats */}
            <div className="mt-6 flex items-center justify-center gap-8 text-sm">
              <div className="text-slate-600 dark:text-slate-400">
                <span className="font-bold text-slate-900 dark:text-white">{filteredPhonemes.length}</span> phonemes
              </div>
              <div className="text-slate-600 dark:text-slate-400">
                <span className="font-bold text-green-600">{filteredPhonemes.filter(p => p.difficulty === 'easy').length}</span> easy
              </div>
              <div className="text-slate-600 dark:text-slate-400">
                <span className="font-bold text-yellow-600">{filteredPhonemes.filter(p => p.difficulty === 'medium').length}</span> medium
              </div>
              <div className="text-slate-600 dark:text-slate-400">
                <span className="font-bold text-red-600">{filteredPhonemes.filter(p => p.difficulty === 'hard').length}</span> hard
              </div>
            </div>
          </motion.div>
          
          {/* Phoneme List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            {Object.keys(groupedPhonemes).sort().map((letter) => (
              <div key={letter}>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                  <span className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white">
                    {letter}
                  </span>
                  <span>{letter}</span>
                </h2>
                
                <div className="grid grid-cols-1 gap-4">
                  {groupedPhonemes[letter].map((phoneme) => (
                    <PhonemeCard
                      key={phoneme.id}
                      phoneme={phoneme}
                      isPlaying={playingPhoneme === phoneme.id}
                      isRecording={recordingPhoneme === phoneme.id}
                      onPlay={() => playPhoneme(phoneme)}
                      onPractice={() => startPractice(phoneme)}
                      onStopPractice={stopPractice}
                      progress={userProgress[phoneme.id] || 0}
                    />
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
          
          {filteredPhonemes.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-600 dark:text-slate-400 text-lg">
                No phonemes found matching your filters
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// Phoneme Card Component
const PhonemeCard = ({ phoneme, isPlaying, isRecording, onPlay, onPractice, onStopPractice, progress }) => {
  const difficultyColors = {
    easy: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    medium: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
    hard: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
  }
  
  const categoryColors = {
    vowel: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    consonant: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-[#131722] rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl font-bold text-slate-900 dark:text-white">
              {phoneme.symbol}
            </span>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {phoneme.name}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {phoneme.description}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-3">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${categoryColors[phoneme.category]}`}>
              {phoneme.category}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${difficultyColors[phoneme.difficulty]}`}>
              {phoneme.difficulty}
            </span>
          </div>
          
          <div className="mb-3">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Example Words:
            </p>
            <div className="flex flex-wrap gap-2">
              {phoneme.examples.map((example, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-slate-100 dark:bg-slate-900/50 rounded-lg text-sm font-medium text-slate-900 dark:text-white"
                >
                  {example}
                </span>
              ))}
            </div>
          </div>
          
          {progress > 0 && (
            <div className="mb-3">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-slate-600 dark:text-slate-400">Your Progress</span>
                <span className="font-bold text-slate-900 dark:text-white">{progress}%</span>
              </div>
              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <button
          onClick={onPlay}
          disabled={isPlaying}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Volume2 size={20} />
          {isPlaying ? 'Playing...' : 'Listen'}
        </button>
        
        {!isRecording ? (
          <button
            onClick={onPractice}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Mic size={20} />
            Practice
          </button>
        ) : (
          <button
            onClick={onStopPractice}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 animate-pulse"
          >
            <Square size={20} />
            Stop
          </button>
        )}
      </div>
    </motion.div>
  )
}

export default PhonemeLibrary
