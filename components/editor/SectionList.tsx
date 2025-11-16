import { useMemo } from 'react'
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { GripVertical } from 'lucide-react'
import clsx from 'clsx'
import { useLayoutEditor } from './LayoutEditorContext'
import Button from '@/components/ui/Button'

interface SectionListProps {
  onAddSection?: () => void
}

export function SectionList({ onAddSection }: SectionListProps) {
  const { layout, reorderSections, selectSection, selectedSectionId } = useLayoutEditor()
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  const sectionIds = useMemo(
    () => layout?.sections.map((section) => section.id) ?? [],
    [layout?.sections]
  )

  if (!layout) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">
          No layout loaded.
        </div>
      </div>
    )
  }

  const handleDragEnd = (event: DragEndEvent) => {
    if (!event.over) return
    const activeId = String(event.active.id)
    const overId = String(event.over.id)

    if (activeId !== overId) {
      const oldIndex = sectionIds.indexOf(activeId)
      const newIndex = sectionIds.indexOf(overId)
      const newOrder = arrayMove(sectionIds, oldIndex, newIndex)
      reorderSections(newOrder)
    }
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-white/50">
            Sections
          </h2>
          {onAddSection ? (
            <Button variant="ghost" size="sm" onClick={onAddSection}>
              Add Section
            </Button>
          ) : null}
        </div>
        <p className="mt-1 text-xs text-white/40">
          Drag to reorder. Click to edit content and settings.
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={sectionIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {layout.sections.map((section) => (
              <SectionListItem
                key={section.id}
                sectionId={section.id}
                label={section.label}
                type={section.type}
                isActive={selectedSectionId === section.id}
                onSelect={() => selectSection(section.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}

interface SectionListItemProps {
  sectionId: string
  label: string
  type: string
  isActive: boolean
  onSelect: () => void
}

function SectionListItem({ sectionId, label, type, isActive, onSelect }: SectionListItemProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={clsx(
        'group flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left text-sm transition focus:outline-none',
        isActive
          ? 'border-accent/80 bg-accent/10 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.1)]'
          : 'border-white/10 bg-white/[0.04] text-white/70 hover:border-white/20 hover:bg-white/[0.08]'
      )}
    >
      <div>
        <div className="font-medium text-white">{label}</div>
        <div className="text-xs uppercase tracking-wide text-white/40">{type}</div>
      </div>
      <div className="flex items-center gap-2 text-white/30 group-hover:text-white/50">
        <span className="text-xs font-semibold">#{sectionId.slice(0, 4)}</span>
        <GripVertical className="h-4 w-4" />
      </div>
    </button>
  )
}


