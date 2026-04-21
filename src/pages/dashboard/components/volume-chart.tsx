import { useMemo } from 'react';
import { ApexOptions } from 'apexcharts';
import { parseISO } from 'date-fns';
import ApexChart from 'react-apexcharts';
import { Event, Workout } from '@/types/training';

type ProgressMetric = 'distance' | 'duration';
type ViewType = 'week' | 'month';
type SportType = 'Swim' | 'Bike' | 'Run' | 'Strength';

interface VolumeChartProps {
  workouts: Workout[];
  events: Event[];
  metric: ProgressMetric;
  sport: SportType | 'All';
  viewType: ViewType;
  pivotDate: Date;
}

export function VolumeChart({
  workouts,
  events,
  metric,
  sport,
  viewType,
  pivotDate,
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

      const isPast = bucketEnd <= today;
      const isCurrent = today >= bucketStart && today < bucketEnd;

      data.push({
        label,
        past: isPast || isCurrent ? Number(val.toFixed(2)) : null,
        future: !isPast ? Number(val.toFixed(2)) : null,
        isCurrent,
        bucketStart: new Date(bucketStart),
        bucketEnd: new Date(bucketEnd),
      });

      if (viewType === 'week') cursor.setDate(cursor.getDate() + 7);
      else cursor.setMonth(cursor.getMonth() + 1);
    }

    return data;
  }, [workouts, events, metric, sport, viewType, pivotDate]);

  const chartOptions: ApexOptions = useMemo(
    () => ({
      series: [
        {
          name: 'Past',
          data: chartData.map((d) => d.past),
        },
        {
          name: 'Future',
          data: chartData.map((d) => d.future),
        },
      ],
      chart: {
        height: 300,
        type: 'area',
        toolbar: { show: false },
        zoom: { enabled: false },
        selection: {
          enabled: false,
        },
      },
      dataLabels: { enabled: false },
      legend: { show: false },
      stroke: {
        curve: 'smooth',
        width: [3, 3],
        colors: ['#3b82f6', '#8b5cf6'],
        dashArray: [0, 5],
      },
      fill: {
        type: 'gradient',
        gradient: {
          opacityFrom: [0.25, 0.1],
          opacityTo: [0, 0],
        },
      },
      colors: ['#3b82f6', '#8b5cf6'],
      xaxis: {
        categories: chartData.map((d) => d.label),
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: {
          rotate: -90,
          rotateAlways: true,
          style: {
            colors: 'var(--color-muted-foreground)',
            fontSize: '10px',
            fontWeight: 800,
          },
        },
      },
      yaxis: {
        min: 0,
        labels: {
          style: {
            colors: 'var(--color-muted-foreground)',
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
        borderColor: 'var(--color-border)',
        strokeDashArray: 5,
        yaxis: { lines: { show: true } },
        xaxis: { lines: { show: false } },
      },
      tooltip: {
        enabled: true,
        shared: true,
        intersect: false,
        followCursor: true,
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

          return `<div class="apexcharts-tooltip-custom" style="padding: 8px 12px; background: var(--color-popover); border: 1px solid var(--color-border); border-radius: 8px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
          <div style="font-size: 11px; font-weight: 700; color: var(--color-muted-foreground); text-transform: lowercase; margin-bottom: 4px;">${dateRange}</div>
          <div style="font-size: 13px; font-weight: 800; color: var(--color-foreground);">Total: ${total.toFixed(2)}${unit}</div>
        </div>`;
        },
      },
      markers: {
        size: 0,
        colors: ['#fff'],
        strokeColors: ['#3b82f6', '#8b5cf6'],
        strokeWidth: 3,
        hover: { size: 6, sizeOffset: 2 },
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
    [chartData, metric, viewType],
  );

  return (
    <ApexChart
      options={chartOptions}
      series={chartOptions.series}
      type="area"
      height={300}
    />
  );
}
