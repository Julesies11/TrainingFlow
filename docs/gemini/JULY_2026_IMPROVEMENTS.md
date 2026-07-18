# July 2026 Features & Fixes Implementation Report

## Overview
This report documents the series of enhancements, UI fixes, and coordinate sync bugs resolved in the TrainingFlow application related to Note Duplication, AI Plan Import, and Landing Page mobile layout.

## 1. Note Duplication Functionality
**Objective:** Allow athletes and plan builders to duplicate notes on the training plan templates and calendar pages.
- **Changes:**
  - `src/pages/training/calendar/components/note-dialog.tsx`: Implemented duplicate flow in `NoteDialog`. Added `isDuplicated` state, a dynamic header label, a warning banner instructing the user to choose a new target date/coordinate, and a "Duplicate" button in the footer when editing existing notes.
  - **Template Coordinates Selector:** When duplicating in template mode (`hideDate` is true), the dialog renders interactive `weekNumber` and `dayOfWeek` selector inputs allowing the user to select the target coordinate for the duplicated note.
  - **Caller Update:** Modified `src/pages/account/templates/components/template-builder-dialog.tsx` to pass down `totalWeeks` from the plan configuration to validate selector bounds.
- **Verification:** Unit tests added in `src/pages/training/calendar/components/__tests__/note-dialog.test.tsx` to verify:
  - Duplication flow starts, clears the note ID, retains content, and triggers `onSave` as a new note insertion.
  - Render of week and day fields in template mode when duplicating.

## 2. AI Plan Import Week Bounds & Auto-Scaling
**Objective:** Prevent imported plans from being cropped when the template builder's current `totalWeeks` is less than the imported workouts' weeks.
- **Changes:**
  - `src/pages/account/templates/components/template-builder-dialog.tsx`: Enhanced `handleImportToTemplate` to dynamically adjust the template's `totalWeeks` to match the maximum week number found in the imported workout sessions (capped at 52).
- **Verification:** Added integration unit test in `src/pages/account/templates/components/__tests__/template-builder-dialog.test.tsx` to assert that the `totalWeeks` state updates automatically on OIDC-simulated bulk import.

## 3. Workout Dialog Coordinate Sync on Duplication
**Objective:** Fix the bug where duplicating a workout session in template mode would save it to the same day, ignoring week number/day input adjustments.
- **Root Cause:** While the user changed the coordinates in the inputs, the `workout.date` field (which the parent uses to derive coordinates) was not updated, resulting in coordinates collapsing back to the original date.
- **Changes:**
  - `src/pages/training/calendar/components/workout-dialog.tsx`: Implemented `getDateFromCoordinates` and updated the `onChange` and `onValueChange` handlers of the `weekNumber` and `dayOfWeek` inputs in template mode to compute and set the derived projected `date` on coordinate changes.
- **Verification:** Added assertion in `src/pages/training/calendar/components/__tests__/workout-dialog.test.tsx` verifying that changing coordinates correctly updates the derived date object (e.g. `'2024-01-19'`) on form submission.

## 4. Public Landing Page Mobile Responsiveness
**Objective:** Resolve the horizontal overflow scroll issue on mobile devices.
- **Changes:**
  - `src/pages/public/landing-page.tsx`:
    - Added `overflow-x-hidden`, `w-full`, and `relative` to the top-level main page container to clip off absolutely positioned ambient background decoration blobs.
    - Updated the simulated dashboard preview card frame from `aspect-[16/10]` to `h-[380px] md:h-auto md:aspect-[16/10]` to prevent vertical element squishing on narrow screens.

## Verification & Build Results
- ✅ ESLint passed with 0 errors.
- ✅ Targeted unit tests for NoteDialog, WorkoutDialog, and TemplateBuilderDialog passed successfully.
- ✅ Full production build completed successfully via `npm run build`.
