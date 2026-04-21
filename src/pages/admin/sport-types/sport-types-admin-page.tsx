import { useState } from 'react';
import { Pencil, Plus, Ruler, ShieldAlert, Timer, Trash2 } from 'lucide-react';
import { SportTypeRecord } from '@/types/training';
import { useIsDeveloper } from '@/hooks/use-is-developer';
import {
  useCreateSportType,
  useDeleteSportType,
  useSportTypes,
  useUpdateSportType,
} from '@/hooks/use-training-data';
import { Button } from '@/components/ui/button';
import { SportTypeDialog } from './components/sport-type-dialog';

export function SportTypesAdminPage() {
  const isDeveloper = useIsDeveloper();
  const { data: sportTypes = [], isLoading } = useSportTypes();
  const createSportType = useCreateSportType();
  const updateSportType = useUpdateSportType();
  const deleteSportType = useDeleteSportType();

  const [dialogSportType, setDialogSportType] =
    useState<SportTypeRecord | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleSave = (st: Partial<SportTypeRecord>) => {
    if (st.id) {
      updateSportType.mutate(st as SportTypeRecord, {
        onSuccess: () => {
          setDialogSportType(null);
          setIsCreating(false);
        },
      });
    } else {
      createSportType.mutate(st, {
        onSuccess: () => {
          setDialogSportType(null);
          setIsCreating(false);
        },
      });
    }
  };

  const handleDelete = (id: string) => {
    deleteSportType.mutate(id, {
      onSuccess: () => {
        setDeleteConfirmId(null);
      },
    });
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

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-muted-foreground text-sm">
          Loading sport types...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-col">
        {/* Header */}
        <header className="bg-muted/30 flex shrink-0 items-center justify-between border-b px-4 py-6">
          <div>
            <h1 className="text-2xl font-black lowercase tracking-tight">
              sport types admin
            </h1>
            <p className="text-muted-foreground text-xs">
              Manage system sport types ({sportTypes.length} total)
            </p>
          </div>
          <Button
            onClick={() => {
              setDialogSportType(null);
              setIsCreating(true);
            }}
            size="sm"
            className="gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>new sport type</span>
          </Button>
        </header>

        {/* Sport type cards */}
        <div className="px-4 pb-4 pt-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sportTypes.map((st) => (
              <div
                key={st.id}
                className="bg-card group relative overflow-hidden rounded-2xl border shadow-sm transition-all hover:shadow-md"
              >
                {/* Color strip */}
                <div className="flex h-3">
                  {[1, 2, 3, 4].map((level) => {
                    const hex = st[
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

                <div className="p-5">
                  {/* Name & description */}
                  <div>
                    <h3 className="text-lg font-black lowercase tracking-tight">
                      {st.name}
                    </h3>
                    {st.description && (
                      <p className="text-muted-foreground mt-0.5 text-xs">
                        {st.description}
                      </p>
                    )}
                  </div>

                  {/* Pace info */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {st.paceRelevant ? (
                      <>
                        <span className="bg-muted inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold">
                          <Ruler className="h-3 w-3" />
                          {st.distanceUnit || 'km'}
                        </span>
                        {st.paceUnit && (
                          <span className="bg-muted inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold">
                            <Timer className="h-3 w-3" />
                            {st.paceUnit}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-muted-foreground text-[10px]">
                        no pace tracking
                      </span>
                    )}
                  </div>

                  {/* Effort levels preview */}
                  <div className="mt-4 grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map((level) => {
                      const label = st[
                        `effort${level}Label` as keyof SportTypeRecord
                      ] as string;
                      const hex = st[
                        `effort${level}Hex` as keyof SportTypeRecord
                      ] as string;
                      return (
                        <div key={level} className="text-center">
                          <div
                            className="mb-1 h-8 rounded"
                            style={{ backgroundColor: hex || '#ccc' }}
                          />
                          <span className="text-muted-foreground text-[8px] font-semibold">
                            {label || `L${level}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Action buttons */}
                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDialogSportType(st)}
                      className="flex-1 gap-1 text-[10px] font-black lowercase"
                    >
                      <Pencil className="h-3 w-3" />
                      edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteConfirmId(st.id)}
                      className="gap-1 text-[10px] font-black lowercase"
                    >
                      <Trash2 className="h-3 w-3" />
                      delete
                    </Button>
                  </div>
                </div>

                {/* Delete confirmation overlay */}
                {deleteConfirmId === st.id && (
                  <div
                    className="absolute inset-0 flex items-center justify-center gap-2 bg-black/70 backdrop-blur-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(st.id)}
                    >
                      confirm delete
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
            ))}
          </div>
        </div>
      </div>

      {/* Dialog */}
      {(dialogSportType || isCreating) && (
        <SportTypeDialog
          sportType={dialogSportType || undefined}
          onSave={handleSave}
          onCancel={() => {
            setDialogSportType(null);
            setIsCreating(false);
          }}
        />
      )}
    </div>
  );
}
