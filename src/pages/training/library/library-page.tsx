import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Trash2,
  Pencil,
  GripVertical,
  ChevronLeft,
  ChevronRight,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  useLibrary,
  useCreateLibraryWorkout,
  useUpdateLibraryWorkout,
  useDeleteLibraryWorkout,
  useCreateWorkout,
  useProfile,
} from '@/hooks/use-training-data';
import { LibraryWorkout, SportType, IntensitySettings } from '@/types/training';
import {
  formatMinsShort,
  getContrastColor,
  getWorkoutPace,
  formatDateToLocalISO,
  getMonday,
  MONTH_NAMES,
  DAY_HEADERS,
} from '@/services/training/calendar.utils';
import { LibraryTemplateDialog } from './components/library-template-dialog';

const SPORTS: SportType[] = ['Swim', 'Bike', 'Run', 'Strength'];
const ALL_FILTER = 'All';

export function LibraryPage() {
  const { data: library = [], isLoading } = useLibrary();
  const { data: profile } = useProfile();
  const createLibrary = useCreateLibraryWorkout();
  const updateLibrary = useUpdateLibraryWorkout();
  const deleteLibrary = useDeleteLibraryWorkout();
  const createWorkout = useCreateWorkout();

  const intensitySettings = profile?.intensitySettings as
    | IntensitySettings
    | undefined;

  // Filter & search state
  const [sportFilter, setSportFilter] = useState<string>(ALL_FILTER);
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog state
  const [templateToEdit, setTemplateToEdit] = useState<
    Partial<LibraryWorkout> | null
  >(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Mini calendar state
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [draggedTemplate, setDraggedTemplate] = useState<LibraryWorkout | null>(
    null,
  );
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);

  // Filtered library
  const filteredLibrary = useMemo(() => {
    let items = library;
    if (sportFilter !== ALL_FILTER) {
      items = items.filter((t) => t.sport === sportFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (t) =>
          t.title?.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          t.sport.toLowerCase().includes(q) ||
          t.workoutType?.toLowerCase().includes(q),
      );
    }
    return items;
  }, [library, sportFilter, searchQuery]);

  // Sport counts
  const sportCounts = useMemo(() => {
    const counts: Record<string, number> = { [ALL_FILTER]: library.length };
    SPORTS.forEach((s) => {
      counts[s] = library.filter((t) => t.sport === s).length;
    });
    return counts;
  }, [library]);

  // Mini calendar data
  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Start from Monday
    const startDate = getMonday(firstDay);
    const days: Date[] = [];

    const current = new Date(startDate);
    // Fill 6 weeks
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return { days, month, year, lastDay: lastDay.getDate() };
  }, [calendarMonth]);

  const handleCalendarDrop = (dateStr: string) => {
    if (!draggedTemplate) return;
    createWorkout.mutate({
      sport: draggedTemplate.sport,
      workoutType: draggedTemplate.workoutType,
      title: draggedTemplate.title,
      description: draggedTemplate.description,
      plannedDurationMinutes: draggedTemplate.plannedDurationMinutes,
      plannedDistanceKilometers: draggedTemplate.plannedDistanceKilometers,
      effortLevel: draggedTemplate.effortLevel,
      isKeyWorkout: draggedTemplate.isKeyWorkout,
      intervals: draggedTemplate.intervals,
      date: dateStr,
      isCompleted: false,
      order: Date.now(),
    });
    setDraggedTemplate(null);
    setDragOverDate(null);
  };

  const handleSaveTemplate = (template: Partial<LibraryWorkout>) => {
    if (template.id) {
      updateLibrary.mutate(template as LibraryWorkout);
    } else {
      createLibrary.mutate(template);
    }
    setTemplateToEdit(null);
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4.5rem)] items-center justify-center">
        <div className="text-muted-foreground text-sm">
          Loading library...
        </div>
      </div>
    );
  }

  return (
    <div className="container-fixed">
      <div className="flex h-[calc(100vh-4.5rem)] flex-col gap-4 overflow-hidden lg:h-[calc(100vh-5rem)]">
        {/* Header */}
        <header className="flex shrink-0 flex-col gap-3 px-4 pt-2 lg:flex-row lg:items-center lg:justify-between lg:px-4">
          <div>
            <h1 className="text-2xl font-black lowercase tracking-tighter lg:text-3xl">
              workout library
            </h1>
            <p className="text-muted-foreground text-xs">
              {library.length} template{library.length !== 1 ? 's' : ''} · drag
              to mini calendar to schedule
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 lg:w-64">
              <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-sm"
              />
            </div>
            <Button
              onClick={() =>
                setTemplateToEdit({
                  sport: 'Bike',
                  effortLevel: 2,
                  plannedDurationMinutes: 60,
                  plannedDistanceKilometers: 0,
                  isKeyWorkout: false,
                  intervals: [],
                })
              }
              size="sm"
              className="gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">new template</span>
            </Button>
          </div>
        </header>

        {/* Sport filter tabs */}
        <div className="flex shrink-0 gap-1 overflow-x-auto px-4">
          {[ALL_FILTER, ...SPORTS].map((sport) => (
            <Button
              key={sport}
              variant={sportFilter === sport ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSportFilter(sport)}
              className="shrink-0 gap-1.5 text-[10px] font-black lowercase"
            >
              {sport}
              <span className="bg-background/20 rounded-full px-1.5 py-0.5 text-[9px]">
                {sportCounts[sport] || 0}
              </span>
            </Button>
          ))}
        </div>

        {/* Main content: grid + mini calendar */}
        <div className="flex min-h-0 flex-1 gap-4 overflow-hidden px-4 pb-4">
          {/* Template grid */}
          <div className="flex-1 overflow-y-auto pr-1">
            {filteredLibrary.length === 0 ? (
              <div className="flex h-60 flex-col items-center justify-center gap-3">
                <div className="text-muted-foreground text-sm">
                  {library.length === 0
                    ? 'No templates yet. Create your first workout template!'
                    : 'No templates match your filter.'}
                </div>
                {library.length === 0 && (
                  <Button
                    size="sm"
                    onClick={() =>
                      setTemplateToEdit({
                        sport: 'Bike',
                        effortLevel: 2,
                        plannedDurationMinutes: 60,
                        plannedDistanceKilometers: 0,
                        isKeyWorkout: false,
                        intervals: [],
                      })
                    }
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    create template
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {filteredLibrary.map((template) => {
                  const bg =
                    intensitySettings?.[template.sport]?.[
                      template.effortLevel || 1
                    ]?.hexColor || '#3b82f6';
                  const dur = template.plannedDurationMinutes || 0;
                  const dist = template.plannedDistanceKilometers || 0;
                  const pace =
                    dur > 0 && dist > 0 && template.sport !== 'Strength'
                      ? getWorkoutPace(template.sport, dur, dist)
                      : '';

                  return (
                    <div
                      key={template.id}
                      draggable="true"
                      onDragStart={() => setDraggedTemplate(template)}
                      onDragEnd={() => {
                        setDraggedTemplate(null);
                        setDragOverDate(null);
                      }}
                      className={`group relative cursor-grab overflow-hidden rounded-xl shadow-sm transition-all hover:shadow-lg active:scale-[0.98] active:cursor-grabbing ${getContrastColor(bg)} ${template.isKeyWorkout ? 'border-l-4 border-l-white/80' : ''}`}
                      style={{ backgroundColor: bg }}
                    >
                      {/* Drag handle */}
                      <div className="absolute left-1 top-1/2 -translate-y-1/2 opacity-30 group-hover:opacity-60">
                        <GripVertical className="h-4 w-4" />
                      </div>

                      {/* Key workout star */}
                      {template.isKeyWorkout && (
                        <Star className="absolute right-2 top-2 h-3.5 w-3.5 fill-white/90 text-white/90 drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]" />
                      )}

                      {/* Content */}
                      <div className="p-4 pl-6">
                        <div className="text-[9px] font-black uppercase opacity-70">
                          {template.sport}
                          {template.workoutType
                            ? ` · ${template.workoutType}`
                            : ''}
                        </div>
                        <div className="mt-0.5 truncate text-sm font-bold">
                          {template.title || 'Untitled'}
                        </div>
                        {template.description && (
                          <div className="mt-1 line-clamp-2 text-[11px] opacity-70">
                            {template.description}
                          </div>
                        )}
                        <div className="mt-2 flex items-center gap-2 text-[10px] font-semibold opacity-80">
                          <span>{formatMinsShort(dur)}</span>
                          {dist > 0 && template.sport !== 'Strength' && (
                            <span>· {dist}km</span>
                          )}
                          {pace && <span>· {pace}</span>}
                          <span className="opacity-60">
                            · L{template.effortLevel}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="absolute right-2 bottom-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setTemplateToEdit(template);
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow transition-all hover:scale-110 hover:bg-white dark:bg-black/70 dark:text-white dark:hover:bg-black/90"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmId(template.id);
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-red-600 shadow transition-all hover:scale-110 hover:bg-white dark:bg-black/70 dark:text-red-400 dark:hover:bg-black/90"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Delete confirmation overlay */}
                      {deleteConfirmId === template.id && (
                        <div
                          className="absolute inset-0 flex items-center justify-center gap-2 bg-black/70 backdrop-blur-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              deleteLibrary.mutate(template.id);
                              setDeleteConfirmId(null);
                            }}
                          >
                            delete
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-white/30 text-white hover:bg-white/20"
                            onClick={() => setDeleteConfirmId(null)}
                          >
                            cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Mini calendar sidebar */}
          <div className="hidden w-72 shrink-0 flex-col overflow-hidden rounded-2xl border lg:flex">
            {/* Calendar header */}
            <div className="bg-muted/30 flex items-center justify-between border-b px-3 py-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() =>
                  setCalendarMonth(
                    new Date(
                      calendarMonth.getFullYear(),
                      calendarMonth.getMonth() - 1,
                      1,
                    ),
                  )
                }
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs font-black lowercase tracking-tight">
                {MONTH_NAMES[calendarMonth.getMonth()]}{' '}
                {calendarMonth.getFullYear()}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() =>
                  setCalendarMonth(
                    new Date(
                      calendarMonth.getFullYear(),
                      calendarMonth.getMonth() + 1,
                      1,
                    ),
                  )
                }
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 border-b">
              {DAY_HEADERS.map((d) => (
                <div
                  key={d}
                  className="text-muted-foreground py-1 text-center text-[9px] font-black uppercase"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid flex-1 grid-cols-7">
              {calendarDays.days.map((day, idx) => {
                const dateStr = formatDateToLocalISO(day);
                const isCurrentMonth =
                  day.getMonth() === calendarDays.month;
                const isToday =
                  formatDateToLocalISO(new Date()) === dateStr;
                const isDragOver = dragOverDate === dateStr;

                return (
                  <div
                    key={idx}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOverDate(dateStr);
                    }}
                    onDragLeave={() => setDragOverDate(null)}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleCalendarDrop(dateStr);
                    }}
                    className={`flex h-9 items-center justify-center border-b border-r text-[10px] font-bold transition-all
                      ${!isCurrentMonth ? 'text-muted-foreground/30' : 'text-foreground'}
                      ${isToday ? 'bg-primary/10 text-primary font-black' : ''}
                      ${isDragOver && draggedTemplate ? 'bg-primary/20 ring-1 ring-inset ring-primary scale-110 z-10 rounded-lg shadow-lg' : ''}
                      ${draggedTemplate ? 'cursor-copy' : ''}`}
                  >
                    {day.getDate()}
                  </div>
                );
              })}
            </div>

            {/* Drop hint */}
            <div className="bg-muted/30 border-t px-3 py-2">
              <p className="text-muted-foreground text-center text-[10px] font-semibold">
                {draggedTemplate
                  ? `drop "${draggedTemplate.title || 'template'}" on a date`
                  : 'drag a template here to schedule it'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Template dialog */}
      {templateToEdit && (
        <LibraryTemplateDialog
          template={templateToEdit}
          intensitySettings={intensitySettings}
          onSave={handleSaveTemplate}
          onCancel={() => setTemplateToEdit(null)}
        />
      )}
    </div>
  );
}
