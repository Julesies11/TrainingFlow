# Features & Modules

PeakForm is designed as a management platform with the following core modules:

## 1. Authentication & Identity
- Supabase-powered login/registration.
- Role-based access control (stored in `pf_profiles` table: `admin`, `developer`, `user`).
- Profile management (avatar, personal details, theme).

## 2. Training Management
- **Interactive Calendar**: Drag-and-drop workout planning.
- **Session Duplication**: Quickly copy and paste workouts to different dates via the "Duplicate" feature.
- **Dynamic Lookups**: Manage custom Event Types and Priorities with administrative overrides for global defaults.
- **Workout Library**: Save and reuse workout templates.

## 3. Participant Management
- *Status:* Planned/In-Progress.
- Tracking participant data and individual requirements.

## 3. Staff & House Management
- *Status:* Planned/In-Progress.
- Managing staff assignments and facility (house) details.

## 4. Roster & Scheduling
- *Status:* Planned/In-Progress.
- Dynamic scheduling for staff and participants.

## Module Location
Feature-specific code should be organized under `src/pages/[module_name]/` and `src/services/[module_name]/`.
