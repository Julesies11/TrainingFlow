-- Update template workouts to set is_key_workout to false for:
-- 1. Mondays (1) and Fridays (5)
-- 2. Gym/Strength workouts
UPDATE public.tf_plan_template_workouts
SET is_key_workout = false
WHERE day_of_week IN (1, 5)
   OR sport_type_id IN (
       SELECT id FROM public.tf_sport_types 
       WHERE name ILIKE '%Gym%' OR name ILIKE '%Strength%'
   );
