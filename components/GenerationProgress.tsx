import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Loader2, Zap } from 'lucide-react'

interface GenerationProgressProps {
  type: 'business_case' | 'content_strategy' | 'website'
  isGenerating: boolean
}

export default function GenerationProgress({ type, isGenerating }: GenerationProgressProps) {
  const [progress, setProgress] = useState(0)
  const [currentSection, setCurrentSection] = useState(1)

  const sections = {
    business_case: [
      'Core Concept',
      'Market Opportunity',
      'Positioning',
      'Offer Structure',
      'Growth Strategy',
      'Operations',
      'Final Summary',
    ],
    content_strategy: [
      'Hook #1: Framework',
      'Hook #2: Framework',
      'Hook #3: Framework',
    ],
    website: [
      'Analyzing content',
      'Applying template',
      'Generating HTML',
    ],
  }

  const totalSections = sections[type].length
  const estimatedTime = {
    business_case: 30,
    content_strategy: 25,
    website: 45,
  }[type]

  useEffect(() => {
    if (!isGenerating) {
      setProgress(0)
      setCurrentSection(1)
      return
    }

    // Simulate progress based on estimated time
    const totalDuration = estimatedTime * 1000 // Convert to milliseconds
    const sectionDuration = totalDuration / totalSections
    const interval = 100 // Update every 100ms
    const progressPerTick = (100 / (totalDuration / interval))

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(prev + progressPerTick, 95) // Cap at 95% until actually complete
        
        // Update current section based on progress
        const newSection = Math.min(
          Math.floor((next / 100) * totalSections) + 1,
          totalSections
        )
        setCurrentSection(newSection)
        
        return next
      })
    }, interval)

    return () => clearInterval(timer)
  }, [isGenerating, totalSections, estimatedTime])

  // Complete progress when generation finishes
  useEffect(() => {
    if (!isGenerating && progress > 0) {
      setProgress(100)
      setCurrentSection(totalSections)
    }
  }, [isGenerating, progress, totalSections])

  if (!isGenerating && progress === 0) {
    return null
  }

  const timeRemaining = Math.max(0, Math.ceil(estimatedTime * (1 - progress / 100)))

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="glass-effect rounded-lg p-4 border border-mint-400/30"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Loader2 className="animate-spin text-mint-400" size={20} />
          <span className="font-semibold text-sm">Generating...</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Zap size={14} className="text-mint-400" />
          <span>~{timeRemaining}s remaining</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-2 bg-white/10 rounded-full overflow-hidden mb-3">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-mint-400 to-mint-600 rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>

      {/* Current section */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex-1">
          <div className="text-gray-400 mb-1">Current Section</div>
          <div className="text-white font-medium">
            {currentSection}. {sections[type][currentSection - 1] || sections[type][totalSections - 1]}
          </div>
        </div>
        <div className="text-right">
          <div className="text-gray-400 mb-1">Progress</div>
          <div className="text-mint-400 font-bold text-lg">
            {Math.round(progress)}%
          </div>
        </div>
      </div>

      {/* Section indicators */}
      <div className="flex gap-1 mt-3">
        {sections[type].map((_, index) => (
          <div
            key={index}
            className={`flex-1 h-1 rounded-full transition-colors ${
              index + 1 < currentSection
                ? 'bg-mint-400'
                : index + 1 === currentSection
                ? 'bg-mint-400/50'
                : 'bg-white/10'
            }`}
          />
        ))}
      </div>
    </motion.div>
  )
}

