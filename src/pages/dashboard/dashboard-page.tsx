import { useCallback, useMemo, useState } from 'react';
import { addMonths, format, parseISO, subMonths } from 'date-fns';
import { Event, Workout } from '@/types/training';
import {
  useDeleteEvent,
  useDeleteWorkout,
  useEvents,
  useGoals,
  useNotes,
  useSportTypes,
  useUpdateEvent,
  useUpdateWorkout,
  useUserSportSettings,
  useWorkouts,
} from '@/hooks/use-training-data';
import {
  buildSportMap,
  buildUserSettingsMap,
} from '@/services/training/effort-colors';
import { EventDialog } from '../training/_shared/components/event-dialog';
import { VolumeChartWidget } from '../training/_shared/components/volume-chart-widget';
import { WorkoutDialog } from '../training/calendar/components/workout-dialog';
import { DailySessions } from './components/daily-sessions';
import { EffortDistribution } from './components/effort-distribution';
import { SportDistribution } from './components/sport-distribution';
import { UpcomingEvents } from './components/upcoming-events';

type ViewType = 'week' | 'month';

export function DashboardPage() {
  // PHASE 1: Range-Based Fetching
  // Decouple from pivotDate to prevent full page reloads when shifting the chart.
  // We fetch a wide static range relative to today's date for optimal caching.
  const dateRange = useMemo(() => {
    const today = new Date();
    return {
      from: format(subMonths(today, 12), 'yyyy-MM-dd'),
      to: format(addMonths(today, 24), 'yyyy-MM-dd'),
    };
  }, []); // Static range based on app initialization

  const { data: workouts = [], isLoading: loadingWorkouts } =
    useWorkouts(dateRange);
  const { data: events = [], isLoading: loadingEvents } = useEvents(dateRange);
  const { data: notes = [] } = useNotes(dateRange);
  const { data: goals = [], isLoading: loadingGoals } = useGoals();
  const { data: sportTypes = [], isLoading: loadingSports } = useSportTypes();
  const { data: userSettings = [], isLoading: loadingSettings } =
    useUserSportSettings();
  const updateWorkout = useUpdateWorkout();
  const updateEvent = useUpdateEvent();
  const deleteWorkout = useDeleteWorkout();
  const deleteEvent = useDeleteEvent();

  const [workoutToEdit, setWorkoutToEdit] = useState<Workout | null>(null);
  const [eventToEdit, setEventToEdit] = useState<Event | null>(null);

  const [distViewType, setDistViewType] = useState<ViewType>('week');
  const [distPivotDate, setDistPivotDate] = useState(new Date());

  const settingsMap = useMemo(
    () => buildUserSettingsMap(userSettings),
    [userSettings],
  );
  const sportMap = useMemo(() => buildSportMap(sportTypes), [sportTypes]);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const todayStr = useMemo(() => format(today, 'yyyy-MM-dd'), [today]);
  const tomorrowStr = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    return format(d, 'yyyy-MM-dd');
  }, [today]);

  const todayWorkouts = useMemo(() => {
    return workouts
      .filter((w) => w.date === todayStr)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [workouts, todayStr]);

  const tomorrowWorkouts = useMemo(() => {
    return workouts
      .filter((w) => w.date === tomorrowStr)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [workouts, tomorrowStr]);

  const upcomingEventsData = useMemo(() => {
    return events
      .filter((e) => {
        const eventDate = parseISO(e.date);
        return eventDate >= today;
      })
      .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
      .slice(0, 3);
  }, [events, today]);

  // PHASE 2: Memoized Handlers
  const handleDistShift = useCallback(
    (direction: 'prev' | 'next') => {
      const newPivot = new Date(distPivotDate);
      if (distViewType === 'week') {
        newPivot.setDate(newPivot.getDate() + (direction === 'next' ? 7 : -7));
      } else {
        newPivot.setMonth(
          newPivot.getMonth() + (direction === 'next' ? 1 : -1),
        );
      }
      setDistPivotDate(newPivot);
    },
    [distPivotDate, distViewType],
  );

  const handleEditWorkout = useCallback((workout: Workout) => {
    setWorkoutToEdit(workout);
  }, []);

  const handleDeleteWorkout = useCallback(
    (workout: Workout) => {
      if (confirm(`Delete workout "${workout.title || workout.sportName}"?`)) {
        deleteWorkout.mutate({ id: workout.id, mode: 'single' });
      }
    },
    [deleteWorkout],
  );

  const handleEditEvent = useCallback((event: Event) => {
    setEventToEdit(event);
  }, []);

  const handleDeleteEvent = useCallback(
    (event: Event) => {
      if (confirm(`Delete event "${event.title}"?`)) {
        deleteEvent.mutate(event.id);
      }
    },
    [deleteEvent],
  );

  const isLoading =
    loadingWorkouts ||
    loadingEvents ||
    loadingGoals ||
    loadingSports ||
    loadingSettings;

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-muted-foreground text-sm">
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container-fixed">
        <div className="flex flex-col gap-5 lg:gap-7.5 py-5 px-4">
          {/* Header */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-2 md:gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight lowercase">
                athlete dashboard
              </h2>
              <p className="text-muted-foreground font-medium text-sm md:text-base lowercase">
                monitoring volume and performance.
              </p>
            </div>
          </header>

          {/* Volume Summary Chart - Full Width */}
          <VolumeChartWidget
            workouts={workouts}
            events={events}
            notes={notes}
            goals={goals}
            sportTypes={sportTypes}
          />

          {/* Secondary Grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Sport Distribution */}
            <SportDistribution
              workouts={workouts}
              events={events}
              sportTypes={sportTypes}
              userSettingsMap={settingsMap}
              distViewType={distViewType}
              distPivotDate={distPivotDate}
              setDistViewType={setDistViewType}
              onShift={handleDistShift}
            />

            {/* Effort Distribution */}
            <EffortDistribution
              workouts={workouts}
              events={events}
              distViewType={distViewType}
              distPivotDate={distPivotDate}
              setDistViewType={setDistViewType}
              onShift={handleDistShift}
            />
          </div>

          {/* Today's & Tomorrow's Sessions and Upcoming Events */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="flex flex-col gap-6">
              <DailySessions
                title="today's sessions"
                workouts={todayWorkouts}
                sportMap={sportMap}
                settingsMap={settingsMap}
                onEdit={handleEditWorkout}
                onDelete={handleDeleteWorkout}
              />
              <DailySessions
                title="tomorrow's sessions"
                workouts={tomorrowWorkouts}
                sportMap={sportMap}
                settingsMap={settingsMap}
                onEdit={handleEditWorkout}
                onDelete={handleDeleteWorkout}
              />
            </div>
            <UpcomingEvents
              events={upcomingEventsData}
              today={today}
              sportTypes={sportTypes}
              userSettingsMap={settingsMap}
              onEdit={handleEditEvent}
              onDelete={handleDeleteEvent}
            />
          </div>
        </div>
      </div>

      {/* Workout Dialog */}
      {workoutToEdit && (
        <WorkoutDialog
          workout={workoutToEdit}
          sportTypes={sportTypes}
          userSettingsMap={settingsMap}
          existingWorkouts={workouts}
          onSave={(w) => {
            updateWorkout.mutate(w as Workout);
            setWorkoutToEdit(null);
          }}
          onSaveBulk={() => setWorkoutToEdit(null)}
          onDelete={() => setWorkoutToEdit(null)}
          onCancel={() => setWorkoutToEdit(null)}
        />
      )}

      {/* Event Dialog */}
      {eventToEdit && (
        <EventDialog
          event={eventToEdit}
          sportTypes={sportTypes}
          userSettings={userSettings}
          onSave={(e: Partial<Event>) => {
            updateEvent.mutate(e as Event);
            setEventToEdit(null);
          }}
          onDelete={(id) => {
            deleteEvent.mutate(id);
            setEventToEdit(null);
          }}
          onCancel={() => setEventToEdit(null)}
        />
      )}
    </>
  );
}
