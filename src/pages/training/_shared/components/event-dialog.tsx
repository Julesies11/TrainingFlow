import { useEffect, useMemo, useState } from 'react';
import { SegmentEditor } from '@/pages/training/events/components/segment-editor';
import { format } from 'date-fns';
import { Copy, Info } from 'lucide-react';
import { Event, SportTypeRecord, UserSportSettings } from '@/types/training';
import { useEventPriorities, useEventTypes } from '@/hooks/use-training-data';
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
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { EventPriorityMasterDialog } from './event-priority-master-dialog';
import { EventTypeMasterDialog } from './event-type-master-dialog';

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
  const [isDuplicated, setIsDuplicated] = useState(false);
  const { data: eventTypes = [] } = useEventTypes();
  const { data: eventPriorities = [] } = useEventPriorities();
  const [showMasterDialog, setShowMasterDialog] = useState(false);
  const [showPriorityMasterDialog, setShowPriorityMasterDialog] =
    useState(false);

  const userSettingsMap = useMemo(
    () => buildUserSettingsMap(userSettings),
    [userSettings],
  );

  const [formData, setFormData] = useState<Partial<Event>>({
    id: event?.id,
    title: event?.title || '',
    date: event?.date || format(new Date(), 'yyyy-MM-dd'),
    eventTypeId: event?.eventTypeId || '',
    eventPriorityId: event?.eventPriorityId || '',
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
        eventTypeId: event.eventTypeId || '',
        eventPriorityId: event.eventPriorityId || '',
        description: event.description || '',
        segments: event.segments || [],
      });
      setIsDuplicated(false);
    }
  }, [event]);

  // Ensure default event type is selected if none is set
  useEffect(() => {
    if (!formData.eventTypeId && eventTypes.length > 0) {
      const defaultType =
        eventTypes.find((et) => et.name === 'Race') || eventTypes[0];
      setFormData((prev) => ({ ...prev, eventTypeId: defaultType.id }));
    }
  }, [eventTypes, formData.eventTypeId]);

  // Ensure default priority is selected if none is set
  useEffect(() => {
    if (!formData.eventPriorityId && eventPriorities.length > 0) {
      const defaultPriority =
        eventPriorities.find((ep) => ep.name === 'B') || eventPriorities[0];
      setFormData((prev) => ({ ...prev, eventPriorityId: defaultPriority.id }));
    }
  }, [eventPriorities, formData.eventPriorityId]);

  const handleDuplicate = () => {
    setFormData((prev) => ({
      ...prev,
      id: undefined,
      title: `${prev.title} (copy)`,
      segments: prev.segments?.map((seg) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, eventId, ...rest } = seg;
        return rest;
      }),
    }));
    setIsDuplicated(true);
  };

  const handleSubmit = () => {
    if (!formData.title?.trim()) {
      alert('Title is required');
      return;
    }
    if (!formData.date) {
      alert('Date is required');
      return;
    }

    // Include names for optimistic UI updates
    const selectedType = eventTypes.find(
      (et) => et.id === formData.eventTypeId,
    );
    const selectedPriority = eventPriorities.find(
      (ep) => ep.id === formData.eventPriorityId,
    );
    onSave({
      ...formData,
      eventTypeName: selectedType?.name,
      eventPriorityName: selectedPriority?.name,
      priority: (selectedPriority?.name || 'B') as Event['priority'],
    } as Event);
  };

  const title = isDuplicated
    ? 'duplicate event'
    : isEdit
      ? 'edit event'
      : 'new event';

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="max-h-[95vh] w-full max-w-3xl overflow-hidden p-0 flex flex-col">
        <div className="h-2 shrink-0 bg-indigo-600" />
        <div className="flex flex-col grow overflow-hidden">
          <DialogHeader className="shrink-0 p-6 pb-0">
            <DialogTitle className="text-2xl font-black lowercase tracking-tight">
              {title}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Manage your target races, events, and training goals.
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="grow overflow-y-auto scrollable-y p-6 py-4">
            <div className="space-y-6">
              {isDuplicated && (
                <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-700">
                  <Info className="h-5 w-5 shrink-0" />
                  <p className="text-xs font-semibold">
                    this is a duplicated event. please select a new date and
                    save to create a new record.
                  </p>
                </div>
              )}

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
                    value={formData.eventTypeId}
                    onValueChange={(value) => {
                      if (value === '_manage') {
                        setShowMasterDialog(true);
                      } else {
                        setFormData({ ...formData, eventTypeId: value });
                      }
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypes.map((et) => (
                        <SelectItem key={et.id} value={et.id}>
                          {et.name}
                        </SelectItem>
                      ))}
                      <SelectSeparator />
                      <SelectItem
                        value="_manage"
                        className="text-primary font-bold"
                      >
                        manage list...
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-muted-foreground mb-2 ml-1 text-[10px] font-black uppercase tracking-widest">
                    priority
                  </Label>
                  <div className="flex items-center gap-2">
                    <Select
                      value={formData.eventPriorityId}
                      onValueChange={(value) => {
                        if (value === '_manage') {
                          setShowPriorityMasterDialog(true);
                        } else {
                          setFormData({
                            ...formData,
                            eventPriorityId: value,
                          });
                        }
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        {eventPriorities.map((ep) => (
                          <SelectItem key={ep.id} value={ep.id}>
                            {ep.name}
                          </SelectItem>
                        ))}
                        <SelectSeparator />
                        <SelectItem
                          value="_manage"
                          className="text-primary font-bold"
                        >
                          manage list...
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
            {isEdit && !isDuplicated && (
              <Button
                variant="outline"
                onClick={handleDuplicate}
                className="w-full sm:w-auto gap-2"
              >
                <Copy className="h-3 w-3" />
                duplicate
              </Button>
            )}
            {isEdit && !isDuplicated && onDelete && (
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
              {isEdit && !isDuplicated ? 'save changes' : 'create event'}
            </Button>
          </DialogFooter>
        </div>
        {/* Event Type Master Dialog */}
        <EventTypeMasterDialog
          open={showMasterDialog}
          onOpenChange={setShowMasterDialog}
        />
        {/* Event Priority Master Dialog */}
        <EventPriorityMasterDialog
          open={showPriorityMasterDialog}
          onOpenChange={setShowPriorityMasterDialog}
        />
      </DialogContent>
    </Dialog>
  );
}
