import { useState } from 'react';
import { EventPriorityTable } from '@/pages/training/_shared/components/event-priority-table';
import { Plus, ShieldAlert } from 'lucide-react';
import { useIsDeveloper } from '@/hooks/use-is-developer';
import {
  useCreateEventPriority,
  useDeleteEventPriority,
  useEventPriorities,
  useUpdateEventPriority,
} from '@/hooks/use-training-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function EventPrioritiesAdminPage() {
  const isDeveloper = useIsDeveloper();
  const { data: eventPriorities = [], isLoading } = useEventPriorities();
  const createMutation = useCreateEventPriority();
  const updateMutation = useUpdateEventPriority();
  const deleteMutation = useDeleteEventPriority();

  const [newName, setNewName] = useState('');
  const [newIsSystem, setNewIsSystem] = useState(false);

  const handleAdd = () => {
    if (!newName.trim()) return;
    createMutation.mutate(
      { name: newName.trim(), is_system: newIsSystem },
      {
        onSuccess: () => {
          setNewName('');
          setNewIsSystem(false);
        },
      },
    );
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to deactivate this event priority?')) {
      deleteMutation.mutate({ id });
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
      <div className="flex flex-col">
        {/* Header */}
        <header className="bg-muted/30 flex shrink-0 items-center justify-between border-b px-4 py-6">
          <div>
            <h1 className="text-2xl font-black lowercase tracking-tight">
              event priorities admin
            </h1>
            <p className="text-muted-foreground text-xs">
              Manage global system and custom event priorities (
              {eventPriorities.length} total)
            </p>
          </div>
        </header>

        {/* Content */}
        <div className="px-4 pb-4 pt-6">
          <div className="max-w-4xl space-y-6">
            {/* Add Form */}
            <div className="flex flex-col gap-4 bg-card p-4 rounded-xl border shadow-sm sm:flex-row sm:items-end">
              <div className="flex-1 space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  new priority name
                </label>
                <Input
                  placeholder="e.g. A+, Critical, Optional..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  type
                </label>
                <Tabs
                  value={newIsSystem ? 'system' : 'custom'}
                  onValueChange={(v) => setNewIsSystem(v === 'system')}
                  className="w-[200px]"
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

              <Button
                onClick={handleAdd}
                disabled={createMutation.isPending || !newName.trim()}
                className="h-10"
              >
                <Plus className="h-4 w-4 mr-2" />
                add entry
              </Button>
            </div>

            {/* Shared Table */}
            <EventPriorityTable
              eventPriorities={eventPriorities}
              isLoading={isLoading}
              onUpdate={(ep) => updateMutation.mutate(ep)}
              onDelete={handleDelete}
              allowSystemEdit={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
