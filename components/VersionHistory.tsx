import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from './ui/Button'
import { History, ChevronDown, RotateCcw, Clock } from 'lucide-react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import toast from 'react-hot-toast'

interface Version {
  id: string
  content: string
  created_at: string
  version_number: number
}

interface VersionHistoryProps {
  dashboardId: string
  contentType: 'business_case' | 'content_strategy'
  currentContent: string | null
  onRestore: (content: string) => void
}

export default function VersionHistory({
  dashboardId,
  contentType,
  currentContent,
  onRestore,
}: VersionHistoryProps) {
  const supabase = useSupabaseClient()
  const [versions, setVersions] = useState<Version[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null)

  useEffect(() => {
    loadVersions()
  }, [dashboardId, contentType])

  const loadVersions = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('generations')
        .select('id, content, created_at')
        .eq('dashboard_id', dashboardId)
        .eq('type', contentType)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Add version numbers (newest = highest number)
      const versionsWithNumbers = (data || []).map((v, index) => ({
        ...v,
        version_number: data!.length - index,
      }))

      setVersions(versionsWithNumbers)
      
      // Set the most recent as selected by default
      if (versionsWithNumbers.length > 0) {
        setSelectedVersionId(versionsWithNumbers[0].id)
      }
    } catch (error) {
      console.error('Error loading versions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRestore = async (version: Version) => {
    try {
      onRestore(version.content)
      setIsOpen(false)
      toast.success(`Restored to Version ${version.version_number}`)
    } catch (error) {
      console.error('Error restoring version:', error)
      toast.error('Failed to restore version')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  const isCurrent = (version: Version) => {
    return version.content === currentContent
  }

  if (versions.length <= 1) {
    // Don't show version history if there's only one version
    return null
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <History size={16} />
        <span className="text-sm">
          Version {versions.find(v => isCurrent(v))?.version_number || versions[0]?.version_number}
        </span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 top-full mt-2 w-80 glass-effect rounded-lg border border-white/10 shadow-xl z-50 overflow-hidden"
            >
              <div className="p-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <History size={16} className="text-mint-400" />
                  <h4 className="font-semibold text-sm">Version History</h4>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {versions.length} version{versions.length !== 1 ? 's' : ''} available
                </p>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mint-400 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-400">Loading versions...</p>
                  </div>
                ) : (
                  <div className="p-2 space-y-1">
                    {versions.map((version, index) => (
                      <motion.div
                        key={version.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-3 rounded-lg transition-colors ${
                          isCurrent(version)
                            ? 'bg-mint-400/20 border border-mint-400/30'
                            : 'hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm">
                                Version {version.version_number}
                              </span>
                              {isCurrent(version) && (
                                <span className="text-xs px-2 py-0.5 bg-mint-400/20 text-mint-400 rounded-full">
                                  Current
                                </span>
                              )}
                              {index === 0 && !isCurrent(version) && (
                                <span className="text-xs px-2 py-0.5 bg-blue-400/20 text-blue-400 rounded-full">
                                  Latest
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-400">
                              <Clock size={12} />
                              <span>{formatDate(version.created_at)}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {version.content.substring(0, 100)}...
                            </p>
                          </div>
                          
                          {!isCurrent(version) && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRestore(version)}
                              className="flex-shrink-0"
                              title="Restore this version"
                            >
                              <RotateCcw size={14} />
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

