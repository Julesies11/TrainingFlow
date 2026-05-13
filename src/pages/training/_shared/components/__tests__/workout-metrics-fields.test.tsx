/* eslint-disable @typescript-eslint/no-explicit-any */
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { WorkoutMetricsFields } from '../workout-metrics-fields';

describe('WorkoutMetricsFields', () => {
  const mockSport = {
    id: 'run',
    name: 'Run',
    distanceUnit: 'km',
    paceUnit: 'min/km',
    paceRelevant: true,
  };

  const mockSwim = {
    id: 'swim',
    name: 'Swim',
    distanceUnit: 'm',
    paceUnit: 'min/100m',
    paceRelevant: true,
  };

  it('renders distance and duration fields', () => {
    render(
      <WorkoutMetricsFields
        selectedSport={mockSport as any}
        plannedDistanceKilometers={10}
        plannedDurationMinutes={60}
        onDistanceChange={vi.fn()}
        onDurationChange={vi.fn()}
      />,
    );
    expect(screen.getByLabelText(/dist/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/dur/i)).toBeInTheDocument();
  });

  it('calculates and displays pace', () => {
    render(
      <WorkoutMetricsFields
        selectedSport={mockSport as any}
        plannedDistanceKilometers={10}
        plannedDurationMinutes={60}
        onDistanceChange={vi.fn()}
        onDurationChange={vi.fn()}
      />,
    );
    expect(screen.getByText(/6:00\s+\/km/i)).toBeInTheDocument(); // 60 min / 10 km = 6:00 min/km
  });

  it('handles meter conversion for swim distance', () => {
    const onDistanceChange = vi.fn();
    render(
      <WorkoutMetricsFields
        selectedSport={mockSwim as any}
        plannedDistanceKilometers={1.5} // 1500m
        plannedDurationMinutes={30}
        onDistanceChange={onDistanceChange}
        onDurationChange={vi.fn()}
      />,
    );

    const distInput = screen.getByLabelText(/dist/i) as HTMLInputElement;
    expect(distInput.value).toBe('1500');

    fireEvent.change(distInput, { target: { value: '2000' } });
    expect(onDistanceChange).toHaveBeenCalledWith(2); // 2000m -> 2km
  });
});
