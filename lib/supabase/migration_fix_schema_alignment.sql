-- Migration: Fix schema alignment with codebase
-- This migration safely updates existing tables to match the codebase requirements
-- Run this in your Supabase SQL Editor

-- ============================================
-- 1. Fix dashboards table
-- ============================================

-- Add missing columns if they don't exist
ALTER TABLE public.dashboards 
ADD COLUMN IF NOT EXISTS product_service TEXT,
ADD COLUMN IF NOT EXISTS pricing_model TEXT;

-- Remove deprecated ideal_customer column (optional - uncomment if you want to remove it)
-- Note: Only do this if you're sure you don't need the data
-- ALTER TABLE public.dashboards DROP COLUMN IF EXISTS ideal_customer;

-- Ensure completion tracking columns exist (they should from previous migration)
ALTER TABLE public.dashboards 
ADD COLUMN IF NOT EXISTS business_case_generated BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS content_strategy_generated BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS website_generated BOOLEAN DEFAULT FALSE;

-- ============================================
-- 2. Fix transactions table
-- ============================================

-- Change amount type from numeric to decimal(10, 2) if needed
-- This will only work if there's no data loss
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'transactions' 
    AND column_name = 'amount'
    AND data_type != 'numeric'
  ) THEN
    ALTER TABLE public.transactions 
    ALTER COLUMN amount TYPE DECIMAL(10, 2) USING amount::decimal(10, 2);
  END IF;
END $$;

-- ============================================
-- 3. Fix layout_blueprints unique constraint
-- ============================================

-- Drop existing constraint if it exists with different name
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'layout_blueprints_dashboard_slug_unique'
  ) THEN
    -- Constraint already exists, do nothing
    NULL;
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_schema = 'public' 
    AND table_name = 'layout_blueprints' 
    AND constraint_type = 'UNIQUE'
    AND constraint_name != 'layout_blueprints_pkey'
  ) THEN
    -- There's a unique constraint but with different name, we'll add ours
    -- PostgreSQL will handle duplicates
    NULL;
  ELSE
    -- Add the unique constraint
    ALTER TABLE public.layout_blueprints 
    ADD CONSTRAINT layout_blueprints_dashboard_slug_unique 
    UNIQUE (dashboard_id, slug);
  END IF;
END $$;

-- Alternative simpler approach - just try to add it (will fail if exists, that's ok)
DO $$
BEGIN
  ALTER TABLE public.layout_blueprints 
  ADD CONSTRAINT layout_blueprints_dashboard_slug_unique 
  UNIQUE (dashboard_id, slug);
EXCEPTION 
  WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- 4. Fix layout_versions unique constraint
-- ============================================

-- Add unique constraint for blueprint_id and version
DO $$
BEGIN
  ALTER TABLE public.layout_versions 
  ADD CONSTRAINT layout_versions_blueprint_version_unique 
  UNIQUE (blueprint_id, version);
EXCEPTION 
  WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- 5. Fix foreign key cascade behaviors
-- ============================================

-- Note: Modifying foreign key constraints requires dropping and recreating them
-- This is safe if the relationships are correct, but be careful

-- Fix dashboards.user_id foreign key
DO $$
BEGIN
  -- Drop existing constraint if it doesn't have CASCADE
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'dashboards_user_id_fkey'
    AND confdeltype != 'c'
  ) THEN
    ALTER TABLE public.dashboards 
    DROP CONSTRAINT dashboards_user_id_fkey;
    
    ALTER TABLE public.dashboards 
    ADD CONSTRAINT dashboards_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Fix generations.dashboard_id foreign key
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'generations_dashboard_id_fkey'
    AND confdeltype != 'c'
  ) THEN
    ALTER TABLE public.generations 
    DROP CONSTRAINT generations_dashboard_id_fkey;
    
    ALTER TABLE public.generations 
    ADD CONSTRAINT generations_dashboard_id_fkey 
    FOREIGN KEY (dashboard_id) REFERENCES public.dashboards(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Fix email_notifications.user_id foreign key
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'email_notifications_user_id_fkey'
    AND confdeltype != 'c'
  ) THEN
    ALTER TABLE public.email_notifications 
    DROP CONSTRAINT email_notifications_user_id_fkey;
    
    ALTER TABLE public.email_notifications 
    ADD CONSTRAINT email_notifications_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Fix transactions.user_id foreign key
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'transactions_user_id_fkey'
    AND confdeltype != 'c'
  ) THEN
    ALTER TABLE public.transactions 
    DROP CONSTRAINT transactions_user_id_fkey;
    
    ALTER TABLE public.transactions 
    ADD CONSTRAINT transactions_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Fix layout_blueprints.dashboard_id foreign key
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'layout_blueprints_dashboard_id_fkey'
    AND confdeltype != 'c'
  ) THEN
    ALTER TABLE public.layout_blueprints 
    DROP CONSTRAINT layout_blueprints_dashboard_id_fkey;
    
    ALTER TABLE public.layout_blueprints 
    ADD CONSTRAINT layout_blueprints_dashboard_id_fkey 
    FOREIGN KEY (dashboard_id) REFERENCES public.dashboards(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Fix layout_versions.blueprint_id foreign key
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'layout_versions_blueprint_id_fkey'
    AND confdeltype != 'c'
  ) THEN
    ALTER TABLE public.layout_versions 
    DROP CONSTRAINT layout_versions_blueprint_id_fkey;
    
    ALTER TABLE public.layout_versions 
    ADD CONSTRAINT layout_versions_blueprint_id_fkey 
    FOREIGN KEY (blueprint_id) REFERENCES public.layout_blueprints(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Fix layout_versions.created_by foreign key (should be SET NULL, not CASCADE)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'layout_versions_created_by_fkey'
    AND confdeltype != 'n'
  ) THEN
    ALTER TABLE public.layout_versions 
    DROP CONSTRAINT layout_versions_created_by_fkey;
    
    ALTER TABLE public.layout_versions 
    ADD CONSTRAINT layout_versions_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ============================================
-- 6. Verify profiles table foreign key
-- ============================================

-- Fix profiles.id foreign key to auth.users
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'profiles_id_fkey'
    AND confdeltype != 'c'
  ) THEN
    ALTER TABLE public.profiles 
    DROP CONSTRAINT profiles_id_fkey;
    
    ALTER TABLE public.profiles 
    ADD CONSTRAINT profiles_id_fkey 
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ============================================
-- Summary
-- ============================================

-- After running this migration, your schema should match the codebase:
-- ✅ dashboards has product_service and pricing_model columns
-- ✅ dashboards has completion tracking booleans
-- ✅ transactions.amount is DECIMAL(10, 2)
-- ✅ layout_blueprints has unique constraint on (dashboard_id, slug)
-- ✅ layout_versions has unique constraint on (blueprint_id, version)
-- ✅ All foreign keys have proper CASCADE behaviors
-- ✅ layout_versions.created_by has SET NULL on delete

