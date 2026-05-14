import { useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Calendar, CalendarPlus, Loader2, Sparkles, Wand2 } from 'lucide-react';
import {
  useCreateNotesBulk,
  useCreateWorkoutsBulk,
  useEvents,
  usePlanTemplates,
} from '@/hooks/use-training-data';
import { formatDateToLocalISO } from '@/services/training/calendar.utils';
import { generateTrainingPlan } from '@/services/training/generator.utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PlanGeneratorWizardProps {
  onClose: () => void;
}

type SchedulingMode = 'forward' | 'backward';

export function PlanGeneratorWizard({ onClose }: PlanGeneratorWizardProps) {
  const [step, setStep] = useState(1);
  const [appliedPlanId] = useState(() => crypto.randomUUID());
  const { data: events = [] } = useEvents();
  const { data: templates = [] } = usePlanTemplates();
  const createBulk = useCreateWorkoutsBulk();
  const createNotesBulk = useCreateNotesBulk();

  // Settings state
  const [mode, setMode] = useState<SchedulingMode>('backward');
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [customStartDate, setSelectedStartDate] = useState<string>(
    formatDateToLocalISO(new Date()),
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

  const selectedEvent = useMemo(
    () => events.find((e) => e.id === selectedEventId),
    [events, selectedEventId],
  );
  const selectedTemplate = useMemo(
    () => templates.find((t) => t.id === selectedTemplateId),
    [templates, selectedTemplateId],
  );

  const anchorDate = useMemo(() => {
    if (mode === 'backward') {
      return selectedEvent?.date || '';
    }
    return customStartDate;
  }, [mode, selectedEvent, customStartDate]);

  // Engine
  const generatedPlan = useMemo(() => {
    if (!selectedTemplate || !anchorDate) return { workouts: [], notes: [] };

    return generateTrainingPlan({
      template: selectedTemplate,
      appliedPlanId,
      mode,
      anchorDate,
    });
  }, [selectedTemplate, anchorDate, mode, appliedPlanId]);

  const handleExecute = () => {
    const { workouts, notes } = generatedPlan;
    createBulk.mutate(workouts, {
      onSuccess: () => {
        if (notes.length > 0) {
          createNotesBulk.mutate(notes, {
            onSuccess: () => onClose(),
          });
        } else {
          onClose();
        }
      },
    });
  };

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const isStep1Ready =
    selectedTemplateId &&
    (mode === 'forward' ? customStartDate : selectedEventId);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-black lowercase tracking-tighter">
            <Sparkles className="h-6 w-6 text-primary" />
            training plan generator
          </DialogTitle>
        </DialogHeader>

        <DialogBody className="py-4">
          {step === 1 && (
            <div className="space-y-6">
              {/* 1. Template Selection */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  1. select training plan
                </Label>
                <Select
                  value={selectedTemplateId}
                  onValueChange={setSelectedTemplateId}
                >
                  <SelectTrigger
                    className="font-bold"
                    aria-label="choose a static training plan"
                  >
                    <SelectValue placeholder="choose a static training plan..." />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((t) => (
                      <SelectItem key={t.id} value={t.id} className="font-bold">
                        {t.name} ({t.totalWeeks} weeks)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 2. Scheduling Mode */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  2. scheduling method
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setMode('backward')}
                    className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all ${
                      mode === 'backward'
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-border hover:bg-muted/50'
                    }`}
                  >
                    <Calendar
                      className={`h-5 w-5 ${mode === 'backward' ? 'text-primary' : 'text-muted-foreground'}`}
                    />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-black uppercase">
                        Work Backwards
                      </span>
                      <span className="text-[9px] text-muted-foreground leading-tight">
                        Ends on event date
                      </span>
                    </div>
                  </button>
                  <button
                    onClick={() => setMode('forward')}
                    className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all ${
                      mode === 'forward'
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-border hover:bg-muted/50'
                    }`}
                  >
                    <CalendarPlus
                      className={`h-5 w-5 ${mode === 'forward' ? 'text-primary' : 'text-muted-foreground'}`}
                    />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-black uppercase">
                        Start From Date
                      </span>
                      <span className="text-[9px] text-muted-foreground leading-tight">
                        Starts on chosen date
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* 3. Anchor Date / Event Selection */}
              <div className="space-y-2 pt-2 border-t">
                {mode === 'backward' ? (
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      3. select target event
                    </Label>
                    <Select
                      value={selectedEventId}
                      onValueChange={setSelectedEventId}
                    >
                      <SelectTrigger
                        className="font-bold"
                        aria-label="choose an event"
                      >
                        <SelectValue placeholder="choose an event..." />
                      </SelectTrigger>
                      <SelectContent>
                        {events.length === 0 && (
                          <SelectItem value="none" disabled>
                            no events found
                          </SelectItem>
                        )}
                        {events.map((e) => (
                          <SelectItem
                            key={e.id}
                            value={e.id}
                            className="font-bold"
                          >
                            {e.title} ({format(parseISO(e.date), 'MMM d, yyyy')}
                            )
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-[10px] text-muted-foreground italic">
                      the plan's last week will be aligned with this event.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      3. select plan start date
                    </Label>
                    <Input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setSelectedStartDate(e.target.value)}
                      className="font-bold"
                    />
                    <p className="text-[10px] text-muted-foreground italic">
                      the plan's first week will start on this date.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  plan preview
                </Label>
                <span className="text-[10px] font-black uppercase bg-primary/10 text-primary px-2 py-0.5 rounded">
                  {generatedPlan.workouts.length} sessions generated
                </span>
              </div>

              <ScrollArea className="h-[350px] rounded-xl border bg-muted/30 p-4">
                <div className="space-y-3">
                  {generatedPlan.workouts.map((w, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-3 bg-background p-3 rounded-lg border shadow-sm"
                    >
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase text-primary/70">
                          {format(parseISO(w.date!), 'EEE, MMM d')}
                        </span>
                        <span className="text-sm font-bold truncate max-w-[200px]">
                          {w.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-black">
                          {w.plannedDurationMinutes}m
                        </span>
                        <span
                          className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border ${w.isKeyWorkout ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}
                        >
                          {w.isKeyWorkout ? 'key' : 'normal'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="rounded-xl bg-blue-50 p-4 border border-blue-100">
                <p className="text-[10px] font-bold text-blue-800 uppercase leading-tight italic">
                  {mode === 'backward'
                    ? `the selected template will be projected backwards from the ${selectedEvent?.title} date.`
                    : `the selected template will start from ${format(parseISO(customStartDate), 'MMM d, yyyy')}.`}{' '}
                  sessions will be created exactly as defined in the template.
                </p>
              </div>
            </div>
          )}
        </DialogBody>

        <DialogFooter className="flex items-center justify-between gap-3 sm:justify-between">
          <Button
            variant="outline"
            onClick={step === 1 ? onClose : prevStep}
            className="font-bold lowercase"
          >
            {step === 1 ? 'cancel' : 'back'}
          </Button>

          {step < 2 ? (
            <Button
              disabled={!isStep1Ready}
              onClick={nextStep}
              className="font-bold lowercase"
            >
              preview plan
            </Button>
          ) : (
            <Button
              onClick={handleExecute}
              disabled={createBulk.isPending || createNotesBulk.isPending}
              className="font-black lowercase gap-2 bg-primary hover:bg-primary/90"
            >
              {createBulk.isPending || createNotesBulk.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="h-4 w-4" />
              )}
              generate & apply plan
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
