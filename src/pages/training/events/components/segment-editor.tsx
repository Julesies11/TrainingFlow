import { GripVertical, Plus, Trash2 } from 'lucide-react';
import { EventSegment, SportTypeRecord } from '@/types/training';
import { getContrastColor } from '@/services/training/calendar.utils';
import {
  getEffortColor,
  getEffortLabel,
} from '@/services/training/effort-colors';
import { calculatePace } from '@/services/training/pace-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SegmentEditorProps {
  segments: Partial<EventSegment>[];
  sportTypes: SportTypeRecord[];
  userSettingsMap: Map<string, UserSportSettings>;
  onChange: (segments: Partial<EventSegment>[]) => void;
}

export function SegmentEditor({
  segments,
  sportTypes,
  userSettingsMap,
  onChange,
}: SegmentEditorProps) {
  const handleAddSegment = () => {
    const newSegment: Partial<EventSegment> = {
      sportTypeId: sportTypes[0]?.id || '',
      plannedDurationMinutes: undefined,
      plannedDistanceKilometers: undefined,
      effortLevel: 2,
      segmentOrder: segments.length,
    };
    onChange([...segments, newSegment]);
  };

  const handleRemoveSegment = (index: number) => {
    const updated = segments.filter((_, i) => i !== index);
    onChange(updated.map((seg, i) => ({ ...seg, segmentOrder: i })));
  };

  const handleUpdateSegment = (
    index: number,
    updates: Partial<EventSegment>,
  ) => {
    const updated = [...segments];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  };

  const handleMoveSegment = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === segments.length - 1)
    ) {
      return;
    }

    const updated = [...segments];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [updated[index], updated[targetIndex]] = [
      updated[targetIndex],
      updated[index],
    ];
    onChange(updated.map((seg, i) => ({ ...seg, segmentOrder: i })));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">
          event segments
        </Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddSegment}
          className="gap-1 text-[10px]"
        >
          <Plus className="h-3 w-3" />
          add segment
        </Button>
      </div>

      {segments.length === 0 ? (
        <div className="bg-muted/30 flex h-24 items-center justify-center rounded-xl border border-dashed">
          <p className="text-muted-foreground text-sm">
            No segments. This is a simple goal/event.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {segments.map((segment, index) => {
            const sport = sportTypes.find((s) => s.id === segment.sportTypeId);
            // Convert km to meters for swimming, keep km for other sports
            const distance =
              sport?.name === 'Swim'
                ? (segment.plannedDistanceKilometers || 0) * 1000
                : segment.plannedDistanceKilometers || 0;
            const pace = calculatePace(
              sport?.name || '',
              segment.plannedDurationMinutes || 0,
              distance,
            );

            return (
              <div
                key={index}
                className="bg-card flex gap-3 rounded-xl border p-4"
              >
                {/* Drag handle */}
                <div className="flex shrink-0 flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => handleMoveSegment(index, 'up')}
                    disabled={index === 0}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                  >
                    <GripVertical className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveSegment(index, 'down')}
                    disabled={index === segments.length - 1}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                  >
                    <GripVertical className="h-4 w-4" />
                  </button>
                </div>

                {/* Segment fields */}
                <div className="flex-1 space-y-3">
                  {/* Sport type */}
                  <div>
                    <Label className="text-muted-foreground mb-1 text-[9px] font-black uppercase tracking-widest">
                      sport
                    </Label>
                    <Select
                      value={segment.sportTypeId}
                      onValueChange={(value) =>
                        handleUpdateSegment(index, { sportTypeId: value })
                      }
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {sportTypes.map((st) => (
                          <SelectItem key={st.id} value={st.id}>
                            {st.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Duration & Distance */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-muted-foreground mb-1 text-[9px] font-black uppercase tracking-widest">
                        duration (min)
                      </Label>
                      <Input
                        type="number"
                        value={segment.plannedDurationMinutes || ''}
                        onChange={(e) =>
                          handleUpdateSegment(index, {
                            plannedDurationMinutes: e.target.value
                              ? Number(e.target.value)
                              : undefined,
                          })
                        }
                        className="h-8 text-xs"
                        min={0}
                      />
                    </div>
                    <div>
                      <Label className="text-muted-foreground mb-1 text-[9px] font-black uppercase tracking-widest">
                        distance (km)
                      </Label>
                      <Input
                        type="number"
                        value={segment.plannedDistanceKilometers || ''}
                        onChange={(e) =>
                          handleUpdateSegment(index, {
                            plannedDistanceKilometers: e.target.value
                              ? Number(e.target.value)
                              : undefined,
                          })
                        }
                        className="h-8 text-xs"
                        min={0}
                        step={0.1}
                      />
                    </div>
                  </div>

                  {/* Effort level selector */}
                  <div>
                    <Label className="text-muted-foreground mb-1 text-[9px] font-black uppercase tracking-widest">
                      effort level
                    </Label>
                    <div className="grid grid-cols-4 gap-2">
                      {[1, 2, 3, 4].map((level) => {
                        const levelColor = getEffortColor(
                          sport,
                          level,
                          userSettings,
                        );
                        const levelLabel = getEffortLabel(
                          sport,
                          level,
                          userSettings,
                        );
                        const isSelected = segment.effortLevel === level;

                        return (
                          <button
                            key={level}
                            type="button"
                            onClick={() =>
                              handleUpdateSegment(index, { effortLevel: level })
                            }
                            className={`flex flex-col items-center gap-1 rounded-lg p-2 transition-all ${
                              isSelected
                                ? 'ring-2 ring-primary ring-offset-2'
                                : 'hover:scale-105'
                            }`}
                            style={{ backgroundColor: levelColor }}
                          >
                            <span
                              className={`text-lg font-black ${getContrastColor(levelColor)}`}
                            >
                              {level}
                            </span>
                            <span
                              className={`text-[8px] font-semibold ${getContrastColor(levelColor)}`}
                            >
                              {levelLabel}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Pace display */}
                  {pace && (
                    <div className="bg-muted/50 rounded-lg px-3 py-2">
                      <p className="text-muted-foreground text-[9px] font-black uppercase tracking-widest">
                        calculated pace
                      </p>
                      <p className="text-sm font-bold">{pace}</p>
                    </div>
                  )}
                </div>

                {/* Delete button */}
                <div className="flex shrink-0 items-start">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveSegment(index)}
                    className="h-8 w-8 p-0 text-red-500 hover:bg-red-500/10 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Visual preview */}
      {segments.length > 0 && (
        <div className="bg-muted/50 space-y-2 rounded-xl border p-4">
          <Label className="text-muted-foreground text-[9px] font-black uppercase tracking-widest">
            event preview
          </Label>
          <div className="flex h-8 overflow-hidden rounded-lg">
            {(() => {
              const totalDuration = segments.reduce(
                (sum, s) => sum + (s.plannedDurationMinutes || 0),
                0,
              );
              return segments.map((segment, index) => {
                const sport = sportTypes.find(
                  (s) => s.id === segment.sportTypeId,
                );
                const userSettings = userSettingsMap.get(
                  segment.sportTypeId || '',
                );
                const color = getEffortColor(
                  sport,
                  segment.effortLevel || 1,
                  userSettings,
                );
                const duration = segment.plannedDurationMinutes || 0;
                const widthPercent =
                  totalDuration > 0 ? (duration / totalDuration) * 100 : 0;

                return (
                  <div
                    key={index}
                    style={{
                      backgroundColor: color,
                      width: `${widthPercent}%`,
                    }}
                    title={`${sport?.name} - ${duration} min - ${getEffortLabel(sport, segment.effortLevel || 1, userSettings)}`}
                  />
                );
              });
            })()}
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground font-semibold">
              {segments.length} segment{segments.length !== 1 ? 's' : ''}
            </span>
            <div className="flex gap-3">
              <span className="text-muted-foreground">
                Total:{' '}
                <span className="font-bold">
                  {segments.reduce(
                    (sum, s) => sum + (s.plannedDurationMinutes || 0),
                    0,
                  )}{' '}
                  min
                </span>
              </span>
              <span className="text-muted-foreground">
                <span className="font-bold">
                  {segments
                    .reduce(
                      (sum, s) => sum + (s.plannedDistanceKilometers || 0),
                      0,
                    )
                    .toFixed(1)}{' '}
                  km
                </span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
