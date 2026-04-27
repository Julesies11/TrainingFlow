# Authentication & Database

TrainingFlow uses **Supabase Auth** for identity management and a relational PostgreSQL schema in the `public` schema for application data. All application tables use the `tf_` prefix.

## Database Schema Strategy

The application uses a set of dedicated tables to manage its core entities.

### Key Components

- **Profiles**: The `public.tf_profiles` table contains user-specific metadata and preferences, linked directly to `auth.users`.
- **Relational Tables**: Application-specific data like `tf_workouts`, `tf_events`, and `tf_sport_types` are stored in their own tables with appropriate foreign keys to maintain data integrity.

### Baseline Migration

The current database schema is consolidated into a single baseline migration in `supabase/migrations/2026042304_baseline_v2.sql`. This file includes all table definitions, RLS policies, indexes, storage buckets, and initial seed data.

## Authentication Flow

1. **Provider**: `src/auth/providers/supabase-provider.tsx` wraps the app.
2. **Context**: `src/auth/context/auth-context.tsx` provides access to the current user and auth state.
3. **Hooks**: `src/hooks/use-supabase-user.ts` allows components to reactively access user data.
4. **Protection**: `src/auth/require-auth.tsx` is used in routing to protect private pages.

## Data Rules

- **Foreign Keys**: All user-specific tables must have a foreign key to `auth.users` with `ON DELETE CASCADE`.
- **Row Level Security (RLS)**: RLS is enabled and fully configured on all `tf_` tables in `baseline_schema.sql` to ensure users can only access their own data.
