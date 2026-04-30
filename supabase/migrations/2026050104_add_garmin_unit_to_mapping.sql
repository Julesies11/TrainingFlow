-- Migration: Add garmin_distance_unit to mappings
-- Date: 2026-05-01

ALTER TABLE public.tf_garmin_sport_mapping 
ADD COLUMN IF NOT EXISTS garmin_distance_unit TEXT DEFAULT 'km';

-- Update system mappings to default to 'm' for swimming
UPDATE public.tf_garmin_sport_mapping 
SET garmin_distance_unit = 'm' 
WHERE garmin_activity_type ILIKE '%Swim%' AND is_system = true;
