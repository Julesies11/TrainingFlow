import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Download,
  FileUp,
  Plus,
  Sparkles,
  Trash2,
  Watch,
} from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Event, LibraryWorkout, Note, Workout } from '@/types/training';
import { useSupabaseUserId } from '@/hooks/use-supabase-user';
import {
  useCreateLibraryWorkout,
  useCreateNote,
  useCreateWorkout,
  useCreateWorkoutsBulk,
  useDeleteByPlan,
  useDeleteEvent,
  useDeleteLibraryWorkout,
  useDeleteNote,
  useDeleteWorkout,
  useEvents,
  useGoals,
  useLibrary,
  useNotes,
  useSportTypes,
  useUpdateEvent,
  useUpdateLibraryWorkout,
  useUpdateNote,
  useUpdateWorkout,
  useUserSportSettings,
  useWorkouts,
} from '@/hooks/use-training-data';
import {
  formatDateToLocalISO,
  getMonday,
  MONTH_NAMES,
} from '@/services/training/calendar.utils';
import {
  buildSportMap,
  buildUserSettingsMap,
} from '@/services/training/effort-colors';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { EventDialog } from '../_shared/components/event-dialog';
import { ExportDialog } from '../_shared/components/export-dialog';
import { BulkDeleteDialog } from './components/bulk-delete-dialog';
import { CalendarGrid } from './components/calendar-grid';
import { GarminImportDialog } from './components/garmin-import-dialog';
import { ImportDialog } from './components/import-dialog';
import { LibraryDrawer } from './components/library-drawer';
import { NoteDialog } from './components/note-dialog';
import { PlanGeneratorWizard } from './components/plan-generator-wizard';
import { WorkoutDialog } from './components/workout-dialog';

export function CalendarView() {
  const { year, month } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const userId = useSupabaseUserId();
  const { data: workouts = [], isLoading: loadingWorkouts } = useWorkouts();
  const { data: notes = [] } = useNotes();
  const { data: events = [] } = useEvents();
  const { data: goals = [] } = useGoals();
  const { data: library = [] } = useLibrary();
  const { data: sportTypes = [], isLoading: loadingSports } = useSportTypes();
  const { data: userSportSettings = [], isLoading: loadingSettings } =
    useUserSportSettings();

  const updateWorkout = useUpdateWorkout();
  const createWorkout = useCreateWorkout();
  const createWorkoutsBulk = useCreateWorkoutsBulk();
  const deleteWorkout = useDeleteWorkout();
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();

  const handleDeletePlan = (planId: string) => {
    deleteByPlan.mutate(planId, {
      onSuccess: () => {
        setWorkoutToEdit(null);
      },
    });
  };

  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();
  const deleteByPlan = useDeleteByPlan();
  const createLibrary = useCreateLibraryWorkout();
  const updateLibrary = useUpdateLibraryWorkout();
  const deleteLibrary = useDeleteLibraryWorkout();

  // Navigation state
  const [selectedDate, setSelectedDate] = useState<string>(
    formatDateToLocalISO(new Date()),
  );

  const [displayMonth, setDisplayMonth] = useState<number>(() => {
    if (month) return parseInt(month, 10) - 1;
    return new Date().getMonth();
  });

  const [displayYear, setDisplayYear] = useState<number>(() => {
    if (year) return parseInt(year, 10);
    return new Date().getFullYear();
  });

  // Sync state with URL
  useEffect(() => {
    const targetPath = `/calendar/${displayYear}/${displayMonth + 1}`;
    if (location.pathname !== targetPath) {
      navigate(targetPath, { replace: true });
    }
  }, [displayMonth, displayYear, navigate, location.pathname]);

  // Handle back/forward navigation
  useEffect(() => {
    if (year && month) {
      const y = parseInt(year, 10);
      const m = parseInt(month, 10) - 1;
      if (y !== displayYear) setDisplayYear(y);
      if (m !== displayMonth) setDisplayMonth(m);
    }
  }, [year, month, displayYear, displayMonth]);

  const todayRef = useRef<HTMLDivElement>(null);
  const hasInitialScrolled = useRef(false);

  // Modal state
  const [workoutToEdit, setWorkoutToEdit] = useState<Partial<Workout> | null>(
    null,
  );
  const [noteToEdit, setNoteToEdit] = useState<Partial<Note> | null>(null);
  const [eventWithSegmentsToEdit, setEventWithSegmentsToEdit] =
    useState<Event | null>(null);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showGarminImportDialog, setShowGarminImportDialog] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [showPlanGenerator, setShowPlanGenerator] = useState(false);

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
    const libData = e.dataTransfer.getData('libraryWorkout');

    if (itemId) {
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
    } else if (libData) {
      const template = JSON.parse(libData) as LibraryWorkout;
      createWorkout.mutate({
        ...template,
        date: dateStr,
        id: undefined,
        order: Date.now(),
      });
    }
    handleDragEnd();
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

  const handleExport = () => {
    setShowExportDialog(true);
  };

  const defaultExportRange = useMemo(() => {
    const from = formatDateToLocalISO(new Date(displayYear, displayMonth, 1));
    const to = formatDateToLocalISO(new Date(displayYear, displayMonth + 1, 0));
    return { from, to };
  }, [displayMonth, displayYear]);

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
            <div className="flex items-center gap-1 lg:gap-1.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowBulkDeleteDialog(true)}
                    className="h-9 w-9 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Bulk Delete</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowImportDialog(true)}
                    className="h-9 w-9"
                  >
                    <FileUp className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Import AI Program</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleExport}
                    className="h-9 w-9"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Export Workouts (CSV)</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowGarminImportDialog(true)}
                    className="h-9 w-9"
                  >
                    <Watch className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Import Garmin Activities</TooltipContent>
              </Tooltip>

              <div className="mx-1 h-6 w-px bg-border" />

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPlanGenerator(true)}
                className="gap-1.5 border-primary/20 text-primary hover:bg-primary/5"
              >
                <Sparkles className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">
                  Generate
                </span>
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowLibrary(!showLibrary)}
                className="gap-2 px-4"
              >
                <BookOpen className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Library
                </span>
              </Button>
            </div>
          </div>
        </header>
        {/* Calendar Grid */}
        <div className="relative flex flex-col gap-4 lg:flex-row">
          <CalendarGrid
            weeks={weeks}
            workouts={workouts}
            notes={notes}
            events={events}
            goals={goals}
            sportMap={sportMap}
            userSettingsMap={userSettingsMap}
            selectedDate={selectedDate}
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
            onEditWorkout={setWorkoutToEdit}
            onEditNote={setNoteToEdit}
            onEditEvent={setEventWithSegmentsToEdit}
            isDraggingId={isDraggingId}
            dragOverInfo={dragOverInfo}
            todayRef={todayRef}
          />

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
            onDeletePlan={handleDeletePlan}
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
        <ExportDialog
          open={showExportDialog}
          onOpenChange={setShowExportDialog}
          sportTypes={sportTypes}
          defaultFromDate={defaultExportRange.from}
          defaultToDate={defaultExportRange.to}
        />
        {/* Plan Generator Wizard */}
        {showPlanGenerator && (
          <PlanGeneratorWizard onClose={() => setShowPlanGenerator(false)} />
        )}
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
