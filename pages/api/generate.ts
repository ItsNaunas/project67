/**
 * AI Content Generation API
 * Security: Validates input, checks auth, verifies ownership, enforces limits
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { requireUser, requireOwnership, getSupabaseAdmin } from '@/lib/server/auth'
import { GenerateInputSchema, validateInput } from '@/lib/server/validation'
import { handleApiError, successResponse } from '@/lib/server/errors'
import { generateBusinessCase } from '@/lib/ai/businessCase'
import { generateContentStrategy } from '@/lib/ai/contentStrategy'
import { generateWebsite } from '@/lib/ai/websiteGenerator'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Step 1: Validate input (throws ZodError if invalid)
    const input = validateInput(GenerateInputSchema, req.body)

    // Step 2: Authenticate user (throws if not authenticated)
    const user = await requireUser(req)

    // Step 3: Get Supabase admin client (server-only)
    const supabase = getSupabaseAdmin()

    // Step 4: Fetch dashboard and verify ownership
    const { data: dashboard, error: dashboardError } = await supabase
      .from('dashboards')
      .select('*')
      .eq('id', input.dashboardId)
      .single()

    if (dashboardError || !dashboard) {
      return res.status(404).json({ error: 'Dashboard not found' })
    }

    // Step 5: Verify user owns this dashboard (prevents unauthorized access)
    await requireOwnership(user.id, dashboard.user_id)

    // Step 6: Check regeneration limits (skip for website type)
    const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true'
    const isWebsiteType = input.type === 'website'
    
    if (!isWebsiteType) {
      const { data: existingGenerations } = await supabase
        .from('generations')
        .select('*')
        .eq('dashboard_id', input.dashboardId)
        .eq('type', input.type)

      const regenerationCount = existingGenerations?.length || 0

      if (!isDevMode) {
        // Check if user has purchased
        const { data: profile } = await supabase
          .from('profiles')
          .select('has_purchased')
          .eq('id', user.id)
          .single()

        if (!profile?.has_purchased && regenerationCount >= 1) {
          return res.status(402).json({ 
            error: 'Regeneration limit reached',
            message: 'Purchase to unlock unlimited regenerations.'
          })
        }
      }
    }

    // Step 7: Generate content
    let content = ''

    if (input.type === 'business_case') {
      content = await generateBusinessCase({
        businessName: dashboard.business_name,
        niche: dashboard.niche,
        targetAudience: dashboard.target_audience,
        primaryGoal: dashboard.primary_goal,
        biggestChallenge: dashboard.biggest_challenge,
        idealCustomer: dashboard.ideal_customer,
        brandTone: dashboard.brand_tone,
      })
    } else if (input.type === 'content_strategy') {
      content = await generateContentStrategy({
        businessName: dashboard.business_name,
        niche: dashboard.niche,
        targetAudience: dashboard.target_audience,
        primaryGoal: dashboard.primary_goal,
        brandTone: dashboard.brand_tone,
      })
    } else if (input.type === 'website') {
      // Website generation requires templateId
      if (!input.templateId) {
        return res.status(400).json({ error: 'templateId is required for website generation' })
      }

      // Fetch business case content for context
      const { data: businessCaseGen } = await supabase
        .from('generations')
        .select('content')
        .eq('dashboard_id', input.dashboardId)
        .eq('type', 'business_case')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      const result = await generateWebsite({
        businessName: dashboard.business_name,
        niche: dashboard.niche,
        targetAudience: dashboard.target_audience,
        primaryGoal: dashboard.primary_goal,
        biggestChallenge: dashboard.biggest_challenge,
        idealCustomer: dashboard.ideal_customer,
        brandTone: dashboard.brand_tone,
        businessCaseContent: businessCaseGen?.content || undefined,
        templateId: input.templateId,
      })

      // Store website generation as JSONB
      content = JSON.stringify({
        templateId: result.metadata.templateId,
        html: result.html,
        css: result.css,
        metadata: result.metadata,
      })
    }

    // Step 8: Save generation
    let version = 1
    if (!isWebsiteType) {
      const { data: existingGen } = await supabase
        .from('generations')
        .select('*')
        .eq('dashboard_id', input.dashboardId)
        .eq('type', input.type)
      version = (existingGen?.length || 0) + 1
    }

    const { data: generation, error: generationError } = await supabase
      .from('generations')
      .insert({
        dashboard_id: input.dashboardId,
        type: input.type,
        content,
        version,
      })
      .select()
      .single()

    if (generationError) {
      throw generationError
    }

    // Step 9: Return safe response (no sensitive data)
    return successResponse({ content, generation }, res)
    
  } catch (error) {
    // Centralized error handling (never leaks sensitive info)
    return handleApiError(error, res)
  }
}

