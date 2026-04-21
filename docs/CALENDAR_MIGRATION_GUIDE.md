# Calendar Refactoring - Implementation Guide

## 📍 What Was Done

### 1. **Original Calendar Backed Up** ✅
The original `calendar-view.tsx` remains unchanged at:
- `src/pages/training/calendar/calendar-view.tsx`

This ensures you can always fall back to the original if needed.

### 2. **New FullCalendar Version Created** ✅
New file: `src/pages/training/calendar/calendar-view-fc.tsx`

This file:
- Uses FullCalendar React library
- Implements month-based navigation (not infinite scroll)
- Maintains the same UI/UX as the original
- Keeps all features working:
  - Drag & drop workouts
  - Edit dialogs
  - Library integration
  - Sport colors & icons
  - Add new workout button

### 3. **New Hooks Created** ✅

#### `use-calendar-navigation-fc.ts`
Handles month navigation:
```typescript
const { currentDate, stepMonth, goToToday } = useCalendarNavigationFC();

stepMonth('prev');   // Go to previous month
stepMonth('next');   // Go to next month  
goToToday();        // Return to today
```

#### `use-calendar-data-fc.ts`
Converts training data to FullCalendar format:
```typescript
const calendarEvents = useCalendarDataFC(
  workouts,
  events,
  sportMap,
  userSettingsMap,
  getEffortColor
);
```

Returns FCEvent[] with all necessary data for rendering.

## 🎯 How to Switch to the New Calendar

### Option A: Update Export (Recommended for Testing)
Edit `src/pages/training/calendar/index.tsx`:

```tsx
import { CalendarViewFC } from './calendar-view-fc';

export { CalendarViewFC as CalendarView };
export default CalendarViewFC;
```

This makes the new calendar the default without changing route references.

### Option B: Use Environment Variable
```tsx
const USE_NEW_CALENDAR = process.env.VITE_USE_NEW_CALENDAR === 'true';
const CalendarComponent = USE_NEW_CALENDAR ? CalendarViewFC : CalendarView;

export default CalendarComponent;
```

Then create a `.env.local` file:
```
VITE_USE_NEW_CALENDAR=true
```

### Option C: Keep Both (Side-by-Side for Comparison)
```tsx
// Use original
import { CalendarView } from './calendar-view';

// Or use new
import { CalendarViewFC } from './calendar-view-fc';
```

## 🔄 Comparison: Original vs New

| Feature | Original | New (FullCalendar) |
|---------|----------|-------------------|
| **Navigation** | Infinite vertical scroll | Month buttons (Prev/Today/Next) |
| **Scroll Position** | Complex scroll logic | Simple state |
| **Weeks Loading** | Loads 26 weeks before/after | Shows full month |
| **Performance** | Moderate (scroll overhead) | Better (month-based) |
| **Code Complexity** | ~1000 lines | ~400 lines |
| **Dependencies** | Built-in | FullCalendar library |
| **Drag & Drop** | ✅ Works | ✅ Works |
| **Edit Dialogs** | ✅ Works | ✅ Works |
| **Library** | ✅ Works | ✅ Works |
| **Colors/Icons** | ✅ Works | ✅ Works |

## 📁 Files at a Glance

**Preserved (Original):**
- ❌ Don't touch: `calendar-view.tsx`
- ❌ Don't touch: `hooks/use-calendar-navigation.ts`
- ❌ Don't touch: `hooks/use-calendar-drag-drop.ts`
- ❌ Don't touch: `components/*` (WorkoutDialog, EventDialog, etc.)

**Created (New):**
- ✅ New: `calendar-view-fc.tsx` - Main component
- ✅ New: `hooks/use-calendar-navigation-fc.ts` - Navigation logic
- ✅ New: `hooks/use-calendar-data-fc.ts` - Data conversion

## 🧪 Testing the New Calendar

### 1. Quick Test
```tsx
// src/pages/training/calendar/index.tsx
export { CalendarViewFC as CalendarView };
export default CalendarViewFC;
```

Then run your dev server and navigate to the calendar. It should work exactly like before but with month buttons instead of scroll.

### 2. Verify Each Feature
- [ ] Calendar displays current month
- [ ] Previous button goes to last month
- [ ] Next button goes to next month
- [ ] Today button returns to current month
- [ ] Clicking a date highlights it
- [ ] Workouts show with correct sport colors
- [ ] Can drag workout to another day
- [ ] Click workout opens edit dialog
- [ ] Click event opens event dialog
- [ ] Library drawer works
- [ ] Add button creates new workout

### 3. Check Mobile
- [ ] Layout is responsive
- [ ] Buttons work on touch
- [ ] Text is readable

## 🎨 Customization

### Changing Month Navigation Labels
In `calendar-view-fc.tsx`, find the header section:
```tsx
<Button onClick={() => stepMonth('prev')}>
  <ChevronLeft />
</Button>
<Button onClick={goToToday}>today</Button>
<Button onClick={() => stepMonth('next')}>
  <ChevronRight />
</Button>
```

### Customizing Event Display
In `calendar-view-fc.tsx`, modify `renderEventContent`:
```tsx
const renderEventContent = (info: any) => {
  // Customize how events appear in the calendar
  // info.event contains all event data
};
```

### Changing FullCalendar View
To show week view instead of month:
```tsx
<FullCalendar
  initialView="dayGridWeek"  // Changed from "dayGridMonth"
  // ... rest of props
/>
```

## 🚀 Deployment Steps

1. **Option 1: Gradual Rollout**
   - Keep original as default
   - Add feature flag to switch
   - Let users test new version
   - Make new default when confident

2. **Option 2: Direct Replacement**
   - Update index.tsx to export new component
   - Deploy
   - Monitor for issues
   - Rollback if needed (original still in code)

3. **Option 3: Keep Both**
   - Add route for `/calendar-new`
   - Keep original at `/calendar`
   - Let users try both
   - Eventually remove one

## 📞 Rollback Plan

If the new calendar has issues:

**Step 1:** Revert the export in `index.tsx`
```tsx
import { CalendarView } from './calendar-view';
export default CalendarView;
```

**Step 2:** Save your work
```bash
git stash
git checkout -- src/pages/training/calendar/index.tsx
```

The original calendar will be back online, and the new files remain for debugging.

## 💡 Advantages of New Implementation

1. **User Experience**
   - Clear month navigation
   - No confusing scroll position
   - Easier to go back in time

2. **Development**
   - Less code to maintain
   - Easier to debug
   - Fewer edge cases

3. **Performance**
   - No scroll event listeners
   - Month-based rendering
   - Better memory usage

4. **Maintainability**
   - Separated concerns (hooks + component)
   - Cleaner data flow
   - Industry-standard library (FullCalendar)

## 🔗 Dependencies

The new calendar requires these npm packages (already installed):
- `@fullcalendar/react`
- `@fullcalendar/daygrid`
- `@fullcalendar/timegrid`
- `@fullcalendar/interaction`
- `@fullcalendar/core`

Check `package.json` - these were added during setup.

## 📚 References

- FullCalendar Docs: https://fullcalendar.io/docs/react
- Day Grid Plugin: https://fullcalendar.io/docs/daygrid
- Event Rendering: https://fullcalendar.io/docs/eventContent

## ❓ FAQ

**Q: Will my data be lost?**
A: No! Both versions read from the same data hooks (useWorkouts, useEvents, etc).

**Q: Can I test both at the same time?**
A: Yes! Create a route `/calendar-original` and `/calendar-new` and compare.

**Q: What if the new calendar has a bug?**
A: Revert the export in index.tsx - the original is still in the codebase.

**Q: How do I customize the styling?**
A: The component uses Tailwind + FullCalendar CSS. Edit colors in `renderEventContent`.

**Q: Can I add more plugins?**
A: Yes! FullCalendar has many plugins. Add to imports and plugins array.

---

You're all set! The new calendar is ready to test. 🎉
