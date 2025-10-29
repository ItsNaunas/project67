import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import DashboardLayout from '@/components/DashboardLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { ArrowLeft, ExternalLink, RefreshCw, Globe } from 'lucide-react'
import toast from 'react-hot-toast'

export default function WebsiteDetail() {
  const router = useRouter()
  const { id } = router.query
  const session = useSession()
  const supabase = useSupabaseClient()
  
  const [project, setProject] = useState<any>(null)
  const [websiteData, setWebsiteData] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

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

    // Load website generation
    const { data: generations } = await supabase
      .from('generations')
      .select('*')
      .eq('dashboard_id', id)
      .eq('type', 'website')
      .order('created_at', { ascending: false })

    if (generations && generations.length > 0) {
      setWebsiteData(generations[0].content)
      
      // Parse template ID
      try {
        const content = typeof generations[0].content === 'string' 
          ? JSON.parse(generations[0].content) 
          : generations[0].content
        if (content.templateId) {
          setSelectedTemplate(content.templateId)
        }
      } catch (e) {
        console.error('Error parsing website content:', e)
      }
    }

    setLoading(false)
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

  if (!websiteData) {
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
            <h3 className="text-xl font-bold mb-2">No website found</h3>
            <p className="text-secondary mb-6">Generate your website first</p>
            <Button onClick={() => router.push(`/project/${id}/generate`)}>
              Go to Generation Mode
            </Button>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.push(`/project/${id}`)}
            className="mb-4"
          >
            <ArrowLeft size={16} />
            Back to Overview
          </Button>
          
          <div className="text-sm text-gray-400 mb-2">
            Projects / {project?.business_name} / Website
          </div>
          <h1 className="text-4xl font-clash font-bold mb-2">Website</h1>
          <p className="text-gray-400">Your live business website</p>
        </div>

        {/* Action Bar */}
        <div className="flex gap-3 mb-6">
          <Button 
            onClick={() => window.open(`/website/${id}`, '_blank')}
            size="sm"
          >
            <ExternalLink size={16} />
            Open Live Site
          </Button>
          
          <Button 
            onClick={() => router.push(`/project/${id}/generate`)}
            variant="ghost"
            size="sm"
          >
            <RefreshCw size={16} />
            Change Template
          </Button>
        </div>

        {/* Website Preview */}
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-bold mb-2">Website Preview</h3>
            <p className="text-sm text-gray-400">
              Template {selectedTemplate} • Click "Open Live Site" to view full website
            </p>
          </div>
          
          <div className="aspect-video bg-white/5 rounded-lg flex items-center justify-center overflow-hidden relative border border-white/10">
            <div className="absolute inset-0 flex items-center justify-center">
              <Globe className="text-gray-600" size={64} />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-8 left-0 right-0 text-center">
              <Button 
                onClick={() => window.open(`/website/${id}`, '_blank')}
                size="lg"
              >
                <ExternalLink size={20} />
                View Live Website
              </Button>
            </div>
          </div>
        </Card>

        {/* Customization Info */}
        <Card className="p-6 mt-6">
          <h3 className="text-lg font-bold mb-2">Customization</h3>
          <p className="text-sm text-gray-400 mb-4">
            Your website is live and ready to use. You can change the template or regenerate content at any time.
          </p>
          
          <div className="flex gap-3">
            <Button 
              onClick={() => router.push(`/project/${id}/generate`)}
              variant="ghost"
            >
              Choose Different Template
            </Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export async function getServerSideProps() {
  return {
    props: {},
  }
}

