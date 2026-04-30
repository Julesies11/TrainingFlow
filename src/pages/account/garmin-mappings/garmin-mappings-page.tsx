import { useState } from 'react';
import { Plus, Trash2, Watch } from 'lucide-react';
import { toast } from 'sonner';
import {
  useDeleteGarminMapping,
  useGarminMappings,
  useUpsertGarminMapping,
} from '@/hooks/use-garmin-mapping';
import { useSupabaseUserId } from '@/hooks/use-supabase-user';
import { useSportTypes } from '@/hooks/use-training-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function GarminMappingsPage() {
  const userId = useSupabaseUserId();
  const { data: sportTypes = [], isLoading: loadingSports } = useSportTypes();
  const { data: mappings = [], isLoading: loadingMappings } =
    useGarminMappings();
  const upsertMapping = useUpsertGarminMapping();
  const deleteMapping = useDeleteGarminMapping();

  const [newGarminType, setNewGarminType] = useState('');
  const [newSportTypeId, setNewSportTypeId] = useState<string>('');

  const isLoading = loadingSports || loadingMappings;

  const handleAddMapping = async () => {
    if (!newGarminType.trim() || !newSportTypeId) {
      toast.error('Please enter a Garmin activity type and select a sport');
      return;
    }

    try {
      await upsertMapping.mutateAsync({
        garminActivityType: newGarminType.trim(),
        sportTypeId: newSportTypeId,
      });
      toast.success('Mapping added successfully');
      setNewGarminType('');
      setNewSportTypeId('');
    } catch (error) {
      console.error('Failed to add mapping:', error);
      toast.error('Failed to add mapping');
    }
  };

  const handleDeleteMapping = async (id: string) => {
    try {
      await deleteMapping.mutateAsync(id);
      toast.success('Mapping deleted successfully');
    } catch (error) {
      console.error('Failed to delete mapping:', error);
      toast.error('Failed to delete mapping');
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading mappings...</div>
      </div>
    );
  }

  return (
    <div className="container-fixed">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <header className="flex shrink-0 items-center justify-between px-4 pt-2">
          <div>
            <h1 className="text-2xl font-black lowercase tracking-tighter lg:text-3xl flex items-center gap-2">
              <Watch className="h-6 w-6 lg:h-8 lg:w-8" />
              garmin mappings
            </h1>
            <p className="text-muted-foreground text-xs">
              Manage how Garmin activity types map to your custom sports
            </p>
          </div>
        </header>

        {/* Content */}
        <div className="px-4 pb-4">
          <div className="bg-card overflow-hidden rounded-2xl border shadow-sm p-4 md:p-6 flex flex-col gap-6">
            {/* Add New Mapping Form */}
            <div className="flex flex-col sm:flex-row items-end gap-3 p-4 bg-muted/30 rounded-xl border">
              <div className="flex flex-col gap-1.5 w-full sm:w-1/3">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Garmin Activity Type
                </label>
                <Input
                  placeholder="e.g. Hiking"
                  value={newGarminType}
                  onChange={(e) => setNewGarminType(e.target.value)}
                  className="lowercase text-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5 w-full sm:w-1/3">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Mapped Sport
                </label>
                <Select
                  value={newSportTypeId}
                  onValueChange={setNewSportTypeId}
                >
                  <SelectTrigger className="lowercase text-sm">
                    <SelectValue placeholder="select sport" />
                  </SelectTrigger>
                  <SelectContent>
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
              <Button
                onClick={handleAddMapping}
                disabled={
                  upsertMapping.isPending ||
                  !newGarminType.trim() ||
                  !newSportTypeId
                }
                className="w-full sm:w-auto font-bold lowercase gap-2 h-10"
              >
                <Plus className="h-4 w-4" />
                Add Mapping
              </Button>
            </div>

            {/* Mappings Table */}
            <div className="border rounded-xl overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="text-[10px] font-black uppercase">
                      Garmin Type
                    </TableHead>
                    <TableHead className="text-[10px] font-black uppercase">
                      Mapped Sport
                    </TableHead>
                    <TableHead className="text-[10px] font-black uppercase">
                      Source
                    </TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mappings.map((mapping) => {
                    const sport = sportTypes.find(
                      (st) => st.id === mapping.sportTypeId,
                    );

                    return (
                      <TableRow key={mapping.id}>
                        <TableCell className="font-medium lowercase text-sm">
                          {mapping.garminActivityType}
                        </TableCell>
                        <TableCell className="lowercase text-sm">
                          {sport?.name || (
                            <span className="text-destructive font-bold">
                              Unknown Sport
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {mapping.isSystem ? (
                            <Badge
                              variant="outline"
                              className="text-[9px] uppercase tracking-widest font-black"
                            >
                              System
                            </Badge>
                          ) : (
                            <Badge
                              variant="secondary"
                              className="text-[9px] uppercase tracking-widest font-black bg-primary/10 text-primary border-primary/20"
                            >
                              Custom
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {!mapping.isSystem && mapping.userId === userId && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 w-8 p-0"
                              onClick={() => handleDeleteMapping(mapping.id)}
                              disabled={deleteMapping.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {mappings.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-8 text-muted-foreground text-xs lowercase"
                      >
                        No mappings found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
