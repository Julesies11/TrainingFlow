import { useState } from 'react';
import { Plus, Settings } from 'lucide-react';
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
  EVENT_ICONS,
  EVENT_THEMES,
  getEventTypeTheme,
} from '../utils/event-theme';
import { EventTypeTable } from './event-type-table';

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

          {/* Shared Table */}
          <EventTypeTable
            eventTypes={eventTypes}
            isLoading={isLoading}
            onUpdate={(et) => updateMutation.mutate(et)}
            onDelete={handleDelete}
            allowSystemEdit={false}
          />
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
