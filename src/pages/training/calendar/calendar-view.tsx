import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, BookOpen, Plus, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  useWorkouts,
  useUpdateWorkout,
  useCreateWorkout,
  useCreateWorkoutsBulk,
  useDeleteWorkout,
  useGoals,
  useUpdateGoal,
  useProfile,
  useLibrary,
  useCreateLibraryWorkout,
  useUpdateLibraryWorkout,
  useDeleteLibraryWorkout,
  useDeleteGoal,
} from '@/hooks/use-training-data';
import { Workout, SportType, EventGoal, LibraryWorkout } from '@/types/training';
import {
  formatDateToLocalISO,
  getMonday,
  formatMinsShort,
  getContrastColor,
  getWorkoutPace,
  MONTH_NAMES,
  DAY_HEADERS,
} from '@/services/training/calendar.utils';
import { WorkoutDialog } from './components/workout-dialog';
import { GoalDialog } from './components/goal-dialog';
import { LibraryDrawer } from './components/library-drawer';

export function CalendarView() {
  const { data: workouts = [], isLoading: loadingWorkouts } = useWorkouts();
  const { data: goals = [] } = useGoals();
  const { data: profile } = useProfile();
  const { data: library = [] } = useLibrary();

  const updateWorkout = useUpdateWorkout();
  const createWorkout = useCreateWorkout();
  const createWorkoutsBulk = useCreateWorkoutsBulk();
  const deleteWorkout = useDeleteWorkout();
  const updateGoal = useUpdateGoal();
  const deleteGoal = useDeleteGoal();
  const createLibrary = useCreateLibraryWorkout();
  const updateLibrary = useUpdateLibraryWorkout();
  const deleteLibrary = useDeleteLibraryWorkout();

  // Navigation state
  const [baseDate, setBaseDate] = useState<Date>(() => getMonday(new Date()));
  const [selectedDate, setSelectedDate] = useState<string>(
    formatDateToLocalISO(new Date()),
  );
  const [viewMode, setViewMode] = useState<'calendar' | 'summary'>('calendar');

  // Modal state
  const [workoutToEdit, setWorkoutToEdit] = useState<Partial<Workout> | null>(
    null,
  );
  const [eventToEdit, setEventToEdit] = useState<EventGoal | null>(null);
  const [showLibrary, setShowLibrary] = useState(false);

  // Animation state
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [slideOffset, setSlideOffset] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Refs
  const lastScrollTime = useRef<number>(0);
  const touchStartY = useRef<number | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollAccumulator = useRef<number>(0);

  const intensitySettings = profile?.intensity_settings;

  // Grid data
  const gridData = useMemo(() => {
    const weeks: Date[][] = [];
    const cursor = new Date(baseDate);
    for (let w = 0; w < 6; w++) {
      const week: Date[] = [];
      for (let d = 0; d < 7; d++) {
        week.push(new Date(cursor));
        cursor.setDate(cursor.getDate() + 1);
      }
      weeks.push(week);
    }
    const middleDate = new Date(baseDate);
    middleDate.setDate(middleDate.getDate() + 17);
    return {
      weeks,
      predominantMonth: middleDate.getMonth(),
      predominantYear: middleDate.getFullYear(),
    };
  }, [baseDate]);

  // Reset scroll on date change
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [baseDate]);

  // Navigation helpers
  const stepWeek = useCallback(
    (dir: 'up' | 'down') => {
      if (isTransitioning || isAnimating) return;
      setIsTransitioning(true);
      setIsAnimating(true);
      setSlideOffset(dir === 'up' ? 60 : -60);
      setTimeout(() => {
        setBaseDate((prev) => {
          const d = new Date(prev);
          d.setDate(d.getDate() + (dir === 'up' ? -7 : 7));
          return d;
        });
        setIsAnimating(false);
        setSlideOffset(0);
        requestAnimationFrame(() => setIsTransitioning(false));
      }, 200);
    },
    [isTransitioning, isAnimating],
  );

  const stepMonth = useCallback(
    (dir: 'up' | 'down') => {
      if (isTransitioning || isAnimating) return;
      setIsTransitioning(true);
      setIsAnimating(true);
      setSlideOffset(dir === 'up' ? 100 : -100);
      setTimeout(() => {
        setBaseDate(() => {
          const target = new Date(
            gridData.predominantYear,
            gridData.predominantMonth + (dir === 'up' ? -1 : 1),
            1,
          );
          return getMonday(target);
        });
        setIsAnimating(false);
        setSlideOffset(0);
        requestAnimationFrame(() => setIsTransitioning(false));
      }, 250);
    },
    [isTransitioning, isAnimating, gridData],
  );

  const goToToday = () => {
    setBaseDate(getMonday(new Date()));
    setSelectedDate(formatDateToLocalISO(new Date()));
  };

  // Scroll & touch listeners
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (workoutToEdit || eventToEdit || showLibrary || isTransitioning)
        return;
      const now = Date.now();
      if (now - lastScrollTime.current < 450) return;
      scrollAccumulator.current += e.deltaY;
      if (Math.abs(scrollAccumulator.current) > 30) {
        stepWeek(scrollAccumulator.current > 0 ? 'down' : 'up');
        lastScrollTime.current = now;
        scrollAccumulator.current = 0;
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (
        touchStartY.current === null ||
        workoutToEdit ||
        eventToEdit ||
        showLibrary ||
        isTransitioning
      )
        return;
      const diffY = touchStartY.current - e.changedTouches[0].clientY;
      if (Math.abs(diffY) > 50) {
        stepWeek(diffY > 0 ? 'down' : 'up');
      }
      touchStartY.current = null;
    };

    const el = calendarRef.current;
    if (el) {
      el.addEventListener('wheel', handleWheel, { passive: true });
      el.addEventListener('touchstart', handleTouchStart, { passive: true });
      el.addEventListener('touchend', handleTouchEnd, { passive: true });
    }
    return () => {
      if (el) {
        el.removeEventListener('wheel', handleWheel);
        el.removeEventListener('touchstart', handleTouchStart);
        el.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [workoutToEdit, eventToEdit, showLibrary, isTransitioning, stepWeek]);

  // Drag & drop
  const [dragOverInfo, setDragOverInfo] = useState<{ date: string; index: number } | null>(null);
  const [isDraggingId, setIsDraggingId] = useState<string | null>(null);

  const handleDragStart = (
    e: React.DragEvent,
    item: Workout | EventGoal,
    isGoal = false,
  ) => {
    e.dataTransfer.setData('text/plain', item.id);
    e.dataTransfer.setData('isGoal', isGoal.toString());
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
    const container = (e.currentTarget as HTMLElement).querySelector('[data-drop-container]') as HTMLElement | null;
    if (!container) {
      setDragOverInfo({ date: dateStr, index: itemCount });
      return;
    }
    const children = Array.from(container.querySelectorAll('[data-drop-item]')) as HTMLElement[];
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
    const itemId = e.dataTransfer.getData('text/plain');
    const isGoal = e.dataTransfer.getData('isGoal') === 'true';

    if (isGoal) {
      const goal = goals.find((g) => g.id === itemId);
      if (goal) updateGoal.mutate({ ...goal, date: dateStr });
    } else {
      const workout = workouts.find((w) => w.id === itemId);
      if (workout)
        updateWorkout.mutate({ ...workout, date: dateStr, order: Date.now() });
    }
    handleDragEnd();
  };

  // Week summary
  const calculateWeekSummary = (week: Date[]) => {
    const sportTotals: Record<
      SportType,
      { distance: number; duration: number }
    > = {
      Swim: { distance: 0, duration: 0 },
      Bike: { distance: 0, duration: 0 },
      Run: { distance: 0, duration: 0 },
      Strength: { distance: 0, duration: 0 },
    };
    const weekTotals = { distance: 0, duration: 0 };
    week.forEach((date) => {
      const dateStr = formatDateToLocalISO(date);
      workouts
        .filter((w) => w.date === dateStr)
        .forEach((w) => {
          const dur = w.isCompleted
            ? w.actualDurationMinutes || 0
            : w.plannedDurationMinutes || 0;
          const dist = w.isCompleted
            ? w.actualDistanceKilometers || 0
            : w.plannedDistanceKilometers || 0;
          sportTotals[w.sport].duration += dur;
          sportTotals[w.sport].distance += dist;
          weekTotals.duration += dur;
          if (w.sport !== 'Strength') weekTotals.distance += dist;
        });
    });
    return { sportTotals, weekTotals };
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

  const gridColsClass =
    viewMode === 'summary'
      ? 'grid-cols-7 lg:grid-cols-[repeat(7,minmax(0,1fr))_120px]'
      : 'grid-cols-7';

  if (loadingWorkouts) {
    return (
      <div className="flex h-[calc(100vh-4.5rem)] items-center justify-center">
        <div className="text-muted-foreground text-sm">
          Loading training data...
        </div>
      </div>
    );
  }

  return (
    <div className="container-fixed">
      <div className="flex h-[calc(100vh-4.5rem)] flex-col space-y-4 overflow-hidden lg:h-[calc(100vh-5rem)]">
        {/* Header */}
        <header className="z-[70] flex w-full shrink-0 flex-col items-center justify-between gap-3 overflow-hidden px-4 lg:flex-row lg:px-4">
          <div className="flex w-full shrink-0 items-center justify-between gap-2 lg:w-auto lg:gap-4">
            <h2 className="truncate text-lg font-black lowercase tracking-tighter lg:text-3xl">
              {MONTH_NAMES[gridData.predominantMonth]}{' '}
              {gridData.predominantYear}
            </h2>
            <div className="bg-muted flex shrink-0 items-center gap-0.5 rounded-xl border p-1 shadow-sm lg:gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => stepMonth('up')}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={goToToday}
                className="px-2 text-[10px] font-black uppercase"
              >
                today
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => stepMonth('down')}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex w-full justify-between gap-1.5 lg:w-auto lg:justify-end lg:gap-3">
            <div className="bg-muted flex rounded-xl p-0.5 shadow-sm lg:p-1">
              <Button
                variant={viewMode === 'calendar' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('calendar')}
                className="text-[10px] font-black uppercase"
              >
                grid
              </Button>
              <Button
                variant={viewMode === 'summary' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('summary')}
                className="text-[10px] font-black uppercase"
              >
                stats
              </Button>
            </div>

            <div className="flex items-center gap-1.5 lg:gap-2">
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
        <div
          ref={calendarRef}
          className="relative flex min-h-0 flex-1 flex-col gap-4 overflow-hidden lg:flex-row"
        >
          <div className="bg-card relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border shadow-sm">
            {/* Day headers */}
            <div
              className={`bg-muted/50 z-[80] grid shrink-0 border-b ${gridColsClass}`}
            >
              {DAY_HEADERS.map((day) => (
                <div
                  key={day}
                  className="text-muted-foreground py-2 text-center text-[8px] font-black uppercase tracking-widest lg:text-[9px]"
                >
                  {day}
                </div>
              ))}
              {viewMode === 'summary' && (
                <div className="text-primary hidden py-2 text-center text-[9px] font-black lowercase tracking-widest lg:block">
                  totals
                </div>
              )}
            </div>

            {/* Weeks */}
            <div
              ref={scrollRef}
              className="relative flex-1 overflow-y-auto scroll-smooth [scrollbar-width:none]"
            >
              <div
                className={`h-full ${isAnimating ? 'transition-transform duration-300' : 'transition-none'}`}
                style={{ transform: `translateY(${slideOffset}px)` }}
              >
                {gridData.weeks.map((week, wIdx) => {
                  const { sportTotals, weekTotals } =
                    calculateWeekSummary(week);
                  return (
                    <div key={wIdx} className="flex flex-col lg:contents">
                      <div
                        className={`grid min-h-[120px] border-b lg:min-h-[160px] ${gridColsClass}`}
                      >
                        {week.map((date, dIdx) => {
                          const dateStr = formatDateToLocalISO(date);
                          const dayWorkouts = workouts
                            .filter((w) => w.date === dateStr)
                            .sort(
                              (a, b) => (a.order ?? 0) - (b.order ?? 0),
                            );
                          const dayGoals = goals.filter(
                            (g) => g.date === dateStr,
                          );
                          const isToday =
                            formatDateToLocalISO(new Date()) === dateStr;
                          const isSelected = selectedDate === dateStr;
                          const isSameMonth =
                            date.getMonth() === gridData.predominantMonth;
                          const isFirstOfMonth = date.getDate() === 1;

                          return (
                            <div
                              key={dIdx}
                              onClick={() => setSelectedDate(dateStr)}
                              onDragOver={(e) =>
                                handleDragOverCell(e, dateStr, dayWorkouts.length + dayGoals.length)
                              }
                              onDragLeave={() => setDragOverInfo(null)}
                              onDrop={(e) => handleDrop(e, dateStr)}
                              className={`group/cell relative flex flex-col overflow-hidden border-r p-1 transition-all last:border-r-0 lg:p-2
                                ${!isSameMonth ? 'bg-muted/20' : ''}
                                ${isSelected ? 'bg-primary/5 ring-primary/30 z-10 shadow-sm ring-1 ring-inset' : ''}
                                ${dragOverInfo?.date === dateStr && isDraggingId ? 'ring-2 ring-inset ring-primary bg-primary/10 dark:bg-primary/20' : ''}`}
                            >
                              <div className="mb-1 flex shrink-0 items-start justify-between">
                                <span
                                  className={`flex h-5 items-center justify-center rounded-full px-1.5 text-[9px] font-black transition-all lg:h-6 lg:text-xs
                                    ${isToday ? 'bg-primary text-primary-foreground shadow-lg' : isSelected ? 'text-primary font-black' : 'text-muted-foreground'}
                                    ${!isSameMonth ? 'opacity-30' : ''}`}
                                >
                                  {isFirstOfMonth
                                    ? `${MONTH_NAMES[date.getMonth()].slice(0, 3)} 1`
                                    : date.getDate()}
                                </span>
                              </div>

                              <div
                                className="relative flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto pb-6 [scrollbar-width:none]"
                                data-drop-container
                              >
                                {/* Goals */}
                                {dayGoals.map((goal, gIdx) => (
                                  <React.Fragment key={goal.id}>
                                    {dragOverInfo?.date === dateStr && isDraggingId && dragOverInfo.index === gIdx && (
                                      <div className="mx-0.5 flex shrink-0 items-center gap-0.5 py-1">
                                        <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-primary shadow-[0_0_10px_var(--color-primary)]" />
                                        <div className="h-[3px] flex-1 rounded-full bg-primary shadow-[0_0_10px_var(--color-primary)]" />
                                        <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-primary shadow-[0_0_10px_var(--color-primary)]" />
                                      </div>
                                    )}
                                    <div
                                      data-drop-item
                                      draggable="true"
                                      onDragStart={(e) =>
                                        handleDragStart(e, goal, true)
                                      }
                                      onDragEnd={handleDragEnd}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEventToEdit(goal);
                                      }}
                                      className={`flex cursor-grab items-center gap-1.5 overflow-hidden rounded-lg border border-indigo-400/30 bg-indigo-600 px-2 py-1 text-[6px] font-black uppercase tracking-tight text-white shadow-md transition-all hover:brightness-110 active:cursor-grabbing lg:text-[8px] ${isDraggingId === goal.id ? 'opacity-20 grayscale' : ''}`}
                                    >
                                      <span
                                        className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full text-[5px] lg:h-4 lg:w-4 lg:text-[7px] ${goal.priority === 'A' ? 'bg-red-500' : goal.priority === 'B' ? 'bg-amber-400' : 'bg-blue-400'}`}
                                      >
                                        {goal.priority}
                                      </span>
                                      <span className="truncate">
                                        {goal.title}
                                      </span>
                                    </div>
                                  </React.Fragment>
                                ))}

                                {/* Workouts */}
                                {dayWorkouts.map((w, wIdx) => {
                                  const itemIndex = dayGoals.length + wIdx;
                                  const bg =
                                    intensitySettings?.[w.sport]?.[
                                      w.effortLevel || 1
                                    ]?.hexColor || '#3b82f6';
                                  const dur = w.isCompleted
                                    ? w.actualDurationMinutes || 0
                                    : w.plannedDurationMinutes || 0;
                                  const dist = w.isCompleted
                                    ? w.actualDistanceKilometers || 0
                                    : w.plannedDistanceKilometers || 0;
                                  const pace =
                                    dur > 0 && dist > 0 && w.sport !== 'Strength'
                                      ? getWorkoutPace(w.sport, dur, dist)
                                      : '';
                                  return (
                                    <React.Fragment key={w.id}>
                                      {dragOverInfo?.date === dateStr && isDraggingId && dragOverInfo.index === itemIndex && (
                                        <div className="mx-0.5 flex shrink-0 items-center gap-0.5 py-1">
                                          <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-primary shadow-[0_0_10px_var(--color-primary)]" />
                                          <div className="h-[3px] flex-1 rounded-full bg-primary shadow-[0_0_10px_var(--color-primary)]" />
                                          <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-primary shadow-[0_0_10px_var(--color-primary)]" />
                                        </div>
                                      )}
                                      <div
                                        data-drop-item
                                        draggable="true"
                                        onDragStart={(e) =>
                                          handleDragStart(e, w)
                                        }
                                        onDragEnd={handleDragEnd}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setWorkoutToEdit(w);
                                        }}
                                        className={`relative cursor-grab overflow-hidden rounded-lg p-1 shadow-sm transition-all hover:shadow-md active:scale-95 active:cursor-grabbing lg:p-2 ${getContrastColor(bg)} ${w.isKeyWorkout ? 'border-l-[3px] border-l-white/80 dark:border-l-white/90 shadow-md' : ''} ${isDraggingId === w.id ? 'scale-95 opacity-20' : ''}`}
                                        style={{ backgroundColor: bg }}
                                      >
                                        {w.isKeyWorkout && (
                                          <Star className="absolute top-0.5 right-0.5 h-2.5 w-2.5 fill-white/90 text-white/90 drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)] lg:h-3 lg:w-3" />
                                        )}
                                        <div className="pointer-events-none flex flex-col gap-0.5 leading-none">
                                          <div className="truncate text-[8px] opacity-70 lowercase lg:text-[10px]">
                                            {w.sport}
                                            {w.workoutType ? ` · ${w.workoutType}` : ''}
                                          </div>
                                          <div className="truncate text-[9px] lg:text-xs">
                                            {w.title || 'Untitled'}
                                          </div>
                                          <div className="truncate text-[8px] opacity-70 lg:text-[10px]">
                                            {formatMinsShort(dur)}
                                            {dist > 0 && w.sport !== 'Strength'
                                              ? ` · ${dist}km`
                                              : ''}
                                            {pace ? ` · ${pace}` : ''}
                                          </div>
                                        </div>
                                      </div>
                                    </React.Fragment>
                                  );
                                })}

                                {/* Drop zone indicator - after last item */}
                                {dragOverInfo?.date === dateStr && isDraggingId && dragOverInfo.index >= (dayGoals.length + dayWorkouts.length) && (
                                  <div className="mx-0.5 flex shrink-0 items-center gap-0.5 py-1">
                                    <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-primary shadow-[0_0_10px_var(--color-primary)]" />
                                    <div className="h-[3px] flex-1 rounded-full bg-primary shadow-[0_0_10px_var(--color-primary)]" />
                                    <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-primary shadow-[0_0_10px_var(--color-primary)]" />
                                  </div>
                                )}
                              </div>

                              {/* Daily totals in stats mode */}
                              {viewMode === 'summary' && dayWorkouts.length > 0 && (
                                <div className="border-muted mt-auto shrink-0 border-t pt-1">
                                  <div className="text-muted-foreground text-[8px] lg:text-[10px]">
                                    {formatMinsShort(
                                      dayWorkouts.reduce(
                                        (sum, w) =>
                                          sum +
                                          (w.isCompleted
                                            ? w.actualDurationMinutes || 0
                                            : w.plannedDurationMinutes || 0),
                                        0,
                                      ),
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {/* Week summary column */}
                        {viewMode === 'summary' && (
                          <div className="bg-primary/5 hidden flex-col gap-3 border-l p-3 lg:flex">
                            <div className="text-primary text-xl font-black leading-none">
                              {formatMinsShort(weekTotals.duration)}
                            </div>
                            <div className="border-primary/10 space-y-2.5 border-t pt-3">
                              {(
                                [
                                  'Swim',
                                  'Bike',
                                  'Run',
                                  'Strength',
                                ] as SportType[]
                              ).map((s) => {
                                const sTotal = sportTotals[s];
                                if (sTotal.duration === 0) return null;
                                const sportColor =
                                  intensitySettings?.[s]?.[2]?.hexColor;
                                return (
                                  <div key={s} className="flex flex-col">
                                    <div className="flex items-center gap-1.5">
                                      {sportColor && (
                                        <span
                                          className="h-2 w-2 shrink-0 rounded-full"
                                          style={{ backgroundColor: sportColor }}
                                        />
                                      )}
                                      <span className="text-muted-foreground text-[10px] font-black lowercase">
                                        {s}
                                      </span>
                                    </div>
                                    <div className="flex flex-col gap-0.5 pl-3.5">
                                      <span className="text-[10px] font-black leading-none">
                                        {formatMinsShort(sTotal.duration)}
                                      </span>
                                      {sTotal.distance > 0 && s !== 'Strength' && (
                                        <span className="text-muted-foreground text-[9px] leading-none">
                                          {sTotal.distance.toFixed(1)}km
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Library Drawer */}
          <LibraryDrawer
            open={showLibrary}
            onClose={() => setShowLibrary(false)}
            library={library}
            selectedDate={selectedDate}
            intensitySettings={intensitySettings}
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
            intensitySettings={intensitySettings}
            workoutTypeOptions={profile?.workout_type_options}
            existingWorkouts={workouts}
            onSave={handleSaveWorkout}
            onSaveBulk={handleSaveBulk}
            onDelete={handleDeleteWorkout}
            onCancel={() => setWorkoutToEdit(null)}
          />
        )}

        {/* Floating Add Button */}
        <Button
          variant="primary"
          shape="circle"
          onClick={() =>
            setWorkoutToEdit({ date: selectedDate, order: Date.now() })
          }
          className="fixed bottom-6 right-6 z-[90] h-14 w-14 shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-shadow lg:bottom-8 lg:right-8"
        >
          <Plus className="h-6 w-6" />
        </Button>

        {/* Goal Dialog */}
        {eventToEdit && (
          <GoalDialog
            goal={eventToEdit}
            onSave={(g: EventGoal) => {
              updateGoal.mutate(g);
              setEventToEdit(null);
            }}
            onDelete={(id: string) => {
              deleteGoal.mutate(id);
              setEventToEdit(null);
            }}
            onCancel={() => setEventToEdit(null)}
          />
        )}
      </div>
    </div>
  );
}
