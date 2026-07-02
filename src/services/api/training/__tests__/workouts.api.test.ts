/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { supabase } from '@/lib/supabase';
import { workoutsApi } from '../workouts.api';

vi.mock('@/lib/supabase', () => {
  const createQueryMock = () => {
    const query: any = {
      eq: vi.fn(),
      in: vi.fn(),
      gte: vi.fn(),
      lte: vi.fn(),
    };
    query.eq.mockReturnValue(query);
    query.in.mockReturnValue(query);
    query.gte.mockReturnValue(query);
    query.lte.mockReturnValue(query);
    return query;
  };

  const selectQuery = createQueryMock();
  const deleteQuery = createQueryMock();

  const mockFrom: any = {
    select: vi.fn().mockReturnValue(selectQuery),
    delete: vi.fn().mockReturnValue(deleteQuery),
  };

  return {
    supabase: {
      from: vi.fn().mockReturnValue(mockFrom),
    },
  };
});

describe('workoutsApi deleteBulk', () => {
  const userId = 'test-user-id';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should correctly filter workouts by day of week using UTC methods to prevent timezone shifting', async () => {
    // July 2nd, 2026 is a Thursday (getUTCDay() = 4)
    // July 3rd, 2026 is a Friday (getUTCDay() = 5)
    const mockWorkouts = [
      {
        id: 'workout-thursday',
        user_id: userId,
        date: '2026-07-02',
        title: 'Thursday run',
      },
      {
        id: 'workout-friday',
        user_id: userId,
        date: '2026-07-03',
        title: 'Friday run',
      },
    ];

    const mockQuerySelect = (supabase.from('') as any).select();
    mockQuerySelect.then = (onFulfilled: any) =>
      Promise.resolve({ data: mockWorkouts, error: null }).then(onFulfilled);

    const mockQueryDelete = (supabase.from('') as any).delete();
    mockQueryDelete.then = (onFulfilled: any) =>
      Promise.resolve({ error: null }).then(onFulfilled);

    // Let's filter to delete only Thursday (4)
    await workoutsApi.deleteBulk(
      {
        from: '2026-07-01',
        to: '2026-07-04',
        daysOfWeek: [4], // Thursday
        sportTypeIds: [],
      },
      userId,
    );

    // Verify it selected from tf_workouts
    expect(supabase.from).toHaveBeenCalledWith('tf_workouts');

    // Verify delete was called only with Thursday's workout id
    expect(mockQueryDelete.in).toHaveBeenCalledWith('id', ['workout-thursday']);
  });
});
