-- Add admin comments field to honorarium_reports table
ALTER TABLE public.honorarium_reports 
ADD COLUMN admin_comments text;

-- Add admin comments to existing reports (optional, can be null)
-- This allows staff to add comments when reviewing reports