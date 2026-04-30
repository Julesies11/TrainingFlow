import React, { useState } from 'react';
import { GarminMappingsTable } from '@/pages/training/_shared/components/garmin-mappings-table';
import { ArrowRight, Info, Plus, Settings2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  useGarminMappings,
  useUpsertGarminMapping,
} from '@/hooks/use-garmin-mapping';
import { useSportTypes } from '@/hooks/use-training-data';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface GarminMappingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GarminMappingsDialog({
  open,
  onOpenChange,
}: GarminMappingsDialogProps) {
  const { data: sportTypes = [] } = useSportTypes();
  const { data: mappings = [], isLoading } = useGarminMappings();
  const upsertMapping = useUpsertGarminMapping();

  // State for adding new mapping
  const [newGarminType, setNewGarminType] = useState('');
  const [newSportTypeId, setNewSportTypeId] = useState<string>('');
  const [newGarminUnit, setNewGarminUnit] = useState<'km' | 'm'>('km');

  const handleAddMapping = async () => {
    const trimmedType = newGarminType.trim();
    if (!trimmedType || !newSportTypeId) {
      toast.error('Please enter a Garmin activity type and select a sport');
      return;
    }

    // Validation: Check if a system mapping already exists for this type
    const systemMappingExists = mappings.some(
      (m) =>
        m.isSystem &&
        m.garminActivityType.toLowerCase() === trimmedType.toLowerCase(),
    );

    if (systemMappingExists) {
      toast.error(`A system mapping for "${trimmedType}" already exists.`);
      return;
    }

    try {
      await upsertMapping.mutateAsync({
        garminActivityType: trimmedType,
        sportTypeId: newSportTypeId === 'ignore' ? null : newSportTypeId,
        garminDistanceUnit: newGarminUnit,
        isSystem: false,
      });
      toast.success('Mapping added successfully');
      setNewGarminType('');
      setNewSportTypeId('');
      setNewGarminUnit('km');
    } catch (error) {
      console.error('Failed to add mapping:', error);
      toast.error('Failed to add mapping');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-primary" />
            <DialogTitle className="text-xl font-black lowercase tracking-tight">
              manage garmin mappings
            </DialogTitle>
          </div>
          <DialogDescription className="sr-only">
            Configure how Garmin activity types map to your sports.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-0 flex flex-col">
          {/* Instructions */}
          <div className="p-6 bg-primary/5 border-b space-y-4 shrink-0">
            <h4 className="text-sm font-black lowercase text-primary flex items-center gap-2">
              <Info className="h-4 w-4" />
              mappings guide
            </h4>
            <div className="text-[11px] font-medium text-primary/80 space-y-3 leading-relaxed">
              <p>
                Garmin uses many specific activity names (like &quot;Pool
                Swim&quot; or &quot;Road Cycling&quot;). To accurately track
                your training, we need to{' '}
                <span className="font-bold">link</span> these names to the
                sports you use in this app.
              </p>
            </div>
          </div>

          {/* Table Container */}
          <div className="flex-1 overflow-auto">
            <div className="min-w-[600px]">
              {/* Quick Add Row */}
              <div className="grid grid-cols-12 gap-2 p-3 bg-muted/20 border-b-2 items-end">
                <div className="col-span-3 space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                    Garmin Type
                  </label>
                  <Input
                    placeholder="e.g. Hiking"
                    value={newGarminType}
                    onChange={(e) => setNewGarminType(e.target.value)}
                    className="lowercase text-xs h-8 border-primary/20 bg-background"
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                    Unit
                  </label>
                  <Select
                    value={newGarminUnit}
                    onValueChange={(val: 'km' | 'm') => setNewGarminUnit(val)}
                  >
                    <SelectTrigger className="lowercase text-xs h-8 bg-background border-primary/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="km" className="lowercase text-xs">
                        km
                      </SelectItem>
                      <SelectItem value="m" className="lowercase text-xs">
                        m
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-1 flex justify-center pb-2">
                  <ArrowRight className="h-3 w-3 text-muted-foreground opacity-30" />
                </div>
                <div className="col-span-3 space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                    Sport
                  </label>
                  <Select
                    value={newSportTypeId}
                    onValueChange={setNewSportTypeId}
                  >
                    <SelectTrigger className="lowercase text-xs h-8 bg-background border-primary/20">
                      <SelectValue placeholder="select sport" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        value="ignore"
                        className="font-bold uppercase text-xs text-warning"
                      >
                        IGNORE
                      </SelectItem>
                      {sportTypes.map((st) => (
                        <SelectItem
                          key={st.id}
                          value={st.id}
                          className="lowercase text-xs"
                        >
                          {st.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-3">
                  <Button
                    onClick={handleAddMapping}
                    disabled={
                      upsertMapping.isPending ||
                      !newGarminType.trim() ||
                      !newSportTypeId
                    }
                    size="sm"
                    className="w-full font-bold lowercase gap-1.5 h-8 text-[10px]"
                  >
                    <Plus className="h-3 w-3" />
                    add
                  </Button>
                </div>
              </div>

              {/* Shared Table */}
              <GarminMappingsTable
                mappings={mappings}
                sportTypes={sportTypes}
                isLoading={isLoading}
                allowSystemEdit={false}
              />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t bg-muted/30 flex justify-end">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="font-bold lowercase"
          >
            close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
