# Development Guide

This guide outlines the local development workflow, project-specific scripts, and styling conventions for PeakForm.

## Local Setup

1. **Install Dependencies:**
   Use the `--force` flag to ensure React 19 compatibility.
   ```bash
   npm install --force
   ```

2. **Environment Configuration:**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

3. **Start Development Server:**
   ```bash
   npm run dev
   ```

## Key Scripts

- `npm run dev`: Starts the Vite development server.
- `npm run build`: Type-checks and builds the project for production.
- `npm run lint`: Runs ESLint with auto-fix.
- `npm run format`: Formats all files with Prettier.
- `npm run test`: Runs unit tests with Vitest.
- `npm run test:coverage`: Generates a test coverage report.
- `npm run create-demo-user`: Creates a test user in Supabase.
- `npm run debug-auth`: Utility script for troubleshooting authentication issues.

## Calendar Integration

The training calendar uses **FullCalendar**. If you encounter build errors related to `@fullcalendar`, ensure the following dependencies are installed:
- `@fullcalendar/react`
- `@fullcalendar/core`
- `@fullcalendar/daygrid`
- `@fullcalendar/timegrid`
- `@fullcalendar/interaction`

## Styling & UI Components

PeakForm follows **Metronic 9** standards using **Tailwind CSS 4**.

- **Config:** `src/css/config.reui.css` contains the ReUI theme configuration.
- **Components:** Always prefer **ReUI components** from `@/components/ui/` for consistency.
- **Icons:** Use **KeenIcons** via the `KeenIcon` component.

## Best Practices

- **Atomic Changes:** Keep your commits focused on specific features or fixes.
- **Type Safety:** Ensure all new components and services are fully typed.
- **Responsive Design:** Utilize Tailwind 4's modern utility classes for responsive layouts.
- **Environment Variables:** Never commit sensitive information (keys, secrets) to the repository.
