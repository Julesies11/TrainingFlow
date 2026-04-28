import { mockApexChart } from '@/test/setup';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from '@/test/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { VolumeChart } from '../volume-chart';

describe('VolumeChart', () => {
  const mockWorkouts = [
    {
      id: '1',
      title: 'Run 1',
      date: '2026-04-28',
      sportName: 'Run',
      actualDistanceKilometers: 10,
      actualDurationMinutes: 60,
      isCompleted: true,
    },
  ];

  const mockEvents = [
    {
      id: 'e1',
      title: 'Marathon',
      date: '2026-04-28',
      colorTheme: 'morning',
      icon: 'Flag',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with default props', () => {
    render(
      <VolumeChart
        workouts={mockWorkouts as any}
        events={mockEvents as any}
        metric="distance"
        sport="All"
        viewType="week"
        pivotDate={new Date('2026-04-28')}
      />,
    );

    expect(screen.getByTestId('mock-apexchart')).toBeDefined();
  });

  it('handles showEvents prop correctly', () => {
    const { rerender } = render(
      <VolumeChart
        workouts={mockWorkouts as any}
        events={mockEvents as any}
        metric="distance"
        sport="All"
        viewType="week"
        pivotDate={new Date('2026-04-28')}
        showEvents={true}
      />,
    );

    // Get the options passed to the last call of mockApexChart
    let lastCallProps = vi
      .mocked(mockApexChart)
      .mock.calls.slice(-1)[0][0] as any;
    expect(lastCallProps.options.annotations.xaxis.length).toBeGreaterThan(0);

    // Toggle events off
    rerender(
      <VolumeChart
        workouts={mockWorkouts as any}
        events={mockEvents as any}
        metric="distance"
        sport="All"
        viewType="week"
        pivotDate={new Date('2026-04-28')}
        showEvents={false}
      />,
    );

    lastCallProps = vi.mocked(mockApexChart).mock.calls.slice(-1)[0][0] as any;
    expect(lastCallProps.options.annotations.xaxis.length).toBe(0);
  });
});
