import { useState } from 'react';
import { SportTypeRecord } from '@/types/training';
import { getContrastColor } from '@/services/training/calendar.utils';
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

interface SportTypeDialogProps {
  sportType?: SportTypeRecord;
  onSave: (st: Partial<SportTypeRecord>) => void;
  onCancel: () => void;
}

export function SportTypeDialog({
  sportType,
  onSave,
  onCancel,
}: SportTypeDialogProps) {
  const isEdit = !!sportType?.id;

  const [formData, setFormData] = useState<Partial<SportTypeRecord>>({
    id: sportType?.id,
    name: sportType?.name || '',
    description: sportType?.description || '',
    paceRelevant: sportType?.paceRelevant ?? false,
    paceUnit: sportType?.paceUnit || '',
    distanceUnit: sportType?.distanceUnit || '',
    effort1Label: sportType?.effort1Label || 'Easy',
    effort1Hex: sportType?.effort1Hex || '#22c55e',
    effort2Label: sportType?.effort2Label || 'Moderate',
    effort2Hex: sportType?.effort2Hex || '#eab308',
    effort3Label: sportType?.effort3Label || 'Hard',
    effort3Hex: sportType?.effort3Hex || '#f97316',
    effort4Label: sportType?.effort4Label || 'Max',
    effort4Hex: sportType?.effort4Hex || '#ef4444',
  });

  const handleSubmit = () => {
    if (!formData.name?.trim()) {
      alert('Name is required');
      return;
    }
    onSave(formData);
  };

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="max-h-[90vh] w-full max-w-3xl overflow-hidden p-0">
        {/* Color bar preview */}
        <div className="flex h-3">
          {[1, 2, 3, 4].map((level) => {
            const hex = formData[
              `effort${level}Hex` as keyof SportTypeRecord
            ] as string;
            return (
              <div
                key={level}
                className="flex-1"
                style={{ backgroundColor: hex || '#ccc' }}
              />
            );
          })}
        </div>

        <div className="flex flex-col overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tight lowercase">
              {isEdit ? 'edit sport type' : 'new sport type'}
            </DialogTitle>
          </DialogHeader>

          <DialogBody>
            <div className="space-y-6">
              {/* Basic info */}
              <div className="bg-muted/50 space-y-4 rounded-2xl border p-5">
                <Label className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">
                  basic information
                </Label>
                <div>
                  <Label className="text-muted-foreground mb-2 ml-1 text-[10px] font-black uppercase tracking-widest">
                    name *
                  </Label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Run, Bike, Swim"
                  />
                </div>
                <div>
                  <Label className="text-muted-foreground mb-2 ml-1 text-[10px] font-black uppercase tracking-widest">
                    description
                  </Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Optional description..."
                    rows={2}
                  />
                </div>
              </div>

              {/* Pace settings */}
              <div className="bg-muted/50 space-y-4 rounded-2xl border p-5">
                <div className="flex items-center justify-between">
                  <Label className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">
                    pace tracking
                  </Label>
                  <Switch
                    checked={formData.paceRelevant}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, paceRelevant: checked })
                    }
                  />
                </div>
                {formData.paceRelevant && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground mb-2 ml-1 text-[10px] font-black uppercase tracking-widest">
                        distance unit
                      </Label>
                      <Input
                        type="text"
                        value={formData.distanceUnit}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            distanceUnit: e.target.value,
                          })
                        }
                        placeholder="e.g., km, mi"
                      />
                    </div>
                    <div>
                      <Label className="text-muted-foreground mb-2 ml-1 text-[10px] font-black uppercase tracking-widest">
                        pace unit
                      </Label>
                      <Input
                        type="text"
                        value={formData.paceUnit}
                        onChange={(e) =>
                          setFormData({ ...formData, paceUnit: e.target.value })
                        }
                        placeholder="e.g., min/km, km/h"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Effort levels */}
              <div className="bg-muted/50 space-y-4 rounded-2xl border p-5">
                <Label className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">
                  effort levels
                </Label>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {[1, 2, 3, 4].map((level) => {
                    const labelKey =
                      `effort${level}Label` as keyof SportTypeRecord;
                    const hexKey = `effort${level}Hex` as keyof SportTypeRecord;
                    const label = formData[labelKey] as string;
                    const hex = formData[hexKey] as string;

                    return (
                      <div key={level} className="flex flex-col gap-2">
                        <label className="relative cursor-pointer">
                          <div
                            className={`flex h-16 w-full items-center justify-center rounded-lg text-sm font-black uppercase transition-all hover:scale-105 ${getContrastColor(hex || '#ccc')}`}
                            style={{ backgroundColor: hex || '#ccc' }}
                          >
                            {level}
                          </div>
                          <input
                            type="color"
                            value={hex || '#ccc'}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                [hexKey]: e.target.value,
                              })
                            }
                            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                          />
                        </label>
                        <Input
                          type="text"
                          value={label || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              [labelKey]: e.target.value,
                            })
                          }
                          placeholder={`Level ${level}`}
                          className="h-8 text-center text-[10px] font-semibold"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </DialogBody>

          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={onCancel}>
              cancel
            </Button>
            <Button onClick={handleSubmit} className="flex-1">
              {isEdit ? 'save changes' : 'create sport type'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
