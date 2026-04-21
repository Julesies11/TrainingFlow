import React, { useMemo, useRef, useState } from 'react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import { BookOpen, Plus } from 'lucide-react';
import { Event, LibraryWorkout, Workout } from '@/types/training';
import {
  useCreateLibraryWorkout,
  useCreateWorkout,
  useCreateWorkoutsBulk,
  useDeleteEvent,
  useDeleteLibraryWorkout,
  useDeleteWorkout,
  useEvents,
  useLibrary,
  useSportTypes,
  useUpdateEvent,
  useUpdateLibraryWorkout,
  useUpdateWorkout,
  useUserSportSettings,
  useWorkouts,
} from '@/hooks/use-training-data';
import { formatDateToLocalISO } from '@/services/training/calendar.utils';
import {
  buildSportMap,
  buildUserSettingsMap,
  getEffortColor,
} from '@/services/training/effort-colors';
import { Button } from '@/components/ui/button';
import { EventDialog } from './components/event-dialog';
import { LibraryDrawer } from './components/library-drawer';
import { WorkoutDialog } from './components/workout-dialog';

export function CalendarViewFC() {
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

  // State management
  const [selectedDate, setSelectedDate] = useState<string>(
    formatDateToLocalISO(new Date()),
  );
  const [workoutToEdit, setWorkoutToEdit] = useState<Partial<Workout> | null>(
    null,
  );
  const [eventWithSegmentsToEdit, setEventWithSegmentsToEdit] =
    useState<Event | null>(null);
  const [showLibrary, setShowLibrary] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const calendarRef = useRef<any>(null);

  // Build maps
  const sportMap = useMemo(() => buildSportMap(sportTypes), [sportTypes]);
  const userSettingsMap = useMemo(
    () => buildUserSettingsMap(userSportSettings),
    [userSportSettings],
  );

  // Transform workouts and events to FullCalendar events
  const calendarEvents = useMemo(() => {
    const eventsList: {
      id: string;
      title: string;
      date: string;
      backgroundColor: string;
      borderColor: string;
      textColor: string;
      display: string;
      extendedProps: {
        type: 'workout' | 'event';
        data: Workout | Event;
      };
    }[] = [];

    // Add workouts
    workouts.forEach((w) => {
      const sportColor = getEffortColor(
        sportMap.get(w.sportTypeId || 'unknown'),
        2,
        userSettingsMap.get(w.sportTypeId || 'unknown'),
      );

      eventsList.push({
        id: `workout-${w.id}`,
        title: w.title || 'Untitled Workout',
        date: w.date,
        backgroundColor: sportColor,
        borderColor: sportColor,
        textColor: '#fff',
        display: 'block',
        extendedProps: {
          type: 'workout',
          data: w,
        },
      });
    });

    // Add events
    events.forEach((e) => {
      eventsList.push({
        id: `event-${e.id}`,
        title: e.title || 'Untitled Event',
        date: e.date,
        backgroundColor: '#8b5cf6',
        borderColor: '#8b5cf6',
        textColor: '#fff',
        display: 'block',
        extendedProps: {
          type: 'event',
          data: e,
        },
      });
    });

    return eventsList;
  }, [workouts, events, sportMap, userSettingsMap]);

  // Save handlers
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

  // Handle date click
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDateClick = (info: any) => {
    setSelectedDate(info.dateStr);
  };

  // Handle event click
  const handleEventClick = (info: {
    event: { extendedProps: { type: string; data: Workout | Event } };
  }) => {
    const { extendedProps } = info.event;
    if (extendedProps.type === 'workout') {
      setWorkoutToEdit(extendedProps.data as Workout);
    } else if (extendedProps.type === 'event') {
      setEventWithSegmentsToEdit(extendedProps.data as Event);
    }
  };

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
              Training Calendar
            </h2>
          </div>

          <div className="flex w-full justify-end gap-1.5 lg:w-auto lg:justify-end lg:gap-3">
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
          className="relative flex min-h-0 flex-1 flex-col gap-4 overflow-hidden lg:flex-row"
          style={{ touchAction: 'pan-y' }}
        >
          <div className="bg-card relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border shadow-sm p-4">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: '',
              }}
              events={calendarEvents}
              dateClick={handleDateClick}
              eventClick={handleEventClick}
              height="100%"
              contentHeight="auto"
              dayMaxEvents={3}
              dayMaxEventRows={3}
              eventDisplay="block"
            />
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
          className="fixed bottom-20 right-6 z-[90] h-14 w-14 shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-shadow lg:bottom-8 lg:right-8"
        >
          <Plus className="h-6 w-6" />
        </Button>

        {/* Event Dialog */}
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
