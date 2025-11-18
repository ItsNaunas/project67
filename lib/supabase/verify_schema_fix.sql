-- Verification Script: Check if all schema fixes were applied correctly
-- Run this to verify your schema is now correct

-- ============================================
-- 1. Check transactions.amount type
-- ============================================
SELECT 
  table_name,
  column_name,
  data_type,
  numeric_precision,
  numeric_scale
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'transactions' 
  AND column_name = 'amount';
-- Expected: data_type = 'numeric', numeric_precision = 10, numeric_scale = 2

-- ============================================
-- 2. Check unique constraints
-- ============================================
SELECT 
  conname as constraint_name,
  contype as constraint_type
FROM pg_constraint
WHERE conname IN (
  'layout_blueprints_dashboard_slug_unique',
  'layout_versions_blueprint_version_unique'
);
-- Expected: Both constraints should exist

-- ============================================
-- 3. Check foreign key cascade behaviors
-- ============================================
SELECT 
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule,
  tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND tc.table_name IN (
    'dashboards',
    'email_notifications',
    'generations',
    'transactions',
    'layout_blueprints',
    'layout_versions',
    'profiles'
  )
ORDER BY tc.table_name, kcu.column_name;
-- Expected: 
-- - Most should have delete_rule = 'CASCADE'
-- - layout_versions.created_by should have delete_rule = 'SET NULL'

-- ============================================
-- 4. Summary Check
-- ============================================
SELECT 
  'Foreign Keys with CASCADE' as check_type,
  COUNT(*) as count
FROM information_schema.referential_constraints rc
JOIN information_schema.table_constraints tc ON rc.constraint_name = tc.constraint_name
WHERE tc.table_schema = 'public'
  AND rc.delete_rule = 'CASCADE'
  AND tc.table_name IN ('dashboards', 'email_notifications', 'generations', 'transactions', 'layout_blueprints', 'layout_versions', 'profiles');

SELECT 
  'Foreign Keys with SET NULL' as check_type,
  COUNT(*) as count
FROM information_schema.referential_constraints rc
JOIN information_schema.table_constraints tc ON rc.constraint_name = tc.constraint_name
WHERE tc.table_schema = 'public'
  AND rc.delete_rule = 'SET NULL'
  AND tc.table_name = 'layout_versions'
  AND tc.constraint_name = 'layout_versions_created_by_fkey';

SELECT 
  'Unique Constraints' as check_type,
  COUNT(*) as count
FROM pg_constraint
WHERE conname IN (
  'layout_blueprints_dashboard_slug_unique',
  'layout_versions_blueprint_version_unique'
);

