-- Quick Schema Check: Copy and paste this entire script into Supabase SQL Editor
-- This will show you any remaining issues with your schema

SELECT * FROM (
-- ============================================
-- 1. Check Foreign Keys - Should have CASCADE
-- ============================================
SELECT 
  '❌ Missing CASCADE' as issue,
  tc.table_name || '.' || kcu.column_name as location,
  'Should have ON DELETE CASCADE' as expected,
  rc.delete_rule as current_behavior
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND tc.table_name IN ('dashboards', 'email_notifications', 'generations', 'transactions', 'layout_blueprints', 'layout_versions', 'profiles')
  AND tc.constraint_name != 'layout_versions_created_by_fkey'
  AND rc.delete_rule != 'CASCADE'

UNION ALL

-- Check layout_versions.created_by should be SET NULL
SELECT 
  '❌ Wrong behavior' as issue,
  'layout_versions.created_by' as location,
  'Should have ON DELETE SET NULL' as expected,
  rc.delete_rule as current_behavior
FROM information_schema.table_constraints AS tc
JOIN information_schema.referential_constraints AS rc
  ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_name = 'layout_versions_created_by_fkey'
  AND rc.delete_rule != 'SET NULL'

UNION ALL

-- ============================================
-- 2. Check Missing Unique Constraints
-- ============================================
SELECT 
  '❌ Missing unique constraint' as issue,
  'layout_blueprints' as location,
  'Should have UNIQUE (dashboard_id, slug)' as expected,
  'NOT FOUND' as current_behavior
WHERE NOT EXISTS (
  SELECT 1 FROM pg_constraint 
  WHERE conname = 'layout_blueprints_dashboard_slug_unique'
)

UNION ALL

SELECT 
  '❌ Missing unique constraint' as issue,
  'layout_versions' as location,
  'Should have UNIQUE (blueprint_id, version)' as expected,
  'NOT FOUND' as current_behavior
WHERE NOT EXISTS (
  SELECT 1 FROM pg_constraint 
  WHERE conname = 'layout_versions_blueprint_version_unique'
)

UNION ALL

-- ============================================
-- 3. Check Wrong Data Type
-- ============================================
SELECT 
  '❌ Wrong data type' as issue,
  'transactions.amount' as location,
  'Should be DECIMAL(10, 2)' as expected,
  data_type || '(' || COALESCE(numeric_precision::text, '') || ',' || COALESCE(numeric_scale::text, '') || ')' as current_behavior
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'transactions' 
  AND column_name = 'amount'
  AND (data_type != 'numeric' OR numeric_precision != 10 OR numeric_scale != 2)

UNION ALL

-- ============================================
-- 4. Check Deprecated Column (Optional)
-- ============================================
SELECT 
  '⚠️ Deprecated column (optional)' as issue,
  'dashboards.ideal_customer' as location,
  'Consider removing if not used' as expected,
  'EXISTS' as current_behavior
WHERE EXISTS (
  SELECT 1 FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'dashboards'
    AND column_name = 'ideal_customer'
)
) AS all_issues
ORDER BY 
  CASE all_issues.issue
    WHEN '❌ Missing CASCADE' THEN 1
    WHEN '❌ Wrong behavior' THEN 2
    WHEN '❌ Missing unique constraint' THEN 3
    WHEN '❌ Wrong data type' THEN 4
    WHEN '⚠️ Deprecated column (optional)' THEN 5
  END;

-- ============================================
-- Summary: If no rows returned, everything is good! ✅
-- ============================================

