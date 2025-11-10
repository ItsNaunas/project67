-- Layout builder tables
CREATE TABLE public.layout_blueprints (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  dashboard_id UUID NOT NULL REFERENCES public.dashboards(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE (dashboard_id, slug)
);

CREATE TABLE public.layout_versions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  blueprint_id UUID NOT NULL REFERENCES public.layout_blueprints(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  state TEXT NOT NULL DEFAULT 'draft', -- draft, published, archived
  layout JSONB NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE (blueprint_id, version)
);

-- Automatically bump version numbers
CREATE OR REPLACE FUNCTION public.next_layout_version()
RETURNS TRIGGER AS $$
DECLARE
  latest_version INTEGER;
BEGIN
  SELECT COALESCE(MAX(version), 0) INTO latest_version
  FROM public.layout_versions
  WHERE blueprint_id = NEW.blueprint_id;

  NEW.version = latest_version + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER layout_versions_increment_version
  BEFORE INSERT ON public.layout_versions
  FOR EACH ROW EXECUTE PROCEDURE public.next_layout_version();

-- Updated at trigger
CREATE TRIGGER layout_blueprints_updated_at
  BEFORE UPDATE ON public.layout_blueprints
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Enable RLS
ALTER TABLE public.layout_blueprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.layout_versions ENABLE ROW LEVEL SECURITY;

-- Layout blueprints policies
CREATE POLICY "Users can view own layout blueprints" ON public.layout_blueprints
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.dashboards
      WHERE dashboards.id = layout_blueprints.dashboard_id
      AND dashboards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own layout blueprints" ON public.layout_blueprints
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.dashboards
      WHERE dashboards.id = layout_blueprints.dashboard_id
      AND dashboards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own layout blueprints" ON public.layout_blueprints
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.dashboards
      WHERE dashboards.id = layout_blueprints.dashboard_id
      AND dashboards.user_id = auth.uid()
    )
  );

-- Layout versions policies
CREATE POLICY "Users can view own layout versions" ON public.layout_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM public.layout_blueprints AS lb
      JOIN public.dashboards AS d ON d.id = lb.dashboard_id
      WHERE lb.id = layout_versions.blueprint_id
      AND d.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own layout versions" ON public.layout_versions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.layout_blueprints AS lb
      JOIN public.dashboards AS d ON d.id = lb.dashboard_id
      WHERE lb.id = layout_versions.blueprint_id
      AND d.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own layout versions" ON public.layout_versions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1
      FROM public.layout_blueprints AS lb
      JOIN public.dashboards AS d ON d.id = lb.dashboard_id
      WHERE lb.id = layout_versions.blueprint_id
      AND d.user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX layout_versions_blueprint_state_idx
  ON public.layout_versions (blueprint_id, state);


