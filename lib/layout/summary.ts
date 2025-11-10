import type { PageLayout } from './schema'

export interface LayoutVersionMetadata {
  summary: string
  sections: Array<{
    id: string
    label: string
    type: string
  }>
  updatedAt: string
  templateName?: string
  theme?: {
    primaryColor: string
    font: string
  }
}

export function buildLayoutMetadata(layout: PageLayout): LayoutVersionMetadata {
  return {
    summary: `Layout with ${layout.sections.length} sections`,
    sections: layout.sections.map((section) => ({
      id: section.id,
      label: section.label,
      type: section.type,
    })),
    updatedAt: new Date().toISOString(),
    templateName: layout.metadata.templateName,
    theme: {
      primaryColor: layout.theme.palette.primary,
      font: layout.theme.typography.heading,
    },
  }
}


