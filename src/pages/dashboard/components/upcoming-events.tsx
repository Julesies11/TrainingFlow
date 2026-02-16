import { Trophy } from 'lucide-react';
import { parseISO, format, differenceInDays } from 'date-fns';
import { Link } from 'react-router';
import { Event } from '@/types/training';

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

interface UpcomingEventsProps {
  events: Event[];
  today: Date;
}

export function UpcomingEvents({ events, today }: UpcomingEventsProps) {
  return (
    <div className="bg-card overflow-hidden rounded-2xl border shadow-sm">
      <div className="border-b bg-muted/30 px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            <h3 className="text-base md:text-lg font-black lowercase tracking-tight">
              upcoming events
            </h3>
          </div>
          <Link to="/training/events">
            <span className="text-primary text-xs font-semibold hover:underline lowercase">
              view all →
            </span>
          </Link>
        </div>
      </div>
      <div className="p-5">
        {events.length === 0 ? (
          <div className="flex h-32 items-center justify-center">
            <p className="text-muted-foreground text-sm">No upcoming events</p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => {
              const daysUntil = differenceInDays(parseISO(event.date), today);
              const totalDuration = event.segments?.reduce(
                (sum, seg) => sum + (seg.plannedDurationMinutes || 0),
                0
              ) || 0;
              const totalDistance = event.segments?.reduce(
                (sum, seg) => sum + (seg.plannedDistanceKilometers || 0),
                0
              ) || 0;

              return (
                <div
                  key={event.id}
                  className="flex items-start gap-3 rounded-xl border p-3 hover:shadow-sm transition-shadow"
                >
                  <div className="bg-primary/10 text-primary flex shrink-0 flex-col items-center rounded-lg p-2">
                    <span className="text-lg font-black">
                      {format(parseISO(event.date), 'd')}
                    </span>
                    <span className="text-[8px] font-black uppercase">
                      {format(parseISO(event.date), 'MMM')}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-black tracking-tight truncate">
                      {event.title}
                    </h4>
                    <p className="text-muted-foreground text-xs">
                      {daysUntil === 0
                        ? 'Today'
                        : daysUntil === 1
                          ? 'Tomorrow'
                          : `${daysUntil} days`}
                    </p>
                    <div className="mt-2 flex gap-3 text-xs text-muted-foreground">
                      {totalDuration > 0 && <span>{formatMins(totalDuration)}</span>}
                      {totalDistance > 0 && <span>{totalDistance.toFixed(1)} km</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
