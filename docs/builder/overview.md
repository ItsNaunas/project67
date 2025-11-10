# Project 67 Website Builder

This document outlines the new Shopify-style layout system that powers Project 67 website generation and visual editing.

## Data Model

- **Section schema** lives in `lib/layout/schema.ts` using Zod for strict typing.
- **Theme tokens** capture palette, typography, and spacing to keep AI generation and the editor aligned.
- **Supabase tables**
  - `layout_blueprints`: one per dashboard/site, stores current status and metadata.
  - `layout_versions`: append-only history for draft/published snapshots. Each row stores the serialized layout JSON and metadata summary.

## Generation Pipeline

- `lib/ai/websiteGenerator.ts` now outputs a `PageLayout` object alongside preview HTML.
- Layouts are stored in Supabase via the `pages/api/layout/save.ts` route which validates ownership and schema.
- Publishing promotes the latest draft via `pages/api/layout/publish.ts`, archives previous published versions, and marks the blueprint as `published`.

## Visual Editor

- Route: `pages/dashboard/editor/[projectId].tsx`
- Components live under `components/editor`:
  - `LayoutEditorContext` handles state, ordering, section addition, and theme updates.
  - `SectionList`, `SectionForm`, `ThemePanel`, `PreviewCanvas` provide the left panel, detail inspector, global theming, and live preview.
  - `components/sections/SectionRenderer.tsx` renders layout sections for both preview and the live site.
- Drag-and-drop powered by `@dnd-kit/core`; analytics hooks fire for save/publish/section actions via `lib/analytics/editor.ts`.

## Version History

- Versions are surfaced in the editor (`VersionTimeline`) with summaries stored in `layout_versions.metadata` (see `lib/layout/summary.ts`).
- Tests covering schema validation live in `__tests__/layout-schema.test.ts` (run with `npm test`).

## Next Steps

- Extend `SectionRenderer` with additional block types (pricing tables, galleries, etc.).
- Add granular field controls (color pickers per section, list editors).
- Wire Shopify export transformation once parity is achieved inside Project 67.

