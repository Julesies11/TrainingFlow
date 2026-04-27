-- Migration: Rename pf_ to tf_ prefix
-- Date: 2026-04-27
-- Description: Renames all database tables, constraints, and storage buckets from pf_ to tf_ prefix.

-- 1. Rename Tables
ALTER TABLE IF EXISTS public.pf_profiles RENAME TO tf_profiles;
ALTER TABLE IF EXISTS public.pf_sport_types RENAME TO tf_sport_types;
ALTER TABLE IF EXISTS public.pf_event_types RENAME TO tf_event_types;
ALTER TABLE IF EXISTS public.pf_event_priorities RENAME TO tf_event_priorities;
ALTER TABLE IF EXISTS public.pf_events RENAME TO tf_events;
ALTER TABLE IF EXISTS public.pf_event_segments RENAME TO tf_event_segments;
ALTER TABLE IF EXISTS public.pf_daily_metrics RENAME TO tf_daily_metrics;
ALTER TABLE IF EXISTS public.pf_library_workouts RENAME TO tf_library_workouts;
ALTER TABLE IF EXISTS public.pf_user_sport_settings RENAME TO tf_user_sport_settings;
ALTER TABLE IF EXISTS public.pf_workouts RENAME TO tf_workouts;

-- 2. Rename Explicitly Named Constraints
ALTER TABLE IF EXISTS public.tf_events RENAME CONSTRAINT pf_events_event_type_id_fkey TO tf_events_event_type_id_fkey;
ALTER TABLE IF EXISTS public.tf_events RENAME CONSTRAINT pf_events_priority_id_fkey TO tf_events_priority_id_fkey;

-- 3. Update Storage Bucket
-- Manual update: tf_avatars bucket has been created manually and pf_avatars deleted.

-- 4. Update Storage Policies
-- Policies on storage.objects that were hardcoded to 'pf_avatars' are replaced with 'tf_avatars'.
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;

CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING ( bucket_id = 'tf_avatars' );
CREATE POLICY "Users can upload their own avatars" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'tf_avatars' AND auth.uid()::text = (storage.foldername(name))[1] );
CREATE POLICY "Users can update their own avatars" ON storage.objects FOR UPDATE USING ( bucket_id = 'tf_avatars' AND auth.uid()::text = (storage.foldername(name))[1] );
CREATE POLICY "Users can delete their own avatars" ON storage.objects FOR DELETE USING ( bucket_id = 'tf_avatars' AND auth.uid()::text = (storage.foldername(name))[1] );
