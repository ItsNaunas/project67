import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import BusinessCaseTab from '@/components/tabs/BusinessCaseTab'
import ContentStrategyTab from '@/components/tabs/ContentStrategyTab'
import WebsiteTab from '@/components/tabs/WebsiteTab'
import Button from '@/components/ui/Button'
import { CheckCircle2, Lock } from 'lucide-react'
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
      if (gen.type === 'website') {
        setSelectedTemplate(gen.content.templateId)
      }
    })

    setGenerations(groupedGenerations)
    setRegenerationCounts(counts)
  }

  const handleGenerate = async (type: 'business_case' | 'content_strategy') => {
    setIsGenerating({ ...isGenerating, [type]: true })

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
    } catch (error) {
      console.error('Error generating:', error)
      toast.error('Failed to generate. Please try again.')
    } finally {
      setIsGenerating({ ...isGenerating, [type]: false })
    }
  }

  const handleSelectTemplate = async (templateId: number) => {
    try {
      const { data, error } = await supabase
        .from('generations')
        .insert({
          dashboard_id: id,
          type: 'website',
          content: { templateId },
          version: 1,
        })
        .select()
        .single()

      if (error) throw error

      setSelectedTemplate(templateId)
      setGenerations({ ...generations, website: { templateId } })
    } catch (error) {
      console.error('Error selecting template:', error)
      toast.error('Failed to select template. Please try again.')
    }
  }

  const isAllComplete = 
    generations.business_case &&
    generations.content_strategy &&
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
      complete: !!selectedTemplate,
    },
  ]

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-clash font-bold mb-2 text-white">{dashboard?.business_name}</h1>
          <p className="text-gray-400">{dashboard?.niche}</p>
        </div>

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

