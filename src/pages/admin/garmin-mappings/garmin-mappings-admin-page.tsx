import { useState } from 'react';
import { GarminMappingsTable } from '@/pages/training/_shared/components/garmin-mappings-table';
import { ArrowRight, Info, Plus, Settings2, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import {
  useGarminMappings,
  useUpsertGarminMapping,
} from '@/hooks/use-garmin-mapping';
import { useIsDeveloper } from '@/hooks/use-is-developer';
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function GarminMappingsAdminPage() {
  const isDeveloper = useIsDeveloper();
  const { data: sportTypes = [] } = useSportTypes();
  const { data: mappings = [], isLoading } = useGarminMappings();
  const upsertMutation = useUpsertGarminMapping();

  const [newGarminType, setNewGarminType] = useState('');
  const [newSportTypeId, setNewSportTypeId] = useState<string>('');
  const [newGarminUnit, setNewGarminUnit] = useState<'km' | 'm'>('km');
  const [newIsSystem, setNewIsSystem] = useState(true);

  const handleAdd = async () => {
    if (!newGarminType.trim() || !newSportTypeId) {
      toast.error('Please enter a Garmin type and select a sport');
      return;
    }

    try {
      await upsertMutation.mutateAsync({
        garminActivityType: newGarminType.trim(),
        sportTypeId: newSportTypeId === 'ignore' ? null : newSportTypeId,
        garminDistanceUnit: newGarminUnit,
        isSystem: newIsSystem,
      });
      toast.success('Mapping created');
      setNewGarminType('');
      setNewSportTypeId('');
      setNewGarminUnit('km');
    } catch (error) {
      console.error('Failed to create mapping:', error);
      toast.error('Failed to create mapping');
    }
  };

  if (!isDeveloper) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <ShieldAlert className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
          <h1 className="text-2xl font-black lowercase tracking-tight">
            access denied
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            This page is restricted to developers only.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <header className="bg-muted/30 flex shrink-0 items-center justify-between border-b px-4 py-6">
        <div>
          <h1 className="text-2xl font-black lowercase tracking-tight flex items-center gap-2">
            <Settings2 className="h-6 w-6 text-primary" />
            garmin mappings admin
          </h1>
          <p className="text-muted-foreground text-xs">
            Manage global system and custom Garmin mappings ({mappings.length}{' '}
            total)
          </p>
        </div>
      </header>

      {/* Content */}
      <div className="px-4 pb-8 pt-6">
        <div className="max-w-6xl space-y-6">
          {/* Instructions */}
          <div className="bg-card overflow-hidden rounded-2xl border shadow-sm">
            <div className="p-6 bg-primary/5 border-b space-y-4 shrink-0">
              <h4 className="text-sm font-black lowercase text-primary flex items-center gap-2">
                <Info className="h-4 w-4" />
                mappings guide
              </h4>
              <div className="text-xs font-medium text-primary/80 space-y-3 leading-relaxed max-w-4xl">
                <p>
                  Garmin uses many specific activity names (like &quot;Pool
                  Swim&quot; or &quot;Road Cycling&quot;). To accurately track
                  training, we need to <span className="font-bold">link</span>{' '}
                  these names to the sports used in this app.
                </p>
              </div>
            </div>
          </div>

          {/* Add Form */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-card p-5 rounded-2xl border shadow-sm items-end">
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                garmin activity type
              </label>
              <Input
                placeholder="e.g. Paragliding..."
                value={newGarminType}
                onChange={(e) => setNewGarminType(e.target.value)}
                className="h-10 lowercase"
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                garmin unit
              </label>
              <Select
                value={newGarminUnit}
                onValueChange={(v: 'km' | 'm') => setNewGarminUnit(v)}
              >
                <SelectTrigger className="h-10 lowercase">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="km">km</SelectItem>
                  <SelectItem value="m">m</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-1 flex justify-center pb-3">
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-30" />
            </div>

            <div className="md:col-span-3 space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                mapped sport
              </label>
              <Select value={newSportTypeId} onValueChange={setNewSportTypeId}>
                <SelectTrigger className="h-10 lowercase">
                  <SelectValue placeholder="select sport" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    value="ignore"
                    className="font-bold text-warning uppercase text-xs"
                  >
                    IGNORE
                  </SelectItem>
                  {sportTypes.map((st) => (
                    <SelectItem key={st.id} value={st.id} className="lowercase">
                      {st.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                source
              </label>
              <Tabs
                value={newIsSystem ? 'system' : 'custom'}
                onValueChange={(v) => setNewIsSystem(v === 'system')}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 h-10">
                  <TabsTrigger
                    value="custom"
                    className="text-[10px] font-black uppercase"
                  >
                    custom
                  </TabsTrigger>
                  <TabsTrigger
                    value="system"
                    className="text-[10px] font-black uppercase"
                  >
                    system
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="md:col-span-1">
              <Button
                onClick={handleAdd}
                disabled={
                  upsertMutation.isPending ||
                  !newGarminType.trim() ||
                  !newSportTypeId
                }
                className="w-full h-10"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Table */}
          <GarminMappingsTable
            mappings={mappings}
            sportTypes={sportTypes}
            isLoading={isLoading}
            allowSystemEdit={true}
          />
        </div>
      </div>
    </div>
  );
}
