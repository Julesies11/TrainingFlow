import React, { useMemo, useState } from 'react';
import { ArrowRight, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { GarminSportMapping, SportTypeRecord } from '@/types/training';
import {
  useDeleteGarminMapping,
  useUpsertGarminMapping,
} from '@/hooks/use-garmin-mapping';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

interface GarminMappingsTableProps {
  mappings: GarminSportMapping[];
  sportTypes: SportTypeRecord[];
  isLoading: boolean;
  allowSystemEdit?: boolean;
}

export function GarminMappingsTable({
  mappings,
  sportTypes,
  isLoading,
  allowSystemEdit = false,
}: GarminMappingsTableProps) {
  const upsertMapping = useUpsertGarminMapping();
  const deleteMapping = useDeleteGarminMapping();

  // Sorting state
  const [sortConfig, setSortOrder] = useState<{
    key: 'garmin' | 'sport' | 'unit';
    dir: 'asc' | 'desc';
  }>({ key: 'sport', dir: 'asc' });

  const handleInlineUpdate = async (
    mapping: GarminSportMapping,
    updates: { sportTypeId?: string | null; garminDistanceUnit?: 'km' | 'm' },
  ) => {
    try {
      await upsertMapping.mutateAsync({
        ...mapping,
        sportTypeId:
          updates.sportTypeId === 'ignore'
            ? null
            : updates.sportTypeId !== undefined
              ? updates.sportTypeId
              : mapping.sportTypeId,
        garminDistanceUnit:
          updates.garminDistanceUnit || mapping.garminDistanceUnit,
      });
      toast.success('Mapping updated');
    } catch (error) {
      console.error('Failed to update mapping:', error);
      toast.error('Failed to update mapping');
    }
  };

  const handleDeleteMapping = async (id: string) => {
    if (!confirm('Are you sure you want to delete this mapping?')) return;
    try {
      await deleteMapping.mutateAsync(id);
      toast.success('Mapping deleted successfully');
    } catch (error) {
      console.error('Failed to delete mapping:', error);
      toast.error('Failed to delete mapping');
    }
  };

  const sortedMappings = useMemo(() => {
    const list = [...mappings];
    return list.sort((a, b) => {
      let valA = '';
      let valB = '';

      if (sortConfig.key === 'garmin') {
        valA = a.garminActivityType.toLowerCase();
        valB = b.garminActivityType.toLowerCase();
      } else if (sortConfig.key === 'unit') {
        valA = a.garminDistanceUnit;
        valB = b.garminDistanceUnit;
      } else {
        const sA =
          sportTypes.find((s) => s.id === a.sportTypeId)?.name || 'zzzz';
        const sB =
          sportTypes.find((s) => s.id === b.sportTypeId)?.name || 'zzzz';
        valA = a.sportTypeId === null ? 'yyyy' : sA.toLowerCase();
        valB = b.sportTypeId === null ? 'yyyy' : sB.toLowerCase();
      }

      if (valA < valB) return sortConfig.dir === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.dir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [mappings, sortConfig, sportTypes]);

  const toggleSort = (key: 'garmin' | 'sport' | 'unit') => {
    setSortOrder((prev) => ({
      key,
      dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc',
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        loading mappings...
      </div>
    );
  }

  return (
    <div className="overflow-auto border rounded-xl">
      <Table>
        <TableHeader className="bg-muted/50 sticky top-0 z-10 shadow-sm">
          <TableRow>
            <TableHead
              className="text-[10px] font-black uppercase cursor-pointer hover:text-primary transition-colors"
              onClick={() => toggleSort('garmin')}
            >
              Garmin Type{' '}
              {sortConfig.key === 'garmin' &&
                (sortConfig.dir === 'asc' ? '↑' : '↓')}
            </TableHead>
            <TableHead
              className="text-[10px] font-black uppercase cursor-pointer hover:text-primary transition-colors w-[120px]"
              onClick={() => toggleSort('unit')}
            >
              Garmin Unit{' '}
              {sortConfig.key === 'unit' &&
                (sortConfig.dir === 'asc' ? '↑' : '↓')}
            </TableHead>
            <TableHead className="w-[40px]"></TableHead>
            <TableHead
              className="text-[10px] font-black uppercase cursor-pointer hover:text-primary transition-colors"
              onClick={() => toggleSort('sport')}
            >
              Mapped Sport{' '}
              {sortConfig.key === 'sport' &&
                (sortConfig.dir === 'asc' ? '↑' : '↓')}
            </TableHead>
            <TableHead className="text-[10px] font-black uppercase w-[100px]">
              Source
            </TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedMappings.map((mapping) => {
            const canEdit = allowSystemEdit || !mapping.isSystem;
            return (
              <TableRow key={mapping.id} className="group">
                <TableCell className="font-bold lowercase text-xs">
                  {mapping.garminActivityType}
                </TableCell>
                <TableCell>
                  <Select
                    defaultValue={mapping.garminDistanceUnit}
                    onValueChange={(val: 'km' | 'm') =>
                      handleInlineUpdate(mapping, { garminDistanceUnit: val })
                    }
                    disabled={!canEdit}
                  >
                    <SelectTrigger
                      className={`lowercase text-xs h-7 transition-colors px-2 ${
                        canEdit
                          ? 'border border-muted-foreground/10 bg-muted/20 hover:bg-muted/40 hover:border-muted-foreground/20'
                          : 'border-none bg-transparent opacity-100 cursor-default shadow-none'
                      }`}
                    >
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
                </TableCell>
                <TableCell className="text-center opacity-30 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="h-3 w-3 inline text-primary" />
                </TableCell>
                <TableCell>
                  <Select
                    defaultValue={mapping.sportTypeId || 'ignore'}
                    onValueChange={(val) =>
                      handleInlineUpdate(mapping, { sportTypeId: val })
                    }
                    disabled={!canEdit}
                  >
                    <SelectTrigger
                      className={`lowercase text-xs h-7 transition-colors px-2 ${
                        canEdit
                          ? 'border border-muted-foreground/10 bg-muted/20 hover:bg-muted/40 hover:border-muted-foreground/20'
                          : 'border-none bg-transparent opacity-100 cursor-default shadow-none'
                      }`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        value="ignore"
                        className="font-bold uppercase text-[10px] text-warning"
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
                </TableCell>

                <TableCell>
                  {mapping.isSystem ? (
                    <Badge
                      variant="outline"
                      className="text-[8px] uppercase tracking-tighter font-black opacity-50"
                    >
                      System
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="text-[8px] uppercase tracking-tighter font-black bg-primary/5 text-primary border-primary/10"
                    >
                      Custom
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {canEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDeleteMapping(mapping.id)}
                      disabled={deleteMapping.isPending}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
          {sortedMappings.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center py-12 text-muted-foreground text-xs lowercase"
              >
                No mappings found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
