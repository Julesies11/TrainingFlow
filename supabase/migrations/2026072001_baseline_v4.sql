-- TrainingFlow Consolidated Baseline Schema
-- Date: 2026-07-20
-- Version: v4
-- Description: Unified schema including profiles, training data, lookup tables, RLS policies, triggers, and storage.

-- ============================================================================
-- 1. TABLES
-- ============================================================================

-- 1.1 tf_profiles
CREATE TABLE public.tf_profiles (
    id uuid NOT NULL,
    updated_at timestamp with time zone DEFAULT now(),
    theme text DEFAULT 'light'::text,
    role text NOT NULL DEFAULT 'user',
    workout_type_options text NOT NULL DEFAULT 'Swim,Bike,Run,Strength',
    effort_settings jsonb,
    avatar_url text,
    CONSTRAINT tf_profiles_pkey PRIMARY KEY (id),
    CONSTRAINT tf_profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- 1.2 tf_sport_types
CREATE TABLE public.tf_sport_types (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    pace_relevant boolean NOT NULL DEFAULT false,
    pace_unit text,
    distance_unit text,
    effort1_label text,
    effort1_hex text,
    effort2_label text,
    effort2_hex text,
    effort3_label text,
    effort3_hex text,
    effort4_label text,
    effort4_hex text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    modified_by uuid,
    modified_at timestamp with time zone DEFAULT now(),
    CONSTRAINT tf_sport_types_pkey PRIMARY KEY (id),
    CONSTRAINT tf_sport_types_name_key UNIQUE (name),
    CONSTRAINT tf_sport_types_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id),
    CONSTRAINT tf_sport_types_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES auth.users(id)
) TABLESPACE pg_default;

-- 1.3 tf_event_types
CREATE TABLE public.tf_event_types (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    is_active boolean NOT NULL DEFAULT true,
    is_system boolean NOT NULL DEFAULT false,
    icon_name text NOT NULL DEFAULT 'Info',
    color_theme text NOT NULL DEFAULT 'other',
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT tf_event_types_pkey PRIMARY KEY (id),
    CONSTRAINT tf_event_types_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL
) TABLESPACE pg_default;

-- 1.4 tf_event_priorities
CREATE TABLE public.tf_event_priorities (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    is_active boolean NOT NULL DEFAULT true,
    is_system boolean NOT NULL DEFAULT false,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT tf_event_priorities_pkey PRIMARY KEY (id),
    CONSTRAINT tf_event_priorities_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL
) TABLESPACE pg_default;

-- 1.5 tf_events
CREATE TABLE public.tf_events (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    date date NOT NULL,
    title text NOT NULL,
    event_type_id uuid NOT NULL,
    priority_id uuid NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT tf_events_pkey PRIMARY KEY (id),
    CONSTRAINT tf_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT tf_events_event_type_id_fkey FOREIGN KEY (event_type_id) REFERENCES public.tf_event_types(id) ON DELETE RESTRICT,
    CONSTRAINT tf_events_priority_id_fkey FOREIGN KEY (priority_id) REFERENCES public.tf_event_priorities(id) ON DELETE RESTRICT
) TABLESPACE pg_default;

-- 1.6 tf_event_segments
CREATE TABLE public.tf_event_segments (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    event_id uuid NOT NULL,
    sport_type_id uuid NOT NULL,
    planned_duration_minutes integer,
    planned_distance_kilometers numeric(10,2),
    effort_level integer NOT NULL DEFAULT 1,
    segment_order integer NOT NULL DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT tf_event_segments_pkey PRIMARY KEY (id),
    CONSTRAINT tf_event_segments_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.tf_events(id) ON DELETE CASCADE,
    CONSTRAINT tf_event_segments_sport_type_id_fkey FOREIGN KEY (sport_type_id) REFERENCES public.tf_sport_types(id) ON DELETE RESTRICT,
    CONSTRAINT tf_event_segments_effort_level_check CHECK (((effort_level >= 1) AND (effort_level <= 4)))
) TABLESPACE pg_default;

-- 1.7 tf_daily_metrics
CREATE TABLE public.tf_daily_metrics (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    date date NOT NULL,
    tss integer DEFAULT 0,
    ctl double precision DEFAULT 0,
    atl double precision DEFAULT 0,
    tsb double precision DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT tf_daily_metrics_pkey PRIMARY KEY (id),
    CONSTRAINT tf_daily_metrics_user_id_date_key UNIQUE (user_id, date),
    CONSTRAINT tf_daily_metrics_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- 1.8 tf_workout_categories
CREATE TABLE public.tf_workout_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    color TEXT DEFAULT '#6b7280',
    is_system BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
) TABLESPACE pg_default;

-- 1.9 tf_library_workouts
CREATE TABLE public.tf_library_workouts (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    planned_duration_minutes integer DEFAULT 0,
    planned_distance_km double precision DEFAULT 0,
    effort_level integer DEFAULT 1,
    is_key_workout boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    sport_type_id uuid,
    category_id UUID REFERENCES public.tf_workout_categories(id) ON DELETE SET NULL,
    CONSTRAINT tf_library_workouts_pkey PRIMARY KEY (id),
    CONSTRAINT tf_library_workouts_sport_type_id_fkey FOREIGN KEY (sport_type_id) REFERENCES public.tf_sport_types(id) ON DELETE RESTRICT,
    CONSTRAINT tf_library_workouts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- 1.10 tf_user_sport_settings
CREATE TABLE public.tf_user_sport_settings (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    sport_type_id uuid NOT NULL,
    effort1_hex text,
    effort2_hex text,
    effort3_hex text,
    effort4_hex text,
    effort1_label text,
    effort2_label text,
    effort3_label text,
    effort4_label text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT tf_user_sport_settings_pkey PRIMARY KEY (id),
    CONSTRAINT tf_user_sport_settings_user_id_sport_type_id_key UNIQUE (user_id, sport_type_id),
    CONSTRAINT tf_user_sport_settings_sport_type_id_fkey FOREIGN KEY (sport_type_id) REFERENCES public.tf_sport_types(id) ON DELETE CASCADE,
    CONSTRAINT tf_user_sport_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- 1.11 tf_plan_templates
CREATE TABLE public.tf_plan_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    total_weeks INTEGER NOT NULL,
    is_system BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
) TABLESPACE pg_default;

-- 1.12 tf_workouts
CREATE TABLE public.tf_workouts (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    date date NOT NULL,
    title text NOT NULL,
    description text,
    planned_duration_minutes integer DEFAULT 0,
    planned_distance_km double precision DEFAULT 0,
    effort_level integer DEFAULT 1,
    is_key_workout boolean DEFAULT false,
    actual_duration_minutes integer,
    actual_distance_km double precision,
    actual_tss integer,
    avg_hr integer,
    avg_power integer,
    intervals jsonb DEFAULT '[]'::jsonb,
    workout_order bigint DEFAULT 0,
    recurrence_id text,
    recurrence_rule jsonb,
    sport_type_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    actual_datetime text,
    max_hr integer,
    max_power integer,
    normalized_power integer,
    total_ascent double precision,
    total_descent double precision,
    avg_cadence integer,
    calories integer,
    training_effect double precision,
    applied_plan_id uuid,
    plan_template_id uuid REFERENCES public.tf_plan_templates(id) ON DELETE SET NULL,
    category_id uuid REFERENCES public.tf_workout_categories(id) ON DELETE SET NULL,
    CONSTRAINT tf_workouts_pkey PRIMARY KEY (id),
    CONSTRAINT tf_workouts_sport_type_fkey FOREIGN KEY (sport_type_id) REFERENCES public.tf_sport_types(id) ON DELETE RESTRICT,
    CONSTRAINT tf_workouts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- 1.13 tf_error_logs
CREATE TABLE public.tf_error_logs (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone DEFAULT now(),
    user_id uuid,
    message text NOT NULL,
    stack text,
    component_name text,
    severity text DEFAULT 'error',
    context jsonb DEFAULT '{}'::jsonb,
    url text,
    user_agent text,
    CONSTRAINT tf_error_logs_pkey PRIMARY KEY (id),
    CONSTRAINT tf_error_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL
) TABLESPACE pg_default;

-- 1.14 tf_training_goals
CREATE TABLE public.tf_training_goals (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    sport_type_id uuid NOT NULL,
    event_id uuid,
    metric text NOT NULL,
    target_value numeric(10,2) NOT NULL,
    period text NOT NULL DEFAULT 'weekly',
    start_date date NOT NULL,
    end_date date NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT tf_training_goals_pkey PRIMARY KEY (id),
    CONSTRAINT tf_training_goals_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT tf_training_goals_sport_type_id_fkey FOREIGN KEY (sport_type_id) REFERENCES public.tf_sport_types(id) ON DELETE CASCADE,
    CONSTRAINT tf_training_goals_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.tf_events(id) ON DELETE SET NULL,
    CONSTRAINT tf_training_goals_metric_check CHECK (metric IN ('duration', 'distance')),
    CONSTRAINT tf_training_goals_period_check CHECK (period IN ('weekly', 'monthly'))
) TABLESPACE pg_default;

-- 1.15 tf_notes
CREATE TABLE public.tf_notes (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    date date NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT tf_notes_pkey PRIMARY KEY (id),
    CONSTRAINT tf_notes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- 1.16 tf_garmin_sport_mapping
CREATE TABLE public.tf_garmin_sport_mapping (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    garmin_activity_type TEXT NOT NULL,
    sport_type_id UUID REFERENCES public.tf_sport_types(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    is_system BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    garmin_distance_unit TEXT DEFAULT 'km',
    CONSTRAINT tf_garmin_sport_mapping_user_type_unique UNIQUE (garmin_activity_type, user_id)
) TABLESPACE pg_default;

-- 1.17 tf_plan_template_workouts
CREATE TABLE public.tf_plan_template_workouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES public.tf_plan_templates(id) ON DELETE CASCADE NOT NULL,
    week_number INTEGER NOT NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
    sport_type_id UUID REFERENCES public.tf_sport_types(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    planned_duration_minutes INTEGER DEFAULT 0 NOT NULL,
    planned_distance_kilometers NUMERIC DEFAULT 0 NOT NULL,
    effort_level INTEGER DEFAULT 1 NOT NULL,
    is_key_workout BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "order" BIGINT DEFAULT (EXTRACT(EPOCH FROM now()) * 1000),
    recurrence_id TEXT,
    recurrence_rule JSONB
) TABLESPACE pg_default;

-- 1.18 tf_plan_template_notes
CREATE TABLE public.tf_plan_template_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES public.tf_plan_templates(id) ON DELETE CASCADE NOT NULL,
    week_number INTEGER NOT NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "order" BIGINT DEFAULT (EXTRACT(EPOCH FROM now()) * 1000)
) TABLESPACE pg_default;

-- ============================================================================
-- 2. INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_tf_event_segments_event_id ON public.tf_event_segments USING btree (event_id);
CREATE INDEX IF NOT EXISTS idx_tf_training_goals_user_id ON public.tf_training_goals (user_id);
CREATE INDEX IF NOT EXISTS idx_tf_training_goals_dates ON public.tf_training_goals (start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_workouts_user_date ON public.tf_workouts (user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_events_user_date ON public.tf_events (user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_notes_user_date ON public.tf_notes (user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_metrics_user_date ON public.tf_daily_metrics (user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_tf_garmin_mapping_user_id ON public.tf_garmin_sport_mapping(user_id);
CREATE INDEX IF NOT EXISTS idx_tf_garmin_mapping_type ON public.tf_garmin_sport_mapping(garmin_activity_type);
CREATE INDEX IF NOT EXISTS idx_tf_workouts_actual_datetime ON public.tf_workouts(actual_datetime);
CREATE INDEX IF NOT EXISTS idx_tf_workouts_applied_plan_id ON public.tf_workouts(applied_plan_id);
CREATE INDEX IF NOT EXISTS idx_tf_library_workouts_category_id ON public.tf_library_workouts(category_id);

-- ============================================================================
-- 3. FUNCTIONS & TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.tf_check_profile_role_security()
RETURNS TRIGGER AS $$
BEGIN
  -- On INSERT, if the creator is not an admin/developer, force role to 'user'
  IF TG_OP = 'INSERT' THEN
    IF NEW.role IS DISTINCT FROM 'user' THEN
      IF NOT EXISTS (
        SELECT 1 FROM public.tf_profiles
        WHERE id = auth.uid() AND (role = 'admin' OR role = 'developer')
      ) THEN
        NEW.role := 'user';
      END IF;
    END IF;
  -- On UPDATE, if role is changed, ensure the editor is admin/developer
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      IF NOT EXISTS (
        SELECT 1 FROM public.tf_profiles
        WHERE id = auth.uid() AND (role = 'admin' OR role = 'developer')
      ) THEN
        RAISE EXCEPTION 'You do not have permission to update the role column.';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tf_trigger_check_profile_role_security
  BEFORE INSERT OR UPDATE ON public.tf_profiles
  FOR EACH ROW EXECUTE FUNCTION public.tf_check_profile_role_security();

-- ============================================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE public.tf_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tf_sport_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tf_event_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tf_event_priorities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tf_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tf_event_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tf_daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tf_workout_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tf_library_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tf_user_sport_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tf_plan_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tf_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tf_error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tf_training_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tf_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tf_garmin_sport_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tf_plan_template_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tf_plan_template_notes ENABLE ROW LEVEL SECURITY;

-- 4.1 tf_profiles Policies
CREATE POLICY "Users can view their own profile" ON public.tf_profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can update their own profile" ON public.tf_profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Users can insert their own profile" ON public.tf_profiles FOR INSERT WITH CHECK (id = auth.uid());

-- 4.2 tf_sport_types Policies
CREATE POLICY "Anyone can view sport types" ON public.tf_sport_types FOR SELECT TO authenticated USING (true);
CREATE POLICY "Creators can manage their own sport types" ON public.tf_sport_types FOR ALL USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());

-- 4.3 tf_event_types Policies
CREATE POLICY "Users can view system or own event types" ON public.tf_event_types FOR SELECT USING (is_system = true OR created_by = auth.uid());
CREATE POLICY "Users can insert own custom event types" ON public.tf_event_types FOR INSERT WITH CHECK (is_system = false AND created_by = auth.uid());
CREATE POLICY "Users can update own custom event types" ON public.tf_event_types FOR UPDATE USING (is_system = false AND created_by = auth.uid());
CREATE POLICY "Admins can manage all event types" ON public.tf_event_types FOR ALL USING (EXISTS (SELECT 1 FROM public.tf_profiles WHERE id = auth.uid() AND role = 'admin')) WITH CHECK (EXISTS (SELECT 1 FROM public.tf_profiles WHERE id = auth.uid() AND role = 'admin'));

-- 4.4 tf_event_priorities Policies
CREATE POLICY "Users can view system or own event priorities" ON public.tf_event_priorities FOR SELECT USING (is_system = true OR created_by = auth.uid());
CREATE POLICY "Users can insert own custom event priorities" ON public.tf_event_priorities FOR INSERT WITH CHECK (is_system = false AND created_by = auth.uid());
CREATE POLICY "Users can update own custom event priorities" ON public.tf_event_priorities FOR UPDATE USING (is_system = false AND created_by = auth.uid());
CREATE POLICY "Admins can manage all event priorities" ON public.tf_event_priorities FOR ALL USING (EXISTS (SELECT 1 FROM public.tf_profiles WHERE id = auth.uid() AND role = 'admin')) WITH CHECK (EXISTS (SELECT 1 FROM public.tf_profiles WHERE id = auth.uid() AND role = 'admin'));

-- 4.5 tf_events Policies
CREATE POLICY "Users can manage their own events" ON public.tf_events FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 4.6 tf_event_segments Policies
CREATE POLICY "Users can manage their own event segments" ON public.tf_event_segments FOR ALL USING (EXISTS (SELECT 1 FROM public.tf_events WHERE tf_events.id = tf_event_segments.event_id AND tf_events.user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM public.tf_events WHERE tf_events.id = tf_event_segments.event_id AND tf_events.user_id = auth.uid()));

-- 4.7 tf_daily_metrics Policies
CREATE POLICY "Users can manage their own daily metrics" ON public.tf_daily_metrics FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 4.8 tf_workout_categories Policies
CREATE POLICY "Users can view system categories and their own" ON public.tf_workout_categories FOR SELECT USING (is_system = TRUE OR created_by = auth.uid());
CREATE POLICY "Users can manage their own categories" ON public.tf_workout_categories FOR ALL USING (created_by = auth.uid());
CREATE POLICY "Admins can manage all categories" ON public.tf_workout_categories FOR ALL USING (EXISTS (SELECT 1 FROM public.tf_profiles WHERE tf_profiles.id = auth.uid() AND (tf_profiles.role = 'admin' OR tf_profiles.role = 'developer')));

-- 4.9 tf_library_workouts Policies
CREATE POLICY "Users can manage their own library workouts" ON public.tf_library_workouts FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 4.10 tf_user_sport_settings Policies
CREATE POLICY "Users can manage their own sport settings" ON public.tf_user_sport_settings FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 4.11 tf_plan_templates Policies
CREATE POLICY "Users can view system templates and their own" ON public.tf_plan_templates FOR SELECT USING (is_system = TRUE OR created_by = auth.uid());
CREATE POLICY "Users can manage their own templates" ON public.tf_plan_templates FOR ALL USING (created_by = auth.uid());

-- 4.12 tf_workouts Policies
CREATE POLICY "Users can manage their own workouts" ON public.tf_workouts FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 4.13 tf_error_logs Policies
CREATE POLICY "Anyone can insert error logs" ON public.tf_error_logs FOR INSERT WITH CHECK (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY "Admins can view error logs" ON public.tf_error_logs FOR SELECT USING (EXISTS (SELECT 1 FROM public.tf_profiles WHERE tf_profiles.id = auth.uid() AND (tf_profiles.role = 'admin' OR tf_profiles.role = 'developer')));

-- 4.14 tf_training_goals Policies
CREATE POLICY "Users can manage their own training goals" ON public.tf_training_goals FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 4.15 tf_notes Policies
CREATE POLICY "Users can view their own notes" ON public.tf_notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own notes" ON public.tf_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own notes" ON public.tf_notes FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notes" ON public.tf_notes FOR DELETE USING (auth.uid() = user_id);

-- 4.16 tf_garmin_sport_mapping Policies
CREATE POLICY "Users can view system and their own mappings" ON public.tf_garmin_sport_mapping FOR SELECT TO authenticated USING (is_system = true OR user_id = auth.uid());
CREATE POLICY "Users can manage their own mappings" ON public.tf_garmin_sport_mapping FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid() AND is_system = false);
CREATE POLICY "Admins can manage all Garmin mappings" ON public.tf_garmin_sport_mapping FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.tf_profiles WHERE id = auth.uid() AND role = 'admin')) WITH CHECK (EXISTS (SELECT 1 FROM public.tf_profiles WHERE id = auth.uid() AND role = 'admin'));

-- 4.17 tf_plan_template_workouts Policies
CREATE POLICY "Users can view workouts for visible templates" ON public.tf_plan_template_workouts FOR SELECT USING (EXISTS (SELECT 1 FROM public.tf_plan_templates WHERE tf_plan_templates.id = tf_plan_template_workouts.template_id));
CREATE POLICY "Users can manage workouts for their own templates" ON public.tf_plan_template_workouts FOR ALL USING (EXISTS (SELECT 1 FROM public.tf_plan_templates WHERE tf_plan_templates.id = tf_plan_template_workouts.template_id AND tf_plan_templates.created_by = auth.uid()));

-- 4.18 tf_plan_template_notes Policies
CREATE POLICY "Users can view notes for visible templates" ON public.tf_plan_template_notes FOR SELECT USING (EXISTS (SELECT 1 FROM public.tf_plan_templates WHERE tf_plan_templates.id = tf_plan_template_notes.template_id));
CREATE POLICY "Users can manage notes for their own templates" ON public.tf_plan_template_notes FOR ALL USING (EXISTS (SELECT 1 FROM public.tf_plan_templates WHERE tf_plan_templates.id = tf_plan_template_notes.template_id AND tf_plan_templates.created_by = auth.uid()));

-- ============================================================================
-- 5. SEED DATA
-- ============================================================================

-- 5.1 Sport Types
INSERT INTO public.tf_sport_types (name, description, pace_relevant, pace_unit, distance_unit, effort1_label, effort1_hex, effort2_label, effort2_hex, effort3_label, effort3_hex, effort4_label, effort4_hex)
VALUES 
  ('Swim', 'Swimming workouts', true, 'min/100m', 'm', 'Easy', '#DBEAFE', 'Steady', '#93C5FD', 'Hard', '#3B82F6', 'All Out', '#1E40AF'),
  ('Bike', 'Cycling workouts', true, 'km/h', 'km', 'Easy', '#FEF9C3', 'Steady', '#FDE047', 'Tempo', '#FACC15', 'Hard', '#ff961f'),
  ('Run', 'Running workouts', true, 'min/km', 'km', 'Recovery', '#FEE2E2', 'Easy', '#FCA5A5', 'Tempo', '#EF4444', 'Interval', '#991B1B'),
  ('Strength', 'Strength training', false, null, null, 'Mobility', '#DCFCE7', 'Hypertrophy', '#86EFAC', 'Strength', '#22C55E', 'Power', '#166534')
ON CONFLICT (name) DO NOTHING;

-- 5.2 Event Types
INSERT INTO public.tf_event_types (name, is_system, icon_name, color_theme, created_by)
VALUES 
    ('Race', true, 'Flag', 'afternoon', null),
    ('Goal', true, 'Target', 'morning', null),
    ('Test', true, 'Trophy', 'day', null)
ON CONFLICT (name) DO NOTHING;

-- 5.3 Event Priorities
INSERT INTO public.tf_event_priorities (name, is_system, created_by)
VALUES 
    ('A', true, null),
    ('B', true, null),
    ('C', true, null)
ON CONFLICT (name) DO NOTHING;

-- 5.4 Workout Categories
INSERT INTO public.tf_workout_categories (name, color, is_system) 
VALUES
  ('Base', '#3b82f6', true),
  ('Recovery', '#10b981', true),
  ('Tempo', '#f59e0b', true),
  ('Speedwork', '#ef4444', true),
  ('Long Run', '#8b5cf6', true),
  ('Race Pace', '#ec4899', true)
ON CONFLICT (name) DO NOTHING;

-- 5.5 Garmin Default Mappings
INSERT INTO public.tf_garmin_sport_mapping (garmin_activity_type, sport_type_id, is_system, garmin_distance_unit)
SELECT 'Running', id, true, 'km' FROM public.tf_sport_types WHERE name = 'Run'
ON CONFLICT (garmin_activity_type, user_id) DO NOTHING;

INSERT INTO public.tf_garmin_sport_mapping (garmin_activity_type, sport_type_id, is_system, garmin_distance_unit)
SELECT 'Cycling', id, true, 'km' FROM public.tf_sport_types WHERE name = 'Bike'
ON CONFLICT (garmin_activity_type, user_id) DO NOTHING;

INSERT INTO public.tf_garmin_sport_mapping (garmin_activity_type, sport_type_id, is_system, garmin_distance_unit)
SELECT 'Pool Swim', id, true, 'm' FROM public.tf_sport_types WHERE name = 'Swim'
ON CONFLICT (garmin_activity_type, user_id) DO NOTHING;

INSERT INTO public.tf_garmin_sport_mapping (garmin_activity_type, sport_type_id, is_system, garmin_distance_unit)
SELECT 'Strength Training', id, true, 'km' FROM public.tf_sport_types WHERE name = 'Strength'
ON CONFLICT (garmin_activity_type, user_id) DO NOTHING;

-- ============================================================================
-- 6. STORAGE
-- ============================================================================

-- 6.1 Avatars Bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('tf_avatars', 'tf_avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 6.2 Storage Policies
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING ( bucket_id = 'tf_avatars' );
CREATE POLICY "Users can upload their own avatars" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'tf_avatars' AND auth.uid()::text = (storage.foldername(name))[1] );
CREATE POLICY "Users can update their own avatars" ON storage.objects FOR UPDATE USING ( bucket_id = 'tf_avatars' AND auth.uid()::text = (storage.foldername(name))[1] );
CREATE POLICY "Users can delete their own avatars" ON storage.objects FOR DELETE USING ( bucket_id = 'tf_avatars' AND auth.uid()::text = (storage.foldername(name))[1] );
