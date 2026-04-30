import { useState } from 'react';
import { Check, Globe, Pencil, Trash2, User, X } from 'lucide-react';
import { EventPriorityRecord } from '@/types/training';
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

interface EventPriorityTableProps {
  eventPriorities: EventPriorityRecord[];
  isLoading: boolean;
  onUpdate: (ep: EventPriorityRecord) => void;
  onDelete: (id: string) => void;
  allowSystemEdit?: boolean;
}

export function EventPriorityTable({
  eventPriorities,
  isLoading,
  onUpdate,
  onDelete,
  allowSystemEdit = false,
}: EventPriorityTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingIsSystem, setEditingIsSystem] = useState(false);

  const handleStartEdit = (ep: EventPriorityRecord) => {
    setEditingId(ep.id);
    setEditingName(ep.name);
    setEditingIsSystem(ep.is_system);
  };

  const handleSave = (ep: EventPriorityRecord) => {
    if (!editingName.trim()) return;
    onUpdate({
      ...ep,
      name: editingName.trim(),
      is_system: editingIsSystem,
    });
    setEditingId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  return (
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
            eventPriorities.map((ep) => {
              const isEditing = editingId === ep.id;

              return (
                <TableRow key={ep.id}>
                  <TableCell className="font-medium">
                    {isEditing ? (
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
                    {isEditing && allowSystemEdit ? (
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
                      {isEditing ? (
                        <>
                          <Button
                            variant="success"
                            size="sm"
                            className="h-8 px-2 flex items-center gap-1 shadow-sm"
                            onClick={() => handleSave(ep)}
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
                            onClick={handleCancel}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          {(allowSystemEdit || !ep.is_system) && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleStartEdit(ep)}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-destructive"
                                onClick={() => onDelete(ep.id)}
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
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
