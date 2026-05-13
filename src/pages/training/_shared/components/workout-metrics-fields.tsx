import { useMemo } from 'react';
import { SportTypeRecord } from '@/types/training';
import {
  calculatePace,
  isMetersDistance,
  isPaceRelevant,
} from '@/services/training/pace-utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface WorkoutMetricsFieldsProps {
  selectedSport?: SportTypeRecord;
  plannedDistanceKilometers: number;
  plannedDurationMinutes: number;
  onDistanceChange: (val: number) => void;
  onDurationChange: (val: number) => void;
}

export function WorkoutMetricsFields({
  selectedSport,
  plannedDistanceKilometers,
  plannedDurationMinutes,
  onDistanceChange,
  onDurationChange,
}: WorkoutMetricsFieldsProps) {
  const calculatedPace = useMemo(() => {
    const dur = plannedDurationMinutes || 0;
    const distKm = plannedDistanceKilometers || 0;
    // Convert km to meters if needed
    const dist = isMetersDistance(
      selectedSport?.distanceUnit,
      selectedSport?.name,
    )
      ? distKm * 1000
      : distKm;
    return calculatePace(
      selectedSport?.paceUnit,
      dur,
      dist,
      selectedSport?.name,
    );
  }, [plannedDurationMinutes, plannedDistanceKilometers, selectedSport]);

  const isDistRelevant = isPaceRelevant(
    !!selectedSport?.paceRelevant,
    selectedSport?.paceUnit,
  );

  return (
    <div className="grid grid-cols-3 gap-3">
      {isDistRelevant ? (
        <div>
          <Label
            htmlFor="planned-distance"
            className="text-muted-foreground mb-2 ml-1 text-[10px] font-black uppercase tracking-widest leading-none"
          >
            dist ({selectedSport?.distanceUnit || 'km'})
          </Label>
          <Input
            id="planned-distance"
            type="number"
            step={
              isMetersDistance(selectedSport?.distanceUnit, selectedSport?.name)
                ? '1'
                : '0.1'
            }
            value={(() => {
              const val = plannedDistanceKilometers || 0;
              return isMetersDistance(
                selectedSport?.distanceUnit,
                selectedSport?.name,
              )
                ? Math.round(val * 1000)
                : val;
            })()}
            onChange={(e) => {
              const val = Number(e.target.value);
              const converted = isMetersDistance(
                selectedSport?.distanceUnit,
                selectedSport?.name,
              )
                ? val / 1000
                : val;
              onDistanceChange(converted);
            }}
          />
        </div>
      ) : (
        <div />
      )}

      <div>
        <Label
          htmlFor="planned-duration"
          className="text-muted-foreground mb-2 ml-1 text-[10px] font-black uppercase tracking-widest"
        >
          dur (m)
        </Label>
        <Input
          id="planned-duration"
          type="number"
          value={plannedDurationMinutes}
          onChange={(e) => onDurationChange(Number(e.target.value))}
        />
      </div>

      {calculatedPace && (
        <div className="space-y-2">
          <Label className="text-primary mb-2 ml-1 text-[10px] font-black uppercase tracking-widest">
            pace
          </Label>
          <div className="bg-primary/5 flex h-10 items-center justify-center rounded-lg border border-primary/20 text-primary text-[11px] font-black px-1 text-center leading-none">
            {calculatedPace}
          </div>
        </div>
      )}
    </div>
  );
}
