import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { 
  sendCompletionNudge, 
  sendWeeklyViralIdeas 
} from '@/lib/email/resend'

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

  // Verify this is coming from a cron job or authorized source
  const authHeader = req.headers.authorization
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const { type } = req.body

    if (type === 'completion_nudge') {
      // Find users with incomplete dashboards
      const { data: incompleteDashboards } = await supabase
        .from('dashboards')
        .select('*, profiles(*)')
        .eq('status', 'incomplete')
        .gte('created_at', new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()) // Last 3 days

      if (incompleteDashboards) {
        for (const dashboard of incompleteDashboards) {
          const { data: generations } = await supabase
            .from('generations')
            .select('type')
            .eq('dashboard_id', dashboard.id)

          const generatedTypes = generations?.map(g => g.type) || []
          const missingSteps = []

          if (!generatedTypes.includes('business_case')) {
            missingSteps.push('Generate your Business Case')
          }
          if (!generatedTypes.includes('content_strategy')) {
            missingSteps.push('Create your Content Strategy')
          }
          if (!generatedTypes.includes('website')) {
            missingSteps.push('Select your Website Template')
          }

          if (missingSteps.length > 0 && dashboard.profiles?.email) {
            await sendCompletionNudge(
              dashboard.profiles.email,
              dashboard.profiles.full_name || 'there',
              missingSteps
            )
          }
        }
      }
    } else if (type === 'weekly_ideas') {
      // Send weekly viral ideas to all users with complete dashboards
      const { data: completeDashboards } = await supabase
        .from('dashboards')
        .select('*, profiles(*)')
        .eq('status', 'complete')

      if (completeDashboards) {
        for (const dashboard of completeDashboards) {
          if (dashboard.profiles?.email) {
            await sendWeeklyViralIdeas(
              dashboard.profiles.email,
              dashboard.profiles.full_name || 'there',
              dashboard.niche || 'your business'
            )
          }
        }
      }
    }

    res.status(200).json({ success: true })
  } catch (error: any) {
    console.error('Notification error:', error)
    res.status(500).json({ error: error.message })
  }
}

