import { useAuth } from '@/auth/context/auth-context';
import { UserDropdownMenu } from '@/partials/topbar/user-dropdown-menu';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useProfile } from '@/hooks/use-training-data';
import { useSettings } from '@/providers/settings-provider';
import { SidebarHeader } from './sidebar-header';
import { SidebarMenu } from './sidebar-menu';

export function Sidebar() {
  const { settings } = useSettings();
  const { pathname } = useLocation();
  const { data: profile } = useProfile();
  const { user } = useAuth();

  return (
    <div
      className={cn(
        'sidebar bg-background lg:border-e lg:border-border lg:fixed lg:top-0 lg:bottom-0 lg:z-20 lg:flex flex-col items-stretch shrink-0',
        (settings.layouts.demo1.sidebarTheme === 'dark' ||
          pathname.includes('dark-sidebar')) &&
          'dark',
      )}
    >
      <SidebarHeader />
      <div className="overflow-hidden flex-1">
        <div className="w-(--sidebar-default-width)">
          <SidebarMenu />
        </div>
      </div>

      {/* User Avatar at bottom of sidebar */}
      <div className="shrink-0 border-t border-border p-3 lg:p-4">
        <UserDropdownMenu
          trigger={
            profile?.avatar_url ? (
              <img
                className="size-9 rounded-full border-2 border-green-500 shrink-0 cursor-pointer object-cover mx-auto"
                src={profile.avatar_url}
                alt="User Avatar"
              />
            ) : (
              <div className="size-9 rounded-full border-2 border-green-500 bg-primary flex items-center justify-center text-white text-sm font-black shrink-0 cursor-pointer mx-auto">
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
            )
          }
        />
      </div>
    </div>
  );
}
