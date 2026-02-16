import { useState, useMemo } from 'react';
import { Plus, Calendar, Trash2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  useEvents,
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
  useSportTypes,
  useUserSportSettings,
} from '@/hooks/use-training-data';
import { Event } from '@/types/training';
import { EventDialog } from './components/event-dialog';
import { format, parseISO, isBefore } from 'date-fns';
import { getEffortColor, buildUserSettingsMap, buildSportMap } from '@/services/training/effort-colors';
import { getPriorityColor, getTypeIcon, getDaysUntil } from '../_shared/utils/event-helpers';
import { DeleteConfirmOverlay } from '../_shared/components/delete-confirm-overlay';

export function EventsPage() {
  const { data: events = [], isLoading } = useEvents();
  const { data: sportTypes = [] } = useSportTypes();
  const { data: userSettings = [] } = useUserSportSettings();
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();

  const [dialogEvent, setDialogEvent] = useState<Event | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const userSettingsMap = useMemo(() => buildUserSettingsMap(userSettings), [userSettings]);
  const sportMap = useMemo(() => buildSportMap(sportTypes), [sportTypes]);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const { upcoming, past } = useMemo(() => {
    const upcoming: Event[] = [];
    const past: Event[] = [];

    events.forEach((event) => {
      const eventDate = parseISO(event.date);
      if (isBefore(eventDate, today)) {
        past.push(event);
      } else {
        upcoming.push(event);
      }
    });

    return { upcoming, past };
  }, [events, today]);

  const handleSave = (event: Partial<Event>) => {
    if (event.id) {
      updateEvent.mutate(event as Event, {
        onSuccess: () => {
          setDialogEvent(null);
          setIsCreating(false);
        },
      });
    } else {
      createEvent.mutate(event, {
        onSuccess: () => {
          setDialogEvent(null);
          setIsCreating(false);
        },
      });
    }
  };

  const handleDelete = (id: string) => {
    deleteEvent.mutate(id, {
      onSuccess: () => {
        setDeleteConfirmId(null);
      },
    });
  };

  const getEventTotals = (event: Event) => {
    if (!event.segments || event.segments.length === 0) {
      return { duration: 0, distance: 0, count: 0 };
    }

    const duration = event.segments.reduce(
      (sum, seg) => sum + (seg.plannedDurationMinutes || 0),
      0
    );
    const distance = event.segments.reduce(
      (sum, seg) => sum + (seg.plannedDistanceKilometers || 0),
      0
    );

    return { duration, distance, count: event.segments.length };
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4.5rem)] items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading events...</div>
      </div>
    );
  }

  const renderEventCard = (event: Event) => {
    const totals = getEventTotals(event);

    return (
      <div
        key={event.id}
        className="bg-card group relative overflow-hidden rounded-2xl border shadow-sm transition-all hover:shadow-md"
      >
        {deleteConfirmId === event.id && (
          <DeleteConfirmOverlay
            message="Delete this event?"
            onConfirm={() => handleDelete(event.id)}
            onCancel={() => setDeleteConfirmId(null)}
          />
        )}

        <div className="p-5">
          <div className="flex items-start gap-4">
            {/* Date badge */}
            <div className="bg-primary/10 text-primary flex shrink-0 flex-col items-center rounded-xl p-3">
              <span className="text-2xl font-black">{format(parseISO(event.date), 'd')}</span>
              <span className="text-[9px] font-black uppercase tracking-widest">
                {format(parseISO(event.date), 'MMM')}
              </span>
              <span className="text-muted-foreground mt-1 text-[8px] font-semibold">
                {format(parseISO(event.date), 'yyyy')}
              </span>
            </div>

            {/* Event details */}
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="text-muted-foreground">
                      {(() => {
                        const Icon = getTypeIcon(event.type);
                        return <Icon className="h-4 w-4" />;
                      })()}
                    </div>
                    <h3 className="text-lg font-black tracking-tight">{event.title}</h3>
                  </div>
                  <p className="text-muted-foreground mt-1 text-xs font-semibold">
                    {getDaysUntil(event.date)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${getPriorityColor(event.priority)}`}
                  >
                    {event.priority}
                  </span>
                </div>
              </div>

              {event.description && (
                <p className="text-muted-foreground text-sm">{event.description}</p>
              )}

              {/* Segments display */}
              {totals.count > 0 && (
                <div className="space-y-2">
                  {/* Color bar - proportional to duration */}
                  <div className="flex h-2 overflow-hidden rounded-full">
                    {event.segments!.map((segment, idx) => {
                      const sport = sportMap.get(segment.sportTypeId);
                      const userSettingsForSport = userSettingsMap.get(segment.sportTypeId);
                      const color = getEffortColor(sport, segment.effortLevel, userSettingsForSport);
                      const duration = segment.plannedDurationMinutes || 0;
                      const widthPercent = totals.duration > 0 ? (duration / totals.duration) * 100 : 0;

                      return (
                        <div
                          key={idx}
                          style={{ 
                            backgroundColor: color,
                            width: `${widthPercent}%`
                          }}
                          title={`${segment.sportName} - ${duration} min - Effort ${segment.effortLevel}`}
                        />
                      );
                    })}
                  </div>

                  {/* Totals */}
                  <div className="flex flex-wrap gap-3 text-xs">
                    <span className="bg-muted/50 flex items-center gap-1 rounded-full px-2 py-1 font-semibold">
                      <span className="text-muted-foreground">Segments:</span>
                      <span>{totals.count}</span>
                    </span>
                    {totals.duration > 0 && (
                      <span className="bg-muted/50 flex items-center gap-1 rounded-full px-2 py-1 font-semibold">
                        <span className="text-muted-foreground">Duration:</span>
                        <span>{totals.duration} min</span>
                      </span>
                    )}
                    {totals.distance > 0 && (
                      <span className="bg-muted/50 flex items-center gap-1 rounded-full px-2 py-1 font-semibold">
                        <span className="text-muted-foreground">Distance:</span>
                        <span>{totals.distance.toFixed(1)} km</span>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-4 flex gap-2 border-t pt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDialogEvent(event)}
              className="flex-1 gap-2"
            >
              <Pencil className="h-3 w-3" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteConfirmId(event.id)}
              className="gap-2 text-red-500 hover:bg-red-500/10 hover:text-red-600"
            >
              <Trash2 className="h-3 w-3" />
              Delete
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container-fixed">
      <div className="flex h-[calc(100vh-4.5rem)] flex-col gap-4 overflow-hidden lg:h-[calc(100vh-5rem)]">
        {/* Header */}
        <header className="flex shrink-0 flex-col gap-3 px-4 pt-2 lg:flex-row lg:items-center lg:justify-between lg:px-4">
          <div>
            <h1 className="text-2xl font-black lowercase tracking-tighter lg:text-3xl">
              events & goals
            </h1>
            <p className="text-muted-foreground mt-1 text-xs lg:text-sm">
              Track your races, goals, and fitness tests
            </p>
          </div>
          <Button onClick={() => setIsCreating(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            new event
          </Button>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="space-y-6">
            {/* Upcoming Events */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Calendar className="text-primary h-5 w-5" />
                <h2 className="text-xl font-black lowercase tracking-tight">
                  upcoming ({upcoming.length})
                </h2>
              </div>

              {upcoming.length === 0 ? (
                <div className="bg-muted/30 flex h-32 items-center justify-center rounded-2xl border border-dashed">
                  <p className="text-muted-foreground text-sm">No upcoming events</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {upcoming.map(renderEventCard)}
                </div>
              )}
            </div>

            {/* Past Events */}
            {past.length > 0 && (
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <Trophy className="text-muted-foreground h-5 w-5" />
                  <h2 className="text-muted-foreground text-xl font-black lowercase tracking-tight">
                    past ({past.length})
                  </h2>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {past.map(renderEventCard)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dialog */}
      {(isCreating || dialogEvent) && (
        <EventDialog
          event={dialogEvent || undefined}
          sportTypes={sportTypes}
          userSettings={userSettings}
          onSave={handleSave}
          onCancel={() => {
            setDialogEvent(null);
            setIsCreating(false);
          }}
        />
      )}
    </div>
  );
}
