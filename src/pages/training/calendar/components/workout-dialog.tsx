import { useMemo, useState } from 'react';
import { SportTypeRecord, UserSportSettings, Workout } from '@/types/training';
import { formatDateToLocalISO } from '@/services/training/calendar.utils';
import { getEffortColor } from '@/services/training/effort-colors';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { EffortIntensityGrid } from '../../_shared/components/effort-intensity-grid';
import { SportSelector } from '../../_shared/components/sport-selector';
import { WorkoutMetricsFields } from '../../_shared/components/workout-metrics-fields';

interface WorkoutDialogProps {
  workout: Partial<Workout>;
  sportTypes: SportTypeRecord[];
  userSettingsMap: Map<string, UserSportSettings>;
  existingWorkouts: Workout[];
  onSave: (w: Partial<Workout>) => void;
  onSaveBulk?: (ws: Partial<Workout>[]) => void;
  onDelete?: (id: string, mode: 'single' | 'future') => void;
  onDeletePlan?: (planId: string) => void;
  onSwitchToNote?: () => void;
  onCancel: () => void;
  hideDate?: boolean;
  isTemplateMode?: boolean;
  totalWeeks?: number;
}

export function WorkoutDialog({
  workout: initialWorkout,
  sportTypes,
  userSettingsMap,
  existingWorkouts,
  onSave,
  onSaveBulk,
  onDelete,
  onDeletePlan,
  onSwitchToNote,
  onCancel,
  hideDate,
  isTemplateMode = false,
  totalWeeks = 4,
}: WorkoutDialogProps) {
  const isExisting = existingWorkouts.some((w) => w.id === initialWorkout.id);

  const [workout, setWorkout] = useState<Partial<Workout>>(() => ({
    id: initialWorkout.id,
    date: initialWorkout.date || formatDateToLocalISO(new Date()),
    sportTypeId: initialWorkout.sportTypeId || sportTypes[0]?.id || '',
    title: initialWorkout.title || '',
    description: initialWorkout.description || '',
    plannedDurationMinutes: initialWorkout.plannedDurationMinutes ?? 60,
    plannedDistanceKilometers: initialWorkout.plannedDistanceKilometers ?? 0,
    effortLevel: initialWorkout.effortLevel ?? 2,
    isKeyWorkout: initialWorkout.isKeyWorkout ?? false,
    intervals: initialWorkout.intervals || [],
    order: initialWorkout.order || Date.now(),
    recurrenceId: initialWorkout.recurrenceId,
    recurrenceRule: initialWorkout.recurrenceRule,
    weekNumber: initialWorkout.weekNumber || 1,
    dayOfWeek: initialWorkout.dayOfWeek || 1,
  }));

  const [isRecurring, setIsRecurring] = useState(!!initialWorkout.recurrenceId);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeletingPlan, setIsDeletingPlan] = useState(false);
  const [isDuplicated, setIsDuplicated] = useState(false);
  const [showExtendSeries, setShowExtendSeries] = useState(false);
  const [extendWeeks, setExtendWeeks] = useState(4);
  const [recurrenceConfig, setRecurrenceConfig] = useState<{
    endType: 'count' | 'date';
    endValue: number | string;
  }>({ endType: 'count', endValue: 6 });

  const selectedSport = useMemo(() => {
    return sportTypes.find((st) => st.id === workout.sportTypeId);
  }, [workout.sportTypeId, sportTypes]);

  const userSettings = userSettingsMap.get(workout.sportTypeId || '');

  // Get recurring series info
  const seriesInfo = useMemo(() => {
    if (!workout.recurrenceId || isDuplicated) return null;

    const seriesWorkouts = existingWorkouts
      .filter((w) => w.recurrenceId === workout.recurrenceId)
      .sort((a, b) => a.date.localeCompare(b.date));

    if (seriesWorkouts.length === 0) return null;

    return {
      totalCount: seriesWorkouts.length,
      startDate: seriesWorkouts[0].date,
      endDate: seriesWorkouts[seriesWorkouts.length - 1].date,
      currentIndex: seriesWorkouts.findIndex((w) => w.id === workout.id) + 1,
    };
  }, [workout.recurrenceId, workout.id, existingWorkouts, isDuplicated]);

  const headerColor = getEffortColor(
    selectedSport,
    workout.effortLevel || 1,
    userSettings,
  );

  const handleDuplicate = () => {
    setWorkout({
      ...workout,
      id: undefined,
      recurrenceId: undefined,
      recurrenceRule: undefined,
      order: Date.now(),
    });
    setIsRecurring(false);
    setIsDuplicated(true);
  };

  const handleExtendSeries = () => {
    if (!workout.recurrenceId || !seriesInfo) return;

    const instances: Partial<Workout>[] = [];
    const lastDate = new Date(seriesInfo.endDate.replace(/-/g, '/'));

    for (let i = 1; i <= extendWeeks; i++) {
      const d = new Date(lastDate);
      d.setDate(d.getDate() + i * 7);
      instances.push({
        ...workout,
        id: undefined,
        date: formatDateToLocalISO(d),
        recurrenceId: workout.recurrenceId,
        recurrenceRule: workout.recurrenceRule,
        order: Date.now() + i,
      });
    }

    onSaveBulk?.(instances);
    setShowExtendSeries(false);
  };

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

  const dialogTitle = isDuplicated
    ? 'duplicate session'
    : isExisting
      ? 'edit session'
      : 'new session';

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="max-w-full sm:max-w-2xl w-full h-[100dvh] sm:h-auto sm:max-h-[95vh] flex flex-col p-0 overflow-hidden bg-background top-0 left-0 translate-x-0 translate-y-0 sm:top-[50%] sm:left-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%] border-0 sm:border rounded-none sm:rounded-xl">
        {/* Color bar */}
        <div
          className="h-2 shrink-0"
          style={{ backgroundColor: headerColor }}
        />

        <div className="flex flex-col grow overflow-hidden">
          <DialogHeader className="shrink-0 px-6 pt-5 pb-0 mb-0">
            <DialogTitle className="text-2xl font-black tracking-tight lowercase">
              {dialogTitle}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Create, edit, or duplicate a training session on your calendar.
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="grow overflow-y-auto scrollable-y px-6 pb-4 pt-0">
            {isDuplicated && (
              <div className="mb-6 rounded-xl border border-primary/30 bg-primary/10 p-4 text-center">
                <p className="text-primary text-xs font-bold lowercase">
                  this is a duplicated session. please select a new{' '}
                  {isTemplateMode ? 'week/day' : 'date'} and save.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {/* Left column */}
              <div className="space-y-6">
                {/* Date / Week selection (at the top) */}
                {isTemplateMode && (isDuplicated || !hideDate) ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="weekNumber"
                        className="text-muted-foreground ml-1 text-[10px] font-black uppercase tracking-widest"
                      >
                        week number
                      </Label>
                      <Input
                        id="weekNumber"
                        type="number"
                        min="1"
                        max={totalWeeks}
                        value={workout.weekNumber}
                        className={
                          isDuplicated
                            ? 'border-primary ring-primary/20 ring-2'
                            : ''
                        }
                        onChange={(e) =>
                          setWorkout({
                            ...workout,
                            weekNumber: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="dayOfWeek"
                        className="text-muted-foreground ml-1 text-[10px] font-black uppercase tracking-widest"
                      >
                        day of week
                      </Label>
                      <Input
                        id="dayOfWeek"
                        type="number"
                        min="1"
                        max="7"
                        value={workout.dayOfWeek}
                        className={
                          isDuplicated
                            ? 'border-primary ring-primary/20 ring-2'
                            : ''
                        }
                        onChange={(e) =>
                          setWorkout({
                            ...workout,
                            dayOfWeek: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                ) : (
                  !hideDate && (
                    <div>
                      <Label
                        htmlFor="scheduleDate"
                        className="text-muted-foreground mb-2 ml-1 text-[10px] font-black uppercase tracking-widest"
                      >
                        schedule date
                      </Label>
                      <Input
                        id="scheduleDate"
                        type="date"
                        value={workout.date}
                        className={
                          isDuplicated
                            ? 'border-primary ring-primary/20 ring-2'
                            : ''
                        }
                        onChange={(e) =>
                          setWorkout({ ...workout, date: e.target.value })
                        }
                      />
                    </div>
                  )
                )}

                {/* Recurring Series Info */}
                {seriesInfo && (
                  <div className="bg-primary/10 dark:bg-primary/20 space-y-3 rounded-2xl border border-primary/30 p-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-primary text-[10px] font-black uppercase tracking-widest">
                        recurring series
                      </Label>
                      <span className="text-primary text-xs font-bold">
                        {seriesInfo.currentIndex} of {seriesInfo.totalCount}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <div className="text-muted-foreground text-[9px] font-bold uppercase">
                          Start
                        </div>
                        <div className="font-semibold">
                          {new Date(seriesInfo.startDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-[9px] font-bold uppercase">
                          End
                        </div>
                        <div className="font-semibold">
                          {new Date(seriesInfo.endDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowExtendSeries(!showExtendSeries)}
                      className="w-full text-[10px] font-bold"
                    >
                      {showExtendSeries ? 'cancel extend' : 'extend series'}
                    </Button>
                    {showExtendSeries && (
                      <div className="space-y-2">
                        <Label className="text-[9px] font-bold uppercase">
                          Add weeks
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            min="1"
                            max="52"
                            value={extendWeeks}
                            onChange={(e) =>
                              setExtendWeeks(Number(e.target.value))
                            }
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            size="sm"
                            onClick={handleExtendSeries}
                            className="text-[10px] font-bold"
                          >
                            add
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Sport selector */}
                <div className="bg-muted/50 space-y-4 rounded-2xl border p-5">
                  <SportSelector
                    sportTypes={sportTypes}
                    selectedSportId={workout.sportTypeId || ''}
                    onSelect={(id) =>
                      setWorkout({ ...workout, sportTypeId: id })
                    }
                    onSwitchToNote={onSwitchToNote}
                    label="sport type"
                  />

                  <EffortIntensityGrid
                    selectedSport={selectedSport}
                    userSettings={userSettings}
                    currentLevel={workout.effortLevel || 1}
                    onSelect={(level) =>
                      setWorkout({ ...workout, effortLevel: level })
                    }
                  />
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
                <WorkoutMetricsFields
                  selectedSport={selectedSport}
                  plannedDistanceKilometers={
                    workout.plannedDistanceKilometers || 0
                  }
                  plannedDurationMinutes={workout.plannedDurationMinutes || 0}
                  onDistanceChange={(val) =>
                    setWorkout({ ...workout, plannedDistanceKilometers: val })
                  }
                  onDurationChange={(val) =>
                    setWorkout({ ...workout, plannedDurationMinutes: val })
                  }
                />

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

          <DialogFooter className="shrink-0 p-6 pt-0 gap-3">
            <Button
              variant="outline"
              onClick={onCancel}
              className="w-full sm:w-auto"
            >
              cancel
            </Button>

            {isExisting && !isDuplicated && (
              <Button
                variant="outline"
                onClick={handleDuplicate}
                className="w-full sm:w-auto"
              >
                duplicate
              </Button>
            )}

            {isExisting &&
              !isDuplicated &&
              workout.appliedPlanId &&
              onDeletePlan && (
                <div className="relative w-full sm:w-auto">
                  <Button
                    variant="outline"
                    onClick={() => setIsDeletingPlan(!isDeletingPlan)}
                    className="w-full sm:w-auto border-amber-200 text-amber-700 hover:bg-amber-50"
                  >
                    {isDeletingPlan ? 'no' : 'unapply plan'}
                  </Button>
                  {isDeletingPlan && (
                    <div className="bg-card absolute bottom-full left-1/2 z-[210] mb-3 w-56 -translate-x-1/2 space-y-2 rounded-2xl border border-amber-200 p-4 shadow-2xl">
                      <p className="text-[10px] font-bold text-center leading-tight">
                        This will delete ALL workouts from this generated plan.
                        Continue?
                      </p>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-full"
                        onClick={() => onDeletePlan(workout.appliedPlanId!)}
                      >
                        confirm delete plan
                      </Button>
                    </div>
                  )}
                </div>
              )}

            {isExisting && !isDuplicated && onDelete && (
              <div className="relative w-full sm:w-auto">
                <Button
                  variant="destructive"
                  onClick={() =>
                    workout.recurrenceId
                      ? setIsDeleting(!isDeleting)
                      : onDelete(workout.id!, 'single')
                  }
                  className="w-full sm:w-auto"
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

            <Button onClick={handleSave} className="w-full sm:flex-1">
              save session
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
