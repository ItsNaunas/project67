import { motion } from 'framer-motion'
import { CheckCircle2, Circle } from 'lucide-react'

interface QuickStartChecklistProps {
  hasBusinessCase: boolean
  hasContentStrategy: boolean
  hasWebsiteTemplate: boolean
  hasPurchased: boolean
  className?: string
}

export default function QuickStartChecklist({
  hasBusinessCase,
  hasContentStrategy,
  hasWebsiteTemplate,
  hasPurchased,
  className = '',
}: QuickStartChecklistProps) {
  const steps = [
    {
      id: 1,
      label: 'Generate your business case',
      completed: hasBusinessCase,
    },
    {
      id: 2,
      label: 'Get your content strategy',
      completed: hasContentStrategy,
    },
    {
      id: 3,
      label: 'Choose a website template',
      completed: hasWebsiteTemplate,
    },
    {
      id: 4,
      label: 'Unlock full access',
      completed: hasPurchased,
    },
  ]

  const completedCount = steps.filter((step) => step.completed).length
  const allComplete = completedCount === steps.length

  return (
    <div className={`glass-effect rounded-xl p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">Quick Start Checklist</h3>
        <span className="text-sm text-gray-400">
          {completedCount}/{steps.length} Complete
        </span>
      </div>

      {allComplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-4 p-3 bg-mint-400/10 border border-mint-400/30 rounded-lg"
        >
          <p className="text-sm text-mint-400 font-semibold">
            🎉 You're all set! Start building your empire.
          </p>
        </motion.div>
      )}

      <div className="space-y-3">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-3"
          >
            {step.completed ? (
              <CheckCircle2 className="text-green-500 flex-shrink-0" size={20} />
            ) : (
              <Circle className="text-gray-600 flex-shrink-0" size={20} />
            )}
            <span
              className={`text-sm ${
                step.completed ? 'text-gray-400 line-through' : 'text-white'
              }`}
            >
              {step.label}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="mt-6">
        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
          <motion.div
            className="bg-gradient-to-r from-mint-400 to-mint-600 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(completedCount / steps.length) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>
    </div>
  )
}

