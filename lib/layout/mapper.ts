import { randomUUID } from 'crypto'
import { z } from 'zod'
import {
  pageLayoutSchema,
  type Field,
  type PageLayout,
  type Section,
  themeTokensSchema,
} from './schema'

const isoDateSchema = z.string().refine(
  (value) => !Number.isNaN(Date.parse(value)),
  'Invalid ISO date string'
)

const persistedLayoutSchema = z.object({
  id: z.string(),
  dashboard_id: z.string(),
  slug: z.string(),
  status: z.enum(['draft', 'published']),
  locale: z.string().default('en'),
  theme: themeTokensSchema,
  sections: z.array(z.unknown()),
  metadata: z.record(z.unknown()).default({}),
  created_at: isoDateSchema,
  updated_at: isoDateSchema,
})

export type PersistedLayout = z.infer<typeof persistedLayoutSchema>

export function parsePersistedLayout(input: unknown): PageLayout {
  const data = persistedLayoutSchema.parse(input)

  return pageLayoutSchema.parse({
    id: data.id,
    dashboardId: data.dashboard_id,
    slug: data.slug,
    status: data.status,
    locale: data.locale,
    theme: data.theme,
    sections: data.sections.map((section) => normalizeSection(section)),
    metadata: data.metadata,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  })
}

export function serializeLayoutForPersistence(layout: PageLayout) {
  return {
    id: layout.id,
    dashboard_id: layout.dashboardId,
    slug: layout.slug,
    status: layout.status,
    locale: layout.locale,
    theme: layout.theme,
    sections: layout.sections,
    metadata: layout.metadata,
    created_at: layout.createdAt,
    updated_at: layout.updatedAt,
  }
}

export function createDraftLayout(params: {
  dashboardId: string
  slug: string
  theme: PageLayout['theme']
  sections?: Section[]
  metadata?: PageLayout['metadata']
}): PageLayout {
  const now = new Date().toISOString()
  return pageLayoutSchema.parse({
    id: randomUUID(),
    dashboardId: params.dashboardId,
    slug: params.slug,
    status: 'draft',
    locale: 'en',
    theme: params.theme,
    sections: params.sections ?? [],
    metadata: params.metadata ?? {},
    createdAt: now,
    updatedAt: now,
  })
}

export function upsertField(fields: Field[], updatedField: Field) {
  const existingIndex = fields.findIndex((field) => field.key === updatedField.key)

  if (existingIndex >= 0) {
    return fields.map((field, index) => (index === existingIndex ? updatedField : field))
  }

  return [...fields, updatedField]
}

function normalizeSection(section: unknown): Section {
  if (!section || typeof section !== 'object') {
    throw new Error('Invalid section payload')
  }

  const candidate = section as Partial<Section>
  const fallbackId = randomUUID()

  return pageLayoutSchema.shape.sections.element.parse({
    id: candidate.id ?? fallbackId,
    type: candidate.type ?? 'custom',
    label: candidate.label ?? 'Untitled Section',
    variant: candidate.variant,
    fields: Array.isArray(candidate.fields) ? candidate.fields : [],
    blocks: Array.isArray(candidate.blocks) ? candidate.blocks : [],
    themeOverrides: candidate.themeOverrides,
    visibility: candidate.visibility ?? 'public',
  })
}


