import { describe, expect, it } from 'vitest'
import { pageLayoutSchema, themeTokensSchema } from '@/lib/layout/schema'

const baseTheme = themeTokensSchema.parse({
  palette: {
    primary: '#111827',
    secondary: '#1f2937',
    accent: '#e11d48',
    background: '#ffffff',
    surface: '#f3f4f6',
    muted: '#e5e7eb',
    textPrimary: '#111827',
    textSecondary: '#4b5563',
  },
  typography: {
    heading: 'Inter',
    body: 'Inter',
    accent: 'Inter',
    scale: 'md',
  },
  spacing: {
    base: 4,
    radius: 16,
    gap: 6,
  },
})

const baseSection = {
  id: 'hero',
  type: 'hero',
  label: 'Hero',
  variant: 'hero',
  fields: [
    { kind: 'text' as const, key: 'heading', label: 'Heading', value: 'Hello', multiline: false },
    { kind: 'richText' as const, key: 'body', label: 'Body', markdown: 'World' },
  ],
  blocks: [],
  visibility: 'public' as const,
}

describe('pageLayoutSchema', () => {
  it('validates a well-formed layout', () => {
    const layout = {
      id: 'layout-1',
      dashboardId: '00000000-0000-0000-0000-000000000000',
      slug: 'landing',
      status: 'draft' as const,
      locale: 'en',
      theme: baseTheme,
      sections: [baseSection],
      metadata: {
        title: 'Sample layout',
        description: 'Test layout',
        templateId: 1,
        templateName: 'Luxury Minimalist',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const parsed = pageLayoutSchema.parse(layout)
    expect(parsed.sections).toHaveLength(1)
    expect(parsed.theme.palette.primary).toBe('#111827')
  })

  it('rejects layouts without sections', () => {
    const layout = {
      id: 'layout-1',
      dashboardId: '00000000-0000-0000-0000-000000000000',
      slug: 'landing',
      status: 'draft' as const,
      locale: 'en',
      theme: baseTheme,
      sections: [],
      metadata: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    expect(() => pageLayoutSchema.parse(layout)).toThrow()
  })
})


