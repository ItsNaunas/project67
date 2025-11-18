import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import HighlightBox from '../ui/HighlightBox'
import { motion } from 'framer-motion'

interface EnhancedMarkdownProps {
  content: string
  type?: 'business_case' | 'content_strategy'
}

// Custom components for better rendering
const components = {
  h1: ({ node, ...props }: any) => (
    <motion.h1
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-4xl sm:text-5xl font-clash font-bold mb-6 mt-12 text-white"
      style={{ letterSpacing: '-0.02em', lineHeight: '1.1' }}
      {...props}
    />
  ),
  h2: ({ node, ...props }: any) => (
    <motion.h2
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-2xl sm:text-3xl font-clash font-bold mb-4 mt-10 text-white border-b border-white/10 pb-3"
      style={{ letterSpacing: '-0.01em', lineHeight: '1.2' }}
      {...props}
    />
  ),
  h3: ({ node, ...props }: any) => (
    <h3
      className="text-xl sm:text-2xl font-semibold mb-3 mt-8 text-white"
      style={{ lineHeight: '1.3' }}
      {...props}
    />
  ),
  h4: ({ node, ...props }: any) => (
    <h4
      className="text-lg font-semibold mb-2 mt-6 text-white"
      style={{ lineHeight: '1.4' }}
      {...props}
    />
  ),
  p: ({ node, ...props }: any) => (
    <p
      className="mb-6 text-base text-gray-300 leading-relaxed"
      {...props}
    />
  ),
  ul: ({ node, ...props }: any) => (
    <ul
      className="mb-6 ml-6 text-gray-300 space-y-2 list-disc"
      {...props}
    />
  ),
  ol: ({ node, ...props }: any) => (
    <ol
      className="mb-6 ml-6 text-gray-300 space-y-2 list-decimal"
      {...props}
    />
  ),
  li: ({ node, ...props }: any) => (
    <li
      className="mb-3 leading-relaxed"
      {...props}
    />
  ),
  strong: ({ node, ...props }: any) => (
    <strong className="font-bold text-white" {...props} />
  ),
  hr: ({ node, ...props }: any) => (
    <hr className="my-10 border-t border-white/10" {...props} />
  ),
  blockquote: ({ node, ...props }: any) => (
    <blockquote
      className="border-l-4 border-mint-400/50 pl-6 italic text-gray-300 mb-6 my-8 bg-white/5 py-4 rounded-r-lg"
      {...props}
    />
  ),
}

export default function EnhancedMarkdown({ content, type = 'business_case' }: EnhancedMarkdownProps) {
  // Process content to add section structure for business case
  let processedContent = content

  if (type === 'business_case') {
    // Add section numbers and structure
    processedContent = processedContent
      .replace(/^##\s*1\.\s*Core\s+Concept/gi, '## 1. Core Concept')
      .replace(/^##\s*2\.\s*Market\s+Opportunity/gi, '## 2. Market Opportunity')
      .replace(/^##\s*3\.\s*Positioning/gi, '## 3. Positioning')
      .replace(/^##\s*4\.\s*Offer\s+Structure/gi, '## 4. Offer Structure')
      .replace(/^##\s*5\.\s*Growth\s+Strategy/gi, '## 5. Growth Strategy')
      .replace(/^##\s*6\.\s*Operations/gi, '## 6. Operations')
      .replace(/^##\s*7\.\s*Final\s+Summary/gi, '## 7. Final Summary')
  }

  return (
    <div className="prose prose-invert max-w-[700px] mx-auto">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  )
}

