import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import Head from 'next/head'
import { Edit3, Eye, Save } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function WebsiteDisplay() {
  const router = useRouter()
  const { id } = router.query
  const session = useSession()
  const supabase = useSupabaseClient()
  
  const [dashboard, setDashboard] = useState<any>(null)
  const [websiteContent, setWebsiteContent] = useState<any>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [hasPurchased, setHasPurchased] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id && session) {
      loadWebsite()
    }
  }, [id, session])

  const loadWebsite = async () => {
    try {
      // Load dashboard
      const { data: dashboardData } = await supabase
        .from('dashboards')
        .select('*')
        .eq('id', id)
        .single()

      setDashboard(dashboardData)

      // Load website generation
      const { data: websiteGen } = await supabase
        .from('generations')
        .select('content')
        .eq('dashboard_id', id)
        .eq('type', 'website')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (websiteGen?.content) {
        try {
          const parsed = typeof websiteGen.content === 'string' 
            ? JSON.parse(websiteGen.content) 
            : websiteGen.content
          setWebsiteContent(parsed)
        } catch (e) {
          console.error('Error parsing website content:', e)
        }
      }

      // Check if user has purchased (and is the owner)
      if (session?.user.id === dashboardData?.user_id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('has_purchased')
          .eq('id', session?.user.id)
          .single()
        
        setHasPurchased(profile?.has_purchased || false)
      }

      setLoading(false)
    } catch (error) {
      console.error('Error loading website:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-gray-400">Loading website...</p>
        </div>
      </div>
    )
  }

  if (!websiteContent || !dashboard) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <h1 className="text-3xl font-bold mb-4 text-white">Website Not Found</h1>
          <p className="text-gray-400 mb-6">
            This website hasn't been generated yet. Please generate it from your dashboard.
          </p>
          <Button onClick={() => router.push('/dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{dashboard.business_name}</title>
        <meta name="description" content={dashboard.niche} />
        <meta property="og:title" content={dashboard.business_name} />
        <meta property="og:description" content={dashboard.niche} />
        <meta property="og:type" content="website" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className="min-h-screen bg-white">
        {/* Floating Edit Toolbar (only for owners who have purchased) */}
        {hasPurchased && (
          <div className="fixed top-4 right-4 z-50 flex gap-2">
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className="glass-effect px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-white/10 transition-colors"
            >
              {isEditMode ? (
                <>
                  <Eye size={20} />
                  View Mode
                </>
              ) : (
                <>
                  <Edit3 size={20} />
                  Edit Mode
                </>
              )}
            </button>
            
            {isEditMode && (
              <button
                onClick={() => {
                  setIsEditMode(false)
                  // TODO: Implement save functionality
                  alert('Website editor will be available soon!')
                }}
                className="glass-effect px-4 py-2 rounded-lg flex items-center gap-2 bg-accent hover:bg-accentAlt transition-colors"
              >
                <Save size={20} />
                Save Changes
              </button>
            )}
          </div>
        )}

        {/* Website Content */}
        <div 
          className={`${isEditMode ? 'pt-20' : ''}`}
          dangerouslySetInnerHTML={{ 
            __html: websiteContent.html || '<div>No content available</div>' 
          }}
        />
      </div>
    </>
  )
}

// Prevent static generation - this page is dynamic
export async function getServerSideProps() {
  return {
    props: {},
  }
}

