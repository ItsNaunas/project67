import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { randomUUID } from 'crypto'
import type { PropsWithChildren } from 'react'
import type { Field, PageLayout, Section } from '@/lib/layout/schema'
import { trackEditorEvent } from '@/lib/analytics/editor'

interface LayoutEditorContextValue {
  layout: PageLayout | null
  setLayout: (layout: PageLayout) => void
  selectedSectionId: string | null
  selectSection: (sectionId: string) => void
  updateSectionField: (sectionId: string, field: Field) => void
  reorderSections: (sectionIds: string[]) => void
  addSection: (section: Section) => void
  deleteSection: (sectionId: string) => void
  updateThemeTokens: (updates: Partial<PageLayout['theme']>) => void
}

const LayoutEditorContext = createContext<LayoutEditorContextValue | undefined>(undefined)

export function LayoutEditorProvider({
  initialLayout,
  children,
}: PropsWithChildren<{ initialLayout: PageLayout | null }>) {
  const [layout, setLayoutState] = useState<PageLayout | null>(initialLayout)
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    initialLayout?.sections[0]?.id ?? null
  )

  useEffect(() => {
    if (initialLayout) {
      setLayoutState(initialLayout)
      setSelectedSectionId(initialLayout.sections[0]?.id ?? null)
    }
  }, [initialLayout])

  const value = useMemo<LayoutEditorContextValue>(() => {
    const setLayout = (nextLayout: PageLayout) => {
      setLayoutState(nextLayout)
      if (!selectedSectionId && nextLayout.sections.length > 0) {
        setSelectedSectionId(nextLayout.sections[0].id)
      }
    }

    const selectSection = (sectionId: string) => {
      setSelectedSectionId(sectionId)
    }

    const updateSectionField = (sectionId: string, field: Field) => {
      if (!layout) return
      const nextSections = layout.sections.map((section) => {
        if (section.id !== sectionId) return section
        const existingIndex = section.fields.findIndex((item) => item.key === field.key)
        const fields =
          existingIndex >= 0
            ? section.fields.map((item, index) => (index === existingIndex ? field : item))
            : [...section.fields, field]
        return {
          ...section,
          fields,
        }
      })
      setLayoutState({ ...layout, sections: nextSections, updatedAt: new Date().toISOString() })
    }

    const reorderSections = (sectionIds: string[]) => {
      if (!layout) return
      const sectionsMap = new Map(layout.sections.map((section) => [section.id, section]))
      const reorderedSections = sectionIds
        .map((sectionId) => sectionsMap.get(sectionId))
        .filter((section): section is Section => Boolean(section))

      setLayoutState({
        ...layout,
        sections: reorderedSections,
        updatedAt: new Date().toISOString(),
      })
      trackEditorEvent('layout.section.reorder', {
        projectId: layout.dashboardId,
        layoutId: layout.id,
        sectionCount: reorderedSections.length,
      })
    }

    const addSection = (section: Section) => {
      if (!layout) return
      const newSection = section.id ? section : { ...section, id: randomUUID() }
      const nextSections = [...layout.sections, newSection]
      setLayoutState({
        ...layout,
        sections: nextSections,
        updatedAt: new Date().toISOString(),
      })
      setSelectedSectionId(newSection.id)
      trackEditorEvent('layout.section.add', {
        projectId: layout.dashboardId,
        layoutId: layout.id,
        sectionCount: nextSections.length,
      })
    }

    const deleteSection = (sectionId: string) => {
      if (!layout) return
      const nextSections = layout.sections.filter((section) => section.id !== sectionId)
      setLayoutState({
        ...layout,
        sections: nextSections,
        updatedAt: new Date().toISOString(),
      })
      if (selectedSectionId === sectionId) {
        setSelectedSectionId(nextSections[0]?.id ?? null)
      }
    }

    const updateThemeTokens = (updates: Partial<PageLayout['theme']>) => {
      if (!layout) return
      setLayoutState({
        ...layout,
        theme: {
          ...layout.theme,
          ...updates,
          palette: {
            ...layout.theme.palette,
            ...updates.palette,
          },
          typography: {
            ...layout.theme.typography,
            ...updates.typography,
          },
          spacing: {
            ...layout.theme.spacing,
            ...updates.spacing,
          },
        },
        updatedAt: new Date().toISOString(),
      })
    }

    return {
      layout,
      setLayout,
      selectedSectionId,
      selectSection,
      updateSectionField,
      reorderSections,
      addSection,
      deleteSection,
      updateThemeTokens,
    }
  }, [layout, selectedSectionId])

  return <LayoutEditorContext.Provider value={value}>{children}</LayoutEditorContext.Provider>
}

export function useLayoutEditor() {
  const context = useContext(LayoutEditorContext)
  if (!context) {
    throw new Error('useLayoutEditor must be used within LayoutEditorProvider')
  }
  return context
}


