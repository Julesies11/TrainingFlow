-- Remove calendar_stats_mode column from tf_profiles
ALTER TABLE public.tf_profiles DROP COLUMN IF EXISTS calendar_stats_mode;
