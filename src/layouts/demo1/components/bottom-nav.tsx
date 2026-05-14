import { useAuth } from '@/auth/context/auth-context';
import { UserDropdownMenu } from '@/partials/topbar/user-dropdown-menu';
import { BookOpen, Calendar, Home, Trophy } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useProfile } from '@/hooks/use-training-data';

export function BottomNav() {
  const { pathname } = useLocation();
  const { data: profile } = useProfile();
  const { user } = useAuth();

  const navItems = [
    { name: 'Home', path: '/dashboard', icon: Home },
    { name: 'Plan', path: '/calendar', icon: Calendar },
    { name: 'Library', path: '/workout-library', icon: BookOpen },
    { name: 'Events', path: '/events', icon: Trophy },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-xl border-t border-border px-4 py-3 flex justify-between items-center z-50 safe-area-inset-bottom">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.path || pathname.startsWith(item.path + '/');

        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center gap-1 transition-all ${
              isActive ? 'text-primary scale-110' : 'text-muted-foreground'
            }`}
          >
            <Icon className="w-5 h-5" strokeWidth={2.5} />
            <span className="text-[9px] font-black uppercase tracking-tighter">
              {item.name}
            </span>
          </Link>
        );
      })}

      {/* User Profile Avatar */}
      <div className="flex items-center">
        <UserDropdownMenu
          trigger={
            profile?.avatar_url ? (
              <img
                className="size-8 rounded-full border-2 border-green-500 shrink-0 cursor-pointer object-cover"
                src={profile.avatar_url}
                alt="User Avatar"
              />
            ) : (
              <div className="size-8 rounded-full border-2 border-green-500 bg-primary flex items-center justify-center text-white text-xs font-black shrink-0 cursor-pointer">
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
            )
          }
        />
      </div>
    </nav>
  );
}
