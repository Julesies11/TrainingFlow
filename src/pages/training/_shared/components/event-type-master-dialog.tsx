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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  EVENT_ICONS,
  EVENT_THEMES,
  getEventTypeTheme,
} from '../utils/event-theme';

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
  const [newIcon, setNewIcon] = useState('Info');
  const [newColorTheme, setNewColorTheme] = useState('other');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingIcon, setEditingIcon] = useState('Info');
  const [editingColorTheme, setEditingColorTheme] = useState('other');

  const handleAdd = () => {
    if (!newName.trim()) return;
    createMutation.mutate(
      {
        name: newName.trim(),
        is_system: false,
        icon_name: newIcon,
        color_theme: newColorTheme,
      },
      {
        onSuccess: () => {
          setNewName('');
          setNewIcon('Info');
          setNewColorTheme('other');
        },
      },
    );
  };

  const handleUpdate = (et: EventTypeRecord) => {
    if (!editingName.trim()) return;
    updateMutation.mutate(
      {
        ...et,
        name: editingName.trim(),
        icon_name: editingIcon,
        color_theme: editingColorTheme,
      },
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
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 lowercase tracking-tighter">
            <Settings className="h-5 w-5" />
            manage event types
          </DialogTitle>
        </DialogHeader>
        <DialogBody className="space-y-6">
          {/* Add Form */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-muted/30 p-4 rounded-xl border border-dashed items-end">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                name
              </label>
              <Input
                placeholder="e.g. Recovery Week..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                icon
              </label>
              <Select value={newIcon} onValueChange={setNewIcon}>
                <SelectTrigger className="h-10 bg-background">
                  <SelectValue placeholder="Icon" />
                </SelectTrigger>
                <SelectContent className="max-h-80 overflow-y-auto">
                  {Object.entries(EVENT_ICONS).map(([name, Icon]) => (
                    <SelectItem key={name} value={name}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>{name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 items-end">
              <div className="flex-1 space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  theme
                </label>
                <Select value={newColorTheme} onValueChange={setNewColorTheme}>
                  <SelectTrigger className="h-10 bg-background">
                    <SelectValue placeholder="Theme" />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_THEMES.map((theme) => {
                      const t = getEventTypeTheme(theme.id);
                      return (
                        <SelectItem key={theme.id} value={theme.id}>
                          <div className="flex items-center gap-2">
                            <div className={`h-3 w-3 rounded-full ${t.dot}`} />
                            <span>{theme.label}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleAdd}
                disabled={createMutation.isPending || !newName.trim()}
                className="h-10"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* List Table */}
          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">
                    Name
                  </TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest w-40">
                    Theme
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
                      colSpan={4}
                      className="text-center py-8 text-muted-foreground italic text-sm"
                    >
                      Loading types...
                    </TableCell>
                  </TableRow>
                ) : eventTypes.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-8 text-muted-foreground italic text-sm"
                    >
                      No event types found.
                    </TableCell>
                  </TableRow>
                ) : (
                  eventTypes.map((et) => {
                    const theme = getEventTypeTheme(
                      editingId === et.id ? editingColorTheme : et.color_theme,
                      editingId === et.id ? editingIcon : et.icon_name,
                    );
                    const IconComp = theme.icon;

                    return (
                      <TableRow key={et.id}>
                        <TableCell className="font-medium">
                          {editingId === et.id ? (
                            <Input
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              className="h-8 max-w-[200px]"
                              autoFocus
                            />
                          ) : (
                            <div className="flex items-center gap-2">
                              <div
                                className={`p-1.5 rounded-lg ${theme.bg} ${theme.border} border shadow-sm`}
                              >
                                <IconComp
                                  className={`h-3.5 w-3.5 ${theme.text}`}
                                />
                              </div>
                              <span className="text-sm">{et.name}</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingId === et.id ? (
                            <div className="flex flex-col gap-2">
                              <Select
                                value={editingIcon}
                                onValueChange={setEditingIcon}
                              >
                                <SelectTrigger className="h-8 py-0">
                                  <SelectValue placeholder="Icon" />
                                </SelectTrigger>
                                <SelectContent className="max-h-60 overflow-y-auto">
                                  {Object.entries(EVENT_ICONS).map(
                                    ([name, Icon]) => (
                                      <SelectItem key={name} value={name}>
                                        <div className="flex items-center gap-2">
                                          <Icon className="h-4 w-4" />
                                          <span className="text-xs">
                                            {name}
                                          </span>
                                        </div>
                                      </SelectItem>
                                    ),
                                  )}
                                </SelectContent>
                              </Select>
                              <Select
                                value={editingColorTheme}
                                onValueChange={setEditingColorTheme}
                              >
                                <SelectTrigger className="h-8 py-0">
                                  <SelectValue placeholder="Theme" />
                                </SelectTrigger>
                                <SelectContent>
                                  {EVENT_THEMES.map((theme) => {
                                    const t = getEventTypeTheme(theme.id);
                                    return (
                                      <SelectItem
                                        key={theme.id}
                                        value={theme.id}
                                      >
                                        <div className="flex items-center gap-2">
                                          <div
                                            className={`h-3 w-3 rounded-full ${t.dot}`}
                                          />
                                          <span className="text-xs">
                                            {theme.label}
                                          </span>
                                        </div>
                                      </SelectItem>
                                    );
                                  })}
                                </SelectContent>
                              </Select>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div
                                className={`h-2.5 w-2.5 rounded-full ${theme.dot}`}
                              />
                              <span className="text-[10px] font-bold text-muted-foreground uppercase">
                                {et.color_theme}
                              </span>
                            </div>
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
                                  variant="success"
                                  size="sm"
                                  className="h-8 px-2 flex items-center gap-1 shadow-sm"
                                  onClick={() => handleUpdate(et)}
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
                                {!et.is_system && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0"
                                      onClick={() => {
                                        setEditingId(et.id);
                                        setEditingName(et.name);
                                        setEditingIcon(et.icon_name || 'Info');
                                        setEditingColorTheme(
                                          et.color_theme || 'other',
                                        );
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
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
