import { Calendar, Pencil, Trash2 } from 'lucide-react';
import { SportTypeRecord, UserSportSettings, Workout } from '@/types/training';
import { getEffortColor } from '@/services/training/effort-colors';
import { Button } from '@/components/ui/button';

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

interface DailySessionsProps {
  title: string;
  workouts: Workout[];
  sportMap: Map<string, SportTypeRecord>;
  settingsMap: Map<string, UserSportSettings>;
  onEdit?: (workout: Workout) => void;
  onDelete?: (workout: Workout) => void;
}

export function DailySessions({
  title,
  workouts,
  sportMap,
  settingsMap,
  onEdit,
  onDelete,
}: DailySessionsProps) {
  return (
    <div className="bg-card overflow-hidden rounded-2xl border shadow-sm">
      <div className="border-b bg-muted/30 px-5 py-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          <h3 className="text-base md:text-lg font-black lowercase tracking-tight">
            {title}
          </h3>
        </div>
      </div>
      <div className="p-5">
        {workouts.length > 0 ? (
          <div className="space-y-6">
            {workouts.map((workout, index) => (
              <div
                key={workout.id}
                className={index > 0 ? 'border-t pt-6' : ''}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="h-16 w-2 shrink-0 rounded-full"
                    style={{
                      backgroundColor: getEffortColor(
                        sportMap.get(workout.sportTypeId),
                        workout.effortLevel,
                        settingsMap.get(workout.sportTypeId),
                      ),
                    }}
                  />
                  <div className="flex-1">
                    <h4 className="text-lg font-black tracking-tight">
                      {workout.title || workout.sportName}
                    </h4>
                    <p className="text-muted-foreground text-sm font-medium">
                      {workout.sportName}
                    </p>
                    <div className="mt-3 flex gap-4 text-sm">
                      {workout.plannedDurationMinutes && (
                        <div>
                          <span className="text-muted-foreground font-medium">
                            Duration:{' '}
                          </span>
                          <span className="font-bold">
                            {formatMins(workout.plannedDurationMinutes)}
                          </span>
                        </div>
                      )}
                      {workout.plannedDistanceKilometers && (
                        <div>
                          <span className="text-muted-foreground font-medium">
                            Distance:{' '}
                          </span>
                          <span className="font-bold">
                            {workout.plannedDistanceKilometers} km
                          </span>
                        </div>
                      )}
                    </div>
                    {workout.description && (
                      <p className="mt-3 text-sm text-muted-foreground">
                        {workout.description}
                      </p>
                    )}
                  </div>
                </div>
                {(onEdit || onDelete) && (
                  <div className="mt-4 flex gap-2">
                    {onEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(workout)}
                        className="gap-1"
                      >
                        <Pencil className="h-3 w-3" />
                        Edit
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(workout)}
                        className="gap-1 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-32 items-center justify-center">
            <p className="text-muted-foreground text-sm">
              No workout scheduled for today
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
