import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Modal from '@/components/ui/Modal'
import DashboardLayout from '@/components/DashboardLayout'
import Achievements from '@/components/Achievements'
import { UserStats } from '@/lib/achievements'
import { 
  Plus, 
  ExternalLink, 
  Sparkles, 
  TrendingUp, 
  Zap,
  Gift,
  LogOut,
  Crown,
  ChevronRight,
  Trash2,
  CheckCircle,
  Search,
  Filter,
  SortAsc
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const router = useRouter()
  const session = useSession()
  const supabase = useSupabaseClient()
  
  const [profile, setProfile] = useState<any>(null)
  const [dashboards, setDashboards] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreditModal, setShowCreditModal] = useState(false)
  const [purchasingCredits, setPurchasingCredits] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'complete' | 'in-progress'>('all')
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'name'>('recent')
  const [totalRegenerations, setTotalRegenerations] = useState(0)

  useEffect(() => {
    if (session) {
      loadProfile()
      loadDashboards()
    } else {
      router.push('/')
    }
  }, [session])

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

  const loadDashboards = async () => {
    const { data, error } = await supabase
      .from('dashboards')
      .select('*')
      .eq('user_id', session?.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading dashboards:', error)
      return
    }

    // Count total regenerations from generations table
    if (data && data.length > 0) {
      const { count } = await supabase
        .from('generations')
        .select('*', { count: 'exact', head: true })
        .in('dashboard_id', data.map(d => d.id))
        .in('type', ['business_case', 'content_strategy'])
      
      setTotalRegenerations(count || 0)
    }

    setDashboards(data || [])
    setLoading(false)
  }

  const handleCreateDashboard = async () => {
    // In dev mode, allow unlimited dashboards
    const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true'
    
    if (!isDevMode && !profile?.has_purchased && dashboards.length >= 1) {
      // Check if user has enough credits
      if (profile?.credits < 750) {
        setShowCreditModal(true)
        return
      }

      // Deduct credits
      const { error } = await supabase
        .from('profiles')
        .update({ credits: profile.credits - 750 })
        .eq('id', session?.user.id)

      if (error) {
        toast.error('Failed to create dashboard. Please try again.')
        return
      }
    }

    router.push('/generate')
  }

  const handleBuyCredits = async (amount: number, price: number, priceId: string) => {
    setPurchasingCredits(priceId)

    try {
      const response = await fetch('/api/buy-credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount, 
          priceId,
          userId: session?.user.id 
        }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Error buying credits:', error)
      toast.error('Failed to purchase credits. Please try again.')
    } finally {
      setPurchasingCredits(null)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleDeleteDashboard = async (dashboardId: string) => {
    try {
      // Delete all generations first (cascade should handle this, but being explicit)
      await supabase
        .from('generations')
        .delete()
        .eq('dashboard_id', dashboardId)
      
      // Delete the dashboard
      const { error } = await supabase
        .from('dashboards')
        .delete()
        .eq('id', dashboardId)
        .eq('user_id', session?.user.id) // Security: only delete own dashboards
      
      if (error) throw error
      
      toast.success('Project deleted successfully')
      loadDashboards() // Refresh the list
    } catch (error) {
      console.error('Error deleting dashboard:', error)
      toast.error('Failed to delete project')
    }
  }

  const getProgressPercentage = () => {
    if (!dashboards.length) return 0
    const completedCount = dashboards.filter(d => d.status === 'complete').length
    return Math.round((completedCount / dashboards.length) * 100)
  }

  // Calculate user stats for achievements
  const userStats: UserStats = {
    projectsCreated: dashboards.length,
    projectsCompleted: dashboards.filter(d => 
      d.business_case_generated && d.content_strategy_generated && d.website_generated
    ).length,
    regenerationsTotal: totalRegenerations,
    hasWebsiteLive: dashboards.some(d => d.website_generated),
    hasPurchased: profile?.has_purchased || false,
  }

  // Filter and sort dashboards
  const filteredDashboards = dashboards
    .filter(dashboard => {
      // Search filter
      const matchesSearch = 
        dashboard.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dashboard.niche?.toLowerCase().includes(searchQuery.toLowerCase())

      // Status filter
      const isComplete = dashboard.business_case_generated && 
                         dashboard.content_strategy_generated && 
                         dashboard.website_generated
      const matchesStatus = 
        filterStatus === 'all' ||
        (filterStatus === 'complete' && isComplete) ||
        (filterStatus === 'in-progress' && !isComplete)

      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      } else if (sortBy === 'oldest') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      } else { // name
        return (a.business_name || '').localeCompare(b.business_name || '')
      }
    })

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

  const progress = getProgressPercentage()

  return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <h1 className="text-3xl sm:text-4xl font-clash font-bold mb-2 text-white">
              Welcome back, {profile?.full_name || 'Builder'}
            </h1>
            <p className="text-sm sm:text-base text-gray-400">Your empire awaits</p>
          </div>
          
          <div className="flex items-center gap-4">
            {profile?.has_purchased && (
              <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 glass-effect rounded-lg border border-accentAlt/20">
                <Crown className="text-accentAlt" size={18} />
                <span className="font-semibold text-sm sm:text-base">Premium</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards - Improved with hover effects and shadows */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card className="text-center shadow-lg shadow-mint-400/10 hover:shadow-mint-400/20 hover:border-mint-400/30 transition-all">
              <h3 className="text-secondary text-xs sm:text-sm mb-2 sm:mb-3 uppercase tracking-wider">Total Projects</h3>
              <p className="text-4xl sm:text-5xl font-bold text-gradient mb-1 sm:mb-2">{dashboards.length}</p>
              <div className="text-xs text-gray-500">Active dashboards</div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card className="text-center shadow-lg shadow-blue-400/10 hover:shadow-blue-400/20 hover:border-blue-400/30 transition-all">
              <h3 className="text-secondary text-xs sm:text-sm mb-2 sm:mb-3 uppercase tracking-wider">Progress to 6 Figures</h3>
              <p className="text-4xl sm:text-5xl font-bold text-gradient mb-1 sm:mb-2">{progress}%</p>
              <div className="text-xs text-gray-500">Keep building</div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
            className="sm:col-span-2 md:col-span-1"
          >
            <Card className="text-center shadow-lg shadow-accentAlt/10 hover:shadow-accentAlt/20 hover:border-accentAlt/30 transition-all">
              <h3 className="text-secondary text-xs sm:text-sm mb-2 sm:mb-3 uppercase tracking-wider">Available Credits</h3>
              <p className="text-4xl sm:text-5xl font-bold text-gradient mb-1 sm:mb-2">{profile?.credits || 0}</p>
              <div className="text-xs text-gray-500">For new generations</div>
            </Card>
          </motion.div>
        </div>

        {/* Progress Message */}
        {progress > 0 && progress < 100 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-8 glass-effect rounded-xl p-4 sm:p-6 border-l-4 border-accent"
          >
            <p className="text-sm sm:text-base md:text-lg">
              <Sparkles className="inline mr-2 text-accent" size={18} />
              You're <span className="font-bold text-accent">{progress}%</span> of the way there! 
              Keep building to unlock your full potential.
            </p>
          </motion.div>
        )}

        {/* Achievements - More prominent styling */}
        {dashboards.length > 0 && (
          <motion.div 
            className="mb-6 sm:mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Achievements stats={userStats} compact />
          </motion.div>
        )}

        {/* Create New Dashboard */}
        <div className="mb-6 sm:mb-8">
          <Button onClick={handleCreateDashboard} size="lg" className="w-full sm:w-auto">
            <Plus size={20} />
            Create New Project
          </Button>
          
          {process.env.NEXT_PUBLIC_DEV_MODE === 'true' ? (
            <p className="text-xs sm:text-sm text-accent mt-2">
              🚧 Dev Mode: Unlimited dashboards enabled
            </p>
          ) : (
            !profile?.has_purchased && dashboards.length >= 1 && (
              <p className="text-xs sm:text-sm text-secondary mt-2">
                Costs 750 credits per new dashboard (you have {profile?.credits || 0} credits)
              </p>
            )
          )}
        </div>

        {/* Dashboards Grid */}
        <div className="mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-clash font-bold">Your Projects</h2>
            {dashboards.length > 0 && (
              <div className="text-xs sm:text-sm text-gray-400 bg-white/5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg self-start sm:self-auto">
                {filteredDashboards.length} of {dashboards.length} {dashboards.length === 1 ? 'project' : 'projects'}
              </div>
            )}
          </div>

          {/* Search and Filters */}
          {dashboards.length > 0 && (
            <div className="glass-effect rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex flex-col gap-3 sm:gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search by name or niche..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm bg-white/5 border border-white/10 rounded-lg focus:border-mint-400 focus:outline-none transition-colors"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  {/* Filter by Status */}
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant={filterStatus === 'all' ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => setFilterStatus('all')}
                      className="text-xs sm:text-sm"
                    >
                      All
                    </Button>
                    <Button
                      variant={filterStatus === 'complete' ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => setFilterStatus('complete')}
                      className="text-xs sm:text-sm"
                    >
                      <CheckCircle size={14} />
                      <span className="hidden xs:inline">Complete</span>
                    </Button>
                    <Button
                      variant={filterStatus === 'in-progress' ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => setFilterStatus('in-progress')}
                      className="text-xs sm:text-sm"
                    >
                      <Zap size={14} />
                      <span className="hidden xs:inline">In Progress</span>
                    </Button>
                  </div>

                  {/* Sort */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg focus:border-mint-400 focus:outline-none transition-colors"
                  >
                    <option value="recent">Recent</option>
                    <option value="oldest">Oldest</option>
                    <option value="name">Name A-Z</option>
                  </select>
                </div>
              </div>
            </div>
          )}
          
          {dashboards.length === 0 ? (
            <Card className="text-center py-12">
              <Sparkles className="mx-auto mb-4 text-accent" size={48} />
              <h3 className="text-xl font-bold mb-2">No projects yet</h3>
              <p className="text-secondary mb-6">Create your first project to get started</p>
              <Button onClick={() => router.push('/generate')}>
                Get Started
              </Button>
            </Card>
          ) : filteredDashboards.length === 0 ? (
            <Card className="text-center py-12">
              <Search className="mx-auto mb-4 text-gray-400" size={48} />
              <h3 className="text-xl font-bold mb-2">No projects found</h3>
              <p className="text-secondary mb-6">
                Try adjusting your search or filters
              </p>
              <Button 
                variant="ghost"
                onClick={() => {
                  setSearchQuery('')
                  setFilterStatus('all')
                }}
              >
                Clear Filters
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {filteredDashboards.map((dashboard, index) => (
                <motion.div
                  key={dashboard.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <DashboardCard
                    dashboard={dashboard}
                    onOpen={() => {
                      const isComplete = dashboard.business_case_generated && 
                                       dashboard.content_strategy_generated && 
                                       dashboard.website_generated
                      if (isComplete) {
                        router.push(`/project/${dashboard.id}`)
                      } else {
                        router.push(`/project/${dashboard.id}/generate`)
                      }
                    }}
                    onDelete={() => handleDeleteDashboard(dashboard.id)}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Referral Program - More compact */}
        {profile?.has_purchased && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="mb-6 sm:mb-8 glow-gold shadow-lg shadow-accentAlt/20">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="p-3 bg-accentAlt/20 rounded-xl">
                  <Gift className="text-accentAlt flex-shrink-0" size={24} />
                </div>
                <div className="flex-1 w-full sm:w-auto">
                  <h3 className="text-base sm:text-lg font-bold mb-1">Earn £16.75 Per Referral</h3>
                  <p className="text-gray-400 text-xs sm:text-sm mb-3">
                    Share Project 67 and earn 50% commission on every sale
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={`${process.env.NEXT_PUBLIC_APP_URL}/ref/${session?.user.id}`}
                      readOnly
                      className="flex-1 bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-xs sm:text-sm focus:border-accentAlt focus:outline-none"
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${process.env.NEXT_PUBLIC_APP_URL}/ref/${session?.user.id}`
                        )
                        toast.success('Referral link copied to clipboard!')
                      }}
                      className="w-full sm:w-auto"
                    >
                      Copy Link
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
      {/* Credit Purchase Modal */}
      <Modal
        isOpen={showCreditModal}
        onClose={() => setShowCreditModal(false)}
        title="Purchase Credits"
      >
        <p className="text-secondary mb-6">
          You need 750 credits to create a new dashboard. Purchase credits below:
        </p>

        <div className="space-y-4">
          <Card hover className="cursor-pointer" onClick={() => handleBuyCredits(500, 6.99, 'credits_500')}>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-lg">500 Credits</h4>
                <p className="text-sm text-secondary">Not enough for a new dashboard</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-accent">£6.99</p>
                {purchasingCredits === 'credits_500' && (
                  <p className="text-xs text-secondary">Loading...</p>
                )}
              </div>
            </div>
          </Card>

          <Card hover className="cursor-pointer glow-accent" onClick={() => handleBuyCredits(1000, 12.99, 'credits_1000')}>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-lg">1,000 Credits</h4>
                <p className="text-sm text-secondary">Enough for 1 new dashboard + extra</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-accent">£12.99</p>
                <p className="text-xs text-accentAlt">Best Value</p>
                {purchasingCredits === 'credits_1000' && (
                  <p className="text-xs text-secondary">Loading...</p>
                )}
              </div>
            </div>
          </Card>
        </div>
      </Modal>
    </DashboardLayout>
  )
}

interface DashboardCardProps {
  dashboard: any
  onOpen: () => void
  onDelete: () => void
}

function DashboardCard({ dashboard, onOpen, onDelete }: DashboardCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  // Calculate completion
  const completionCount = [
    dashboard.business_case_generated,
    dashboard.content_strategy_generated, 
    dashboard.website_generated
  ].filter(Boolean).length
  
  const isComplete = completionCount === 3

  return (
    <>
      <motion.div 
        whileHover={{ scale: 1.03, y: -5 }}
        transition={{ duration: 0.2 }}
      >
        <Card hover className="h-full relative group shadow-lg hover:shadow-xl hover:shadow-mint-400/20 transition-shadow">
          {/* Make entire card clickable */}
          <div 
            onClick={onOpen}
            className="cursor-pointer"
          >
            {/* Status badge */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">{dashboard.business_name}</h3>
                <p className="text-secondary text-sm">{dashboard.niche}</p>
              </div>
              
              {isComplete ? (
                <span className="px-2 py-1 bg-green-500/20 text-green-500 rounded text-xs font-semibold">
                  Complete
                </span>
              ) : (
                <span className="px-2 py-1 bg-blue-500/20 text-blue-500 rounded text-xs font-semibold">
                  In Progress
                </span>
              )}
            </div>
            
            {/* Progress indicator */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                <span>Progress</span>
                <span>{completionCount}/3 Complete</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5">
                <div 
                  className="bg-gradient-to-r from-mint-400 to-mint-600 h-1.5 rounded-full transition-all"
                  style={{ width: `${(completionCount / 3) * 100}%` }}
                />
              </div>
            </div>
            
            {/* Quick stats */}
            <div className="flex gap-2 text-xs flex-wrap">
              <div className={`px-2 py-1 rounded ${dashboard.business_case_generated ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'}`}>
                Business Case
              </div>
              <div className={`px-2 py-1 rounded ${dashboard.content_strategy_generated ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'}`}>
                Content
              </div>
              <div className={`px-2 py-1 rounded ${dashboard.website_generated ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'}`}>
                Website
              </div>
            </div>
          </div>
          
          {/* Action buttons - appear on hover */}
          <div className="mt-4 pt-4 border-t border-white/10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              size="sm" 
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation()
                setShowDeleteConfirm(true)
              }}
              className="text-red-400 hover:text-red-300"
            >
              <Trash2 size={14} />
              Delete
            </Button>
          </div>
        </Card>
      </motion.div>
      
      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <Modal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          title="Delete Project?"
        >
          <p className="text-secondary mb-6">
            Are you sure you want to delete "{dashboard.business_name}"? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                await onDelete()
                setShowDeleteConfirm(false)
              }}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete Project
            </Button>
          </div>
        </Modal>
      )}
    </>
  )
}

// Prevent static generation - this page needs authentication
export async function getServerSideProps() {
  return {
    props: {},
  }
}

