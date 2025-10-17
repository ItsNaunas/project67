import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { generateBusinessCase } from '@/lib/ai/businessCase'
import { generateContentStrategy } from '@/lib/ai/contentStrategy'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { dashboardId, type } = req.body

    if (!dashboardId || !type) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Get dashboard data
    const { data: dashboard, error: dashboardError } = await supabase
      .from('dashboards')
      .select('*')
      .eq('id', dashboardId)
      .single()

    if (dashboardError || !dashboard) {
      return res.status(404).json({ error: 'Dashboard not found' })
    }

    // Get user profile to check purchase status
    const { data: profile } = await supabase
      .from('profiles')
      .select('has_purchased')
      .eq('id', dashboard.user_id)
      .single()

    // Check regeneration limits (skip in dev mode)
    const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true'
    
    // Always fetch existing generations to get the count
    const { data: existingGenerations } = await supabase
      .from('generations')
      .select('*')
      .eq('dashboard_id', dashboardId)
      .eq('type', type)

    const regenerationCount = existingGenerations?.length || 0

    if (!isDevMode) {
      if (!profile?.has_purchased && regenerationCount >= 1) {
        return res.status(403).json({ 
          error: 'Regeneration limit reached. Purchase to unlock unlimited regenerations.' 
        })
      }
    }

    let content = ''

    // Generate content based on type
    if (type === 'business_case') {
      content = await generateBusinessCase({
        businessName: dashboard.business_name,
        niche: dashboard.niche,
        targetAudience: dashboard.target_audience,
        primaryGoal: dashboard.primary_goal,
        biggestChallenge: dashboard.biggest_challenge,
        idealCustomer: dashboard.ideal_customer,
        brandTone: dashboard.brand_tone,
      })
    } else if (type === 'content_strategy') {
      content = await generateContentStrategy({
        businessName: dashboard.business_name,
        niche: dashboard.niche,
        targetAudience: dashboard.target_audience,
        primaryGoal: dashboard.primary_goal,
        brandTone: dashboard.brand_tone,
      })
    } else {
      return res.status(400).json({ error: 'Invalid generation type' })
    }

    // Save generation
    const { data: generation, error: generationError } = await supabase
      .from('generations')
      .insert({
        dashboard_id: dashboardId,
        type,
        content,
        version: regenerationCount + 1,
      })
      .select()
      .single()

    if (generationError) {
      throw generationError
    }

    res.status(200).json({ content, generation })
  } catch (error: any) {
    console.error('Generation error:', error)
    res.status(500).json({ error: error.message || 'Failed to generate content' })
  }
}

