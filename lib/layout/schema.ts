import { z } from 'zod'

export const themePaletteSchema = z.object({
  primary: z.string().min(1, 'Primary color is required'),
  secondary: z.string().min(1, 'Secondary color is required'),
  accent: z.string().min(1, 'Accent color is required'),
  background: z.string().min(1, 'Background color is required'),
  surface: z.string().min(1, 'Surface color is required'),
  muted: z.string().min(1, 'Muted color is required'),
  textPrimary: z.string().min(1, 'Primary text color is required'),
  textSecondary: z.string().min(1, 'Secondary text color is required'),
})

export const themeTypographySchema = z.object({
  heading: z.string().min(1, 'Heading font is required'),
  body: z.string().min(1, 'Body font is required'),
  accent: z.string().optional(),
  scale: z.enum(['xs', 'sm', 'md', 'lg']).default('md'),
})

export const themeSpacingSchema = z.object({
  base: z.number().min(2).max(12).default(4),
  radius: z.number().min(0).max(32).default(12),
  gap: z.number().min(2).max(12).default(6),
})

export const themeTokensSchema = z.object({
  palette: themePaletteSchema,
  typography: themeTypographySchema,
  spacing: themeSpacingSchema,
})

export type ThemeTokens = z.infer<typeof themeTokensSchema>

export const fieldSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('text'),
    key: z.string(),
    label: z.string(),
    value: z.string().default(''),
    multiline: z.boolean().default(false),
  }),
  z.object({
    kind: z.literal('richText'),
    key: z.string(),
    label: z.string(),
    markdown: z.string().default(''),
  }),
  z.object({
    kind: z.literal('image'),
    key: z.string(),
    label: z.string(),
    url: z.string().url(),
    alt: z.string().default(''),
  }),
  z.object({
    kind: z.literal('link'),
    key: z.string(),
    label: z.string(),
    href: z.string(),
    text: z.string(),
    style: z.enum(['primary', 'secondary', 'ghost']).default('primary'),
  }),
  z.object({
    kind: z.literal('color'),
    key: z.string(),
    label: z.string(),
    value: z.string(),
  }),
  z.object({
    kind: z.literal('list'),
    key: z.string(),
    label: z.string(),
    itemFieldKey: z.string(),
    values: z.array(z.record(z.string(), z.unknown())).default([]),
  }),
])

export type Field = z.infer<typeof fieldSchema>

export const sectionBlockSchema = z.object({
  id: z.string(),
  label: z.string(),
  fields: z.array(fieldSchema),
  sortOrder: z.number().default(0),
})

export type SectionBlock = z.infer<typeof sectionBlockSchema>

export const sectionSchema = z.object({
  id: z.string(),
  type: z.enum([
    'hero',
    'value-prop',
    'feature-grid',
    'testimonial',
    'pricing',
    'faq',
    'cta',
    'footer',
    'custom',
  ]),
  label: z.string(),
  variant: z.string().optional(),
  fields: z.array(fieldSchema).default([]),
  blocks: z.array(sectionBlockSchema).default([]),
  themeOverrides: themeTokensSchema.partial().optional(),
  visibility: z.enum(['public', 'draft', 'archived']).default('public'),
})

export type Section = z.infer<typeof sectionSchema>

export const pageLayoutSchema = z.object({
  id: z.string(),
  dashboardId: z.string(),
  slug: z.string(),
  status: z.enum(['draft', 'published']).default('draft'),
  locale: z.string().default('en'),
  theme: themeTokensSchema,
  sections: z.array(sectionSchema).min(1, 'At least one section is required'),
  metadata: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      seoKeywords: z.array(z.string()).default([]),
      templateId: z.number().optional(),
      templateName: z.string().optional(),
    })
    .default({}),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type PageLayout = z.infer<typeof pageLayoutSchema>

/**
 * DeepPartial utility type for nested partial updates.
 * Makes all properties optional recursively, allowing partial updates to nested objects.
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export interface SectionFactoryInput {
  id: string
  label: string
  variant?: string
  fields: Field[]
  blocks?: SectionBlock[]
  themeOverrides?: Partial<ThemeTokens>
}

export function createSection(input: SectionFactoryInput): Section {
  return sectionSchema.parse({
    id: input.id,
    type: deriveSectionType(input.variant),
    label: input.label,
    variant: input.variant,
    fields: input.fields ?? [],
    blocks: input.blocks ?? [],
    themeOverrides: input.themeOverrides,
    visibility: 'public',
  })
}

function deriveSectionType(variant?: string) {
  if (!variant) {
    return 'custom' as const
  }

  const normalized = variant.toLowerCase()
  if (normalized.includes('hero')) return 'hero' as const
  if (normalized.includes('feature')) return 'feature-grid' as const
  if (normalized.includes('testimonial')) return 'testimonial' as const
  if (normalized.includes('pricing')) return 'pricing' as const
  if (normalized.includes('faq')) return 'faq' as const
  if (normalized.includes('cta')) return 'cta' as const
  if (normalized.includes('footer')) return 'footer' as const
  if (normalized.includes('value')) return 'value-prop' as const

  return 'custom' as const
}


