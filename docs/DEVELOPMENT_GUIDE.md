# Development Guide

This guide outlines the local development workflow, project-specific scripts, and styling conventions for TrainingFlow.

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
- `npm run type-check`: Runs TypeScript type checking without emitting files.
- `npm run lint`: Runs ESLint with auto-fix.
- `npm run format`: Formats all files with Prettier.
- `npm run test`: Runs unit tests with Vitest.
- `npm run test:coverage`: Generates a test coverage report.
- `npm run create-demo-user`: Creates a test user in Supabase.
- `npm run debug-auth`: Utility script for troubleshooting authentication issues.

## Database Migrations

Database schema changes are managed via SQL migration files in `supabase/migrations/`.

- **Baseline:** The current state of the database is consolidated in `2026042701_baseline_v3.sql`.
- **New Migrations:** When making schema changes, create a new SQL file with a timestamp prefix (e.g., `YYYYMMDDHH_description.sql`).
- **Archive:** Older migrations that have been consolidated are stored in the `supabase/migrations/archive/` directory for historical reference.

## Smoke Testing

A set of smoke tests is available in `src/test/smoke/` to ensure that core application pages render without crashing. These tests mock heavy dependencies like ApexCharts, as well as Supabase API calls.

To run smoke tests:
```bash
npm test
```

When adding new pages, consider adding a basic smoke test in `src/test/smoke/pages.test.tsx` to verify successful rendering.

## Styling & UI Components

TrainingFlow follows **Metronic 9** standards using **Tailwind CSS 4**.

- **Config:** `src/css/config.reui.css` contains the ReUI theme configuration.
- **Components:** Always prefer **ReUI components** from `@/components/ui/` for consistency.
- **Icons:** Use **KeenIcons** via the `KeenIcon` component.

## Best Practices

- **Atomic Changes:** Keep your commits focused on specific features or fixes.
- **Type Safety:** Ensure all new components and services are fully typed.
- **Responsive Design:** Utilize Tailwind 4's modern utility classes for responsive layouts.
- **Environment Variables:** Never commit sensitive information (keys, secrets) to the repository.
