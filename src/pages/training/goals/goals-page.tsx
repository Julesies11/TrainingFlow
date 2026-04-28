import { useMemo, useState } from 'react';
import { Edit2, Plus, Target, Trash2 } from 'lucide-react';
import { TrainingGoal } from '@/types/training';
import {
  useCreateGoal,
  useDeleteGoal,
  useGoals,
  useSportTypes,
  useUpdateGoal,
} from '@/hooks/use-training-data';
import { formatMinsShort } from '@/services/training/calendar.utils';
import { Button } from '@/components/ui/button';
import { GoalDialog } from './components/goal-dialog';

export function GoalsPage() {
  const { data: goals = [], isLoading: loadingGoals } = useGoals();
  const { data: sportTypes = [] } = useSportTypes();
  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();
  const deleteGoal = useDeleteGoal();

  const [goalToEdit, setGoalToEdit] = useState<Partial<TrainingGoal> | null>(
    null,
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const sportMap = useMemo(() => {
    const m = new Map();
    sportTypes.forEach((st) => m.set(st.id, st));
    return m;
  }, [sportTypes]);

  const sortedGoals = useMemo(() => {
    return [...goals].sort((a, b) => b.startDate.localeCompare(a.startDate));
  }, [goals]);

  const handleAddGoal = () => {
    setGoalToEdit({});
    setIsDialogOpen(true);
  };

  const handleEditGoal = (goal: TrainingGoal) => {
    setGoalToEdit(goal);
    setIsDialogOpen(true);
  };

  const handleSaveGoal = (goal: Partial<TrainingGoal>) => {
    if (goal.id) {
      updateGoal.mutate(goal as TrainingGoal);
    } else {
      createGoal.mutate(goal);
    }
    setIsDialogOpen(false);
    setGoalToEdit(null);
  };

  if (loadingGoals) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading goals...</div>
      </div>
    );
  }

  return (
    <div className="container-fixed">
      <div className="flex flex-col gap-5 lg:gap-7.5 py-5 px-4">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-2 md:gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight lowercase">
              training goals
            </h2>
            <p className="text-muted-foreground font-medium text-sm md:text-base lowercase">
              set periodized volume targets for your training blocks.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            className="gap-2"
            onClick={handleAddGoal}
          >
            <Plus className="h-4 w-4" />
            <span className="uppercase font-black text-[10px] tracking-widest">
              add goal
            </span>
          </Button>
        </header>

        {/* Goals List */}
        <div className="grid gap-4">
          {sortedGoals.length === 0 ? (
            <div className="bg-card flex flex-col items-center justify-center rounded-2xl border border-dashed p-12 text-center">
              <div className="bg-muted mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                <Target className="text-muted-foreground h-6 w-6" />
              </div>
              <h3 className="text-lg font-black lowercase">no goals set</h3>
              <p className="text-muted-foreground mt-1 text-sm lowercase">
                start by adding your first training target.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-6"
                onClick={handleAddGoal}
              >
                add goal
              </Button>
            </div>
          ) : (
            <div className="bg-card overflow-hidden rounded-2xl border shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-muted/30 border-b">
                  <tr>
                    <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      sport
                    </th>
                    <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      target
                    </th>
                    <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      period
                    </th>
                    <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      dates
                    </th>
                    <th className="px-5 py-3 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {sortedGoals.map((goal) => {
                    const st = sportMap.get(goal.sportTypeId);
                    return (
                      <tr
                        key={goal.id}
                        className="hover:bg-muted/20 transition-colors"
                      >
                        <td className="px-5 py-4">
                          <span className="text-sm font-bold lowercase">
                            {st?.name || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm font-black text-primary">
                            {goal.metric === 'duration'
                              ? formatMinsShort(goal.targetValue)
                              : `${goal.targetValue}${st?.distanceUnit || 'km'}`}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs font-bold lowercase text-muted-foreground">
                            {goal.period}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs font-medium lowercase">
                            {new Date(goal.startDate).toLocaleDateString()} -{' '}
                            {new Date(goal.endDate).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              mode="icon"
                              onClick={() => handleEditGoal(goal)}
                            >
                              <Edit2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              mode="icon"
                              onClick={() => {
                                if (confirm('Delete this goal?')) {
                                  deleteGoal.mutate(goal.id);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <GoalDialog
          open={isDialogOpen}
          goal={goalToEdit}
          sportTypes={sportTypes}
          onSave={handleSaveGoal}
          onCancel={() => {
            setIsDialogOpen(false);
            setGoalToEdit(null);
          }}
        />
      </div>
    </div>
  );
}
