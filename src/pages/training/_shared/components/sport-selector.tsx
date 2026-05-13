import { SportTypeRecord } from '@/types/training';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface SportSelectorProps {
  sportTypes: SportTypeRecord[];
  selectedSportId: string;
  onSelect: (id: string) => void;
  onSwitchToNote?: () => void;
  label?: string;
}

export function SportSelector({
  sportTypes,
  selectedSportId,
  onSelect,
  onSwitchToNote,
  label = 'sport type',
}: SportSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">
          {label}
        </Label>
        {sportTypes.length === 0 && (
          <span className="text-[9px] text-red-500 font-bold lowercase">
            no sports found
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {sportTypes.length > 0 ? (
          <>
            {sportTypes.map((st) => (
              <Button
                key={st.id}
                type="button"
                variant={selectedSportId === st.id ? 'primary' : 'outline'}
                size="sm"
                onClick={() => onSelect(st.id)}
                className="text-[9px] font-black lowercase"
              >
                {st.name}
              </Button>
            ))}
            {onSwitchToNote && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onSwitchToNote}
                className="text-[9px] font-black lowercase border-info/50 text-info hover:bg-info/5"
              >
                note
              </Button>
            )}
          </>
        ) : (
          <div className="text-[10px] py-2 text-muted-foreground italic">
            Please define sport types in settings first.
          </div>
        )}
      </div>
    </div>
  );
}
