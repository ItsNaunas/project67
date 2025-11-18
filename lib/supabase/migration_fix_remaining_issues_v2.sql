-- Migration: Fix remaining schema issues (Step-by-step version)
-- Run each section one at a time to identify any issues
-- This version is simpler and easier to debug

-- ============================================
-- STEP 1: Fix transactions.amount type
-- ============================================
-- Run this first. If it fails, you may have data that can't be converted.
ALTER TABLE public.transactions 
ALTER COLUMN amount TYPE DECIMAL(10, 2) USING amount::decimal(10, 2);

-- ============================================
-- STEP 2: Add unique constraints
-- ============================================
-- Run these one at a time. If you get an error about duplicates, 
-- check for duplicate data first using the queries below.

-- Check for duplicates in layout_blueprints (run this first to see if there are any):
-- SELECT dashboard_id, slug, COUNT(*) as count 
-- FROM public.layout_blueprints 
-- GROUP BY dashboard_id, slug 
-- HAVING COUNT(*) > 1;

-- If no duplicates, add the constraint:
ALTER TABLE public.layout_blueprints 
ADD CONSTRAINT layout_blueprints_dashboard_slug_unique 
UNIQUE (dashboard_id, slug);

-- Check for duplicates in layout_versions (run this first to see if there are any):
-- SELECT blueprint_id, version, COUNT(*) as count 
-- FROM public.layout_versions 
-- GROUP BY blueprint_id, version 
-- HAVING COUNT(*) > 1;

-- If no duplicates, add the constraint:
ALTER TABLE public.layout_versions 
ADD CONSTRAINT layout_versions_blueprint_version_unique 
UNIQUE (blueprint_id, version);

-- ============================================
-- STEP 3: Fix foreign key cascade behaviors
-- ============================================
-- Run these one at a time. Each drops the old constraint and adds a new one with CASCADE.

-- Fix dashboards.user_id
ALTER TABLE public.dashboards 
DROP CONSTRAINT dashboards_user_id_fkey;

ALTER TABLE public.dashboards 
ADD CONSTRAINT dashboards_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Fix email_notifications.user_id
ALTER TABLE public.email_notifications 
DROP CONSTRAINT email_notifications_user_id_fkey;

ALTER TABLE public.email_notifications 
ADD CONSTRAINT email_notifications_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Fix generations.dashboard_id
ALTER TABLE public.generations 
DROP CONSTRAINT generations_dashboard_id_fkey;

ALTER TABLE public.generations 
ADD CONSTRAINT generations_dashboard_id_fkey 
FOREIGN KEY (dashboard_id) REFERENCES public.dashboards(id) ON DELETE CASCADE;

-- Fix transactions.user_id
ALTER TABLE public.transactions 
DROP CONSTRAINT transactions_user_id_fkey;

ALTER TABLE public.transactions 
ADD CONSTRAINT transactions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Fix layout_blueprints.dashboard_id
ALTER TABLE public.layout_blueprints 
DROP CONSTRAINT layout_blueprints_dashboard_id_fkey;

ALTER TABLE public.layout_blueprints 
ADD CONSTRAINT layout_blueprints_dashboard_id_fkey 
FOREIGN KEY (dashboard_id) REFERENCES public.dashboards(id) ON DELETE CASCADE;

-- Fix layout_versions.blueprint_id
ALTER TABLE public.layout_versions 
DROP CONSTRAINT layout_versions_blueprint_id_fkey;

ALTER TABLE public.layout_versions 
ADD CONSTRAINT layout_versions_blueprint_id_fkey 
FOREIGN KEY (blueprint_id) REFERENCES public.layout_blueprints(id) ON DELETE CASCADE;

-- Fix layout_versions.created_by (should be SET NULL, not CASCADE)
ALTER TABLE public.layout_versions 
DROP CONSTRAINT layout_versions_created_by_fkey;

ALTER TABLE public.layout_versions 
ADD CONSTRAINT layout_versions_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Fix profiles.id (reference to auth.users)
ALTER TABLE public.profiles 
DROP CONSTRAINT profiles_id_fkey;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_id_fkey 
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- ============================================
-- OPTIONAL: Remove ideal_customer column
-- ============================================
-- Uncomment the line below if you want to remove the deprecated column
-- ALTER TABLE public.dashboards DROP COLUMN IF EXISTS ideal_customer;

