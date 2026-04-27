# Authentication & Database

TrainingFlow uses **Supabase Auth** for identity management and a relational PostgreSQL schema in the `public` schema for application data. All application tables use the `tf_` prefix.

## Database Schema Strategy

The application uses a set of dedicated tables to manage its core entities.

### Key Components

- **Profiles**: The `public.tf_profiles` table contains user-specific metadata and preferences, linked directly to `auth.users`.
- **Relational Tables**: Application-specific data like `tf_workouts`, `tf_events`, and `tf_sport_types` are stored in their own tables with appropriate foreign keys to maintain data integrity.

### Baseline Migration

The current database schema is consolidated into a single baseline migration in `supabase/migrations/2026042701_baseline_v3.sql`. This file includes all table definitions, RLS policies, indexes, storage buckets, and initial seed data.

## Authentication Flow

TrainingFlow uses **Supabase's native authentication management** to ensure reliable session persistence across page refreshes and different subdomains.

1. **Provider**: `src/auth/providers/supabase-provider.tsx` wraps the app and acts as the single source of truth. It listens to `supabase.auth.onAuthStateChange` to sync session state automatically.
2. **Context**: `src/auth/context/auth-context.tsx` provides access to the current authenticated user (`UserModel`) and session data (`AuthModel`).
3. **Lazy Profile Creation**: When a user logs in for the first time, the `SupabaseAdapter` ensures a corresponding record exists in `public.tf_profiles` without overwriting existing data.
4. **Protection**: `src/auth/require-auth.tsx` is a non-destructive guard that protects private routes while the session is being verified.
5. **Hooks**: `src/hooks/use-supabase-user.ts` and `useAuth` allow components to reactively access user data and session state.

## Data Rules

- **Foreign Keys**: All user-specific tables must have a foreign key to `auth.users` with `ON DELETE CASCADE`.
- **Row Level Security (RLS)**: RLS is enabled and fully configured on all `tf_` tables in the baseline migration to ensure users can only access their own data.
