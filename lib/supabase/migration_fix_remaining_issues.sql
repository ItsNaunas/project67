-- Migration: Fix remaining schema issues
-- This is a simpler, direct migration to fix what's still missing
-- Run this in your Supabase SQL Editor

-- ============================================
-- 1. Remove ideal_customer column (optional)
-- ============================================
-- Uncomment the line below if you want to remove the deprecated column
-- ALTER TABLE public.dashboards DROP COLUMN IF EXISTS ideal_customer;

-- ============================================
-- 2. Fix transactions.amount type
-- ============================================
ALTER TABLE public.transactions 
ALTER COLUMN amount TYPE DECIMAL(10, 2) USING amount::decimal(10, 2);

-- ============================================
-- 3. Add unique constraints
-- ============================================

-- Add unique constraint for layout_blueprints (dashboard_id, slug)
-- Note: This will fail if duplicate (dashboard_id, slug) pairs exist
-- If you get an error, check for duplicates first:
-- SELECT dashboard_id, slug, COUNT(*) FROM layout_blueprints GROUP BY dashboard_id, slug HAVING COUNT(*) > 1;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'layout_blueprints_dashboard_slug_unique'
  ) THEN
    ALTER TABLE public.layout_blueprints 
    ADD CONSTRAINT layout_blueprints_dashboard_slug_unique 
    UNIQUE (dashboard_id, slug);
  END IF;
END $$;

-- Add unique constraint for layout_versions (blueprint_id, version)
-- Note: This will fail if duplicate (blueprint_id, version) pairs exist
-- If you get an error, check for duplicates first:
-- SELECT blueprint_id, version, COUNT(*) FROM layout_versions GROUP BY blueprint_id, version HAVING COUNT(*) > 1;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'layout_versions_blueprint_version_unique'
  ) THEN
    ALTER TABLE public.layout_versions 
    ADD CONSTRAINT layout_versions_blueprint_version_unique 
    UNIQUE (blueprint_id, version);
  END IF;
END $$;

-- ============================================
-- 4. Fix foreign key cascade behaviors
-- ============================================

-- Fix dashboards.user_id
ALTER TABLE public.dashboards 
DROP CONSTRAINT IF EXISTS dashboards_user_id_fkey;

ALTER TABLE public.dashboards 
ADD CONSTRAINT dashboards_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Fix email_notifications.user_id
ALTER TABLE public.email_notifications 
DROP CONSTRAINT IF EXISTS email_notifications_user_id_fkey;

ALTER TABLE public.email_notifications 
ADD CONSTRAINT email_notifications_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Fix generations.dashboard_id
ALTER TABLE public.generations 
DROP CONSTRAINT IF EXISTS generations_dashboard_id_fkey;

ALTER TABLE public.generations 
ADD CONSTRAINT generations_dashboard_id_fkey 
FOREIGN KEY (dashboard_id) REFERENCES public.dashboards(id) ON DELETE CASCADE;

-- Fix transactions.user_id
ALTER TABLE public.transactions 
DROP CONSTRAINT IF EXISTS transactions_user_id_fkey;

ALTER TABLE public.transactions 
ADD CONSTRAINT transactions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Fix layout_blueprints.dashboard_id
ALTER TABLE public.layout_blueprints 
DROP CONSTRAINT IF EXISTS layout_blueprints_dashboard_id_fkey;

ALTER TABLE public.layout_blueprints 
ADD CONSTRAINT layout_blueprints_dashboard_id_fkey 
FOREIGN KEY (dashboard_id) REFERENCES public.dashboards(id) ON DELETE CASCADE;

-- Fix layout_versions.blueprint_id
ALTER TABLE public.layout_versions 
DROP CONSTRAINT IF EXISTS layout_versions_blueprint_id_fkey;

ALTER TABLE public.layout_versions 
ADD CONSTRAINT layout_versions_blueprint_id_fkey 
FOREIGN KEY (blueprint_id) REFERENCES public.layout_blueprints(id) ON DELETE CASCADE;

-- Fix layout_versions.created_by (should be SET NULL, not CASCADE)
ALTER TABLE public.layout_versions 
DROP CONSTRAINT IF EXISTS layout_versions_created_by_fkey;

ALTER TABLE public.layout_versions 
ADD CONSTRAINT layout_versions_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Fix profiles.id (reference to auth.users)
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_id_fkey;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_id_fkey 
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

