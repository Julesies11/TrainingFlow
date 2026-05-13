-- ======================================================================================
-- Phase 1: Training Plan Generator Schema
-- ======================================================================================

-- 1. Workout Categories (Tagging system for library)
CREATE TABLE public.tf_workout_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    color TEXT DEFAULT '#6b7280',
    is_system BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for Workout Categories
ALTER TABLE public.tf_workout_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view system categories and their own" ON public.tf_workout_categories
    FOR SELECT USING (is_system = TRUE OR created_by = auth.uid());

CREATE POLICY "Users can manage their own categories" ON public.tf_workout_categories
    FOR ALL USING (created_by = auth.uid());

CREATE POLICY "Admins can manage all categories" ON public.tf_workout_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.tf_profiles
            WHERE tf_profiles.id = auth.uid() AND (tf_profiles.role = 'admin' OR tf_profiles.role = 'developer')
        )
    );

-- 2. Add Category to Library Workouts
ALTER TABLE public.tf_library_workouts 
ADD COLUMN category_id UUID REFERENCES public.tf_workout_categories(id) ON DELETE SET NULL;

-- 3. Plan Templates
CREATE TABLE public.tf_plan_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    sport_type_id UUID REFERENCES public.tf_sport_types(id) ON DELETE CASCADE,
    description TEXT,
    total_weeks INTEGER NOT NULL,
    is_system BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for Plan Templates
ALTER TABLE public.tf_plan_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view system templates and their own" ON public.tf_plan_templates
    FOR SELECT USING (is_system = TRUE OR created_by = auth.uid());

CREATE POLICY "Users can manage their own templates" ON public.tf_plan_templates
    FOR ALL USING (created_by = auth.uid());

-- 4. Plan Template Weeks (Rhythm/Periodization)
CREATE TABLE public.tf_plan_template_weeks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES public.tf_plan_templates(id) ON DELETE CASCADE NOT NULL,
    week_number INTEGER NOT NULL,
    phase TEXT NOT NULL, -- e.g. 'Base', 'Build', 'Recovery', 'Taper'
    volume_multiplier NUMERIC DEFAULT 1.0 NOT NULL,
    UNIQUE(template_id, week_number)
);

-- RLS for Template Weeks (Inherit from parent template)
ALTER TABLE public.tf_plan_template_weeks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view weeks for visible templates" ON public.tf_plan_template_weeks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.tf_plan_templates
            WHERE tf_plan_templates.id = tf_plan_template_weeks.template_id
        )
    );

CREATE POLICY "Users can manage weeks for their own templates" ON public.tf_plan_template_weeks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.tf_plan_templates
            WHERE tf_plan_templates.id = tf_plan_template_weeks.template_id
            AND tf_plan_templates.created_by = auth.uid()
        )
    );

-- 5. Plan Template Days (Daily Structure)
CREATE TABLE public.tf_plan_template_days (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    week_id UUID REFERENCES public.tf_plan_template_weeks(id) ON DELETE CASCADE NOT NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    category_id UUID REFERENCES public.tf_workout_categories(id) ON DELETE SET NULL,
    duration_percentage NUMERIC NOT NULL, -- Percentage of current weekly volume (e.g. 0.20 = 20%)
    UNIQUE(week_id, day_of_week)
);

-- RLS for Template Days (Inherit from parent week/template)
ALTER TABLE public.tf_plan_template_days ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view days for visible weeks" ON public.tf_plan_template_days
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.tf_plan_template_weeks
            JOIN public.tf_plan_templates ON tf_plan_templates.id = tf_plan_template_weeks.template_id
            WHERE tf_plan_template_weeks.id = tf_plan_template_days.week_id
        )
    );

CREATE POLICY "Users can manage days for their own templates" ON public.tf_plan_template_days
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.tf_plan_template_weeks
            JOIN public.tf_plan_templates ON tf_plan_templates.id = tf_plan_template_weeks.template_id
            WHERE tf_plan_template_weeks.id = tf_plan_template_days.week_id
            AND tf_plan_templates.created_by = auth.uid()
        )
    );

-- 6. SEED DATA
-- Default Categories
INSERT INTO public.tf_workout_categories (name, color, is_system) VALUES
('Base', '#3b82f6', true),       -- Blue
('Recovery', '#10b981', true),   -- Green
('Tempo', '#f59e0b', true),      -- Orange
('Speedwork', '#ef4444', true),  -- Red
('Long Run', '#8b5cf6', true),   -- Purple
('Race Pace', '#ec4899', true);  -- Pink

-- Note: A sample plan template would require existing sport_type_ids, 
-- which vary by environment. We'll leave the templates empty for user/admin creation.
