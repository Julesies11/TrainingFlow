-- Repair Garmin System Mappings that might have NULL sport_type_id
-- This happens if the initial migration couldn't find a name match

-- First, try to match 'Run' (case insensitive)
UPDATE public.tf_garmin_sport_mapping
SET sport_type_id = (SELECT id FROM public.tf_sport_types WHERE name ILIKE 'Run' LIMIT 1)
WHERE garmin_activity_type = 'Running' AND is_system = true AND sport_type_id IS NULL;

-- 'Bike'
UPDATE public.tf_garmin_sport_mapping
SET sport_type_id = (SELECT id FROM public.tf_sport_types WHERE name ILIKE 'Bike' OR name ILIKE 'Cycling' LIMIT 1)
WHERE garmin_activity_type = 'Cycling' AND is_system = true AND sport_type_id IS NULL;

-- 'Swim'
UPDATE public.tf_garmin_sport_mapping
SET sport_type_id = (SELECT id FROM public.tf_sport_types WHERE name ILIKE 'Swim' LIMIT 1)
WHERE garmin_activity_type = 'Pool Swim' AND is_system = true AND sport_type_id IS NULL;

-- 'Strength'
UPDATE public.tf_garmin_sport_mapping
SET sport_type_id = (SELECT id FROM public.tf_sport_types WHERE name ILIKE 'Strength' LIMIT 1)
WHERE garmin_activity_type = 'Strength Training' AND is_system = true AND sport_type_id IS NULL;
