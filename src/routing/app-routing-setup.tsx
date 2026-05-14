import { AuthRouting } from '@/auth/auth-routing';
import { RequireAuth } from '@/auth/require-auth';
import { ErrorRouting } from '@/errors/error-routing';
import { Demo1Layout } from '@/layouts/demo1/layout';
import { EventPrioritiesPage } from '@/pages/account/event-priorities';
import { EventTypesPage } from '@/pages/account/event-types';
import { GarminMappingsPage } from '@/pages/account/garmin-mappings';
import { ProfilePage } from '@/pages/account/profile';
import { SportTypesPage } from '@/pages/account/sport-types';
import { TemplatesPage } from '@/pages/account/templates';
import { EventPrioritiesAdminPage } from '@/pages/admin/event-priorities';
import { EventTypesAdminPage } from '@/pages/admin/event-types';
import { GarminMappingsAdminPage } from '@/pages/admin/garmin-mappings';
import { SportTypesAdminPage } from '@/pages/admin/sport-types';
import { DashboardPage } from '@/pages/dashboard';
import { CalendarView } from '@/pages/training/calendar';
import { EventsPage } from '@/pages/training/events';
import { GoalsPage } from '@/pages/training/goals';
import { LibraryPage } from '@/pages/training/library';
import { Navigate, Route, Routes } from 'react-router-dom';

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
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/calendar/:year/:month" element={<CalendarView />} />
          <Route path="/workout-library" element={<LibraryPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/goals" element={<GoalsPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/account/profile" element={<ProfilePage />} />
          <Route
            path="/account/garmin-mappings"
            element={<GarminMappingsPage />}
          />
          <Route
            path="/account/settings"
            element={<PlaceholderPage title="settings" />}
          />
          <Route
            path="/account/event-priorities"
            element={<EventPrioritiesPage />}
          />
          <Route path="/account/event-types" element={<EventTypesPage />} />
          <Route path="/account/sport-types" element={<SportTypesPage />} />
          <Route path="/training-plans" element={<TemplatesPage />} />
          <Route path="/training-plans/:id" element={<TemplatesPage />} />
          <Route path="/admin/sport-types" element={<SportTypesAdminPage />} />
          <Route path="/admin/event-types" element={<EventTypesAdminPage />} />
          <Route
            path="/admin/garmin-mappings"
            element={<GarminMappingsAdminPage />}
          />
          <Route
            path="/admin/event-priorities"
            element={<EventPrioritiesAdminPage />}
          />
        </Route>
      </Route>
      <Route path="error/*" element={<ErrorRouting />} />
      <Route path="auth/*" element={<AuthRouting />} />
      <Route path="*" element={<Navigate to="/error/404" />} />
    </Routes>
  );
}
