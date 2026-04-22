import { useState } from 'react';
import { GripVertical, Plus } from 'lucide-react';
import { LibraryWorkout, SportTypeRecord } from '@/types/training';
import { isPaceRelevant } from '@/services/training/pace-utils';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';

interface LibraryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  library: LibraryWorkout[];
  sportTypes: SportTypeRecord[];
  onAdd: (template: LibraryWorkout) => void;
}

export function LibraryDrawer({
  isOpen,
  onClose,
  library,
  sportTypes,
  onAdd,
}: LibraryDrawerProps) {
  const [search, setSearch] = useState('');
  const [sportFilter, setSportFilter] = useState<string>('all');

  const filtered = library.filter((t) => {
    const matchesSearch =
      !search || t.title?.toLowerCase().includes(search.toLowerCase());
    const matchesSport = sportFilter === 'all' || t.sportTypeId === sportFilter;
    return matchesSearch && matchesSport;
  });

  const handleAddTemplate = (template: LibraryWorkout) => {
    onAdd(template);
    onClose();
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose} direction="right">
      <DrawerContent className="fixed inset-y-0 right-0 mt-0 flex h-full w-full flex-col rounded-none border-l bg-card sm:w-[400px]">
        <DrawerHeader className="border-b px-6 py-4">
          <DrawerTitle className="text-xl font-black lowercase tracking-tighter">
            workout library
          </DrawerTitle>
        </DrawerHeader>

        <div className="flex flex-col gap-4 p-6">
          <Input
            placeholder="search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-sm"
          />

          <div className="flex flex-wrap gap-1">
            <Button
              variant={sportFilter === 'all' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSportFilter('all')}
              className="h-7 text-[10px] font-black uppercase"
            >
              all
            </Button>
            {sportTypes.map((st) => (
              <Button
                key={st.id}
                variant={sportFilter === st.id ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSportFilter(st.id)}
                className="h-7 text-[10px] font-black uppercase"
              >
                {st.name}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {filtered.length === 0 ? (
            <div className="flex h-32 items-center justify-center rounded-xl border border-dashed">
              <p className="text-muted-foreground text-xs italic">
                No templates found
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((template) => {
                const st = sportTypes.find(
                  (s) => s.id === template.sportTypeId,
                );
                return (
                  <div key={template.id} className="group relative">
                    <button
                      onClick={() => handleAddTemplate(template)}
                      className="flex w-full flex-col items-start rounded-xl border bg-muted/30 p-3 text-left transition-all hover:bg-muted/50 active:scale-[0.98]"
                    >
                      <div className="flex w-full items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          {template.sportName || st?.name || 'Unknown'}
                        </span>
                        <Plus className="h-3 w-3 text-primary opacity-0 group-hover:opacity-100" />
                      </div>
                      <div className="truncate text-sm font-semibold">
                        {template.title || 'Untitled'}
                      </div>
                      <div className="mt-1 text-[10px] opacity-70">
                        {template.plannedDurationMinutes}m
                        {template.plannedDistanceKilometers > 0 &&
                        isPaceRelevant(!!st?.paceRelevant, st?.paceUnit)
                          ? ` · ${template.plannedDistanceKilometers}${st?.distanceUnit || 'km'}`
                          : ''}
                      </div>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddTemplate(template);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-primary opacity-0 hover:bg-primary/10 group-hover:opacity-100"
                    >
                      <GripVertical className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
