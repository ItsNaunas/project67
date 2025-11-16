import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import DashboardLayout from '@/components/DashboardLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { SectionList } from '@/components/editor/SectionList'
import { SectionForm } from '@/components/editor/SectionForm'
import { ThemePanel } from '@/components/editor/ThemePanel'
import { PreviewCanvas } from '@/components/editor/PreviewCanvas'
import { LayoutEditorProvider, useLayoutEditor } from '@/components/editor/LayoutEditorContext'
import type { PageLayout } from '@/lib/layout/schema'
import { pageLayoutSchema } from '@/lib/layout/schema'
import { trackEditorEvent } from '@/lib/analytics/editor'
import { Loader2, Save, Undo2 } from 'lucide-react'
import toast from 'react-hot-toast'

type LayoutVersionRecord = {
  id: string
  state: string
  created_at: string
  metadata: Record<string, any> | null
}

export default function LayoutEditorPage() {
  const router = useRouter()
  const { projectId } = router.query
  const session = useSession()
  const supabase = useSupabaseClient()

  const [initialLayout, setInitialLayout] = useState<PageLayout | null>(null)
  const [loading, setLoading] = useState(true)
  const [history, setHistory] = useState<LayoutVersionRecord[]>([])

  useEffect(() => {
    if (!session || typeof projectId !== 'string') return

    const load = async () => {
      setLoading(true)
      try {
        const { data: blueprint } = await supabase
          .from('layout_blueprints')
          .select('*')
          .eq('dashboard_id', projectId)
          .maybeSingle()

        if (blueprint) {
          const { data: versions } = await supabase
            .from('layout_versions')
            .select('id, state, created_at, layout, metadata')
            .eq('blueprint_id', blueprint.id)
            .order('created_at', { ascending: false })

          setHistory(
            (versions ?? []).map((version) => ({
              id: version.id,
              state: version.state,
              created_at: version.created_at,
              metadata: version.metadata,
            }))
          )

          const targetVersion =
            versions?.find((version) => version.state === 'draft') ?? versions?.[0]

          if (targetVersion?.layout) {
            const parsed = pageLayoutSchema.parse(
              normalizeLayoutPayload(targetVersion.layout, projectId)
            )
            setInitialLayout(parsed)
            setLoading(false)
            return
          }
        }

        // Fallback to latest generated layout
        const { data: latestGeneration } = await supabase
          .from('generations')
          .select('content')
          .eq('dashboard_id', projectId)
          .eq('type', 'website')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (latestGeneration?.content) {
          const parsedGeneration =
            typeof latestGeneration.content === 'string'
              ? JSON.parse(latestGeneration.content)
              : latestGeneration.content
          if (parsedGeneration?.layout) {
            const parsed = pageLayoutSchema.parse(
              normalizeLayoutPayload(parsedGeneration.layout, projectId)
            )
            setInitialLayout(parsed)
            setLoading(false)
            setHistory([])
            return
          }
        }

        toast.error('No layout found. Generate a website first.')
        router.push(`/project/${projectId}/generate`)
      } catch (error) {
        console.error('[Layout Editor] Failed to load layout:', error)
        toast.error('Failed to load layout.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [projectId, session, supabase, router])

  if (!session) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="mx-auto min-h-screen max-w-[1400px] px-6 py-8">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-white/40">Editor</p>
            <h1 className="font-display text-4xl font-semibold text-white">Website Layout</h1>
            <p className="mt-2 text-sm text-white/50">
              Edit sections, update content, and fine-tune the theme before publishing.
            </p>
          </div>
          <Button variant="ghost" onClick={() => router.push(`/project/${projectId}`)}>
            Back to Project
          </Button>
        </header>

        {loading ? (
          <Card className="flex h-[60vh] items-center justify-center bg-white/5">
            <Loader2 className="h-8 w-8 animate-spin text-white/70" />
          </Card>
        ) : (
          <LayoutEditorProvider initialLayout={initialLayout}>
            <EditorSurface projectId={String(projectId)} history={history} />
          </LayoutEditorProvider>
        )}
      </div>
    </DashboardLayout>
  )
}

function EditorSurface({ projectId, history }: { projectId: string; history: LayoutVersionRecord[] }) {
  const [saving, setSaving] = useState(false)
  const { layout, addSection, setLayout } = useLayoutEditor()
  const router = useRouter()

  const handleSave = async () => {
    if (!layout) return
    setSaving(true)
    try {
      const response = await fetch('/api/layout/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          layout,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save layout')
      }

      const payload = await response.json()
      if (payload?.version?.layout) {
        try {
          const parsedLayout = pageLayoutSchema.parse(
            normalizeLayoutPayload(payload.version.layout, projectId)
          )
          setLayout(parsedLayout)
        } catch (error) {
          console.warn('[Layout Editor] Unable to parse saved layout payload', error)
        }
      }

      trackEditorEvent('layout.save', {
        projectId,
        layoutId: layout.id,
        sectionCount: layout.sections.length,
        versionId: payload?.version?.id,
      })

      toast.success('Draft saved')
    } catch (error) {
      console.error('[Layout Editor] Save failed:', error)
      toast.error('Could not save layout')
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async () => {
    if (!layout) return
    setSaving(true)
    try {
      const response = await fetch('/api/layout/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          layoutId: layout.id,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to publish layout')
      }

      const payload = await response.json()

      trackEditorEvent('layout.publish', {
        projectId,
        layoutId: layout.id,
        sectionCount: layout.sections.length,
        versionId: payload?.versionId,
      })

      toast.success('Layout published')
      router.push(`/website/${projectId}`)
    } catch (error) {
      console.error('[Layout Editor] Publish failed:', error)
      toast.error('Could not publish layout')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="sticky top-24 z-10 flex items-center justify-between rounded-2xl border border-white/10 bg-black/60 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-3 text-xs text-white/50">
          <span className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
            {layout?.status === 'draft' ? 'Draft' : 'Published'}
          </span>
          <span>Last updated: {formatRelativeTime(layout?.updatedAt)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => window.location.reload()}>
            <Undo2 className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button variant="ghost" size="sm" onClick={handleSave} disabled={saving || !layout}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Draft
          </Button>
          <Button size="sm" onClick={handlePublish} disabled={saving || !layout}>
            Publish
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)_320px]">
        <aside className="space-y-6">
          <SectionList
            onAddSection={() =>
              layout &&
              addSection({
                id: '',
                type: 'custom',
                label: `Section ${layout.sections.length + 1}`,
                variant: 'custom',
                fields: [],
                blocks: [],
                visibility: 'public',
              })
            }
          />
          <ThemePanel />
        </aside>

        <main className="lg:col-span-1">
          <PreviewCanvas />
          <VersionTimeline history={history} />
        </main>

        <aside className="hidden xl:block">
          <Card className="h-full space-y-6 bg-white/5 p-6">
            <SectionForm />
          </Card>
        </aside>
      </div>

      <div className="xl:hidden">
        <Card className="space-y-6 bg-white/5 p-6">
          <SectionForm />
        </Card>
      </div>
    </div>
  )
}

function normalizeLayoutPayload(layout: Partial<PageLayout> | unknown, dashboardId: string) {
  const layoutData = layout as Partial<PageLayout>
  return {
    dashboardId,
    createdAt: layoutData.createdAt ?? new Date().toISOString(),
    updatedAt: layoutData.updatedAt ?? new Date().toISOString(),
    status: layoutData.status ?? 'draft',
    slug: layoutData.slug ?? 'landing',
    theme: layoutData.theme,
    sections: layoutData.sections,
    metadata: layoutData.metadata ?? {},
    id: layoutData.id ?? layoutData.slug ?? dashboardId,
    locale: layoutData.locale ?? 'en',
  }
}

function formatRelativeTime(isoDate?: string) {
  if (!isoDate) return '—'
  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  const diff = Date.now() - new Date(isoDate).getTime()
  const minutes = Math.round(diff / 60000)
  if (Math.abs(minutes) < 60) {
    return formatter.format(-minutes, 'minute')
  }
  const hours = Math.round(minutes / 60)
  if (Math.abs(hours) < 24) {
    return formatter.format(-hours, 'hour')
  }
  const days = Math.round(hours / 24)
  return formatter.format(-days, 'day')
}

function VersionTimeline({ history }: { history: LayoutVersionRecord[] }) {
  if (!history || history.length === 0) {
    return null
  }

  return (
    <div className="mt-6 space-y-3 rounded-2xl border border-white/10 bg-black/50 p-4">
      <div className="flex items-center justify-between text-xs uppercase tracking-wide text-white/50">
        <span>Version History</span>
        <span>{history.length} entries</span>
      </div>
      <ul className="space-y-3">
        {history.map((entry) => (
          <li
            key={entry.id}
            className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/70"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium capitalize text-white">
                {entry.state}
              </span>
              <span className="text-xs text-white/40">{formatRelativeTime(entry.created_at)}</span>
            </div>
            <p className="mt-1 text-xs text-white/40">
              {entry.metadata?.summary || 'No summary available'}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}



