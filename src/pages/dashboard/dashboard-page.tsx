import { lazy, Suspense, useCallback, useMemo, useState } from 'react';
import { addMonths, format, parseISO, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
import { Label } from '@/components/ui/label';
import { Switch, SwitchWrapper } from '@/components/ui/switch';
import { EventDialog } from '../training/_shared/components/event-dialog';
import { WorkoutDialog } from '../training/calendar/components/workout-dialog';
import { DailySessions } from './components/daily-sessions';
import { SportDistribution } from './components/sport-distribution';
import { UpcomingEvents } from './components/upcoming-events';

// PHASE 4: Lazy Loading
const VolumeChart = lazy(() =>
  import('./components/volume-chart').then((m) => ({ default: m.VolumeChart })),
);

type ProgressMetric = 'distance' | 'duration';
type ViewType = 'week' | 'month';

export function DashboardPage() {
  const [pivotDate, setPivotDate] = useState(new Date());

  // PHASE 1: Range-Based Fetching
  const dateRange = useMemo(() => {
    return {
      from: format(subMonths(pivotDate, 6), 'yyyy-MM-dd'),
      to: format(addMonths(pivotDate, 12), 'yyyy-MM-dd'),
    };
  }, [pivotDate]);

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

  const [metric, setMetric] = useState<ProgressMetric>('duration');
  const [sport, setSport] = useState<string | 'All'>('All');
  const [viewType, setViewType] = useState<ViewType>('week');
  const [showEvents, setShowEvents] = useState(true);
  const [showNotes, setShowNotes] = useState(true);
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
  const handleShift = useCallback(
    (direction: 'prev' | 'next') => {
      const newPivot = new Date(pivotDate);
      if (viewType === 'week') {
        newPivot.setDate(newPivot.getDate() + (direction === 'next' ? 7 : -7));
      } else {
        newPivot.setMonth(
          newPivot.getMonth() + (direction === 'next' ? 1 : -1),
        );
      }
      setPivotDate(newPivot);
    },
    [pivotDate, viewType],
  );

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
          <div className="bg-card overflow-hidden rounded-2xl border shadow-sm w-full">
            <div className="border-b bg-muted/30 px-5 py-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <h3 className="text-base md:text-lg font-black lowercase tracking-tight">
                  volume summary
                </h3>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1 rounded-lg border bg-background p-0.5">
                    <button
                      onClick={() => setMetric('duration')}
                      className={`px-2 py-1 text-xs font-bold lowercase rounded transition-colors ${
                        metric === 'duration'
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      duration
                    </button>
                    <button
                      onClick={() => setMetric('distance')}
                      className={`px-2 py-1 text-xs font-bold lowercase rounded transition-colors ${
                        metric === 'distance'
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      distance
                    </button>
                  </div>
                  <div className="flex items-center gap-1 rounded-lg border bg-background p-0.5">
                    <button
                      onClick={() => setSport('All')}
                      className={`px-2 py-1 text-xs font-bold lowercase rounded transition-colors ${
                        sport === 'All'
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      all
                    </button>
                    {sportTypes.map((st) => (
                      <button
                        key={st.id}
                        onClick={() => setSport(st.name)}
                        className={`px-2 py-1 text-xs font-bold lowercase rounded transition-colors ${
                          sport === st.name
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {st.name.toLowerCase()}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 rounded-lg border bg-background p-0.5">
                    <button
                      onClick={() => setViewType('week')}
                      className={`px-2 py-1 text-xs font-bold lowercase rounded transition-colors ${
                        viewType === 'week'
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      week
                    </button>
                    <button
                      onClick={() => setViewType('month')}
                      className={`px-2 py-1 text-xs font-bold lowercase rounded transition-colors ${
                        viewType === 'month'
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      month
                    </button>
                  </div>
                  <div className="flex items-center gap-1 mr-auto md:mr-0">
                    <button
                      onClick={() => handleShift('prev')}
                      className="p-1 rounded hover:bg-muted transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleShift('next')}
                      className="p-1 rounded hover:bg-muted transition-colors"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 ml-auto">
                    <div className="flex items-center gap-3 bg-muted/50 rounded-lg border px-3 py-1.5 shadow-inner">
                      <div className="flex items-center gap-2 pr-3 border-r border-muted-foreground/20">
                        <Label
                          htmlFor="notes-toggle"
                          className="text-[10px] font-black uppercase tracking-widest text-gray-600 cursor-pointer"
                        >
                          notes
                        </Label>
                        <SwitchWrapper>
                          <Switch
                            id="notes-toggle"
                            checked={showNotes}
                            onCheckedChange={setShowNotes}
                            size="sm"
                          />
                        </SwitchWrapper>
                      </div>

                      <div className="flex items-center gap-2">
                        <Label
                          htmlFor="events-toggle"
                          className="text-[10px] font-black uppercase tracking-widest text-primary cursor-pointer"
                        >
                          events
                        </Label>
                        <SwitchWrapper>
                          <Switch
                            id="events-toggle"
                            checked={showEvents}
                            onCheckedChange={setShowEvents}
                            size="sm"
                          />
                        </SwitchWrapper>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-5">
              <Suspense
                fallback={
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground text-xs lowercase">
                    loading chart...
                  </div>
                }
              >
                <VolumeChart
                  workouts={workouts}
                  events={events}
                  notes={notes}
                  goals={goals}
                  sportTypes={sportTypes}
                  metric={metric}
                  sport={sport}
                  viewType={viewType}
                  pivotDate={pivotDate}
                  showEvents={showEvents}
                  showNotes={showNotes}
                />
              </Suspense>
            </div>
          </div>

          {/* Secondary Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
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
