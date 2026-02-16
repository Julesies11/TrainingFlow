import { useState, useMemo } from 'react';
import { Plus, Calendar, Trophy, Target, Trash2, Pencil, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGoals, useCreateGoal, useUpdateGoal, useDeleteGoal } from '@/hooks/use-training-data';
import { EventGoal } from '@/types/training';
import { GoalDialog } from './components/goal-dialog';
import { format, parseISO, isBefore, isAfter, differenceInDays } from 'date-fns';

export function GoalsPage() {
  const { data: goals = [], isLoading } = useGoals();
  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();
  const deleteGoal = useDeleteGoal();

  const [dialogGoal, setDialogGoal] = useState<EventGoal | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { upcoming, past } = useMemo(() => {
    const upcoming: EventGoal[] = [];
    const past: EventGoal[] = [];

    goals.forEach((goal) => {
      const goalDate = parseISO(goal.date);
      if (isBefore(goalDate, today)) {
        past.push(goal);
      } else {
        upcoming.push(goal);
      }
    });

    return { upcoming, past };
  }, [goals, today]);

  const handleSave = (goal: Partial<EventGoal>) => {
    if (goal.id) {
      updateGoal.mutate(goal as EventGoal, {
        onSuccess: () => {
          setDialogGoal(null);
          setIsCreating(false);
        },
      });
    } else {
      createGoal.mutate(goal, {
        onSuccess: () => {
          setDialogGoal(null);
          setIsCreating(false);
        },
      });
    }
  };

  const handleDelete = (id: string) => {
    deleteGoal.mutate(id, {
      onSuccess: () => {
        setDeleteConfirmId(null);
      },
    });
  };

  const getPriorityColor = (priority: 'A' | 'B' | 'C') => {
    switch (priority) {
      case 'A':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'B':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'C':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    }
  };

  const getTypeIcon = (type: 'Race' | 'Goal' | 'Test') => {
    switch (type) {
      case 'Race':
        return <Flag className="h-4 w-4" />;
      case 'Goal':
        return <Target className="h-4 w-4" />;
      case 'Test':
        return <Trophy className="h-4 w-4" />;
    }
  };

  const getDaysUntil = (dateStr: string) => {
    const goalDate = parseISO(dateStr);
    const days = differenceInDays(goalDate, today);
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days < 0) return `${Math.abs(days)} days ago`;
    return `${days} days`;
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4.5rem)] items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading goals...</div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4.5rem)] flex-col">
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-muted/30 flex shrink-0 items-center justify-between border-b px-4 py-6">
          <div>
            <h1 className="text-2xl font-black lowercase tracking-tight">
              goals & events
            </h1>
            <p className="text-muted-foreground text-xs">
              Track your races, goals, and fitness tests
            </p>
          </div>
          <Button
            onClick={() => {
              setDialogGoal(null);
              setIsCreating(true);
            }}
            size="sm"
            className="gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>new event</span>
          </Button>
        </header>

        {/* Content */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-6">
          <div className="mx-auto max-w-5xl space-y-8">
            {/* Upcoming Events */}
            <section>
              <div className="mb-4 flex items-center gap-2">
                <Calendar className="text-primary h-5 w-5" />
                <h2 className="text-lg font-black lowercase tracking-tight">
                  upcoming events
                </h2>
                <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-bold">
                  {upcoming.length}
                </span>
              </div>

              {upcoming.length === 0 ? (
                <div className="bg-muted/30 flex h-32 items-center justify-center rounded-2xl border border-dashed">
                  <p className="text-muted-foreground text-sm">
                    No upcoming events. Add one to start planning!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcoming.map((goal) => (
                    <div
                      key={goal.id}
                      className="bg-card group relative overflow-hidden rounded-2xl border shadow-sm transition-all hover:shadow-md"
                    >
                      <div className="p-5">
                        <div className="flex items-start gap-4">
                          {/* Date badge */}
                          <div className="bg-primary/10 text-primary flex shrink-0 flex-col items-center rounded-xl p-3">
                            <span className="text-2xl font-black">
                              {format(parseISO(goal.date), 'd')}
                            </span>
                            <span className="text-[10px] font-black uppercase">
                              {format(parseISO(goal.date), 'MMM')}
                            </span>
                          </div>

                          {/* Content */}
                          <div className="flex-1">
                            <div className="mb-2 flex items-start justify-between gap-3">
                              <div>
                                <h3 className="text-lg font-black lowercase tracking-tight">
                                  {goal.title}
                                </h3>
                                <p className="text-muted-foreground text-xs">
                                  {getDaysUntil(goal.date)}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <span
                                  className={`flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-bold ${getPriorityColor(goal.priority)}`}
                                >
                                  Priority {goal.priority}
                                </span>
                                <span className="bg-muted flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold">
                                  {getTypeIcon(goal.type)}
                                  {goal.type}
                                </span>
                              </div>
                            </div>
                            {goal.description && (
                              <p className="text-muted-foreground text-sm">
                                {goal.description}
                              </p>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex shrink-0 gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDialogGoal(goal)}
                              className="h-8 w-8 p-0"
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setDeleteConfirmId(goal.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Delete confirmation overlay */}
                      {deleteConfirmId === goal.id && (
                        <div
                          className="absolute inset-0 flex items-center justify-center gap-2 bg-black/70 backdrop-blur-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(goal.id)}
                          >
                            confirm delete
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-white/30 text-white hover:bg-white/20"
                            onClick={() => setDeleteConfirmId(null)}
                          >
                            cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Past Events */}
            {past.length > 0 && (
              <section>
                <div className="mb-4 flex items-center gap-2">
                  <Trophy className="text-muted-foreground h-5 w-5" />
                  <h2 className="text-muted-foreground text-lg font-black lowercase tracking-tight">
                    past events
                  </h2>
                  <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs font-bold">
                    {past.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {past.map((goal) => (
                    <div
                      key={goal.id}
                      className="bg-muted/30 group relative flex items-center gap-4 rounded-xl border p-4 opacity-60 transition-all hover:opacity-100"
                    >
                      <div className="text-muted-foreground flex shrink-0 flex-col items-center rounded-lg bg-white/50 p-2">
                        <span className="text-sm font-black">
                          {format(parseISO(goal.date), 'd')}
                        </span>
                        <span className="text-[8px] font-black uppercase">
                          {format(parseISO(goal.date), 'MMM')}
                        </span>
                      </div>

                      <div className="flex-1">
                        <h3 className="text-sm font-black lowercase tracking-tight">
                          {goal.title}
                        </h3>
                        <p className="text-muted-foreground text-xs">
                          {getDaysUntil(goal.date)}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <span
                          className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold ${getPriorityColor(goal.priority)}`}
                        >
                          {goal.priority}
                        </span>
                        <span className="bg-muted flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold">
                          {getTypeIcon(goal.type)}
                          {goal.type}
                        </span>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteConfirmId(goal.id)}
                        className="h-7 w-7 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>

                      {deleteConfirmId === goal.id && (
                        <div
                          className="absolute inset-0 flex items-center justify-center gap-2 rounded-xl bg-black/70 backdrop-blur-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(goal.id)}
                          >
                            confirm delete
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-white/30 text-white hover:bg-white/20"
                            onClick={() => setDeleteConfirmId(null)}
                          >
                            cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>

      {/* Dialog */}
      {(dialogGoal || isCreating) && (
        <GoalDialog
          goal={dialogGoal || undefined}
          onSave={handleSave}
          onCancel={() => {
            setDialogGoal(null);
            setIsCreating(false);
          }}
        />
      )}
    </div>
  );
}
