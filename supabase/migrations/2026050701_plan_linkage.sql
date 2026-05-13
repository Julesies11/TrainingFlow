-- Migration: Add applied_plan_id to tf_workouts to support "Unapply Plan" and plan management
-- Date: 2026-05-07

-- 1. Add columns to track plan instantiation
ALTER TABLE public.tf_workouts 
ADD COLUMN IF NOT EXISTS applied_plan_id UUID,
ADD COLUMN IF NOT EXISTS plan_template_id UUID REFERENCES public.tf_plan_templates(id) ON DELETE SET NULL;

-- 2. Index for quick bulk deletion of applied plans
CREATE INDEX IF NOT EXISTS idx_tf_workouts_applied_plan_id ON public.tf_workouts(applied_plan_id);

-- 3. Add category_id to tf_workouts as well (useful for coloring generated plans)
ALTER TABLE public.tf_workouts
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.tf_workout_categories(id) ON DELETE SET NULL;

-- 4. Update tf_library_workouts to ensure category_id is well-indexed
CREATE INDEX IF NOT EXISTS idx_tf_library_workouts_category_id ON public.tf_library_workouts(category_id);
