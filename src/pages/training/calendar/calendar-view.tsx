import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { parseISO } from 'date-fns';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  FileUp,
  Plus,
  Trash2,
  Watch,
} from 'lucide-react';
import { Event, LibraryWorkout, Note, Workout } from '@/types/training';
import { useSupabaseUserId } from '@/hooks/use-supabase-user';
import {
  useCreateLibraryWorkout,
  useCreateNote,
  useCreateWorkout,
  useCreateWorkoutsBulk,
  useDeleteEvent,
  useDeleteLibraryWorkout,
  useDeleteNote,
  useDeleteWorkout,
  useEvents,
  useGoals,
  useLibrary,
  useNotes,
  useProfile,
  useSportTypes,
  useUpdateEvent,
  useUpdateLibraryWorkout,
  useUpdateNote,
  useUpdateProfile,
  useUpdateWorkout,
  useUserSportSettings,
  useWorkouts,
} from '@/hooks/use-training-data';
import {
  DAY_HEADERS,
  formatDateToLocalISO,
  formatMinsShort,
  getMonday,
  MONTH_NAMES,
} from '@/services/training/calendar.utils';
import {
  buildSportMap,
  buildUserSettingsMap,
  getEffortColor,
} from '@/services/training/effort-colors';
import {
  isMetersDistance,
  isPaceRelevant,
} from '@/services/training/pace-utils';
import { getSportIcon } from '@/services/training/sport-icons';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch, SwitchWrapper } from '@/components/ui/switch';
import { EventDialog } from '../_shared/components/event-dialog';
import { BulkDeleteDialog } from './components/bulk-delete-dialog';
import { CalendarDay } from './components/calendar-day';
import { GarminImportDialog } from './components/garmin-import-dialog';
import { ImportDialog } from './components/import-dialog';
import { LibraryDrawer } from './components/library-drawer';
import { NoteDialog } from './components/note-dialog';
import { WorkoutDialog } from './components/workout-dialog';

export function CalendarView() {
  const userId = useSupabaseUserId();
  const { data: workouts = [], isLoading: loadingWorkouts } = useWorkouts();
  const { data: notes = [] } = useNotes();
  const { data: events = [] } = useEvents();
  const { data: goals = [] } = useGoals();
  const { data: library = [] } = useLibrary();
  const { data: sportTypes = [], isLoading: loadingSports } = useSportTypes();
  const { data: userSportSettings = [], isLoading: loadingSettings } =
    useUserSportSettings();
  const { data: profile } = useProfile();

  const updateProfile = useUpdateProfile();
  const updateWorkout = useUpdateWorkout();
  const createWorkout = useCreateWorkout();
  const createWorkoutsBulk = useCreateWorkoutsBulk();
  const deleteWorkout = useDeleteWorkout();
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();
  const createLibrary = useCreateLibraryWorkout();
  const updateLibrary = useUpdateLibraryWorkout();
  const deleteLibrary = useDeleteLibraryWorkout();

  // Navigation state
  const [selectedDate, setSelectedDate] = useState<string>(
    formatDateToLocalISO(new Date()),
  );
  const [showStats, setShowStats] = useState<boolean>(true);

  // Sync showStats with profile
  useEffect(() => {
    if (profile?.calendar_stats_mode !== undefined) {
      setShowStats(profile.calendar_stats_mode);
    }
  }, [profile?.calendar_stats_mode]);

  const [displayMonth, setDisplayMonth] = useState<number>(
    new Date().getMonth(),
  );
  const [displayYear, setDisplayYear] = useState<number>(
    new Date().getFullYear(),
  );

  const todayRef = useRef<HTMLDivElement>(null);
  const hasInitialScrolled = useRef(false);

  // Toggle helper
  const handleToggleStats = (checked: boolean) => {
    setShowStats(checked);
    updateProfile.mutate({ calendar_stats_mode: checked });
  };

  // Modal state
  const [workoutToEdit, setWorkoutToEdit] = useState<Partial<Workout> | null>(
    null,
  );
  const [noteToEdit, setNoteToEdit] = useState<Partial<Note> | null>(null);
  const [eventWithSegmentsToEdit, setEventWithSegmentsToEdit] =
    useState<Event | null>(null);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showGarminImportDialog, setShowGarminImportDialog] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);

  // Drag and drop state
  const [isDraggingId, setIsDraggingId] = useState<string | null>(null);
  const [dragOverInfo, setDragOverInfo] = useState<{
    date: string;
    index: number;
  } | null>(null);

  const sportMap = useMemo(() => buildSportMap(sportTypes), [sportTypes]);
  const userSettingsMap = useMemo(
    () => buildUserSettingsMap(userSportSettings),
    [userSportSettings],
  );

  // Helper: Generate weeks sequentially from a start Monday
  const generateWeeksFrom = useCallback((startMonday: Date, count: number) => {
    const result: Date[][] = [];
    const cursor = new Date(startMonday);
    for (let w = 0; w < count; w++) {
      const week: Date[] = [];
      for (let d = 0; d < 7; d++) {
        week.push(new Date(cursor));
        cursor.setDate(cursor.getDate() + 1);
      }
      result.push(week);
    }
    return result;
  }, []);

  // Generate weeks for the currently displayed month only
  const weeks = useMemo(() => {
    const firstDay = new Date(displayYear, displayMonth, 1);
    const lastDay = new Date(displayYear, displayMonth + 1, 0);

    // Start from the Monday of the week containing the 1st
    const startMonday = getMonday(firstDay);

    // Calculate how many weeks we need to display the entire month
    const endMonday = getMonday(lastDay);
    const daysDiff = Math.ceil(
      (endMonday.getTime() - startMonday.getTime()) / (1000 * 60 * 60 * 24),
    );
    const weekCount = Math.ceil(daysDiff / 7) + 1;

    return generateWeeksFrom(startMonday, weekCount);
  }, [displayMonth, displayYear, generateWeeksFrom]);

  // Navigation helpers - simple state updates, no scroll
  const stepMonth = useCallback(
    (dir: 'up' | 'down') => {
      if (dir === 'up') {
        if (displayMonth === 0) {
          setDisplayYear((y) => y - 1);
          setDisplayMonth(11);
        } else {
          setDisplayMonth((m) => m - 1);
        }
      } else {
        if (displayMonth === 11) {
          setDisplayYear((y) => y + 1);
          setDisplayMonth(0);
        } else {
          setDisplayMonth((m) => m + 1);
        }
      }
    },
    [displayMonth],
  );

  const goToToday = useCallback(() => {
    const today = new Date();
    setDisplayMonth(today.getMonth());
    setDisplayYear(today.getFullYear());
    setSelectedDate(formatDateToLocalISO(today));

    // Scroll to today after state updates
    setTimeout(() => {
      todayRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 100);
  }, []);

  // Drag & drop handlers

  const handleDragStart = (e: React.DragEvent, item: Workout | Note) => {
    const isNote = 'content' in item;
    e.dataTransfer.setData(isNote ? 'noteId' : 'text/plain', item.id);
    e.dataTransfer.effectAllowed = 'move';
    setIsDraggingId(item.id);
  };

  const handleDragEnd = () => {
    setIsDraggingId(null);
    setDragOverInfo(null);
  };

  const handleDragOverCell = (
    e: React.DragEvent,
    dateStr: string,
    itemCount: number,
  ) => {
    e.preventDefault();
    if (itemCount === 0) {
      setDragOverInfo({ date: dateStr, index: 0 });
      return;
    }
    // Find the content container (the scrollable div with workout cards)
    const container = (e.currentTarget as HTMLElement).querySelector(
      '[data-drop-container]',
    ) as HTMLElement | null;
    if (!container) {
      setDragOverInfo({ date: dateStr, index: itemCount });
      return;
    }
    const children = Array.from(
      container.querySelectorAll('[data-drop-item]'),
    ) as HTMLElement[];
    const mouseY = e.clientY;
    let dropIndex = children.length; // default: after last
    for (let i = 0; i < children.length; i++) {
      const rect = children[i].getBoundingClientRect();
      // Use top third of each card as the "before" zone for easier targeting
      const threshold = rect.top + rect.height * 0.35;
      if (mouseY < threshold) {
        dropIndex = i;
        break;
      }
    }
    setDragOverInfo({ date: dateStr, index: dropIndex });
  };

  const handleDrop = (e: React.DragEvent, dateStr: string) => {
    e.preventDefault();

    const eventId = e.dataTransfer.getData('eventId');
    if (eventId) {
      const event = events.find((ev) => ev.id === eventId);
      if (event) {
        updateEvent.mutate({ ...event, date: dateStr });
      }
      handleDragEnd();
      return;
    }

    const noteId = e.dataTransfer.getData('noteId');
    if (noteId) {
      const note = notes.find((n) => n.id === noteId);
      if (note) {
        updateNote.mutate({ ...note, date: dateStr });
      }
      handleDragEnd();
      return;
    }

    const itemId = e.dataTransfer.getData('text/plain');

    const workout = workouts.find((w) => w.id === itemId);
    if (workout) {
      // Calculate new order based on drop index
      const dropIndex = dragOverInfo?.index ?? 0;

      // Get all items that would be in that day
      const dayEvents = events.filter((e) => e.date === dateStr);
      const dayNotes = notes.filter((n) => n.date === dateStr);
      // Get workouts in that day, excluding the one being moved if it's the same day
      const dayWorkouts = workouts
        .filter((w) => w.date === dateStr && w.id !== itemId)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

      // Calculate relative index within workouts
      // Events and Notes are always rendered first in CalendarDay.tsx
      const relIndex = Math.max(
        0,
        dropIndex - (dayEvents.length + dayNotes.length),
      );

      let newOrder: number;
      if (dayWorkouts.length === 0) {
        newOrder = Date.now();
      } else if (relIndex <= 0) {
        // Drop at the very beginning of workouts
        newOrder = (dayWorkouts[0].order ?? 0) - 1000;
      } else if (relIndex >= dayWorkouts.length) {
        // Drop at the very end of workouts
        newOrder = (dayWorkouts[dayWorkouts.length - 1].order ?? 0) + 1000;
      } else {
        // Drop between two workouts
        const prevOrder = dayWorkouts[relIndex - 1].order ?? 0;
        const nextOrder = dayWorkouts[relIndex].order ?? 0;
        newOrder = Math.round((prevOrder + nextOrder) / 2);
      }

      updateWorkout.mutate({ ...workout, date: dateStr, order: newOrder });
    }
    handleDragEnd();
  };

  // Week summary
  const calculateWeekSummary = (week: Date[]) => {
    const sportTotals: Record<string, { distance: number; duration: number }> =
      {};
    const weekTotals = { distance: 0, duration: 0 };
    week.forEach((date) => {
      const dateStr = formatDateToLocalISO(date);

      // Add workout totals
      workouts
        .filter((w) => w.date === dateStr)
        .forEach((w) => {
          const dur = w.plannedDurationMinutes || 0;
          let dist = w.plannedDistanceKilometers || 0;
          const stId = w.sportTypeId || 'unknown';
          const st = sportMap.get(stId);

          // Convert km to meters if the sport uses meters
          if (st && isMetersDistance(st.distanceUnit)) {
            dist = dist * 1000;
          }

          if (!sportTotals[stId])
            sportTotals[stId] = { distance: 0, duration: 0 };
          sportTotals[stId].duration += dur;
          sportTotals[stId].distance += dist;
          weekTotals.duration += dur;
          if (isPaceRelevant(!!st?.paceRelevant, st?.paceUnit))
            weekTotals.distance += dist;
        });

      // Add event segment totals
      events
        .filter((e) => e.date === dateStr)
        .forEach((e) => {
          if (e.segments && e.segments.length > 0) {
            e.segments.forEach((seg) => {
              const dur = seg.plannedDurationMinutes || 0;
              let dist = seg.plannedDistanceKilometers || 0;
              const stId = seg.sportTypeId || 'unknown';
              const st = sportMap.get(stId);

              // Convert km to meters if the sport uses meters
              if (st && isMetersDistance(st.distanceUnit, st.name)) {
                dist = dist * 1000;
              }

              if (!sportTotals[stId])
                sportTotals[stId] = { distance: 0, duration: 0 };
              sportTotals[stId].duration += dur;
              sportTotals[stId].distance += dist;
              weekTotals.duration += dur;
              if (isPaceRelevant(!!st?.paceRelevant, st?.paceUnit))
                weekTotals.distance += dist;
            });
          }
        });
    });

    // Find active goals for this week
    const weekStart = week[0];
    const weekEnd = week[week.length - 1];
    const activeGoals = goals.filter((g) => {
      const gStart = parseISO(g.startDate);
      const gEnd = parseISO(g.endDate);
      return gStart <= weekEnd && gEnd >= weekStart;
    });

    return { sportTotals, weekTotals, activeGoals };
  };

  // Save handler
  const handleSaveWorkout = (w: Partial<Workout>) => {
    if (workouts.some((old) => old.id === w.id)) {
      updateWorkout.mutate(w as Workout);
    } else {
      createWorkout.mutate(w);
    }
    setWorkoutToEdit(null);
  };

  const handleSaveBulk = (ws: Partial<Workout>[]) => {
    createWorkoutsBulk.mutate(ws);
    setWorkoutToEdit(null);
  };

  const handleDeleteWorkout = (
    id: string,
    mode: 'single' | 'future' = 'single',
  ) => {
    const w = workouts.find((w) => w.id === id);
    deleteWorkout.mutate({
      id,
      mode,
      recurrenceId: w?.recurrenceId,
      fromDate: w?.date,
    });
    setWorkoutToEdit(null);
  };

  const gridColsClass = showStats
    ? 'grid-cols-7 lg:grid-cols-[repeat(7,minmax(0,1fr))_120px]'
    : 'grid-cols-7';

  const isLoading =
    !userId || loadingWorkouts || loadingSports || loadingSettings;

  // Scroll to today on initial load
  useEffect(() => {
    if (!isLoading && todayRef.current && !hasInitialScrolled.current) {
      setTimeout(() => {
        todayRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
        hasInitialScrolled.current = true;
      }, 300); // Give it a bit more time for all data to render
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-muted-foreground text-sm">
          Loading training data...
        </div>
      </div>
    );
  }

  return (
    <div className="container-fixed pb-10 lg:pb-8">
      <div className="flex flex-col space-y-4">
        {/* Header */}
        <header className="z-[70] flex w-full shrink-0 flex-col items-center justify-between gap-3 overflow-hidden px-4 lg:flex-row lg:px-4">
          <div className="flex w-full shrink-0 items-center justify-between gap-2 lg:w-auto lg:gap-4">
            <div className="flex items-center gap-1 lg:gap-2">
              <Select
                value={displayMonth.toString()}
                onValueChange={(val) => setDisplayMonth(parseInt(val, 10))}
              >
                <SelectTrigger className="h-auto w-[110px] border-none bg-transparent p-0 shadow-none hover:bg-muted/50 focus:ring-0 lg:w-[170px] text-lg font-black lowercase tracking-tighter lg:text-3xl text-left justify-start gap-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTH_NAMES.map((m, i) => (
                    <SelectItem
                      key={i}
                      value={i.toString()}
                      className="font-bold lowercase"
                    >
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={displayYear.toString()}
                onValueChange={(val) => setDisplayYear(parseInt(val, 10))}
              >
                <SelectTrigger className="h-auto w-[70px] border-none bg-transparent p-0 shadow-none hover:bg-muted/50 focus:ring-0 lg:w-[100px] text-lg font-black lowercase tracking-tighter text-muted-foreground lg:text-3xl text-left justify-start gap-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 11 }).map((_, i) => {
                    const year = new Date().getFullYear() - 2 + i;
                    return (
                      <SelectItem
                        key={year}
                        value={year.toString()}
                        className="font-bold lowercase"
                      >
                        {year}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="bg-muted flex shrink-0 items-center gap-1 rounded-xl border p-1.5 shadow-sm lg:gap-1 lg:p-1">
              <Button
                variant="ghost"
                mode="icon"
                onClick={() => stepMonth('up')}
                className="h-14 w-14 lg:h-10 lg:w-10"
              >
                <ChevronLeft className="size-10 lg:size-7 opacity-100" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={goToToday}
                className="px-4 text-sm font-black uppercase lg:px-3 lg:text-xs"
              >
                today
              </Button>
              <Button
                variant="ghost"
                mode="icon"
                onClick={() => stepMonth('down')}
                className="h-14 w-14 lg:h-10 lg:w-10"
              >
                <ChevronRight className="size-10 lg:size-7 opacity-100" />
              </Button>
            </div>
          </div>

          <div className="flex w-full justify-between gap-1.5 lg:w-auto lg:justify-end lg:gap-3">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">
                stats
              </span>
              <SwitchWrapper>
                <Switch
                  checked={showStats}
                  onCheckedChange={handleToggleStats}
                />
              </SwitchWrapper>
            </div>

            <div className="flex items-center gap-1.5 lg:gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBulkDeleteDialog(true)}
                className="gap-2 text-destructive hover:bg-destructive/5 border-destructive/20"
              >
                <Trash2 className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-widest lg:hidden">
                  del
                </span>
                <span className="hidden text-[10px] font-black uppercase tracking-widest lg:inline">
                  bulk delete
                </span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowImportDialog(true)}
                className="gap-2"
              >
                <FileUp className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-widest lg:hidden">
                  imp
                </span>
                <span className="hidden text-[10px] font-black uppercase tracking-widest lg:inline">
                  import
                </span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowGarminImportDialog(true)}
                className="gap-2"
              >
                <Watch className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-widest lg:hidden">
                  gar
                </span>
                <span className="hidden text-[10px] font-black uppercase tracking-widest lg:inline">
                  garmin
                </span>
              </Button>
              <Button
                variant={showLibrary ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setShowLibrary(!showLibrary)}
                className="gap-2"
              >
                <BookOpen className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-widest lg:hidden">
                  lib
                </span>
                <span className="hidden text-[10px] font-black uppercase tracking-widest lg:inline">
                  library
                </span>
              </Button>
            </div>
          </div>
        </header>
        {/* Calendar Grid */}
        <div className="relative flex flex-col gap-4 lg:flex-row">
          <div className="bg-card relative flex flex-1 flex-col rounded-2xl border shadow-sm">
            {/* Day headers */}
            <div
              className={`bg-muted/50 z-[80] grid shrink-0 border-b ${gridColsClass}`}
            >
              {DAY_HEADERS.map((day) => (
                <div
                  key={day}
                  className="text-muted-foreground py-2 text-center text-[9px] font-black uppercase tracking-widest lg:text-[10px]"
                >
                  {day}
                </div>
              ))}
              {showStats && (
                <div className="text-primary hidden py-2 text-center text-[9px] font-black lowercase tracking-widest lg:block">
                  totals
                </div>
              )}
            </div>

            {/* Weeks */}
            <div className="flex flex-col gap-2 p-2 lg:block lg:p-0">
              {weeks.map((week, wIdx) => {
                const { sportTotals, weekTotals, activeGoals } =
                  calculateWeekSummary(week);
                const weekStart = formatDateToLocalISO(week[0]);
                return (
                  <div
                    key={wIdx}
                    className="flex flex-col rounded-xl border bg-card shadow-sm overflow-hidden lg:contents"
                    data-week-start={weekStart}
                  >
                    {/* Week grid */}
                    <div
                      className={`grid min-h-[120px] lg:border-b lg:min-h-[160px] ${gridColsClass}`}
                    >
                      {week.map((date, dIdx) => {
                        const dateStr = formatDateToLocalISO(date);
                        const dayWorkouts = workouts
                          .filter((w) => w.date === dateStr)
                          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
                        const dayNotes = notes.filter(
                          (n) => n.date === dateStr,
                        );
                        const dayEvents = events.filter(
                          (e) => e.date === dateStr,
                        );
                        const isToday =
                          formatDateToLocalISO(new Date()) === dateStr;
                        const isSelected = selectedDate === dateStr;
                        const isSameMonth = date.getMonth() === displayMonth;

                        return (
                          <CalendarDay
                            key={dIdx}
                            date={date}
                            workouts={dayWorkouts}
                            notes={dayNotes}
                            events={dayEvents}
                            isToday={isToday}
                            isSelected={isSelected}
                            isSameMonth={isSameMonth}
                            displayMonth={displayMonth}
                            onSelect={setSelectedDate}
                            onDragOver={handleDragOverCell}
                            onDragLeave={() => setDragOverInfo(null)}
                            onDrop={handleDrop}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                            onEventDragStart={(e, event) => {
                              e.dataTransfer.setData('eventId', event.id);
                              setIsDraggingId(event.id);
                            }}
                            sportMap={sportMap}
                            userSettingsMap={userSettingsMap}
                            showStats={showStats}
                            onEditWorkout={setWorkoutToEdit}
                            onEditNote={setNoteToEdit}
                            onEditEvent={setEventWithSegmentsToEdit}
                            isDraggingId={isDraggingId}
                            dragOverInfo={dragOverInfo}
                            todayRef={todayRef}
                          />
                        );
                      })}

                      {/* Week summary column - desktop only */}
                      {showStats && (
                        <div className="bg-primary/5 hidden flex-col gap-3 border-l p-3 lg:flex">
                          <div className="text-primary text-xl font-black leading-none">
                            {formatMinsShort(weekTotals.duration)}
                          </div>
                          <div className="border-primary/10 space-y-2.5 border-t pt-3">
                            {Object.entries(sportTotals).map(
                              ([stId, sTotal]) => {
                                if (sTotal.duration === 0) return null;
                                const st = sportMap.get(stId);
                                const sportColor = getEffortColor(
                                  st,
                                  2,
                                  userSettingsMap.get(stId),
                                );
                                return (
                                  <div key={stId} className="flex flex-col">
                                    <div className="flex items-center gap-1.5">
                                      <span
                                        className="h-2 w-2 shrink-0 rounded-full"
                                        style={{
                                          backgroundColor: sportColor,
                                        }}
                                      />
                                      <span className="text-muted-foreground text-[10px] font-bold">
                                        {st?.name || 'Unknown'}
                                      </span>
                                    </div>
                                    <div className="flex flex-col gap-0.5 pl-3.5">
                                      <span className="text-[10px] font-bold leading-none">
                                        {formatMinsShort(sTotal.duration)}
                                      </span>
                                      {sTotal.distance > 0 &&
                                        isPaceRelevant(
                                          !!st?.paceRelevant,
                                          st?.paceUnit,
                                        ) && (
                                          <span className="text-muted-foreground text-[9px] leading-none">
                                            {sTotal.distance.toFixed(1)}
                                            {st.distanceUnit || 'km'}
                                          </span>
                                        )}

                                      {/* Goal Progress */}
                                      {activeGoals
                                        .filter((g) => g.sportTypeId === stId)
                                        .map((goal) => {
                                          const actual =
                                            goal.metric === 'duration'
                                              ? sTotal.duration
                                              : sTotal.distance;
                                          const target = goal.targetValue;
                                          const percent = Math.min(
                                            100,
                                            Math.round(
                                              (actual / (target || 1)) * 100,
                                            ),
                                          );
                                          return (
                                            <div
                                              key={goal.id}
                                              className="mt-1.5 flex flex-col gap-1"
                                            >
                                              <div className="flex justify-between text-[8px] font-black uppercase opacity-60">
                                                <span>goal: {percent}%</span>
                                                <span>
                                                  {goal.metric === 'duration'
                                                    ? formatMinsShort(target)
                                                    : `${target}${st?.distanceUnit || 'km'}`}
                                                </span>
                                              </div>
                                              <div className="h-1 w-full rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                                                <div
                                                  className={`h-full ${actual >= target ? 'bg-green-500' : 'bg-red-500'}`}
                                                  style={{
                                                    width: `${percent}%`,
                                                  }}
                                                />
                                              </div>
                                            </div>
                                          );
                                        })}
                                    </div>
                                  </div>
                                );
                              },
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Week summary row - mobile only */}
                    {showStats && (
                      <div className="bg-primary/5 px-3 py-2 lg:hidden border-t">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex flex-1 flex-wrap items-center gap-x-4 gap-y-2">
                            {Object.entries(sportTotals).map(
                              ([stId, sTotal]) => {
                                if (sTotal.duration === 0) return null;
                                const st = sportMap.get(stId);
                                const sportName = st?.name || 'Unknown';
                                const IconComponent = getSportIcon(
                                  sportName,
                                  st?.paceUnit,
                                );
                                const sportColor = getEffortColor(
                                  st,
                                  2,
                                  userSettingsMap.get(stId),
                                );

                                return (
                                  <div
                                    key={stId}
                                    className="flex items-center gap-1.5"
                                  >
                                    <div className="flex items-center gap-1">
                                      {IconComponent && (
                                        <IconComponent
                                          className="h-3 w-3 shrink-0"
                                          style={{ color: sportColor }}
                                        />
                                      )}
                                      <span className="text-[10px] font-bold opacity-70">
                                        {sportName}
                                      </span>
                                    </div>
                                    <div className="flex flex-col">
                                      <div className="flex items-baseline gap-1">
                                        <span className="text-[10px] font-bold leading-none">
                                          {formatMinsShort(sTotal.duration)}
                                        </span>
                                        {sTotal.distance > 0 &&
                                          isPaceRelevant(
                                            !!st?.paceRelevant,
                                            st?.paceUnit,
                                          ) && (
                                            <span className="text-muted-foreground text-[9px] font-bold leading-none italic">
                                              {sTotal.distance.toFixed(1)}
                                              {st.distanceUnit || 'km'}
                                            </span>
                                          )}
                                      </div>

                                      {/* Mobile Goal Progress */}
                                      {activeGoals
                                        .filter((g) => g.sportTypeId === stId)
                                        .map((goal) => {
                                          const actual =
                                            goal.metric === 'duration'
                                              ? sTotal.duration
                                              : sTotal.distance;
                                          const target = goal.targetValue;
                                          const percent = Math.min(
                                            100,
                                            Math.round(
                                              (actual / (target || 1)) * 100,
                                            ),
                                          );
                                          return (
                                            <div
                                              key={goal.id}
                                              className="h-0.5 w-12 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden mt-0.5"
                                            >
                                              <div
                                                className={`h-full ${actual >= target ? 'bg-green-500' : 'bg-red-500'}`}
                                                style={{ width: `${percent}%` }}
                                              />
                                            </div>
                                          );
                                        })}
                                    </div>
                                  </div>
                                );
                              },
                            )}
                          </div>

                          <div className="shrink-0 border-l border-primary/10 pl-3 pt-0.5">
                            <span className="text-primary text-xs font-bold">
                              {formatMinsShort(weekTotals.duration)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Library Drawer */}
          <LibraryDrawer
            open={showLibrary}
            onClose={() => setShowLibrary(false)}
            library={library}
            selectedDate={selectedDate}
            sportTypes={sportTypes}
            userSettingsMap={userSettingsMap}
            onSelectTemplate={(template) => {
              setWorkoutToEdit({
                ...template,
                date: selectedDate,
                id: undefined,
              });
              setShowLibrary(false);
            }}
            onAddTemplate={(template: LibraryWorkout) => {
              setWorkoutToEdit({
                ...template,
                date: selectedDate,
                id: undefined,
              });
            }}
            onCreateLibrary={(w) => createLibrary.mutate(w)}
            onUpdateLibrary={(w) => updateLibrary.mutate(w)}
            onDeleteLibrary={(id) => deleteLibrary.mutate(id)}
          />
        </div>
        {/* Workout Dialog */}
        {workoutToEdit && (
          <WorkoutDialog
            workout={workoutToEdit}
            sportTypes={sportTypes}
            userSettingsMap={userSettingsMap}
            existingWorkouts={workouts}
            onSave={handleSaveWorkout}
            onSaveBulk={handleSaveBulk}
            onDelete={handleDeleteWorkout}
            onCancel={() => setWorkoutToEdit(null)}
            onSwitchToNote={() => {
              const d = workoutToEdit.date;
              setWorkoutToEdit(null);
              setNoteToEdit({ date: d });
            }}
          />
        )}
        {/* Note Dialog */}
        {noteToEdit && (
          <NoteDialog
            note={noteToEdit}
            onSave={(n) => {
              if (n.id) {
                updateNote.mutate(n as Note);
              } else {
                createNote.mutate(n as CreateNoteInput);
              }
              setNoteToEdit(null);
            }}
            onDelete={(id) => {
              deleteNote.mutate(id);
              setNoteToEdit(null);
            }}
            onCancel={() => setNoteToEdit(null)}
          />
        )}
        {/* Floating Add Button */}
        <Button
          variant="primary"
          shape="circle"
          onClick={() =>
            setWorkoutToEdit({ date: selectedDate, order: Date.now() })
          }
          className="fixed bottom-20 right-6 z-[90] h-14 w-14 shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-shadow lg:bottom-8 lg:right-8"
        >
          <Plus className="h-6 w-6" />
        </Button>
        {/* Event Dialog with Segments */}
        {eventWithSegmentsToEdit && (
          <EventDialog
            event={eventWithSegmentsToEdit}
            sportTypes={sportTypes}
            userSettings={userSportSettings}
            onSave={(e: Partial<Event>) => {
              if (e.id) {
                updateEvent.mutate(e as Event);
              } else {
                createEvent.mutate(e);
              }
              setEventWithSegmentsToEdit(null);
            }}
            onDelete={(id: string) => {
              deleteEvent.mutate(id);
              setEventWithSegmentsToEdit(null);
            }}
            onCancel={() => setEventWithSegmentsToEdit(null)}
          />
        )}{' '}
        {/* Import Dialog */}
        <ImportDialog
          open={showImportDialog}
          onOpenChange={setShowImportDialog}
        />
        <GarminImportDialog
          open={showGarminImportDialog}
          onOpenChange={setShowGarminImportDialog}
        />
        <BulkDeleteDialog
          open={showBulkDeleteDialog}
          onOpenChange={setShowBulkDeleteDialog}
        />
      </div>
    </div>
  );
}
