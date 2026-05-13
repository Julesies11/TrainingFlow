-- ======================================================================================
-- Phase 2c: Reordering for Static Calendar Templates
-- ======================================================================================

-- 1. Add order column to workouts
ALTER TABLE public.tf_plan_template_workouts 
ADD COLUMN IF NOT EXISTS "order" BIGINT DEFAULT (EXTRACT(EPOCH FROM now()) * 1000),
ADD COLUMN IF NOT EXISTS recurrence_id TEXT,
ADD COLUMN IF NOT EXISTS recurrence_rule JSONB;

-- 2. Add order column to notes
ALTER TABLE public.tf_plan_template_notes 
ADD COLUMN IF NOT EXISTS "order" BIGINT DEFAULT (EXTRACT(EPOCH FROM now()) * 1000);
