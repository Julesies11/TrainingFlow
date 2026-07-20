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
- **Lazy Loading**: Heavy components like the `VolumeChart` (which uses ApexCharts) are lazy-loaded via `React.lazy` and Suspense to minimize the initial bundle size and improve page load speed.
- **Efficient Aggregation**: Training charts use $O(N+M)$ Map-based aggregation instead of nested filtering. Data is pre-grouped by date once, allowing for constant-time lookups during bucket generation.
- **Component Memoization**: Pure presentational components and high-level dashboard widgets are wrapped in `React.memo` to eliminate unnecessary re-renders during state updates.

## Data Fetching & Mutations
- All external data flows through **Supabase**.
- Services are located in `src/services/` and should be used within TanStack Query hooks.
- **Zod** is used for runtime validation and type inference.
- **TanStack Query**: Used for all server-side data fetching and caching. Implements $O(N+M)$ Map-based aggregation for performance.

## Navigation & State Management
- **Single Source of Truth (URL)**: For pages requiring deep-linking (like the Calendar and Training Plan detail), the URL is the primary source of truth. Component state for month/year or plan IDs is derived directly from `useParams()` and `useLocation()`. This prevents "state-flicker" bugs where local state and URL parameters compete for control during navigation.
- **Controlled Navigation**: User actions (button clicks, dropdown selections) should update the URL via React Router's `navigate()` function, allowing the routing system to drive the component re-render.

## UI Patterns
- **Lookup Master Pattern**: Standard values (Event Types, Priorities) are database-backed. Standard users can personalize their experience by managing private custom entries via master dialogs, while administrators can manage global "System" defaults via a dedicated admin interface.
- **Shared Training Forms**: Common workout entry fields (Sport Selection, Effort Grids, and Metrics/Pace calculations) are extracted into shared components (`SportSelector`, `EffortIntensityGrid`, `WorkoutMetricsFields`) to ensure absolute parity between the Calendar and Workout Library.
- **Shared Calendar Architecture**: To ensure visual and logic consistency, the core training calendar is built as a shared `CalendarGrid` presentational component. It handles complex week-row mapping, drag-and-drop feedback, and real-time daily/weekly volume aggregation.
- **Shared Analytics Architecture**: Volume and performance visualization is centralized in a shared `VolumeChartWidget`. It encapsulates the chart rendering and all navigation/metric controls. In **Template Mode**, the chart dynamically scales its X-axis to the exact length of the training plan, utilizing relative "Week N" labels starting from a normalized base (Monday, Jan 1, 2024) to ensure cross-template comparability.
- **Flexible Plan Application**: Athletes can apply training plans either forward from a selected start date (Phase 1 start) or backward from a target event date (Phase N aligned with Race Day). The generator engine automatically aligns the plan's week/day matrix with the calendar timeline.
- **Advanced Training Plans**: The plan builder supports full drag-and-drop reordering, repeating session recurrence, and series extensions. Sub-dialogs are rendered at the component root level (outside the main `DialogContent`) to prevent Radix UI focus-trap loops and ensure stable runtime performance.
- **Dialog Stability**: All bulk actions and import wizards utilize stable state initialization to prevent infinite rendering cycles, particularly when interacting with global sport type data.
- **Lazy Profile Creation**: On first login, the `SupabaseAdapter` ensures a relational record exists in `tf_profiles` for the authenticated user, synchronizing essential metadata.

## UI Layering (Z-Index Hierarchy)
Consistent layering is critical to prevent modals, drawers, and dropdowns from fighting for visibility:
- `Sheet` (Drawers): `z-[110]`, overlay `bg-black/10`, `blur(1px)`
- `DialogOverlay`: `z-[145]`, `bg-black/20`, `blur(2px)`
- `Dialog` (Modals): `z-[150]`
- `Select`, `DropdownMenu`, `Popover`: `z-[160]` (must pop out of dialogs)
- `Tooltip`: `z-[200]`

## Container Layout
- `.container-fixed` uses `0.5rem` horizontal padding on mobile (<1024px) and `1.5rem` on desktop (≥1024px), with `max-width: 1320px`.

## Custom Transactional Email Architecture
To prevent branding collisions and bypass built-in SMTP constraints on the shared multi-app Supabase instance, all transactional emails (signups, password resets, magic links) are routed through app-specific **Supabase Edge Functions** and **Resend**:
1. Client calls `supabase.functions.invoke("register-user")` instead of `supabase.auth.signUp()`.
2. Edge Function uses `admin.createUser({ email_confirm: false })` then `admin.generateLink()` to get a hashed token.
3. Edge Function constructs a domain-aligned client link (e.g., `https://trainingflow.app/login?token_hash=...&type=signup`) and sends it via the Resend API with app-specific branding.
4. Client-side route (`/login` or `/auth/verify-email`) verifies the OTP using `supabase.auth.verifyOtp({ token_hash, type })`.
- **Critical: `useRef` Guard** — Because `verifyOtp` tokens are single-use, and React Strict Mode double-renders effects, all verification routes must use a `useRef` flag (`verificationAttempted`) to guarantee the token is consumed exactly once. Without this, the second render consumes an expired token and errors.

## Security & RBAC
- **Role-Based Access Control**: Managed via the `role` column in `tf_profiles`. 
    - `user`: Standard access to personal data.
    - `admin` / `developer`: Elevated permissions to manage system-wide lookups and settings.
- **Row Level Security**: Enforced at the database level to isolate user data and protect global system entries.

## Brand Identity & Colors
- **TrainingFlow Brand Style**:
  - **Text Logo**: `"Training"` is styled in black (`#111827`) and `"Flow"` is styled in the brand's signature green (`#22c55e`).
  - **Transactional Colors**: The primary action/success color is the brand green (`#22c55e`), which is utilized for buttons, highlights, success state components, and confirmation links.

## Error Handling & Reliability
- **Global Error Boundary**: A top-level `ErrorBoundary` in `src/App.tsx` catches rendering crashes across the application. 
- **Graceful Recovery**: When a crash occurs, the boundary renders the standard Metronic `Error500` component. To ensure reliable recovery, the `Error500` page uses native `<a>` tags for navigation, forcing a full page reload to clear any corrupted application state.
- **Error Logging**: All uncaught errors are automatically logged to the `tf_error_logs` table in Supabase via `errorLogsApi.capture()`, including stack traces and component context.
- **Developer Experience**: In development environments, the boundary displays the raw stack trace below the polished error UI for immediate diagnosis.

## Development Setup
- **Install**: `npm install --force` (force flag needed for React 19 compatibility).
- **Dev Server**: `npm run dev`
- **Type Check**: `npm run type-check`
- **Lint**: `npm run lint`
- **Test**: `npm run test` (Vitest)
- **Format**: `npm run format` (Prettier)
- **Environment**: Requires `.env` with `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SUPABASE_SERVICE_ROLE_KEY`.

## Database Migrations
- **Baseline**: `supabase/migrations/2026042701_baseline_v3.sql` — consolidated current schema.
- **New Migrations**: Create timestamped SQL files in `supabase/migrations/` (format: `YYYYMMDDHH_description.sql`).
- **Archive**: Older consolidated migrations live in `supabase/migrations/archive/`.

## Styling & Components
- **Config**: `src/css/config.reui.css` contains the ReUI theme configuration.
- **Components**: Always prefer **ReUI components** from `@/components/ui/` over custom Tailwind implementations.
- **Icons**: Use **KeenIcons** via the `KeenIcon` component, supplemented by Lucide and Remix Icon.

## Smoke Testing
- Smoke tests in `src/test/smoke/` verify core pages render without crashing. They mock heavy dependencies (ApexCharts, Supabase).
- When adding new pages, add a basic smoke test in `src/test/smoke/pages.test.tsx`.

## Important Constraints
- **React 19**: Ensure compatibility with React 19 features (e.g., `use` hook, improved `ref` handling).
- **Tailwind 4**: Use modern Tailwind 4 utility classes and configuration.
