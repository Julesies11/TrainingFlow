import { memo, Suspense, useCallback, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Event,
  Note,
  SportTypeRecord,
  TrainingGoal,
  Workout,
} from '@/types/training';
import { Label } from '@/components/ui/label';
import { Switch, SwitchWrapper } from '@/components/ui/switch';
import { VolumeChart } from './volume-chart';

type ProgressMetric = 'distance' | 'duration';
type ViewType = 'week' | 'month';

interface VolumeChartWidgetProps {
  workouts: Workout[];
  events: Event[];
  notes?: Note[];
  goals?: TrainingGoal[];
  sportTypes: SportTypeRecord[];
  initialPivotDate?: Date;
  title?: string;
  templateMode?: boolean;
  totalWeeks?: number;
}

export const VolumeChartWidget = memo(function VolumeChartWidget({
  workouts,
  events,
  notes = [],
  goals = [],
  sportTypes,
  initialPivotDate,
  title = 'volume summary',
  templateMode = false,
  totalWeeks,
}: VolumeChartWidgetProps) {
  const [metric, setMetric] = useState<ProgressMetric>('duration');
  const [selectedSportId, setSelectedSportId] = useState<string | 'All'>('All');
  const [viewType, setViewType] = useState<ViewType>('week');
  const [showEvents, setShowEvents] = useState(true);
  const [showNotes, setShowNotes] = useState(true);
  const [pivotDate, setPivotDate] = useState(initialPivotDate || new Date());

  const handleShift = useCallback(
    (direction: 'prev' | 'next') => {
      const newPivot = new Date(pivotDate);
      if (viewType === 'week') {
        newPivot.setDate(newPivot.getDate() + (direction === 'next' ? 7 : -7));
      } else {
        newPivot.setMonth(
          newPivot.getMonth() + (direction === 'next' ? 1 : -1),
        );
      }
      setPivotDate(newPivot);
    },
    [pivotDate, viewType],
  );

  return (
    <div className="bg-card overflow-hidden rounded-2xl border shadow-sm w-full">
      <div className="border-b bg-muted/30 px-5 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <h3 className="text-base md:text-lg font-black lowercase tracking-tight">
            {title}
          </h3>
          <div className="flex flex-wrap items-center gap-3">
            {/* Metric Toggle */}
            <div className="flex items-center gap-1 rounded-lg border bg-background p-0.5 shadow-sm">
              <button
                onClick={() => setMetric('duration')}
                className={`px-2 py-1 text-[10px] font-black uppercase rounded transition-colors ${
                  metric === 'duration'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                duration
              </button>
              <button
                onClick={() => setMetric('distance')}
                className={`px-2 py-1 text-[10px] font-black uppercase rounded transition-colors ${
                  metric === 'distance'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                distance
              </button>
            </div>

            {/* Sport Selector */}
            <div className="flex items-center gap-1 rounded-lg border bg-background p-0.5 shadow-sm">
              <button
                onClick={() => setSelectedSportId('All')}
                className={`px-2 py-1 text-[10px] font-black uppercase rounded transition-colors ${
                  selectedSportId === 'All'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                all
              </button>
              {sportTypes.map((st) => (
                <button
                  key={st.id}
                  onClick={() => setSelectedSportId(st.id)}
                  className={`px-2 py-1 text-[10px] font-black uppercase rounded transition-colors ${
                    selectedSportId === st.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {st.name.toLowerCase()}
                </button>
              ))}
            </div>

            {/* View Type Toggle */}
            <div className="flex items-center gap-1 rounded-lg border bg-background p-0.5 shadow-sm">
              <button
                onClick={() => setViewType('week')}
                className={`px-2 py-1 text-[10px] font-black uppercase rounded transition-colors ${
                  viewType === 'week'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                week
              </button>
              <button
                onClick={() => setViewType('month')}
                className={`px-2 py-1 text-[10px] font-black uppercase rounded transition-colors ${
                  viewType === 'month'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                month
              </button>
            </div>

            {/* Date Shifting */}
            <div className="flex items-center gap-1 mr-auto md:mr-0">
              <button
                onClick={() => handleShift('prev')}
                className="p-1.5 rounded-lg hover:bg-muted border border-transparent hover:border-border transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleShift('next')}
                className="p-1.5 rounded-lg hover:bg-muted border border-transparent hover:border-border transition-all"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Visibility Toggles */}
            <div className="flex items-center gap-2 ml-auto">
              <div className="flex items-center gap-3 bg-muted/50 rounded-lg border px-3 py-1.5 shadow-inner">
                <div className="flex items-center gap-2 pr-3 border-r border-muted-foreground/20">
                  <Label
                    htmlFor="notes-toggle"
                    className="text-[10px] font-black uppercase tracking-widest text-gray-600 cursor-pointer"
                  >
                    notes
                  </Label>
                  <SwitchWrapper>
                    <Switch
                      id="notes-toggle"
                      checked={showNotes}
                      onCheckedChange={setShowNotes}
                      size="sm"
                    />
                  </SwitchWrapper>
                </div>

                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="events-toggle"
                    className="text-[10px] font-black uppercase tracking-widest text-primary cursor-pointer"
                  >
                    events
                  </Label>
                  <SwitchWrapper>
                    <Switch
                      id="events-toggle"
                      checked={showEvents}
                      onCheckedChange={setShowEvents}
                      size="sm"
                    />
                  </SwitchWrapper>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="p-5">
        <Suspense
          fallback={
            <div className="h-[300px] flex items-center justify-center text-muted-foreground text-xs lowercase">
              loading chart...
            </div>
          }
        >
          <VolumeChart
            workouts={workouts}
            events={events}
            notes={notes}
            goals={goals}
            sportTypes={sportTypes}
            metric={metric}
            sportId={selectedSportId}
            viewType={viewType}
            pivotDate={pivotDate}
            showEvents={showEvents}
            showNotes={showNotes}
            templateMode={templateMode}
            totalWeeks={totalWeeks}
          />
        </Suspense>
      </div>
    </div>
  );
});
