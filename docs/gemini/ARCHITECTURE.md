# Architecture Overview

This project is a React 19 application built on the **Metronic 9** template, optimized for performance and type safety.

## Core Patterns
- **Provider-Based State**: Global state (Auth, Theme, I18n, Settings) is managed via React Context providers in `src/App.tsx`.
- **Server State**: Managed exclusively by **TanStack Query (React Query)** in `src/providers/query-provider.tsx`.
- **Component Library**: Uses **ReUI** (Metronic's React component library) found in `src/components/ui/`.
- **Layout System**: Supports multiple Metronic layouts (Demo 1-10) located in `src/layouts/`.

## Data Fetching & Mutations
- All external data flows through **Supabase**.
- Services are located in `src/services/` and should be used within TanStack Query hooks.
- **Zod** is used for runtime validation and type inference.

## Important Constraints
- **React 19**: Ensure compatibility with React 19 features (e.g., `use` hook, improved `ref` handling).
- **Tailwind 4**: Use modern Tailwind 4 utility classes and configuration.
