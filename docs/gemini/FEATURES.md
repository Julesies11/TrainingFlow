# Features & Modules

TrainingFlow is designed as a management platform with the following core modules:

## 1. Authentication & Identity
- Supabase-powered login/registration.
- Role-based access control (stored in `tf_profiles` table: `admin`, `developer`, `user`).
- Profile management (avatar, personal details, theme).

## 2. Training Management
- **Interactive Calendar**: Drag-and-drop workout planning with support for bidirectional reordering (moving items above or below each other) on the same day.
- **Calendar Notes**: Add simple text notes to any day on the calendar. Notes are draggable, editable, and visually distinct from workouts.
- **Session Duplication**: Quickly copy and paste workouts to different dates via the "Duplicate" feature.
- **Dynamic Lookups**: 
    - **Global Admin**: Developers and admins can manage system-wide Event Types and Priorities.
    - **Personalized Management**: Standard users have dedicated account pages to create, view, and manage their own custom Event Types and Event Priorities, allowing them to personalize themes, icons, and labels.
- **Sport Types & Effort Settings**: 
    - **Global Admin**: Developers can manage system-wide sport types, units (pace/distance), and default effort levels.
    - **Personalized Settings**: Users can customize effort level colors and labels for each sport to match their training philosophy.
- **Workout Library**: Save and reuse workout templates.
- **Weekly Stats & Metrics**: Persistent toggle to show/hide detailed weekly summaries and sport-specific totals.
- **Mobile-Optimized Experience**: Enhanced calendar views for mobile devices with compact stats and intuitive navigation.
- **Data Casing Preservation**: Ensures all user-entered workout and event titles preserve original capitalization for improved readability and personalization.
- **Athlete Dashboard**: 
    - **Optimized Volume Summary**: Real-time aggregation of training volume (distance/duration) with $O(N+M)$ performance and a decoupled pre-fetching window (-12 to +24 months) for instant, flash-free navigation.
    - **Annotation Toggles**: Independently show/hide **Events** and **Notes** on the progression chart.
    - **Contextual Tooltips**: Hover over data points to see full event titles and note content alongside volume totals.
    - **Sport Distribution**: Dynamic breakdown of training time across different sport types, respecting user-customized colors.
- **Training Goals**: 
    - **Periodized Targets**: Set specific weekly or monthly targets (e.g., "Bike 200km/week") for defined training blocks.
    - **Target Overlays**: Dashboard charts show a "Target" line to track actual volume against goals.
    - **Progress Tracking**: Weekly summary columns on the calendar display real-time progress bars towards active goals.

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
