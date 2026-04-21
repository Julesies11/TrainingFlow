import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSettings } from '@/providers/settings-provider';
import { BottomNav } from './components/bottom-nav';
import { Sidebar } from './components/sidebar';

export function Demo1Layout() {
  const isMobile = useIsMobile();
  const { settings, setOption } = useSettings();

  useEffect(() => {
    const bodyClass = document.body.classList;

    if (settings.layouts.demo1.sidebarCollapse) {
      bodyClass.add('sidebar-collapse');
    } else {
      bodyClass.remove('sidebar-collapse');
    }
  }, [settings]); // Runs only on settings update

  useEffect(() => {
    // Set current layout
    setOption('layout', 'demo1');
  }, [setOption]);

  useEffect(() => {
    const bodyClass = document.body.classList;

    // Add a class to the body element
    bodyClass.add('demo1');
    bodyClass.add('sidebar-fixed');

    const timer = setTimeout(() => {
      bodyClass.add('layout-initialized');
    }, 1000); // 1000 milliseconds

    // Remove the class when the component is unmounted
    return () => {
      bodyClass.remove('demo1');
      bodyClass.remove('sidebar-fixed');
      bodyClass.remove('sidebar-collapse');
      bodyClass.remove('layout-initialized');
      clearTimeout(timer);
    };
  }, []); // Runs only once on mount

  return (
    <>
      {!isMobile && <Sidebar />}

      <div className="wrapper flex grow flex-col">
        <main
          className={`grow ${isMobile ? 'pb-20 pt-5' : 'pt-5'}`}
          role="content"
        >
          <Outlet />
        </main>
      </div>

      {isMobile && <BottomNav />}
    </>
  );
}
