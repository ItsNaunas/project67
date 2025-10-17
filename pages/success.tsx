import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import { useSession } from '@supabase/auth-helpers-react'
import Button from '@/components/ui/Button'
import { CheckCircle2, Sparkles, Gift, TrendingUp } from 'lucide-react'
import Confetti from 'react-confetti'
import type { GetServerSideProps } from 'next'

export default function Success() {
  const router = useRouter()
  const { dashboard: dashboardId } = router.query
  const session = useSession()
  const [showConfetti, setShowConfetti] = useState(true)
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    })

    setTimeout(() => {
      setShowConfetti(false)
    }, 5000)
  }, [])

  if (!session) {
    router.push('/')
    return null
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
          colors={['#1DCD9F', '#10B981', '#059669', '#FFFFFF']}
        />
      )}

      <div className="relative z-10 text-center max-w-3xl">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
        >
          <CheckCircle2 className="mx-auto mb-6 text-mint-400" size={80} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-5xl font-clash font-bold mb-4 text-white"
        >
          Welcome to the 67 Club! 🎉
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-xl text-gray-400 mb-12"
        >
          Your payment was successful. Your journey to 6/7 figures starts now.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid md:grid-cols-3 gap-6 mb-12"
        >
          <div className="glass-effect rounded-xl p-6">
            <Sparkles className="mx-auto mb-3 text-mint-400" size={32} />
            <h3 className="font-bold mb-2 text-white">Unlimited Regenerations</h3>
            <p className="text-sm text-gray-400">
              Refine your business case and content strategy as many times as you need
            </p>
          </div>

          <div className="glass-effect rounded-xl p-6">
            <Gift className="mx-auto mb-3 text-mint-400" size={32} />
            <h3 className="font-bold mb-2 text-white">Referral Program</h3>
            <p className="text-sm text-gray-400">
              Earn £16.75 for every referral with your unique link (available in dashboard)
            </p>
          </div>

          <div className="glass-effect rounded-xl p-6">
            <TrendingUp className="mx-auto mb-3 text-mint-400" size={32} />
            <h3 className="font-bold mb-2 text-white">Weekly Content Ideas</h3>
            <p className="text-sm text-gray-400">
              Get fresh viral hooks delivered to your inbox every week
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Button
            size="lg"
            onClick={() => router.push('/dashboard')}
            className="mb-4"
          >
            Go to Dashboard
          </Button>
          
          {dashboardId && (
            <Button
              size="lg"
              variant="ghost"
              onClick={() => router.push(`/tabs?id=${dashboardId}`)}
              className="ml-4"
            >
              Continue Building
            </Button>
          )}
        </motion.div>
      </div>
    </div>
  )
}

// Prevent static generation - this page needs query params
export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  }
}

