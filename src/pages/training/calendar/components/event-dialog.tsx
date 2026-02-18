import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Event, SportTypeRecord } from '@/types/training';
import { SegmentEditor } from '@/pages/training/events/components/segment-editor';
import { buildUserSettingsMap } from '@/services/training/effort-colors';

interface EventDialogProps {
  event: Event;
  sportTypes: SportTypeRecord[];
  userSettings: any[];
  onSave: (event: Event) => void;
  onDelete: (id: string) => void;
  onCancel: () => void;
}

export function EventDialog({
  event: initial,
  sportTypes,
  userSettings,
  onSave,
  onDelete,
  onCancel,
}: EventDialogProps) {
  const [event, setEvent] = useState<Event>({ ...initial, segments: initial.segments || [] });

  const userSettingsMap = useMemo(
    () => buildUserSettingsMap(userSettings),
    [userSettings]
  );

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="max-h-[90vh] w-full max-w-3xl overflow-hidden p-0">
        <div className="h-2 shrink-0 bg-indigo-600" />
        <div className="flex flex-col overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black lowercase tracking-tight">
              edit event
            </DialogTitle>
          </DialogHeader>

          <DialogBody>
            <div className="space-y-6">
              {/* Title */}
              <div>
                <Label className="text-muted-foreground mb-2 ml-1 text-[10px] font-black uppercase tracking-widest">
                  event title
                </Label>
                <Input
                  required
                  type="text"
                  value={event.title}
                  onChange={(e) => setEvent({ ...event, title: e.target.value })}
                />
              </div>

              {/* Date */}
              <div>
                <Label className="text-muted-foreground mb-2 ml-1 text-[10px] font-black uppercase tracking-widest">
                  date
                </Label>
                <Input
                  type="date"
                  value={event.date}
                  onChange={(e) => setEvent({ ...event, date: e.target.value })}
                />
              </div>

              {/* Type & Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground mb-2 ml-1 text-[10px] font-black uppercase tracking-widest">
                    type
                  </Label>
                  <Select
                    value={event.type}
                    onValueChange={(value: 'Race' | 'Goal' | 'Test') =>
                      setEvent({ ...event, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
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
                    value={event.priority}
                    onValueChange={(value: 'A' | 'B' | 'C') =>
                      setEvent({ ...event, priority: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">A - High</SelectItem>
                      <SelectItem value="B">B - Medium</SelectItem>
                      <SelectItem value="C">C - Low</SelectItem>
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
                  value={event.description || ''}
                  onChange={(e) => setEvent({ ...event, description: e.target.value })}
                  placeholder="Add notes..."
                  rows={3}
                />
              </div>

              {/* Segment Editor */}
              <SegmentEditor
                segments={event.segments || []}
                sportTypes={sportTypes}
                userSettingsMap={userSettingsMap}
                onChange={(segments) => setEvent({ ...event, segments })}
              />
            </div>
          </DialogBody>

          <DialogFooter className="gap-3">
            <Button
              variant="outline"
              onClick={() => onDelete(event.id)}
              className="w-full text-red-500 hover:bg-red-500/10 sm:w-auto"
            >
              delete
            </Button>
            <Button variant="outline" onClick={onCancel} className="w-full sm:w-auto">
              cancel
            </Button>
            <Button onClick={() => onSave(event)} className="w-full sm:flex-1">
              save changes
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
