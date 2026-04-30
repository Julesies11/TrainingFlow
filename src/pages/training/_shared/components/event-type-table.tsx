import { useState } from 'react';
import { Check, Globe, Pencil, Trash2, User, X } from 'lucide-react';
import { EventTypeRecord } from '@/types/training';
import { Button } from '@/components/ui/button';
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  EVENT_ICONS,
  EVENT_THEMES,
  getEventTypeTheme,
} from '../utils/event-theme';

interface EventTypeTableProps {
  eventTypes: EventTypeRecord[];
  isLoading: boolean;
  onUpdate: (et: EventTypeRecord) => void;
  onDelete: (id: string) => void;
  allowSystemEdit?: boolean;
}

export function EventTypeTable({
  eventTypes,
  isLoading,
  onUpdate,
  onDelete,
  allowSystemEdit = false,
}: EventTypeTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingIsSystem, setEditingIsSystem] = useState(false);
  const [editingIcon, setEditingIcon] = useState('Info');
  const [editingColorTheme, setEditingColorTheme] = useState('other');

  const handleStartEdit = (et: EventTypeRecord) => {
    setEditingId(et.id);
    setEditingName(et.name);
    setEditingIsSystem(et.is_system);
    setEditingIcon(et.icon_name || 'Info');
    setEditingColorTheme(et.color_theme || 'other');
  };

  const handleSave = (et: EventTypeRecord) => {
    if (!editingName.trim()) return;
    onUpdate({
      ...et,
      name: editingName.trim(),
      is_system: editingIsSystem,
      icon_name: editingIcon,
      color_theme: editingColorTheme,
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
            <TableHead className="text-[10px] font-black uppercase tracking-widest w-40">
              Theme
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
                colSpan={4}
                className="text-center py-8 text-muted-foreground italic text-sm"
              >
                Loading event types...
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
              const isEditing = editingId === et.id;
              const theme = getEventTypeTheme(
                isEditing ? editingColorTheme : et.color_theme,
                isEditing ? editingIcon : et.icon_name,
              );
              const IconComp = theme.icon;

              return (
                <TableRow key={et.id}>
                  <TableCell className="font-medium">
                    {isEditing ? (
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
                          <IconComp className={`h-3.5 w-3.5 ${theme.text}`} />
                        </div>
                        <span className="text-sm">{et.name}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <div className="flex flex-col gap-2">
                        <Select
                          value={editingIcon}
                          onValueChange={setEditingIcon}
                        >
                          <SelectTrigger className="h-8 py-0">
                            <SelectValue placeholder="Icon" />
                          </SelectTrigger>
                          <SelectContent className="max-h-60 overflow-y-auto">
                            {Object.entries(EVENT_ICONS).map(([name, Icon]) => (
                              <SelectItem key={name} value={name}>
                                <div className="flex items-center gap-2">
                                  <Icon className="h-4 w-4" />
                                  <span className="text-xs">{name}</span>
                                </div>
                              </SelectItem>
                            ))}
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
                                <SelectItem key={theme.id} value={theme.id}>
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
                        className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${et.is_system ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-muted text-muted-foreground border'}`}
                      >
                        {et.is_system ? (
                          <Globe className="h-2.5 w-2.5" />
                        ) : (
                          <User className="h-2.5 w-2.5" />
                        )}
                        {et.is_system ? 'system' : 'custom'}
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
                            onClick={() => handleSave(et)}
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
                          {(allowSystemEdit || !et.is_system) && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleStartEdit(et)}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-destructive"
                                onClick={() => onDelete(et.id)}
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
