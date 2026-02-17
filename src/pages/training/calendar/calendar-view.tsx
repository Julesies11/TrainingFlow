import React, { useState, useMemo, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, BookOpen, Plus, Star } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  useWorkouts,
  useUpdateWorkout,
  useCreateWorkout,
  useCreateWorkoutsBulk,
  useDeleteWorkout,
  useEvents,
  useUpdateEvent,
  useDeleteEvent,
  useProfile,
  useLibrary,
  useCreateLibraryWorkout,
  useUpdateLibraryWorkout,
  useDeleteLibraryWorkout,
  useSportTypes,
  useUserSportSettings,
} from '@/hooks/use-training-data';
import { Workout, Event, LibraryWorkout } from '@/types/training';
import {
  formatDateToLocalISO,
  getMonday,
  formatMinsShort,
  getContrastColor,
  MONTH_NAMES,
  DAY_HEADERS,
} from '@/services/training/calendar.utils';
import { getEffortColor, buildSportMap, buildUserSettingsMap } from '@/services/training/effort-colors';
import { calculatePace } from '@/services/training/pace-utils';
import { getSportIcon } from '@/services/training/sport-icons';
import { WorkoutDialog } from './components/workout-dialog';
import { EventDialog } from './components/event-dialog';
import { LibraryDrawer } from './components/library-drawer';

export function CalendarView() {
  const { data: workouts = [], isLoading: loadingWorkouts } = useWorkouts();
  const { data: events = [] } = useEvents();
  const { data: library = [] } = useLibrary();
  const { data: sportTypes = [] } = useSportTypes();
  const { data: userSportSettings = [] } = useUserSportSettings();

  const updateWorkout = useUpdateWorkout();
  const createWorkout = useCreateWorkout();
  const createWorkoutsBulk = useCreateWorkoutsBulk();
  const deleteWorkout = useDeleteWorkout();
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();
  const createLibrary = useCreateLibraryWorkout();
  const updateLibrary = useUpdateLibraryWorkout();
  const deleteLibrary = useDeleteLibraryWorkout();

  // Navigation state
  const [selectedDate, setSelectedDate] = useState<string>(
    formatDateToLocalISO(new Date()),
  );
  const [viewMode, setViewMode] = useState<'calendar' | 'summary'>('calendar');
  const [displayMonth, setDisplayMonth] = useState<number>(new Date().getMonth());
  const [displayYear, setDisplayYear] = useState<number>(new Date().getFullYear());

  // Modal state
  const [workoutToEdit, setWorkoutToEdit] = useState<Partial<Workout> | null>(
    null,
  );
  const [eventWithSegmentsToEdit, setEventWithSegmentsToEdit] = useState<Event | null>(null);
  const [showLibrary, setShowLibrary] = useState(false);

  // Refs
  const calendarRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const initialScrollDone = useRef(false);
  const headerUpdateTimer = useRef<number | null>(null);

  // Weeks state for load more functionality
  const [weeksState, setWeeksState] = useState<Date[][]>([]);
  const [isLoadingWeeks, setIsLoadingWeeks] = useState(false);
  const [showLoadEarlier, setShowLoadEarlier] = useState(false);
  const [showLoadLater, setShowLoadLater] = useState(false);
  const scrollPositionRef = useRef({ top: 0, bottom: 0 });
  const buttonVisibilityTimer = useRef<number | null>(null);

  const sportMap = useMemo(() => buildSportMap(sportTypes), [sportTypes]);
  const userSettingsMap = useMemo(() => buildUserSettingsMap(userSportSettings), [userSportSettings]);

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

  // Generate 52 weeks (26 before today, 26 after) - immediately available
  const weeks = useMemo(() => {
    if (weeksState.length > 0) return weeksState;
    
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - (26 * 7)); // 26 weeks back
    const startMonday = getMonday(startDate);
    return generateWeeksFrom(startMonday, 52);
  }, [weeksState, generateWeeksFrom]);

  // Scroll to today's week on initial load
  useEffect(() => {
    if (weeks.length > 0 && scrollRef.current && !initialScrollDone.current) {
      const todayStr = formatDateToLocalISO(new Date());
      const todayWeekIndex = weeks.findIndex(week =>
        week.some(date => formatDateToLocalISO(date) === todayStr)
      );
      if (todayWeekIndex >= 0) {
        const avgWeekHeight = 160;
        scrollRef.current.scrollTop = todayWeekIndex * avgWeekHeight;
        initialScrollDone.current = true;
      }
    }
  }, [weeks]);

  // Debounced header update from scroll position
  const updateHeaderFromScroll = useCallback(() => {
    const container = scrollRef.current;
    if (!container || weeks.length === 0) return;

    const avgWeekHeight = 160;
    const visibleWeekIndex = Math.max(0, Math.floor(container.scrollTop / avgWeekHeight));
    
    if (visibleWeekIndex < weeks.length) {
      const visibleWeek = weeks[visibleWeekIndex];
      const midDate = visibleWeek[3]; // Wednesday
      
      requestAnimationFrame(() => {
        setDisplayMonth(midDate.getMonth());
        setDisplayYear(midDate.getFullYear());
      });
    }
  }, [weeks]);

  // Scroll handler - only updates header with debounce
  const handleScroll = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;

    // Track scroll position in ref (no re-render)
    const { scrollTop, scrollHeight, clientHeight } = container;
    scrollPositionRef.current = { 
      top: scrollTop, 
      bottom: scrollHeight - (scrollTop + clientHeight) 
    };

    // Throttled button visibility update (every 200ms)
    if (buttonVisibilityTimer.current) {
      clearTimeout(buttonVisibilityTimer.current);
    }
    buttonVisibilityTimer.current = window.setTimeout(() => {
      const pos = scrollPositionRef.current;
      setShowLoadEarlier(pos.top < 1000);
      setShowLoadLater(pos.bottom < 1000);
    }, 200);

    // Debounced header update
    if (headerUpdateTimer.current) {
      clearTimeout(headerUpdateTimer.current);
    }
    headerUpdateTimer.current = window.setTimeout(() => {
      updateHeaderFromScroll();
    }, 150);
  }, [updateHeaderFromScroll]);

  // Attach passive scroll listener
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (headerUpdateTimer.current) {
        clearTimeout(headerUpdateTimer.current);
      }
      if (buttonVisibilityTimer.current) {
        clearTimeout(buttonVisibilityTimer.current);
      }
    };
  }, [handleScroll]);

  // Load earlier weeks (prepend)
  const loadEarlierWeeks = useCallback(() => {
    setIsLoadingWeeks(true);
    const firstWeek = weeks[0];
    const earlierStart = new Date(firstWeek[0]);
    earlierStart.setDate(earlierStart.getDate() - (26 * 7));
    const newWeeks = generateWeeksFrom(getMonday(earlierStart), 26);
    
    setWeeksState(prev => {
      const updated = prev.length > 0 ? [...newWeeks, ...prev] : [...newWeeks, ...weeks];
      return updated;
    });
    
    // Adjust scroll position to maintain view
    if (scrollRef.current) {
      const avgWeekHeight = 160;
      requestAnimationFrame(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop += (26 * avgWeekHeight);
          setIsLoadingWeeks(false);
        }
      });
    } else {
      setIsLoadingWeeks(false);
    }
  }, [weeks, generateWeeksFrom]);

  // Load later weeks (append)
  const loadLaterWeeks = useCallback(() => {
    setIsLoadingWeeks(true);
    const lastWeek = weeks[weeks.length - 1];
    const laterStart = new Date(lastWeek[6]);
    laterStart.setDate(laterStart.getDate() + 1);
    const newWeeks = generateWeeksFrom(getMonday(laterStart), 26);
    
    setWeeksState(prev => {
      const updated = prev.length > 0 ? [...prev, ...newWeeks] : [...weeks, ...newWeeks];
      return updated;
    });
    
    setTimeout(() => setIsLoadingWeeks(false), 100);
  }, [weeks, generateWeeksFrom]);

  // Navigation helpers
  const stepMonth = useCallback(
    (dir: 'up' | 'down') => {
      const container = scrollRef.current;
      if (!container || weeks.length === 0) return;
      
      // Get current visible month from scroll position
      const avgWeekHeight = 160;
      const currentWeekIndex = Math.max(0, Math.floor(container.scrollTop / avgWeekHeight));
      const currentWeek = weeks[currentWeekIndex];
      if (!currentWeek) return;
      
      const currentMonth = currentWeek[3].getMonth();
      const currentYear = currentWeek[3].getFullYear();
      
      const targetMonth = dir === 'up' ? currentMonth - 1 : currentMonth + 1;
      const targetYear = targetMonth < 0 ? currentYear - 1 : targetMonth > 11 ? currentYear + 1 : currentYear;
      const normalizedMonth = targetMonth < 0 ? 11 : targetMonth > 11 ? 0 : targetMonth;
      
      // Find first week of target month
      const targetWeekIndex = weeks.findIndex(week =>
        week.some(date => date.getMonth() === normalizedMonth && date.getFullYear() === targetYear)
      );
      
      if (targetWeekIndex >= 0) {
        container.scrollTo({ 
          top: targetWeekIndex * avgWeekHeight, 
          behavior: 'smooth' 
        });
        
        // Update header immediately
        const targetWeek = weeks[targetWeekIndex];
        const midDate = targetWeek[3];
        setDisplayMonth(midDate.getMonth());
        setDisplayYear(midDate.getFullYear());
      }
    },
    [weeks],
  );

  const goToToday = useCallback(() => {
    const todayStr = formatDateToLocalISO(new Date());
    const todayWeekIndex = weeks.findIndex(week =>
      week.some(date => formatDateToLocalISO(date) === todayStr)
    );
    
    if (todayWeekIndex >= 0 && scrollRef.current) {
      const avgWeekHeight = 160;
      scrollRef.current.scrollTo({ 
        top: todayWeekIndex * avgWeekHeight, 
        behavior: 'smooth' 
      });
    }
    setSelectedDate(todayStr);
  }, [weeks]);

  // Drag & drop
  const [dragOverInfo, setDragOverInfo] = useState<{ date: string; index: number } | null>(null);
  const [isDraggingId, setIsDraggingId] = useState<string | null>(null);

  const handleDragStart = (
    e: React.DragEvent,
    item: Workout,
  ) => {
    e.dataTransfer.setData('text/plain', item.id);
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

    const workout = workouts.find((w) => w.id === itemId);
    if (workout) {
      updateWorkout.mutate({ ...workout, date: dateStr, order: Date.now() });
    }
    handleDragEnd();
  };

  // Week summary
  const calculateWeekSummary = (week: Date[]) => {
    const sportTotals: Record<string, { distance: number; duration: number }> = {};
    const weekTotals = { distance: 0, duration: 0 };
    week.forEach((date) => {
      const dateStr = formatDateToLocalISO(date);
      
      // Add workout totals
      workouts
        .filter((w) => w.date === dateStr)
        .forEach((w) => {
          const dur = w.isCompleted
            ? w.actualDurationMinutes || 0
            : w.plannedDurationMinutes || 0;
          const dist = w.isCompleted
            ? w.actualDistanceKilometers || 0
            : w.plannedDistanceKilometers || 0;
          const stId = w.sportTypeId || 'unknown';
          if (!sportTotals[stId]) sportTotals[stId] = { distance: 0, duration: 0 };
          sportTotals[stId].duration += dur;
          sportTotals[stId].distance += dist;
          weekTotals.duration += dur;
          const st = sportMap.get(stId);
          if (st?.paceRelevant) weekTotals.distance += dist;
        });
      
      // Add event segment totals
      events
        .filter((e) => e.date === dateStr)
        .forEach((e) => {
          if (e.segments && e.segments.length > 0) {
            e.segments.forEach((seg) => {
              const dur = seg.plannedDurationMinutes || 0;
              const dist = seg.plannedDistanceKilometers || 0;
              const stId = seg.sportTypeId || 'unknown';
              if (!sportTotals[stId]) sportTotals[stId] = { distance: 0, duration: 0 };
              sportTotals[stId].duration += dur;
              sportTotals[stId].distance += dist;
              weekTotals.duration += dur;
              const st = sportMap.get(stId);
              if (st?.paceRelevant) weekTotals.distance += dist;
            });
          }
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
              {MONTH_NAMES[displayMonth]}{' '}
              {displayYear}
            </h2>
            <div className="bg-muted flex shrink-0 items-center gap-0.5 rounded-xl border p-1 shadow-sm lg:gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => stepMonth('up')}
                className="h-12 w-12 p-0 lg:h-8 lg:w-8"
              >
                <ChevronLeft className="h-6 w-6 lg:h-4 lg:w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={goToToday}
                className="px-3 text-xs font-black uppercase lg:px-2 lg:text-[10px]"
              >
                today
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => stepMonth('down')}
                className="h-12 w-12 p-0 lg:h-8 lg:w-8"
              >
                <ChevronRight className="h-6 w-6 lg:h-4 lg:w-4" />
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
          style={{ touchAction: 'pan-y' }}
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
              className="relative flex-1 overflow-y-auto [scrollbar-width:none]"
              style={{ overscrollBehaviorY: 'contain' }}
            >
              <div>
                {/* Load Earlier Button - only show when near top */}
                {showLoadEarlier && (
                  <div className="sticky top-0 z-50 flex justify-center border-b bg-background/95 py-3 backdrop-blur lg:py-2">
                    <Button
                      variant="default"
                      size="lg"
                      onClick={loadEarlierWeeks}
                      disabled={isLoadingWeeks}
                      className="gap-2 text-sm font-bold shadow-lg lg:size-sm lg:text-xs"
                    >
                      {isLoadingWeeks ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <ChevronLeft className="h-4 w-4" />
                          Load Earlier Weeks
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {weeks.map((week, wIdx) => {
                  const { sportTotals, weekTotals } =
                    calculateWeekSummary(week);
                  const weekStart = formatDateToLocalISO(week[0]);
                  return (
                    <div key={wIdx} className="flex flex-col lg:contents" data-week-start={weekStart}>
                      {/* Week grid */}
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
                          const dayEvents = events.filter(
                            (e) => e.date === dateStr,
                          );
                          const isToday =
                            formatDateToLocalISO(new Date()) === dateStr;
                          const isSelected = selectedDate === dateStr;
                          const isSameMonth =
                            date.getMonth() === displayMonth;
                          const isFirstOfMonth = date.getDate() === 1;

                          return (
                            <div
                              key={dIdx}
                              onClick={() => setSelectedDate(dateStr)}
                              onDragOver={(e) =>
                                handleDragOverCell(e, dateStr, dayWorkouts.length + dayEvents.length)
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
                                {/* Events with segments */}
                                {dayEvents.map((event, eIdx) => {
                                  const itemIndex = eIdx;
                                  const hasSegments = event.segments && event.segments.length > 0;
                                  
                                  return (
                                    <React.Fragment key={event.id}>
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
                                        onDragStart={(e) => {
                                          e.dataTransfer.setData('eventId', event.id);
                                          setIsDraggingId(event.id);
                                        }}
                                        onDragEnd={handleDragEnd}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setEventWithSegmentsToEdit(event);
                                        }}
                                        className={`cursor-grab overflow-hidden rounded-lg border border-indigo-400/30 bg-indigo-600/10 shadow-sm transition-all hover:shadow-md active:cursor-grabbing ${isDraggingId === event.id ? 'opacity-20 grayscale' : ''}`}
                                      >
                                        <div className="flex items-center gap-1.5 border-b border-indigo-400/20 bg-indigo-600 px-2 py-1">
                                          <span
                                            className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full text-[5px] lg:h-4 lg:w-4 lg:text-[7px] ${event.priority === 'A' ? 'bg-red-500' : event.priority === 'B' ? 'bg-amber-400' : 'bg-blue-400'}`}
                                          >
                                            {event.priority}
                                          </span>
                                          <span className="truncate text-[6px] font-black uppercase tracking-tight text-white lg:text-[8px]">
                                            {event.title}
                                          </span>
                                        </div>
                                        {hasSegments && (
                                          <div className="flex flex-col gap-1 p-1">
                                            {event.segments!.map((seg, segIdx) => {
                                              const sport = sportMap.get(seg.sportTypeId);
                                              const userSettingsForSport = userSettingsMap.get(seg.sportTypeId);
                                              const color = getEffortColor(sport, seg.effortLevel, userSettingsForSport);
                                              const duration = seg.plannedDurationMinutes || 0;
                                              const distKm = seg.plannedDistanceKilometers || 0;
                                              const dist = sport?.name === 'Swim' ? distKm * 1000 : distKm;
                                              const pace = calculatePace(sport?.name || '', duration, dist);
                                              
                                              const sportName = seg.sportName || sport?.name || 'Unknown';
                                              const IconComponent = getSportIcon(sportName);

                                              return (
                                                <div
                                                  key={segIdx}
                                                  className="flex items-center gap-1 rounded p-1"
                                                  style={{ borderLeftWidth: '2px', borderLeftColor: color }}
                                                >
                                                  {IconComponent && (
                                                    <IconComponent className="h-2.5 w-2.5 shrink-0 text-muted-foreground lg:h-3 lg:w-3" />
                                                  )}
                                                  <div className="flex flex-col gap-0.5 text-[6px] leading-none lg:text-[8px]">
                                                    <span className="font-bold lowercase">{sportName}</span>
                                                    {duration > 0 && <span className="text-muted-foreground">{formatMinsShort(duration)}</span>}
                                                    {dist > 0 && sport?.paceRelevant && (
                                                      <span className="text-muted-foreground">{dist}{sport.distanceUnit || 'km'}</span>
                                                    )}
                                                    {pace && <span className="text-muted-foreground">{pace}</span>}
                                                  </div>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        )}
                                      </div>
                                    </React.Fragment>
                                  );
                                })}

                                {/* Workouts */}
                                {dayWorkouts.map((w, wIdx) => {
                                  const itemIndex = dayEvents.length + wIdx;
                                  const wSt = sportMap.get(w.sportTypeId);
                                  const bg = getEffortColor(wSt, w.effortLevel || 1, userSettingsMap.get(w.sportTypeId));
                                  const dur = w.isCompleted
                                    ? w.actualDurationMinutes || 0
                                    : w.plannedDurationMinutes || 0;
                                  const distKm = w.isCompleted
                                    ? w.actualDistanceKilometers || 0
                                    : w.plannedDistanceKilometers || 0;
                                  // Convert km to meters for swimming
                                  const dist = wSt?.name === 'Swim' ? distKm * 1000 : distKm;
                                  const pace = calculatePace(wSt?.name || '', dur, dist);
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
                                          {viewMode === 'summary' ? (
                                            // Stats view: icon + sport type on top, stacked metrics below
                                            <>
                                              <div className="flex items-center gap-1 truncate text-[8px] opacity-70 lowercase lg:text-[10px]">
                                                {(() => {
                                                  const sportName = w.sportName || wSt?.name || 'Unknown';
                                                  const IconComponent = getSportIcon(sportName);
                                                  return (
                                                    <>
                                                      {IconComponent && <IconComponent className="h-2.5 w-2.5 shrink-0 lg:h-3 lg:w-3" />}
                                                      <span className="truncate">{sportName}</span>
                                                    </>
                                                  );
                                                })()}
                                              </div>
                                              {/* Duration */}
                                              <div className="text-[9px] lg:text-xs">
                                                {formatMinsShort(dur)}
                                              </div>
                                              {/* Distance */}
                                              {dist > 0 && wSt?.paceRelevant && (
                                                <div className="text-[8px] opacity-70 lg:text-[10px]">
                                                  {dist}{wSt.distanceUnit || 'km'}
                                                </div>
                                              )}
                                              {/* Pace */}
                                              {pace && (
                                                <div className="text-[8px] opacity-70 lg:text-[10px]">
                                                  {pace}
                                                </div>
                                              )}
                                            </>
                                          ) : (
                                            // Calendar view: icon + sport, title, and inline metrics
                                            <>
                                              <div className="flex items-center gap-1 truncate text-[8px] opacity-70 lowercase lg:text-[10px]">
                                                {(() => {
                                                  const sportName = w.sportName || wSt?.name || 'Unknown';
                                                  const IconComponent = getSportIcon(sportName);
                                                  return (
                                                    <>
                                                      {IconComponent && <IconComponent className="h-2.5 w-2.5 shrink-0 lg:h-3 lg:w-3" />}
                                                      <span className="truncate">{sportName}</span>
                                                    </>
                                                  );
                                                })()}
                                              </div>
                                              <div className="truncate text-[9px] lg:text-xs">
                                                {w.title || 'Untitled'}
                                              </div>
                                              <div className="truncate text-[8px] opacity-70 lg:text-[10px]">
                                                {formatMinsShort(dur)}
                                                {dist > 0 && wSt?.paceRelevant
                                                  ? ` · ${dist}${wSt.distanceUnit || 'km'}`
                                                  : ''}
                                                {pace ? ` · ${pace}` : ''}
                                              </div>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                    </React.Fragment>
                                  );
                                })}

                                {/* Drop zone indicator - after last item */}
                                {dragOverInfo?.date === dateStr && isDraggingId && dragOverInfo.index >= (dayEvents.length + dayWorkouts.length) && (
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

                        {/* Week summary column - desktop only */}
                        {viewMode === 'summary' && (
                          <div className="bg-primary/5 hidden flex-col gap-3 border-l p-3 lg:flex">
                            <div className="text-primary text-xl font-black leading-none">
                              {formatMinsShort(weekTotals.duration)}
                            </div>
                            <div className="border-primary/10 space-y-2.5 border-t pt-3">
                              {Object.entries(sportTotals).map(([stId, sTotal]) => {
                                if (sTotal.duration === 0) return null;
                                const st = sportMap.get(stId);
                                const sportColor = getEffortColor(st, 2, userSettingsMap.get(stId));
                                return (
                                  <div key={stId} className="flex flex-col">
                                    <div className="flex items-center gap-1.5">
                                      <span
                                        className="h-2 w-2 shrink-0 rounded-full"
                                        style={{ backgroundColor: sportColor }}
                                      />
                                      <span className="text-muted-foreground text-[10px] font-black lowercase">
                                        {st?.name || 'Unknown'}
                                      </span>
                                    </div>
                                    <div className="flex flex-col gap-0.5 pl-3.5">
                                      <span className="text-[10px] font-black leading-none">
                                        {formatMinsShort(sTotal.duration)}
                                      </span>
                                      {sTotal.distance > 0 && st?.paceRelevant && (
                                        <span className="text-muted-foreground text-[9px] leading-none">
                                          {sTotal.distance.toFixed(1)}{st.distanceUnit || 'km'}
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

                      {/* Week summary row - mobile only */}
                      {viewMode === 'summary' && (
                        <div className="bg-primary/5 border-b p-3 lg:hidden">
                          <div className="mb-3">
                            <span className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">
                              Week of {format(week[0], 'MMM d')}
                            </span>
                          </div>
                          <div className="flex gap-4">
                            {Object.entries(sportTotals).map(([stId, sTotal]) => {
                              if (sTotal.duration === 0) return null;
                              const st = sportMap.get(stId);
                              const sportColor = getEffortColor(st, 2, userSettingsMap.get(stId));
                              return (
                                <div key={stId} className="flex flex-col items-start gap-1">
                                  <div className="flex items-center gap-1.5">
                                    <span
                                      className="h-2 w-2 shrink-0 rounded-full"
                                      style={{ backgroundColor: sportColor }}
                                    />
                                    <span className="text-[10px] font-black lowercase">
                                      {st?.name || 'Unknown'}
                                    </span>
                                  </div>
                                  <span className="text-[10px]">
                                    {formatMinsShort(sTotal.duration)}
                                  </span>
                                  {sTotal.distance > 0 && st?.paceRelevant && (
                                    <span className="text-muted-foreground text-[9px]">
                                      {sTotal.distance.toFixed(1)}{st.distanceUnit || 'km'}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Load Later Button - only show when near bottom */}
                {showLoadLater && (
                  <div className="sticky bottom-0 z-50 flex justify-center border-t bg-background/95 py-3 backdrop-blur lg:py-2">
                    <Button
                      variant="default"
                      size="lg"
                      onClick={loadLaterWeeks}
                      disabled={isLoadingWeeks}
                      className="gap-2 text-sm font-bold shadow-lg lg:size-sm lg:text-xs"
                    >
                      {isLoadingWeeks ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Loading...
                        </>
                      ) : (
                        <>
                          Load Later Weeks
                          <ChevronRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
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

        {/* Event Dialog with Segments */}
        {eventWithSegmentsToEdit && (
          <EventDialog
            event={eventWithSegmentsToEdit}
            sportTypes={sportTypes}
            userSettings={userSportSettings}
            onSave={(e: Event) => {
              updateEvent.mutate(e);
              setEventWithSegmentsToEdit(null);
            }}
            onDelete={(id: string) => {
              deleteEvent.mutate(id);
              setEventWithSegmentsToEdit(null);
            }}
            onCancel={() => setEventWithSegmentsToEdit(null)}
          />
        )}
      </div>
    </div>
  );
}
