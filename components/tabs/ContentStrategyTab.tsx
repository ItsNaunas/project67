import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Button from '../ui/Button'
import Card from '../ui/Card'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { TrendingUp, RefreshCw, CheckCircle2, Download, Copy, FileDown } from 'lucide-react'
import { ContentStrategySkeleton } from '../ui/Skeleton'
import VersionHistory from '../VersionHistory'
import GenerationProgress from '../GenerationProgress'
import { copyToClipboard, downloadMarkdown } from '@/lib/export/markdown'
import { exportAsPDF } from '@/lib/export/pdf'
import toast from 'react-hot-toast'

interface ContentStrategyTabProps {
  dashboardId: string
  hasPurchased: boolean
  onGenerate: () => Promise<void>
  content: string | null
  regenerationCount: number
  isGenerating: boolean
}

export default function ContentStrategyTab({
  dashboardId,
  hasPurchased,
  onGenerate,
  content,
  regenerationCount,
  isGenerating,
}: ContentStrategyTabProps) {
  const canRegenerate = hasPurchased || regenerationCount < 1
  const [displayContent, setDisplayContent] = useState(content)

  // Update display content when content prop changes
  useEffect(() => {
    setDisplayContent(content)
  }, [content])

  const handleRestoreVersion = (restoredContent: string) => {
    setDisplayContent(restoredContent)
    toast.success('Version restored! This is now your active content.')
  }

  const handleCopy = async () => {
    if (!displayContent) return
    const success = await copyToClipboard(displayContent)
    if (success) {
      toast.success('Copied to clipboard!')
    } else {
      toast.error('Failed to copy to clipboard')
    }
  }

  const handleDownloadMarkdown = () => {
    if (!displayContent) return
    downloadMarkdown(displayContent, 'content-strategy')
    toast.success('Markdown downloaded!')
  }

  const handleExportPDF = async () => {
    if (!displayContent) return
    try {
      await exportAsPDF(displayContent, 'content-strategy')
      toast.success('PDF exported!')
    } catch (error) {
      console.error('Error exporting PDF:', error)
      toast.error('Failed to export PDF')
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress indicator when generating */}
      {isGenerating && (
        <GenerationProgress type="content_strategy" isGenerating={isGenerating} />
      )}

      {isGenerating && !content ? (
        <Card>
          <ContentStrategySkeleton />
        </Card>
      ) : !content ? (
        <Card className="text-center py-12">
          <TrendingUp className="mx-auto mb-4 text-accent" size={48} />
          <h3 className="text-2xl font-bold mb-2">Generate Your Content Strategy</h3>
          <p className="text-secondary mb-6">
            Get 3 viral content hooks with complete frameworks
          </p>
          <Button onClick={onGenerate} loading={isGenerating}>
            <TrendingUp size={20} />
            Generate Content Strategy
          </Button>
        </Card>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-green-500" size={24} />
              <h3 className="text-xl font-bold">Your Content Strategy</h3>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Version History */}
              <VersionHistory
                dashboardId={dashboardId}
                contentType="content_strategy"
                currentContent={displayContent}
                onRestore={handleRestoreVersion}
              />
              
              {/* Export buttons */}
              <Button
                onClick={handleCopy}
                variant="ghost"
                size="sm"
                title="Copy to clipboard"
              >
                <Copy size={16} />
              </Button>
              <Button
                onClick={handleDownloadMarkdown}
                variant="ghost"
                size="sm"
                title="Download as Markdown"
              >
                <FileDown size={16} />
              </Button>
              <Button
                onClick={handleExportPDF}
                variant="ghost"
                size="sm"
                title="Export as PDF"
              >
                <Download size={16} />
              </Button>
              
              {/* Regenerate button */}
              {canRegenerate && (
                <Button
                  onClick={onGenerate}
                  variant="ghost"
                  size="sm"
                  loading={isGenerating}
                  disabled={isGenerating}
                >
                  <RefreshCw size={16} />
                  Regenerate
                </Button>
              )}
            </div>
          </div>

          {!hasPurchased && regenerationCount >= 1 && (
            <div className="bg-accentAlt/10 border border-accentAlt/20 rounded-lg p-4">
              <p className="text-sm text-accentAlt">
                You've used your free regeneration. Purchase to unlock unlimited regenerations.
              </p>
            </div>
          )}

          <Card className="prose prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {displayContent}
            </ReactMarkdown>
          </Card>
        </>
      )}
    </div>
  )
}

