/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Star } from 'lucide-react';
import {
  Event,
  Note,
  SportTypeRecord,
  UserSportSettings,
  Workout,
} from '@/types/training';
import {
  formatDateToLocalISO,
  formatMinsShort,
  getContrastColor,
  MONTH_NAMES,
} from '@/services/training/calendar.utils';
import { getEffortColor } from '@/services/training/effort-colors';
import {
  calculatePace,
  isMetersDistance,
  isPaceRelevant,
} from '@/services/training/pace-utils';
import { getSportIcon } from '@/services/training/sport-icons';
import { getEventTypeTheme } from '../../_shared/utils/event-theme';

interface CalendarDayProps {
  date: Date;
  workouts: Workout[];
  notes: Note[];
  events: Event[];
  isToday: boolean;
  isSelected: boolean;
  isSameMonth: boolean;
  displayMonth: number;
  onSelect: (dateStr: string) => void;
  onDragOver: (e: React.DragEvent, dateStr: string, count: number) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, dateStr: string) => void;
  onDragStart: (e: React.DragEvent, item: Workout | Note) => void;
  onDragEnd: () => void;
  onEventDragStart: (e: React.DragEvent, item: Event) => void;
  sportMap: Map<string, SportTypeRecord>;
  userSettingsMap: Map<string, UserSportSettings>;
  showStats: boolean;
  onEditWorkout: (w: Workout) => void;
  onEditNote: (n: Note) => void;
  onEditEvent: (e: Event) => void;
  isDraggingId: string | null;
  dragOverInfo: { date: string; index?: number } | null;
  todayRef?: React.RefObject<HTMLDivElement | null>;
  hideDates?: boolean;
  weekLabel?: string;
}

export const CalendarDay = React.memo(
  ({
    date,
    workouts,
    notes = [],
    events,
    isToday,
    isSelected,
    isSameMonth,
    onSelect,
    onDragOver,
    onDragLeave,
    onDrop,
    onDragStart,
    onDragEnd,
    onEventDragStart,
    sportMap,
    userSettingsMap,
    showStats,
    onEditWorkout,
    onEditNote,
    onEditEvent,
    isDraggingId,
    dragOverInfo,
    todayRef,
    hideDates,
    weekLabel,
  }: CalendarDayProps) => {
    const dateStr = formatDateToLocalISO(date);
    const isFirstOfMonth = date.getDate() === 1;
    const isDayStartOfWeek = date.getDay() === 1; // Assuming Monday start

    return (
      <div
        ref={isToday ? (todayRef as any) : null}
        onClick={() => onSelect(dateStr)}
        onDragOver={(e) =>
          onDragOver(e, dateStr, workouts.length + events.length + notes.length)
        }
        onDragLeave={onDragLeave}
        onDrop={(e) => onDrop(e, dateStr)}
        className={`group/cell relative flex flex-col overflow-hidden border-r p-1 transition-all last:border-r-0 lg:p-2
          ${!isSameMonth ? 'bg-muted/20' : ''}
          ${isSelected ? 'bg-primary/10 dark:bg-primary/30 ring-primary/50 dark:ring-primary/70 z-10 shadow-md ring-2 ring-inset' : ''}
          ${dragOverInfo?.date === dateStr && isDraggingId ? 'ring-2 ring-inset ring-primary bg-primary/10 dark:bg-primary/20' : ''}`}
      >
        <div className="mb-1 flex shrink-0 items-start justify-between">
          {!hideDates ? (
            <span
              className={`flex h-5 items-center justify-center rounded-full px-1.5 text-[9px] font-black transition-all lg:h-6 lg:text-xs
                ${isToday ? 'bg-primary text-primary-foreground shadow-lg' : isSelected ? 'text-primary font-black' : 'text-muted-foreground'}
                ${!isSameMonth ? 'opacity-30' : ''}`}
            >
              {isDayStartOfWeek
                ? `${MONTH_NAMES[date.getMonth()].slice(0, 3)} ${date.getDate()}`
                : isFirstOfMonth
                  ? `${MONTH_NAMES[date.getMonth()].slice(0, 3)} 1`
                  : date.getDate()}
            </span>
          ) : (
            <div />
          )}

          {weekLabel && (
            <span className="text-primary text-[9px] font-black uppercase tracking-tighter lg:text-[10px]">
              {weekLabel}
            </span>
          )}
        </div>

        <div
          className="relative flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto pb-6 [scrollbar-width:none]"
          data-drop-container
        >
          {/* Events with segments */}
          {events.map((event, eIdx) => {
            const itemIndex = eIdx;
            const hasSegments = event.segments && event.segments.length > 0;
            const theme = getEventTypeTheme(
              event.eventTypeColorTheme,
              event.eventTypeIcon,
            );
            const IconComp = theme.icon;

            return (
              <React.Fragment key={event.id}>
                {dragOverInfo?.date === dateStr &&
                  isDraggingId &&
                  dragOverInfo.index === itemIndex && <DropIndicator />}
                <div
                  data-drop-item
                  draggable="true"
                  onDragStart={(e) => onEventDragStart(e, event)}
                  onDragEnd={onDragEnd}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditEvent(event);
                  }}
                  className={`cursor-grab overflow-hidden rounded-lg border shadow-sm transition-all hover:shadow-md active:cursor-grabbing ${theme.bg} ${theme.border} ${isDraggingId === event.id ? 'opacity-20 grayscale' : ''}`}
                >
                  <div
                    className={`flex flex-col gap-0.5 border-b px-2 py-1 ${theme.border}`}
                  >
                    <div
                      className={`flex items-center gap-1.5 text-[10px] opacity-70 lg:text-xs ${theme.text}`}
                    >
                      <IconComp className="h-3.5 w-3.5 shrink-0" />
                      <span>event</span>
                    </div>
                    <div
                      className={`break-words whitespace-normal text-[10px] lg:text-xs ${theme.text}`}
                    >
                      {event.title}
                    </div>
                  </div>
                  {hasSegments && (
                    <div className="flex flex-col gap-1 p-1">
                      {event.segments!.map((seg, segIdx) => (
                        <EventSegment
                          key={segIdx}
                          seg={seg}
                          sportMap={sportMap}
                          userSettingsMap={userSettingsMap}
                        />
                      ))}
                    </div>
                  )}
                  <div className="flex justify-end px-1 pb-1">
                    <PriorityBadge
                      priority={event.eventPriorityName || event.priority}
                    />
                  </div>
                </div>
              </React.Fragment>
            );
          })}

          {/* Notes */}
          {notes.map((note, nIdx) => {
            const itemIndex = events.length + nIdx;
            return (
              <React.Fragment key={note.id}>
                {dragOverInfo?.date === dateStr &&
                  isDraggingId &&
                  dragOverInfo.index === itemIndex && <DropIndicator />}
                <div
                  data-drop-item
                  draggable="true"
                  onDragStart={(e) => onDragStart(e, note)}
                  onDragEnd={onDragEnd}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditNote(note);
                  }}
                  className={`bg-info/10 text-info border-info/30 cursor-grab overflow-hidden rounded-lg border p-2 shadow-sm transition-all hover:shadow-md active:cursor-grabbing ${isDraggingId === note.id ? 'opacity-20 grayscale' : ''}`}
                >
                  <div className="text-[10px] font-bold lg:text-xs">note</div>
                  <div className="text-muted-foreground mt-0.5 line-clamp-3 text-[10px] leading-tight lg:text-[11px]">
                    {note.content}
                  </div>
                </div>
              </React.Fragment>
            );
          })}

          {/* Workouts */}
          {workouts.map((w, wIdx) => {
            const itemIndex = events.length + notes.length + wIdx;
            const wSt = sportMap.get(w.sportTypeId);
            const bg = getEffortColor(
              wSt,
              w.effortLevel || 1,
              userSettingsMap.get(w.sportTypeId),
            );
            const dur = w.plannedDurationMinutes || 0;
            const distKm = w.plannedDistanceKilometers || 0;
            const dist = isMetersDistance(wSt?.distanceUnit, wSt?.name)
              ? distKm * 1000
              : distKm;
            const pace = calculatePace(wSt?.paceUnit, dur, dist, wSt?.name);

            return (
              <React.Fragment key={w.id}>
                {dragOverInfo?.date === dateStr &&
                  isDraggingId &&
                  dragOverInfo.index === itemIndex && <DropIndicator />}
                <div
                  data-drop-item
                  draggable="true"
                  onDragStart={(e) => onDragStart(e, w)}
                  onDragEnd={onDragEnd}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditWorkout(w);
                  }}
                  className={`relative cursor-grab overflow-hidden rounded-lg p-1 shadow-sm transition-all hover:shadow-md active:scale-95 active:cursor-grabbing lg:p-2 ${getContrastColor(bg)} ${w.isKeyWorkout ? 'border-l-[3px] border-l-white/80 dark:border-l-white/90 shadow-md' : ''} ${isDraggingId === w.id ? 'scale-95 opacity-20' : ''}`}
                  style={{ backgroundColor: bg }}
                >
                  {w.isKeyWorkout && (
                    <Star className="absolute top-0.5 right-0.5 h-3 w-3 fill-white/90 text-white/90 drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)] lg:h-4 lg:w-4" />
                  )}
                  <div className="pointer-events-none flex flex-col gap-0.5 leading-none">
                    <WorkoutContent
                      workout={w}
                      sport={wSt}
                      dur={dur}
                      dist={dist}
                      pace={pace}
                      showStats={showStats}
                    />
                  </div>
                </div>
              </React.Fragment>
            );
          })}

          {/* Drop zone indicator - after last item */}
          {dragOverInfo?.date === dateStr &&
            isDraggingId &&
            dragOverInfo.index! >=
              events.length + notes.length + workouts.length && (
              <DropIndicator />
            )}
        </div>

        {/* Daily totals in stats mode */}
        {showStats && workouts.length > 0 && (
          <div className="border-muted mt-auto shrink-0 border-t pt-1">
            <div className="text-muted-foreground text-[10px] lg:text-xs">
              {formatMinsShort(
                workouts.reduce(
                  (sum, w) => sum + (w.plannedDurationMinutes || 0),
                  0,
                ),
              )}
            </div>
          </div>
        )}
      </div>
    );
  },
);

// Helper sub-components

const DropIndicator = () => (
  <div className="mx-0.5 flex shrink-0 items-center gap-0.5 py-1">
    <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-primary shadow-[0_0_10px_var(--color-primary)]" />
    <div className="h-[3px] flex-1 rounded-full bg-primary shadow-[0_0_10px_var(--color-primary)]" />
    <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-primary shadow-[0_0_10px_var(--color-primary)]" />
  </div>
);

const PriorityBadge = ({ priority }: { priority?: string }) => {
  const colorClass =
    priority === 'A'
      ? 'bg-red-500'
      : priority === 'B'
        ? 'bg-amber-400'
        : priority === 'C'
          ? 'bg-blue-400'
          : 'bg-gray-400';
  return (
    <span
      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[8px] text-white lg:h-5 lg:w-5 lg:text-[10px] ${colorClass}`}
    >
      {priority?.slice(0, 1) || '-'}
    </span>
  );
};

const EventSegment = ({ seg, sportMap, userSettingsMap }: any) => {
  const sport = sportMap.get(seg.sportTypeId);
  const color = getEffortColor(
    sport,
    seg.effortLevel,
    userSettingsMap.get(seg.sportTypeId),
  );
  const distKm = seg.plannedDistanceKilometers || 0;
  const dist = isMetersDistance(sport?.distanceUnit, sport?.name)
    ? distKm * 1000
    : distKm;
  const pace = calculatePace(
    sport?.paceUnit,
    seg.plannedDurationMinutes || 0,
    dist,
    sport?.name,
  );
  const sportName = seg.sportName || sport?.name || 'Unknown';
  const IconComponent = getSportIcon(sportName, sport?.paceUnit);

  return (
    <div
      className="flex items-center gap-1 rounded p-1"
      style={{ borderLeftWidth: '2px', borderLeftColor: color }}
    >
      {IconComponent && (
        <IconComponent className="h-3.5 w-3.5 shrink-0 text-muted-foreground lg:h-4 lg:w-4" />
      )}
      <div className="flex flex-col gap-0.5 text-[10px] leading-none lg:text-xs">
        <span>{sportName}</span>
        {seg.plannedDurationMinutes > 0 && (
          <span className="text-muted-foreground">
            {formatMinsShort(seg.plannedDurationMinutes)}
          </span>
        )}
        {dist > 0 && isPaceRelevant(!!sport?.paceRelevant, sport?.paceUnit) && (
          <span className="text-muted-foreground">
            {dist}
            {sport.distanceUnit || 'km'}
          </span>
        )}
        {pace && <span className="text-muted-foreground">{pace}</span>}
      </div>
    </div>
  );
};

const WorkoutContent = ({
  workout,
  sport,
  dur,
  dist,
  pace,
  showStats,
}: any) => {
  const sportName = workout.sportName || sport?.name || 'Unknown';
  const IconComponent = getSportIcon(sportName, sport?.paceUnit);

  const header = (
    <div className="flex items-center gap-1 truncate text-[10px] opacity-70 lg:text-xs">
      {IconComponent && (
        <IconComponent className="h-3 w-3 shrink-0 lg:h-4 lg:w-4" />
      )}
      <span className="truncate">{sportName}</span>
    </div>
  );

  const title = (
    <div className="break-words whitespace-normal text-[10px] lg:text-xs">
      {workout.title || 'Untitled'}
    </div>
  );

  if (showStats) {
    return (
      <>
        {header}
        {title}
        <div className="text-[10px] lg:text-xs">{formatMinsShort(dur)}</div>
        {dist > 0 && isPaceRelevant(!!sport?.paceRelevant, sport?.paceUnit) && (
          <div className="text-[9px] opacity-70 lg:text-[11px]">
            {dist}
            {sport.distanceUnit || 'km'}
          </div>
        )}
        {pace && (
          <div className="text-[9px] opacity-70 lg:text-[11px]">{pace}</div>
        )}
      </>
    );
  }

  return (
    <>
      {header}
      {title}
      <div className="truncate text-[10px] opacity-70 lg:text-xs">
        {formatMinsShort(dur)}
        {dist > 0 && isPaceRelevant(!!sport?.paceRelevant, sport?.paceUnit)
          ? ` · ${dist}${sport.distanceUnit || 'km'}`
          : ''}{' '}
        {pace ? ` · ${pace}` : ''}
      </div>
    </>
  );
};
