import React, { useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import HighlightBox from '../ui/HighlightBox'
import Card from '../ui/Card'
import { motion } from 'framer-motion'

interface StructuredMarkdownProps {
  content: string
  type?: 'business_case' | 'content_strategy'
}

// Parse markdown into structured sections for business case
function parseBusinessCaseSections(content: string) {
  const sections: Array<{ number: string; title: string; content: string }> = []
  
  // Split by ## headers (H2 level)
  const sectionRegex = /^##\s+(\d+)\.\s*(.+)$/gm
  const matches = Array.from(content.matchAll(sectionRegex))
  
  if (matches.length === 0) {
    // Fallback: try to find any H2 headers
    const fallbackRegex = /^##\s+(.+)$/gm
    const fallbackMatches = Array.from(content.matchAll(fallbackRegex))
    
    for (let i = 0; i < fallbackMatches.length; i++) {
      const match = fallbackMatches[i]
      const startIndex = match.index || 0
      const endIndex = i < fallbackMatches.length - 1 
        ? (fallbackMatches[i + 1].index || content.length)
        : content.length
      
      const sectionContent = content.substring(startIndex + match[0].length, endIndex).trim()
      const titleMatch = match[1].match(/^(\d+)\.\s*(.+)$/)
      
      sections.push({
        number: titleMatch ? titleMatch[1] : String(i + 1),
        title: titleMatch ? titleMatch[2] : match[1],
        content: sectionContent
      })
    }
  } else {
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i]
      const startIndex = match.index || 0
      const endIndex = i < matches.length - 1 
        ? (matches[i + 1].index || content.length)
        : content.length
      
      const sectionContent = content.substring(startIndex + match[0].length, endIndex).trim()
      
      sections.push({
        number: match[1],
        title: match[2],
        content: sectionContent
      })
    }
  }
  
  return sections
}

// Parse content strategy hooks
function parseContentStrategyHooks(content: string) {
  const hooks: Array<{ title: string; content: string }> = []
  
  // Try to find numbered hooks (1., 2., 3.) or quoted titles
  const hookPatterns = [
    /^##\s+(\d+)\.\s*["']?([^"'\n]+)["']?/gm,  // ## 1. "Title"
    /^#\s+(\d+)\.\s*["']?([^"'\n]+)["']?/gm,   // # 1. "Title"
    /^(\d+)\.\s*["']([^"']+)["']/gm,            // 1. "Title"
  ]
  
  let matches: RegExpMatchArray[] = []
  for (const pattern of hookPatterns) {
    matches = Array.from(content.matchAll(pattern))
    if (matches.length > 0) break
  }
  
  if (matches.length > 0) {
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i]
      const startIndex = match.index || 0
      const endIndex = i < matches.length - 1 
        ? (matches[i + 1].index || content.length)
        : content.length
      
      const hookContent = content.substring(startIndex + match[0].length, endIndex).trim()
      const title = match[match.length - 1] // Last capture group is the title
      
      hooks.push({
        title: title.trim(),
        content: hookContent
      })
    }
  } else {
    // Fallback: split by major headers
    const headerRegex = /^(?:#|##)\s+(.+)$/gm
    const headerMatches = Array.from(content.matchAll(headerRegex))
    
    for (let i = 0; i < headerMatches.length; i++) {
      const match = headerMatches[i]
      const startIndex = match.index || 0
      const endIndex = i < headerMatches.length - 1 
        ? (headerMatches[i + 1].index || content.length)
        : content.length
      
      const hookContent = content.substring(startIndex + match[0].length, endIndex).trim()
      
      hooks.push({
        title: match[1].trim(),
        content: hookContent
      })
    }
  }
  
  return hooks
}

// Custom markdown components with better styling
const markdownComponents = {
  h1: ({ node, ...props }: any) => (
    <h1
      className="text-4xl sm:text-5xl font-clash font-bold mb-6 mt-12 text-white"
      style={{ letterSpacing: '-0.02em', lineHeight: '1.1' }}
      {...props}
    />
  ),
  h2: ({ node, ...props }: any) => (
    <h2
      className="text-2xl sm:text-3xl font-clash font-bold mb-4 mt-10 text-white"
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

export default function StructuredMarkdown({ content, type = 'business_case' }: StructuredMarkdownProps) {
  const businessCaseSections = useMemo(() => 
    type === 'business_case' ? parseBusinessCaseSections(content) : [], 
    [content, type]
  )
  
  const contentStrategyHooks = useMemo(() => 
    type === 'content_strategy' ? parseContentStrategyHooks(content) : [], 
    [content, type]
  )

  // For business case, render as section cards
  if (type === 'business_case' && businessCaseSections.length > 0) {
    return (
      <div className="max-w-[700px] mx-auto space-y-10">
        {businessCaseSections.map((section, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="p-8 sm:p-10 hover:border-mint-400/30 transition-all">
              {/* Section Number - Large and prominent */}
              <div className="flex items-center gap-4 mb-6 pb-4 border-b border-white/10">
                <div className="text-mint-400 font-clash font-bold text-4xl sm:text-5xl leading-none">
                  {section.number}
                </div>
                <h2 className="text-2xl sm:text-3xl font-clash font-bold text-white flex-1">
                  {section.title}
                </h2>
              </div>
              
              {/* Section Content */}
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={markdownComponents}
                >
                  {section.content}
                </ReactMarkdown>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    )
  }

  // For content strategy, render hooks as cards
  if (type === 'content_strategy' && contentStrategyHooks.length > 0) {
    return (
      <div className="max-w-[700px] mx-auto space-y-12">
        {contentStrategyHooks.map((hook, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-8 sm:p-10 hover:border-blue-400/30 transition-all">
              {/* Hook Title */}
              <div className="mb-6 pb-4 border-b border-white/10">
                <div className="text-blue-400 font-clash font-bold text-sm uppercase tracking-wider mb-2">
                  Hook {index + 1}
                </div>
                <h2 className="text-2xl sm:text-3xl font-clash font-bold text-white leading-tight">
                  {hook.title}
                </h2>
              </div>
              
              {/* Hook Content */}
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={markdownComponents}
                >
                  {hook.content}
                </ReactMarkdown>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    )
  }

  // Fallback to standard rendering with improved styling
  return (
    <div className="prose prose-invert max-w-[700px] mx-auto">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

