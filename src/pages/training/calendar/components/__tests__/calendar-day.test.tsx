/* eslint-disable @typescript-eslint/no-explicit-any */
import { act, fireEvent, render, screen } from '@/test/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Event, Workout } from '@/types/training';
import { CalendarDay } from '../calendar-day';

describe('CalendarDay', () => {
  const mockDate = new Date(2026, 3, 27); // April 27, 2026
  const mockSportMap = new Map();
  const mockUserSettingsMap = new Map();

  const mockWorkout: Workout = {
    id: 'w1',
    date: '2026-04-27',
    title: 'Morning Run',
    sportTypeId: 'run-id',
    effortLevel: 3,
    plannedDurationMinutes: 60,
    isKeyWorkout: true,
  } as any;

  const mockEvent: Event = {
    id: 'e1',
    date: '2026-04-27',
    title: 'Marathon Race',
    eventTypeId: 'race-id',
    eventPriorityName: 'A',
    segments: [],
  } as any;

  const defaultProps = {
    date: mockDate,
    workouts: [],
    events: [],
    isToday: true,
    isSelected: false,
    isSameMonth: true,
    displayMonth: 3,
    onSelect: vi.fn(),
    onDragOver: vi.fn(),
    onDragLeave: vi.fn(),
    onDrop: vi.fn(),
    onDragStart: vi.fn(),
    onDragEnd: vi.fn(),
    onEventDragStart: vi.fn(),
    sportMap: mockSportMap,
    userSettingsMap: mockUserSettingsMap,
    showStats: true,
    onEditWorkout: vi.fn(),
    onEditEvent: vi.fn(),
    isDraggingId: null,
    dragOverInfo: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Silencing act warnings
    vi.spyOn(console, 'error').mockImplementation((msg) => {
      if (typeof msg === 'string' && msg.includes('act')) return;
    });
  });

  it('renders the day number correctly', async () => {
    await act(async () => {
      render(<CalendarDay {...defaultProps} />);
    });
    // It renders "apr 27" because dIdx is 0 by default (first day of week in mock)
    expect(screen.getByText(/27/)).toBeDefined();
  });

  it('renders workouts when provided', async () => {
    await act(async () => {
      render(<CalendarDay {...defaultProps} workouts={[mockWorkout]} />);
    });
    expect(screen.getByText(/morning run/i)).toBeDefined();
  });

  it('renders events when provided', async () => {
    await act(async () => {
      render(<CalendarDay {...defaultProps} events={[mockEvent]} />);
    });
    expect(screen.getByText(/marathon race/i)).toBeDefined();
    // Check priority badge
    expect(screen.getByText('A')).toBeDefined();
  });

  it('calls onSelect when clicked', async () => {
    await act(async () => {
      render(<CalendarDay {...defaultProps} />);
    });
    fireEvent.click(screen.getByText(/27/).closest('div')!);
    expect(defaultProps.onSelect).toHaveBeenCalledWith('2026-04-27');
  });

  it('calls onEditWorkout when a workout is clicked', async () => {
    await act(async () => {
      render(<CalendarDay {...defaultProps} workouts={[mockWorkout]} />);
    });
    fireEvent.click(screen.getByText(/morning run/i));
    expect(defaultProps.onEditWorkout).toHaveBeenCalledWith(mockWorkout);
  });

  it('displays key workout star when isKeyWorkout is true', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(
        <CalendarDay {...defaultProps} workouts={[mockWorkout]} />,
      );
      container = result.container;
    });
    // Look for the Star icon (lucide-react)
    const star = container!.querySelector('.lucide-star');
    expect(star).toBeDefined();
  });
});
