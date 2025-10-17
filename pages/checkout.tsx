import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { CheckCircle2, Lock, Sparkles } from 'lucide-react'

export default function Checkout() {
  const router = useRouter()
  const { dashboard: dashboardId } = router.query
  const session = useSession()
  const supabase = useSupabaseClient()
  
  const [loading, setLoading] = useState(false)
  const [includeHosting, setIncludeHosting] = useState(true)
  const [dashboard, setDashboard] = useState<any>(null)

  useEffect(() => {
    if (session && dashboardId) {
      loadDashboard()
    } else if (!session) {
      router.push('/')
    }
  }, [session, dashboardId])

  const loadDashboard = async () => {
    const { data, error } = await supabase
      .from('dashboards')
      .select('*')
      .eq('id', dashboardId)
      .single()

    if (error) {
      console.error('Error loading dashboard:', error)
      return
    }

    setDashboard(data)
  }

  const handleCheckout = async () => {
    setLoading(true)

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dashboardId,
          includeHosting,
        }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('Failed to create checkout session')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Failed to start checkout. Please try again.')
      setLoading(false)
    }
  }

  if (!session || !dashboard) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-secondary">Loading...</p>
        </div>
      </div>
    )
  }

  const features = [
    'Unlimited AI regenerations for Business Case',
    'Unlimited AI regenerations for Content Strategy',
    'Full access to all 8 website templates',
    'Complete dashboard with progress tracking',
    'Weekly viral content ideas via email',
    'Priority support',
    'Lifetime access - no recurring fees',
  ]

  const totalPrice = includeHosting ? 33.50 + 3 : 33.50

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Sparkles className="mx-auto mb-4 text-mint-400" size={48} />
          <h1 className="text-5xl font-clash font-bold mb-4 text-white">Unlock Your Full Business Kit</h1>
          <p className="text-xl text-gray-400">
            Everything you need to go from 0 → 6/7 figures
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Features */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="h-full">
              <h2 className="text-2xl font-bold mb-6">What's Included</h2>
              
              <div className="space-y-4 mb-8">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="text-accent mt-1 flex-shrink-0" size={20} />
                    <span className="text-secondary">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 pt-6">
                <h3 className="font-bold mb-4">Your Business</h3>
                <p className="text-secondary mb-2">{dashboard.business_name}</p>
                <p className="text-sm text-secondary/70">{dashboard.niche}</p>
              </div>
            </Card>
          </motion.div>

          {/* Pricing */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="glow-accent">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-3 mb-4">
                  <span className="text-2xl font-bold line-through text-secondary">£67.00</span>
                  <span className="text-5xl font-black text-gradient">£33.50</span>
                </div>
                <div className="inline-block px-4 py-2 bg-accent/20 text-accent rounded-full text-sm font-semibold mb-4">
                  🎉 50% OFF - Limited Time
                </div>
                <p className="text-secondary">One-time payment. No subscriptions.</p>
              </div>

              <div className="border-t border-white/10 pt-6 mb-6">
                <h3 className="font-bold mb-4">Optional Add-on</h3>
                
                <label className="flex items-start gap-3 p-4 rounded-lg border border-white/10 cursor-pointer hover:border-accent/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={includeHosting}
                    onChange={(e) => setIncludeHosting(e.target.checked)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold">Website Hosting</span>
                      <span className="text-accent font-bold">£3/month</span>
                    </div>
                    <p className="text-sm text-secondary">
                      Professional hosting for your website. First 2 months FREE!
                    </p>
                  </div>
                </label>
              </div>

              <div className="border-t border-white/10 pt-6 mb-6">
                <div className="flex justify-between items-center text-lg font-bold mb-2">
                  <span>Today's Total:</span>
                  <span className="text-gradient text-2xl">£{totalPrice.toFixed(2)}</span>
                </div>
                {includeHosting && (
                  <p className="text-xs text-secondary text-right">
                    First 2 months free, then £3/month
                  </p>
                )}
              </div>

              <Button
                onClick={handleCheckout}
                loading={loading}
                className="w-full"
                size="lg"
              >
                <Lock size={20} />
                Complete Purchase
              </Button>

              <div className="mt-6 text-center">
                <p className="text-xs text-secondary mb-2">
                  🔒 Secure payment powered by Stripe
                </p>
                <p className="text-xs text-secondary">
                  30-day money-back guarantee
                </p>
              </div>
            </Card>

            {/* Referral Info */}
            <Card className="mt-6">
              <h3 className="font-bold mb-2">💰 Earn 50% Commission</h3>
              <p className="text-sm text-secondary">
                After purchase, get your unique referral link and earn £16.75 for every person you refer!
              </p>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

