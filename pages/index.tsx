import { useState } from 'react'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import { useSession } from '@supabase/auth-helpers-react'
import { WavyBackground } from '@/components/ui/wavy-background'
import { CustomNavbar } from '@/components/CustomNavbar'
import { VercelV0Chat } from '@/components/VercelV0Chat'
import AuthModal from '@/components/AuthModal'
import { Zap, Timer, CheckCircle, Sparkles, TrendingUp } from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const session = useSession()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [businessIdea, setBusinessIdea] = useState('')

  const handleAuthSuccess = () => {
    setShowAuthModal(false)
    if (businessIdea) {
      router.push(`/generate?idea=${encodeURIComponent(businessIdea)}`)
    } else {
      router.push('/generate')
    }
  }

  const handleChatSubmit = (idea: string) => {
    setBusinessIdea(idea)
    if (session) {
      router.push(`/generate?idea=${encodeURIComponent(idea)}`)
    } else {
      setShowAuthModal(true)
    }
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Navbar */}
      <CustomNavbar onSignInClick={() => setShowAuthModal(true)} />
      
      {/* Debug button */}
      <button 
        onClick={() => {
          console.log('Debug button clicked');
          setShowAuthModal(true);
        }}
        className="fixed top-20 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded"
      >
        Debug Auth
      </button>

      {/* Hero Section with Wavy Background */}
      <WavyBackground
        containerClassName=""
        className="max-w-5xl mx-auto px-6"
        colors={["#1dcd9f", "#10b981", "#059669", "#047857", "#065f46"]}
        waveWidth={60}
        backgroundFill="#000000"
        blur={12}
        speed="fast"
        waveOpacity={0.3}
      >
        <div className="w-full text-center">
          {/* Main Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-clash font-semibold text-white leading-[1.1] tracking-tight mb-6">
            Everything you need to go from{' '}
            <span className="bg-gradient-to-r from-mint-400 via-mint-500 to-mint-600 bg-clip-text text-transparent">
              0 → 6/7 figures
            </span>
            .
          </h1>
          
          {/* Subheadline */}
          <div className="text-lg md:text-xl text-gray-300 mb-16 max-w-4xl mx-auto space-y-4">
            <p>The only AI system built by founders who've actually scaled to 6-7 figures.</p>
            <p>Stop wasting months on planning. Get your complete launch strategy in minutes.</p>
          </div>

          {/* Chat Component */}
          <div className="mb-16">
            <VercelV0Chat onSubmit={handleChatSubmit} />
          </div>

          {/* Micro Stats Strip */}
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap justify-center gap-6 mb-12">
              {/* Stat 1 */}
              <div className="flex items-center gap-3 bg-charcoal-900/30 border border-mint-500/20 rounded-full px-6 py-3 backdrop-blur-sm hover:border-mint-500/40 transition-all">
                <Zap className="h-5 w-5 text-mint-400" />
                <div>
                  <div className="text-xl font-bold text-white">12K+</div>
                  <div className="text-xs text-gray-400">AI plans generated</div>
                </div>
              </div>

              {/* Stat 2 */}
              <div className="flex items-center gap-3 bg-charcoal-900/30 border border-mint-500/20 rounded-full px-6 py-3 backdrop-blur-sm hover:border-mint-500/40 transition-all">
                <Timer className="h-5 w-5 text-mint-400" />
                <div>
                  <div className="text-xl font-bold text-white">&lt; 2 min</div>
                  <div className="text-xs text-gray-400">average time</div>
                </div>
              </div>

              {/* Stat 3 */}
              <div className="flex items-center gap-3 bg-charcoal-900/30 border border-mint-500/20 rounded-full px-6 py-3 backdrop-blur-sm hover:border-mint-500/40 transition-all">
                <CheckCircle className="h-5 w-5 text-mint-400" />
                <div>
                  <div className="text-xl font-bold text-white">97%</div>
                  <div className="text-xs text-gray-400">completion rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </WavyBackground>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-24 px-6 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-clash font-semibold text-white mb-4"
            >
              Everything you need in one place
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-gray-400 max-w-2xl mx-auto"
            >
              Stop juggling multiple tools. Get your complete business blueprint in minutes.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Sparkles className="text-mint-400" size={40} />}
              title="AI Business Case"
              description="7-section strategy including market analysis, positioning, offer structure, and growth roadmap."
              features={[
                "Market opportunity analysis",
                "Competitive positioning",
                "Revenue model design",
                "90-day action plan"
              ]}
              delay={0}
            />
            <FeatureCard
              icon={<TrendingUp className="text-mint-400" size={40} />}
              title="Viral Content Strategy"
              description="3 proven content hooks with complete frameworks for each platform."
              features={[
                "Hook writing formulas",
                "Platform-specific guidance",
                "Engagement psychology",
                "CTA optimization"
              ]}
              delay={0.1}
            />
            <FeatureCard
              icon={<Zap className="text-mint-400" size={40} />}
              title="Website Templates"
              description="8 premium templates designed for conversion. Launch-ready in minutes."
              features={[
                "Mobile-responsive design",
                "SEO optimized",
                "Fast loading times",
                "Easy customization"
              ]}
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative z-10 py-24 px-6 bg-gradient-to-b from-black to-charcoal-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-clash font-semibold text-white mb-4"
            >
              From idea to launch in 3 steps
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-gray-400 max-w-2xl mx-auto"
            >
              No complex setup. No technical skills required. Just answer questions and get results.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <StepCard
              number="01"
              title="Tell us your idea"
              description="Answer 7 simple questions about your business. Takes less than 2 minutes."
              delay={0}
            />
            <StepCard
              number="02"
              title="AI generates your kit"
              description="Our AI analyzes your responses and creates a custom business strategy."
              delay={0.1}
            />
            <StepCard
              number="03"
              title="Launch & scale"
              description="Get your complete business case, content plan, and website. Start today."
              delay={0.2}
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-8 py-4 bg-gradient-to-r from-mint-500 to-mint-600 text-white rounded-xl font-semibold text-lg shadow-lg shadow-mint-500/25 hover:shadow-mint-500/40 hover:scale-105 transition-all duration-300"
            >
              Start Building Now →
            </button>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 py-24 px-6 bg-charcoal-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-clash font-semibold text-white mb-4"
            >
              One price. Everything included.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-gray-400 max-w-2xl mx-auto"
            >
              No subscriptions. No hidden fees. Pay once, own forever.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-mint-500/20 to-mint-600/20 rounded-3xl blur-3xl"></div>
            
            <div className="relative glass-effect rounded-3xl p-8 md:p-12 border-2 border-mint-500/30">
              {/* Sale badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="px-6 py-2 bg-gradient-to-r from-mint-500 to-mint-600 text-white rounded-full text-sm font-bold shadow-lg">
                  🔥 50% OFF - Limited Time
                </span>
              </div>

              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-4 mb-6">
                  <span className="text-3xl md:text-4xl font-bold line-through text-gray-500">£67.00</span>
                  <span className="text-6xl md:text-7xl font-clash font-bold text-gradient">£33.50</span>
                </div>
                <p className="text-gray-400 text-lg mb-8">One-time payment. Lifetime access.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <h3 className="font-clash font-semibold text-xl text-white mb-4">What's included:</h3>
                  {[
                    "Complete AI Business Case (7 sections)",
                    "Viral Content Strategy (3 hooks)",
                    "8 Premium Website Templates",
                    "Unlimited regenerations",
                    "Full dashboard access",
                    "Priority support"
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <CheckCircle className="text-mint-400 mt-1 flex-shrink-0" size={20} />
                      <span className="text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <h3 className="font-clash font-semibold text-xl text-white mb-4">Bonus features:</h3>
                  {[
                    "Weekly viral content ideas",
                    "Referral program (50% commission)",
                    "Progress tracking dashboard",
                    "Email notifications",
                    "Future updates included",
                    "30-day money-back guarantee"
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <CheckCircle className="text-mint-400 mt-1 flex-shrink-0" size={20} />
                      <span className="text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center pt-6 border-t border-white/10">
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="w-full md:w-auto px-12 py-4 bg-gradient-to-r from-mint-500 to-mint-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-mint-500/25 hover:shadow-mint-500/40 hover:scale-105 transition-all duration-300 mb-4"
                >
                  Get Started Now
                </button>
                <p className="text-sm text-gray-500">
                  + Optional hosting: £3/month (first 2 months free)
                </p>
              </div>
            </div>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-12 flex flex-wrap justify-center gap-8 text-gray-500 text-sm"
          >
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-mint-400" />
              Secure payment via Stripe
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-mint-400" />
              No subscriptions
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-mint-400" />
              Instant access
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 px-6 bg-black">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-clash font-bold text-white mb-6"
          >
            Stop planning.
            <br />
            <span className="text-gradient">Start building.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-400 mb-10"
          >
            Join 12,000+ founders who've already started their journey to 6-7 figures.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-12 py-5 bg-gradient-to-r from-mint-500 to-mint-600 text-white rounded-xl font-bold text-xl shadow-lg shadow-mint-500/25 hover:shadow-mint-500/40 hover:scale-105 transition-all duration-300"
            >
              Get Started Free →
            </button>
            <p className="mt-4 text-sm text-gray-500">No credit card required</p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-charcoal-900 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Sparkles className="h-6 w-6 text-mint-400" />
                <span className="font-clash font-semibold text-white text-lg">Project 67</span>
              </div>
              <p className="text-gray-500 text-sm">
                Everything you need to go from 0 → 6/7 figures.
              </p>
            </div>

            {/* Product */}
            <div>
              <h3 className="font-clash font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#features" className="hover:text-mint-400 transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-mint-400 transition-colors">How It Works</a></li>
                <li><a href="#pricing" className="hover:text-mint-400 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-mint-400 transition-colors">Examples</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-clash font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-mint-400 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-mint-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-mint-400 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-mint-400 transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-clash font-semibold text-white mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-mint-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-mint-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-mint-400 transition-colors">Refund Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © 2025 Project 67. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-gray-400 hover:text-mint-400 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path></svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-mint-400 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"></path></svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-mint-400 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  )
}

// Feature Card Component
interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  features: string[]
  delay: number
}

function FeatureCard({ icon, title, description, features, delay }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      whileHover={{ y: -8 }}
      className="glass-effect rounded-2xl p-8 hover:border-mint-500/40 transition-all duration-300"
    >
      <div className="mb-6">{icon}</div>
      <h3 className="text-2xl font-clash font-semibold text-white mb-3">{title}</h3>
      <p className="text-gray-400 mb-6">{description}</p>
      <ul className="space-y-2">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm text-gray-500">
            <CheckCircle size={16} className="text-mint-400 mt-0.5 flex-shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  )
}

// Step Card Component
interface StepCardProps {
  number: string
  title: string
  description: string
  delay: number
}

function StepCard({ number, title, description, delay }: StepCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="relative"
    >
      <div className="glass-effect rounded-2xl p-8 hover:border-mint-500/40 transition-all duration-300">
        <div className="text-6xl font-clash font-bold text-mint-400/20 mb-4">{number}</div>
        <h3 className="text-2xl font-clash font-semibold text-white mb-3">{title}</h3>
        <p className="text-gray-400">{description}</p>
      </div>
    </motion.div>
  )
}
