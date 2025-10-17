import { motion } from 'framer-motion'

interface ProgressBarProps {
  current: number
  total: number
  showLabel?: boolean
  className?: string
}

export default function ProgressBar({ current, total, showLabel = true, className = '' }: ProgressBarProps) {
  const percentage = Math.min((current / total) * 100, 100)

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-secondary">
            Step {current} of {total}
          </span>
          <span className="text-sm font-semibold text-accent">{Math.round(percentage)}%</span>
        </div>
      )}
      
      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-accent to-accentAlt rounded-full"
        />
      </div>
    </div>
  )
}

