# Database Schema

PeakForm utilizes the default `public` PostgreSQL schema to manage its entities, with Supabase handling authentication. All table names are prefixed with `pf_`.

## User Profiles
User profiles are stored in the `public.pf_profiles` table, which is linked to Supabase's `auth.users` via a foreign key on the `id` column.

### Core Tables
- `pf_profiles`: Stores user preferences (theme, avatar_url, effort_settings, role).
- `pf_sport_types`: Defines available sports and their default effort level configurations.
- `pf_user_sport_settings`: User-specific overrides for sport effort levels.
- `pf_workouts`: Individual training sessions planned or completed by the user.
- `pf_events`: Target races or goals, with optional `pf_event_segments` mapping to specific sports/efforts. Linked to `pf_event_types` and `pf_event_priorities`.
- `pf_event_types`: Lookup table for event categories (Race, Goal, Test). Supports system-wide and user-specific custom types.
- `pf_event_priorities`: Lookup table for event priorities (A, B, C). Supports system-wide and user-specific custom entries.
- `pf_library_workouts`: Reusable workout templates.
- `pf_daily_metrics`: Daily tracking of training stress (TSS, CTL, ATL, TSB).

## Authentication
Authentication is managed via Supabase Auth (`auth.users`).

## Storage Buckets
- `pf_avatars`: Public bucket for user profile pictures. Images are compressed to 256px JPEG before upload.

## Data Rules
- **Row Level Security (RLS)**: RLS is enabled on all tables.
  - `pf_profiles`: Restricted to `id = auth.uid()`.
  - `pf_workouts`, `pf_events`, etc.: Restricted to `user_id = auth.uid()`.
  - `pf_event_segments`: Restricted to users who own the parent event.
  - `pf_sport_types`: Publicly readable by all authenticated users; writable only by creators.
  - `pf_event_types`, `pf_event_priorities`: Standard users can view "System" entries (`is_system = true`) or their own custom entries. Admins (as defined by `role = 'admin'` in `pf_profiles`) can manage all entries.
- **Foreign Keys**: All user-specific tables must include a foreign key back to `auth.users` (usually `user_id` or `id`) with `on delete CASCADE`.
