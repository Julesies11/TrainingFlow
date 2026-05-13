import { useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';

interface NoteDialogProps {
  note: Partial<Note>;
  onSave: (n: Partial<Note>) => void;
  onDelete?: (id: string) => void;
  onCancel: () => void;
  hideDate?: boolean;
}

export function NoteDialog({
  note: initialNote,
  onSave,
  onDelete,
  onCancel,
  hideDate,
}: NoteDialogProps) {
  const isExisting = !!initialNote.id;

  const [note, setNote] = useState<Partial<Note>>(() => ({
    id: initialNote.id,
    date: initialNote.date || formatDateToLocalISO(new Date()),
    content: initialNote.content || '',
  }));

  const handleSave = () => {
    if (!note.content?.trim()) return;
    onSave(note);
  };

  const dialogTitle = isExisting ? 'edit note' : 'new note';

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
            <div className="space-y-6">
              {!hideDate && (
                <div>
                  <Label className="text-muted-foreground mb-2 ml-1 text-[10px] font-black uppercase tracking-widest">
                    date
                  </Label>
                  <Input
                    type="date"
                    value={note.date}
                    onChange={(e) => setNote({ ...note, date: e.target.value })}
                  />
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

            {isExisting && onDelete && (
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
