import { useState } from 'react';
import { EventPriorityTable } from '@/pages/training/_shared/components/event-priority-table';
import { Plus } from 'lucide-react';
import {
  useCreateEventPriority,
  useDeleteEventPriority,
  useEventPriorities,
  useUpdateEventPriority,
} from '@/hooks/use-training-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function EventPrioritiesPage() {
  const { data: eventPriorities = [], isLoading } = useEventPriorities();
  const createMutation = useCreateEventPriority();
  const updateMutation = useUpdateEventPriority();
  const deleteMutation = useDeleteEventPriority();

  const [newName, setNewName] = useState('');

  const handleAdd = () => {
    if (!newName.trim()) return;
    createMutation.mutate(
      {
        name: newName.trim(),
        is_system: false,
      },
      {
        onSuccess: () => {
          setNewName('');
        },
      },
    );
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to deactivate this event priority?')) {
      deleteMutation.mutate({ id });
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-muted-foreground text-sm">
          Loading event priorities...
        </div>
      </div>
    );
  }

  return (
    <div className="container-fixed">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <header className="flex shrink-0 items-center justify-between px-4 pt-2">
          <div>
            <h1 className="text-2xl font-black lowercase tracking-tighter lg:text-3xl">
              event priorities
            </h1>
            <p className="text-muted-foreground text-xs">
              Manage global system and your custom event priorities
            </p>
          </div>
        </header>

        {/* Content */}
        <div className="px-4 pb-8 space-y-6">
          <div className="max-w-4xl space-y-6">
            {/* Add Form */}
            <div className="flex flex-col gap-4 bg-card p-5 rounded-2xl border shadow-sm sm:flex-row sm:items-end">
              <div className="flex-1 space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  name
                </label>
                <Input
                  placeholder="e.g. Critical, Optional..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                  className="h-10"
                />
              </div>

              <Button
                onClick={handleAdd}
                disabled={createMutation.isPending || !newName.trim()}
                className="h-10 text-[10px] font-black lowercase"
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                add priority
              </Button>
            </div>

            {/* Shared Table */}
            <EventPriorityTable
              eventPriorities={eventPriorities}
              isLoading={isLoading}
              onUpdate={(ep) => updateMutation.mutate(ep)}
              onDelete={handleDelete}
              allowSystemEdit={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
