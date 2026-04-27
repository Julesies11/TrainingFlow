import { beforeEach, describe, expect, it, vi } from 'vitest';
import { supabase } from '@/lib/supabase';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { errorLogsApi } from '../error-logs.api';

// Mock Supabase
vi.mock('@/lib/supabase', () => {
  const mockFrom = {
    insert: vi.fn().mockResolvedValue({ error: null }),
  };

  return {
    supabase: {
      from: vi.fn(() => mockFrom),
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'test-user-id' } },
          error: null,
        }),
      },
    },
  };
});

describe('ErrorLogsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should capture and send error to Supabase', async () => {
    const errorData = {
      message: 'Test Error',
      stack: 'Error: Test Error\n at Object.it...',
      component_name: 'TestComponent',
      severity: 'error' as const,
      context: { foo: 'bar' },
    };

    await errorLogsApi.capture(errorData);

    expect(supabase.from).toHaveBeenCalledWith('tf_error_logs');
    const mockFrom = supabase.from('tf_error_logs');
    expect(mockFrom.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Test Error',
        user_id: 'test-user-id',
        component_name: 'TestComponent',
        severity: 'error',
      }),
    );
  });

  it('should handle anonymous error capture', async () => {
    // Mock user as null
    (supabase.auth.getUser as any).mockResolvedValueOnce({
      data: { user: null },
      error: null,
    });

    await errorLogsApi.capture({ message: 'Anon Error' });

    const mockFrom = supabase.from('tf_error_logs');
    expect(mockFrom.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Anon Error',
        user_id: null,
      }),
    );
  });
});
