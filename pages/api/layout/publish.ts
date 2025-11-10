import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import { requireUser, requireOwnership, getSupabaseAdmin } from '@/lib/server/auth'
import { handleApiError, successResponse } from '@/lib/server/errors'

const PublishLayoutSchema = z.object({
  projectId: z.string().uuid(),
  layoutId: z.string().min(1),
  versionId: z.string().uuid().optional(),
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const payload = PublishLayoutSchema.parse(req.body)
    const user = await requireUser(req)
    const supabase = getSupabaseAdmin()

    const { data: dashboard, error: dashboardError } = await supabase
      .from('dashboards')
      .select('user_id')
      .eq('id', payload.projectId)
      .single()

    if (dashboardError || !dashboard) {
      return res.status(404).json({ error: 'Dashboard not found' })
    }

    await requireOwnership(user.id, dashboard.user_id)

    const { data: blueprint, error: blueprintError } = await supabase
      .from('layout_blueprints')
      .select('id')
      .eq('dashboard_id', payload.projectId)
      .maybeSingle()

    if (blueprintError || !blueprint) {
      return res.status(404).json({ error: 'Layout blueprint not found' })
    }

    const { data: versions, error: versionsError } = await supabase
      .from('layout_versions')
      .select('id, state, layout')
      .eq('blueprint_id', blueprint.id)
      .order('created_at', { ascending: false })

    if (versionsError) {
      throw versionsError
    }

    if (!versions || versions.length === 0) {
      return res.status(404).json({ error: 'No layout versions found to publish' })
    }

    const targetVersion =
      versions.find((version) => version.id === payload.versionId) ??
      versions.find((version) => version.layout?.id === payload.layoutId) ??
      versions[0]

    if (!targetVersion) {
      return res.status(404).json({ error: 'Requested layout version not found' })
    }

    await supabase
      .from('layout_versions')
      .update({ state: 'published' })
      .eq('id', targetVersion.id)

    await supabase
      .from('layout_versions')
      .update({ state: 'archived' })
      .neq('id', targetVersion.id)
      .eq('blueprint_id', blueprint.id)
      .eq('state', 'published')

    await supabase
      .from('layout_blueprints')
      .update({ status: 'published' })
      .eq('id', blueprint.id)

    return successResponse({ versionId: targetVersion.id }, res)
  } catch (error) {
    return handleApiError(error, res)
  }
}


