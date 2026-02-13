import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Workout,
  SportType,
  IntensitySettings,
  WorkoutTypeOptions,
} from '@/types/training';
import {
  formatDateToLocalISO,
  getWorkoutPace,
  getContrastColor,
} from '@/services/training/calendar.utils';

interface WorkoutDialogProps {
  workout: Partial<Workout>;
  intensitySettings?: IntensitySettings;
  workoutTypeOptions?: WorkoutTypeOptions;
  existingWorkouts: Workout[];
  onSave: (w: Partial<Workout>) => void;
  onSaveBulk?: (ws: Partial<Workout>[]) => void;
  onDelete?: (id: string, mode: 'single' | 'future') => void;
  onCancel: () => void;
}

const SPORTS: SportType[] = ['Swim', 'Bike', 'Run', 'Strength'];

export function WorkoutDialog({
  workout: initialWorkout,
  intensitySettings,
  workoutTypeOptions,
  existingWorkouts,
  onSave,
  onSaveBulk,
  onDelete,
  onCancel,
}: WorkoutDialogProps) {
  const isExisting = existingWorkouts.some((w) => w.id === initialWorkout.id);

  const [workout, setWorkout] = useState<Partial<Workout>>(() => ({
    id: initialWorkout.id,
    date: initialWorkout.date || formatDateToLocalISO(new Date()),
    sport: initialWorkout.sport || 'Bike',
    workoutType: initialWorkout.workoutType || '',
    title: initialWorkout.title || '',
    description: initialWorkout.description || '',
    plannedDurationMinutes: initialWorkout.plannedDurationMinutes ?? 60,
    plannedDistanceKilometers: initialWorkout.plannedDistanceKilometers ?? 0,
    effortLevel: initialWorkout.effortLevel ?? 2,
    isKeyWorkout: initialWorkout.isKeyWorkout ?? false,
    intervals: initialWorkout.intervals || [],
    isCompleted: initialWorkout.isCompleted ?? false,
    order: initialWorkout.order || Date.now(),
    recurrenceId: initialWorkout.recurrenceId,
    recurrenceRule: initialWorkout.recurrenceRule,
  }));

  const [isRecurring, setIsRecurring] = useState(
    !!initialWorkout.recurrenceId,
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [recurrenceConfig, setRecurrenceConfig] = useState<{
    endType: 'count' | 'date';
    endValue: number | string;
  }>({ endType: 'count', endValue: 6 });

  const effortOptions = useMemo(() => {
    return intensitySettings?.[workout.sport as SportType] || {};
  }, [workout.sport, intensitySettings]);

  const calculatedPace = useMemo(() => {
    const dur = workout.plannedDurationMinutes || 0;
    const dist = workout.plannedDistanceKilometers || 0;
    if (dur > 0 && dist > 0 && workout.sport !== 'Strength') {
      return getWorkoutPace(workout.sport as SportType, dur, dist);
    }
    return '';
  }, [
    workout.plannedDurationMinutes,
    workout.plannedDistanceKilometers,
    workout.sport,
  ]);

  const headerColor =
    effortOptions[workout.effortLevel || 1]?.hexColor || '#3b82f6';

  const handleSave = () => {
    if (isRecurring && !workout.recurrenceId) {
      if (workout.id && isExisting && onDelete) {
        onDelete(workout.id, 'single');
      }
      const instances: Partial<Workout>[] = [];
      const recId = `rec-${Date.now()}`;
      const startDate = new Date(workout.date!.replace(/-/g, '/'));
      const count =
        recurrenceConfig.endType === 'count'
          ? Number(recurrenceConfig.endValue)
          : 52;
      for (let i = 0; i < count; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i * 7);
        instances.push({
          ...workout,
          id: undefined,
          date: formatDateToLocalISO(d),
          recurrenceId: recId,
          recurrenceRule: {
            frequency: 'weekly',
            endType: recurrenceConfig.endType,
            endValue: recurrenceConfig.endValue,
          },
          order: Date.now() + i,
        });
      }
      onSaveBulk?.(instances);
    } else {
      onSave(workout);
    }
  };

  const dialogTitle = isExisting ? 'edit session' : 'new session';

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="max-h-[90vh] w-full max-w-2xl overflow-hidden p-0">
        {/* Color bar */}
        <div className="h-2 shrink-0" style={{ backgroundColor: headerColor }} />

        <div className="flex flex-col overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tight lowercase">
              {dialogTitle}
            </DialogTitle>
          </DialogHeader>

          <DialogBody>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {/* Left column */}
              <div className="space-y-6">
                {/* Date (at the top) */}
                <div>
                  <Label className="text-muted-foreground mb-2 ml-1 text-[10px] font-black uppercase tracking-widest">
                    schedule date
                  </Label>
                  <Input
                    type="date"
                    value={workout.date}
                    onChange={(e) =>
                      setWorkout({ ...workout, date: e.target.value })
                    }
                  />
                </div>

                {/* Sport selector */}
                <div className="bg-muted/50 space-y-4 rounded-2xl border p-5">
                  <Label className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">
                    sport & effort level
                  </Label>
                  <div className="grid grid-cols-4 gap-2">
                    {SPORTS.map((s) => (
                      <Button
                        key={s}
                        type="button"
                        variant={workout.sport === s ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() =>
                          setWorkout({ ...workout, sport: s })
                        }
                        className="text-[9px] font-black lowercase"
                      >
                        {s}
                      </Button>
                    ))}
                  </div>

                  {/* Effort selector */}
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() =>
                          setWorkout({ ...workout, effortLevel: level })
                        }
                        className={`flex flex-col items-center gap-1 rounded-xl border p-2 transition-all ${
                          workout.effortLevel === level
                            ? 'ring-primary/20 border-primary shadow-sm ring-2'
                            : 'hover:shadow-sm opacity-80 hover:opacity-100'
                        }`}
                      >
                        <div
                          className="h-2 w-full rounded-full"
                          style={{
                            backgroundColor:
                              effortOptions[level]?.hexColor || '#ccc',
                          }}
                        />
                        <span className="text-[9px] font-black lowercase tracking-tighter">
                          level {level}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recurrence */}
                <div className="space-y-4">
                  <div className="bg-primary/5 space-y-3 rounded-2xl border p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-primary text-[10px] font-black uppercase tracking-widest">
                        recurring series
                      </span>
                      <Switch
                        checked={isRecurring}
                        onCheckedChange={setIsRecurring}
                      />
                    </div>
                    {isRecurring && !workout.recurrenceId && (
                      <div className="flex items-center gap-3 border-t pt-3">
                        <span className="text-muted-foreground shrink-0 text-[10px] font-bold uppercase">
                          repeat for
                        </span>
                        <Input
                          type="number"
                          min="1"
                          max="52"
                          value={recurrenceConfig.endValue}
                          onChange={(e) =>
                            setRecurrenceConfig({
                              ...recurrenceConfig,
                              endValue: Number(e.target.value),
                            })
                          }
                          className="w-20"
                        />
                        <span className="text-muted-foreground text-[10px] font-bold uppercase">
                          weeks
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right column */}
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground mb-2 ml-1 text-[10px] font-black uppercase tracking-widest">
                      duration (m)
                    </Label>
                    <Input
                      type="number"
                      value={workout.plannedDurationMinutes}
                      onChange={(e) =>
                        setWorkout({
                          ...workout,
                          plannedDurationMinutes: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  {workout.sport !== 'Strength' && (
                    <div>
                      <Label className="text-muted-foreground mb-2 ml-1 text-[10px] font-black uppercase tracking-widest">
                        distance (km)
                      </Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={workout.plannedDistanceKilometers}
                        onChange={(e) =>
                          setWorkout({
                            ...workout,
                            plannedDistanceKilometers: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                  )}
                </div>

                {calculatedPace && (
                  <div className="bg-primary/5 flex items-center justify-between rounded-xl border p-3">
                    <span className="text-primary text-[9px] font-black uppercase tracking-widest">
                      calculated pace
                    </span>
                    <span className="text-primary text-sm font-black">
                      {calculatedPace}
                    </span>
                  </div>
                )}

                <div className="space-y-3">
                  <Label className="text-muted-foreground ml-1 text-[10px] font-black uppercase tracking-widest">
                    details
                  </Label>
                  <Input
                    type="text"
                    placeholder="session title..."
                    value={workout.title}
                    onChange={(e) =>
                      setWorkout({ ...workout, title: e.target.value })
                    }
                  />
                  <Textarea
                    value={workout.description}
                    onChange={(e) =>
                      setWorkout({ ...workout, description: e.target.value })
                    }
                    placeholder="coach notes or workout structure..."
                    rows={5}
                  />
                </div>

                {/* Key workout toggle */}
                <div className="flex items-center justify-between rounded-xl border p-3">
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    key workout
                  </span>
                  <Switch
                    checked={workout.isKeyWorkout}
                    onCheckedChange={(checked) =>
                      setWorkout({ ...workout, isKeyWorkout: checked })
                    }
                  />
                </div>
              </div>
            </div>
          </DialogBody>

          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={onCancel}>
              cancel
            </Button>

            {isExisting && onDelete && (
              <div className="relative">
                <Button
                  variant="destructive"
                  onClick={() =>
                    workout.recurrenceId
                      ? setIsDeleting(!isDeleting)
                      : onDelete(workout.id!, 'single')
                  }
                >
                  {isDeleting ? 'no' : 'delete'}
                </Button>
                {isDeleting && workout.recurrenceId && (
                  <div className="bg-card absolute bottom-full left-1/2 z-[210] mb-3 w-48 -translate-x-1/2 space-y-2 rounded-2xl border p-4 shadow-2xl">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-destructive"
                      onClick={() => onDelete(workout.id!, 'single')}
                    >
                      only this
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full"
                      onClick={() => onDelete(workout.id!, 'future')}
                    >
                      all future
                    </Button>
                  </div>
                )}
              </div>
            )}

            <Button onClick={handleSave} className="flex-1">
              save session
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
