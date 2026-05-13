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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface BulkDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBulkDelete?: (
    fromValue: string, // Date (YYYY-MM-DD) or Week Number
    toValue: string, // Date (YYYY-MM-DD) or Week Number
    sportTypeIds: string[],
    daysOfWeek: number[],
  ) => void;
  isTemplateMode?: boolean;
  totalWeeks?: number;
}

const DAYS_OF_WEEK = [
  { value: '1', label: 'M' },
  { value: '2', label: 'T' },
  { value: '3', label: 'W' },
  { value: '4', label: 'T' },
  { value: '5', label: 'F' },
  { value: '6', label: 'S' },
  { value: '7', label: 'S' },
];

export function BulkDeleteDialog({
  open,
  onOpenChange,
  onBulkDelete,
  isTemplateMode = false,
  totalWeeks = 1,
}: BulkDeleteDialogProps) {
  const { data: sportTypes = [] } = useSportTypes();
  const deleteWorkoutsBulk = useDeleteWorkoutsBulk();

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [fromWeek, setFromWeek] = useState(1);
  const [toWeek, setToWeek] = useState(totalWeeks);
  const [selectedSportTypeIds, setSelectedSportTypeIds] = useState<string[]>(
    [],
  );
  const [selectedDaysOfWeek, setSelectedDaysOfWeek] = useState<string[]>([
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
  ]);

  // Default values when opening
  useEffect(() => {
    if (open) {
      if (isTemplateMode) {
        setFromWeek(1);
        setToWeek(totalWeeks);
      } else {
        const today = new Date().toISOString().split('T')[0];
        setFromDate(today);
        // Default to +16 weeks
        const sixteenWeeksOut = new Date();
        sixteenWeeksOut.setDate(sixteenWeeksOut.getDate() + 112);
        setToDate(sixteenWeeksOut.toISOString().split('T')[0]);
      }

      // Select all sports and all days by default
      setSelectedSportTypeIds(sportTypes.map((st) => st.id));
      setSelectedDaysOfWeek(['1', '2', '3', '4', '5', '6', '7']);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, sportTypes.length, totalWeeks, isTemplateMode]);

  const handleToggleSport = (id: string) => {
    setSelectedSportTypeIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleToggleAllSports = () => {
    if (selectedSportTypeIds.length === sportTypes.length) {
      setSelectedSportTypeIds([]);
    } else {
      setSelectedSportTypeIds(sportTypes.map((st) => st.id));
    }
  };

  const handleDelete = async () => {
    if (!isTemplateMode && (!fromDate || !toDate)) {
      toast.error('Please select both start and end dates');
      return;
    }

    if (isTemplateMode && (!fromWeek || !toWeek)) {
      toast.error('Please specify the week range');
      return;
    }

    if (selectedSportTypeIds.length === 0) {
      toast.error('Please select at least one sport type');
      return;
    }

    if (selectedDaysOfWeek.length === 0) {
      toast.error('Please select at least one day of the week');
      return;
    }

    const rangeMsg = isTemplateMode
      ? `weeks ${fromWeek} to ${toWeek}`
      : `between ${fromDate} and ${toDate}`;

    const confirmed = window.confirm(
      `Are you sure you want to delete workouts ${rangeMsg}? This action cannot be undone.`,
    );

    if (!confirmed) return;

    const daysOfWeek = selectedDaysOfWeek.map((d) => parseInt(d));

    if (onBulkDelete) {
      onBulkDelete(
        isTemplateMode ? fromWeek.toString() : fromDate,
        isTemplateMode ? toWeek.toString() : toDate,
        selectedSportTypeIds,
        daysOfWeek,
      );
      toast.success('Workouts deleted successfully');
      onOpenChange(false);
      return;
    }

    // This path is only for the live calendar
    deleteWorkoutsBulk.mutate(
      {
        fromDate,
        toDate,
        sportTypeIds: selectedSportTypeIds,
        daysOfWeek,
      },
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
      <DialogContent className="max-w-md w-[95vw] md:w-full p-0 overflow-hidden rounded-2xl md:rounded-3xl border-0 shadow-2xl">
        <DialogHeader className="px-6 py-5 border-b bg-muted/5">
          <DialogTitle className="text-xl font-black lowercase tracking-tighter flex items-center gap-2.5 text-destructive">
            <Trash2 className="h-5 w-5" />
            Bulk Delete {isTemplateMode ? 'Template Sessions' : 'Workouts'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Are you sure you want to bulk delete the selected sessions? This
            action is permanent.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-6">
          <div className="bg-destructive/5 rounded-2xl border border-destructive/10 p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <p className="text-xs font-semibold text-destructive/80 leading-relaxed">
              This will permanently delete{' '}
              <span className="font-black text-destructive">ALL</span> sessions
              within the selected criteria. This action cannot be undone.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {isTemplateMode ? (
              <>
                <div className="space-y-2">
                  <Label
                    htmlFor="fromWeek"
                    className="text-[10px] font-black uppercase text-muted-foreground/70 flex items-center gap-2 px-1"
                  >
                    From Week
                  </Label>
                  <Input
                    id="fromWeek"
                    type="number"
                    min={1}
                    max={totalWeeks}
                    value={fromWeek}
                    onChange={(e) => setFromWeek(parseInt(e.target.value))}
                    className="h-11 text-xs font-bold rounded-xl border-muted-foreground/10 bg-muted/20 focus:bg-background transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="toWeek"
                    className="text-[10px] font-black uppercase text-muted-foreground/70 flex items-center gap-2 px-1"
                  >
                    To Week
                  </Label>
                  <Input
                    id="toWeek"
                    type="number"
                    min={1}
                    max={totalWeeks}
                    value={toWeek}
                    onChange={(e) => setToWeek(parseInt(e.target.value))}
                    className="h-11 text-xs font-bold rounded-xl border-muted-foreground/10 bg-muted/20 focus:bg-background transition-all"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label
                    htmlFor="fromDate"
                    className="text-[10px] font-black uppercase text-muted-foreground/70 flex items-center gap-2 px-1"
                  >
                    <CalendarIcon className="h-3 w-3" />
                    From Date
                  </Label>
                  <Input
                    id="fromDate"
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="h-11 text-xs font-bold rounded-xl border-muted-foreground/10 bg-muted/20 focus:bg-background transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="toDate"
                    className="text-[10px] font-black uppercase text-muted-foreground/70 flex items-center gap-2 px-1"
                  >
                    <CalendarIcon className="h-3 w-3" />
                    To Date
                  </Label>
                  <Input
                    id="toDate"
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="h-11 text-xs font-bold rounded-xl border-muted-foreground/10 bg-muted/20 focus:bg-background transition-all"
                  />
                </div>
              </>
            )}
          </div>

          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase text-muted-foreground/70 px-1">
              Days of the week
            </Label>
            <ToggleGroup
              type="multiple"
              value={selectedDaysOfWeek}
              onValueChange={setSelectedDaysOfWeek}
              className="justify-start gap-1"
            >
              {DAYS_OF_WEEK.map((day) => (
                <ToggleGroupItem
                  key={day.value}
                  value={day.value}
                  className="h-10 w-10 p-0 rounded-xl text-[10px] font-black data-[state=on]:bg-destructive data-[state=on]:text-destructive-foreground transition-all"
                >
                  {day.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <Label className="text-[10px] font-black uppercase text-muted-foreground/70">
                Sport Types
              </Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleAllSports}
                className="h-7 text-[10px] font-black uppercase tracking-tighter px-3 hover:bg-muted rounded-lg"
              >
                {selectedSportTypeIds.length === sportTypes.length
                  ? 'Deselect All'
                  : 'Select All'}
              </Button>
            </div>

            <ScrollArea className="h-[140px] border border-muted-foreground/10 rounded-2xl bg-muted/10">
              <div className="p-3 space-y-1.5">
                {sportTypes.map((st) => (
                  <div
                    key={st.id}
                    className="group flex items-center space-x-2 cursor-pointer hover:bg-background/50 p-2 rounded-xl transition-all border border-transparent hover:border-muted-foreground/10"
                    onClick={() => handleToggleSport(st.id)}
                  >
                    <Checkbox
                      checked={selectedSportTypeIds.includes(st.id)}
                      className="pointer-events-none rounded-md border-muted-foreground/30 data-[state=checked]:bg-destructive data-[state=checked]:border-destructive"
                    />
                    <Label className="text-xs font-bold cursor-pointer flex-1 group-hover:text-foreground transition-colors pointer-events-none">
                      {st.name}
                    </Label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="px-6 py-5 border-t bg-muted/5 flex flex-col sm:flex-row gap-3">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="font-bold lowercase w-full sm:w-auto rounded-xl hover:bg-muted/50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={deleteWorkoutsBulk.isPending}
            variant="destructive"
            className="font-bold lowercase min-w-[140px] w-full sm:w-auto rounded-xl shadow-lg shadow-destructive/20"
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
