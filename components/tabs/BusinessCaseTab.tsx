import { useState } from 'react'
import { motion } from 'framer-motion'
import Button from '../ui/Button'
import Card from '../ui/Card'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Sparkles, RefreshCw, CheckCircle2 } from 'lucide-react'

interface BusinessCaseTabProps {
  dashboardId: string
  hasPurchased: boolean
  onGenerate: () => Promise<void>
  content: string | null
  regenerationCount: number
  isGenerating: boolean
}

export default function BusinessCaseTab({
  dashboardId,
  hasPurchased,
  onGenerate,
  content,
  regenerationCount,
  isGenerating,
}: BusinessCaseTabProps) {
  const canRegenerate = hasPurchased || regenerationCount < 1

  return (
    <div className="space-y-6">
      {!content ? (
        <Card className="text-center py-12">
          <Sparkles className="mx-auto mb-4 text-accent" size={48} />
          <h3 className="text-2xl font-bold mb-2">Generate Your Business Case</h3>
          <p className="text-secondary mb-6">
            Get a comprehensive 7-section strategy tailored to your business
          </p>
          <Button onClick={onGenerate} loading={isGenerating}>
            <Sparkles size={20} />
            Generate Business Case
          </Button>
        </Card>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-green-500" size={24} />
              <h3 className="text-xl font-bold">Your Business Case</h3>
            </div>
            
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

          {!hasPurchased && regenerationCount >= 1 && (
            <div className="bg-accentAlt/10 border border-accentAlt/20 rounded-lg p-4">
              <p className="text-sm text-accentAlt">
                You've used your free regeneration. Purchase to unlock unlimited regenerations.
              </p>
            </div>
          )}

          <Card className="prose prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </Card>
        </>
      )}
    </div>
  )
}

