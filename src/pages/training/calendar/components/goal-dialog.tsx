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
import { EventGoal } from '@/types/training';

interface GoalDialogProps {
  goal: EventGoal;
  onSave: (g: EventGoal) => void;
  onDelete: (id: string) => void;
  onCancel: () => void;
}

export function GoalDialog({ goal: initial, onSave, onDelete, onCancel }: GoalDialogProps) {
  const [goal, setGoal] = useState<EventGoal>({ ...initial });

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="w-full max-w-md p-0">
        <div className="h-2 shrink-0 bg-indigo-600" />
        <div className="flex flex-col p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tight lowercase">
              edit event
            </DialogTitle>
          </DialogHeader>

          <DialogBody>
            <div className="space-y-6">
              <div>
                <Label className="text-muted-foreground mb-2 ml-1 text-[10px] font-black uppercase tracking-widest">
                  event title
                </Label>
                <Input
                  required
                  type="text"
                  value={goal.title}
                  onChange={(e) => setGoal({ ...goal, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground mb-2 ml-1 text-[10px] font-black uppercase tracking-widest">
                    category
                  </Label>
                  <select
                    value={goal.type}
                    onChange={(e) =>
                      setGoal({ ...goal, type: e.target.value as EventGoal['type'] })
                    }
                    className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-hidden"
                  >
                    <option>Race</option>
                    <option>Goal</option>
                    <option>Test</option>
                  </select>
                </div>
                <div>
                  <Label className="text-muted-foreground mb-2 ml-1 text-[10px] font-black uppercase tracking-widest">
                    priority
                  </Label>
                  <select
                    value={goal.priority}
                    onChange={(e) =>
                      setGoal({
                        ...goal,
                        priority: e.target.value as EventGoal['priority'],
                      })
                    }
                    className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-hidden"
                  >
                    <option>A</option>
                    <option>B</option>
                    <option>C</option>
                  </select>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground mb-2 ml-1 text-[10px] font-black uppercase tracking-widest">
                  event date
                </Label>
                <Input
                  type="date"
                  value={goal.date}
                  onChange={(e) => setGoal({ ...goal, date: e.target.value })}
                />
              </div>

              <div>
                <Label className="text-muted-foreground mb-2 ml-1 text-[10px] font-black uppercase tracking-widest">
                  description
                </Label>
                <Textarea
                  value={goal.description || ''}
                  onChange={(e) =>
                    setGoal({ ...goal, description: e.target.value })
                  }
                  placeholder="optional notes..."
                  rows={3}
                />
              </div>
            </div>
          </DialogBody>

          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={onCancel}>
              cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => onDelete(goal.id)}
            >
              delete
            </Button>
            <Button onClick={() => onSave(goal)} className="flex-1">
              update event
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
