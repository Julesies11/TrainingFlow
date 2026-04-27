import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useIsDeveloper(): boolean {
  const [isDeveloper, setIsDeveloper] = useState(false);

  useEffect(() => {
    async function checkRole() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setIsDeveloper(false);
        return;
      }

      const { data: profile } = await supabase
        .from('tf_profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      const role = profile?.role;
      setIsDeveloper(role === 'admin' || role === 'developer');
    }

    checkRole();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        checkRole();
      } else {
        setIsDeveloper(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return isDeveloper;
}
