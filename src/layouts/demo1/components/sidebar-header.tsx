import { Link } from 'react-router-dom';
import { toAbsoluteUrl } from '@/lib/helpers';

export function SidebarHeader() {
  return (
    <div className="sidebar-header hidden lg:flex items-center relative justify-between px-3 lg:px-6 shrink-0">
      <Link to="/">
        <div className="dark:hidden">
          <img
            src={toAbsoluteUrl('/media/app/default-logo.svg')}
            className="default-logo h-[22px] max-w-none"
            alt="Default Logo"
          />
          <img
            src={toAbsoluteUrl('/media/app/mini-logo.svg')}
            className="small-logo h-[22px] max-w-none"
            alt="Mini Logo"
          />
        </div>
        <div className="hidden dark:block">
          <img
            src={toAbsoluteUrl('/media/app/default-logo-dark.svg')}
            className="default-logo h-[22px] max-w-none"
            alt="Default Dark Logo"
          />
          <img
            src={toAbsoluteUrl('/media/app/mini-logo.svg')}
            className="small-logo h-[22px] max-w-none"
            alt="Mini Logo"
          />
        </div>
      </Link>
    </div>
  );
}
