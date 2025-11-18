-- Migration: Fix remaining schema issues (Final Robust Version)
-- This version handles all edge cases and checks before making changes
-- Run this entire script in your Supabase SQL Editor

-- ============================================
-- STEP 1: Fix transactions.amount type
-- ============================================
DO $$
BEGIN
  -- Only change if it's not already DECIMAL(10, 2)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'transactions' 
    AND column_name = 'amount'
    AND (data_type != 'numeric' OR numeric_precision != 10 OR numeric_scale != 2)
  ) THEN
    ALTER TABLE public.transactions 
    ALTER COLUMN amount TYPE DECIMAL(10, 2) USING amount::decimal(10, 2);
  END IF;
END $$;

-- ============================================
-- STEP 2: Add unique constraints (with error handling)
-- ============================================

-- Add unique constraint for layout_blueprints
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'layout_blueprints_dashboard_slug_unique'
  ) THEN
    BEGIN
      ALTER TABLE public.layout_blueprints 
      ADD CONSTRAINT layout_blueprints_dashboard_slug_unique 
      UNIQUE (dashboard_id, slug);
    EXCEPTION 
      WHEN duplicate_table THEN NULL;
      WHEN unique_violation THEN 
        RAISE NOTICE 'Duplicate (dashboard_id, slug) pairs exist. Please clean up duplicates first.';
    END;
  END IF;
END $$;

-- Add unique constraint for layout_versions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'layout_versions_blueprint_version_unique'
  ) THEN
    BEGIN
      ALTER TABLE public.layout_versions 
      ADD CONSTRAINT layout_versions_blueprint_version_unique 
      UNIQUE (blueprint_id, version);
    EXCEPTION 
      WHEN duplicate_table THEN NULL;
      WHEN unique_violation THEN 
        RAISE NOTICE 'Duplicate (blueprint_id, version) pairs exist. Please clean up duplicates first.';
    END;
  END IF;
END $$;

-- ============================================
-- STEP 3: Fix foreign key cascade behaviors
-- ============================================

-- Helper function to safely update foreign key constraints
DO $$
DECLARE
  constraint_name TEXT;
  table_name TEXT;
  column_name TEXT;
  ref_table TEXT;
  ref_column TEXT;
  delete_action TEXT;
BEGIN
  -- Fix dashboards.user_id
  SELECT conname INTO constraint_name
  FROM pg_constraint 
  WHERE conname = 'dashboards_user_id_fkey';
  
  IF constraint_name IS NOT NULL THEN
    -- Check if it already has CASCADE
    SELECT confdeltype INTO delete_action
    FROM pg_constraint 
    WHERE conname = 'dashboards_user_id_fkey';
    
    IF delete_action != 'c' THEN
      ALTER TABLE public.dashboards DROP CONSTRAINT dashboards_user_id_fkey;
      ALTER TABLE public.dashboards 
      ADD CONSTRAINT dashboards_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
  ELSE
    ALTER TABLE public.dashboards 
    ADD CONSTRAINT dashboards_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;

  -- Fix email_notifications.user_id
  SELECT conname INTO constraint_name
  FROM pg_constraint 
  WHERE conname = 'email_notifications_user_id_fkey';
  
  IF constraint_name IS NOT NULL THEN
    SELECT confdeltype INTO delete_action
    FROM pg_constraint 
    WHERE conname = 'email_notifications_user_id_fkey';
    
    IF delete_action != 'c' THEN
      ALTER TABLE public.email_notifications DROP CONSTRAINT email_notifications_user_id_fkey;
      ALTER TABLE public.email_notifications 
      ADD CONSTRAINT email_notifications_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
  ELSE
    ALTER TABLE public.email_notifications 
    ADD CONSTRAINT email_notifications_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;

  -- Fix generations.dashboard_id
  SELECT conname INTO constraint_name
  FROM pg_constraint 
  WHERE conname = 'generations_dashboard_id_fkey';
  
  IF constraint_name IS NOT NULL THEN
    SELECT confdeltype INTO delete_action
    FROM pg_constraint 
    WHERE conname = 'generations_dashboard_id_fkey';
    
    IF delete_action != 'c' THEN
      ALTER TABLE public.generations DROP CONSTRAINT generations_dashboard_id_fkey;
      ALTER TABLE public.generations 
      ADD CONSTRAINT generations_dashboard_id_fkey 
      FOREIGN KEY (dashboard_id) REFERENCES public.dashboards(id) ON DELETE CASCADE;
    END IF;
  ELSE
    ALTER TABLE public.generations 
    ADD CONSTRAINT generations_dashboard_id_fkey 
    FOREIGN KEY (dashboard_id) REFERENCES public.dashboards(id) ON DELETE CASCADE;
  END IF;

  -- Fix transactions.user_id
  SELECT conname INTO constraint_name
  FROM pg_constraint 
  WHERE conname = 'transactions_user_id_fkey';
  
  IF constraint_name IS NOT NULL THEN
    SELECT confdeltype INTO delete_action
    FROM pg_constraint 
    WHERE conname = 'transactions_user_id_fkey';
    
    IF delete_action != 'c' THEN
      ALTER TABLE public.transactions DROP CONSTRAINT transactions_user_id_fkey;
      ALTER TABLE public.transactions 
      ADD CONSTRAINT transactions_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
  ELSE
    ALTER TABLE public.transactions 
    ADD CONSTRAINT transactions_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;

  -- Fix layout_blueprints.dashboard_id
  SELECT conname INTO constraint_name
  FROM pg_constraint 
  WHERE conname = 'layout_blueprints_dashboard_id_fkey';
  
  IF constraint_name IS NOT NULL THEN
    SELECT confdeltype INTO delete_action
    FROM pg_constraint 
    WHERE conname = 'layout_blueprints_dashboard_id_fkey';
    
    IF delete_action != 'c' THEN
      ALTER TABLE public.layout_blueprints DROP CONSTRAINT layout_blueprints_dashboard_id_fkey;
      ALTER TABLE public.layout_blueprints 
      ADD CONSTRAINT layout_blueprints_dashboard_id_fkey 
      FOREIGN KEY (dashboard_id) REFERENCES public.dashboards(id) ON DELETE CASCADE;
    END IF;
  ELSE
    ALTER TABLE public.layout_blueprints 
    ADD CONSTRAINT layout_blueprints_dashboard_id_fkey 
    FOREIGN KEY (dashboard_id) REFERENCES public.dashboards(id) ON DELETE CASCADE;
  END IF;

  -- Fix layout_versions.blueprint_id
  SELECT conname INTO constraint_name
  FROM pg_constraint 
  WHERE conname = 'layout_versions_blueprint_id_fkey';
  
  IF constraint_name IS NOT NULL THEN
    SELECT confdeltype INTO delete_action
    FROM pg_constraint 
    WHERE conname = 'layout_versions_blueprint_id_fkey';
    
    IF delete_action != 'c' THEN
      ALTER TABLE public.layout_versions DROP CONSTRAINT layout_versions_blueprint_id_fkey;
      ALTER TABLE public.layout_versions 
      ADD CONSTRAINT layout_versions_blueprint_id_fkey 
      FOREIGN KEY (blueprint_id) REFERENCES public.layout_blueprints(id) ON DELETE CASCADE;
    END IF;
  ELSE
    ALTER TABLE public.layout_versions 
    ADD CONSTRAINT layout_versions_blueprint_id_fkey 
    FOREIGN KEY (blueprint_id) REFERENCES public.layout_blueprints(id) ON DELETE CASCADE;
  END IF;

  -- Fix layout_versions.created_by (should be SET NULL, not CASCADE)
  SELECT conname INTO constraint_name
  FROM pg_constraint 
  WHERE conname = 'layout_versions_created_by_fkey';
  
  IF constraint_name IS NOT NULL THEN
    SELECT confdeltype INTO delete_action
    FROM pg_constraint 
    WHERE conname = 'layout_versions_created_by_fkey';
    
    IF delete_action != 'n' THEN
      ALTER TABLE public.layout_versions DROP CONSTRAINT layout_versions_created_by_fkey;
      ALTER TABLE public.layout_versions 
      ADD CONSTRAINT layout_versions_created_by_fkey 
      FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;
    END IF;
  ELSE
    ALTER TABLE public.layout_versions 
    ADD CONSTRAINT layout_versions_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;
  END IF;

  -- Fix profiles.id (reference to auth.users)
  SELECT conname INTO constraint_name
  FROM pg_constraint 
  WHERE conname = 'profiles_id_fkey';
  
  IF constraint_name IS NOT NULL THEN
    SELECT confdeltype INTO delete_action
    FROM pg_constraint 
    WHERE conname = 'profiles_id_fkey';
    
    IF delete_action != 'c' THEN
      ALTER TABLE public.profiles DROP CONSTRAINT profiles_id_fkey;
      ALTER TABLE public.profiles 
      ADD CONSTRAINT profiles_id_fkey 
      FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
  ELSE
    ALTER TABLE public.profiles 
    ADD CONSTRAINT profiles_id_fkey 
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ============================================
-- OPTIONAL: Remove ideal_customer column
-- ============================================
-- Uncomment the line below if you want to remove the deprecated column
-- ALTER TABLE public.dashboards DROP COLUMN IF EXISTS ideal_customer;

