import { useMemo } from 'react';
import { getEventTypeTheme } from '@/pages/training/_shared/utils/event-theme';
import { ApexOptions } from 'apexcharts';
import { parseISO } from 'date-fns';
import ApexChart from 'react-apexcharts';
import {
  Event,
  Note,
  SportTypeRecord,
  TrainingGoal,
  Workout,
} from '@/types/training';
import {
  findActiveGoal,
  getTargetValueForBucket,
} from '@/services/training/goals.utils';

type ProgressMetric = 'distance' | 'duration';
type ViewType = 'week' | 'month';

interface VolumeChartProps {
  workouts: Workout[];
  events: Event[];
  notes?: Note[];
  goals?: TrainingGoal[];
  sportTypes?: SportTypeRecord[];
  metric: ProgressMetric;
  sport: string | 'All';
  viewType: ViewType;
  pivotDate: Date;
  showEvents?: boolean;
  showNotes?: boolean;
}

export function VolumeChart({
  workouts,
  events,
  notes = [],
  goals = [],
  sportTypes = [],
  metric,
  sport,
  viewType,
  pivotDate,
  showEvents = true,
  showNotes = true,
}: VolumeChartProps) {
  const chartData = useMemo(() => {
    const data = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const unitCount =
      viewType === 'week' ? (isMobile ? 12 : 24) : isMobile ? 8 : 16;

    const start = new Date(pivotDate);
    if (viewType === 'week') {
      start.setDate(start.getDate() - Math.floor(unitCount / 2) * 7);
      const day = start.getDay();
      const diff = start.getDate() - (day === 0 ? 6 : day - 1);
      start.setDate(diff);
    } else {
      start.setMonth(start.getMonth() - Math.floor(unitCount / 2));
      start.setDate(1);
    }

    const cursor = new Date(start);
    for (let i = 0; i < unitCount; i++) {
      const bucketStart = new Date(cursor);
      const bucketEnd = new Date(cursor);
      let label = '';

      if (viewType === 'week') {
        bucketEnd.setDate(bucketEnd.getDate() + 7);
        label = `${bucketStart.getDate()} ${bucketStart.toLocaleDateString('en-US', { month: 'short' }).toLowerCase()}`;
      } else {
        bucketEnd.setMonth(bucketEnd.getMonth() + 1);
        label = bucketStart
          .toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
          .toLowerCase();
      }

      const bucketWorkouts = workouts.filter((w) => {
        const d = parseISO(w.date);
        const sportMatch = sport === 'All' || w.sportName === sport;
        return d >= bucketStart && d < bucketEnd && sportMatch;
      });

      const bucketEvents = events.filter((e) => {
        const d = parseISO(e.date);
        return d >= bucketStart && d < bucketEnd;
      });

      const bucketNotes = notes.filter((n) => {
        const d = parseISO(n.date);
        return d >= bucketStart && d < bucketEnd;
      });

      let val = bucketWorkouts.reduce((sum, w) => {
        if (metric === 'distance') {
          const dist = w.isCompleted
            ? w.actualDistanceKilometers || 0
            : w.plannedDistanceKilometers || 0;
          return sum + dist;
        }
        if (metric === 'duration') {
          const dur = w.isCompleted
            ? w.actualDurationMinutes || 0
            : w.plannedDurationMinutes || 0;
          return sum + dur;
        }
        return sum;
      }, 0);

      // Add event segment data
      bucketEvents.forEach((event) => {
        if (event.segments && event.segments.length > 0) {
          event.segments.forEach((seg) => {
            const sportMatch = sport === 'All' || seg.sportName === sport;
            if (sportMatch) {
              if (metric === 'distance') {
                val += seg.plannedDistanceKilometers || 0;
              } else if (metric === 'duration') {
                val += seg.plannedDurationMinutes || 0;
              }
            }
          });
        }
      });

      if (metric === 'duration') {
        val = val / 60; // Convert to hours
      }

      // Calculate Goal for this bucket
      const sportRecord =
        sport !== 'All'
          ? sportTypes.find((st) => st.name === sport)
          : undefined;
      const activeGoal = findActiveGoal(
        goals,
        sportRecord?.id,
        metric,
        bucketStart,
        bucketEnd,
      );
      const targetVal = getTargetValueForBucket(activeGoal, metric);

      const isPast = bucketEnd <= today;
      const isCurrent = today >= bucketStart && today < bucketEnd;

      const eventInfo = bucketEvents.map((e) => {
        const theme = getEventTypeTheme(
          e.colorTheme || e.eventTypeColorTheme,
          e.icon || e.eventTypeIcon,
        );
        return {
          title: e.title,
          hex: theme.hex,
        };
      });

      const noteInfo = bucketNotes.map((n) => ({
        content: n.content,
      }));

      data.push({
        label,
        past: isPast || isCurrent ? Number(val.toFixed(2)) : null,
        future: !isPast ? Number(val.toFixed(2)) : null,
        target: targetVal,
        isCurrent,
        bucketStart: new Date(bucketStart),
        bucketEnd: new Date(bucketEnd),
        eventInfo,
        noteInfo,
      });

      if (viewType === 'week') cursor.setDate(cursor.getDate() + 7);
      else cursor.setMonth(cursor.getMonth() + 1);
    }

    return data;
  }, [
    workouts,
    events,
    notes,
    goals,
    sportTypes,
    metric,
    sport,
    viewType,
    pivotDate,
  ]);

  const chartOptions: ApexOptions = useMemo(
    () => ({
      series: [
        {
          name: 'Past',
          type: 'area',
          data: chartData.map((d) => d.past),
        },
        {
          name: 'Future',
          type: 'area',
          data: chartData.map((d) => d.future),
        },
        {
          name: 'Target',
          type: 'line',
          data: chartData.map((d) => d.target),
        },
      ],
      annotations: {
        xaxis: [
          ...(showEvents
            ? chartData
                .filter((d) => d.eventInfo && d.eventInfo.length > 0)
                .map((d, index) => {
                  const firstEvent = d.eventInfo[0];
                  return {
                    x: d.label,
                    strokeDashArray: 4,
                    borderColor: firstEvent.hex,
                    borderWidth: 2,
                    label: {
                      borderColor: firstEvent.hex,
                      position: 'top',
                      style: {
                        color: '#fff',
                        background: firstEvent.hex,
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: { left: 4, right: 4, top: 2, bottom: 2 },
                      },
                      text:
                        firstEvent.title + (d.eventInfo.length > 1 ? ' +' : ''),
                      offsetY: index % 2 === 0 ? -25 : 0,
                      orientation: 'horizontal',
                    },
                  };
                })
            : []),
          ...(showNotes
            ? chartData
                .filter((d) => d.noteInfo && d.noteInfo.length > 0)
                .map((d, index) => {
                  const firstNote = d.noteInfo[0];
                  const noteColor = '#374151'; // Dark grey (gray-700) for notes
                  return {
                    x: d.label,
                    strokeDashArray: 2,
                    borderColor: noteColor,
                    borderWidth: 1,
                    label: {
                      borderColor: noteColor,
                      position: 'top',
                      style: {
                        color: '#fff',
                        background: noteColor,
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: { left: 4, right: 4, top: 2, bottom: 2 },
                      },
                      text:
                        (firstNote.content.length > 15
                          ? firstNote.content.substring(0, 15) + '...'
                          : firstNote.content) +
                        (d.noteInfo.length > 1 ? ' +' : ''),
                      offsetY: index % 2 === 0 ? 70 : 95,
                      orientation: 'horizontal',
                    },
                  };
                })
            : []),
        ],
      },
      chart: {
        height: 300,
        type: 'line',
        toolbar: { show: false },
        zoom: { enabled: false },
        selection: {
          enabled: false,
        },
      },
      dataLabels: { enabled: false },
      legend: {
        show: false,
      },
      stroke: {
        curve: ['smooth', 'smooth', 'stepline'],
        width: [3, 3, 4],
        colors: ['#3b82f6', '#8b5cf6', '#ef4444'],
        dashArray: [0, 5, 0],
      },
      fill: {
        type: ['gradient', 'gradient', 'solid'],
        gradient: {
          opacityFrom: [0.25, 0.1, 0],
          opacityTo: [0, 0, 0],
        },
      },
      colors: ['#3b82f6', '#8b5cf6', '#ef4444'],
      xaxis: {
        categories: chartData.map((d) => d.label),
        axisBorder: { show: false },
        axisTicks: { show: false },
        crosshairs: {
          show: true,
          width: 1,
          position: 'back',
          opacity: 0.9,
          stroke: {
            color: '#6366f1',
            width: 1,
            dashArray: 4,
          },
        },
        tooltip: {
          enabled: false,
        },
        labels: {
          rotate: -90,
          rotateAlways: true,
          style: {
            colors: '#888',
            fontSize: '10px',
            fontWeight: 800,
          },
        },
      },
      yaxis: {
        min: 0,
        labels: {
          style: {
            colors: '#888',
            fontSize: '10px',
            fontWeight: 700,
          },
          formatter: (value: number) => {
            if (metric === 'duration') return `${value}h`;
            return `${value}km`;
          },
        },
      },
      grid: {
        borderColor: '#e5e7eb',
        strokeDashArray: 5,
        yaxis: { lines: { show: true } },
        xaxis: { lines: { show: false } },
      },
      tooltip: {
        enabled: true,
        shared: true,
        intersect: false,
        followCursor: false,
        custom: function ({ series, seriesIndex, dataPointIndex }) {
          const value = series[seriesIndex][dataPointIndex];
          if (value === null || value === undefined) return '';

          const dataPoint = chartData[dataPointIndex];
          const unit = metric === 'duration' ? 'h' : 'km';

          // Calculate total for this data point
          const total = (dataPoint.past || 0) + (dataPoint.future || 0);

          // Format date range
          let dateRange = '';
          if (viewType === 'week') {
            const startDate = dataPoint.bucketStart;
            const endDate = new Date(dataPoint.bucketEnd);
            endDate.setDate(endDate.getDate() - 1); // Adjust to last day of week

            const formatDay = (date: Date) => {
              const day = date.getDate();
              const suffix =
                day === 1 || day === 21 || day === 31
                  ? 'st'
                  : day === 2 || day === 22
                    ? 'nd'
                    : day === 3 || day === 23
                      ? 'rd'
                      : 'th';
              return `${date.toLocaleDateString('en-US', { month: 'short' })} ${day}${suffix}`;
            };

            dateRange = `${formatDay(startDate)} - ${formatDay(endDate)}`;
          } else {
            dateRange = dataPoint.bucketStart.toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
            });
          }

          const eventsHtml =
            showEvents && dataPoint.eventInfo?.length > 0
              ? `
            <div style="margin-top: 8px; border-top: 1px solid #eee; pt-2">
              <div style="font-size: 10px; font-weight: 700; color: #888; text-transform: lowercase; margin-bottom: 4px;">events</div>
              ${dataPoint.eventInfo
                .map(
                  (e: { hex: string; title: string }) => `
                <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 2px;">
                  <div style="width: 8px; height: 8px; border-radius: 2px; background: ${e.hex};"></div>
                  <div style="font-size: 11px; font-weight: 600; color: #333;">${e.title}</div>
                </div>
              `,
                )
                .join('')}
            </div>
          `
              : '';

          const notesHtml =
            showNotes && dataPoint.noteInfo?.length > 0
              ? `
            <div style="margin-top: 8px; border-top: 1px solid #eee; pt-2">
              <div style="font-size: 10px; font-weight: 700; color: #888; text-transform: lowercase; margin-bottom: 4px;">notes</div>
              ${dataPoint.noteInfo
                .map(
                  (n: { content: string }) => `
                <div style="display: flex; align-items: flex-start; gap: 4px; margin-bottom: 4px;">
                  <div style="width: 8px; height: 8px; border-radius: 2px; background: #374151; margin-top: 3px; flex-shrink: 0;"></div>
                  <div style="font-size: 11px; font-weight: 500; color: #555; line-height: 1.3;">${n.content}</div>
                </div>
              `,
                )
                .join('')}
            </div>
          `
              : '';

          return `<div class="apexcharts-tooltip-custom" style="padding: 10px 14px; background: white; border: 1px solid #e5e7eb; border-radius: 10px; box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1); min-width: 180px;">
          <div style="font-size: 11px; font-weight: 700; color: #666; text-transform: lowercase; margin-bottom: 4px;">${dateRange}</div>
          <div style="font-size: 14px; font-weight: 800; color: #111; margin-bottom: 2px;">total: ${total.toFixed(2)}${unit}</div>
          ${eventsHtml}
          ${notesHtml}
        </div>`;
        },
      },
      markers: {
        size: [0, 0, 0],
        hover: {
          size: 6,
        },
      },
      states: {
        hover: {
          filter: {
            type: 'none',
          },
        },
        active: {
          filter: {
            type: 'none',
          },
        },
      },
    }),
    [chartData, metric, viewType, showEvents, showNotes],
  );

  return (
    <ApexChart
      options={chartOptions}
      series={chartOptions.series}
      height={300}
    />
  );
}
