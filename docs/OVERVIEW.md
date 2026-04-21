# Project Overview

PeakForm is a modern web application built with **Metronic 9** and **React 19**. It leverages a high-performance stack centered around Vite, Tailwind CSS 4, and Supabase.

## Tech Stack

- **Framework:** React 19 (TypeScript)
- **Build Tool:** Vite 7
- **Styling:** Tailwind CSS 4 + Metronic ReUI Components
- **Backend/Auth:** Supabase (Auth + PostgreSQL)
- **State Management:** TanStack Query (React Query)
- **Routing:** React Router 7
- **Icons:** KeenIcons + Lucide + Remix Icon

## Core Architecture

The application follows a provider-based architecture, with several global contexts wrapping the main application:

- **AuthProvider:** Manages Supabase authentication state.
- **SettingsProvider:** Global project settings and configuration.
- **ThemeProvider:** Handles dark/light/system mode switching.
- **I18nProvider:** Multi-language support.
- **QueryProvider:** TanStack Query for server-state management.

## Directory Structure

- `src/auth/`: Authentication logic, adapters, and layouts.
- `src/components/`: Reusable UI components (ReUI) and custom components.
- `src/config/`: Application configuration (menus, settings, etc.).
- `src/hooks/`: Custom React hooks for global logic.
- `src/layouts/`: Metronic-specific layouts (demo1 to demo10).
- `src/lib/`: Core utilities and Supabase client initialization.
- `src/pages/`: Page-level components organized by feature.
- `src/providers/`: Context providers for global state.
- `src/routing/`: Routing configuration and navigation logic.
- `src/services/`: API and business logic services.
- `src/types/`: TypeScript interfaces and types.
