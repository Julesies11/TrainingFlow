import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Note } from '@/types/training';
import { formatDateToLocalISO } from '@/services/training/calendar.utils';
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

interface NoteDialogProps {
  note: Partial<Note>;
  onSave: (n: Partial<Note>) => void;
  onDelete?: (id: string) => void;
  onCancel: () => void;
  hideDate?: boolean;
  totalWeeks?: number;
}

export function NoteDialog({
  note: initialNote,
  onSave,
  onDelete,
  onCancel,
  hideDate,
  totalWeeks = 4,
}: NoteDialogProps) {
  const isExisting = !!initialNote.id;

  const [note, setNote] = useState<Partial<Note>>(() => ({
    id: initialNote.id,
    date: initialNote.date || formatDateToLocalISO(new Date()),
    content: initialNote.content || '',
  }));

  const [isDuplicated, setIsDuplicated] = useState(false);

  const getCoordinatesFromDate = (dateStr: string) => {
    const date = new Date(dateStr.replace(/-/g, '/'));
    const dummyBase = new Date(2024, 0, 1);
    const diffDays = Math.floor(
      (date.getTime() - dummyBase.getTime()) / (1000 * 60 * 60 * 24),
    );
    const weekNumber = Math.floor(diffDays / 7) + 1;
    let dayOfWeek = date.getDay();
    if (dayOfWeek === 0) dayOfWeek = 7;
    return { weekNumber, dayOfWeek };
  };

  const getDateFromCoordinates = (weekNum: number, dayOf: number) => {
    const dummyBase = new Date(2024, 0, 1); // Monday, Jan 1, 2024
    const totalDays = (weekNum - 1) * 7 + (dayOf - 1);
    const targetDate = new Date(
      dummyBase.getTime() + totalDays * 24 * 60 * 60 * 1000,
    );
    return formatDateToLocalISO(targetDate);
  };

  const handleDuplicate = () => {
    setNote({
      ...note,
      id: undefined,
    });
    setIsDuplicated(true);
  };

  const handleSave = () => {
    if (!note.content?.trim()) return;
    onSave(note);
  };

  const coords = getCoordinatesFromDate(
    note.date || formatDateToLocalISO(new Date()),
  );
  const dialogTitle = isDuplicated
    ? 'duplicate note'
    : isExisting
      ? 'edit note'
      : 'new note';

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="max-w-full sm:max-w-md w-full h-[100dvh] sm:h-auto sm:max-h-[95vh] flex flex-col p-0 overflow-hidden bg-background top-0 left-0 translate-x-0 translate-y-0 sm:top-[50%] sm:left-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%] border-0 sm:border rounded-none sm:rounded-xl">
        {/* Color bar */}
        <div className="h-2 shrink-0 bg-info" />

        <div className="flex flex-col grow overflow-hidden">
          <DialogHeader className="shrink-0 px-6 pt-5 pb-0 mb-0">
            <DialogTitle className="text-2xl font-black tracking-tight lowercase">
              {dialogTitle}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Add a note to your training calendar.
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="grow overflow-y-auto scrollable-y px-6 pb-4 pt-4">
            {isDuplicated && (
              <div className="mb-6 rounded-xl border border-primary/30 bg-primary/10 p-4 text-center">
                <div className="flex items-center gap-2 justify-center text-primary text-xs font-bold lowercase">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-primary" />
                  this is a duplicated note. please select a new{' '}
                  {hideDate ? 'week/day' : 'date'} and save.
                </div>
              </div>
            )}

            <div className="space-y-6">
              {!hideDate && (
                <div>
                  <Label className="text-muted-foreground mb-2 ml-1 text-[10px] font-black uppercase tracking-widest">
                    date
                  </Label>
                  <Input
                    type="date"
                    value={note.date}
                    className={
                      isDuplicated
                        ? 'border-primary ring-primary/20 ring-2'
                        : ''
                    }
                    onChange={(e) => setNote({ ...note, date: e.target.value })}
                  />
                </div>
              )}

              {hideDate && isDuplicated && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground ml-1 text-[10px] font-black uppercase tracking-widest">
                      week number
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      max={totalWeeks}
                      value={coords.weekNumber}
                      className="border-primary ring-primary/20 ring-2"
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        const newDate = getDateFromCoordinates(
                          val,
                          coords.dayOfWeek,
                        );
                        setNote({ ...note, date: newDate });
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground ml-1 text-[10px] font-black uppercase tracking-widest">
                      day of week
                    </Label>
                    <Select
                      value={coords.dayOfWeek.toString()}
                      onValueChange={(val) => {
                        const dayVal = parseInt(val) || 1;
                        const newDate = getDateFromCoordinates(
                          coords.weekNumber,
                          dayVal,
                        );
                        setNote({ ...note, date: newDate });
                      }}
                    >
                      <SelectTrigger className="border-primary ring-primary/20 ring-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1" className="font-bold lowercase">
                          monday
                        </SelectItem>
                        <SelectItem value="2" className="font-bold lowercase">
                          tuesday
                        </SelectItem>
                        <SelectItem value="3" className="font-bold lowercase">
                          wednesday
                        </SelectItem>
                        <SelectItem value="4" className="font-bold lowercase">
                          thursday
                        </SelectItem>
                        <SelectItem value="5" className="font-bold lowercase">
                          friday
                        </SelectItem>
                        <SelectItem value="6" className="font-bold lowercase">
                          saturday
                        </SelectItem>
                        <SelectItem value="7" className="font-bold lowercase">
                          sunday
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <div>
                <Label className="text-muted-foreground mb-2 ml-1 text-[10px] font-black uppercase tracking-widest">
                  note content
                </Label>
                <Textarea
                  value={note.content}
                  onChange={(e) =>
                    setNote({ ...note, content: e.target.value })
                  }
                  placeholder="write your note here..."
                  rows={5}
                  autoFocus
                />
              </div>
            </div>
          </DialogBody>

          <DialogFooter className="shrink-0 p-6 pt-0 gap-3">
            <Button
              variant="outline"
              onClick={onCancel}
              className="w-full sm:w-auto"
            >
              cancel
            </Button>

            {isExisting && !isDuplicated && (
              <Button
                variant="outline"
                onClick={handleDuplicate}
                className="w-full sm:w-auto"
              >
                duplicate
              </Button>
            )}

            {isExisting && !isDuplicated && onDelete && (
              <Button
                variant="destructive"
                onClick={() => onDelete(note.id!)}
                className="w-full sm:w-auto"
              >
                delete
              </Button>
            )}

            <Button
              onClick={handleSave}
              className="w-full sm:flex-1"
              disabled={!note.content?.trim()}
            >
              save note
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
