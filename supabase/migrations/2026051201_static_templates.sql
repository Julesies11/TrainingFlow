-- ======================================================================================
-- Phase 2: Transition to Static Calendar Templates
-- ======================================================================================

-- 1. Drop old rule-based tables
DROP TABLE IF EXISTS public.tf_plan_template_days;
DROP TABLE IF EXISTS public.tf_plan_template_weeks;

-- 2. Create Static Template Workouts (Snapshot Storage)
CREATE TABLE public.tf_plan_template_workouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES public.tf_plan_templates(id) ON DELETE CASCADE NOT NULL,
    week_number INTEGER NOT NULL, -- 1-indexed (Week 1, Week 2, etc.)
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 1=Monday...
    
    -- Snapshot fields
    sport_type_id UUID REFERENCES public.tf_sport_types(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    planned_duration_minutes INTEGER DEFAULT 0 NOT NULL,
    planned_distance_kilometers NUMERIC DEFAULT 0 NOT NULL,
    effort_level INTEGER DEFAULT 1 NOT NULL,
    is_key_workout BOOLEAN DEFAULT FALSE NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for Template Workouts (Inherit from parent template)
ALTER TABLE public.tf_plan_template_workouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view workouts for visible templates" ON public.tf_plan_template_workouts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.tf_plan_templates
            WHERE tf_plan_templates.id = tf_plan_template_workouts.template_id
        )
    );

CREATE POLICY "Users can manage workouts for their own templates" ON public.tf_plan_template_workouts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.tf_plan_templates
            WHERE tf_plan_templates.id = tf_plan_template_workouts.template_id
            AND tf_plan_templates.created_by = auth.uid()
        )
    );

-- 3. Update Plan Template table to include better metadata if needed
ALTER TABLE public.tf_plan_templates 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;
