-- Remove sport_type_id from tf_plan_templates
ALTER TABLE public.tf_plan_templates DROP COLUMN IF EXISTS sport_type_id;
