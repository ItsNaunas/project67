import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from './ui/Button'
import Modal from './ui/Modal'
import { AlertTriangle, Edit3 } from 'lucide-react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import toast from 'react-hot-toast'

interface EditBusinessModalProps {
  isOpen: boolean
  onClose: () => void
  dashboardId: string
  currentData: {
    business_name: string
    niche: string
    target_audience: string
    brand_tone: string
  }
  onUpdate: () => void
}

export default function EditBusinessModal({
  isOpen,
  onClose,
  dashboardId,
  currentData,
  onUpdate,
}: EditBusinessModalProps) {
  const supabase = useSupabaseClient()
  const [businessName, setBusinessName] = useState(currentData.business_name)
  const [niche, setNiche] = useState(currentData.niche)
  const [targetAudience, setTargetAudience] = useState(currentData.target_audience)
  const [brandTone, setBrandTone] = useState(currentData.brand_tone)
  const [saving, setSaving] = useState(false)
  const [showRegeneratePrompt, setShowRegeneratePrompt] = useState(false)

  useEffect(() => {
    setBusinessName(currentData.business_name)
    setNiche(currentData.niche)
    setTargetAudience(currentData.target_audience)
    setBrandTone(currentData.brand_tone)
  }, [currentData])

  const hasChanges = 
    businessName !== currentData.business_name ||
    niche !== currentData.niche ||
    targetAudience !== currentData.target_audience ||
    brandTone !== currentData.brand_tone

  const handleSave = async () => {
    if (!hasChanges) {
      onClose()
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase
        .from('dashboards')
        .update({
          business_name: businessName,
          niche: niche,
          target_audience: targetAudience,
          brand_tone: brandTone,
        })
        .eq('id', dashboardId)

      if (error) throw error

      toast.success('Business details updated!')
      setShowRegeneratePrompt(true)
      onUpdate()
    } catch (error) {
      console.error('Error updating business details:', error)
      toast.error('Failed to update business details')
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    if (showRegeneratePrompt) {
      setShowRegeneratePrompt(false)
    }
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Business Details" size="lg">
      <div className="space-y-4">
        {/* Warning banner */}
        {hasChanges && !showRegeneratePrompt && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex items-start gap-3"
          >
            <AlertTriangle className="text-yellow-500 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-sm font-semibold text-yellow-500">Changes Detected</p>
              <p className="text-xs text-gray-400 mt-1">
                Updating these details may affect your generated content. Consider regenerating 
                your business case and content strategy for best results.
              </p>
            </div>
          </motion.div>
        )}

        {/* Success message with regenerate prompt */}
        <AnimatePresence>
          {showRegeneratePrompt && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-green-500/10 border border-green-500/30 rounded-lg p-4"
            >
              <p className="text-sm font-semibold text-green-500 mb-2">
                ✓ Details Updated Successfully!
              </p>
              <p className="text-xs text-gray-400 mb-3">
                Would you like to regenerate your content to reflect these changes?
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    handleClose()
                    // User can manually regenerate from tabs
                  }}
                >
                  I'll Regenerate Later
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleClose}
                >
                  Close
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form fields */}
        <div>
          <label className="block text-sm font-medium mb-2">Business Name</label>
          <input
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-mint-400 focus:outline-none transition-colors"
            placeholder="Enter your business name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Niche / Industry</label>
          <input
            type="text"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-mint-400 focus:outline-none transition-colors"
            placeholder="e.g., Health & Wellness, SaaS, E-commerce"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Target Audience</label>
          <textarea
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-mint-400 focus:outline-none transition-colors resize-none"
            rows={3}
            placeholder="Who is your ideal customer?"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Brand Tone</label>
          <select
            value={brandTone}
            onChange={(e) => setBrandTone(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-mint-400 focus:outline-none transition-colors"
          >
            <option value="professional">Professional</option>
            <option value="casual">Casual & Friendly</option>
            <option value="bold">Bold & Edgy</option>
            <option value="luxury">Luxury & Premium</option>
            <option value="playful">Playful & Fun</option>
          </select>
        </div>

        {/* Action buttons */}
        {!showRegeneratePrompt && (
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSave}
              loading={saving}
              disabled={saving || !hasChanges}
              className="flex-1"
            >
              <Edit3 size={16} />
              Save Changes
            </Button>
            <Button
              onClick={onClose}
              variant="ghost"
              disabled={saving}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </Modal>
  )
}

