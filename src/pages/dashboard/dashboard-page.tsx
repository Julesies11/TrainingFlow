import { useMemo } from 'react';
import {
  Calendar,
  TrendingUp,
  Target,
  Clock,
  Dumbbell,
  Trophy,
  Activity,
  Zap,
} from 'lucide-react';
import { useWorkouts, useGoals, useEvents, useSportTypes, useUserSportSettings } from '@/hooks/use-training-data';
import { getEffortColor, buildUserSettingsMap, buildSportMap } from '@/services/training/effort-colors';
import { format, startOfWeek, endOfWeek, isWithinInterval, parseISO, differenceInDays, addDays } from 'date-fns';
import { Link } from 'react-router';

export function DashboardPage() {
  const { data: workouts = [], isLoading: loadingWorkouts } = useWorkouts();
  const { data: goals = [], isLoading: loadingGoals } = useGoals();
  const { data: events = [], isLoading: loadingEvents } = useEvents();
  const { data: sportTypes = [] } = useSportTypes();
  const { data: userSettings = [] } = useUserSportSettings();

  const settingsMap = useMemo(() => buildUserSettingsMap(userSettings), [userSettings]);
  const sportMap = useMemo(() => buildSportMap(sportTypes), [sportTypes]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

  const stats = useMemo(() => {
    const thisWeek = workouts.filter((w) =>
      isWithinInterval(parseISO(w.date), { start: weekStart, end: weekEnd })
    );

    const completed = thisWeek.filter((w) => w.isCompleted);
    let totalPlanned = thisWeek.reduce((sum, w) => sum + (w.plannedDurationMinutes || 0), 0);
    let totalCompleted = completed.reduce((sum, w) => sum + (w.actualDurationMinutes || 0), 0);
    let totalDistance = completed.reduce((sum, w) => sum + (w.actualDistanceKilometers || 0), 0);

    // Add event segment totals to this week's stats
    const thisWeekEvents = events.filter((e) =>
      isWithinInterval(parseISO(e.date), { start: weekStart, end: weekEnd })
    );
    thisWeekEvents.forEach((event) => {
      if (event.segments && event.segments.length > 0) {
        event.segments.forEach((seg) => {
          totalPlanned += seg.plannedDurationMinutes || 0;
          totalDistance += seg.plannedDistanceKilometers || 0;
        });
      }
    });

    const upcomingGoals = goals
      .filter((g) => {
        const goalDate = parseISO(g.date);
        return goalDate >= today;
      })
      .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
      .slice(0, 3);

    const nextGoal = upcomingGoals[0];
    const daysToGoal = nextGoal ? differenceInDays(parseISO(nextGoal.date), today) : null;

    const todayWorkouts = workouts.filter((w) => w.date === format(today, 'yyyy-MM-dd'));
    const thisWeekByDay = Array.from({ length: 7 }, (_, i) => {
      const day = addDays(weekStart, i);
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayWorkouts = workouts.filter((w) => w.date === dayStr);
      return {
        date: day,
        workouts: dayWorkouts,
        completed: dayWorkouts.filter((w) => w.isCompleted).length,
        total: dayWorkouts.length,
      };
    });

    return {
      thisWeekTotal: thisWeek.length,
      thisWeekCompleted: completed.length,
      totalPlannedMinutes: totalPlanned,
      totalCompletedMinutes: totalCompleted,
      totalDistance,
      upcomingGoals,
      nextGoal,
      daysToGoal,
      todayWorkouts,
      thisWeekByDay,
    };
  }, [workouts, goals, events, weekStart, weekEnd, today]);

  const isLoading = loadingWorkouts || loadingGoals || loadingEvents;

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4.5rem)] items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="container-fixed py-6">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-black lowercase tracking-tight">dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Your training overview for the week of {format(weekStart, 'MMM d')} -{' '}
            {format(weekEnd, 'MMM d, yyyy')}
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* This Week Progress */}
          <div className="bg-card overflow-hidden rounded-2xl border shadow-sm">
            <div className="p-5">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-xl">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs font-black uppercase tracking-widest">
                    this week
                  </p>
                  <p className="text-2xl font-black">
                    {stats.thisWeekCompleted}/{stats.thisWeekTotal}
                  </p>
                  <p className="text-muted-foreground text-xs">workouts completed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Training Time */}
          <div className="bg-card overflow-hidden rounded-2xl border shadow-sm">
            <div className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs font-black uppercase tracking-widest">
                    training time
                  </p>
                  <p className="text-2xl font-black">
                    {Math.round(stats.totalCompletedMinutes / 60)}h
                  </p>
                  <p className="text-muted-foreground text-xs">
                    of {Math.round(stats.totalPlannedMinutes / 60)}h planned
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Distance */}
          <div className="bg-card overflow-hidden rounded-2xl border shadow-sm">
            <div className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10 text-green-500">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs font-black uppercase tracking-widest">
                    distance
                  </p>
                  <p className="text-2xl font-black">{stats.totalDistance.toFixed(1)}</p>
                  <p className="text-muted-foreground text-xs">kilometers</p>
                </div>
              </div>
            </div>
          </div>

          {/* Next Goal */}
          <div className="bg-card overflow-hidden rounded-2xl border shadow-sm">
            <div className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500/10 text-yellow-500">
                  <Target className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs font-black uppercase tracking-widest">
                    next goal
                  </p>
                  {stats.nextGoal ? (
                    <>
                      <p className="text-2xl font-black">{stats.daysToGoal}d</p>
                      <p className="text-muted-foreground truncate text-xs">
                        {stats.nextGoal.title}
                      </p>
                    </>
                  ) : (
                    <p className="text-muted-foreground text-sm">No upcoming goals</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Today's Workouts */}
          <div className="bg-card lg:col-span-2 overflow-hidden rounded-2xl border shadow-sm">
            <div className="border-b bg-muted/30 px-5 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Dumbbell className="h-5 w-5" />
                  <h2 className="text-lg font-black lowercase tracking-tight">
                    today's workouts
                  </h2>
                </div>
                <Link to="/training/calendar">
                  <span className="text-primary text-xs font-semibold hover:underline">
                    view calendar →
                  </span>
                </Link>
              </div>
            </div>
            <div className="p-5">
              {stats.todayWorkouts.length === 0 ? (
                <div className="flex h-32 items-center justify-center">
                  <p className="text-muted-foreground text-sm">No workouts scheduled for today</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.todayWorkouts.map((workout) => {
                    const sport = sportMap.get(workout.sportTypeId);
                    const userSettingsForSport = settingsMap.get(workout.sportTypeId);
                    const color = getEffortColor(sport, workout.effortLevel, userSettingsForSport);

                    return (
                      <div
                        key={workout.id}
                        className="flex items-center gap-3 rounded-xl border p-3 transition-all hover:shadow-sm"
                      >
                        <div
                          className="h-12 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                        <div className="flex-1">
                          <h3 className="font-black lowercase tracking-tight">
                            {workout.title || workout.sportName}
                          </h3>
                          <div className="text-muted-foreground flex gap-3 text-xs">
                            {workout.plannedDurationMinutes && (
                              <span>{workout.plannedDurationMinutes} min</span>
                            )}
                            {workout.plannedDistanceKilometers && (
                              <span>{workout.plannedDistanceKilometers} km</span>
                            )}
                          </div>
                        </div>
                        {workout.isCompleted ? (
                          <div className="bg-green-500/10 flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold text-green-500">
                            <Activity className="h-3 w-3" />
                            Done
                          </div>
                        ) : (
                          <div className="bg-muted text-muted-foreground rounded-full px-2 py-1 text-xs font-bold">
                            Planned
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Goals */}
          <div className="bg-card overflow-hidden rounded-2xl border shadow-sm">
            <div className="border-b bg-muted/30 px-5 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  <h2 className="text-lg font-black lowercase tracking-tight">upcoming goals</h2>
                </div>
                <Link to="/training/goals">
                  <span className="text-primary text-xs font-semibold hover:underline">
                    view all →
                  </span>
                </Link>
              </div>
            </div>
            <div className="p-5">
              {stats.upcomingGoals.length === 0 ? (
                <div className="flex h-32 items-center justify-center">
                  <p className="text-muted-foreground text-sm">No upcoming goals</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.upcomingGoals.map((goal) => {
                    const daysUntil = differenceInDays(parseISO(goal.date), today);
                    return (
                      <div
                        key={goal.id}
                        className="flex items-start gap-3 rounded-xl border p-3"
                      >
                        <div className="bg-primary/10 text-primary flex shrink-0 flex-col items-center rounded-lg p-2">
                          <span className="text-lg font-black">
                            {format(parseISO(goal.date), 'd')}
                          </span>
                          <span className="text-[8px] font-black uppercase">
                            {format(parseISO(goal.date), 'MMM')}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-black lowercase tracking-tight">
                            {goal.title}
                          </h3>
                          <p className="text-muted-foreground text-xs">
                            {daysUntil === 0
                              ? 'Today'
                              : daysUntil === 1
                                ? 'Tomorrow'
                                : `${daysUntil} days`}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold ${
                            goal.priority === 'A'
                              ? 'bg-red-500/10 text-red-500'
                              : goal.priority === 'B'
                                ? 'bg-yellow-500/10 text-yellow-500'
                                : 'bg-blue-500/10 text-blue-500'
                          }`}
                        >
                          {goal.priority}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Week at a Glance */}
        <div className="bg-card overflow-hidden rounded-2xl border shadow-sm">
          <div className="border-b bg-muted/30 px-5 py-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              <h2 className="text-lg font-black lowercase tracking-tight">week at a glance</h2>
            </div>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-7 gap-2">
              {stats.thisWeekByDay.map((day, i) => {
                const isToday = format(day.date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
                const isPast = day.date < today;

                return (
                  <div
                    key={i}
                    className={`rounded-xl border p-3 text-center transition-all ${
                      isToday
                        ? 'border-primary bg-primary/5'
                        : isPast
                          ? 'bg-muted/30'
                          : 'bg-card'
                    }`}
                  >
                    <p
                      className={`text-xs font-black uppercase ${
                        isToday ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    >
                      {format(day.date, 'EEE')}
                    </p>
                    <p className="mt-1 text-2xl font-black">{format(day.date, 'd')}</p>
                    <div className="mt-2 space-y-1">
                      {day.workouts.slice(0, 2).map((workout) => {
                        const sport = sportMap.get(workout.sportTypeId);
                        const userSettingsForSport = settingsMap.get(workout.sportTypeId);
                        const color = getEffortColor(
                          sport,
                          workout.effortLevel,
                          userSettingsForSport
                        );

                        return (
                          <div
                            key={workout.id}
                            className="h-1.5 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                        );
                      })}
                      {day.workouts.length > 2 && (
                        <p className="text-muted-foreground text-[9px] font-bold">
                          +{day.workouts.length - 2}
                        </p>
                      )}
                      {day.total > 0 && (
                        <p className="text-muted-foreground mt-1 text-[10px] font-semibold">
                          {day.completed}/{day.total}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
