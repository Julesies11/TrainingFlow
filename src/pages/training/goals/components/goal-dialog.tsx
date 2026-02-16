import { useState } from 'react';
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
import { EventGoal } from '@/types/training';
import { format } from 'date-fns';

interface GoalDialogProps {
  goal?: EventGoal;
  onSave: (goal: Partial<EventGoal>) => void;
  onCancel: () => void;
}

export function GoalDialog({ goal, onSave, onCancel }: GoalDialogProps) {
  const isEdit = !!goal?.id;

  const [formData, setFormData] = useState<Partial<EventGoal>>({
    id: goal?.id,
    title: goal?.title || '',
    date: goal?.date || format(new Date(), 'yyyy-MM-dd'),
    type: goal?.type || 'Race',
    priority: goal?.priority || 'B',
    description: goal?.description || '',
  });

  const handleSubmit = () => {
    if (!formData.title?.trim()) {
      alert('Title is required');
      return;
    }
    if (!formData.date) {
      alert('Date is required');
      return;
    }
    onSave(formData);
  };

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="max-h-[90vh] w-full max-w-2xl overflow-hidden p-0">
        <div className="flex flex-col overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tight lowercase">
              {isEdit ? 'edit event' : 'new event'}
            </DialogTitle>
          </DialogHeader>

          <DialogBody>
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
                  placeholder="e.g., Boston Marathon, FTP Test"
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
                    value={formData.priority}
                    onValueChange={(value: 'A' | 'B' | 'C') =>
                      setFormData({ ...formData, priority: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
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
                  rows={4}
                />
              </div>

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

          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={onCancel}>
              cancel
            </Button>
            <Button onClick={handleSubmit} className="flex-1">
              {isEdit ? 'save changes' : 'create event'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
