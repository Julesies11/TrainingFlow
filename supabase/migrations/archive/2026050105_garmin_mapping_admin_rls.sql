-- Migration: Add Admin management policy for Garmin mappings
-- Date: 2026-05-01

-- Allow admins to manage all mappings
CREATE POLICY "Admins can manage all Garmin mappings"
    ON public.tf_garmin_sport_mapping
    FOR ALL
    TO authenticated
    USING (EXISTS (SELECT 1 FROM public.tf_profiles WHERE id = auth.uid() AND role = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.tf_profiles WHERE id = auth.uid() AND role = 'admin'));
