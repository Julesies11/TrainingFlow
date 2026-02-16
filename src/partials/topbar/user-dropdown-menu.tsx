import { ReactNode } from 'react';
import { useAuth } from '@/auth/context/auth-context';
import {
  Moon,
  UserCircle,
  Dumbbell,
  ShieldCheck,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Link } from 'react-router';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { useIsDeveloper } from '@/hooks/use-is-developer';

export function UserDropdownMenu({ trigger }: { trigger: ReactNode }) {
  const { logout, user } = useAuth();
  const { theme, setTheme } = useTheme();
  const isDeveloper = useIsDeveloper();

  const displayName =
    user?.fullname ||
    (user?.first_name && user?.last_name
      ? `${user.first_name} ${user.last_name}`
      : user?.username || 'User');

  const displayEmail = user?.email || '';
  const displayAvatar = toAbsoluteUrl('/media/avatars/300-2.png');

  const handleThemeToggle = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" side="bottom" align="end">
        {/* Header */}
        <div className="flex items-center gap-2 p-3">
          <img
            className="size-9 rounded-full border-2 border-green-500"
            src={displayAvatar}
            alt="User avatar"
          />
          <div className="flex flex-col">
            <span className="text-sm text-mono font-semibold">
              {displayName}
            </span>
            <span className="text-xs text-muted-foreground">
              {displayEmail}
            </span>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Menu Items */}
        <DropdownMenuItem asChild>
          <Link
            to="/account/profile"
            className="flex items-center gap-2"
          >
            <UserCircle />
            Profile
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link
            to="/account/sport-types"
            className="flex items-center gap-2"
          >
            <Dumbbell />
            Sport Types
          </Link>
        </DropdownMenuItem>

        {isDeveloper && (
          <DropdownMenuItem asChild>
            <Link
              to="/admin/sport-types"
              className="flex items-center gap-2"
            >
              <ShieldCheck />
              Sport Types Admin
            </Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {/* Dark Mode Toggle */}
        <DropdownMenuItem
          className="flex items-center gap-2"
          onSelect={(event) => event.preventDefault()}
        >
          <Moon />
          <div className="flex items-center gap-2 justify-between grow">
            Dark Mode
            <Switch
              size="sm"
              checked={theme === 'dark'}
              onCheckedChange={handleThemeToggle}
            />
          </div>
        </DropdownMenuItem>

        {/* Logout */}
        <div className="p-2 mt-1">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={logout}
          >
            Logout
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
