import { useMemo, useState } from 'react';
import { differenceInDays, format, isBefore, parseISO } from 'date-fns';
import { Calendar, Pencil, Plus, Trash2 } from 'lucide-react';
import { Event } from '@/types/training';
import {
  useCreateEvent,
  useDeleteEvent,
  useEvents,
  useSportTypes,
  useUpdateEvent,
  useUserSportSettings,
} from '@/hooks/use-training-data';
import { formatMinsShort } from '@/services/training/calendar.utils';
import {
  buildSportMap,
  buildUserSettingsMap,
  getEffortColor,
} from '@/services/training/effort-colors';
import { formatEventDuration } from '@/services/training/event-duration';
import {
  calculatePace,
  isMetersDistance,
  isPaceRelevant,
} from '@/services/training/pace-utils';
import { getSportIcon } from '@/services/training/sport-icons';
import { Button } from '@/components/ui/button';
import { DeleteConfirmOverlay } from '../_shared/components/delete-confirm-overlay';
import { EventDialog } from '../_shared/components/event-dialog';
import { getPriorityColor, getTypeIcon } from '../_shared/utils/event-helpers';

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

  const userSettingsMap = useMemo(
    () => buildUserSettingsMap(userSettings),
    [userSettings],
  );
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
      0,
    );
    const distance = event.segments.reduce(
      (sum, seg) => sum + (seg.plannedDistanceKilometers || 0),
      0,
    );

    return { duration, distance, count: event.segments.length };
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
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
              <span className="text-2xl font-black">
                {format(parseISO(event.date), 'd')}
              </span>
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
                        const Icon = getTypeIcon(event.eventTypeName);
                        return <Icon className="h-4 w-4" />;
                      })()}
                    </div>
                    <div className="flex flex-col">
                      <h3 className="text-lg font-black tracking-tight">
                        {event.title}
                      </h3>
                      {event.eventTypeName && (
                        <span className="text-[10px] font-bold uppercase text-primary/70">
                          {event.eventTypeName}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-muted-foreground mt-1 text-xs font-semibold">
                    {formatEventDuration(
                      differenceInDays(parseISO(event.date), today),
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${getPriorityColor(event.eventPriorityName)}`}
                  >
                    {event.eventPriorityName || event.priority}
                  </span>
                </div>
              </div>

              {event.description && (
                <p className="text-muted-foreground text-sm">
                  {event.description}
                </p>
              )}

              {/* Discipline breakdown */}
              {totals.count > 0 && (
                <div className="space-y-2">
                  {event.segments!.map((segment, idx) => {
                    const sport = sportMap.get(segment.sportTypeId);
                    const userSettingsForSport = userSettingsMap.get(
                      segment.sportTypeId,
                    );
                    const color = getEffortColor(
                      sport,
                      segment.effortLevel,
                      userSettingsForSport,
                    );
                    const duration = segment.plannedDurationMinutes || 0;
                    const distKm = segment.plannedDistanceKilometers || 0;
                    const dist = isMetersDistance(
                      sport?.distanceUnit,
                      sport?.name,
                    )
                      ? distKm * 1000
                      : distKm;
                    const pace = calculatePace(
                      sport?.paceUnit,
                      duration,
                      dist,
                      sport?.name,
                    );

                    const sportName =
                      segment.sportName || sport?.name || 'Unknown';
                    const IconComponent = getSportIcon(sportName);

                    return (
                      <div
                        key={idx}
                        className="flex items-start gap-3 rounded-lg border p-3"
                        style={{
                          borderLeftWidth: '4px',
                          borderLeftColor: color,
                        }}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          {IconComponent && (
                            <IconComponent className="h-4 w-4 shrink-0 text-muted-foreground" />
                          )}
                          <div className="flex flex-col gap-1 min-w-0">
                            <span className="text-sm font-bold lowercase truncate">
                              {sportName}
                            </span>
                            {duration > 0 && (
                              <span className="text-xs text-muted-foreground">
                                {formatMinsShort(duration)}
                              </span>
                            )}
                            {dist > 0 &&
                              isPaceRelevant(
                                !!sport?.paceRelevant,
                                sport?.paceUnit,
                              ) && (
                                <span className="text-xs text-muted-foreground">
                                  {dist}
                                  {sport.distanceUnit || 'km'}
                                </span>
                              )}
                            {pace && (
                              <span className="text-xs text-muted-foreground">
                                {pace}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
      <div className="flex flex-col gap-4">
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
        <div className="px-4 pb-4">
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
                  <p className="text-muted-foreground text-sm">
                    No upcoming events
                  </p>
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
          onDelete={(id) => {
            deleteEvent.mutate(id);
            setDialogEvent(null);
          }}
          onCancel={() => {
            setDialogEvent(null);
            setIsCreating(false);
          }}
        />
      )}
    </div>
  );
}
