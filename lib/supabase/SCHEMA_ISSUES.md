# Schema Issues Summary

## Current Problems in Your Database Schema

### ❌ **1. Missing `ON DELETE CASCADE` on Foreign Keys**

All your foreign keys are missing the `ON DELETE CASCADE` clause, which means:
- When a user is deleted, their dashboards won't be automatically deleted (orphaned data)
- When a dashboard is deleted, its generations won't be deleted
- Data integrity issues and potential errors

**Affected Tables:**
- `dashboards.user_id` → should have `ON DELETE CASCADE`
- `email_notifications.user_id` → should have `ON DELETE CASCADE`
- `generations.dashboard_id` → should have `ON DELETE CASCADE`
- `transactions.user_id` → should have `ON DELETE CASCADE`
- `layout_blueprints.dashboard_id` → should have `ON DELETE CASCADE`
- `layout_versions.blueprint_id` → should have `ON DELETE CASCADE`
- `profiles.id` → should have `ON DELETE CASCADE` (to `auth.users`)

**Exception:**
- `layout_versions.created_by` → should have `ON DELETE SET NULL` (not CASCADE)

---

### ❌ **2. Missing Unique Constraints**

**`layout_blueprints` table:**
- Missing: `UNIQUE (dashboard_id, slug)`
- **Problem:** Allows duplicate slugs per dashboard, which breaks data integrity

**`layout_versions` table:**
- Missing: `UNIQUE (blueprint_id, version)`
- **Problem:** Allows duplicate version numbers per blueprint, which breaks versioning logic

---

### ❌ **3. Wrong Data Type for `transactions.amount`**

- **Current:** `amount numeric NOT NULL`
- **Should be:** `amount DECIMAL(10, 2) NOT NULL`
- **Problem:** `numeric` is less precise for currency. `DECIMAL(10, 2)` ensures exactly 2 decimal places for money.

---

### ⚠️ **4. Deprecated Column (Optional to Remove)**

- **`dashboards.ideal_customer`** (jsonb) - This column is deprecated
- **Status:** Not critical, but should be removed if not used
- **Replacement:** Use `product_service` and `pricing_model` instead

---

## Impact of These Issues

1. **Data Integrity:** Without CASCADE, deleting users/dashboards leaves orphaned records
2. **Application Errors:** Code expects unique constraints - may cause duplicate key errors
3. **Currency Precision:** Using `numeric` instead of `DECIMAL(10, 2)` can cause rounding issues
4. **Code Mismatch:** Your codebase expects these constraints, but database doesn't have them

---

## Fix

Run the migration script: `lib/supabase/migration_direct_fix.sql`

This will:
- ✅ Add `ON DELETE CASCADE` to all foreign keys
- ✅ Add unique constraints
- ✅ Fix `transactions.amount` type
- ✅ Optionally remove `ideal_customer` column

