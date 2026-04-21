# Switch to New Calendar - Exact Steps

## 🎯 Goal
Change your calendar from the original (infinite scroll) to the new FullCalendar version (month buttons).

## ⏱️ Time Required
**2 minutes** - Just 3 simple changes

---

## Step 1: Edit the Export File (30 seconds)

**File to edit:** `src/pages/training/calendar/index.tsx`

**Current content:**
```tsx
import { CalendarView } from './calendar-view';

export { CalendarView };
export default CalendarView;
```

**Change to:**
```tsx
import { CalendarViewFC } from './calendar-view-fc';

export { CalendarViewFC as CalendarView };
export default CalendarViewFC;
```

**What this does:** Makes the new calendar the default export so all imports get the new version.

---

## Step 2: Restart Dev Server (30 seconds)

**Current state:** Dev server may still have old code cached

**Do this:**
1. Stop your dev server (Ctrl+C)
2. Wait 2 seconds
3. Run again: `npm run dev`

**Result:** Browser should reload with new calendar

---

## Step 3: Verify It Works (60 seconds)

Navigate to the calendar page and check:

### Visual Changes
- ✅ Should see month name at top (e.g., "february 2026")
- ✅ Should see three buttons: **[◀ Prev] [Today] [Next ▶]**
- ✅ Clicking prev/next changes the month
- ✅ Clicking today returns to current month

### Functional Check
- ✅ Workouts display with correct sport colors
- ✅ Can drag workout to another day
- ✅ Click workout opens edit dialog
- ✅ Click event opens event dialog
- ✅ Library drawer works
- ✅ Add button works

### If Everything Works
**You're done!** The calendar is now using FullCalendar. 🎉

---

## 🆘 If Something Breaks

### Option A: Quick Revert (30 seconds)
Change `index.tsx` back to original:
```tsx
import { CalendarView } from './calendar-view';

export { CalendarView };
export default CalendarView;
```

Restart dev server. Original calendar is back.

### Option B: Diagnostic Check
1. Open browser console (F12)
2. Look for red errors
3. Check the QUICK_START.md for common issues

### Option C: Compare Both
```tsx
// In a temporary test file
import { CalendarView } from './calendar-view';
import { CalendarViewFC } from './calendar-view-fc';

// Try both to see which works
```

---

## 📋 Pre-Switch Checklist

Before making the change, verify:

- ✅ Node.js is running
- ✅ Dev server is running
- ✅ npm install completed successfully
- ✅ No TypeScript errors in console
- ✅ Browser is open to your app

---

## 🔄 Switching Back

If you need to use the original calendar:

**In `src/pages/training/calendar/index.tsx`:**
```tsx
import { CalendarView } from './calendar-view';

export { CalendarView };
export default CalendarView;
```

Then restart dev server.

---

## 📊 What's Different

| Feature | Original | New |
|---------|----------|-----|
| **Navigation** | Scroll wheel | Buttons |
| **Button Labels** | None | "Prev Today Next" |
| **View** | 52 weeks visible | 1 month visible |
| **Layout** | Grid of weeks | Month calendar |
| **Scroll Bars** | Vertical | None |

---

## ✅ Success Indicators

After switching, you should see:

1. **Header Changes**
   ```
   Before: Just the month/year
   After:  Month/year + [◀] [Today] [▶]
   ```

2. **Navigation Changes**
   ```
   Before: Use scroll wheel
   After:  Click buttons to change month
   ```

3. **Layout Changes**
   ```
   Before: Shows ~8 weeks at a time
   After:  Shows exactly 1 month (full month grid)
   ```

4. **Data Unchanged**
   ```
   Same: All workouts, events, colors, icons
   Same: Drag & drop functionality
   Same: Edit dialogs
   ```

---

## 🔍 Verification Commands

### Check TypeScript Compilation
```bash
# In terminal
npm run build

# Should complete without errors
# You should see "Built successfully"
```

### Check ESLint
```bash
npm run lint

# Should show no errors for calendar files
```

### Check Package Installation
```bash
npm list | grep fullcalendar

# Should show all 5 packages installed:
# ├── @fullcalendar/core
# ├── @fullcalendar/daygrid
# ├── @fullcalendar/interaction
# ├── @fullcalendar/react
# └── @fullcalendar/timegrid
```

---

## 📞 Troubleshooting

### Issue: "Cannot find module 'calendar-view-fc'"
**Solution:** 
- Check file exists: `src/pages/training/calendar/calendar-view-fc.tsx`
- Verify spelling in index.tsx
- Restart dev server

### Issue: "Prev/Next buttons don't work"
**Solution:**
- Check browser console for errors
- Verify useCalendarNavigationFC hook exists
- Check module imports

### Issue: "Events not showing"
**Solution:**
- Check useCalendarDataFC hook
- Verify sportMap is populated
- Check browser console

### Issue: "Drag & drop not working"
**Solution:**
- This is normal - FullCalendar handles it differently
- Check if updateWorkout mutation fires
- Verify in network tab

---

## 💬 Before vs After Examples

### Before (Original Calendar)
```
📅 User's View:
- Sees 8 weeks of schedule
- Scrolls up to go back
- Scrolls down to go forward
- Hard to know what month you're viewing
- Scroll position can get confusing
```

### After (FullCalendar)
```
📅 User's View:
- Sees full month (28-31 days)
- Clicks "Prev" to go back
- Clicks "Next" to go forward
- Clearly labeled with month name
- Easier, more familiar calendar UI
```

---

## 🎓 Understanding the Change

### What Changed
- **Code:** New implementation using FullCalendar
- **Navigation:** Scroll → Buttons
- **Architecture:** ~1000 lines → ~400 lines

### What Stayed the Same
- **Data:** Same workouts, events, library
- **Features:** Drag, edit, colors, icons
- **UI:** Same layout, same components
- **Routing:** Same paths, same pages

### Why the Change
- **Cleaner code** - Easier to maintain
- **Better UX** - Clearer navigation
- **Industry standard** - FullCalendar is widely used
- **Less overhead** - No scroll listener complexity
- **Better performance** - Month-based vs scroll-based

---

## 🚀 That's It!

Follow these 3 steps and your calendar is updated:

1. ✅ Edit `index.tsx`
2. ✅ Restart dev server
3. ✅ Verify it works

**Total time:** 2-3 minutes

**Result:** Modern, maintainable calendar 🎉

---

**Questions?** Read QUICK_START.md or CALENDAR_MIGRATION_GUIDE.md
