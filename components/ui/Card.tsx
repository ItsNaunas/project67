import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  glow?: boolean
}

export default function Card({ children, className = '', hover = false, glow = false }: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { scale: 1.02, y: -4 } : {}}
      className={`glass-effect rounded-2xl p-6 ${glow ? 'glow-mint' : ''} ${className}`}
    >
      {children}
    </motion.div>
  )
}

