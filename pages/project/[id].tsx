import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import DashboardLayout from '@/components/DashboardLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { FileText, Newspaper, Globe, Edit, ExternalLink, RefreshCw, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

export default function ProjectOverview() {
  const router = useRouter()
  const { id } = router.query
  const session = useSession()
  const supabase = useSupabaseClient()
  
  const [project, setProject] = useState<any>(null)
  const [generations, setGenerations] = useState<any>({
    business_case: null,
    content_strategy: null,
    website: null
  })
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    if (session && id) {
      loadProject()
      loadGenerations()
    }
  }, [session, id])

  const loadProject = async () => {
    const { data, error } = await supabase
      .from('dashboards')
      .select('*')
      .eq('id', id)
      .eq('user_id', session?.user.id)
      .single()

    if (error) {
      console.error('Error loading project:', error)
      toast.error('Project not found')
      router.push('/dashboard')
      return
    }

    setProject(data)
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

    data.forEach((gen) => {
      if (!groupedGenerations[gen.type]) {
        groupedGenerations[gen.type] = gen.content
      }
    })

    setGenerations(groupedGenerations)
    setLoading(false)
  }

  // Check if project is complete
  const isComplete = project?.business_case_generated && 
                     project?.content_strategy_generated && 
                     project?.website_generated
  
  // If not complete, redirect to generation mode
  useEffect(() => {
    if (project && !isComplete && !loading) {
      router.push(`/project/${id}/generate`)
    }
  }, [project, isComplete, loading])

  if (!session || loading || !project) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
            <p className="text-secondary">Loading project...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Extract preview text from business case
  const getBusinessCasePreview = () => {
    if (!generations.business_case) return ''
    const text = typeof generations.business_case === 'string' 
      ? generations.business_case 
      : JSON.stringify(generations.business_case)
    return text.substring(0, 200).replace(/[#*]/g, '').trim()
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft size={16} />
            Back to Projects
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-clash font-bold mb-2 text-white">
                {project.business_name}
              </h1>
              <p className="text-gray-400">{project.niche}</p>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-gray-400 mb-1">Status</div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-green-500/20 text-green-500 rounded-full text-sm font-semibold">
                  Complete
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="space-y-6">
          
          {/* Business Case Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6 hover:border-mint-400/30 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-mint-400/20 rounded-lg">
                    <FileText className="text-mint-400" size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Business Case</h2>
                    <p className="text-sm text-gray-400">Your complete business plan</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => router.push(`/project/${id}/business-case`)}
                  >
                    <Edit size={16} />
                    Edit
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => router.push(`/project/${id}/business-case`)}
                  >
                    View Full Details →
                  </Button>
                </div>
              </div>
              
              {/* Preview content */}
              <div className="text-gray-300 text-sm line-clamp-3 bg-white/5 p-4 rounded-lg">
                {getBusinessCasePreview()}...
              </div>
            </Card>
          </motion.div>

          {/* Content Strategy Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 hover:border-blue-400/30 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-400/20 rounded-lg">
                    <Newspaper className="text-blue-400" size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Content Strategy</h2>
                    <p className="text-sm text-gray-400">90-day content roadmap</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => router.push(`/project/${id}/content-strategy`)}
                  >
                    <Edit size={16} />
                    Edit
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => router.push(`/project/${id}/content-strategy`)}
                  >
                    View Full Details →
                  </Button>
                </div>
              </div>
              
              {/* Preview with key stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-white/5 rounded-lg">
                  <div className="text-2xl font-bold text-mint-400">90</div>
                  <div className="text-xs text-gray-400">Days</div>
                </div>
                <div className="text-center p-3 bg-white/5 rounded-lg">
                  <div className="text-2xl font-bold text-mint-400">30+</div>
                  <div className="text-xs text-gray-400">Content Pieces</div>
                </div>
                <div className="text-center p-3 bg-white/5 rounded-lg">
                  <div className="text-2xl font-bold text-mint-400">3</div>
                  <div className="text-xs text-gray-400">Platforms</div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Website Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 hover:border-purple-400/30 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-400/20 rounded-lg">
                    <Globe className="text-purple-400" size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Website</h2>
                    <p className="text-sm text-gray-400">Your live business website</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => window.open(`/website/${id}`, '_blank')}
                  >
                    <ExternalLink size={16} />
                    Open Live Site
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => router.push(`/project/${id}/website`)}
                  >
                    Customize →
                  </Button>
                </div>
              </div>
              
              {/* Website preview/screenshot */}
              <div className="aspect-video bg-white/5 rounded-lg flex items-center justify-center overflow-hidden relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Globe className="text-gray-600" size={48} />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-center">
                  <p className="text-sm text-gray-400">Click "Open Live Site" to view your website</p>
                </div>
              </div>
            </Card>
          </motion.div>

        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4 justify-center">
          <Button 
            onClick={() => router.push(`/project/${id}/generate`)}
            variant="ghost"
          >
            <RefreshCw size={16} />
            Regenerate Components
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}

// Prevent static generation - this page needs authentication and dynamic routing
export async function getServerSideProps() {
  return {
    props: {},
  }
}

