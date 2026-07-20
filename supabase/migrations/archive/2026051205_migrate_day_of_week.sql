-- Migrate day_of_week from 0-6 (0=Sunday) to 1-7 (1=Monday, 7=Sunday)

-- 1. Update tf_plan_template_workouts
ALTER TABLE public.tf_plan_template_workouts DROP CONSTRAINT IF EXISTS tf_plan_template_workouts_day_of_week_check;

UPDATE public.tf_plan_template_workouts
SET day_of_week = 7
WHERE day_of_week = 0;

ALTER TABLE public.tf_plan_template_workouts
ADD CONSTRAINT tf_plan_template_workouts_day_of_week_check 
CHECK (day_of_week BETWEEN 1 AND 7);

-- 2. Update tf_plan_template_notes
ALTER TABLE public.tf_plan_template_notes DROP CONSTRAINT IF EXISTS tf_plan_template_notes_day_of_week_check;

UPDATE public.tf_plan_template_notes
SET day_of_week = 7
WHERE day_of_week = 0;

ALTER TABLE public.tf_plan_template_notes
ADD CONSTRAINT tf_plan_template_notes_day_of_week_check 
CHECK (day_of_week BETWEEN 1 AND 7);
