import { useMemo, useState } from 'react';
import {
  LibraryWorkout,
  SportTypeRecord,
  UserSportSettings,
} from '@/types/training';
import { getEffortColor } from '@/services/training/effort-colors';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
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

  const userSettings = userSettingsMap.get(template.sportTypeId || '');

  const headerColor = getEffortColor(
    selectedSport,
    template.effortLevel || 1,
    userSettings,
  );

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-full sm:max-w-2xl w-full h-[100dvh] sm:h-auto sm:max-h-[95vh] flex flex-col p-0 overflow-hidden bg-background top-0 left-0 translate-x-0 translate-y-0 sm:top-[50%] sm:left-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%] border-0 sm:border rounded-none sm:rounded-xl">
        {/* Color bar */}
        <div
          className="h-2 shrink-0"
          style={{ backgroundColor: headerColor }}
        />

        <div className="flex flex-col grow overflow-hidden">
          <DialogHeader className="shrink-0 px-6 pt-5 pb-0 mb-0">
            <DialogTitle className="text-2xl font-black tracking-tight lowercase">
              {template.id ? 'edit template' : 'new template'}
            </DialogTitle>
          </DialogHeader>

          <DialogBody className="grow overflow-y-auto scrollable-y px-6 pb-4 pt-0">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 pt-4">
              {/* Left column */}
              <div className="space-y-6">
                {/* Sport selector */}
                <div className="bg-muted/50 space-y-4 rounded-2xl border p-5">
                  <SportSelector
                    sportTypes={sportTypes}
                    selectedSportId={template.sportTypeId || ''}
                    onSelect={(id) =>
                      setTemplate({ ...template, sportTypeId: id })
                    }
                    label="discipline"
                  />

                  <EffortIntensityGrid
                    selectedSport={selectedSport}
                    userSettings={userSettings}
                    currentLevel={template.effortLevel || 1}
                    onSelect={(level) =>
                      setTemplate({ ...template, effortLevel: level })
                    }
                  />
                </div>

                <div className="flex flex-col space-y-1.5">
                  {/* Key Workout Toggle */}
                  <div className="flex items-center justify-between rounded-xl border p-3">
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      key workout
                    </span>
                    <Switch
                      checked={template.isKeyWorkout}
                      onCheckedChange={(checked) =>
                        setTemplate({ ...template, isKeyWorkout: checked })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Right column */}
              <div className="space-y-6">
                <WorkoutMetricsFields
                  selectedSport={selectedSport}
                  plannedDistanceKilometers={
                    template.plannedDistanceKilometers || 0
                  }
                  plannedDurationMinutes={template.plannedDurationMinutes || 0}
                  onDistanceChange={(val) =>
                    setTemplate({ ...template, plannedDistanceKilometers: val })
                  }
                  onDurationChange={(val) =>
                    setTemplate({ ...template, plannedDurationMinutes: val })
                  }
                />

                <div className="space-y-3">
                  <Label className="text-muted-foreground ml-1 text-[10px] font-black uppercase tracking-widest">
                    details
                  </Label>
                  <Input
                    type="text"
                    placeholder="plan title..."
                    value={template.title || ''}
                    onChange={(e) =>
                      setTemplate({ ...template, title: e.target.value })
                    }
                  />
                  <Textarea
                    value={template.description || ''}
                    onChange={(e) =>
                      setTemplate({ ...template, description: e.target.value })
                    }
                    placeholder="describe the main set or focus of this workout..."
                    rows={5}
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
            <Button
              onClick={() => onSave(template)}
              className="w-full sm:flex-1"
            >
              save to library
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
