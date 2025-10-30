import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import { useSession } from '@supabase/auth-helpers-react'
import Button from '@/components/ui/Button'
import { CheckCircle2, Sparkles, FileText, Lightbulb, Globe } from 'lucide-react'
import type { GetServerSideProps } from 'next'

export default function Onboarding() {
  const router = useRouter()
  const { id } = router.query
  const session = useSession()

  useEffect(() => {
    if (!session) {
      router.push('/')
    }
  }, [session, router])

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 sm:p-6">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
          }}
          className="absolute top-0 right-0 w-[600px] h-[600px] bg-mint-500/20 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 max-w-4xl w-full text-center">
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
        >
          <CheckCircle2 className="mx-auto mb-6 text-mint-400" size={80} />
        </motion.div>

        {/* Header */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl sm:text-4xl md:text-5xl font-clash font-bold mb-4 text-white"
        >
          Great Start! 🎉
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-base sm:text-lg md:text-xl text-gray-400 mb-8 sm:mb-12"
        >
          Now let's build your complete business kit in 3 simple steps
        </motion.p>

        {/* 3-Step Roadmap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12"
        >
          <StepCard
            number={1}
            icon={<FileText size={32} />}
            title="Business Case"
            description="AI-generated business plan tailored to your niche"
            delay={0.5}
          />
          <StepCard
            number={2}
            icon={<Lightbulb size={32} />}
            title="Content Strategy"
            description="90 days of viral content ideas"
            delay={0.6}
          />
          <StepCard
            number={3}
            icon={<Globe size={32} />}
            title="Website Template"
            description="Choose from 8 professional templates"
            delay={0.7}
          />
        </motion.div>

        {/* Value Proposition */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="glass-effect rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 border border-mint-400/20"
        >
          <Sparkles className="inline-block text-mint-400 mb-2" size={20} />
          <p className="text-base sm:text-lg text-gray-300">
            ✨ Try everything <span className="font-bold text-white">FREE</span>, then unlock unlimited access for just{' '}
            <span className="text-mint-400 font-bold text-xl sm:text-2xl">£33.50</span>
          </p>
          <p className="text-xs sm:text-sm text-gray-500 mt-2">
            No credit card required to start • Full refund within 30 days
          </p>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Button
            size="lg"
            onClick={() => router.push(`/project/${id}/generate`)}
            className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 w-full sm:w-auto"
          >
            Start Building →
          </Button>
        </motion.div>
      </div>
    </div>
  )
}

interface StepCardProps {
  number: number
  icon: React.ReactNode
  title: string
  description: string
  delay: number
}

function StepCard({ number, icon, title, description, delay }: StepCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-effect rounded-xl p-5 sm:p-6 relative"
    >
      {/* Step Number Badge */}
      <div className="absolute -top-3 -left-3 sm:-top-4 sm:-left-4 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-mint-400 to-mint-600 rounded-full flex items-center justify-center font-bold text-black text-lg sm:text-xl shadow-lg">
        {number}
      </div>

      {/* Icon */}
      <div className="text-mint-400 mb-3 sm:mb-4 mt-2">
        {icon}
      </div>

      {/* Content */}
      <h3 className="text-lg sm:text-xl font-bold mb-2 text-white">{title}</h3>
      <p className="text-gray-400 text-xs sm:text-sm">{description}</p>
    </motion.div>
  )
}

// Prevent static generation - this page needs authentication
export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  }
}

