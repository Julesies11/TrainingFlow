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
import { LibraryWorkout, SportTypeRecord, UserSportSettings } from '@/types/training';
import { getEffortColor, getEffortLabel } from '@/services/training/effort-colors';

interface LibraryTemplateDialogProps {
  template: Partial<LibraryWorkout>;
  sportTypes: SportTypeRecord[];
  userSettingsMap: Map<string, UserSportSettings>;
  onSave: (t: Partial<LibraryWorkout>) => void;
  onCancel: () => void;
}

export function LibraryTemplateDialog({
  template: initial,
  sportTypes,
  userSettingsMap,
  onSave,
  onCancel,
}: LibraryTemplateDialogProps) {
  const isExisting = !!initial.id;

  const [template, setTemplate] = useState<Partial<LibraryWorkout>>(() => ({
    id: initial.id,
    sportTypeId: initial.sportTypeId || sportTypes[0]?.id || '',
    title: initial.title || '',
    description: initial.description || '',
    plannedDurationMinutes: initial.plannedDurationMinutes ?? 60,
    plannedDistanceKilometers: initial.plannedDistanceKilometers ?? 0,
    effortLevel: initial.effortLevel ?? 2,
    isKeyWorkout: initial.isKeyWorkout ?? false,
  }));

  const selectedSport = useMemo(() => {
    return sportTypes.find((st) => st.id === template.sportTypeId);
  }, [template.sportTypeId, sportTypes]);

  const userSettings = userSettingsMap.get(template.sportTypeId || '');
  const headerColor = getEffortColor(selectedSport, template.effortLevel || 1, userSettings);

  const dialogTitle = isExisting ? 'edit template' : 'new template';

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
                {/* Sport selector */}
                <div className="bg-muted/50 space-y-4 rounded-2xl border p-5">
                  <Label className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">
                    sport & effort level
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {sportTypes.map((st) => (
                      <Button
                        key={st.id}
                        type="button"
                        variant={template.sportTypeId === st.id ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() =>
                          setTemplate({ ...template, sportTypeId: st.id })
                        }
                        className="text-[9px] font-black lowercase"
                      >
                        {st.name}
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
                          setTemplate({ ...template, effortLevel: level })
                        }
                        className={`flex flex-col items-center gap-1 rounded-xl border p-2 transition-all ${
                          template.effortLevel === level
                            ? 'ring-primary/20 border-primary shadow-sm ring-2'
                            : 'hover:shadow-sm opacity-80 hover:opacity-100'
                        }`}
                      >
                        <div
                          className="h-2 w-full rounded-full"
                          style={{
                            backgroundColor: getEffortColor(selectedSport, level, userSettings),
                          }}
                        />
                        <span className="text-[8px] font-black lowercase tracking-tighter">
                          {getEffortLabel(selectedSport, level, userSettings)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Key workout toggle */}
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

              {/* Right column */}
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground mb-2 ml-1 text-[10px] font-black uppercase tracking-widest">
                      duration (m)
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
                  {selectedSport?.paceRelevant && (
                    <div>
                      <Label className="text-muted-foreground mb-2 ml-1 text-[10px] font-black uppercase tracking-widest">
                        distance ({selectedSport.distanceUnit || 'km'})
                      </Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={template.plannedDistanceKilometers}
                        onChange={(e) =>
                          setTemplate({
                            ...template,
                            plannedDistanceKilometers: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <Label className="text-muted-foreground ml-1 text-[10px] font-black uppercase tracking-widest">
                    details
                  </Label>
                  <Input
                    type="text"
                    placeholder="template title..."
                    value={template.title}
                    onChange={(e) =>
                      setTemplate({ ...template, title: e.target.value })
                    }
                  />
                  <Textarea
                    value={template.description}
                    onChange={(e) =>
                      setTemplate({ ...template, description: e.target.value })
                    }
                    placeholder="workout structure or notes..."
                    rows={5}
                  />
                </div>
              </div>
            </div>
          </DialogBody>

          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={onCancel}>
              cancel
            </Button>
            <Button onClick={() => onSave(template)} className="flex-1">
              {isExisting ? 'save changes' : 'create template'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
