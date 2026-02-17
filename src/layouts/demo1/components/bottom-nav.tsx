import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, BookOpen, Trophy } from 'lucide-react';

export function BottomNav() {
  const { pathname } = useLocation();

  const navItems = [
    { name: 'Home', path: '/dashboard', icon: Home },
    { name: 'Plan', path: '/training/calendar', icon: Calendar },
    { name: 'Library', path: '/training/library', icon: BookOpen },
    { name: 'Events', path: '/training/events', icon: Trophy },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-xl border-t border-border px-4 py-3 flex justify-between items-center z-50 safe-area-inset-bottom">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
        
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center gap-1 transition-all ${
              isActive 
                ? 'text-primary scale-110' 
                : 'text-muted-foreground'
            }`}
          >
            <Icon className="w-5 h-5" strokeWidth={2.5} />
            <span className="text-[9px] font-black uppercase tracking-tighter">
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
