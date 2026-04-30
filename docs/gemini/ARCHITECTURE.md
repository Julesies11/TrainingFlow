# Architecture Overview

This project is a React 19 application built on the **Metronic 9** template, optimized for performance and type safety.

## Core Patterns
- **Provider-Based State**: Global state (Auth, Theme, I18n, Settings) is managed via React Context providers in `src/App.tsx`.
- **Server State**: Managed exclusively by **TanStack Query (React Query)** in `src/providers/query-provider.tsx`.
- **Component Library**: Uses **ReUI** (Metronic's React component library) found in `src/components/ui/`.
- **Layout System**: Supports multiple Metronic layouts (Demo 1-10) located in `src/layouts/`.

## Specialized Logic
- **Calendar Reordering**: Drag-and-drop reordering for workouts uses a position-based `order` calculation. When an item is dropped, its new order is determined by its position relative to existing items (beginning, end, or between two items), ensuring consistent sorting without requiring a full re-index of all items.
- **Image Processing**: Client-side compression and resizing are handled by `browser-image-compression` in `src/lib/utils/image.ts`. All uploads are orchestrated via `src/lib/api/storage.ts` to ensure consistent optimization.
- **Data-Driven Sport Logic**: Training math (pace, speed, distance conversion) is based on the `pace_unit` and `distance_unit` defined in the `tf_sport_types` table. Use `src/services/training/pace-utils.ts` for all calculations.

## Performance & Scalability
- **Range-Based Fetching**: To prevent data overfetching, workouts, events, and notes are queried using date range filters (`fromDate`, `toDate`) in the API and TanStack Query hooks. This ensures the client only processes data relevant to the current view (e.g., Dashboard window).
- **Lazy Loading**: Heavy components like the `VolumeChart` (which uses ApexCharts) are lazy-loaded via `React.lazy` and `Suspense` to minimize the initial bundle size and improve page load speed.
- **Efficient Aggregation**: Training charts use $O(N+M)$ Map-based aggregation instead of nested filtering. Data is pre-grouped by date once, allowing for constant-time lookups during bucket generation.
- **Component Memoization**: Pure presentational components and high-level dashboard widgets are wrapped in `React.memo` to eliminate unnecessary re-renders during state updates.

## Data Fetching & Mutations
- All external data flows through **Supabase**.
- Services are located in `src/services/` and should be used within TanStack Query hooks.
- **Zod** is used for runtime validation and type inference.

## UI Patterns
- **Lookup Master Pattern**: Standard values (Event Types, Priorities) are database-backed. Standard users can personalize their experience by managing private custom entries via master dialogs, while administrators can manage global "System" defaults via a dedicated admin interface.
- **Lazy Profile Creation**: On first login, the `SupabaseAdapter` ensures a relational record exists in `tf_profiles` for the authenticated user, synchronizing essential metadata.

## Security & RBAC
- **Role-Based Access Control**: Managed via the `role` column in `tf_profiles`. 
    - `user`: Standard access to personal data.
    - `admin` / `developer`: Elevated permissions to manage system-wide lookups and settings.
- **Row Level Security**: Enforced at the database level to isolate user data and protect global system entries.

## Important Constraints
- **React 19**: Ensure compatibility with React 19 features (e.g., `use` hook, improved `ref` handling).
- **Tailwind 4**: Use modern Tailwind 4 utility classes and configuration.
