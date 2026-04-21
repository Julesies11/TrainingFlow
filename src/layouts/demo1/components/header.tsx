import { useAuth } from '@/auth/context/auth-context';
import { UserDropdownMenu } from '@/partials/topbar/user-dropdown-menu';
import { Link } from 'react-router-dom';
import { toAbsoluteUrl } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { useScrollPosition } from '@/hooks/use-scroll-position';
import { useProfile } from '@/hooks/use-training-data';
import { Container } from '@/components/common/container';

export function Header() {
  const { data: profile } = useProfile();
  const { user } = useAuth();

  const scrollPosition = useScrollPosition();
  const headerSticky: boolean = scrollPosition > 0;

  return (
    <header
      className={cn(
        'header fixed top-0 z-10 start-0 hidden lg:flex items-stretch shrink-0 border-b border-transparent bg-background end-0 pe-[var(--removed-body-scroll-bar-size,0px)]',
        headerSticky && 'border-b border-border',
      )}
    >
      <Container className="flex h-11 justify-between items-center lg:gap-4">
        {/* Mobile: Logo only (navigation moved to bottom) */}
        <div className="flex items-center gap-2.5 lg:hidden">
          <Link to="/" className="shrink-0">
            <img
              src={toAbsoluteUrl('/media/app/mini-logo.svg')}
              className="h-[20px] w-full"
              alt="mini-logo"
            />
          </Link>
        </div>

        {/* Spacer on desktop (no mega menu) */}
        <div className="hidden lg:flex flex-1" />

        {/* User avatar */}
        <div className="flex items-center">
          <UserDropdownMenu
            trigger={
              profile?.avatar_url ? (
                <img
                  className="size-9 rounded-full border-2 border-green-500 shrink-0 cursor-pointer object-cover"
                  src={profile.avatar_url}
                  alt="User Avatar"
                />
              ) : (
                <div className="size-9 rounded-full border-2 border-green-500 bg-primary flex items-center justify-center text-white text-sm font-black shrink-0 cursor-pointer">
                  {user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
              )
            }
          />
        </div>
      </Container>
    </header>
  );
}
