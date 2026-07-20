-- Migration: Make sport_type_id nullable in tf_garmin_sport_mapping to support "IGNORE"
-- Date: 2026-05-01

ALTER TABLE public.tf_garmin_sport_mapping ALTER COLUMN sport_type_id DROP NOT NULL;
