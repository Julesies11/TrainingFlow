import { useEffect, useState } from 'react';
import {
  differenceInCalendarDays,
  endOfMonth,
  format,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import {
  Calendar as CalendarIcon,
  Download,
  Filter,
  Loader2,
} from 'lucide-react';
import Papa from 'papaparse';
import { toast } from 'sonner';
import { PlanTemplate, SportTypeRecord } from '@/types/training';
import { useSupabaseUserId } from '@/hooks/use-supabase-user';
import { workoutsApi } from '@/services/api/training/workouts.api';
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

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sportTypes: SportTypeRecord[];
  // If provided, we are exporting a specific template
  template?: Partial<PlanTemplate>;
  // Default date range for calendar export
  defaultFromDate?: string;
  defaultToDate?: string;
}

export function ExportDialog({
  open,
  onOpenChange,
  sportTypes,
  template,
  defaultFromDate,
  defaultToDate,
}: ExportDialogProps) {
  const userId = useSupabaseUserId();
  const [isExporting, setIsExporting] = useState(false);

  // Date range state
  const [fromDate, setFromDate] = useState(
    defaultFromDate || format(startOfMonth(new Date()), 'yyyy-MM-dd'),
  );
  const [toDate, setToDate] = useState(
    defaultToDate || format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  );

  // Sport types filter
  const [selectedSports, setSelectedSports] = useState<string[]>([]);

  // Reset state when opening
  useEffect(() => {
    if (open) {
      setSelectedSports(sportTypes.map((s) => s.id));
      if (defaultFromDate) setFromDate(defaultFromDate);
      if (defaultToDate) setToDate(defaultToDate);
    }
  }, [open, sportTypes, defaultFromDate, defaultToDate]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      let workoutsToExport: unknown[] = [];
      let filename = 'exported_workouts.csv';

      if (template) {
        // Exporting from a template
        filename = `${(template.name || 'training_plan').toLowerCase().replace(/\s+/g, '_')}_export.csv`;
        workoutsToExport = (template.workouts || [])
          .filter((w) => selectedSports.includes(w.sportTypeId))
          .map((w) => ({
            weekNumber: w.weekNumber,
            dayOfWeek: w.dayOfWeek,
            sportName:
              sportTypes.find((s) => s.id === w.sportTypeId)?.name || 'Unknown',
            title: w.title,
            description: w.description || '',
            plannedDurationMinutes: w.plannedDurationMinutes,
            plannedDistanceKilometers: w.plannedDistanceKilometers || 0,
            effortLevel: w.effortLevel || 1,
            isKeyWorkout: w.isKeyWorkout || false,
          }));
      } else if (userId) {
        // Exporting from calendar
        filename = `calendar_export_${fromDate}_to_${toDate}.csv`;
        const fetchedWorkouts = await workoutsApi.getAll(
          userId,
          fromDate,
          toDate,
        );

        // Calculate relative coordinates for "smart" import compatibility
        const anchorDate = parseISO(fromDate);
        const anchorMonday = startOfWeek(anchorDate, { weekStartsOn: 1 });

        workoutsToExport = fetchedWorkouts
          .filter((w) => selectedSports.includes(w.sportTypeId))
          .map((w) => {
            const workoutDate = parseISO(w.date);
            const diffDays = differenceInCalendarDays(
              workoutDate,
              anchorMonday,
            );
            const weekNumber = Math.floor(diffDays / 7) + 1;
            const dayOfWeek = (diffDays % 7) + 1;

            return {
              date: w.date,
              weekNumber,
              dayOfWeek,
              sportName:
                sportTypes.find((s) => s.id === w.sportTypeId)?.name ||
                'Unknown',
              title: w.title,
              description: w.description || '',
              plannedDurationMinutes: w.plannedDurationMinutes,
              plannedDistanceKilometers: w.plannedDistanceKilometers || 0,
              effortLevel: w.effortLevel || 1,
              isKeyWorkout: w.isKeyWorkout || false,
            };
          });
      }

      if (workoutsToExport.length === 0) {
        toast.error('No workouts found matching the criteria');
        return;
      }

      const csv = Papa.unparse(workoutsToExport);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Exported ${workoutsToExport.length} workouts`);
      onOpenChange(false);
    } catch (error: unknown) {
      toast.error(error.message || 'Failed to export workouts');
    } finally {
      setIsExporting(false);
    }
  };

  const toggleSport = (sportId: string) => {
    setSelectedSports((prev) =>
      prev.includes(sportId)
        ? prev.filter((id) => id !== sportId)
        : [...prev, sportId],
    );
  };

  const selectAll = () => setSelectedSports(sportTypes.map((s) => s.id));
  const selectNone = () => setSelectedSports([]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-black lowercase tracking-tight">
            export workouts
          </DialogTitle>
          <DialogDescription className="lowercase">
            {template
              ? `Export workouts from "${template.name}" to a CSV file.`
              : 'Select a date range and activities to export to a CSV file.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {!template && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="fromDate"
                  className="text-[10px] font-black uppercase text-muted-foreground"
                >
                  from date
                </Label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fromDate"
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="toDate"
                  className="text-[10px] font-black uppercase text-muted-foreground"
                >
                  to date
                </Label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="toDate"
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-2">
                <Filter className="h-3 w-3" />
                activity types
              </Label>
              <div className="flex gap-2">
                <button
                  onClick={selectAll}
                  className="text-[9px] font-bold text-primary hover:underline lowercase"
                >
                  all
                </button>
                <button
                  onClick={selectNone}
                  className="text-[9px] font-bold text-muted-foreground hover:underline lowercase"
                >
                  none
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto p-1">
              {sportTypes.map((sport) => (
                <div key={sport.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`sport-${sport.id}`}
                    checked={selectedSports.includes(sport.id)}
                    onCheckedChange={() => toggleSport(sport.id)}
                  />
                  <label
                    htmlFor={`sport-${sport.id}`}
                    className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer lowercase"
                  >
                    {sport.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="font-bold lowercase"
          >
            cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting || selectedSports.length === 0}
            className="font-bold lowercase min-w-[120px]"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            export to csv
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
