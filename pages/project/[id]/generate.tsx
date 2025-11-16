import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import DashboardLayout from '@/components/DashboardLayout'
import BusinessCaseTab from '@/components/tabs/BusinessCaseTab'
import ContentStrategyTab from '@/components/tabs/ContentStrategyTab'
import WebsiteTab from '@/components/tabs/WebsiteTab'
import Button from '@/components/ui/Button'
import QuickStartChecklist from '@/components/ui/QuickStartChecklist'
import EditBusinessModal from '@/components/EditBusinessModal'
import { CheckCircle2, Sparkles, ArrowLeft, Info, Edit2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function GenerateMode() {
  const router = useRouter()
  const { id } = router.query
  const session = useSession()
  const supabase = useSupabaseClient()
  
  // Removed activeTab state - now showing all sections in kanban layout
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
  const [showEditModal, setShowEditModal] = useState(false)
  
  // Track which notifications have been shown to prevent duplicates
  const shownNotificationsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (session && id) {
      loadDashboard()
      loadProfile()
      loadGenerations()
    }
  }, [session, id])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Check if user is typing in an input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const modifier = isMac ? e.metaKey : e.ctrlKey

      if (modifier && e.key === 'e') {
        e.preventDefault()
        setShowEditModal(true)
      } else if (e.key === '?') {
        e.preventDefault()
        toast.custom((t) => (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-effect rounded-xl p-6 shadow-xl border border-mint-400/30 max-w-md"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold">Keyboard Shortcuts</h3>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Edit Business Details</span>
                <kbd className="px-2 py-1 bg-white/10 rounded">
                  {isMac ? '⌘' : 'Ctrl'} + E
                </kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Show this help</span>
                <kbd className="px-2 py-1 bg-white/10 rounded">?</kbd>
              </div>
            </div>
          </motion.div>
        ), { duration: 10000 })
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

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

    const groupedGenerations: Record<string, unknown | null> = {
      business_case: null,
      content_strategy: null,
      website: null,
    }

    const counts: Record<string, number> = {
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
    
    // Create a unique key for this generation attempt
    const generationKey = `${type}-${Date.now()}`

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
      
      // Only show notification if we haven't shown it for this generation
      if (!shownNotificationsRef.current.has(generationKey)) {
        shownNotificationsRef.current.add(generationKey)
        
        // Calculate new progress
        const newProgress = [
          type === 'business_case' ? data.content : generations.business_case,
          type === 'content_strategy' ? data.content : generations.content_strategy,
          generations.website,
          selectedTemplate
        ].filter(Boolean).length

        // Show celebration toast
        const messages = {
          business_case: '🎉 Business Case Generated!',
          content_strategy: '🎉 Content Strategy Generated!',
        }
        
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
                <p className="font-bold text-white mb-1">{messages[type]}</p>
                <p className="text-sm text-gray-400">{newProgress}/3 Complete</p>
              </div>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
          </motion.div>
        ), { duration: 5000 })
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
    
    // Create a unique key for this generation attempt
    const generationKey = `website-${templateId}-${Date.now()}`

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
      
      // Only show notification if we haven't shown it for this generation
      if (!shownNotificationsRef.current.has(generationKey)) {
        shownNotificationsRef.current.add(generationKey)
        toast.success('Website generated successfully!')
      }
      
      // Reload to sync with database (but notification already shown)
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

  // Track if completion notification has been shown (using ref to avoid re-triggers)
  const hasShownCompletionRef = useRef(false)

  // Show completion prompt only once, without auto-redirect
  useEffect(() => {
    if (isAllComplete && !loading && !hasShownCompletionRef.current) {
      hasShownCompletionRef.current = true
      
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
              <p className="font-bold text-white mb-1">🎉 All Sections Complete!</p>
              <p className="text-sm text-gray-400 mb-3">Ready to view your project overview?</p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    router.push(`/project/${id}`)
                    toast.dismiss(t.id)
                  }}
                >
                  View Overview →
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => toast.dismiss(t.id)}
                >
                  Keep Editing
                </Button>
              </div>
            </div>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </motion.div>
      ), { duration: Infinity })
    }
  }, [isAllComplete, loading, id, router])

  if (!session || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
            <p className="text-secondary">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        {/* Header with Back Button */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft size={16} />
            Back to Projects
          </Button>

          {/* Generation Mode Notice */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-4 flex items-start gap-3">
            <Info className="text-blue-400 flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <p className="text-sm text-blue-400 font-semibold">Generation Mode</p>
              <p className="text-xs text-gray-400">Complete all sections below to view your project overview</p>
            </div>
            <button
              onClick={() => {
                const event = new KeyboardEvent('keydown', { key: '?' })
                window.dispatchEvent(event)
              }}
              className="text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 bg-white/5 rounded"
              title="Keyboard shortcuts"
            >
              ?
            </button>
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-3xl font-clash font-bold text-white">{dashboard?.business_name}</h1>
                <p className="text-gray-400">{dashboard?.niche}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEditModal(true)}
                title="Edit business details"
              >
                <Edit2 size={16} />
              </Button>
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

        {/* 3-Column Kanban Board Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          
          {/* Column 1: Business Case */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <BusinessCaseTab
              dashboardId={id as string}
              hasPurchased={profile?.has_purchased || false}
              onGenerate={() => handleGenerate('business_case')}
              content={generations.business_case}
              regenerationCount={regenerationCounts.business_case}
              isGenerating={isGenerating.business_case}
            />
          </motion.div>

          {/* Column 2: Content Strategy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <ContentStrategyTab
              dashboardId={id as string}
              hasPurchased={profile?.has_purchased || false}
              onGenerate={() => handleGenerate('content_strategy')}
              content={generations.content_strategy}
              regenerationCount={regenerationCounts.content_strategy}
              isGenerating={isGenerating.content_strategy}
            />
          </motion.div>

          {/* Column 3: Website */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <WebsiteTab
              dashboardId={id as string}
              hasPurchased={profile?.has_purchased || false}
              selectedTemplate={selectedTemplate}
              onSelectTemplate={handleSelectTemplate}
              onGenerateWebsite={handleGenerateWebsite}
              websiteContent={generations.website}
              isGenerating={isGenerating.website}
            />
          </motion.div>
        </div>

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

        {/* Completion banner for purchased users */}
        {isAllComplete && profile?.has_purchased && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 text-center glass-effect rounded-xl p-6"
          >
            <CheckCircle2 className="text-mint-400 mx-auto mb-4" size={48} />
            <h3 className="text-2xl font-bold mb-2">All Sections Complete! 🎉</h3>
            <p className="text-gray-400 mb-6">
              You can continue editing or view your complete project overview
            </p>
            <div className="flex gap-4 justify-center">
              <Button 
                onClick={() => router.push(`/project/${id}`)}
                size="lg"
              >
                View Project Overview
              </Button>
              <Button 
                onClick={() => router.push('/dashboard')} 
                variant="ghost"
                size="lg"
              >
                Back to Dashboard
              </Button>
            </div>
          </motion.div>
        )}

        {/* Navigation for purchased users (when not complete) */}
        {!isAllComplete && profile?.has_purchased && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 text-center"
          >
            <Button onClick={() => router.push('/dashboard')} variant="ghost">
              Back to Projects
            </Button>
          </motion.div>
        )}
      </div>

      {/* Edit Business Modal */}
      {dashboard && (
        <EditBusinessModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          dashboardId={id as string}
          currentData={{
            business_name: dashboard.business_name || '',
            niche: dashboard.niche || '',
            target_audience: dashboard.target_audience || '',
            brand_tone: dashboard.brand_tone || 'professional',
          }}
          onUpdate={loadDashboard}
        />
      )}
    </DashboardLayout>
  )
}

// Prevent static generation - this page needs authentication and query params
export async function getServerSideProps() {
  return {
    props: {},
  }
}

