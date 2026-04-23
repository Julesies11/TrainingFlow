-- PeakForm Consolidated Baseline Schema
-- Date: 2026-04-23
-- Description: Unified schema including profiles, training data, lookup tables, RLS policies, and storage.

-- ============================================================================
-- 1. TABLES
-- ============================================================================

-- 1.1 pf_profiles
CREATE TABLE public.pf_profiles (
    id uuid NOT NULL,
    updated_at timestamp with time zone DEFAULT now(),
    theme text DEFAULT 'light'::text,
    role text NOT NULL DEFAULT 'user',
    workout_type_options text NOT NULL,
    effort_settings jsonb,
    avatar_url text,
    CONSTRAINT profiles_pkey PRIMARY KEY (id),
    CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- 1.2 pf_sport_types
CREATE TABLE public.pf_sport_types (
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
    CONSTRAINT sport_types_pkey PRIMARY KEY (id),
    CONSTRAINT sport_types_name_key UNIQUE (name),
    CONSTRAINT sport_types_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id),
    CONSTRAINT sport_types_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES auth.users(id)
) TABLESPACE pg_default;

-- 1.3 pf_event_types
CREATE TABLE public.pf_event_types (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    is_active boolean NOT NULL DEFAULT true,
    is_system boolean NOT NULL DEFAULT false,
    icon_name text NOT NULL DEFAULT 'Info',
    color_theme text NOT NULL DEFAULT 'other',
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT event_types_pkey PRIMARY KEY (id),
    CONSTRAINT event_types_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL
) TABLESPACE pg_default;

-- 1.4 pf_event_priorities
CREATE TABLE public.pf_event_priorities (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    is_active boolean NOT NULL DEFAULT true,
    is_system boolean NOT NULL DEFAULT false,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT event_priorities_pkey PRIMARY KEY (id),
    CONSTRAINT event_priorities_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL
) TABLESPACE pg_default;

-- 1.5 pf_events
CREATE TABLE public.pf_events (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    date date NOT NULL,
    title text NOT NULL,
    event_type_id uuid NOT NULL,
    priority_id uuid NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT goals_pkey PRIMARY KEY (id),
    CONSTRAINT goals_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT pf_events_event_type_id_fkey FOREIGN KEY (event_type_id) REFERENCES public.pf_event_types(id) ON DELETE RESTRICT,
    CONSTRAINT pf_events_priority_id_fkey FOREIGN KEY (priority_id) REFERENCES public.pf_event_priorities(id) ON DELETE RESTRICT
) TABLESPACE pg_default;

-- 1.6 pf_event_segments
CREATE TABLE public.pf_event_segments (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    event_id uuid NOT NULL,
    sport_type_id uuid NOT NULL,
    planned_duration_minutes integer,
    planned_distance_kilometers numeric(10,2),
    effort_level integer NOT NULL DEFAULT 1,
    segment_order integer NOT NULL DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT event_segments_pkey PRIMARY KEY (id),
    CONSTRAINT event_segments_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.pf_events(id) ON DELETE CASCADE,
    CONSTRAINT event_segments_sport_type_id_fkey FOREIGN KEY (sport_type_id) REFERENCES public.pf_sport_types(id) ON DELETE RESTRICT,
    CONSTRAINT event_segments_effort_level_check CHECK (((effort_level >= 1) AND (effort_level <= 4)))
) TABLESPACE pg_default;

-- 1.7 pf_daily_metrics
CREATE TABLE public.pf_daily_metrics (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    date date NOT NULL,
    tss integer DEFAULT 0,
    ctl double precision DEFAULT 0,
    atl double precision DEFAULT 0,
    tsb double precision DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT daily_metrics_pkey PRIMARY KEY (id),
    CONSTRAINT daily_metrics_user_id_date_key UNIQUE (user_id, date),
    CONSTRAINT daily_metrics_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- 1.8 pf_library_workouts
CREATE TABLE public.pf_library_workouts (
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
    CONSTRAINT library_workouts_pkey PRIMARY KEY (id),
    CONSTRAINT library_workouts_sport_type_id_fkey FOREIGN KEY (sport_type_id) REFERENCES public.pf_sport_types(id) ON DELETE RESTRICT,
    CONSTRAINT library_workouts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- 1.9 pf_user_sport_settings
CREATE TABLE public.pf_user_sport_settings (
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
    CONSTRAINT user_sport_settings_pkey PRIMARY KEY (id),
    CONSTRAINT user_sport_settings_user_id_sport_type_id_key UNIQUE (user_id, sport_type_id),
    CONSTRAINT user_sport_settings_sport_type_id_fkey FOREIGN KEY (sport_type_id) REFERENCES public.pf_sport_types(id) ON DELETE CASCADE,
    CONSTRAINT user_sport_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- 1.10 pf_workouts
CREATE TABLE public.pf_workouts (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    date date NOT NULL,
    title text NOT NULL,
    description text,
    planned_duration_minutes integer DEFAULT 0,
    planned_distance_km double precision DEFAULT 0,
    effort_level integer DEFAULT 1,
    is_key_workout boolean DEFAULT false,
    is_completed boolean DEFAULT false,
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
    CONSTRAINT workouts_pkey PRIMARY KEY (id),
    CONSTRAINT workouts_sport_type_fkey FOREIGN KEY (sport_type_id) REFERENCES public.pf_sport_types(id) ON DELETE RESTRICT,
    CONSTRAINT workouts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- ============================================================================
-- 2. INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_event_segments_event_id ON public.pf_event_segments USING btree (event_id);

-- ============================================================================
-- 3. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE public.pf_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pf_sport_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pf_event_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pf_event_priorities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pf_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pf_event_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pf_daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pf_library_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pf_user_sport_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pf_workouts ENABLE ROW LEVEL SECURITY;

-- 3.1 pf_profiles Policies
CREATE POLICY "Users can view their own profile" ON public.pf_profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can update their own profile" ON public.pf_profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Users can insert their own profile" ON public.pf_profiles FOR INSERT WITH CHECK (id = auth.uid());

-- 3.2 pf_sport_types Policies
CREATE POLICY "Anyone can view sport types" ON public.pf_sport_types FOR SELECT TO authenticated USING (true);
CREATE POLICY "Creators can manage their own sport types" ON public.pf_sport_types FOR ALL USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());

-- 3.3 pf_event_types Policies
CREATE POLICY "Users can view system or own event types" ON public.pf_event_types FOR SELECT USING (is_system = true OR created_by = auth.uid());
CREATE POLICY "Users can insert own custom event types" ON public.pf_event_types FOR INSERT WITH CHECK (is_system = false AND created_by = auth.uid());
CREATE POLICY "Users can update own custom event types" ON public.pf_event_types FOR UPDATE USING (is_system = false AND created_by = auth.uid());
CREATE POLICY "Admins can manage all event types" ON public.pf_event_types FOR ALL USING (EXISTS (SELECT 1 FROM public.pf_profiles WHERE id = auth.uid() AND role = 'admin')) WITH CHECK (EXISTS (SELECT 1 FROM public.pf_profiles WHERE id = auth.uid() AND role = 'admin'));

-- 3.4 pf_event_priorities Policies
CREATE POLICY "Users can view system or own event priorities" ON public.pf_event_priorities FOR SELECT USING (is_system = true OR created_by = auth.uid());
CREATE POLICY "Users can insert own custom event priorities" ON public.pf_event_priorities FOR INSERT WITH CHECK (is_system = false AND created_by = auth.uid());
CREATE POLICY "Users can update own custom event priorities" ON public.pf_event_priorities FOR UPDATE USING (is_system = false AND created_by = auth.uid());
CREATE POLICY "Admins can manage all event priorities" ON public.pf_event_priorities FOR ALL USING (EXISTS (SELECT 1 FROM public.pf_profiles WHERE id = auth.uid() AND role = 'admin')) WITH CHECK (EXISTS (SELECT 1 FROM public.pf_profiles WHERE id = auth.uid() AND role = 'admin'));

-- 3.5 pf_events Policies
CREATE POLICY "Users can manage their own events" ON public.pf_events FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 3.6 pf_event_segments Policies
CREATE POLICY "Users can manage their own event segments" ON public.pf_event_segments FOR ALL USING (EXISTS (SELECT 1 FROM public.pf_events WHERE pf_events.id = pf_event_segments.event_id AND pf_events.user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM public.pf_events WHERE pf_events.id = pf_event_segments.event_id AND pf_events.user_id = auth.uid()));

-- 3.7 pf_daily_metrics Policies
CREATE POLICY "Users can manage their own daily metrics" ON public.pf_daily_metrics FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 3.8 pf_library_workouts Policies
CREATE POLICY "Users can manage their own library workouts" ON public.pf_library_workouts FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 3.9 pf_user_sport_settings Policies
CREATE POLICY "Users can manage their own sport settings" ON public.pf_user_sport_settings FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 3.10 pf_workouts Policies
CREATE POLICY "Users can manage their own workouts" ON public.pf_workouts FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- 4. SEED DATA
-- ============================================================================

-- 4.1 Sport Types
INSERT INTO public.pf_sport_types (name, description, pace_relevant, pace_unit, distance_unit, effort1_label, effort1_hex, effort2_label, effort2_hex, effort3_label, effort3_hex, effort4_label, effort4_hex)
VALUES 
  ('Swim', 'Swimming workouts', true, 'min/100m', 'm', 'Easy', '#DBEAFE', 'Steady', '#93C5FD', 'Hard', '#3B82F6', 'All Out', '#1E40AF'),
  ('Bike', 'Cycling workouts', true, 'km/h', 'km', 'Easy', '#FEF9C3', 'Steady', '#FDE047', 'Tempo', '#FACC15', 'Hard', '#ff961f'),
  ('Run', 'Running workouts', true, 'min/km', 'km', 'Recovery', '#FEE2E2', 'Easy', '#FCA5A5', 'Tempo', '#EF4444', 'Interval', '#991B1B'),
  ('Strength', 'Strength training', false, null, null, 'Mobility', '#DCFCE7', 'Hypertrophy', '#86EFAC', 'Strength', '#22C55E', 'Power', '#166534')
ON CONFLICT (name) DO NOTHING;

-- 4.2 Event Types
INSERT INTO public.pf_event_types (name, is_system, icon_name, color_theme, created_by)
VALUES 
    ('Race', true, 'Flag', 'afternoon', null),
    ('Goal', true, 'Target', 'morning', null),
    ('Test', true, 'Trophy', 'day', null)
ON CONFLICT DO NOTHING;

-- 4.3 Event Priorities
INSERT INTO public.pf_event_priorities (name, is_system, created_by)
VALUES 
    ('A', true, null),
    ('B', true, null),
    ('C', true, null)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 5. STORAGE
-- ============================================================================

-- 5.1 Avatars Bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('pf_avatars', 'pf_avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 5.2 Storage Policies
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING ( bucket_id = 'pf_avatars' );
CREATE POLICY "Users can upload their own avatars" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'pf_avatars' AND auth.uid()::text = (storage.foldername(name))[1] );
CREATE POLICY "Users can update their own avatars" ON storage.objects FOR UPDATE USING ( bucket_id = 'pf_avatars' AND auth.uid()::text = (storage.foldername(name))[1] );
CREATE POLICY "Users can delete their own avatars" ON storage.objects FOR DELETE USING ( bucket_id = 'pf_avatars' AND auth.uid()::text = (storage.foldername(name))[1] );
