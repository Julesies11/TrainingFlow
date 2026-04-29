import { useState } from 'react';
import { EventTypeTable } from '@/pages/training/_shared/components/event-type-table';
import {
  EVENT_ICONS,
  EVENT_THEMES,
  getEventTypeTheme,
} from '@/pages/training/_shared/utils/event-theme';
import { Plus } from 'lucide-react';
import {
  useCreateEventType,
  useDeleteEventType,
  useEventTypes,
  useUpdateEventType,
} from '@/hooks/use-training-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function EventTypesPage() {
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
    <div className="container-fixed">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <header className="flex shrink-0 items-center justify-between px-4 pt-2">
          <div>
            <h1 className="text-2xl font-black lowercase tracking-tighter lg:text-3xl">
              event types
            </h1>
            <p className="text-muted-foreground text-xs">
              Manage global system and your custom event types
            </p>
          </div>
        </header>

        {/* Content */}
        <div className="px-4 pb-8 space-y-6">
          <div className="max-w-6xl space-y-6">
            {/* Add Form */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-card p-5 rounded-2xl border shadow-sm items-end">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  name
                </label>
                <Input
                  placeholder="e.g. Training Camp..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                  className="h-10"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  icon
                </label>
                <Select value={newIcon} onValueChange={setNewIcon}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select icon" />
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

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  color theme
                </label>
                <Select value={newColorTheme} onValueChange={setNewColorTheme}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select theme" />
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
                className="h-10 text-[10px] font-black lowercase"
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                add event type
              </Button>
            </div>

            {/* Shared Table */}
            <EventTypeTable
              eventTypes={eventTypes}
              isLoading={isLoading}
              onUpdate={(et) => updateMutation.mutate(et)}
              onDelete={handleDelete}
              allowSystemEdit={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
