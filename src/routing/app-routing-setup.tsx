import { AuthRouting } from '@/auth/auth-routing';
import { RequireAuth } from '@/auth/require-auth';
import { ErrorRouting } from '@/errors/error-routing';
import { Demo1Layout } from '@/layouts/demo1/layout';
import { CalendarView } from '@/pages/training/calendar';
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
          <Route path="/" element={<Navigate to="/training/calendar" replace />} />
          <Route path="/training/calendar" element={<CalendarView />} />
          <Route
            path="/training/library"
            element={<PlaceholderPage title="workout library" />}
          />
          <Route
            path="/training/goals"
            element={<PlaceholderPage title="goals & events" />}
          />
          <Route
            path="/dashboard"
            element={<PlaceholderPage title="dashboard" />}
          />
          <Route
            path="/account/profile"
            element={<PlaceholderPage title="profile" />}
          />
          <Route
            path="/account/settings"
            element={<PlaceholderPage title="settings" />}
          />
        </Route>
      </Route>
      <Route path="error/*" element={<ErrorRouting />} />
      <Route path="auth/*" element={<AuthRouting />} />
      <Route path="*" element={<Navigate to="/error/404" />} />
    </Routes>
  );
}
