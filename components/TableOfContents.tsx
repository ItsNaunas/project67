import { useState, useEffect } from 'react'
import { ChevronDown, ChevronRight, List } from 'lucide-react'
import Card from './ui/Card'

interface TOCItem {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  content: string
}

export default function TableOfContents({ content }: TableOfContentsProps) {
  const [tocItems, setTocItems] = useState<TOCItem[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Parse markdown headings to generate TOC
  useEffect(() => {
    const headingRegex = /^(#{2,3})\s+(.+)$/gm
    const items: TOCItem[] = []
    let match

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length // 2 for h2, 3 for h3
      const text = match[2].trim()
      // Create a slug from the heading text
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      
      items.push({ id, text, level })
    }

    setTocItems(items)
  }, [content])

  // Track scroll position to highlight active section
  useEffect(() => {
    const handleScroll = () => {
      const headings = Array.from(document.querySelectorAll('h2, h3'))
      const scrollPosition = window.scrollY + 100

      for (let i = headings.length - 1; i >= 0; i--) {
        const heading = headings[i] as HTMLElement
        if (heading.offsetTop <= scrollPosition) {
          const id = heading.textContent
            ?.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
          
          if (id) {
            setActiveId(id)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Initial check

    return () => window.removeEventListener('scroll', handleScroll)
  }, [tocItems])

  const scrollToHeading = (id: string) => {
    const headings = Array.from(document.querySelectorAll('h2, h3'))
    for (const heading of headings) {
      const headingId = heading.textContent
        ?.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      
      if (headingId === id) {
        heading.scrollIntoView({ behavior: 'smooth', block: 'start' })
        break
      }
    }
  }

  if (tocItems.length === 0) return null

  return (
    <Card className="sticky top-6">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <List className="text-mint-400" size={18} />
            <h3 className="font-bold text-sm">Table of Contents</h3>
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {/* TOC List */}
        {!isCollapsed && (
          <nav className="space-y-1">
            {tocItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToHeading(item.id)}
                className={`
                  w-full text-left text-sm py-1.5 px-2 rounded transition-colors
                  ${item.level === 3 ? 'pl-6' : 'pl-2'}
                  ${
                    activeId === item.id
                      ? 'text-mint-400 bg-mint-400/10 font-semibold'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }
                `}
              >
                {item.text}
              </button>
            ))}
          </nav>
        )}

        {/* Collapsed state indicator */}
        {isCollapsed && (
          <div className="text-xs text-gray-500">{tocItems.length} sections</div>
        )}
      </div>
    </Card>
  )
}

