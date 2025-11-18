-- Verified Supabase Database Schema
-- This schema matches the actual codebase implementation

CREATE TABLE public.profiles (
  id uuid NOT NULL,
  email text NOT NULL UNIQUE,
  full_name text,
  credits integer DEFAULT 0,
  has_purchased boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE TABLE public.dashboards (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  business_name text NOT NULL,
  niche text,
  product_service text,
  target_audience text,
  pricing_model text,
  primary_goal text,
  biggest_challenge text,
  brand_tone text,
  status text DEFAULT 'incomplete'::text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  business_case_generated boolean DEFAULT false,
  content_strategy_generated boolean DEFAULT false,
  website_generated boolean DEFAULT false,
  CONSTRAINT dashboards_pkey PRIMARY KEY (id),
  CONSTRAINT dashboards_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

CREATE TABLE public.email_notifications (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  type text NOT NULL,
  sent_at timestamp with time zone,
  status text DEFAULT 'pending'::text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT email_notifications_pkey PRIMARY KEY (id),
  CONSTRAINT email_notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

CREATE TABLE public.generations (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  dashboard_id uuid NOT NULL,
  type text NOT NULL,
  content jsonb NOT NULL,
  version integer DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT generations_pkey PRIMARY KEY (id),
  CONSTRAINT generations_dashboard_id_fkey FOREIGN KEY (dashboard_id) REFERENCES public.dashboards(id) ON DELETE CASCADE
);

CREATE TABLE public.layout_blueprints (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  dashboard_id uuid NOT NULL,
  slug text NOT NULL,
  name text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'draft'::text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT layout_blueprints_pkey PRIMARY KEY (id),
  CONSTRAINT layout_blueprints_dashboard_id_fkey FOREIGN KEY (dashboard_id) REFERENCES public.dashboards(id) ON DELETE CASCADE,
  CONSTRAINT layout_blueprints_dashboard_slug_unique UNIQUE (dashboard_id, slug)
);

CREATE TABLE public.layout_versions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  blueprint_id uuid NOT NULL,
  version integer NOT NULL,
  state text NOT NULL DEFAULT 'draft'::text,
  layout jsonb NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT layout_versions_pkey PRIMARY KEY (id),
  CONSTRAINT layout_versions_blueprint_id_fkey FOREIGN KEY (blueprint_id) REFERENCES public.layout_blueprints(id) ON DELETE CASCADE,
  CONSTRAINT layout_versions_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL,
  CONSTRAINT layout_versions_blueprint_version_unique UNIQUE (blueprint_id, version)
);

CREATE TABLE public.transactions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  type text NOT NULL,
  amount decimal(10, 2) NOT NULL,
  stripe_payment_id text,
  credits_added integer DEFAULT 0,
  status text DEFAULT 'pending'::text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT transactions_pkey PRIMARY KEY (id),
  CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

