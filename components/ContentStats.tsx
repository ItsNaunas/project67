import { FileText, Clock, BarChart3, Calendar } from 'lucide-react'
import Card from './ui/Card'

interface ContentStatsProps {
  content: string
  lastUpdated?: string
}

export default function ContentStats({ content, lastUpdated }: ContentStatsProps) {
  // Calculate word count
  const wordCount = content
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0).length

  // Calculate reading time (250 words per minute average)
  const readingTime = Math.ceil(wordCount / 250)

  // Count sections (h2 headings)
  const sectionCount = (content.match(/^##\s+/gm) || []).length

  return (
    <Card className="p-6">
      <h3 className="font-bold text-lg mb-4">Document Stats</h3>
      
      <div className="space-y-4">
        {/* Word Count */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-mint-400/20 rounded-lg">
            <FileText className="text-mint-400" size={18} />
          </div>
          <div>
            <div className="text-sm text-gray-400">Words</div>
            <div className="font-bold">{wordCount.toLocaleString()}</div>
          </div>
        </div>

        {/* Reading Time */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-400/20 rounded-lg">
            <Clock className="text-blue-400" size={18} />
          </div>
          <div>
            <div className="text-sm text-gray-400">Reading Time</div>
            <div className="font-bold">{readingTime} min</div>
          </div>
        </div>

        {/* Sections Count */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-400/20 rounded-lg">
            <BarChart3 className="text-purple-400" size={18} />
          </div>
          <div>
            <div className="text-sm text-gray-400">Sections</div>
            <div className="font-bold">{sectionCount}</div>
          </div>
        </div>

        {/* Last Updated */}
        {lastUpdated && (
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accentAlt/20 rounded-lg">
              <Calendar className="text-accentAlt" size={18} />
            </div>
            <div>
              <div className="text-sm text-gray-400">Last Updated</div>
              <div className="font-bold text-sm">
                {new Date(lastUpdated).toLocaleDateString()}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

