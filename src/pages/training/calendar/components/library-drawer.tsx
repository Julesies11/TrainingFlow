import { useMemo } from 'react';
import { X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LibraryWorkout, SportTypeRecord, UserSportSettings } from '@/types/training';
import { getContrastColor } from '@/services/training/calendar.utils';
import { getEffortColor, buildSportMap } from '@/services/training/effort-colors';

interface LibraryDrawerProps {
  open: boolean;
  onClose: () => void;
  library: LibraryWorkout[];
  selectedDate: string;
  sportTypes: SportTypeRecord[];
  userSettingsMap: Map<string, UserSportSettings>;
  onSelectTemplate: (template: LibraryWorkout) => void;
  onAddTemplate: (template: LibraryWorkout) => void;
  onCreateLibrary: (w: Partial<LibraryWorkout>) => void;
  onUpdateLibrary: (w: LibraryWorkout) => void;
  onDeleteLibrary: (id: string) => void;
}

export function LibraryDrawer({
  open,
  onClose,
  library,
  selectedDate,
  sportTypes,
  userSettingsMap,
  onSelectTemplate,
  onAddTemplate,
}: LibraryDrawerProps) {
  const sportMap = useMemo(() => buildSportMap(sportTypes), [sportTypes]);

  // Group library by sport type
  const groupedLibrary = useMemo(() => {
    const groups = new Map<string, LibraryWorkout[]>();
    library.forEach(template => {
      const sportName = template.sportName || sportMap.get(template.sportTypeId)?.name || 'Unknown';
      if (!groups.has(sportName)) {
        groups.set(sportName, []);
      }
      groups.get(sportName)!.push(template);
    });
    return Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [library, sportMap]);

  const handleAddTemplate = (template: LibraryWorkout) => {
    onAddTemplate(template);
    onClose(); // Close drawer after adding
  };

  return (
    <div
      className={`bg-card fixed inset-y-0 right-0 z-[100] flex w-full transform flex-col border-l shadow-2xl transition-transform duration-300 lg:w-[450px] ${open ? 'translate-x-0' : 'translate-x-full'}`}
    >
      <header className="bg-muted/30 flex shrink-0 items-center justify-between border-b p-6">
        <div className="flex flex-col">
          <h3 className="text-xl font-black tracking-tight lowercase">
            library
          </h3>
          <p className="text-primary text-[10px] font-black uppercase tracking-widest">
            Target: {selectedDate}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
          <X className="h-5 w-5" />
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        {library.length === 0 ? (
          <div className="text-muted-foreground flex h-40 items-center justify-center text-sm">
            No templates yet. Create workouts and save them to your library.
          </div>
        ) : (
          <div className="space-y-6">
            {groupedLibrary.map(([sportName, templates]) => (
              <div key={sportName}>
                <h4 className="text-muted-foreground mb-3 text-xs font-black uppercase tracking-wider">
                  {sportName}
                </h4>
                <div className="space-y-2">
                  {templates.map((template) => {
                    const st = sportMap.get(template.sportTypeId);
                    const bg = getEffortColor(st, template.effortLevel || 1, userSettingsMap.get(template.sportTypeId));
                    return (
                      <div
                        key={template.id}
                        className={`group/lib relative overflow-hidden rounded-xl shadow-sm transition-all hover:shadow-md ${getContrastColor(bg)}`}
                        style={{ backgroundColor: bg }}
                      >
                        <button
                          onClick={() => onSelectTemplate(template)}
                          className="w-full p-3 pr-14 text-left"
                        >
                          <div className="truncate text-sm font-semibold">
                            {template.title || 'Untitled'}
                          </div>
                          <div className="mt-1 text-[10px] opacity-70">
                            {template.plannedDurationMinutes}m
                            {template.plannedDistanceKilometers > 0 && st?.paceRelevant
                              ? ` · ${template.plannedDistanceKilometers}${st.distanceUnit || 'km'}`
                              : ''}
                          </div>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddTemplate(template);
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow-lg transition-all hover:scale-110 hover:bg-white active:scale-95 dark:bg-black/70 dark:text-white dark:hover:bg-black/90"
                          title={`Add to ${selectedDate}`}
                        >
                          <Plus className="h-5 w-5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
