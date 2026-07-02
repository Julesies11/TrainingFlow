import { Outlet } from 'react-router-dom';
import { toAbsoluteUrl } from '@/lib/helpers';

export function ClassicLayout() {
  return (
    <>
      <style>
        {`
          .page-bg {
            background-image: url('${toAbsoluteUrl('/media/images/2600x1200/bg-10.png')}');
          }
          .dark .page-bg {
            background-image: url('${toAbsoluteUrl('/media/images/2600x1200/bg-10-dark.png')}');
          }
        `}
      </style>
      <div className="flex flex-col items-center justify-center grow bg-center bg-no-repeat page-bg min-h-screen py-12 px-4 animate-fade-in">
        <div className="w-full max-w-[440px] glass border border-border/40 p-6 rounded-2xl shadow-xl">
          <Outlet />
        </div>
      </div>
    </>
  );
}
