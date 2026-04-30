-- Create Garmin Activity Type to Sport Type Mapping table
CREATE TABLE IF NOT EXISTS public.tf_garmin_sport_mapping (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    garmin_activity_type TEXT NOT NULL,
    sport_type_id UUID NOT NULL REFERENCES public.tf_sport_types(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    is_system BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- Ensure a user only has one mapping per Garmin activity type
    -- and there's only one system mapping per Garmin activity type
    CONSTRAINT tf_garmin_sport_mapping_user_type_unique UNIQUE (garmin_activity_type, user_id)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_tf_garmin_mapping_user_id ON public.tf_garmin_sport_mapping(user_id);
CREATE INDEX IF NOT EXISTS idx_tf_garmin_mapping_type ON public.tf_garmin_sport_mapping(garmin_activity_type);

-- Enable RLS
ALTER TABLE public.tf_garmin_sport_mapping ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view system and their own mappings"
    ON public.tf_garmin_sport_mapping
    FOR SELECT
    TO authenticated
    USING (is_system = true OR user_id = auth.uid());

CREATE POLICY "Users can manage their own mappings"
    ON public.tf_garmin_sport_mapping
    FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Insert some default global mappings
INSERT INTO public.tf_garmin_sport_mapping (garmin_activity_type, sport_type_id, is_system)
SELECT 'Running', id, true FROM public.tf_sport_types WHERE name = 'Run'
ON CONFLICT DO NOTHING;

INSERT INTO public.tf_garmin_sport_mapping (garmin_activity_type, sport_type_id, is_system)
SELECT 'Cycling', id, true FROM public.tf_sport_types WHERE name = 'Bike'
ON CONFLICT DO NOTHING;

INSERT INTO public.tf_garmin_sport_mapping (garmin_activity_type, sport_type_id, is_system)
SELECT 'Pool Swim', id, true FROM public.tf_sport_types WHERE name = 'Swim'
ON CONFLICT DO NOTHING;

INSERT INTO public.tf_garmin_sport_mapping (garmin_activity_type, sport_type_id, is_system)
SELECT 'Strength Training', id, true FROM public.tf_sport_types WHERE name = 'Strength'
ON CONFLICT DO NOTHING;
