import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import ProgressBar from '@/components/ui/ProgressBar'
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'

const questions = [
  {
    id: 'businessName',
    label: 'What\'s your business name?',
    placeholder: 'e.g., Luxe Wellness Co.',
    multiline: false,
    feedback: 'Love that — this will help tailor your business perfectly.',
  },
  {
    id: 'niche',
    label: 'What\'s your niche or industry?',
    placeholder: 'e.g., Health & Wellness, Tech, E-commerce',
    multiline: false,
    feedback: 'Perfect! This helps us understand your market.',
  },
  {
    id: 'targetAudience',
    label: 'Who is your target audience?',
    placeholder: 'e.g., Busy professionals aged 25-40',
    multiline: true,
    feedback: 'Great! Knowing your audience is key to success.',
  },
  {
    id: 'primaryGoal',
    label: 'What\'s your primary goal?',
    placeholder: 'e.g., Generate £10k/month in 6 months',
    multiline: true,
    feedback: 'Ambitious! We love it. Let\'s make it happen.',
  },
  {
    id: 'biggestChallenge',
    label: 'What\'s your biggest challenge right now?',
    placeholder: 'e.g., Don\'t know where to start with marketing',
    multiline: true,
    feedback: 'We\'ll address this head-on in your business case.',
  },
  {
    id: 'idealCustomer',
    label: 'Describe your ideal customer',
    placeholder: 'Age: 30-45, Location: UK, Pain Point: Struggling with work-life balance',
    multiline: true,
    feedback: 'Excellent! This clarity will supercharge your strategy.',
  },
  {
    id: 'brandTone',
    label: 'What\'s your brand tone?',
    placeholder: 'e.g., Luxury, Playful, Minimalist, Bold',
    multiline: false,
    feedback: 'Perfect! Your brand personality is coming to life.',
  },
]

export default function Generate() {
  const router = useRouter()
  const session = useSession()
  const supabase = useSupabaseClient()
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<Record<string, string>>({
    businessName: '',
    niche: '',
    targetAudience: '',
    primaryGoal: '',
    biggestChallenge: '',
    idealCustomer: '',
    brandTone: '',
  })
  const [showFeedback, setShowFeedback] = useState(false)
  const [showRestorePrompt, setShowRestorePrompt] = useState(false)
  const [savedDraft, setSavedDraft] = useState<Record<string, string> | null>(null)

  useEffect(() => {
    if (!session) {
      router.push('/')
    }
  }, [session, router])

  // Load saved draft on mount
  useEffect(() => {
    const draft = localStorage.getItem('formDraft')
    if (draft) {
      try {
        const parsedDraft = JSON.parse(draft)
        // Check if draft has any data
        const hasData = Object.values(parsedDraft).some((val) => val && val.toString().trim())
        if (hasData) {
          setSavedDraft(parsedDraft)
          setShowRestorePrompt(true)
        }
      } catch (error) {
        console.error('Error loading draft:', error)
        localStorage.removeItem('formDraft')
      }
    }
  }, [])

  // Auto-save to localStorage whenever formData changes
  useEffect(() => {
    if (session) {
      localStorage.setItem('formDraft', JSON.stringify(formData))
    }
  }, [formData, session])

  const restoreDraft = () => {
    if (savedDraft) {
      setFormData(savedDraft)
      // Find the first incomplete step
      const incompleteStep = questions.findIndex((q) => !savedDraft[q.id] || !savedDraft[q.id].trim())
      setCurrentStep(incompleteStep >= 0 ? incompleteStep : questions.length - 1)
      setShowRestorePrompt(false)
      toast.success('Progress restored! Continue where you left off.')
    }
  }

  const startFresh = () => {
    localStorage.removeItem('formDraft')
    setSavedDraft(null)
    setShowRestorePrompt(false)
    toast('Starting fresh!', { icon: '✨' })
  }

  const handleNext = () => {
    const currentQuestion = questions[currentStep]
    if (formData[currentQuestion.id].trim()) {
      setShowFeedback(true)
      setTimeout(() => {
        setShowFeedback(false)
        if (currentStep < questions.length - 1) {
          setCurrentStep(currentStep + 1)
        } else {
          handleSubmit()
        }
      }, 1500)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      // Parse ideal customer
      const idealCustomerLines = formData.idealCustomer.split(',')
      const idealCustomer = {
        age: idealCustomerLines[0]?.replace('Age:', '').trim() || '',
        location: idealCustomerLines[1]?.replace('Location:', '').trim() || '',
        painPoint: idealCustomerLines[2]?.replace('Pain Point:', '').trim() || '',
      }

      // Create dashboard
      const { data, error } = await supabase
        .from('dashboards')
        .insert({
          user_id: session?.user.id,
          business_name: formData.businessName,
          niche: formData.niche,
          target_audience: formData.targetAudience,
          primary_goal: formData.primaryGoal,
          biggest_challenge: formData.biggestChallenge,
          ideal_customer: idealCustomer,
          brand_tone: formData.brandTone,
          status: 'incomplete',
        })
        .select()
        .single()

      if (error) throw error

      // Clear draft after successful submission
      localStorage.removeItem('formDraft')
      toast.success('Business information saved!')
      
      // Redirect to tabs page
      router.push(`/tabs?id=${data.id}`)
    } catch (error) {
      console.error('Error creating dashboard:', error)
      toast.error('Failed to save your information. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const currentQuestion = questions[currentStep]
  const progress = ((currentStep + 1) / questions.length) * 100

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      {/* Restore Draft Prompt */}
      {showRestorePrompt && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
        >
          <div className="glass-effect rounded-2xl p-8 max-w-md w-full text-center">
            <Sparkles className="text-mint-400 mx-auto mb-4" size={48} />
            <h2 className="text-2xl font-clash font-bold mb-2">Continue where you left off?</h2>
            <p className="text-gray-400 mb-6">
              We found your saved progress. Would you like to continue or start fresh?
            </p>
            <div className="flex gap-4">
              <Button variant="ghost" onClick={startFresh} className="flex-1">
                Start Fresh
              </Button>
              <Button onClick={restoreDraft} className="flex-1">
                Continue
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
          }}
          className="absolute top-0 right-0 w-[600px] h-[600px] bg-mint-500/20 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 w-full max-w-3xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="text-mint-400" size={24} />
            <span className="text-gradient font-clash font-bold text-xl">Project 67</span>
          </div>
          <h1 className="text-4xl font-clash font-bold mb-2 text-white">Let's build your empire</h1>
          <p className="text-gray-400">Answer a few questions to get your personalized strategy</p>
        </motion.div>

        {/* Progress Bar */}
        <ProgressBar current={currentStep + 1} total={questions.length} className="mb-8" />

        {/* Question Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-effect rounded-2xl p-8 mb-6"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <label className="block text-2xl font-bold mb-6">{currentQuestion.label}</label>
              
              <Input
                placeholder={currentQuestion.placeholder}
                value={formData[currentQuestion.id]}
                onChange={(e) =>
                  setFormData({ ...formData, [currentQuestion.id]: e.target.value })
                }
                multiline={currentQuestion.multiline}
                rows={4}
              />

              {/* Feedback */}
              <AnimatePresence>
                {showFeedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-4 text-mint-400 font-medium flex items-center gap-2"
                  >
                    <Sparkles size={16} />
                    {currentQuestion.feedback}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            onClick={handlePrevious}
            variant="ghost"
            disabled={currentStep === 0}
            className={currentStep === 0 ? 'invisible' : ''}
          >
            <ChevronLeft size={20} />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            {questions.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentStep
                    ? 'bg-mint-400 w-8'
                    : index < currentStep
                    ? 'bg-mint-400/60'
                    : 'bg-white/20'
                }`}
              />
            ))}
          </div>

          <Button
            onClick={handleNext}
            disabled={!formData[currentQuestion.id].trim() || loading}
            loading={loading && currentStep === questions.length - 1}
          >
            {currentStep === questions.length - 1 ? 'Complete' : 'Next'}
            {currentStep !== questions.length - 1 && <ChevronRight size={20} />}
          </Button>
        </div>
      </div>
    </div>
  )
}

// Prevent static generation - this page needs authentication
export async function getServerSideProps() {
  return {
    props: {},
  }
}

