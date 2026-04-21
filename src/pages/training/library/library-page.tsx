import { useMemo, useState } from 'react';
import { Pencil, Plus, Search, Star, Trash2 } from 'lucide-react';
import { LibraryWorkout } from '@/types/training';
import {
  useCreateLibraryWorkout,
  useDeleteLibraryWorkout,
  useLibrary,
  useSportTypes,
  useUpdateLibraryWorkout,
  useUserSportSettings,
} from '@/hooks/use-training-data';
import {
  formatMinsShort,
  getContrastColor,
} from '@/services/training/calendar.utils';
import {
  buildUserSettingsMap,
  getEffortColor,
} from '@/services/training/effort-colors';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LibraryTemplateDialog } from './components/library-template-dialog';

const ALL_FILTER = 'All';

export function LibraryPage() {
  const { data: library = [], isLoading: loadingLib } = useLibrary();
  const { data: sportTypes = [], isLoading: loadingSports } = useSportTypes();
  const { data: userSportSettings = [] } = useUserSportSettings();
  const createLibrary = useCreateLibraryWorkout();
  const updateLibrary = useUpdateLibraryWorkout();
  const deleteLibrary = useDeleteLibraryWorkout();

  const userSettingsMap = useMemo(
    () => buildUserSettingsMap(userSportSettings),
    [userSportSettings],
  );

  // Filter & search state
  const [sportFilter, setSportFilter] = useState<string>(ALL_FILTER);
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog state
  const [templateToEdit, setTemplateToEdit] =
    useState<Partial<LibraryWorkout> | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filtered library grouped by sport type
  const groupedLibrary = useMemo(() => {
    let items = library;
    if (sportFilter !== ALL_FILTER) {
      items = items.filter((t) => t.sportTypeId === sportFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (t) =>
          t.title?.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          (t.sportName || '').toLowerCase().includes(q),
      );
    }

    // Group by sport type
    const grouped: Record<string, LibraryWorkout[]> = {};
    items.forEach((item) => {
      const sportId = item.sportTypeId || 'unknown';
      if (!grouped[sportId]) {
        grouped[sportId] = [];
      }
      grouped[sportId].push(item);
    });

    return grouped;
  }, [library, sportFilter, searchQuery]);

  const totalFilteredCount = useMemo(() => {
    return Object.values(groupedLibrary).reduce(
      (sum, group) => sum + group.length,
      0,
    );
  }, [groupedLibrary]);

  // Sport counts (by sportTypeId)
  const sportCounts = useMemo(() => {
    const counts: Record<string, number> = { [ALL_FILTER]: library.length };
    sportTypes.forEach((st) => {
      counts[st.id] = library.filter((t) => t.sportTypeId === st.id).length;
    });
    return counts;
  }, [library, sportTypes]);

  const handleSaveTemplate = (template: Partial<LibraryWorkout>) => {
    if (template.id) {
      updateLibrary.mutate(template as LibraryWorkout);
    } else {
      createLibrary.mutate(template);
    }
    setTemplateToEdit(null);
  };

  const isLoading = loadingLib || loadingSports;

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading library...</div>
      </div>
    );
  }

  return (
    <div className="container-fixed">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <header className="flex shrink-0 flex-col gap-3 px-4 pt-2 lg:flex-row lg:items-center lg:justify-between lg:px-4">
          <div>
            <h1 className="text-2xl font-black lowercase tracking-tighter lg:text-3xl">
              workout library
            </h1>
            <p className="text-muted-foreground text-xs">
              {library.length} template{library.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 lg:w-64">
              <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-sm"
              />
            </div>
            <Button
              onClick={() =>
                setTemplateToEdit({
                  sportTypeId: sportTypes[0]?.id || '',
                  effortLevel: 2,
                  plannedDurationMinutes: 60,
                  plannedDistanceKilometers: 0,
                  isKeyWorkout: false,
                })
              }
              size="sm"
              className="gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">new template</span>
            </Button>
          </div>
        </header>

        {/* Sport filter tabs */}
        <div className="flex shrink-0 gap-1 overflow-x-auto px-4">
          <Button
            variant={sportFilter === ALL_FILTER ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setSportFilter(ALL_FILTER)}
            className="shrink-0 gap-1.5 text-[10px] font-black lowercase"
          >
            all
            <span className="bg-background/20 rounded-full px-1.5 py-0.5 text-[9px]">
              {sportCounts[ALL_FILTER] || 0}
            </span>
          </Button>
          {sportTypes.map((st) => (
            <Button
              key={st.id}
              variant={sportFilter === st.id ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSportFilter(st.id)}
              className="shrink-0 gap-1.5 text-[10px] font-black lowercase"
            >
              {st.name}
              <span className="bg-background/20 rounded-full px-1.5 py-0.5 text-[9px]">
                {sportCounts[st.id] || 0}
              </span>
            </Button>
          ))}
        </div>

        {/* Template grid */}
        <div className="px-4 pb-4">
          {totalFilteredCount === 0 ? (
            <div className="flex h-60 flex-col items-center justify-center gap-3">
              <div className="text-muted-foreground text-sm">
                {library.length === 0
                  ? 'No templates yet. Create your first workout template!'
                  : 'No templates match your filter.'}
              </div>
              {library.length === 0 && (
                <Button
                  size="sm"
                  onClick={() =>
                    setTemplateToEdit({
                      sportTypeId: sportTypes[0]?.id || '',
                      effortLevel: 2,
                      plannedDurationMinutes: 60,
                      plannedDistanceKilometers: 0,
                      isKeyWorkout: false,
                    })
                  }
                >
                  <Plus className="mr-1 h-4 w-4" />
                  create template
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              {sportTypes
                .filter(
                  (st) =>
                    groupedLibrary[st.id] && groupedLibrary[st.id].length > 0,
                )
                .map((st) => (
                  <div key={st.id}>
                    {/* Sport type header */}
                    <div className="mb-3 flex items-center gap-2">
                      <h3 className="text-lg font-black lowercase tracking-tight">
                        {st.name}
                      </h3>
                      <span className="text-muted-foreground text-xs">
                        ({groupedLibrary[st.id].length})
                      </span>
                    </div>

                    {/* Templates grid for this sport */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                      {groupedLibrary[st.id].map((template) => {
                        const bg = getEffortColor(
                          st,
                          template.effortLevel || 1,
                          userSettingsMap.get(template.sportTypeId),
                        );
                        const dur = template.plannedDurationMinutes || 0;
                        const dist = template.plannedDistanceKilometers || 0;

                        return (
                          <div
                            key={template.id}
                            onClick={() => setTemplateToEdit(template)}
                            className={`group relative cursor-pointer overflow-hidden rounded-xl shadow-sm transition-all hover:shadow-lg active:scale-[0.98] ${getContrastColor(bg)} ${template.isKeyWorkout ? 'border-l-4 border-l-white/80' : ''}`}
                            style={{ backgroundColor: bg }}
                          >
                            {/* Key workout star */}
                            {template.isKeyWorkout && (
                              <Star className="absolute right-2 top-2 h-3.5 w-3.5 fill-white/90 text-white/90 drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]" />
                            )}

                            {/* Content */}
                            <div className="p-4">
                              <div className="text-[9px] font-black uppercase opacity-70">
                                {template.sportName || st.name || 'Unknown'}
                              </div>
                              <div className="mt-0.5 truncate text-sm font-bold">
                                {template.title || 'Untitled'}
                              </div>
                              {template.description && (
                                <div className="mt-1 line-clamp-2 text-[11px] opacity-70">
                                  {template.description}
                                </div>
                              )}
                              <div className="mt-2 flex items-center gap-2 text-[10px] font-semibold opacity-80">
                                <span>{formatMinsShort(dur)}</span>
                                {dist > 0 && st.paceRelevant && (
                                  <span>
                                    · {dist}
                                    {st.distanceUnit || 'km'}
                                  </span>
                                )}
                                <span className="opacity-60">
                                  · L{template.effortLevel}
                                </span>
                              </div>
                            </div>

                            {/* Action buttons */}
                            <div className="absolute right-2 bottom-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setTemplateToEdit(template);
                                }}
                                className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow transition-all hover:scale-110 hover:bg-white dark:bg-black/70 dark:text-white dark:hover:bg-black/90"
                              >
                                <Pencil className="h-3 w-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteConfirmId(template.id);
                                }}
                                className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-red-600 shadow transition-all hover:scale-110 hover:bg-white dark:bg-black/70 dark:text-red-400 dark:hover:bg-black/90"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>

                            {/* Delete confirmation overlay */}
                            {deleteConfirmId === template.id && (
                              <div
                                className="absolute inset-0 flex items-center justify-center gap-2 bg-black/70 backdrop-blur-sm"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => {
                                    deleteLibrary.mutate(template.id);
                                    setDeleteConfirmId(null);
                                  }}
                                >
                                  delete
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-white/30 text-white hover:bg-white/20"
                                  onClick={() => setDeleteConfirmId(null)}
                                >
                                  cancel
                                </Button>
                              </div>
                            )}
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

      {/* Template dialog */}
      {templateToEdit && (
        <LibraryTemplateDialog
          template={templateToEdit}
          sportTypes={sportTypes}
          userSettingsMap={userSettingsMap}
          onSave={handleSaveTemplate}
          onCancel={() => setTemplateToEdit(null)}
        />
      )}
    </div>
  );
}
