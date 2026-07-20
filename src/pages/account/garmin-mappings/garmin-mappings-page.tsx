import { useState } from 'react';
import { GarminMappingsTable } from '@/pages/training/_shared/components/garmin-mappings-table';
import { Info, Plus, Settings2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  useGarminMappings,
  useUpsertGarminMapping,
} from '@/hooks/use-garmin-mapping';
import { useSportTypes } from '@/hooks/use-training-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function GarminMappingsPage() {
  const { data: sportTypes = [], isLoading: loadingSports } = useSportTypes();
  const { data: mappings = [], isLoading: loadingMappings } =
    useGarminMappings();
  const upsertMapping = useUpsertGarminMapping();

  // State for adding new mapping
  const [newGarminType, setNewGarminType] = useState('');
  const [newSportTypeId, setNewSportTypeId] = useState<string>('');
  const [newGarminUnit, setNewGarminUnit] = useState<'km' | 'm'>('km');

  const isLoading = loadingSports || loadingMappings;

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
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-black lowercase tracking-tight flex items-center gap-2">
            <Settings2 className="h-6 w-6 text-primary" />
            garmin activity mappings
          </h1>
          <p className="text-muted-foreground text-xs font-medium lowercase">
            manage how garmin activity types map to your app sports and units
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-4">
        <div className="bg-card overflow-hidden rounded-2xl border shadow-sm flex flex-col">
          {/* Instructions */}
          <div className="p-6 bg-primary/5 border-b space-y-4 shrink-0">
            <h4 className="text-sm font-black lowercase text-primary flex items-center gap-2">
              <Info className="h-4 w-4" />
              mappings guide
            </h4>
            <div className="text-xs font-medium text-primary/80 space-y-3 leading-relaxed max-w-4xl">
              <p>
                Garmin uses many specific activity names (like &quot;Pool
                Swim&quot; or &quot;Road Cycling&quot;). To accurately track
                your training, we need to{' '}
                <span className="font-bold">link</span> these names to the
                sports you use in this app.
              </p>
            </div>
          </div>

          {/* Manual Add Form (Responsive, outside the scroll box) */}
          <div className="p-4 bg-muted/20 border-b flex flex-col md:flex-row md:items-end gap-4 shrink-0">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  garmin activity type
                </label>
                <Input
                  placeholder="e.g. Hiking"
                  value={newGarminType}
                  onChange={(e) => setNewGarminType(e.target.value)}
                  className="lowercase text-sm h-10 border-primary/20 bg-background"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  garmin unit
                </label>
                <Select
                  value={newGarminUnit}
                  onValueChange={(val: 'km' | 'm') => setNewGarminUnit(val)}
                >
                  <SelectTrigger className="lowercase text-sm h-10 bg-background border-primary/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="km" className="lowercase text-sm">
                      km
                    </SelectItem>
                    <SelectItem value="m" className="lowercase text-sm">
                      m
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  mapped sport
                </label>
                <Select
                  value={newSportTypeId}
                  onValueChange={setNewSportTypeId}
                >
                  <SelectTrigger className="lowercase text-sm h-10 bg-background border-primary/20">
                    <SelectValue placeholder="select sport" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      value="ignore"
                      className="font-bold uppercase text-xs"
                    >
                      IGNORE
                    </SelectItem>
                    {sportTypes.map((st) => (
                      <SelectItem
                        key={st.id}
                        value={st.id}
                        className="lowercase text-sm"
                      >
                        {st.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="shrink-0">
              <Button
                onClick={handleAddMapping}
                disabled={
                  upsertMapping.isPending ||
                  !newGarminType.trim() ||
                  !newSportTypeId
                }
                className="w-full md:w-auto font-bold lowercase gap-2 h-10 px-6"
              >
                <Plus className="h-4 w-4" />
                Add Mapping
              </Button>
            </div>
          </div>

          <GarminMappingsTable
            mappings={mappings}
            sportTypes={sportTypes}
            isLoading={isLoading}
            allowSystemEdit={false}
          />
        </div>
      </div>
    </div>
  );
}
