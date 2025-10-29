-- Migration: Add completion tracking fields to dashboards table
-- This enables smart routing between generation and overview modes

-- Add completion tracking boolean fields
ALTER TABLE public.dashboards 
ADD COLUMN IF NOT EXISTS business_case_generated BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS content_strategy_generated BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS website_generated BOOLEAN DEFAULT FALSE;

-- Update existing records based on generations table
UPDATE public.dashboards d
SET 
  business_case_generated = EXISTS (
    SELECT 1 FROM public.generations g 
    WHERE g.dashboard_id = d.id AND g.type = 'business_case'
  ),
  content_strategy_generated = EXISTS (
    SELECT 1 FROM public.generations g 
    WHERE g.dashboard_id = d.id AND g.type = 'content_strategy'
  ),
  website_generated = EXISTS (
    SELECT 1 FROM public.generations g 
    WHERE g.dashboard_id = d.id AND g.type = 'website'
  );

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_dashboards_completion 
ON public.dashboards(business_case_generated, content_strategy_generated, website_generated);

-- Add index on user_id for faster user dashboard queries
CREATE INDEX IF NOT EXISTS idx_dashboards_user_id 
ON public.dashboards(user_id);

-- Create function to automatically update completion flags when generations are inserted
CREATE OR REPLACE FUNCTION public.update_dashboard_completion()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.dashboards
  SET 
    business_case_generated = CASE WHEN NEW.type = 'business_case' THEN TRUE ELSE business_case_generated END,
    content_strategy_generated = CASE WHEN NEW.type = 'content_strategy' THEN TRUE ELSE content_strategy_generated END,
    website_generated = CASE WHEN NEW.type = 'website' THEN TRUE ELSE website_generated END
  WHERE id = NEW.dashboard_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call function after generation insert
DROP TRIGGER IF EXISTS on_generation_created ON public.generations;
CREATE TRIGGER on_generation_created
  AFTER INSERT ON public.generations
  FOR EACH ROW EXECUTE PROCEDURE public.update_dashboard_completion();

-- Comments for documentation
COMMENT ON COLUMN public.dashboards.business_case_generated IS 'Tracks if business case has been generated for this dashboard';
COMMENT ON COLUMN public.dashboards.content_strategy_generated IS 'Tracks if content strategy has been generated for this dashboard';
COMMENT ON COLUMN public.dashboards.website_generated IS 'Tracks if website has been generated for this dashboard';

