-- 1. pf_sport_types (no dependencies)
create table public.pf_sport_types (
  id uuid not null default gen_random_uuid (),
  name text not null,
  description text null,
  pace_relevant boolean not null default false,
  pace_unit text null,
  distance_unit text null,
  effort1_label text null,
  effort1_hex text null,
  effort2_label text null,
  effort2_hex text null,
  effort3_label text null,
  effort3_hex text null,
  effort4_label text null,
  effort4_hex text null,
  created_by uuid null,
  created_at timestamp with time zone null default now(),
  modified_by uuid null,
  modified_at timestamp with time zone null default now(),
  constraint sport_types_pkey primary key (id),
  constraint sport_types_name_key unique (name),
  constraint sport_types_created_by_fkey foreign KEY (created_by) references auth.users (id),
  constraint sport_types_modified_by_fkey foreign KEY (modified_by) references auth.users (id)
) TABLESPACE pg_default;

-- 2. pf_profiles (no dependencies)
create table public.pf_profiles (
  id uuid not null,
  updated_at timestamp with time zone null default now(),
  theme text null default 'light'::text,
  workout_type_options text not null,
  effort_settings jsonb null,
  avatar_url text null,
  constraint profiles_pkey primary key (id),
  constraint profiles_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

-- 3. pf_daily_metrics (no dependencies)
create table public.pf_daily_metrics (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  date date not null,
  tss integer null default 0,
  ctl double precision null default 0,
  atl double precision null default 0,
  tsb double precision null default 0,
  created_at timestamp with time zone null default now(),
  constraint daily_metrics_pkey primary key (id),
  constraint daily_metrics_user_id_date_key unique (user_id, date),
  constraint daily_metrics_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

-- 4. pf_events (no dependencies)
create table public.pf_events (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  date date not null,
  type text not null,
  title text not null,
  priority text not null,
  description text null,
  created_at timestamp with time zone null default now(),
  constraint goals_pkey primary key (id),
  constraint goals_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

-- 5. pf_event_segments (depends on pf_events, pf_sport_types)
create table public.pf_event_segments (
  id uuid not null default gen_random_uuid (),
  event_id uuid not null,
  sport_type_id uuid not null,
  planned_duration_minutes integer null,
  planned_distance_kilometers numeric(10, 2) null,
  effort_level integer not null default 1,
  segment_order integer not null default 0,
  created_at timestamp with time zone null default now(),
  constraint event_segments_pkey primary key (id),
  constraint event_segments_event_id_fkey foreign KEY (event_id) references pf_events (id) on delete CASCADE,
  constraint event_segments_sport_type_id_fkey foreign KEY (sport_type_id) references pf_sport_types (id) on delete RESTRICT,
  constraint event_segments_effort_level_check check (
    (
      (effort_level >= 1)
      and (effort_level <= 4)
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_event_segments_event_id on public.pf_event_segments using btree (event_id) TABLESPACE pg_default;

-- 6. pf_library_workouts (depends on pf_sport_types)
create table public.pf_library_workouts (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  title text not null,
  description text null,
  planned_duration_minutes integer null default 0,
  planned_distance_km double precision null default 0,
  effort_level integer null default 1,
  is_key_workout boolean null default false,
  created_at timestamp with time zone null default now(),
  sport_type_id uuid null,
  constraint library_workouts_pkey primary key (id),
  constraint library_workouts_sport_type_id_fkey foreign KEY (sport_type_id) references pf_sport_types (id) on delete RESTRICT,
  constraint library_workouts_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

-- 7. pf_user_sport_settings (depends on pf_sport_types)
create table public.pf_user_sport_settings (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  sport_type_id uuid not null,
  effort1_hex text null,
  effort2_hex text null,
  effort3_hex text null,
  effort4_hex text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  effort1_label text null,
  effort2_label text null,
  effort3_label text null,
  effort4_label text null,
  constraint user_sport_settings_pkey primary key (id),
  constraint user_sport_settings_user_id_sport_type_id_key unique (user_id, sport_type_id),
  constraint user_sport_settings_sport_type_id_fkey foreign KEY (sport_type_id) references pf_sport_types (id) on delete CASCADE,
  constraint user_sport_settings_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

-- 8. pf_workouts (depends on pf_sport_types)
create table public.pf_workouts (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  date date not null,
  title text not null,
  description text null,
  planned_duration_minutes integer null default 0,
  planned_distance_km double precision null default 0,
  effort_level integer null default 1,
  is_key_workout boolean null default false,
  is_completed boolean null default false,
  actual_duration_minutes integer null,
  actual_distance_km double precision null,
  actual_tss integer null,
  avg_hr integer null,
  avg_power integer null,
  intervals jsonb null default '[]'::jsonb,
  workout_order bigint null default 0,
  created_at timestamp with time zone null default now(),
  recurrence_id text null,
  recurrence_rule jsonb null,
  sport_type_id uuid not null,
  constraint workouts_pkey primary key (id),
  constraint workouts_sport_type_fkey foreign KEY (sport_type_id) references pf_sport_types (id) on delete RESTRICT,
  constraint workouts_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.pf_daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pf_event_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pf_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pf_library_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pf_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pf_sport_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pf_user_sport_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pf_workouts ENABLE ROW LEVEL SECURITY;

-- pf_profiles policies: Users can manage their own profile
CREATE POLICY "Users can view their own profile" ON public.pf_profiles
  FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can update their own profile" ON public.pf_profiles
  FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Users can insert their own profile" ON public.pf_profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- pf_daily_metrics policies: Users can manage their own metrics
CREATE POLICY "Users can manage their own daily metrics" ON public.pf_daily_metrics
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- pf_events policies: Users can manage their own events
CREATE POLICY "Users can manage their own events" ON public.pf_events
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- pf_library_workouts policies: Users can manage their own library
CREATE POLICY "Users can manage their own library workouts" ON public.pf_library_workouts
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- pf_user_sport_settings policies: Users can manage their own sport settings
CREATE POLICY "Users can manage their own sport settings" ON public.pf_user_sport_settings
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- pf_workouts policies: Users can manage their own workouts
CREATE POLICY "Users can manage their own workouts" ON public.pf_workouts
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- pf_event_segments policies: Linked to owner of pf_events
CREATE POLICY "Users can manage their own event segments" ON public.pf_event_segments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.pf_events
      WHERE pf_events.id = pf_event_segments.event_id
      AND pf_events.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pf_events
      WHERE pf_events.id = pf_event_segments.event_id
      AND pf_events.user_id = auth.uid()
    )
  );

-- pf_sport_types policies: Read for all authenticated, write for creators
CREATE POLICY "Anyone can view sport types" ON public.pf_sport_types
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Creators can manage their own sport types" ON public.pf_sport_types
  FOR ALL USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());
