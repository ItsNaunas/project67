-- DIRECT MIGRATION: Fix all remaining schema issues
-- This is the simplest possible approach - just drop and recreate constraints
-- Run this entire script in Supabase SQL Editor

-- ============================================
-- 1. Fix transactions.amount type
-- ============================================
ALTER TABLE public.transactions 
ALTER COLUMN amount TYPE DECIMAL(10, 2) USING amount::decimal(10, 2);

-- ============================================
-- 2. Add unique constraints
-- ============================================
-- If these fail, you have duplicate data. Check with:
-- SELECT dashboard_id, slug, COUNT(*) FROM layout_blueprints GROUP BY dashboard_id, slug HAVING COUNT(*) > 1;
ALTER TABLE public.layout_blueprints 
ADD CONSTRAINT layout_blueprints_dashboard_slug_unique 
UNIQUE (dashboard_id, slug);

-- SELECT blueprint_id, version, COUNT(*) FROM layout_versions GROUP BY blueprint_id, version HAVING COUNT(*) > 1;
ALTER TABLE public.layout_versions 
ADD CONSTRAINT layout_versions_blueprint_version_unique 
UNIQUE (blueprint_id, version);

-- ============================================
-- 3. Fix ALL foreign keys with CASCADE
-- ============================================

-- dashboards.user_id
ALTER TABLE public.dashboards DROP CONSTRAINT IF EXISTS dashboards_user_id_fkey;
ALTER TABLE public.dashboards 
ADD CONSTRAINT dashboards_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- email_notifications.user_id
ALTER TABLE public.email_notifications DROP CONSTRAINT IF EXISTS email_notifications_user_id_fkey;
ALTER TABLE public.email_notifications 
ADD CONSTRAINT email_notifications_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- generations.dashboard_id
ALTER TABLE public.generations DROP CONSTRAINT IF EXISTS generations_dashboard_id_fkey;
ALTER TABLE public.generations 
ADD CONSTRAINT generations_dashboard_id_fkey 
FOREIGN KEY (dashboard_id) REFERENCES public.dashboards(id) ON DELETE CASCADE;

-- transactions.user_id
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_user_id_fkey;
ALTER TABLE public.transactions 
ADD CONSTRAINT transactions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- layout_blueprints.dashboard_id
ALTER TABLE public.layout_blueprints DROP CONSTRAINT IF EXISTS layout_blueprints_dashboard_id_fkey;
ALTER TABLE public.layout_blueprints 
ADD CONSTRAINT layout_blueprints_dashboard_id_fkey 
FOREIGN KEY (dashboard_id) REFERENCES public.dashboards(id) ON DELETE CASCADE;

-- layout_versions.blueprint_id
ALTER TABLE public.layout_versions DROP CONSTRAINT IF EXISTS layout_versions_blueprint_id_fkey;
ALTER TABLE public.layout_versions 
ADD CONSTRAINT layout_versions_blueprint_id_fkey 
FOREIGN KEY (blueprint_id) REFERENCES public.layout_blueprints(id) ON DELETE CASCADE;

-- layout_versions.created_by (SET NULL, not CASCADE)
ALTER TABLE public.layout_versions DROP CONSTRAINT IF EXISTS layout_versions_created_by_fkey;
ALTER TABLE public.layout_versions 
ADD CONSTRAINT layout_versions_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- profiles.id (to auth.users)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_id_fkey 
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

