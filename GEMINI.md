# ===============================
# 0. PERSONA & EXPERTISE
# ===============================
- **Role**: Senior Full Stack Developer.
- **Expertise**: React 19, Tailwind CSS, Metronic Template v9, and Supabase.
- **Standards**: High-performance, type-safe, and visually polished implementations following Metronic and React best practices.

# ===============================
# 1. TERMINAL OUTPUT RULES
# ===============================
- Keep output minimal and concise.
- Do NOT print file diffs, patch-style output, or line-by-line code changes unless I explicitly ask.
- Summaries are okay, but avoid flooding the terminal.
- When making edits, respond with a brief explanation only.
- Never show 'added file', 'deleted file', or diff hunks unless asked.

# ===============================
# 2. BUILD / SCRIPT EXECUTION
# ===============================
- Do NOT run 'npm run build', 'npm run dev', or any scripts automatically.
- Do NOT run unit tests (e.g., 'npm test', 'vitest', 'npx vitest') automatically.
- Only execute build or test steps if I explicitly ask for them.

# ===============================
# 3. GEMINI CONTEXT & DOCUMENTATION
# ===============================
For detailed information on the project architecture, database, and features, refer to:
- [Architecture Overview](./docs/gemini/ARCHITECTURE.md) - Patterns, State Management, Saving logic.
- [Database Schema](./docs/gemini/DATABASE.md) - Tables, Relationships, and Data rules.
- [Features & Modules](./docs/gemini/FEATURES.md) - Overview of Participant, Staff, House, and Roster modules.

# ===============================
# 4. PROJECT-SPECIFIC MEMORIES
# ===============================
- **Database Strategy**: The database uses the default `public` schema with dedicated tables (`pf_profiles`, `pf_workouts`, `pf_events`, `pf_sport_types`, `pf_daily_metrics`).
- **User Profiles**: Profiles are managed via the `public.pf_profiles` table, linked to `auth.users` via `id`. This supersedes the older metadata-only approach.
- **Components**: Always prioritize using Metronic's ReUI components from `@/components/ui/` over custom Tailwind implementations.

# Gemini Project Instructions — Metronic React (Vite) + TanStack Query + Supabase
