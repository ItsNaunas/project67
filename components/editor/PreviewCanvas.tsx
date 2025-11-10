import { SectionRenderer } from '@/components/sections'
import { useLayoutEditor } from './LayoutEditorContext'

export function PreviewCanvas() {
  const { layout } = useLayoutEditor()

  if (!layout) {
    return (
      <div className="flex h-full items-center justify-center rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/60">
        Select a project to start editing.
      </div>
    )
  }

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-black/60 shadow-2xl">
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-white/40">Live Preview</p>
          <h3 className="text-sm font-semibold text-white">{layout.metadata.title || 'Untitled'}</h3>
        </div>
        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
          Draft
        </span>
      </div>
      <div className="no-scrollbar flex-1 overflow-y-auto bg-white text-gray-900">
        {layout.sections.map((section) => (
          <SectionRenderer key={section.id} section={section} />
        ))}
      </div>
    </div>
  )
}


