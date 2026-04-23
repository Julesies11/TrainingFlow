import { useState } from 'react';
import {
  Check,
  Edit2,
  Globe,
  Plus,
  Settings,
  Trash2,
  User,
  X,
} from 'lucide-react';
import { EventTypeRecord } from '@/types/training';
import {
  useCreateEventType,
  useDeleteEventType,
  useEventTypes,
  useUpdateEventType,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface EventTypeMasterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EventTypeMasterDialog({
  open,
  onOpenChange,
}: EventTypeMasterDialogProps) {
  const { data: eventTypes = [], isLoading } = useEventTypes();
  const createMutation = useCreateEventType();
  const updateMutation = useUpdateEventType();
  const deleteMutation = useDeleteEventType();

  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleAdd = () => {
    if (!newName.trim()) return;
    createMutation.mutate(
      { name: newName.trim(), is_system: false }, // Standard users always create custom
      {
        onSuccess: () => setNewName(''),
      },
    );
  };

  const handleUpdate = (et: EventTypeRecord) => {
    if (!editingName.trim()) return;
    updateMutation.mutate(
      { ...et, name: editingName.trim() },
      {
        onSuccess: () => setEditingId(null),
      },
    );
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to deactivate this event type?')) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 lowercase tracking-tighter">
            <Settings className="h-5 w-5" />
            manage event types
          </DialogTitle>
        </DialogHeader>
        <DialogBody className="space-y-6">
          {/* Add Form */}
          <div className="flex items-end gap-2 bg-muted/30 p-4 rounded-xl border border-dashed">
            <div className="flex-1 space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                new event type
              </label>
              <Input
                placeholder="e.g. Training Camp, Recovery Week..."
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

          {/* List Table */}
          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">
                    Name
                  </TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest w-24">
                    Type
                  </TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest w-24 text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center py-8 text-muted-foreground italic text-sm"
                    >
                      Loading types...
                    </TableCell>
                  </TableRow>
                ) : eventTypes.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center py-8 text-muted-foreground italic text-sm"
                    >
                      No event types found.
                    </TableCell>
                  </TableRow>
                ) : (
                  eventTypes.map((et) => (
                    <TableRow key={et.id}>
                      <TableCell className="font-medium">
                        {editingId === et.id ? (
                          <Input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="h-8"
                            autoFocus
                          />
                        ) : (
                          <span className="text-sm">{et.name}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${et.is_system ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-muted text-muted-foreground border'}`}
                        >
                          {et.is_system ? (
                            <Globe className="h-2.5 w-2.5" />
                          ) : (
                            <User className="h-2.5 w-2.5" />
                          )}
                          {et.is_system ? 'system' : 'custom'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {editingId === et.id ? (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-success"
                                onClick={() => handleUpdate(et)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-muted-foreground"
                                onClick={() => setEditingId(null)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              {!et.is_system && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => {
                                      setEditingId(et.id);
                                      setEditingName(et.name);
                                    }}
                                  >
                                    <Edit2 className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-destructive"
                                    onClick={() => handleDelete(et.id)}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
