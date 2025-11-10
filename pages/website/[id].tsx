import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import Head from 'next/head'
import { Edit3, Eye, Save, Grid3x3, Download } from 'lucide-react'
import Button from '@/components/ui/Button'
import { SectionRenderer } from '@/components/sections'
import type { PageLayout } from '@/lib/layout/schema'
import { pageLayoutSchema } from '@/lib/layout/schema'

export default function WebsiteDisplay() {
  const router = useRouter()
  const { id } = router.query
  const session = useSession()
  const supabase = useSupabaseClient()
  
  const [dashboard, setDashboard] = useState<any>(null)
  const [websiteContent, setWebsiteContent] = useState<any>(null)
  const [layout, setLayout] = useState<PageLayout | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isDevMode, setIsDevMode] = useState(false)
  const [hasPurchased, setHasPurchased] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id && session) {
      loadWebsite()
    }
  }, [id, session])

  // Apply dev mode styling to body when dev mode changes
  useEffect(() => {
    if (typeof document !== 'undefined' && isDevMode) {
      const timer = setTimeout(() => {
        const body = document.querySelector('body')
        if (body) {
          body.classList.toggle('dev-mode', isDevMode)
        }
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isDevMode])

  const loadWebsite = async () => {
    try {
      // Load dashboard
      const { data: dashboardData } = await supabase
        .from('dashboards')
        .select('*')
        .eq('id', id)
        .single()

      setDashboard(dashboardData)

      // Load published layout
      const { data: blueprint } = await supabase
        .from('layout_blueprints')
        .select('id, status')
        .eq('dashboard_id', id)
        .maybeSingle()

      let layoutLoaded = false

      if (blueprint?.id) {
        const { data: published } = await supabase
          .from('layout_versions')
          .select('layout')
          .eq('blueprint_id', blueprint.id)
          .eq('state', 'published')
          .order('created_at', { ascending: false })
          .maybeSingle()

        if (published?.layout) {
          try {
            const parsedLayout = pageLayoutSchema.parse(published.layout)
            setLayout(parsedLayout)
            layoutLoaded = true
          } catch (error) {
            console.error('Error parsing published layout:', error)
          }
        }
      }

      if (!layoutLoaded) {
        // Load website generation as fallback
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

  const downloadHtml = () => {
    const html = websiteContent?.previewHtml || websiteContent?.html
    if (!html) return
    
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${dashboard?.business_name || 'website'}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
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

  if ((!layout && !websiteContent) || !dashboard) {
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

  const isOwner = session?.user.id === dashboard?.user_id

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
        {/* Floating Toolbar (only for owners) */}
        {isOwner && (
          <div className="fixed top-4 right-4 z-50 flex gap-2">
            {/* Dev Mode Toggle */}
            <button
              onClick={() => setIsDevMode(!isDevMode)}
              className={`glass-effect px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                isDevMode ? 'bg-accent text-white' : 'hover:bg-white/10'
              }`}
              title="Toggle section boundaries"
            >
              <Grid3x3 size={20} />
              {isDevMode ? 'Dev Mode ON' : 'Dev Mode'}
            </button>

            {/* Download HTML */}
            <button
              onClick={downloadHtml}
              className="glass-effect px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-white/10 transition-colors"
              title="Download HTML file"
            >
              <Download size={20} />
              Download
            </button>

            {/* Edit Mode (future feature) */}
            {hasPurchased && (
              <button
                onClick={() => setIsEditMode(!isEditMode)}
                className="glass-effect px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-white/10 transition-colors"
                title="Edit mode (coming soon)"
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
            )}
          </div>
        )}

        {/* Dev Mode Info Banner */}
        {isDevMode && (
          <div className="fixed top-20 right-4 z-50 bg-accent text-white px-4 py-2 rounded-lg shadow-lg max-w-xs">
            <p className="text-sm font-semibold mb-1">🔧 Dev Mode Active</p>
            <p className="text-xs opacity-90">
              Section boundaries outlined. Hover over sections to see IDs.
            </p>
            <div className="mt-2 text-xs">
              <p>✓ Sections found: {websiteContent.metadata?.sections?.length || 0}</p>
              <p className="text-xs opacity-75 mt-1">
                {websiteContent.metadata?.sections?.join(', ') || 'Loading...'}
              </p>
            </div>
          </div>
        )}

        {/* Website Content */}
        {layout ? (
          <div className={`${isEditMode ? 'pt-20' : ''} ${isDevMode ? 'dev-mode' : ''}`}>
            {layout.sections.map((section) => (
              <SectionRenderer key={section.id} section={section} />
            ))}
          </div>
        ) : (
          <div
            className={`${isEditMode ? 'pt-20' : ''} ${isDevMode ? 'dev-mode' : ''}`}
            dangerouslySetInnerHTML={{
              __html:
                websiteContent?.previewHtml ||
                websiteContent?.html ||
                '<div>No content available</div>',
            }}
          />
        )}
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

