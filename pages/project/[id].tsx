import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import DashboardLayout from '@/components/DashboardLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { FileText, Newspaper, Globe, Edit, ExternalLink, RefreshCw, ArrowLeft, CheckCircle, BarChart3 } from 'lucide-react'
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

    const groupedGenerations: Record<string, unknown | null> = {
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
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-4 sm:mb-6">
          <div className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4">
            <button 
              onClick={() => router.push('/dashboard')}
              className="hover:text-mint-400 transition-colors"
            >
              Projects
            </button>
            <span className="mx-2">/</span>
            <span className="text-white truncate inline-block max-w-[200px] sm:max-w-none">{project.business_name}</span>
          </div>
          
          <Button 
            variant="ghost" 
            onClick={() => router.push('/dashboard')}
            size="sm"
            className="text-xs sm:text-sm"
          >
            <ArrowLeft size={14} />
            Back to Projects
          </Button>
        </div>

        {/* Header - Improved spacing */}
        <div className="mb-8 sm:mb-10">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-clash font-bold mb-2 sm:mb-3 text-white break-words">
                {project.business_name}
              </h1>
              <p className="text-gray-400 text-sm sm:text-base md:text-lg">{project.niche}</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-left sm:text-right">
                <div className="text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2">Status</div>
                <span className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-green-500/20 text-green-500 rounded-lg text-xs sm:text-sm font-semibold border border-green-500/30">
                  <CheckCircle size={14} />
                  Complete
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bento Grid Layout - 60/40 Split */}
        <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6 sm:gap-8 mb-8 sm:mb-10">
          
          {/* Left Column: Business Case (60%) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:row-span-2"
          >
            <Card className="p-6 sm:p-8 h-full hover:border-mint-400/30 hover:shadow-lg hover:shadow-mint-400/10 transition-all group">
              {/* Header */}
              <div className="flex items-start justify-between mb-4 sm:mb-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2 sm:p-3 bg-mint-400/20 rounded-xl group-hover:scale-110 transition-transform">
                    <FileText className="text-mint-400" size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold mb-1">Business Case</h2>
                    <p className="text-xs sm:text-sm text-gray-400">Your complete business plan and strategy</p>
                  </div>
                </div>
              </div>
              
              {/* Preview content with stats */}
              <div className="space-y-4 sm:space-y-6">
                <div className="text-gray-300 text-xs sm:text-sm leading-relaxed bg-white/5 p-4 sm:p-6 rounded-xl border border-white/5">
                  {getBusinessCasePreview()}...
                </div>
                
                {/* Quick stats */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  <div className="text-center p-4 bg-mint-400/10 rounded-lg border border-mint-400/20">
                    <BarChart3 className="text-mint-400 mx-auto mb-2" size={20} />
                    <div className="text-xl font-bold text-mint-400">7</div>
                    <div className="text-xs text-gray-400">Sections</div>
                  </div>
                  <div className="text-center p-4 bg-mint-400/10 rounded-lg border border-mint-400/20">
                    <FileText className="text-mint-400 mx-auto mb-2" size={20} />
                    <div className="text-xl font-bold text-mint-400">Full</div>
                    <div className="text-xs text-gray-400">Analysis</div>
                  </div>
                  <div className="text-center p-4 bg-mint-400/10 rounded-lg border border-mint-400/20">
                    <CheckCircle className="text-mint-400 mx-auto mb-2" size={20} />
                    <div className="text-xl font-bold text-mint-400">Ready</div>
                    <div className="text-xs text-gray-400">To Export</div>
                  </div>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-white/10">
                <Button 
                  onClick={() => router.push(`/project/${id}/business-case`)}
                  className="flex-1 text-sm sm:text-base"
                  size="sm"
                >
                  View Full Details →
                </Button>
                <Button 
                  variant="ghost"
                  onClick={() => router.push(`/project/${id}/business-case`)}
                  size="sm"
                  className="sm:w-auto"
                >
                  <Edit size={14} />
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Right Column: Content Strategy + Website (40%) */}
          <div className="space-y-6 sm:space-y-8">
            
            {/* Content Strategy Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-5 sm:p-6 hover:border-blue-400/30 hover:shadow-lg hover:shadow-blue-400/10 transition-all group">
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-blue-400/20 rounded-lg group-hover:scale-110 transition-transform">
                      <Newspaper className="text-blue-400" size={20} />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold">Content Strategy</h2>
                      <p className="text-xs sm:text-sm text-gray-400">90-day content roadmap</p>
                    </div>
                  </div>
                </div>
                
                {/* Preview with key stats */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="text-center p-3 bg-blue-400/10 rounded-lg border border-blue-400/20">
                    <div className="text-2xl font-bold text-blue-400">90</div>
                    <div className="text-xs text-gray-400">Days</div>
                  </div>
                  <div className="text-center p-3 bg-blue-400/10 rounded-lg border border-blue-400/20">
                    <div className="text-2xl font-bold text-blue-400">30+</div>
                    <div className="text-xs text-gray-400">Content</div>
                  </div>
                  <div className="text-center p-3 bg-blue-400/10 rounded-lg border border-blue-400/20">
                    <div className="text-2xl font-bold text-blue-400">3</div>
                    <div className="text-xs text-gray-400">Platforms</div>
                  </div>
                </div>
                
                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-2 pt-3 sm:pt-4 border-t border-white/10">
                  <Button 
                    size="sm"
                    onClick={() => router.push(`/project/${id}/content-strategy`)}
                    className="flex-1 text-xs sm:text-sm"
                  >
                    View Details →
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => router.push(`/project/${id}/content-strategy`)}
                    className="sm:w-auto"
                  >
                    <Edit size={14} />
                  </Button>
                </div>
              </Card>
            </motion.div>

            {/* Website Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-5 sm:p-6 hover:border-purple-400/30 hover:shadow-lg hover:shadow-purple-400/10 transition-all group">
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-purple-400/20 rounded-lg group-hover:scale-110 transition-transform">
                      <Globe className="text-purple-400" size={20} />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold">Website</h2>
                      <p className="text-xs sm:text-sm text-gray-400">Your live business website</p>
                    </div>
                  </div>
                </div>
                
                {/* Website preview - Reduced height */}
                <div className="aspect-[16/10] bg-white/5 rounded-lg flex items-center justify-center overflow-hidden relative mb-4 group-hover:border-purple-400/20 border border-transparent transition-colors">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Globe className="text-gray-600" size={40} />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 text-center">
                    <p className="text-xs text-gray-400">Click below to view live</p>
                  </div>
                </div>
                
                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    size="sm"
                    onClick={() => window.open(`/website/${id}`, '_blank')}
                    className="flex-1 text-xs sm:text-sm"
                  >
                    <ExternalLink size={14} />
                    Open Live Site
                  </Button>
                  <Button 
                    size="sm"
                    variant="ghost"
                    onClick={() => router.push(`/project/${id}/website`)}
                    className="text-xs sm:text-sm"
                  >
                    Customize
                  </Button>
                </div>
              </Card>
            </motion.div>
            
          </div>
        </div>

        {/* Quick Actions Bar */}
        <motion.div 
          className="mt-8 sm:mt-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-base sm:text-lg mb-1">Need to make changes?</h3>
                <p className="text-xs sm:text-sm text-gray-400">Regenerate any component or edit project details</p>
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={() => router.push(`/project/${id}/generate`)}
                  variant="ghost"
                  size="sm"
                  className="text-xs sm:text-sm w-full sm:w-auto"
                >
                  <RefreshCw size={14} />
                  Regenerate
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
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

