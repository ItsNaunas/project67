import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import { requireUser, requireOwnership, getSupabaseAdmin } from '@/lib/server/auth'
import { handleApiError, successResponse } from '@/lib/server/errors'
import { pageLayoutSchema } from '@/lib/layout/schema'
import { buildLayoutMetadata } from '@/lib/layout/summary'

const SaveLayoutSchema = z.object({
  projectId: z.string().uuid(),
  layout: pageLayoutSchema.extend({
    dashboardId: z.string().uuid(),
  }),
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const parsed = SaveLayoutSchema.parse(req.body)
    if (parsed.layout.dashboardId !== parsed.projectId) {
      return res.status(400).json({ error: 'Layout dashboard mismatch' })
    }
    const user = await requireUser(req)
    const supabase = getSupabaseAdmin()

    const { data: dashboard, error: dashboardError } = await supabase
      .from('dashboards')
      .select('user_id, business_name')
      .eq('id', parsed.projectId)
      .single()

    if (dashboardError || !dashboard) {
      return res.status(404).json({ error: 'Dashboard not found' })
    }

    await requireOwnership(user.id, dashboard.user_id)

    // Ensure blueprint exists
    const { data: existingBlueprint } = await supabase
      .from('layout_blueprints')
      .select('id')
      .eq('dashboard_id', parsed.projectId)
      .eq('slug', parsed.layout.slug)
      .maybeSingle()

    const blueprintName =
      parsed.layout.metadata.title || `${dashboard.business_name} Layout`.trim()

    let blueprintId = existingBlueprint?.id

    if (!blueprintId) {
      const { data: blueprint, error: blueprintError } = await supabase
        .from('layout_blueprints')
        .insert({
          dashboard_id: parsed.projectId,
          slug: parsed.layout.slug,
          name: blueprintName,
          description: parsed.layout.metadata.description || null,
          status: 'draft',
        })
        .select()
        .single()

      if (blueprintError || !blueprint) {
        throw blueprintError ?? new Error('Failed to create layout blueprint')
      }

      blueprintId = blueprint.id
    } else {
      await supabase
        .from('layout_blueprints')
        .update({
          name: blueprintName,
          description: parsed.layout.metadata.description || null,
          status: 'draft',
        })
        .eq('id', blueprintId)
    }

    const metadata = buildLayoutMetadata(parsed.layout)

    const { data: version, error: versionError } = await supabase
      .from('layout_versions')
      .insert({
        blueprint_id: blueprintId,
        state: 'draft',
        layout: parsed.layout,
        metadata,
        created_by: user.id,
      })
      .select()
      .single()

    if (versionError || !version) {
      throw versionError ?? new Error('Failed to create layout version')
    }

    return successResponse(
      {
        blueprintId,
        version,
      },
      res,
      201
    )
  } catch (error) {
    return handleApiError(error, res)
  }
}


