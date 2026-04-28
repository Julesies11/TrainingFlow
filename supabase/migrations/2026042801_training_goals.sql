-- Migration: Create Training Goals Table
-- Date: 2026-04-28
-- Description: Adds a table for setting periodized training targets by sport and metric.

CREATE TABLE public.tf_training_goals (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    sport_type_id uuid NOT NULL,
    event_id uuid,
    metric text NOT NULL, -- 'duration' or 'distance'
    target_value numeric(10,2) NOT NULL,
    period text NOT NULL DEFAULT 'weekly', -- 'weekly' or 'monthly'
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

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE public.tf_training_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own training goals" 
    ON public.tf_training_goals 
    FOR ALL 
    USING (user_id = auth.uid()) 
    WITH CHECK (user_id = auth.uid());

-- Indexes for efficient lookups by user and date range
CREATE INDEX idx_tf_training_goals_user_id ON public.tf_training_goals (user_id);
CREATE INDEX idx_tf_training_goals_dates ON public.tf_training_goals (start_date, end_date);
