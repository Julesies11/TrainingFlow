import { useEffect, useState } from 'react';
import { useAuth } from '@/auth/context/auth-context';
import { useLocation } from 'react-router-dom';
import { useLoadingBar } from 'react-top-loading-bar';
import { ScreenLoader } from '@/components/common/screen-loader';
import { AppRoutingSetup } from './app-routing-setup';

export function AppRouting() {
  const { start, complete } = useLoadingBar({
    color: 'var(--color-primary)',
    shadow: false,
    waitingTime: 400,
    transitionTime: 200,
    height: 2,
  });

  const { loading } = useAuth();
  const [previousLocation, setPreviousLocation] = useState('');
  const location = useLocation();
  const path = location.pathname.trim();

  // Handle route transitions with loading bar
  useEffect(() => {
    if (!loading) {
      start('static');
      // On internal navigation, we just complete the bar
      setPreviousLocation(path);
      complete();
      if (path === previousLocation) {
        setPreviousLocation('');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, loading]);

  useEffect(() => {
    // Skip automatic scroll to top for the training calendar as it handles its own scrolling
    if (!CSS.escape(window.location.hash) && path !== '/training/calendar') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [previousLocation, path]);

  // Show screen loader during the initial auth session check
  if (loading) {
    return <ScreenLoader />;
  }

  return <AppRoutingSetup />;
}
