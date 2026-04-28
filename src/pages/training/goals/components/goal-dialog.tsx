import React, { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { SportTypeRecord, TrainingGoal } from '@/types/training';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const goalSchema = z.object({
  sportTypeId: z.string().min(1, 'Sport is required'),
  metric: z.enum(['distance', 'duration']),
  targetValue: z.coerce.number().min(0.1, 'Target must be greater than 0'),
  period: z.enum(['weekly', 'monthly']),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
});

type GoalFormValues = z.infer<typeof goalSchema>;

interface GoalDialogProps {
  goal: Partial<TrainingGoal> | null;
  sportTypes: SportTypeRecord[];
  onSave: (goal: Partial<TrainingGoal>) => void;
  onCancel: () => void;
  open: boolean;
}

export function GoalDialog({
  goal,
  sportTypes,
  onSave,
  onCancel,
  open,
}: GoalDialogProps) {
  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      sportTypeId: '',
      metric: 'distance',
      targetValue: 0,
      period: 'weekly',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
    },
  });

  useEffect(() => {
    if (goal) {
      form.reset({
        sportTypeId: goal.sportTypeId || '',
        metric: goal.metric || 'distance',
        targetValue: goal.targetValue || 0,
        period: goal.period || 'weekly',
        startDate: goal.startDate || new Date().toISOString().split('T')[0],
        endDate:
          goal.endDate ||
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
      });
    }
  }, [goal, form]);

  const handleSubmit = (values: GoalFormValues) => {
    onSave({
      ...goal,
      ...values,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="lowercase font-black tracking-tight">
            {goal?.id ? 'edit training goal' : 'create training goal'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 py-4"
          >
            <FormField
              control={form.control}
              name="sportTypeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="lowercase">sport</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a sport" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sportTypes.map((st) => (
                        <SelectItem key={st.id} value={st.id}>
                          {st.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="metric"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="lowercase">metric</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Metric" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="distance">distance</SelectItem>
                        <SelectItem value="duration">
                          duration (mins)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="targetValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="lowercase">target</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="period"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="lowercase">period</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Period" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="weekly">weekly</SelectItem>
                      <SelectItem value="monthly">monthly</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="lowercase">start date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="lowercase">end date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button variant="outline" type="button" onClick={onCancel}>
                cancel
              </Button>
              <Button variant="primary" type="submit">
                {goal?.id ? 'update goal' : 'create goal'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
