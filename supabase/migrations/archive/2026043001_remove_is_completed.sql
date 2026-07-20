-- Migration: Remove is_completed flag from tf_workouts
-- Date: 2026-04-30

ALTER TABLE public.tf_workouts DROP COLUMN IF EXISTS is_completed;
