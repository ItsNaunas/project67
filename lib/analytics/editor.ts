type EditorEventName = 'layout.save' | 'layout.publish' | 'layout.section.add' | 'layout.section.reorder'

interface EditorEventPayload {
  projectId: string
  layoutId?: string
  sectionCount?: number
  versionId?: string
}

export function trackEditorEvent(event: EditorEventName, payload: EditorEventPayload) {
  try {
    if (typeof window !== 'undefined' && 'analytics' in window) {
      const analytics = (window as typeof window & { analytics?: { track: Function } }).analytics
      analytics?.track?.(event, payload)
    } else {
      // eslint-disable-next-line no-console
      console.debug(`[analytics] ${event}`, payload)
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Analytics tracking failed', error)
  }
}


