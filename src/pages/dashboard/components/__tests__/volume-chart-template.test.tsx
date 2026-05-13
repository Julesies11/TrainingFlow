import { mockApexChart } from '@/test/setup';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { render } from '@/test/test-utils';
import { parseISO } from 'date-fns';
import { describe, expect, it, vi } from 'vitest';
import { VolumeChart } from '../../../training/_shared/components/volume-chart';

describe('VolumeChart Template Mode', () => {
  const mockWorkouts = [
    {
      id: '1',
      title: 'Week 1 Workout',
      date: '2024-01-01', // Week 1 (Monday)
      sportTypeId: 'run-id',
      plannedDistanceKilometers: 10,
      plannedDurationMinutes: 60,
    },
    {
      id: '2',
      title: 'Week 4 Workout',
      date: '2024-01-22', // Week 4 (Monday)
      sportTypeId: 'run-id',
      plannedDistanceKilometers: 20,
      plannedDurationMinutes: 120,
    },
  ];

  const mockSportTypes = [
    { id: 'run-id', name: 'Run', distanceUnit: 'km' },
  ];

  it('renders exact number of weeks in template mode', () => {
    const totalWeeks = 6;
    render(
      <VolumeChart
        workouts={mockWorkouts as any}
        events={[]}
        sportTypes={mockSportTypes as any}
        metric="duration"
        sportId="All"
        viewType="week"
        pivotDate={new Date(2024, 0, 1)}
        templateMode={true}
        totalWeeks={totalWeeks}
      />,
    );

    const lastCallProps = vi.mocked(mockApexChart).mock.calls.slice(-1)[0][0] as any;
    const categories = lastCallProps.options.xaxis.categories;
    
    // Should have exactly totalWeeks categories
    expect(categories).toHaveLength(totalWeeks);
    expect(categories[0]).toBe('Week 1');
    expect(categories[totalWeeks - 1]).toBe(`Week ${totalWeeks}`);
  });

  it('correctly aggregates data into relative weeks', () => {
    render(
      <VolumeChart
        workouts={mockWorkouts as any}
        events={[]}
        sportTypes={mockSportTypes as any}
        metric="duration"
        sportId="All"
        viewType="week"
        pivotDate={new Date(2024, 0, 1)}
        templateMode={true}
        totalWeeks={4}
      />,
    );

    const lastCallProps = vi.mocked(mockApexChart).mock.calls.slice(-1)[0][0] as any;
    const series = lastCallProps.options.series;
    
    // In templateMode, series[0] is the 'Planned' series containing all data
    const combinedData = series[0].data;
    
    expect(combinedData[0]).toBe(1); // Week 1
    expect(combinedData[1]).toBe(0); // Week 2
    expect(combinedData[2]).toBe(0); // Week 3
    expect(combinedData[3]).toBe(2); // Week 4
  });
});
