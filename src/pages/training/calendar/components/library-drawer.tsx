import { useMemo, useState } from 'react';
import { Plus, Search, Trash2, X } from 'lucide-react';
import {
  LibraryWorkout,
  SportTypeRecord,
  UserSportSettings,
} from '@/types/training';
import {
  formatMinsShort,
  getContrastColor,
} from '@/services/training/calendar.utils';
import {
  buildSportMap,
  getEffortColor,
} from '@/services/training/effort-colors';
import { isPaceRelevant } from '@/services/training/pace-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
  onDeleteLibrary,
}: LibraryDrawerProps) {
  const [search, setSearch] = useState('');
  const [sportFilter, setSportFilter] = useState<string>('all');

  const sportMap = useMemo(() => buildSportMap(sportTypes), [sportTypes]);

  const filtered = useMemo(() => {
    return library.filter((t) => {
      const matchesSearch =
        !search || t.title?.toLowerCase().includes(search.toLowerCase());
      const matchesSport =
        sportFilter === 'all' || t.sportTypeId === sportFilter;
      return matchesSearch && matchesSport;
    });
  }, [library, search, sportFilter]);

  // Group library by sport type
  const groupedLibrary = useMemo(() => {
    const groups = new Map<string, LibraryWorkout[]>();
    filtered.forEach((template) => {
      const sportName =
        template.sportName ||
        sportMap.get(template.sportTypeId)?.name ||
        'Unknown';
      if (!groups.has(sportName)) {
        groups.set(sportName, []);
      }
      groups.get(sportName)!.push(template);
    });
    return Array.from(groups.entries()).sort((a, b) =>
      a[0].localeCompare(b[0]),
    );
  }, [filtered, sportMap]);

  const handleAddTemplate = (e: React.MouseEvent, template: LibraryWorkout) => {
    e.stopPropagation();
    onAddTemplate(template);
  };

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-[95] bg-black/40 transition-opacity"
          onClick={onClose}
        />
      )}

      <div
        className={`bg-card fixed inset-y-0 right-0 z-[100] flex w-full flex-col border-l shadow-2xl transition-transform duration-300 sm:w-[450px] ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex shrink-0 items-center justify-between border-b px-6 py-4">
          <div className="flex flex-col">
            <h3 className="text-xl font-black lowercase tracking-tighter">
              workout library
            </h3>
            <p className="text-primary text-[10px] font-black uppercase tracking-widest">
              target: {selectedDate}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex flex-col gap-4 p-6 pb-2">
          <div className="relative">
            <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-sm"
            />
          </div>

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

        <div className="flex-1 overflow-y-auto p-6 scrollable-y">
          {library.length === 0 ? (
            <div className="text-muted-foreground flex h-40 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed text-center p-6">
              <p className="text-sm font-medium">Your library is empty</p>
              <p className="text-xs opacity-70">
                Create workouts and save them as templates to see them here.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-muted-foreground flex h-40 items-center justify-center text-sm">
              No matching templates found.
            </div>
          ) : (
            <div className="space-y-8">
              {groupedLibrary.map(([sportName, templates]) => (
                <div key={sportName} className="space-y-3">
                  <h4 className="text-muted-foreground flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                    <span className="bg-muted h-px flex-1" />
                    {sportName}
                    <span className="bg-muted h-px flex-1" />
                  </h4>
                  <div className="grid gap-2">
                    {templates.map((template) => {
                      const st = sportMap.get(template.sportTypeId);
                      const bg = getEffortColor(
                        st,
                        template.effortLevel || 1,
                        userSettingsMap.get(template.sportTypeId),
                      );
                      const contrast = getContrastColor(bg);

                      return (
                        <div
                          key={template.id}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData(
                              'libraryWorkout',
                              JSON.stringify(template),
                            );
                            e.dataTransfer.effectAllowed = 'copy';
                          }}
                          className="group relative overflow-hidden rounded-xl border shadow-sm transition-all hover:shadow-md cursor-grab active:cursor-grabbing"
                        >
                          <button
                            onClick={() => onSelectTemplate(template)}
                            className={`flex w-full flex-col p-3 text-left transition-colors ${contrast}`}
                            style={{ backgroundColor: bg }}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="truncate text-sm font-black lowercase">
                                {template.title || 'Untitled'}
                              </span>
                            </div>
                            <div className="mt-1 flex items-center gap-1.5 text-[10px] font-bold opacity-80">
                              <span>
                                {formatMinsShort(
                                  template.plannedDurationMinutes,
                                )}
                              </span>
                              {template.plannedDistanceKilometers > 0 &&
                                isPaceRelevant(
                                  !!st?.paceRelevant,
                                  st?.paceUnit,
                                ) && (
                                  <>
                                    <span>·</span>
                                    <span>
                                      {template.plannedDistanceKilometers}
                                      {st?.distanceUnit || 'km'}
                                    </span>
                                  </>
                                )}
                            </div>
                          </button>

                          <div className="absolute right-2 top-1/2 flex -translate-y-1/2 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={(e) => handleAddTemplate(e, template)}
                              className="h-8 w-8 rounded-full p-0 shadow-lg"
                              title={`Add to ${selectedDate}`}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>

                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (
                                  confirm(
                                    'Are you sure you want to delete this template?',
                                  )
                                ) {
                                  onDeleteLibrary(template.id);
                                }
                              }}
                              className="h-8 w-8 rounded-full p-0 shadow-lg"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
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
    </>
  );
}
