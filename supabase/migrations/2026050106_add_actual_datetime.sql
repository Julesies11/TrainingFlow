-- Migration: Add actual_datetime and performance metrics to tf_workouts to support Smart Garmin Sync
-- Date: 2026-05-01

ALTER TABLE public.tf_workouts 
ADD COLUMN IF NOT EXISTS actual_datetime TEXT,
ADD COLUMN IF NOT EXISTS max_hr INTEGER,
ADD COLUMN IF NOT EXISTS max_power INTEGER,
ADD COLUMN IF NOT EXISTS normalized_power INTEGER,
ADD COLUMN IF NOT EXISTS total_ascent DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS total_descent DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS avg_cadence INTEGER,
ADD COLUMN IF NOT EXISTS calories INTEGER,
ADD COLUMN IF NOT EXISTS training_effect DOUBLE PRECISION;

-- Create an index for performance since we search on the timestamp field
CREATE INDEX IF NOT EXISTS idx_tf_workouts_actual_datetime ON public.tf_workouts(actual_datetime);
