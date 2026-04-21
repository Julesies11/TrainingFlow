import { AuthRouting } from '@/auth/auth-routing';
import { RequireAuth } from '@/auth/require-auth';
import { ErrorRouting } from '@/errors/error-routing';
import { Demo1Layout } from '@/layouts/demo1/layout';
import { CalendarView, CalendarViewFC, CalendarViewKit, CalendarViewMonth } from '@/pages/training/calendar';
import { LibraryPage } from '@/pages/training/library';
import { EventsPage } from '@/pages/training/events';
import { DashboardPage } from '@/pages/dashboard';
import { SportTypesPage } from '@/pages/account/sport-types';
import { ProfilePage } from '@/pages/account/profile';
import { SportTypesAdminPage } from '@/pages/admin/sport-types';
import { Navigate, Route, Routes } from 'react-router';

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="container-fixed">
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-black lowercase tracking-tight">
            {title}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">Coming soon</p>
        </div>
      </div>
    </div>
  );
}

export function AppRoutingSetup() {
  return (
    <Routes>
      <Route element={<RequireAuth />}>
        <Route element={<Demo1Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/training/calendar" element={<CalendarView />} />
          <Route path="/training/calendar-new" element={<CalendarViewFC />} />
          <Route path="/training/calendar-kit" element={<CalendarViewKit />} />
          <Route path="/training/calendar-month" element={<CalendarViewMonth />} />
          <Route path="/training/library" element={<LibraryPage />} />
          <Route path="/training/events" element={<EventsPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/account/profile" element={<ProfilePage />} />
          <Route
            path="/account/settings"
            element={<PlaceholderPage title="settings" />}
          />
          <Route path="/account/sport-types" element={<SportTypesPage />} />
          <Route path="/admin/sport-types" element={<SportTypesAdminPage />} />
        </Route>
      </Route>
      <Route path="error/*" element={<ErrorRouting />} />
      <Route path="auth/*" element={<AuthRouting />} />
      <Route path="*" element={<Navigate to="/error/404" />} />
    </Routes>
  );
}
