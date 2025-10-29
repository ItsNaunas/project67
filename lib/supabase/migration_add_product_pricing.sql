-- Migration: Add product_service and pricing_model fields, remove ideal_customer
-- Run this in your Supabase SQL editor

-- Add new columns
ALTER TABLE public.dashboards 
ADD COLUMN IF NOT EXISTS product_service TEXT,
ADD COLUMN IF NOT EXISTS pricing_model TEXT;

-- Remove old column (if you want to clean up)
-- Note: Only run this if you're sure you don't need the ideal_customer data
-- ALTER TABLE public.dashboards DROP COLUMN IF EXISTS ideal_customer;

-- If you want to keep ideal_customer data, you could migrate it to target_audience
-- UPDATE public.dashboards 
-- SET target_audience = CONCAT(
--   target_audience, 
--   ' | Age: ', ideal_customer->>'age',
--   ', Location: ', ideal_customer->>'location',
--   ', Pain Point: ', ideal_customer->>'painPoint'
-- )
-- WHERE ideal_customer IS NOT NULL;

