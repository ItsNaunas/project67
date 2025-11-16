import { useMemo, ChangeEvent } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { useLayoutEditor } from './LayoutEditorContext'
import type { Field, Section } from '@/lib/layout/schema'

interface FieldEditorProps {
  field: Field
  onChange: (field: Field) => void
}

export function SectionForm() {
  const { layout, selectedSectionId, updateSectionField, deleteSection } = useLayoutEditor()

  const section = useMemo<Section | undefined>(
    () => layout?.sections.find((item) => item.id === selectedSectionId),
    [layout?.sections, selectedSectionId]
  )

  if (!layout || !section) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-sm text-white/60">
        Select a section to edit its content.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-white/40">Editing</p>
          <h3 className="text-lg font-semibold text-white">{section.label}</h3>
          <p className="text-xs text-white/50">Section ID: {section.id}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => deleteSection(section.id)}
          className="text-red-300 hover:text-red-200"
        >
          Remove Section
        </Button>
      </header>

      <div className="space-y-5">
        {section.fields.map((field) => (
          <FieldEditor
            key={field.key}
            field={field}
            onChange={(nextField: Field) => updateSectionField(section.id, nextField)}
          />
        ))}
      </div>
    </div>
  )
}

function FieldEditor({ field, onChange }: FieldEditorProps) {
  if (field.kind === 'list') {
    return (
      <div className="rounded-lg border border-white/10 bg-white/5 p-4">
        <p className="text-sm font-medium text-white">{field.label}</p>
        <p className="mt-1 text-xs text-white/40">List editing coming soon.</p>
      </div>
    )
  }

  if (field.kind === 'image') {
    return (
      <div className="space-y-2 rounded-lg border border-white/10 bg-white/5 p-4">
        <label className="text-xs font-semibold uppercase tracking-wide text-white/50">
          {field.label}
        </label>
        <Input
          value={field.url}
          onChange={(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange({ ...field, url: event.target.value })}
          placeholder="https://"
        />
        <p className="text-xs text-white/40">Alt text: {field.alt || '—'}</p>
      </div>
    )
  }

  if (field.kind === 'link') {
    return (
      <div className="space-y-2 rounded-lg border border-white/10 bg-white/5 p-4">
        <label className="text-xs font-semibold uppercase tracking-wide text-white/50">
          {field.label}
        </label>
        <Input
          value={field.text}
          onChange={(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange({ ...field, text: event.target.value })}
          placeholder="Call to action text"
        />
        <Input
          className="mt-2"
          value={field.href}
          onChange={(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange({ ...field, href: event.target.value })}
          placeholder="#cta"
        />
      </div>
    )
  }

  if (field.kind === 'color') {
    return (
      <div className="space-y-2 rounded-lg border border-white/10 bg-white/5 p-4">
        <label className="text-xs font-semibold uppercase tracking-wide text-white/50">
          {field.label}
        </label>
        <Input
          type="color"
          value={field.value}
          onChange={(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange({ ...field, value: event.target.value })}
        />
      </div>
    )
  }

  if (field.kind === 'richText') {
    return (
      <div className="space-y-2 rounded-lg border border-white/10 bg-white/5 p-4">
        <label className="text-xs font-semibold uppercase tracking-wide text-white/50">
          {field.label}
        </label>
        <textarea
          className="h-32 w-full rounded-lg border border-white/10 bg-transparent p-3 text-sm text-white outline-none focus:border-accent"
          value={field.markdown}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) => onChange({ ...field, markdown: event.target.value })}
        />
      </div>
    )
  }

  return (
    <div className="space-y-2 rounded-lg border border-white/10 bg-white/5 p-4">
      <label className="text-xs font-semibold uppercase tracking-wide text-white/50">
        {field.label}
      </label>
      <Input
        value={field.value}
        onChange={(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange({ ...field, value: event.target.value })}
        placeholder={field.label}
      />
    </div>
  )
}


