import { SportTypeRecord, UserSportSettings } from '@/types/training';
import {
  getEffortColor,
  getEffortLabel,
} from '@/services/training/effort-colors';
import { Label } from '@/components/ui/label';

interface EffortIntensityGridProps {
  selectedSport?: SportTypeRecord;
  userSettings?: UserSportSettings;
  currentLevel: number;
  onSelect: (level: number) => void;
  label?: string;
}

export function EffortIntensityGrid({
  selectedSport,
  userSettings,
  currentLevel,
  onSelect,
  label = 'effort intensity',
}: EffortIntensityGridProps) {
  return (
    <div className="space-y-2">
      <Label className="text-muted-foreground block text-[10px] font-black uppercase tracking-widest">
        {label}
      </Label>

      <div className="grid grid-cols-4 gap-2">
        {[1, 2, 3, 4].map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => onSelect(level)}
            className={`flex flex-col items-center gap-1 rounded-xl border p-2 transition-all ${
              currentLevel === level
                ? 'ring-primary/20 border-primary shadow-sm ring-2'
                : 'hover:shadow-sm opacity-80 hover:opacity-100'
            }`}
          >
            <div
              className="h-2 w-full rounded-full"
              style={{
                backgroundColor: getEffortColor(
                  selectedSport,
                  level,
                  userSettings,
                ),
              }}
            />
            <span className="text-[8px] font-black lowercase tracking-tighter">
              {getEffortLabel(selectedSport, level, userSettings)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
