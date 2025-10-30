import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import DashboardLayout from '@/components/DashboardLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import TableOfContents from '@/components/TableOfContents'
import ContentStats from '@/components/ContentStats'
import AIAssistant from '@/components/AIAssistant'
import { ArrowLeft, RefreshCw, Copy, ChevronLeft, ChevronRight } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

export default function ContentStrategyDetail() {
  const router = useRouter()
  const { id } = router.query
  const session = useSession()
  const supabase = useSupabaseClient()
  
  const [project, setProject] = useState<any>(null)
  const [content, setContent] = useState<string | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [regenerationCount, setRegenerationCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showTOC, setShowTOC] = useState(true)
  const [showSidebar, setShowSidebar] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  useEffect(() => {
    if (session && id) {
      loadData()
    }
  }, [session, id])

  const loadData = async () => {
    // Load project
    const { data: projectData } = await supabase
      .from('dashboards')
      .select('*')
      .eq('id', id)
      .eq('user_id', session?.user.id)
      .single()

    if (projectData) {
      setProject(projectData)
    }

    // Load profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session?.user.id)
      .single()

    if (profileData) {
      setProfile(profileData)
    }

    // Load content strategy generation
    const { data: generations } = await supabase
      .from('generations')
      .select('*')
      .eq('dashboard_id', id)
      .eq('type', 'content_strategy')
      .order('created_at', { ascending: false })

    if (generations && generations.length > 0) {
      setContent(generations[0].content)
      setRegenerationCount(generations.length)
      setLastUpdated(generations[0].created_at)
    }

    setLoading(false)
  }

  const handleRegenerate = async () => {
    const canRegenerate = profile?.has_purchased || regenerationCount < 1

    if (!canRegenerate) {
      toast.error('Purchase to unlock unlimited regenerations')
      return
    }

    setIsRegenerating(true)
    
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
          type: 'content_strategy',
        }),
      })

      if (!response.ok) {
        throw new Error('Generation failed')
      }

      const data = await response.json()
      setContent(data.content)
      setRegenerationCount(regenerationCount + 1)
      toast.success('Content strategy regenerated successfully!')
    } catch (error) {
      console.error('Error regenerating:', error)
      toast.error('Failed to regenerate. Please try again.')
    } finally {
      setIsRegenerating(false)
    }
  }

  const handleCopy = () => {
    if (content) {
      navigator.clipboard.writeText(content)
      toast.success('Copied to clipboard!')
    }
  }

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

  if (!content) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Button 
            variant="ghost" 
            onClick={() => router.push(`/project/${id}`)}
            className="mb-4"
          >
            <ArrowLeft size={16} />
            Back to Overview
          </Button>
          <Card className="text-center py-12">
            <h3 className="text-xl font-bold mb-2">No content strategy found</h3>
            <p className="text-secondary mb-6">Generate your content strategy first</p>
            <Button onClick={() => router.push(`/project/${id}/generate`)}>
              Go to Generation Mode
            </Button>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  const canRegenerate = profile?.has_purchased || regenerationCount < 1

  return (
    <DashboardLayout>
      <div className="max-w-[1800px] mx-auto px-6 py-8">
        {/* Header with Back Button */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Button 
              variant="ghost" 
              onClick={() => router.push(`/project/${id}`)}
              size="sm"
              className="mb-3"
            >
              <ArrowLeft size={16} />
              Back to Overview
            </Button>
            
            <div className="text-sm text-gray-400 mb-2">
              Projects / {project?.business_name} / Content Strategy
            </div>
            <h1 className="text-4xl font-clash font-bold mb-1">Content Strategy</h1>
            <p className="text-gray-400">Your 90-day content roadmap</p>
          </div>

          {/* Sidebar Toggle Buttons */}
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTOC(!showTOC)}
              title={showTOC ? "Hide Table of Contents" : "Show Table of Contents"}
            >
              {showTOC ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
              TOC
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSidebar(!showSidebar)}
              title={showSidebar ? "Hide Sidebar" : "Show Sidebar"}
            >
              Assistant
              {showSidebar ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </Button>
          </div>
        </div>

        {/* Premium Notice */}
        {!profile?.has_purchased && regenerationCount >= 1 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-accentAlt/10 border border-accentAlt/20 rounded-lg p-4 mb-6"
          >
            <p className="text-sm text-accentAlt">
              You've used your free regeneration. Purchase to unlock unlimited regenerations.
            </p>
          </motion.div>
        )}

        {/* 3-Column Document Editor Layout */}
        <div className="grid grid-cols-[auto_1fr_auto] gap-6">
          
          {/* Left Sidebar: Table of Contents */}
          {showTOC && (
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-64"
            >
              <TableOfContents content={content} />
            </motion.aside>
          )}

          {/* Main Content Area */}
          <motion.main
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="min-w-0"
          >
            {/* Sticky Action Bar */}
            <div className="sticky top-4 z-10 mb-6 bg-background/95 backdrop-blur-sm rounded-lg border border-white/10 p-3 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button 
                    onClick={handleCopy}
                    variant="ghost"
                    size="sm"
                  >
                    <Copy size={16} />
                    Copy
                  </Button>
                  
                  {canRegenerate && (
                    <Button 
                      onClick={handleRegenerate}
                      variant="ghost"
                      size="sm"
                      disabled={isRegenerating}
                      loading={isRegenerating}
                    >
                      <RefreshCw size={16} />
                      Regenerate
                    </Button>
                  )}
                </div>

                <div className="text-xs text-gray-400">
                  {content && `${content.trim().split(/\s+/).length.toLocaleString()} words`}
                </div>
              </div>
            </div>

            {/* Document Content */}
            <Card className="prose prose-lg prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            </Card>
          </motion.main>

          {/* Right Sidebar: AI Assistant + Stats */}
          {showSidebar && (
            <motion.aside
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-80 space-y-6"
            >
              <ContentStats 
                content={content}
                lastUpdated={lastUpdated || undefined}
              />
              
              <AIAssistant
                content={content}
                contentType="content_strategy"
                dashboardId={id as string}
              />
            </motion.aside>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

export async function getServerSideProps() {
  return {
    props: {},
  }
}

