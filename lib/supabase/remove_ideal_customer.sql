-- Optional: Remove deprecated ideal_customer column
-- Only run this if you're sure you don't need the data in this column

-- First, check if there's any data you might want to keep
-- SELECT COUNT(*) FROM dashboards WHERE ideal_customer IS NOT NULL;

-- If you're ready to remove it:
ALTER TABLE public.dashboards DROP COLUMN IF EXISTS ideal_customer;

