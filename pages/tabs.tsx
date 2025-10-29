import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import BusinessCaseTab from '@/components/tabs/BusinessCaseTab'
import ContentStrategyTab from '@/components/tabs/ContentStrategyTab'
import WebsiteTab from '@/components/tabs/WebsiteTab'
import Button from '@/components/ui/Button'
import QuickStartChecklist from '@/components/ui/QuickStartChecklist'
import { CheckCircle2, Lock, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'

type TabType = 'business_case' | 'content_strategy' | 'website'

export default function Tabs() {
  const router = useRouter()
  const { id } = router.query
  const session = useSession()
  const supabase = useSupabaseClient()
  
  const [activeTab, setActiveTab] = useState<TabType>('business_case')
  const [dashboard, setDashboard] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [generations, setGenerations] = useState<any>({
    business_case: null,
    content_strategy: null,
    website: null,
  })
  const [regenerationCounts, setRegenerationCounts] = useState<any>({
    business_case: 0,
    content_strategy: 0,
  })
  const [isGenerating, setIsGenerating] = useState<Record<string, boolean>>({
    business_case: false,
    content_strategy: false,
    website: false,
  })
  const [loading, setLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null)

  useEffect(() => {
    if (session && id) {
      loadDashboard()
      loadProfile()
      loadGenerations()
    }
  }, [session, id])

  const loadDashboard = async () => {
    const { data, error } = await supabase
      .from('dashboards')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error loading dashboard:', error)
      router.push('/dashboard')
      return
    }

    setDashboard(data)
    setLoading(false)
  }

  const loadProfile = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session?.user.id)
      .single()

    if (error) {
      console.error('Error loading profile:', error)
      return
    }

    setProfile(data)
  }

  const loadGenerations = async () => {
    const { data, error } = await supabase
      .from('generations')
      .select('*')
      .eq('dashboard_id', id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading generations:', error)
      return
    }

    const groupedGenerations: any = {
      business_case: null,
      content_strategy: null,
      website: null,
    }

    const counts: any = {
      business_case: 0,
      content_strategy: 0,
    }

    data.forEach((gen) => {
      if (!groupedGenerations[gen.type]) {
        groupedGenerations[gen.type] = gen.content
      }
      if (gen.type !== 'website') {
        counts[gen.type]++
      }
      if (gen.type === 'website' && gen.content) {
        try {
          const websiteContent = typeof gen.content === 'string' ? JSON.parse(gen.content) : gen.content
          if (websiteContent.templateId) {
            setSelectedTemplate(websiteContent.templateId)
          }
        } catch (e) {
          console.error('Error parsing website content:', e)
        }
      }
    })

    setGenerations(groupedGenerations)
    setRegenerationCounts(counts)
  }

  const handleGenerate = async (type: 'business_case' | 'content_strategy') => {
    setIsGenerating({ ...isGenerating, [type]: true })

    try {
      // Get the current session token
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      
      if (!currentSession?.access_token) {
        throw new Error('Not authenticated')
      }

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentSession.access_token}`
        },
        body: JSON.stringify({
          dashboardId: id,
          type,
        }),
      })

      if (!response.ok) {
        throw new Error('Generation failed')
      }

      const data = await response.json()
      setGenerations({ ...generations, [type]: data.content })
      setRegenerationCounts({ ...regenerationCounts, [type]: regenerationCounts[type] + 1 })
      
      // Calculate new progress
      const newProgress = [
        type === 'business_case' ? data.content : generations.business_case,
        type === 'content_strategy' ? data.content : generations.content_strategy,
        generations.website,
        selectedTemplate
      ].filter(Boolean).length

      // Show celebration toast with navigation
      if (type === 'business_case') {
        toast.custom((t) => (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="glass-effect rounded-xl p-4 shadow-xl border border-mint-400/30 max-w-md"
          >
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-mint-400 flex-shrink-0" size={24} />
              <div className="flex-1">
                <p className="font-bold text-white mb-1">🎉 Business Case Generated!</p>
                <p className="text-sm text-gray-400 mb-3">{newProgress}/3 Complete</p>
                <Button
                  size="sm"
                  onClick={() => {
                    setActiveTab('content_strategy')
                    toast.dismiss(t.id)
                  }}
                >
                  Next: Content Strategy →
                </Button>
              </div>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
          </motion.div>
        ), { duration: 8000 })
      } else if (type === 'content_strategy') {
        toast.custom((t) => (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="glass-effect rounded-xl p-4 shadow-xl border border-mint-400/30 max-w-md"
          >
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-mint-400 flex-shrink-0" size={24} />
              <div className="flex-1">
                <p className="font-bold text-white mb-1">🎉 Content Strategy Generated!</p>
                <p className="text-sm text-gray-400 mb-3">{newProgress}/3 Complete</p>
                <Button
                  size="sm"
                  onClick={() => {
                    setActiveTab('website')
                    toast.dismiss(t.id)
                  }}
                >
                  Next: Choose Website →
                </Button>
              </div>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
          </motion.div>
        ), { duration: 8000 })
      }
    } catch (error) {
      console.error('Error generating:', error)
      toast.error('Failed to generate. Please try again.')
    } finally {
      setIsGenerating({ ...isGenerating, [type]: false })
    }
  }

  const handleGenerateWebsite = async (templateId: number) => {
    setIsGenerating({ ...isGenerating, website: true })

    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      
      if (!currentSession?.access_token) {
        throw new Error('Not authenticated')
      }

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentSession.access_token}`
        },
        body: JSON.stringify({
          dashboardId: id,
          type: 'website',
          templateId,
        }),
      })

      if (!response.ok) {
        throw new Error('Website generation failed')
      }

      const data = await response.json()
      setGenerations({ ...generations, website: data.content })
      setSelectedTemplate(templateId)
      
      toast.success('Website generated successfully!')
      
      // Reload to show the generated website
      await loadGenerations()
    } catch (error) {
      console.error('Error generating website:', error)
      toast.error('Failed to generate website. Please try again.')
    } finally {
      setIsGenerating({ ...isGenerating, website: false })
    }
  }

  const handleSelectTemplate = async (templateId: number) => {
    setSelectedTemplate(templateId)
  }

  const isAllComplete = 
    generations.business_case &&
    generations.content_strategy &&
    generations.website &&
    selectedTemplate

  if (!session || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-secondary">Loading...</p>
        </div>
      </div>
    )
  }

  const tabs = [
    {
      id: 'business_case' as TabType,
      name: 'Business Case',
      complete: !!generations.business_case,
    },
    {
      id: 'content_strategy' as TabType,
      name: 'Content Strategy',
      complete: !!generations.content_strategy,
    },
    {
      id: 'website' as TabType,
      name: 'Website',
      complete: !!generations.website && !!selectedTemplate,
    },
  ]

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-clash font-bold text-white">{dashboard?.business_name}</h1>
              <p className="text-gray-400">{dashboard?.niche}</p>
            </div>
            
            {/* Progress indicator */}
            <div className="text-right">
              <div className="text-sm text-gray-400 mb-1">Your Progress</div>
              <div className="text-3xl font-bold text-gradient">
                {[generations.business_case, generations.content_strategy, selectedTemplate]
                  .filter(Boolean).length}/3
              </div>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
            <motion.div 
              className="bg-gradient-to-r from-mint-400 to-mint-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ 
                width: `${([generations.business_case, generations.content_strategy, selectedTemplate]
                  .filter(Boolean).length / 3) * 100}%` 
              }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Quick Start Checklist (show if not all complete) */}
        {!isAllComplete && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <QuickStartChecklist
              hasBusinessCase={!!generations.business_case}
              hasContentStrategy={!!generations.content_strategy}
              hasWebsiteTemplate={!!selectedTemplate}
              hasPurchased={profile?.has_purchased || false}
            />
          </motion.div>
        )}

        {/* Value Proposition Banner */}
        {!profile?.has_purchased && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 glass-effect rounded-xl p-4 border-l-4 border-mint-400"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Sparkles className="text-mint-400 flex-shrink-0" size={20} />
                <p className="text-sm">
                  <span className="font-semibold">Try everything free</span>
                  <span className="text-gray-400 mx-2">•</span>
                  Unlock unlimited access for <span className="text-mint-400 font-bold">£33.50</span>
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => router.push(`/checkout?dashboard=${id}`)}
              >
                Learn More
              </Button>
            </div>
          </motion.div>
        )}

        {/* Tabs Navigation */}
        <div className="flex gap-4 mb-8 border-b border-white/10 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-mint-400 text-mint-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              {tab.name}
              {tab.complete && <CheckCircle2 size={16} className="text-green-500" />}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'business_case' && (
            <BusinessCaseTab
              dashboardId={id as string}
              hasPurchased={profile?.has_purchased || false}
              onGenerate={() => handleGenerate('business_case')}
              content={generations.business_case}
              regenerationCount={regenerationCounts.business_case}
              isGenerating={isGenerating.business_case}
            />
          )}

          {activeTab === 'content_strategy' && (
            <ContentStrategyTab
              dashboardId={id as string}
              hasPurchased={profile?.has_purchased || false}
              onGenerate={() => handleGenerate('content_strategy')}
              content={generations.content_strategy}
              regenerationCount={regenerationCounts.content_strategy}
              isGenerating={isGenerating.content_strategy}
            />
          )}

          {activeTab === 'website' && (
            <WebsiteTab
              dashboardId={id as string}
              hasPurchased={profile?.has_purchased || false}
              selectedTemplate={selectedTemplate}
              onSelectTemplate={handleSelectTemplate}
              onGenerateWebsite={handleGenerateWebsite}
              websiteContent={generations.website}
              isGenerating={isGenerating.website}
            />
          )}
        </motion.div>

        {/* Checkout CTA or Dev Mode Notice */}
        {isAllComplete && !profile?.has_purchased && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 glass-effect rounded-2xl p-8 text-center glow-accent"
          >
            {process.env.NEXT_PUBLIC_DEV_MODE === 'true' ? (
              <>
                <h2 className="text-3xl font-bold mb-4">🚧 Development Mode</h2>
                <p className="text-secondary mb-6">
                  Payments are disabled. You can test unlimited regenerations without payment.
                </p>
                <Button
                  size="lg"
                  onClick={async () => {
                    await supabase
                      .from('profiles')
                      .update({ has_purchased: true })
                      .eq('id', session?.user.id)
                    window.location.reload()
                  }}
                  className="mb-4"
                >
                  Enable Unlimited Access (Dev Mode)
                </Button>
                <p className="text-sm text-secondary">
                  This bypasses payment for testing. Set NEXT_PUBLIC_DEV_MODE=false to enable payments.
                </p>
              </>
            ) : (
              <>
                <h2 className="text-3xl font-bold mb-4">Ready to unlock everything?</h2>
                <p className="text-secondary mb-6">
                  Get unlimited regenerations, full dashboard access, and launch your business
                </p>
                
                <div className="flex items-center justify-center gap-4 mb-6">
                  <span className="text-2xl font-bold line-through text-secondary">£67.00</span>
                  <span className="text-5xl font-black text-gradient">£33.50</span>
                  <span className="px-3 py-1 bg-accent/20 text-accent rounded-full text-sm font-semibold">
                    50% OFF
                  </span>
                </div>

                <Button
                  size="lg"
                  onClick={() => router.push(`/checkout?dashboard=${id}`)}
                  className="mb-4"
                >
                  Unlock Full Access
                </Button>

                <p className="text-sm text-secondary">
                  No subscriptions. No hidden fees. One unlock to everything.
                  <br />
                  + £3/month hosting (first 2 months free)
                </p>
              </>
            )}
          </motion.div>
        )}

        {profile?.has_purchased && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 text-center"
          >
            <Button onClick={() => router.push('/dashboard')} variant="ghost">
              Back to Dashboard
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

// Prevent static generation - this page needs authentication and query params
export async function getServerSideProps() {
  return {
    props: {},
  }
}

