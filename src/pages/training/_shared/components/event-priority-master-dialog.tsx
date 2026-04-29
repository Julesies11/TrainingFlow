import { useState } from 'react';
import { Plus, Settings } from 'lucide-react';
import {
  useCreateEventPriority,
  useDeleteEventPriority,
  useEventPriorities,
  useUpdateEventPriority,
} from '@/hooks/use-training-data';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { EventPriorityTable } from './event-priority-table';

interface EventPriorityMasterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EventPriorityMasterDialog({
  open,
  onOpenChange,
}: EventPriorityMasterDialogProps) {
  const { data: eventPriorities = [], isLoading } = useEventPriorities();
  const createMutation = useCreateEventPriority();
  const updateMutation = useUpdateEventPriority();
  const deleteMutation = useDeleteEventPriority();

  const [newName, setNewName] = useState('');

  const handleAdd = () => {
    if (!newName.trim()) return;
    createMutation.mutate(
      { name: newName.trim(), is_system: false },
      {
        onSuccess: () => setNewName(''),
      },
    );
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to deactivate this event priority?')) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 lowercase tracking-tighter">
            <Settings className="h-5 w-5" />
            manage event priorities
          </DialogTitle>
        </DialogHeader>
        <DialogBody className="space-y-6">
          {/* Add Form */}
          <div className="flex items-end gap-2 bg-muted/30 p-4 rounded-xl border border-dashed">
            <div className="flex-1 space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                new priority
              </label>
              <Input
                placeholder="e.g. A+, Critical, Optional..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              />
            </div>
            <Button
              onClick={handleAdd}
              disabled={createMutation.isPending || !newName.trim()}
              className="mb-[1px]"
            >
              <Plus className="h-4 w-4 mr-2" />
              add
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
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
