import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Calendar as CalendarIcon,
  Loader2,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useDeleteWorkoutsBulk,
  useSportTypes,
} from '@/hooks/use-training-data';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

interface BulkDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BulkDeleteDialog({
  open,
  onOpenChange,
}: BulkDeleteDialogProps) {
  const { data: sportTypes = [] } = useSportTypes();
  const deleteWorkoutsBulk = useDeleteWorkoutsBulk();

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedSportTypeIds, setSelectedSportTypeIds] = useState<string[]>(
    [],
  );

  // Default values when opening
  useEffect(() => {
    if (open) {
      const today = new Date().toISOString().split('T')[0];
      setFromDate(today);
      // Default to end of year or +16 weeks? Let's do +16 weeks as a reasonable default for training plans
      const sixteenWeeksOut = new Date();
      sixteenWeeksOut.setDate(sixteenWeeksOut.getDate() + 112);
      setToDate(sixteenWeeksOut.toISOString().split('T')[0]);

      // Select all sports by default
      setSelectedSportTypeIds(sportTypes.map((st) => st.id));
    }
  }, [open, sportTypes]);

  const handleToggleSport = (id: string) => {
    setSelectedSportTypeIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleToggleAll = () => {
    if (selectedSportTypeIds.length === sportTypes.length) {
      setSelectedSportTypeIds([]);
    } else {
      setSelectedSportTypeIds(sportTypes.map((st) => st.id));
    }
  };

  const handleDelete = async () => {
    if (!fromDate || !toDate) {
      toast.error('Please select both start and end dates');
      return;
    }

    if (selectedSportTypeIds.length === 0) {
      toast.error('Please select at least one sport type');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete incomplete workouts between ${fromDate} and ${toDate}? This action cannot be undone.`,
    );

    if (!confirmed) return;

    deleteWorkoutsBulk.mutate(
      { fromDate, toDate, sportTypeIds: selectedSportTypeIds },
      {
        onSuccess: () => {
          toast.success('Workouts deleted successfully');
          onOpenChange(false);
        },
        onError: (error: Error) => {
          toast.error(error.message || 'Failed to delete workouts');
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[95vw] md:w-full p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-xl font-black lowercase tracking-tight flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Bulk Delete Workouts
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-6">
          <div className="bg-destructive/5 rounded-xl border border-destructive/10 p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <p className="text-xs font-medium text-destructive leading-relaxed">
              This will permanently delete{' '}
              <span className="font-bold">ALL</span> workouts within the
              selected date range and sport types. This action cannot be undone.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1.5">
                <CalendarIcon className="h-3 w-3" />
                From Date
              </Label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="h-10 text-xs font-bold"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1.5">
                <CalendarIcon className="h-3 w-3" />
                To Date
              </Label>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="h-10 text-xs font-bold"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] font-black uppercase text-muted-foreground">
                Sport Types
              </Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleAll}
                className="h-6 text-[9px] font-black uppercase tracking-tighter px-2 hover:bg-muted"
              >
                {selectedSportTypeIds.length === sportTypes.length
                  ? 'Deselect All'
                  : 'Select All'}
              </Button>
            </div>

            <ScrollArea className="h-[150px] pr-4 border rounded-lg p-3 bg-muted/20">
              <div className="space-y-2">
                {sportTypes.map((st) => (
                  <div
                    key={st.id}
                    className="flex items-center space-x-2 cursor-pointer hover:bg-muted/30 p-1 rounded transition-colors"
                    onClick={() => handleToggleSport(st.id)}
                  >
                    <Checkbox
                      id={st.id}
                      checked={selectedSportTypeIds.includes(st.id)}
                      onCheckedChange={() => handleToggleSport(st.id)}
                    />
                    <Label
                      htmlFor={st.id}
                      className="text-xs font-bold cursor-pointer flex-1"
                    >
                      {st.name}
                    </Label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-muted/30 flex flex-col sm:flex-row gap-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="font-bold lowercase w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={deleteWorkoutsBulk.isPending}
            variant="destructive"
            className="font-bold lowercase min-w-[120px] w-full sm:w-auto"
          >
            {deleteWorkoutsBulk.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              `Delete Workouts`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
