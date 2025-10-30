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
    preview: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80',
  },
  {
    id: 2,
    name: 'Bold & Modern',
    description: 'High-impact visuals for tech startups',
    preview: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=800&q=80',
  },
  {
    id: 3,
    name: 'Playful Creative',
    description: 'Fun, vibrant layouts for creative businesses',
    preview: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=800&q=80',
  },
  {
    id: 4,
    name: 'Professional Corporate',
    description: 'Traditional, trustworthy design',
    preview: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
  },
  {
    id: 5,
    name: 'Wellness & Lifestyle',
    description: 'Calm, inviting design for health brands',
    preview: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=800&q=80',
  },
  {
    id: 6,
    name: 'E-commerce Pro',
    description: 'Conversion-optimized for online stores',
    preview: 'https://images.unsplash.com/photo-1557821552-17105176677c?w=800&q=80',
  },
  {
    id: 7,
    name: 'Agency Portfolio',
    description: 'Showcase your work with style',
    preview: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&q=80',
  },
  {
    id: 8,
    name: 'SaaS Landing',
    description: 'Convert visitors to customers',
    preview: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
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
  const [showTemplateChanger, setShowTemplateChanger] = useState(false)
  const [changingTemplate, setChangingTemplate] = useState(false)
  
  // Parse website content if it exists
  let parsedWebsiteContent = null
  try {
    parsedWebsiteContent = websiteContent 
      ? (typeof websiteContent === 'string' ? JSON.parse(websiteContent) : websiteContent)
      : null
  } catch (e) {
    console.error('Error parsing website content:', e)
  }
  
  // Only consider website generated if:
  // 1. Content exists and is parsed
  // 2. HTML property exists and is not empty
  // 3. Not currently generating
  const hasGeneratedWebsite = !!(
    parsedWebsiteContent?.html && 
    parsedWebsiteContent.html.trim().length > 0 &&
    !isGenerating
  )

  const handlePreview = (template: typeof templates[0]) => {
    setPreviewTemplate(template)
    setShowPreview(true)
  }

  const handleTemplateChange = async (templateId: number) => {
    if (!hasPurchased) {
      setShowTemplateChanger(false)
      return
    }

    setChangingTemplate(true)
    try {
      // Auto-regenerate website with new template for purchased users
      await onGenerateWebsite(templateId)
      setShowTemplateChanger(false)
    } catch (error) {
      console.error('Error changing template:', error)
    } finally {
      setChangingTemplate(false)
    }
  }

  return (
    <div className="space-y-6">
      {hasGeneratedWebsite ? (
        <>
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
            <div className="flex gap-2">
              {hasPurchased && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTemplateChanger(!showTemplateChanger)}
                  disabled={isGenerating || changingTemplate}
                >
                  Change Template
                </Button>
              )}
              <a 
                href={`/website/${dashboardId}`} 
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline flex items-center gap-1"
              >
                View Live Site <ExternalLink size={16} />
              </a>
            </div>
          </div>

          {/* Template Changer Section */}
          {showTemplateChanger && hasPurchased && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <Card className="p-6">
                <div className="mb-4">
                  <h4 className="text-lg font-bold mb-2">Switch to a Different Template</h4>
                  <p className="text-sm text-gray-400">
                    Select a new template below. Your website will be regenerated automatically (30-60 seconds).
                  </p>
                </div>
                
                {changingTemplate && (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
                    <p className="text-secondary">Regenerating website with new template...</p>
                  </div>
                )}

                {!changingTemplate && (
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {templates.map((template) => (
                      <motion.button
                        key={template.id}
                        whileHover={{ scale: 1.05 }}
                        onClick={() => handleTemplateChange(template.id)}
                        disabled={template.id === selectedTemplate}
                        className={`text-left glass-effect rounded-lg overflow-hidden transition-all ${
                          template.id === selectedTemplate 
                            ? 'ring-2 ring-green-500 opacity-50 cursor-not-allowed' 
                            : 'hover:ring-2 hover:ring-accent cursor-pointer'
                        }`}
                      >
                        <div className="aspect-video bg-gray-900 relative overflow-hidden">
                          <img 
                            src={template.preview} 
                            alt={template.name}
                            className="w-full h-full object-cover"
                          />
                          {template.id === selectedTemplate && (
                            <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                              <span className="text-white font-bold text-sm">Current</span>
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <h5 className="font-semibold text-sm mb-1">{template.name}</h5>
                          <p className="text-xs text-gray-400">{template.description}</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>
          )}

          {/* Prompt to purchase for free users */}
          {showTemplateChanger && !hasPurchased && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <Card className="p-6 text-center">
                <Sparkles className="mx-auto mb-3 text-accent" size={32} />
                <h4 className="text-lg font-bold mb-2">Unlock Unlimited Template Switching</h4>
                <p className="text-sm text-gray-400 mb-4">
                  Purchase once to switch between templates anytime with automatic regeneration.
                </p>
                <Button onClick={() => setShowTemplateChanger(false)}>
                  Learn More
                </Button>
              </Card>
            </motion.div>
          )}
        </>
      ) : selectedTemplate ? (
        <Card className="text-center py-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="text-accent" size={24} />
            <h3 className="text-xl font-bold">
              Template Selected: {templates.find(t => t.id === selectedTemplate)?.name}
            </h3>
          </div>
          <p className="text-secondary mb-6">
            {isGenerating 
              ? 'Generating your website... This may take 30-60 seconds.'
              : 'Ready to generate your website with this template?'
            }
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
          {!isGenerating && (
            <p className="text-xs text-gray-500 mt-4">
              Your live preview will be available after generation completes
            </p>
          )}
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
            <div className="aspect-video bg-gray-900 relative overflow-hidden">
              <img 
                src={template.preview} 
                alt={template.name}
                className="w-full h-full object-cover"
              />
              {selectedTemplate === template.id && (
                <div className="absolute inset-0 bg-accent/20 flex items-center justify-center">
                  <CheckCircle2 className="text-white" size={48} />
                </div>
              )}
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
            <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden mb-4">
              <img 
                src={previewTemplate.preview} 
                alt={previewTemplate.name}
                className="w-full h-full object-cover"
              />
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

