import { useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { PlanTemplate, SportTypeRecord } from '@/types/training';
import {
  useDeletePlanTemplate,
  usePlanTemplates,
  useSportTypes,
} from '@/hooks/use-training-data';
import { isPaceRelevant } from '@/services/training/pace-utils';
import { Button } from '@/components/ui/button';
import { TemplateBuilderDialog } from './components/template-builder-dialog';
import { TemplateMiniChart } from './components/template-mini-chart';

function getMedian(values: number[]) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

function TemplateStats({ template }: { template: PlanTemplate }) {
  const stats = useMemo(() => {
    const workouts = template.workouts || [];
    const weeklyTotals: Record<number, { duration: number; count: number }> =
      {};

    for (let i = 1; i <= template.totalWeeks; i++) {
      weeklyTotals[i] = { duration: 0, count: 0 };
    }

    workouts.forEach((w) => {
      if (weeklyTotals[w.weekNumber]) {
        weeklyTotals[w.weekNumber].duration += w.plannedDurationMinutes || 0;
        weeklyTotals[w.weekNumber].count += 1;
      }
    });

    const durations = Object.values(weeklyTotals).map((v) => v.duration / 60);
    const counts = Object.values(weeklyTotals).map((v) => v.count);

    return {
      medianHours: getMedian(durations),
      medianWorkouts: getMedian(counts),
      totalHours: durations.reduce((a, b) => a + b, 0),
    };
  }, [template]);

  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t pt-4">
      <div className="flex flex-col">
        <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
          Duration
        </span>
        <div className="flex items-baseline gap-1">
          <span className="text-sm font-black text-foreground">
            {template.totalWeeks}
          </span>
          <span className="text-[10px] font-bold text-muted-foreground">
            weeks
          </span>
        </div>
      </div>

      <div className="flex flex-col">
        <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
          Total
        </span>
        <div className="flex items-baseline gap-1">
          <span className="text-sm font-black text-foreground">
            {stats.totalHours.toFixed(0)}
          </span>
          <span className="text-[10px] font-bold text-muted-foreground">
            hrs
          </span>
        </div>
      </div>

      <div className="flex flex-col">
        <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
          Commitment
        </span>
        <div className="flex items-baseline gap-1">
          <span className="text-sm font-black text-foreground">
            {stats.medianHours.toFixed(1)}
          </span>
          <span className="text-[10px] font-bold text-muted-foreground">
            hrs/wk
          </span>
        </div>
      </div>

      <div className="flex flex-col">
        <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
          Frequency
        </span>
        <div className="flex items-baseline gap-1">
          <span className="text-sm font-black text-foreground">
            {stats.medianWorkouts}
          </span>
          <span className="text-[10px] font-bold text-muted-foreground">
            sessions/wk
          </span>
        </div>
      </div>
    </div>
  );
}

function TemplateActivityBreakdown({
  template,
  sportTypes,
}: {
  template: PlanTemplate;
  sportTypes: SportTypeRecord[];
}) {
  const breakdown = useMemo(() => {
    const workouts = template.workouts || [];
    const sportData: Record<
      string,
      Record<number, { duration: number; distance: number }>
    > = {};

    workouts.forEach((w) => {
      if (!sportData[w.sportTypeId]) sportData[w.sportTypeId] = {};
      if (!sportData[w.sportTypeId][w.weekNumber]) {
        sportData[w.sportTypeId][w.weekNumber] = { duration: 0, distance: 0 };
      }
      sportData[w.sportTypeId][w.weekNumber].duration +=
        w.plannedDurationMinutes || 0;
      sportData[w.sportTypeId][w.weekNumber].distance +=
        w.plannedDistanceKilometers || 0;
    });

    return Object.entries(sportData)
      .map(([id, weeklyMap]) => {
        const sport = sportTypes.find((s) => s.id === id);
        const weeklyValues = Object.values(weeklyMap);
        const durations = weeklyValues.map((v) => v.duration / 60);
        const distances = weeklyValues.map((v) => v.distance);

        return {
          id,
          name: sport?.name || 'unknown',
          medianHours: getMedian(durations),
          medianDist: getMedian(distances),
          isDistanceRelevant: isPaceRelevant(
            !!sport?.paceRelevant,
            sport?.paceUnit,
          ),
          unit: sport?.distanceUnit || 'km',
        };
      })
      .filter((b) => b.medianHours > 0)
      .sort((a, b) => b.medianHours - a.medianHours);
  }, [template, sportTypes]);

  if (breakdown.length === 0) return null;

  return (
    <div className="mt-4 space-y-1.5 border-t pt-4">
      <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest block mb-2">
        Activity Breakdown (median/wk)
      </span>
      <div className="space-y-2">
        {breakdown.map((item) => (
          <div key={item.id} className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-muted-foreground uppercase truncate pr-2">
              {item.name}
            </span>
            <div className="flex items-center gap-3 shrink-0">
              {item.isDistanceRelevant && item.medianDist > 0 && (
                <span className="text-xs font-black text-foreground/70 italic">
                  {item.medianDist.toFixed(1)}
                  <span className="text-[10px] ml-0.5">{item.unit}</span>
                </span>
              )}
              <span className="text-xs font-black text-foreground min-w-[35px] text-right">
                {item.medianHours.toFixed(1)}h
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TemplatesPage() {
  const { data: templates = [], isLoading: loadingTemplates } =
    usePlanTemplates();
  const { data: sportTypes = [] } = useSportTypes();
  const deleteTemplate = useDeletePlanTemplate();
  const navigate = useNavigate();
  const { id } = useParams();

  const [templateToEdit, setTemplateToEdit] =
    useState<Partial<PlanTemplate> | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Sync state with URL parameter
  useEffect(() => {
    if (id === 'new') {
      setTemplateToEdit({ name: '', totalWeeks: 4, workouts: [], notes: [] });
    } else if (id && templates.length > 0) {
      const found = templates.find((t) => t.id === id);
      if (found) {
        setTemplateToEdit(found);
      } else {
        // If not found, clear param
        navigate('/training-plans', { replace: true });
      }
    } else if (!id) {
      setTemplateToEdit(null);
    }
  }, [id, templates, navigate]);

  const globalMaxVolume = useMemo(() => {
    let max = 0;
    templates.forEach((t) => {
      const workouts = t.workouts || [];
      const weeklyTotals: Record<number, number> = {};
      workouts.forEach((w) => {
        weeklyTotals[w.weekNumber] =
          (weeklyTotals[w.weekNumber] || 0) + (w.plannedDurationMinutes || 0);
      });
      Object.values(weeklyTotals).forEach((v) => {
        if (v > max) max = v;
      });
    });
    return max;
  }, [templates]);

  if (loadingTemplates) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-muted-foreground text-sm">
          Loading templates...
        </div>
      </div>
    );
  }

  if (templateToEdit) {
    return (
      <TemplateBuilderDialog
        template={templateToEdit}
        sportTypes={sportTypes}
        onClose={() => setTemplateToEdit(null)}
      />
    );
  }

  return (
    <div className="container-fixed pb-10">
      <div className="flex flex-col gap-6">
        <header className="flex items-center justify-between px-4 pt-4">
          <div>
            <h1 className="text-2xl font-black lowercase tracking-tighter lg:text-3xl">
              training plans
            </h1>
            <p className="text-muted-foreground text-xs">
              create and manage periodization structures for the plan generator
            </p>
          </div>
          <Button
            onClick={() => navigate('/training-plans/new')}
            className="gap-1.5"
          >
            <Plus className="h-4 w-4" />
            new plan
          </Button>
        </header>

        <div className="grid grid-cols-1 gap-4 px-4 md:grid-cols-2 xl:grid-cols-3">
          {templates.length === 0 ? (
            <div className="col-span-full flex h-40 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-muted/50 text-muted-foreground">
              <p className="text-sm font-medium">no templates found</p>
              <Button
                variant="link"
                onClick={() => navigate('/training-plans/new')}
              >
                create your first template
              </Button>
            </div>
          ) : (
            templates.map((template) => (
              <div
                key={template.id}
                className="group relative flex flex-col rounded-2xl border bg-card p-5 shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-black lowercase tracking-tight">
                      {template.name}
                    </h3>
                    {template.is_system && (
                      <div className="mt-1">
                        <span className="bg-amber-100 text-amber-700 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-tighter">
                          system
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => navigate(`/training-plans/${template.id}`)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {!template.is_system && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setDeleteConfirmId(template.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {template.description && (
                  <p className="mt-3 line-clamp-2 text-xs text-muted-foreground">
                    {template.description}
                  </p>
                )}

                <TemplateStats template={template} />

                <TemplateActivityBreakdown
                  template={template}
                  sportTypes={sportTypes}
                />

                <TemplateMiniChart
                  workouts={template.workouts || []}
                  totalWeeks={template.totalWeeks}
                  globalMaxVolume={globalMaxVolume}
                />

                {/* Delete Confirmation Overlay */}
                {deleteConfirmId === template.id && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-2xl bg-background/95 backdrop-blur-sm p-4 text-center">
                    <p className="text-xs font-bold">delete this template?</p>
                    <div className="flex gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          deleteTemplate.mutate(template.id);
                          setDeleteConfirmId(null);
                        }}
                      >
                        confirm
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteConfirmId(null)}
                      >
                        cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
