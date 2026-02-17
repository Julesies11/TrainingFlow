import { useMemo, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useWorkouts, useEvents, useSportTypes, useUserSportSettings, useDeleteWorkout, useDeleteEvent } from '@/hooks/use-training-data';
import { Workout, Event } from '@/types/training';
import { buildUserSettingsMap, buildSportMap } from '@/services/training/effort-colors';
import { format, parseISO } from 'date-fns';
import { VolumeChart } from './components/volume-chart';
import { SportDistribution } from './components/sport-distribution';
import { TodaysSession } from './components/todays-session';
import { UpcomingEvents } from './components/upcoming-events';
import { WorkoutDialog } from '../training/calendar/components/workout-dialog';
import { EventDialog } from '../training/events/components/event-dialog';

type ProgressMetric = 'distance' | 'duration';
type ViewType = 'week' | 'month';
type SportType = 'Swim' | 'Bike' | 'Run' | 'Strength';

export function DashboardPage() {
  const { data: workouts = [], isLoading: loadingWorkouts } = useWorkouts();
  const { data: events = [], isLoading: loadingEvents } = useEvents();
  const { data: sportTypes = [] } = useSportTypes();
  const { data: userSettings = [] } = useUserSportSettings();
  const deleteWorkout = useDeleteWorkout();
  const deleteEvent = useDeleteEvent();

  const [workoutToEdit, setWorkoutToEdit] = useState<Workout | null>(null);
  const [eventToEdit, setEventToEdit] = useState<Event | null>(null);

  const [metric, setMetric] = useState<ProgressMetric>('duration');
  const [sport, setSport] = useState<SportType | 'All'>('All');
  const [viewType, setViewType] = useState<ViewType>('week');
  const [pivotDate, setPivotDate] = useState(new Date());
  const [distViewType, setDistViewType] = useState<ViewType>('week');
  const [distPivotDate, setDistPivotDate] = useState(new Date());

  const settingsMap = useMemo(() => buildUserSettingsMap(userSettings), [userSettings]);
  const sportMap = useMemo(() => buildSportMap(sportTypes), [sportTypes]);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const todayStr = useMemo(() => format(today, 'yyyy-MM-dd'), [today]);

  const todayWorkout = useMemo(() => {
    return workouts.find(w => w.date === todayStr);
  }, [workouts, todayStr]);

  const upcomingEvents = useMemo(() => {
    return events
      .filter(e => {
        const eventDate = parseISO(e.date);
        return eventDate >= today;
      })
      .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
      .slice(0, 3);
  }, [events, today]);

  const handleShift = useCallback((direction: 'prev' | 'next') => {
    const newPivot = new Date(pivotDate);
    if (viewType === 'week') {
      newPivot.setDate(newPivot.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newPivot.setMonth(newPivot.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setPivotDate(newPivot);
  }, [pivotDate, viewType]);

  const handleDistShift = useCallback((direction: 'prev' | 'next') => {
    const newPivot = new Date(distPivotDate);
    if (distViewType === 'week') {
      newPivot.setDate(newPivot.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newPivot.setMonth(newPivot.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setDistPivotDate(newPivot);
  }, [distPivotDate, distViewType]);

  const isLoading = loadingWorkouts || loadingEvents;

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4.5rem)] items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <>
      <div className="container-fixed">
        <div className="flex flex-col gap-5 lg:gap-7.5 py-5">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-2 md:gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight lowercase">athlete dashboard</h2>
            <p className="text-muted-foreground font-medium text-sm md:text-base lowercase">
              monitoring volume and performance.
            </p>
          </div>
        </header>

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Volume Summary Chart */}
          <div className="bg-card lg:col-span-2 overflow-hidden rounded-2xl border shadow-sm">
            <div className="border-b bg-muted/30 px-5 py-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <h3 className="text-base md:text-lg font-black lowercase tracking-tight">
                  volume summary
                </h3>
                <div className="flex flex-wrap items-center gap-2">
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
                    {(['Swim', 'Bike', 'Run'] as SportType[]).map(s => (
                      <button
                        key={s}
                        onClick={() => setSport(s)}
                        className={`px-2 py-1 text-xs font-bold lowercase rounded transition-colors ${
                          sport === s
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {s.toLowerCase()}
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
                  <div className="flex items-center gap-1">
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
                </div>
              </div>
            </div>
            <div className="p-5">
              <VolumeChart
                workouts={workouts}
                events={events}
                metric={metric}
                sport={sport}
                viewType={viewType}
                pivotDate={pivotDate}
              />
            </div>
          </div>

          {/* Sport Distribution */}
          <SportDistribution
            workouts={workouts}
            events={events}
            distViewType={distViewType}
            distPivotDate={distPivotDate}
            setDistViewType={setDistViewType}
            onShift={handleDistShift}
          />
        </div>

        {/* Today's Session and Upcoming Events */}
        <div className="grid gap-6 lg:grid-cols-2">
          <TodaysSession
            workout={todayWorkout}
            sportMap={sportMap}
            settingsMap={settingsMap}
            onEdit={(workout) => setWorkoutToEdit(workout)}
            onDelete={(workout) => {
              if (confirm(`Delete workout "${workout.title || workout.sportName}"?`)) {
                deleteWorkout.mutate(workout.id);
              }
            }}
          />
          <UpcomingEvents 
            events={upcomingEvents} 
            today={today} 
            sportTypes={sportTypes}
            userSettingsMap={settingsMap}
            onEdit={(event) => setEventToEdit(event)}
            onDelete={(event) => {
              if (confirm(`Delete event "${event.title}"?`)) {
                deleteEvent.mutate(event.id);
              }
            }}
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
        onSave={() => setWorkoutToEdit(null)}
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
        onSave={() => setEventToEdit(null)}
        onCancel={() => setEventToEdit(null)}
      />
    )}
    </>
  );
}
