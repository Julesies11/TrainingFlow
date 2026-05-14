import React, { useCallback, useMemo, useState } from 'react';
import { ExportDialog } from '@/pages/training/_shared/components/export-dialog';
import { VolumeChartWidget } from '@/pages/training/_shared/components/volume-chart-widget';
import { BulkDeleteDialog } from '@/pages/training/calendar/components/bulk-delete-dialog';
import { CalendarGrid } from '@/pages/training/calendar/components/calendar-grid';
import { ImportDialog } from '@/pages/training/calendar/components/import-dialog';
import { LibraryDrawer } from '@/pages/training/calendar/components/library-drawer';
import { NoteDialog } from '@/pages/training/calendar/components/note-dialog';
import { WorkoutDialog } from '@/pages/training/calendar/components/workout-dialog';
import {
  addDays,
  addWeeks,
  differenceInCalendarDays,
  parseISO,
} from 'date-fns';
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Download,
  FileUp,
  Loader2,
  MoreVertical,
  Plus,
  Save,
  Settings,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  LibraryWorkout,
  Note,
  PlanTemplate,
  PlanTemplateNote,
  PlanTemplateWorkout,
  SportTypeRecord,
  Workout,
} from '@/types/training';
import {
  useCreateLibraryWorkout,
  useCreatePlanTemplate,
  useDeleteLibraryWorkout,
  useIsDeveloper,
  useLibrary,
  useUpdateLibraryWorkout,
  useUpdatePlanTemplate,
  useUserSportSettings,
} from '@/hooks/use-training-data';
import { formatDateToLocalISO } from '@/services/training/calendar.utils';
import { buildUserSettingsMap } from '@/services/training/effort-colors';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

interface TemplateBuilderDialogProps {
  template: Partial<PlanTemplate>;
  sportTypes: SportTypeRecord[];
  onClose: () => void;
}

// Fixed base date for dummy projection: Monday, Jan 1, 2024
const DUMMY_BASE_DATE = new Date(2024, 0, 1);

export function TemplateBuilderDialog({
  template: initialTemplate,
  sportTypes,
  onClose,
}: TemplateBuilderDialogProps) {
  const [formData, setFormData] = useState<Partial<PlanTemplate>>({
    name: '',
    totalWeeks: 4,
    description: '',
    is_system: false,
    workouts: [],
    notes: [],
    ...initialTemplate,
  });

  const { data: library = [] } = useLibrary();
  const { data: userSportSettings = [] } = useUserSportSettings();
  const createLibrary = useCreateLibraryWorkout();
  const updateLibrary = useUpdateLibraryWorkout();
  const deleteLibrary = useDeleteLibraryWorkout();
  const isDeveloper = useIsDeveloper();
  const createTemplate = useCreatePlanTemplate();
  const updateTemplate = useUpdatePlanTemplate();

  const userSettingsMap = useMemo(
    () => buildUserSettingsMap(userSportSettings),
    [userSportSettings],
  );

  const sportMap = useMemo(() => {
    return new Map(sportTypes.map((s) => [s.id, s]));
  }, [sportTypes]);

  // ─── Unsaved Changes Detection ─────────────────────────────
  const getPlanStateString = useCallback((plan: Partial<PlanTemplate>) => {
    return JSON.stringify({
      name: plan.name || '',
      totalWeeks: plan.totalWeeks || 4,
      description: plan.description || '',
      is_system: plan.is_system || false,
      workouts: (plan.workouts || []).sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0),
      ),
      notes: (plan.notes || []).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    });
  }, []);

  const [initialStateString, setInitialStateString] = useState(() =>
    getPlanStateString(initialTemplate),
  );

  const isDirty = useMemo(() => {
    const current = getPlanStateString(formData);
    return current !== initialStateString;
  }, [formData, initialStateString, getPlanStateString]);

  // ─── Local UI State ─────────────────────────────────────────
  const [showChart, setShowChart] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(
    formatDateToLocalISO(DUMMY_BASE_DATE),
  );
  const [workoutToEdit, setWorkoutToEdit] = useState<Partial<Workout> | null>(
    null,
  );
  const [noteToEdit, setNoteToEdit] = useState<Partial<Note> | null>(null);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [isDraggingId, setIsDraggingId] = useState<string | null>(null);
  const [dragOverInfo, setDragOverInfo] = useState<{
    date: string;
    index: number;
  } | null>(null);

  // ─── Dummy Projection Engine ────────────────────────────────

  // Generate dummy weeks Date[][]
  const weeks = useMemo(() => {
    const result: Date[][] = [];
    for (let w = 0; w < (formData.totalWeeks || 1); w++) {
      const week: Date[] = [];
      const weekStart = addWeeks(DUMMY_BASE_DATE, w);
      for (let d = 0; d < 7; d++) {
        week.push(addDays(weekStart, d));
      }
      result.push(week);
    }
    return result;
  }, [formData.totalWeeks]);

  // Project template workouts to standard Workout type
  const projectedWorkouts = useMemo(() => {
    return (formData.workouts || [])
      .map((tw) => {
        const weekStart = addWeeks(DUMMY_BASE_DATE, tw.weekNumber - 1);
        const daysToAdd = tw.dayOfWeek - 1;
        const projectedDate = addDays(weekStart, daysToAdd);

        return {
          ...tw,
          date: formatDateToLocalISO(projectedDate),
        } as Workout;
      })
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [formData.workouts]);

  // Project template notes to standard Note type
  const projectedNotes = useMemo(() => {
    return (formData.notes || [])
      .map((tn) => {
        const weekStart = addWeeks(DUMMY_BASE_DATE, tn.weekNumber - 1);
        const daysToAdd = tn.dayOfWeek - 1;
        const projectedDate = addDays(weekStart, daysToAdd);

        return {
          ...tn,
          date: formatDateToLocalISO(projectedDate),
        } as Note;
      })
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [formData.notes]);

  // Helper to convert projected date back to template coordinates
  const getCoordinatesFromDate = useCallback((dateStr: string) => {
    const date = parseISO(dateStr);
    const diffDays = differenceInCalendarDays(date, DUMMY_BASE_DATE);
    const weekNumber = Math.floor(diffDays / 7) + 1;
    let dayOfWeek = date.getDay(); // JS getDay: 0=Sun, 1=Mon...
    if (dayOfWeek === 0) dayOfWeek = 7; // Map to 1=Mon...7=Sun
    return { weekNumber, dayOfWeek };
  }, []);

  const handleImportToTemplate = (imported: Partial<Workout>[]) => {
    setFormData((prev) => {
      const newWorkouts = [...(prev.workouts || [])];
      imported.forEach((w) => {
        let weekNum = w.weekNumber;
        let day = w.dayOfWeek;

        if (weekNum === undefined || day === undefined) {
          if (!w.date) return;
          const coords = getCoordinatesFromDate(w.date);
          weekNum = coords.weekNumber;
          day = coords.dayOfWeek;
        }

        // Only import if it falls within template weeks
        if (weekNum >= 1 && weekNum <= (prev.totalWeeks || 0)) {
          newWorkouts.push({
            id: crypto.randomUUID(),
            templateId: prev.id || '',
            weekNumber: weekNum,
            dayOfWeek: day,
            sportTypeId: w.sportTypeId!,
            title: w.title!,
            description: w.description,
            plannedDurationMinutes: w.plannedDurationMinutes || 0,
            plannedDistanceKilometers: w.plannedDistanceKilometers || 0,
            effortLevel: w.effortLevel || 1,
            isKeyWorkout: w.isKeyWorkout || false,
            order: Date.now(),
          });
        }
      });
      return { ...prev, workouts: newWorkouts };
    });
  };

  const handleBulkDeleteFromTemplate = (
    fromWeek: string,
    toWeek: string,
    sportTypeIds: string[],
    daysOfWeek: number[],
  ) => {
    const fW = parseInt(fromWeek);
    const tW = parseInt(toWeek);

    setFormData((prev) => ({
      ...prev,
      workouts: (prev.workouts || []).filter((tw) => {
        const isInWeekRange = tw.weekNumber >= fW && tw.weekNumber <= tW;
        const isSelectedSport = sportTypeIds.includes(tw.sportTypeId);
        const isSelectedDay = daysOfWeek.includes(tw.dayOfWeek);

        // Keep if NOT (in week range AND selected sport AND selected day)
        return !(isInWeekRange && isSelectedSport && isSelectedDay);
      }),
    }));
  };

  // ─── Grid Handlers ──────────────────────────────────────────

  const handleDragStart = (e: React.DragEvent, item: Workout | Note) => {
    e.dataTransfer.setData('text/plain', item.id);
    const isNote = 'content' in item;
    if (isNote) {
      e.dataTransfer.setData('noteId', item.id);
    }
    e.dataTransfer.effectAllowed = 'move';
    setIsDraggingId(item.id);
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

  const handleDragLeave = () => {
    setDragOverInfo(null);
  };

  const handleDragEnd = () => {
    setIsDraggingId(null);
    setDragOverInfo(null);
  };

  const handleDrop = (e: React.DragEvent, dateStr: string) => {
    e.preventDefault();
    const noteId = e.dataTransfer.getData('noteId');
    const itemId = e.dataTransfer.getData('text/plain');
    const libData = e.dataTransfer.getData('libraryWorkout');

    const { weekNumber, dayOfWeek } = getCoordinatesFromDate(dateStr);

    if (noteId) {
      // Move existing note
      setFormData((prev) => ({
        ...prev,
        notes: (prev.notes || []).map((n) =>
          n.id === noteId ? { ...n, weekNumber, dayOfWeek } : n,
        ),
      }));
    } else if (itemId) {
      const workout = projectedWorkouts.find((w) => w.id === itemId);
      if (workout) {
        // Calculate new order based on drop index
        const dropIndex = dragOverInfo?.index ?? 0;

        // Get all items that would be in that day
        const dayNotes = projectedNotes.filter((n) => n.date === dateStr);
        // Get workouts in that day, excluding the one being moved if it's the same day
        const dayWorkouts = projectedWorkouts
          .filter((w) => w.date === dateStr && w.id !== itemId)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

        // Calculate relative index within workouts
        const relIndex = Math.max(0, dropIndex - dayNotes.length);

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

        setFormData((prev) => ({
          ...prev,
          workouts: (prev.workouts || []).map((w) =>
            w.id === itemId
              ? { ...w, weekNumber, dayOfWeek, order: newOrder }
              : w,
          ),
        }));
      }
    } else if (libData) {
      // Add from library (LibraryDrawer uses different data format)
      const libWorkout = JSON.parse(libData) as LibraryWorkout;
      const newTw: PlanTemplateWorkout = {
        id: crypto.randomUUID(),
        templateId: formData.id || '',
        weekNumber,
        dayOfWeek,
        sportTypeId: libWorkout.sportTypeId,
        title: libWorkout.title,
        description: libWorkout.description,
        plannedDurationMinutes: libWorkout.plannedDurationMinutes,
        plannedDistanceKilometers: libWorkout.plannedDistanceKilometers,
        effortLevel: libWorkout.effortLevel,
        isKeyWorkout: libWorkout.isKeyWorkout,
        order: Date.now(),
      };
      setFormData((prev) => ({
        ...prev,
        workouts: [...(prev.workouts || []), newTw],
      }));
    }
    handleDragEnd();
  };

  const handleSaveWorkout = (w: Partial<Workout>) => {
    // Always calculate coordinates from the date to ensure sync with the grid,
    // especially for recurring sessions which are generated via date increments.
    const { weekNumber, dayOfWeek } = getCoordinatesFromDate(w.date!);

    const tw: PlanTemplateWorkout = {
      id: w.id || crypto.randomUUID(),
      templateId: formData.id || '',
      weekNumber,
      dayOfWeek,
      sportTypeId: w.sportTypeId!,
      title: w.title!,
      description: w.description,
      plannedDurationMinutes: w.plannedDurationMinutes || 0,
      plannedDistanceKilometers: w.plannedDistanceKilometers || 0,
      effortLevel: w.effortLevel || 1,
      isKeyWorkout: w.isKeyWorkout || false,
      order: w.order || Date.now(),
      recurrenceId: w.recurrenceId,
      recurrenceRule: w.recurrenceRule,
    };

    setFormData((prev) => {
      const existing = (prev.workouts || []).findIndex((x) => x.id === tw.id);
      const newWorkouts = [...(prev.workouts || [])];
      if (existing >= 0) {
        newWorkouts[existing] = tw;
      } else {
        newWorkouts.push(tw);
      }
      return { ...prev, workouts: newWorkouts };
    });
    setWorkoutToEdit(null);
  };

  const handleSaveBulk = (ws: Partial<Workout>[]) => {
    setFormData((prev) => {
      const newWorkouts = [...(prev.workouts || [])];

      ws.forEach((w) => {
        // Always calculate coordinates from the date to ensure sync with the grid,
        // especially for recurring sessions which are generated via date increments.
        const { weekNumber, dayOfWeek } = getCoordinatesFromDate(w.date!);

        const tw: PlanTemplateWorkout = {
          id: w.id || crypto.randomUUID(),
          templateId: formData.id || '',
          weekNumber,
          dayOfWeek,
          sportTypeId: w.sportTypeId!,
          title: w.title!,
          description: w.description,
          plannedDurationMinutes: w.plannedDurationMinutes || 0,
          plannedDistanceKilometers: w.plannedDistanceKilometers || 0,
          effortLevel: w.effortLevel || 1,
          isKeyWorkout: w.isKeyWorkout || false,
          order: w.order || Date.now(),
          recurrenceId: w.recurrenceId,
          recurrenceRule: w.recurrenceRule,
        };

        const existing = newWorkouts.findIndex((x) => x.id === tw.id);
        if (existing >= 0) {
          newWorkouts[existing] = tw;
        } else {
          newWorkouts.push(tw);
        }
      });
      return { ...prev, workouts: newWorkouts };
    });
    setWorkoutToEdit(null);
  };

  const handleDeleteWorkout = (
    id: string,
    mode: 'single' | 'future' = 'single',
  ) => {
    const workout = projectedWorkouts.find((w) => w.id === id);
    if (!workout) return;

    setFormData((prev) => {
      let workouts = prev.workouts || [];
      if (mode === 'future' && workout.recurrenceId) {
        workouts = workouts.filter((w) => {
          if (w.recurrenceId !== workout.recurrenceId) return true;
          // Compare dummy dates
          const wStart = addWeeks(DUMMY_BASE_DATE, w.weekNumber - 1);
          const wDaysToAdd = w.dayOfWeek - 1;
          const wDate = addDays(wStart, wDaysToAdd);

          const tStart = addWeeks(DUMMY_BASE_DATE, workout.weekNumber - 1);
          const tDaysToAdd = workout.dayOfWeek - 1;
          const tDate = addDays(tStart, tDaysToAdd);

          return wDate < tDate;
        });
      } else {
        workouts = workouts.filter((w) => w.id !== id);
      }
      return { ...prev, workouts };
    });
    setWorkoutToEdit(null);
  };

  const handleSaveNote = (n: Partial<Note>) => {
    const { weekNumber, dayOfWeek } = getCoordinatesFromDate(n.date!);
    const tn: PlanTemplateNote = {
      id: n.id || crypto.randomUUID(),
      templateId: formData.id || '',
      weekNumber,
      dayOfWeek,
      content: n.content!,
      order: n.order || Date.now(),
    };

    setFormData((prev) => {
      const existing = (prev.notes || []).findIndex((x) => x.id === tn.id);
      const newNotes = [...(prev.notes || [])];
      if (existing >= 0) {
        newNotes[existing] = tn;
      } else {
        newNotes.push(tn);
      }
      return { ...prev, notes: newNotes };
    });
    setNoteToEdit(null);
  };

  const handleDeleteNote = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      notes: (prev.notes || []).filter((n) => n.id !== id),
    }));
    setNoteToEdit(null);
  };

  const handleSave = () => {
    if (formData.id) {
      updateTemplate.mutate(formData as PlanTemplate, {
        onSuccess: () => {
          toast.success('Plan updated successfully');
          setInitialStateString(getPlanStateString(formData));
        },
        onError: (err) => {
          console.error('Failed to update plan:', err);
          toast.error('Failed to update plan. Please try again.');
        },
      });
    } else {
      createTemplate.mutate(formData, {
        onSuccess: (newPlan) => {
          toast.success('Plan created successfully');
          if (newPlan?.id) {
            const updated = { ...formData, id: newPlan.id };
            setFormData(updated);
            setInitialStateString(getPlanStateString(updated));
          } else {
            setInitialStateString(getPlanStateString(formData));
          }
        },
        onError: (err) => {
          console.error('Failed to create plan:', err);
          toast.error('Failed to create plan. Please try again.');
        },
      });
    }
  };

  const handleBack = () => {
    if (isDirty) {
      setShowDiscardConfirm(true);
    } else {
      onClose();
    }
  };

  const isPending = createTemplate.isPending || updateTemplate.isPending;

  return (
    <div className="container-fixed pb-10 lg:pb-8">
      <div className="flex flex-col space-y-4">
        {/* Header - Mimicking CalendarView */}
        <header className="z-[70] flex w-full shrink-0 flex-col items-center justify-between gap-3 overflow-hidden px-4 lg:flex-row lg:px-4">
          <div className="flex w-full shrink-0 items-center justify-between gap-2 lg:w-auto lg:gap-4">
            <div className="flex items-center gap-1 lg:gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleBack}
                className="-ml-2 h-10 w-10 bg-muted/20 text-muted-foreground hover:text-foreground hover:bg-muted/50 border-muted-foreground/20"
                aria-label="Back to plans"
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>
              <Input
                value={formData.name || ''}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Plan Name..."
                className="h-auto border-none bg-transparent p-0 shadow-none hover:bg-muted/50 focus-visible:ring-0 text-xl font-black lowercase tracking-tighter lg:text-3xl text-left min-w-0 flex-1 lg:min-w-[300px]"
              />
              <div className="bg-muted flex shrink-0 items-center gap-1 rounded-xl border p-1 shadow-sm ml-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setFormData((p) => ({
                      ...p,
                      totalWeeks: Math.max(1, (p.totalWeeks || 4) - 1),
                    }))
                  }
                  className="h-9 w-9"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <div className="px-3 text-sm font-black uppercase whitespace-nowrap">
                  {formData.totalWeeks} weeks
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setFormData((p) => ({
                      ...p,
                      totalWeeks: Math.min(52, (p.totalWeeks || 4) + 1),
                    }))
                  }
                  className="h-9 w-9"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex w-full justify-between gap-1.5 lg:w-auto lg:justify-end lg:gap-3">
            <div className="flex items-center gap-1 lg:gap-1.5">
              <Button
                variant={showChart ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setShowChart(!showChart)}
                className="gap-2 px-3 lg:px-4"
              >
                <BarChart3 className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">
                  Analytics
                </span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLibrary(!showLibrary)}
                className="gap-2 px-3 lg:px-4"
              >
                <BookOpen className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">
                  Library
                </span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 border lg:border-none"
                    aria-label="More actions"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={() => setShowSettings(true)}
                    className="gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    <span className="font-bold lowercase">settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setShowImportDialog(true)}
                    className="gap-2"
                  >
                    <FileUp className="h-4 w-4" />
                    <span className="font-bold lowercase">import ai</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setShowExportDialog(true)}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    <span className="font-bold lowercase">export csv</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setShowBulkDeleteDialog(true)}
                    className="gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="font-bold lowercase">bulk delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="mx-1 h-6 w-px bg-border hidden lg:block" />

              <Button
                onClick={handleSave}
                disabled={isPending || !formData.name}
                className={`gap-2 font-black lowercase h-9 shadow-sm transition-all ${
                  isDirty
                    ? 'bg-primary hover:bg-primary/90 text-primary-foreground ring-4 ring-primary/10'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                save
              </Button>
            </div>
          </div>
        </header>

        {/* Calendar Grid Area */}
        <div className="relative flex flex-col gap-4 lg:flex-row">
          <div className="flex-1 flex flex-col min-w-0 gap-4">
            <CalendarGrid
              weeks={weeks}
              workouts={projectedWorkouts}
              notes={projectedNotes}
              events={[]}
              goals={[]}
              sportMap={sportMap}
              userSettingsMap={userSettingsMap}
              selectedDate={selectedDate}
              displayMonth={DUMMY_BASE_DATE.getMonth()}
              onSelect={setSelectedDate}
              onDragOver={handleDragOverCell}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onDragStart={(e, item) => handleDragStart(e, item)}
              onDragEnd={handleDragEnd}
              onEventDragStart={() => {}}
              onEditWorkout={setWorkoutToEdit}
              onEditNote={setNoteToEdit}
              onEditEvent={() => {}}
              isDraggingId={isDraggingId}
              dragOverInfo={dragOverInfo}
              hideDates={true}
            />

            <Sheet open={showChart} onOpenChange={setShowChart}>
              <SheetContent
                side="right"
                className="sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl p-0 overflow-hidden flex flex-col"
              >
                <SheetHeader className="px-6 py-5 border-b shrink-0 bg-muted/5">
                  <SheetTitle className="text-xl font-black lowercase tracking-tighter flex items-center gap-2.5">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Training Plan Analytics
                  </SheetTitle>
                  <SheetDescription className="sr-only">
                    Visualize volume and performance progression for this
                    training plan.
                  </SheetDescription>
                </SheetHeader>

                <div className="flex-1 min-h-0 overflow-y-auto p-6 bg-muted/5">
                  <VolumeChartWidget
                    workouts={projectedWorkouts}
                    events={[]}
                    notes={projectedNotes}
                    goals={[]}
                    sportTypes={sportTypes}
                    initialPivotDate={addWeeks(DUMMY_BASE_DATE, 6)}
                    title="Plan Load Progression"
                    templateMode={true}
                    totalWeeks={formData.totalWeeks}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Library Drawer - Integrated exactly like calendar */}
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

        {/* Floating Add Button */}
        <Button
          variant="primary"
          shape="circle"
          onClick={() =>
            setWorkoutToEdit({ date: selectedDate, order: Date.now() })
          }
          className="fixed bottom-8 right-8 z-[90] h-14 w-14 shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-shadow"
        >
          <Plus className="h-6 w-6" />
        </Button>

        {/* Sub-Dialogs outside to prevent focus-trap loops */}
        {workoutToEdit && (
          <WorkoutDialog
            workout={workoutToEdit}
            sportTypes={sportTypes}
            userSettingsMap={userSettingsMap}
            existingWorkouts={projectedWorkouts}
            onSave={handleSaveWorkout}
            onSaveBulk={handleSaveBulk}
            onDelete={handleDeleteWorkout}
            onSwitchToNote={() => {
              const d = workoutToEdit.date;
              setWorkoutToEdit(null);
              setNoteToEdit({ date: d });
            }}
            onCancel={() => setWorkoutToEdit(null)}
            hideDate={true}
            isTemplateMode={true}
            totalWeeks={formData.totalWeeks}
          />
        )}
        {noteToEdit && (
          <NoteDialog
            note={noteToEdit}
            onSave={handleSaveNote}
            onDelete={(id) => handleDeleteNote(id)}
            onCancel={() => setNoteToEdit(null)}
            hideDate={true}
          />
        )}

        {/* Settings Dialog */}
        {showSettings && (
          <TemplateSettingsDialog
            formData={formData}
            setFormData={setFormData}
            isDeveloper={isDeveloper}
            onClose={() => setShowSettings(false)}
          />
        )}

        <ImportDialog
          open={showImportDialog}
          onOpenChange={setShowImportDialog}
          onImport={handleImportToTemplate}
          templateMode={true}
        />

        <ExportDialog
          open={showExportDialog}
          onOpenChange={setShowExportDialog}
          sportTypes={sportTypes}
          template={formData}
        />

        <BulkDeleteDialog
          open={showBulkDeleteDialog}
          onOpenChange={setShowBulkDeleteDialog}
          onBulkDelete={handleBulkDeleteFromTemplate}
          isTemplateMode={true}
          totalWeeks={formData.totalWeeks}
        />

        <AlertDialog
          open={showDiscardConfirm}
          onOpenChange={setShowDiscardConfirm}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-black lowercase tracking-tighter">
                unsaved changes
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm">
                you have unsaved modifications to this plan. are you sure you
                want to discard them and go back?
              </AlertDialogDescription>{' '}
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="font-bold lowercase">
                keep editing
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={onClose}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-black lowercase"
              >
                discard changes
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

// ─── Helper: Settings Dialog ──────────────────────────────────
interface TemplateSettingsDialogProps {
  formData: Partial<PlanTemplate>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<PlanTemplate>>>;
  isDeveloper: boolean;
  onClose: () => void;
}

function TemplateSettingsDialog({
  formData,
  setFormData,
  isDeveloper,
  onClose: onSettingsClose,
}: TemplateSettingsDialogProps) {
  return (
    <Dialog open={true} onOpenChange={onSettingsClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-black lowercase tracking-tighter">
            <Settings className="h-5 w-5 text-primary" />
            Plan Settings
          </DialogTitle>
          <DialogDescription className="text-xs">
            Configure additional details for this training plan.
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-6 py-4">
          <div className="space-y-1.5">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Description
            </Label>
            <Textarea
              value={formData.description || ''}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="describe the purpose and progression of this plan..."
              className="min-h-[120px] text-xs resize-none font-medium"
            />
          </div>

          {isDeveloper && (
            <div className="flex items-center justify-between rounded-xl bg-amber-50/50 p-4 border border-amber-100">
              <div className="space-y-0.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-amber-900">
                  System Plan
                </Label>
                <p className="text-[9px] text-amber-700 leading-tight">
                  Visible to all users
                </p>
              </div>
              <Switch
                checked={formData.is_system}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_system: checked })
                }
              />
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button onClick={onSettingsClose} className="w-full font-bold">
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
