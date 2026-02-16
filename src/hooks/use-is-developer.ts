import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const DEVELOPER_EMAILS = ['julian_@hotmail.com'];

export function useIsDeveloper(): boolean {
  const [isDeveloper, setIsDeveloper] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const email = data.user?.email?.toLowerCase();
      setIsDeveloper(email ? DEVELOPER_EMAILS.includes(email) : false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const email = session?.user?.email?.toLowerCase();
      setIsDeveloper(email ? DEVELOPER_EMAILS.includes(email) : false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return isDeveloper;
}
