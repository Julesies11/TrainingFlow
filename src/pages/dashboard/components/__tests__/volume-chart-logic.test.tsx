import { mockApexChart } from '@/test/setup';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { render } from '@/test/test-utils';
import { parseISO } from 'date-fns';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { VolumeChart } from '../../../training/_shared/components/volume-chart';

describe('VolumeChart Logic', () => {
  const mockWorkouts = [
    {
      id: '1',
      title: 'Workout 1',
      date: '2026-05-01', // Friday
      sportName: 'Run',
      plannedDistanceKilometers: 10,
      plannedDurationMinutes: 60,
      sportTypeId: 'run-id',
    },
    {
      id: '2',
      title: 'Workout 2',
      date: '2026-05-02', // Saturday
      sportName: 'Bike',
      plannedDistanceKilometers: 40,
      plannedDurationMinutes: 120,
      sportTypeId: 'bike-id',
    },
  ];

  const mockSportTypes = [
    { id: 'run-id', name: 'Run', distanceUnit: 'km' },
    { id: 'bike-id', name: 'Bike', distanceUnit: 'km' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('correctly aggregates data into buckets using Map-based logic', () => {
    render(
      <VolumeChart
        workouts={mockWorkouts as any}
        events={[]}
        sportTypes={mockSportTypes as any}
        metric="duration"
        sport="All"
        viewType="month"
        pivotDate={parseISO('2026-05-01')}
      />,
    );

    const lastCallProps = vi
      .mocked(mockApexChart)
      .mock.calls.slice(-1)[0][0] as any;
    const seriesData = lastCallProps.options.series;

    const pastValues = seriesData[0].data;
    const futureValues = seriesData[1].data;

    const combinedValues = pastValues.map(
      (p: number | null, i: number) => Math.max(p || 0, futureValues[i] || 0),
    );

    // Total should be (60 + 120) / 60 = 3 hours
    const hasThree = combinedValues.some((v: number) => Math.abs(v - 3) < 0.1);
    if (!hasThree) {
      console.log('Combined Values:', combinedValues);
    }
    expect(hasThree).toBe(true);
  });

  it('filters by sport correctly in aggregation', () => {
    render(
      <VolumeChart
        workouts={mockWorkouts as any}
        events={[]}
        sportTypes={mockSportTypes as any}
        metric="distance"
        sportId="run-id"
        viewType="month"
        pivotDate={parseISO('2026-05-01')}
      />,
    );

    const lastCallProps = vi
      .mocked(mockApexChart)
      .mock.calls.slice(-1)[0][0] as any;
    const pastValues = lastCallProps.options.series[0].data;
    const futureValues = lastCallProps.options.series[1].data;
    const combinedValues = pastValues.map(
      (p: number | null, i: number) => Math.max(p || 0, futureValues[i] || 0),
    );

    // Only Run (10km) should be present, not Bike (40km)
    expect(combinedValues).toContain(10);
    expect(combinedValues).not.toContain(40);
    expect(combinedValues).not.toContain(50);
  });
});
