-- Migration: Create error logs table
-- Date: 2026-04-27
-- Description: Table for capturing application errors for debugging and monitoring.

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

-- RLS Policies
ALTER TABLE public.tf_error_logs ENABLE ROW LEVEL SECURITY;

-- Allow anyone (even unauthenticated users if auth fails) to report errors
CREATE POLICY "Anyone can insert error logs" ON public.tf_error_logs
    FOR INSERT WITH CHECK (true);

-- Only admins can view error logs
CREATE POLICY "Admins can view error logs" ON public.tf_error_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.tf_profiles
            WHERE tf_profiles.id = auth.uid() 
            AND (tf_profiles.role = 'admin' OR tf_profiles.role = 'developer')
        )
    );
