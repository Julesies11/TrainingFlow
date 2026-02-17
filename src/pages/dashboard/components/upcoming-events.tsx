import { Trophy } from 'lucide-react';
import { parseISO, format, differenceInDays } from 'date-fns';
import { Link } from 'react-router';
import { Event, SportTypeRecord } from '@/types/training';
import { calculatePace } from '@/services/training/pace-utils';
import { getEffortColor } from '@/services/training/effort-colors';
import { getSportIcon } from '@/services/training/sport-icons';

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
  sportTypes: SportTypeRecord[];
  userSettingsMap: Map<string, any>;
}

export function UpcomingEvents({ events, today, sportTypes, userSettingsMap }: UpcomingEventsProps) {
  const sportMap = new Map(sportTypes.map(st => [st.id, st]));
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
              const hasSegments = event.segments && event.segments.length > 0;

              return (
                <div
                  key={event.id}
                  className="rounded-xl border overflow-hidden hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start gap-3 bg-muted/30 p-3">
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
                    </div>
                  </div>
                  {hasSegments && (
                    <div className="flex flex-col gap-2 p-3">
                      {event.segments!.map((segment, idx) => {
                        const sport = sportMap.get(segment.sportTypeId);
                        const userSettingsForSport = userSettingsMap.get(segment.sportTypeId);
                        const color = getEffortColor(sport, segment.effortLevel, userSettingsForSport);
                        const duration = segment.plannedDurationMinutes || 0;
                        const distKm = segment.plannedDistanceKilometers || 0;
                        const dist = sport?.name === 'Swim' ? distKm * 1000 : distKm;
                        const pace = calculatePace(sport?.name || '', duration, dist);
                        
                        const sportName = segment.sportName || sport?.name || 'Unknown';
                        const IconComponent = getSportIcon(sportName);

                        return (
                          <div
                            key={idx}
                            className="flex items-start gap-2 rounded-lg border p-2"
                            style={{ borderLeftWidth: '3px', borderLeftColor: color }}
                          >
                            {IconComponent && (
                              <IconComponent className="h-4 w-4 shrink-0 text-muted-foreground" />
                            )}
                            <div className="flex flex-col gap-0.5 text-xs">
                              <span className="font-bold lowercase">{sportName}</span>
                              {duration > 0 && (
                                <span className="text-muted-foreground">{formatMins(duration)}</span>
                              )}
                              {dist > 0 && sport?.paceRelevant && (
                                <span className="text-muted-foreground">
                                  {dist}{sport.distanceUnit || 'km'}
                                </span>
                              )}
                              {pace && (
                                <span className="text-muted-foreground">{pace}</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
