import { memo, useMemo } from 'react';
import { ApexOptions } from 'apexcharts';
import ApexChart from 'react-apexcharts';
import { PlanTemplateWorkout } from '@/types/training';

interface TemplateMiniChartProps {
  workouts: PlanTemplateWorkout[];
  totalWeeks: number;
  globalMaxVolume?: number;
}

export const TemplateMiniChart = memo(
  ({ workouts, totalWeeks, globalMaxVolume }: TemplateMiniChartProps) => {
    const data = useMemo(() => {
      return Array.from({ length: totalWeeks }).map((_, i) => {
        const weekNum = i + 1;
        return workouts
          .filter((w) => w.weekNumber === weekNum)
          .reduce((sum, w) => sum + (w.plannedDurationMinutes || 0), 0);
      });
    }, [workouts, totalWeeks]);

    const maxVal = Math.max(...data);
    const effectiveMax = globalMaxVolume || maxVal;

    const options: ApexOptions = {
      chart: {
        type: 'bar',
        sparkline: {
          enabled: true,
        },
        animations: {
          enabled: false,
        },
        parentHeightOffset: 0,
      },
      plotOptions: {
        bar: {
          borderRadius: 2,
          columnWidth: '70%',
          dataLabels: {
            position: 'top',
          },
        },
      },
      dataLabels: {
        enabled: true,
        formatter: (
          val: string | number | number[],
          opts?: { dataPointIndex: number },
        ) => {
          const isFirst = opts?.dataPointIndex === 0;
          const isMax = Number(val) === maxVal && Number(val) > 0;

          if ((isMax || isFirst) && Number(val) > 0) {
            return `${(Number(val) / 60).toFixed(1)}h`;
          }
          return '';
        },
        offsetY: -15,
        style: {
          fontSize: '9px',
          fontWeight: '900',
          colors: ['var(--color-primary)'],
        },
      },
      colors: ['var(--color-primary)'],
      tooltip: {
        enabled: false,
      },
      grid: {
        padding: {
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
        },
      },
      xaxis: {
        labels: {
          show: false,
        },
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
      },
      yaxis: {
        min: 0,
        max: effectiveMax > 0 ? effectiveMax * 1.15 : 10,
        labels: {
          show: false,
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
    };

    const series = [
      {
        name: 'Volume',
        data: data,
      },
    ];

    return (
      <div className="-mt-2 h-[120px] w-full opacity-80">
        <ApexChart options={options} series={series} type="bar" height={120} />
      </div>
    );
  },
);
