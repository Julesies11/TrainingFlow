import { useState } from 'react';
import {
  Check,
  Globe,
  Pencil,
  Plus,
  ShieldAlert,
  Trash2,
  User,
  X,
} from 'lucide-react';
import { EventPriorityRecord } from '@/types/training';
import { useIsDeveloper } from '@/hooks/use-is-developer';
import {
  useCreateEventPriority,
  useDeleteEventPriority,
  useEventPriorities,
  useUpdateEventPriority,
} from '@/hooks/use-training-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function EventPrioritiesAdminPage() {
  const isDeveloper = useIsDeveloper();
  const { data: eventPriorities = [], isLoading } = useEventPriorities();
  const createMutation = useCreateEventPriority();
  const updateMutation = useUpdateEventPriority();
  const deleteMutation = useDeleteEventPriority();

  const [newName, setNewName] = useState('');
  const [newIsSystem, setNewIsSystem] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingIsSystem, setEditingIsSystem] = useState(false);

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

  const handleUpdate = (ep: EventPriorityRecord) => {
    if (!editingName.trim()) return;
    updateMutation.mutate(
      { ...ep, name: editingName.trim(), is_system: editingIsSystem },
      {
        onSuccess: () => setEditingId(null),
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

            {/* List Table */}
            <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">
                      Name
                    </TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest w-32">
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
                        Loading priorities...
                      </TableCell>
                    </TableRow>
                  ) : eventPriorities.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center py-8 text-muted-foreground italic text-sm"
                      >
                        No event priorities found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    eventPriorities.map((ep) => (
                      <TableRow key={ep.id}>
                        <TableCell className="font-medium">
                          {editingId === ep.id ? (
                            <Input
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              className="h-8 max-w-[300px]"
                              autoFocus
                            />
                          ) : (
                            <span className="text-sm">{ep.name}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingId === ep.id ? (
                            <Tabs
                              value={editingIsSystem ? 'system' : 'custom'}
                              onValueChange={(v) =>
                                setEditingIsSystem(v === 'system')
                              }
                              className="w-[140px]"
                            >
                              <TabsList className="grid w-full grid-cols-2 h-7 p-0.5">
                                <TabsTrigger
                                  value="custom"
                                  className="text-[8px] font-black uppercase"
                                >
                                  custom
                                </TabsTrigger>
                                <TabsTrigger
                                  value="system"
                                  className="text-[8px] font-black uppercase"
                                >
                                  system
                                </TabsTrigger>
                              </TabsList>
                            </Tabs>
                          ) : (
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${ep.is_system ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-muted text-muted-foreground border'}`}
                            >
                              {ep.is_system ? (
                                <Globe className="h-2.5 w-2.5" />
                              ) : (
                                <User className="h-2.5 w-2.5" />
                              )}
                              {ep.is_system ? 'system' : 'custom'}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {editingId === ep.id ? (
                              <>
                                <Button
                                  variant="success"
                                  size="sm"
                                  className="h-8 px-2 flex items-center gap-1 shadow-sm"
                                  onClick={() => handleUpdate(ep)}
                                >
                                  <Check className="h-4 w-4" />
                                  <span className="text-[10px] font-black uppercase">
                                    save
                                  </span>
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
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => {
                                    setEditingId(ep.id);
                                    setEditingName(ep.name);
                                    setEditingIsSystem(ep.is_system);
                                  }}
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-destructive"
                                  onClick={() => handleDelete(ep.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
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
          </div>
        </div>
      </div>
    </div>
  );
}
