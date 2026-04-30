# Database Schema

TrainingFlow utilizes the default `public` PostgreSQL schema to manage its entities, with Supabase handling authentication. All table names are prefixed with `tf_`.

## User Profiles
User profiles are stored in the `public.tf_profiles` table, which is linked to Supabase's `auth.users` via a foreign key on the `id` column.

### Core Tables
- `tf_profiles`: Stores user preferences (theme, avatar_url, effort_settings, calendar_stats_mode, role).
- `tf_sport_types`: Defines available sports and their default effort level configurations.
- `tf_user_sport_settings`: User-specific overrides for sport effort levels.
- `tf_workouts`: Individual training sessions.
- `tf_events`: Target races or goals, with optional `tf_event_segments` mapping to specific sports/efforts. Linked to `tf_event_types` and `tf_event_priorities`.
- `tf_event_types`: Lookup table for event categories (Race, Goal, Test). Supports system-wide and user-specific custom types.
- `tf_event_priorities`: Lookup table for event priorities (A, B, C). Supports system-wide and user-specific custom entries.
- `tf_library_workouts`: Reusable workout templates.
- `tf_notes`: Simple text notes displayed on the training calendar. Columns: `id`, `user_id`, `date`, `content`, `created_at`.
- `tf_daily_metrics`: Daily tracking of training stress (TSS, CTL, ATL, TSB).
- `tf_training_goals`: Periodized training targets. Columns: `id`, `user_id`, `sport_type_id`, `metric` (duration/distance), `target_value`, `period` (weekly/monthly), `start_date`, `end_date`, `event_id` (optional).

## Authentication
Authentication is managed via Supabase Auth (`auth.users`).

## Storage Buckets
- `tf_avatars`: Public bucket for user profile pictures. Images are compressed to 256px JPEG before upload.

## Data Rules
- **Row Level Security (RLS)**: RLS is enabled on all tables.
  - `tf_profiles`: Restricted to `id = auth.uid()`.
  - `tf_workouts`, `tf_events`, etc.: Restricted to `user_id = auth.uid()`.
  - `tf_event_segments`: Restricted to users who own the parent event.
  - `tf_sport_types`: Publicly readable by all authenticated users; writable only by creators.
  - `tf_event_types`, `tf_event_priorities`: Standard users can view "System" entries (`is_system = true`) or their own custom entries. Admins (as defined by `role = 'admin'` in `tf_profiles`) can manage all entries.
- **Foreign Keys**: All user-specific tables must include a foreign key back to `auth.users` (usually `user_id` or `id`) with `on delete CASCADE`.
