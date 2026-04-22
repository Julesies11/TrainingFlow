import { useEffect, useMemo, useState } from 'react';
import { SegmentEditor } from '@/pages/training/events/components/segment-editor';
import { format } from 'date-fns';
import { Event, SportTypeRecord, UserSportSettings } from '@/types/training';
import { buildUserSettingsMap } from '@/services/training/effort-colors';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface EventDialogProps {
  event?: Event;
  sportTypes: SportTypeRecord[];
  userSettings: UserSportSettings[];
  onSave: (event: Partial<Event>) => void;
  onDelete?: (id: string) => void;
  onCancel: () => void;
}

export function EventDialog({
  event,
  sportTypes,
  userSettings,
  onSave,
  onDelete,
  onCancel,
}: EventDialogProps) {
  const isEdit = !!event?.id;

  const userSettingsMap = useMemo(
    () => buildUserSettingsMap(userSettings),
    [userSettings],
  );

  const [formData, setFormData] = useState<Partial<Event>>({
    id: event?.id,
    title: event?.title || '',
    date: event?.date || format(new Date(), 'yyyy-MM-dd'),
    type: event?.type || 'Race',
    priority: event?.priority || 'B',
    description: event?.description || '',
    segments: event?.segments || [],
  });

  // Sync formData when event prop changes (e.g. when opening a different event)
  useEffect(() => {
    if (event) {
      setFormData({
        id: event.id,
        title: event.title || '',
        date: event.date || format(new Date(), 'yyyy-MM-dd'),
        type: event.type || 'Race',
        priority: event.priority || 'B',
        description: event.description || '',
        segments: event.segments || [],
      });
    }
  }, [event]);

  const handleSubmit = () => {
    if (!formData.title?.trim()) {
      alert('Title is required');
      return;
    }
    if (!formData.date) {
      alert('Date is required');
      return;
    }
    onSave(formData as Event);
  };

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="max-h-[95vh] w-full max-w-3xl overflow-hidden p-0 flex flex-col">
        <div className="h-2 shrink-0 bg-indigo-600" />
        <div className="flex flex-col grow overflow-hidden">
          <DialogHeader className="shrink-0 p-6 pb-0">
            <DialogTitle className="text-2xl font-black lowercase tracking-tight">
              {isEdit ? 'edit event' : 'new event'}
            </DialogTitle>
            <DialogDescription className="sr-only">
              [Description]
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="grow overflow-y-auto scrollable-y p-6 py-4">
            <div className="space-y-6">
              {/* Title */}
              <div>
                <Label className="text-muted-foreground mb-2 ml-1 text-[10px] font-black uppercase tracking-widest">
                  title *
                </Label>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g., Boston Marathon, Ironman 70.3"
                />
              </div>

              {/* Date */}
              <div>
                <Label className="text-muted-foreground mb-2 ml-1 text-[10px] font-black uppercase tracking-widest">
                  date *
                </Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </div>

              {/* Type & Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground mb-2 ml-1 text-[10px] font-black uppercase tracking-widest">
                    type
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: 'Race' | 'Goal' | 'Test') =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Race">Race</SelectItem>
                      <SelectItem value="Goal">Goal</SelectItem>
                      <SelectItem value="Test">Test</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-muted-foreground mb-2 ml-1 text-[10px] font-black uppercase tracking-widest">
                    priority
                  </Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: 'A' | 'B' | 'C') =>
                      setFormData({ ...formData, priority: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">A - High Priority</SelectItem>
                      <SelectItem value="B">B - Medium Priority</SelectItem>
                      <SelectItem value="C">C - Low Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Description */}
              <div>
                <Label className="text-muted-foreground mb-2 ml-1 text-[10px] font-black uppercase tracking-widest">
                  description
                </Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Add notes about this event..."
                  rows={3}
                />
              </div>

              {/* Segment Editor */}
              <SegmentEditor
                segments={formData.segments || []}
                sportTypes={sportTypes}
                userSettingsMap={userSettingsMap}
                onChange={(segments) => setFormData({ ...formData, segments })}
              />

              {/* Priority info */}
              <div className="bg-muted/50 space-y-2 rounded-xl border p-4">
                <p className="text-muted-foreground text-xs font-semibold">
                  Priority Guidelines:
                </p>
                <ul className="text-muted-foreground space-y-1 text-xs">
                  <li>
                    <span className="font-bold">A:</span> Most important events
                    (1-3 per year)
                  </li>
                  <li>
                    <span className="font-bold">B:</span> Important but not
                    critical (4-8 per year)
                  </li>
                  <li>
                    <span className="font-bold">C:</span> Training races or
                    minor goals
                  </li>
                </ul>
              </div>
            </div>
          </DialogBody>

          <DialogFooter className="shrink-0 p-6 pt-0 gap-3">
            {isEdit && onDelete && (
              <Button
                variant="outline"
                onClick={() => onDelete(formData.id!)}
                className="w-full text-red-500 hover:bg-red-500/10 sm:w-auto"
              >
                delete
              </Button>
            )}
            <Button
              variant="outline"
              onClick={onCancel}
              className="w-full sm:w-auto"
            >
              cancel
            </Button>
            <Button onClick={handleSubmit} className="w-full sm:flex-1">
              {isEdit ? 'save changes' : 'create event'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
