import { useState } from 'react'
import { motion } from 'framer-motion'
import Button from '../ui/Button'
import Card from '../ui/Card'
import Modal from '../ui/Modal'
import { Zap, CheckCircle2, ExternalLink, Sparkles } from 'lucide-react'

const templates = [
  {
    id: 1,
    name: 'Luxury Minimalist',
    description: 'Clean, elegant design for premium brands',
    preview: '/templates/luxury.jpg',
  },
  {
    id: 2,
    name: 'Bold & Modern',
    description: 'High-impact visuals for tech startups',
    preview: '/templates/modern.jpg',
  },
  {
    id: 3,
    name: 'Playful Creative',
    description: 'Fun, vibrant layouts for creative businesses',
    preview: '/templates/playful.jpg',
  },
  {
    id: 4,
    name: 'Professional Corporate',
    description: 'Traditional, trustworthy design',
    preview: '/templates/corporate.jpg',
  },
  {
    id: 5,
    name: 'Wellness & Lifestyle',
    description: 'Calm, inviting design for health brands',
    preview: '/templates/wellness.jpg',
  },
  {
    id: 6,
    name: 'E-commerce Pro',
    description: 'Conversion-optimized for online stores',
    preview: '/templates/ecommerce.jpg',
  },
  {
    id: 7,
    name: 'Agency Portfolio',
    description: 'Showcase your work with style',
    preview: '/templates/portfolio.jpg',
  },
  {
    id: 8,
    name: 'SaaS Landing',
    description: 'Convert visitors to customers',
    preview: '/templates/saas.jpg',
  },
]

interface WebsiteTabProps {
  dashboardId: string
  hasPurchased: boolean
  selectedTemplate: number | null
  onSelectTemplate: (templateId: number) => Promise<void>
  onGenerateWebsite: (templateId: number) => Promise<void>
  websiteContent: any
  isGenerating: boolean
}

export default function WebsiteTab({
  dashboardId,
  hasPurchased,
  selectedTemplate,
  onSelectTemplate,
  onGenerateWebsite,
  websiteContent,
  isGenerating,
}: WebsiteTabProps) {
  const [showPreview, setShowPreview] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState<typeof templates[0] | null>(null)
  
  // Parse website content if it exists
  let parsedWebsiteContent = null
  try {
    parsedWebsiteContent = websiteContent 
      ? (typeof websiteContent === 'string' ? JSON.parse(websiteContent) : websiteContent)
      : null
  } catch (e) {
    console.error('Error parsing website content:', e)
  }
  const hasGeneratedWebsite = !!parsedWebsiteContent?.html

  const handlePreview = (template: typeof templates[0]) => {
    setPreviewTemplate(template)
    setShowPreview(true)
  }

  return (
    <div className="space-y-6">
      {hasGeneratedWebsite ? (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="text-green-500" size={24} />
            <div>
              <h3 className="text-xl font-bold">
                {templates.find(t => t.id === selectedTemplate)?.name} Website Ready!
              </h3>
              <p className="text-sm text-gray-400">Your website has been generated</p>
            </div>
          </div>
          <a 
            href={`/website/${dashboardId}`} 
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline flex items-center gap-1"
          >
            View Live Site <ExternalLink size={16} />
          </a>
        </div>
      ) : selectedTemplate ? (
        <Card className="text-center py-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="text-accent" size={24} />
            <h3 className="text-xl font-bold">
              Template Selected: {templates.find(t => t.id === selectedTemplate)?.name}
            </h3>
          </div>
          <p className="text-secondary mb-6">
            Ready to generate your website with this template?
          </p>
          <Button
            onClick={() => onGenerateWebsite(selectedTemplate)}
            disabled={isGenerating}
            size="lg"
          >
            {isGenerating ? (
              <>
                <span className="animate-spin">⚡</span>
                Generating Website...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                Generate Website
              </>
            )}
          </Button>
        </Card>
      ) : (
        <Card className="text-center py-8">
          <Zap className="mx-auto mb-4 text-accent" size={48} />
          <h3 className="text-2xl font-bold mb-2">Choose Your Website Template</h3>
          <p className="text-secondary">
            Select from 8 premium templates designed to convert
          </p>
        </Card>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <motion.div
            key={template.id}
            whileHover={{ scale: 1.03 }}
            className={`glass-effect rounded-xl overflow-hidden cursor-pointer ${
              selectedTemplate === template.id ? 'ring-2 ring-accent glow-accent' : ''
            }`}
            onClick={() => onSelectTemplate(template.id)}
          >
            <div className="aspect-video bg-gradient-to-br from-accent/20 to-accentAlt/20 flex items-center justify-center">
              <span className="text-6xl font-black text-white/20">{template.id}</span>
            </div>
            
            <div className="p-4">
              <h4 className="font-bold mb-1 flex items-center justify-between">
                {template.name}
                {selectedTemplate === template.id && (
                  <CheckCircle2 className="text-accent" size={20} />
                )}
              </h4>
              <p className="text-sm text-secondary mb-3">{template.description}</p>
              
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handlePreview(template)
                }}
                className="text-sm text-accent hover:underline flex items-center gap-1"
              >
                Preview <ExternalLink size={12} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {selectedTemplate && hasPurchased && (
        <Card className="text-center">
          <p className="text-secondary mb-4">
            Your website is ready! You can customize it further in your dashboard.
          </p>
          <Button variant="secondary">
            Customize Website <ExternalLink size={16} />
          </Button>
        </Card>
      )}

      {/* Preview Modal */}
      <Modal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title={previewTemplate?.name}
        size="xl"
      >
        {previewTemplate && (
          <div>
            <div className="aspect-video bg-gradient-to-br from-accent/20 to-accentAlt/20 rounded-lg flex items-center justify-center mb-4">
              <span className="text-9xl font-black text-white/20">{previewTemplate.id}</span>
            </div>
            <p className="text-secondary mb-4">{previewTemplate.description}</p>
            <Button
              onClick={() => {
                onSelectTemplate(previewTemplate.id)
                setShowPreview(false)
              }}
              className="w-full"
            >
              Select This Template
            </Button>
          </div>
        )}
      </Modal>
    </div>
  )
}

