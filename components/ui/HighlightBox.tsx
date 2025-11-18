import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface HighlightBoxProps {
  title?: string
  children: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'info'
  className?: string
}

export default function HighlightBox({ 
  title, 
  children, 
  variant = 'default',
  className = '' 
}: HighlightBoxProps) {
  const variantStyles = {
    default: 'bg-mint-400/10 border-mint-400/30 text-mint-400',
    success: 'bg-green-500/10 border-green-500/30 text-green-400',
    warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${variantStyles[variant]} border rounded-xl p-6 my-8 ${className}`}
    >
      {title && (
        <h4 className={`font-bold text-lg mb-3 ${variantStyles[variant].split(' ')[2]}`}>
          {title}
        </h4>
      )}
      <div className="text-gray-300 leading-relaxed">
        {children}
      </div>
    </motion.div>
  )
}

