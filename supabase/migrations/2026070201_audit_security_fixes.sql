-- Migration: Security fixes for profiles role updates, Garmin mappings is_system column, and error logs spoofing.
-- Date: 2026-07-02

-- 1. Lock down the role column in public.tf_profiles via a trigger
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

DROP TRIGGER IF EXISTS tf_trigger_check_profile_role_security ON public.tf_profiles;

CREATE TRIGGER tf_trigger_check_profile_role_security
  BEFORE INSERT OR UPDATE ON public.tf_profiles
  FOR EACH ROW EXECUTE FUNCTION public.tf_check_profile_role_security();

-- 2. Restrict user mappings from setting is_system = true in public.tf_garmin_sport_mapping
DROP POLICY IF EXISTS "Users can manage their own mappings" ON public.tf_garmin_sport_mapping;

CREATE POLICY "Users can manage their own mappings"
    ON public.tf_garmin_sport_mapping
    FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid() AND is_system = false);

-- 3. Prevent spoofing of user_id in tf_error_logs
DROP POLICY IF EXISTS "Anyone can insert error logs" ON public.tf_error_logs;

CREATE POLICY "Anyone can insert error logs" ON public.tf_error_logs
    FOR INSERT WITH CHECK (user_id IS NULL OR user_id = auth.uid());
