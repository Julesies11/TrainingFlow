import { useMemo } from 'react';
import { parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Event, Workout } from '@/types/training';

type ViewType = 'week' | 'month';
type SportType = 'Swim' | 'Bike' | 'Run' | 'Strength';

const SPORT_COLORS: Record<SportType, string> = {
  Swim: '#3b82f6',
  Bike: '#facc15',
  Run: '#ef4444',
  Strength: '#22c55e',
};

const formatMins = (totalMins: number) => {
  const roundedMins = Math.round(totalMins);
  if (roundedMins <= 0) return '0m';
  const h = Math.floor(roundedMins / 60);
  const m = roundedMins % 60;
  if (h > 0) {
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  return `${m}m`;
};

interface SportDistributionProps {
  workouts: Workout[];
  events: Event[];
  distViewType: ViewType;
  distPivotDate: Date;
  setDistViewType: (type: ViewType) => void;
  onShift: (direction: 'prev' | 'next') => void;
}

export function SportDistribution({
  workouts,
  events,
  distViewType,
  distPivotDate,
  setDistViewType,
  onShift,
}: SportDistributionProps) {
  const trainingDistribution = useMemo(() => {
    const start = new Date(distPivotDate);
    const end = new Date(distPivotDate);
    if (distViewType === 'week') {
      const day = start.getDay();
      const diff = start.getDate() - (day === 0 ? 6 : day - 1);
      start.setDate(diff);
      start.setHours(0, 0, 0, 0);
      end.setTime(start.getTime() + 7 * 24 * 60 * 60 * 1000);
    } else {
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(start.getMonth() + 1);
    }

    const filteredWorkouts = workouts.filter((w) => {
      const d = parseISO(w.date);
      return d >= start && d < end;
    });

    const filteredEvents = events.filter((e) => {
      const d = parseISO(e.date);
      return d >= start && d < end;
    });

    let totalDuration = filteredWorkouts.reduce((sum, w) => {
      const dur = w.isCompleted
        ? w.actualDurationMinutes || 0
        : w.plannedDurationMinutes || 0;
      return sum + dur;
    }, 0);

    filteredEvents.forEach((event) => {
      if (event.segments && event.segments.length > 0) {
        event.segments.forEach((seg) => {
          totalDuration += seg.plannedDurationMinutes || 0;
        });
      }
    });

    totalDuration = totalDuration || 1;

    return (['Swim', 'Bike', 'Run', 'Strength'] as SportType[]).map((s) => {
      let sportDuration = filteredWorkouts
        .filter((w) => w.sportName === s)
        .reduce((sum, w) => {
          const dur = w.isCompleted
            ? w.actualDurationMinutes || 0
            : w.plannedDurationMinutes || 0;
          return sum + dur;
        }, 0);

      filteredEvents.forEach((event) => {
        if (event.segments && event.segments.length > 0) {
          event.segments.forEach((seg) => {
            if (seg.sportName === s) {
              sportDuration += seg.plannedDurationMinutes || 0;
            }
          });
        }
      });

      return {
        sport: s,
        duration: sportDuration,
        percent: Math.round((sportDuration / totalDuration) * 100),
        color: SPORT_COLORS[s],
      };
    });
  }, [workouts, events, distViewType, distPivotDate]);

  const distributionLabel = useMemo(() => {
    if (distViewType === 'week') {
      const start = new Date(distPivotDate);
      const day = start.getDay();
      const diff = start.getDate() - (day === 0 ? 6 : day - 1);
      start.setDate(diff);
      return `wk of ${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toLowerCase()}`;
    }
    return distPivotDate
      .toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      .toLowerCase();
  }, [distViewType, distPivotDate]);

  return (
    <div className="bg-card overflow-hidden rounded-2xl border shadow-sm">
      <div className="border-b bg-muted/30 px-5 py-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base md:text-lg font-black lowercase tracking-tight">
            sport distribution
          </h3>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onShift('prev')}
              className="p-1 rounded hover:bg-muted transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => onShift('next')}
              className="p-1 rounded hover:bg-muted transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold lowercase text-muted-foreground">
            {distributionLabel}
          </span>
          <div className="flex items-center gap-1 rounded-lg border bg-background p-0.5">
            <button
              onClick={() => setDistViewType('week')}
              className={`px-2 py-1 text-xs font-bold lowercase rounded transition-colors ${
                distViewType === 'week'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              week
            </button>
            <button
              onClick={() => setDistViewType('month')}
              className={`px-2 py-1 text-xs font-bold lowercase rounded transition-colors ${
                distViewType === 'month'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              month
            </button>
          </div>
        </div>
        <div className="space-y-4">
          {trainingDistribution.map((item) => (
            <div key={item.sport} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold lowercase">{item.sport}</span>
                <span className="text-muted-foreground font-medium">
                  {formatMins(item.duration)} ({item.percent}%)
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${item.percent}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
