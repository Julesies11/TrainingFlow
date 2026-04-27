import { useMemo, useState } from 'react';
import {
  LibraryWorkout,
  SportTypeRecord,
  UserSportSettings,
} from '@/types/training';
import { getContrastColor } from '@/services/training/calendar.utils';
import {
  getEffortColor,
  getEffortLabel,
} from '@/services/training/effort-colors';
import {
  calculatePace,
  isMetersDistance,
  isPaceRelevant,
} from '@/services/training/pace-utils';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

interface LibraryTemplateDialogProps {
  template: Partial<LibraryWorkout>;
  sportTypes: SportTypeRecord[];
  userSettingsMap: Map<string, UserSportSettings>;
  onSave: (template: Partial<LibraryWorkout>) => void;
  onCancel: () => void;
}

export function LibraryTemplateDialog({
  template: initialTemplate,
  sportTypes,
  userSettingsMap,
  onSave,
  onCancel,
}: LibraryTemplateDialogProps) {
  const [template, setTemplate] = useState<Partial<LibraryWorkout>>({
    ...initialTemplate,
  });

  const selectedSport = useMemo(() => {
    return sportTypes.find((s) => s.id === template.sportTypeId);
  }, [template.sportTypeId, sportTypes]);

  const userSettings = useMemo(() => {
    return userSettingsMap.get(template.sportTypeId || '');
  }, [template.sportTypeId, userSettingsMap]);

  const calculatedPace = useMemo(() => {
    const dur = template.plannedDurationMinutes || 0;
    const distKm = template.plannedDistanceKilometers || 0;
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
  }, [
    template.plannedDurationMinutes,
    template.plannedDistanceKilometers,
    selectedSport,
  ]);

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-[500px] w-full max-h-[95vh] flex flex-col p-0 overflow-hidden bg-background">
        <div className="flex flex-col grow overflow-hidden">
          <DialogHeader className="shrink-0 p-6 pb-0">
            <DialogTitle className="text-2xl font-black lowercase tracking-tighter">
              {template.id ? 'edit template' : 'new template'}
            </DialogTitle>
            <DialogDescription className="text-xs font-semibold uppercase tracking-widest opacity-60">
              workout library blueprint
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="space-y-6 px-6 py-4 overflow-y-auto scrollable-y grow">
          {/* Title */}
          <div className="space-y-2">
            <Label className="text-muted-foreground ml-1 text-[10px] font-black uppercase tracking-widest">
              template title
            </Label>
            <Input
              value={template.title || ''}
              onChange={(e) =>
                setTemplate({ ...template, title: e.target.value })
              }
              placeholder="e.g., long intervals, easy recovery"
              className="text-sm font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Sport Select */}
            <div className="space-y-2">
              <Label className="text-muted-foreground ml-1 text-[10px] font-black uppercase tracking-widest">
                discipline
              </Label>
              <Select
                value={template.sportTypeId}
                onValueChange={(val) =>
                  setTemplate({ ...template, sportTypeId: val })
                }
              >
                <SelectTrigger className="text-xs font-bold">
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

            {/* Key Workout Toggle */}
            <div className="flex flex-col justify-center space-y-2 pl-2">
              <Label className="text-muted-foreground ml-1 text-[10px] font-black uppercase tracking-widest">
                priority workout
              </Label>
              <div className="flex items-center gap-3 pt-1">
                <Switch
                  checked={template.isKeyWorkout}
                  onCheckedChange={(checked) =>
                    setTemplate({ ...template, isKeyWorkout: checked })
                  }
                />
                <span className="text-[10px] font-bold uppercase opacity-60">
                  key session
                </span>
              </div>
            </div>
          </div>

          {/* Effort Level */}
          <div className="space-y-3">
            <Label className="text-muted-foreground ml-1 text-[10px] font-black uppercase tracking-widest">
              effort intensity
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((level) => {
                const color = getEffortColor(
                  selectedSport,
                  level,
                  userSettings,
                );
                const label = getEffortLabel(
                  selectedSport,
                  level,
                  userSettings,
                );
                const isSelected = template.effortLevel === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() =>
                      setTemplate({ ...template, effortLevel: level })
                    }
                    className={`flex flex-col items-center gap-1 rounded-xl p-3 transition-all hover:scale-105 active:scale-95 ${
                      isSelected
                        ? 'ring-2 ring-primary ring-offset-2'
                        : 'opacity-60 grayscale-[40%] hover:grayscale-0'
                    }`}
                    style={{ backgroundColor: color }}
                  >
                    <span
                      className={`text-xl font-black ${getContrastColor(color)}`}
                    >
                      {level}
                    </span>
                    <span
                      className={`text-[8px] font-black uppercase tracking-tighter ${getContrastColor(color)}`}
                    >
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Duration */}
            <div className="space-y-2">
              <Label className="text-muted-foreground ml-1 text-[10px] font-black uppercase tracking-widest">
                duration (min)
              </Label>
              <Input
                type="number"
                value={template.plannedDurationMinutes}
                onChange={(e) =>
                  setTemplate({
                    ...template,
                    plannedDurationMinutes: Number(e.target.value),
                  })
                }
              />
            </div>

            {/* Distance */}
            {isPaceRelevant(
              !!selectedSport?.paceRelevant,
              selectedSport?.paceUnit,
            ) && (
              <div className="space-y-2">
                <Label className="text-muted-foreground ml-1 text-[10px] font-black uppercase tracking-widest">
                  distance ({selectedSport?.distanceUnit || 'km'})
                </Label>
                <Input
                  type="number"
                  step={
                    isMetersDistance(
                      selectedSport?.distanceUnit,
                      selectedSport?.name,
                    )
                      ? '1'
                      : '0.1'
                  }
                  value={(() => {
                    const val = template.plannedDistanceKilometers || 0;
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
                    setTemplate({
                      ...template,
                      plannedDistanceKilometers: converted,
                    });
                  }}
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

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-muted-foreground ml-1 text-[10px] font-black uppercase tracking-widest">
              details
            </Label>
            <Textarea
              value={template.description || ''}
              onChange={(e) =>
                setTemplate({ ...template, description: e.target.value })
              }
              placeholder="describe the main set or focus of this workout..."
              className="min-h-[100px] text-sm leading-relaxed"
            />
          </div>
        </DialogBody>

        <DialogFooter className="shrink-0 p-6 pt-0 gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            className="w-full sm:w-auto"
          >
            discard
          </Button>
          <Button onClick={() => onSave(template)} className="w-full sm:flex-1">
            save to library
          </Button>
        </DialogFooter>
      </div>
    </DialogContent>
  </Dialog>
  );
}
