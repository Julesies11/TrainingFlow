/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { supabase } from '@/lib/supabase';
import { notesApi } from '../notes.api';

vi.mock('@/lib/supabase', () => {
  const mockFrom: any = {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };

  const mockQuery: any = {
    eq: vi.fn(),
    order: vi.fn(),
    single: vi.fn(),
    select: vi.fn(),
  };

  mockFrom.select.mockReturnValue(mockQuery);
  mockFrom.insert.mockReturnValue(mockQuery);
  mockFrom.update.mockReturnValue(mockQuery);
  mockFrom.delete.mockReturnValue(mockQuery);

  mockQuery.eq.mockReturnValue(mockQuery);
  mockQuery.order.mockReturnValue(mockQuery);
  mockQuery.single.mockReturnValue(mockQuery);
  mockQuery.select.mockReturnValue(mockQuery);

  return {
    supabase: {
      from: vi.fn().mockReturnValue(mockFrom),
    },
  };
});

describe('notesApi', () => {
  const userId = 'test-user-id';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getAll should fetch and map notes', async () => {
    const mockNotes = [
      {
        id: '1',
        user_id: userId,
        date: '2026-04-29',
        content: 'Note 1',
        created_at: '2026-04-29T10:00:00Z',
      },
    ];

    const mockQuery = (supabase.from('') as any).select();
    mockQuery.order.mockResolvedValue({ data: mockNotes, error: null });

    const result = await notesApi.getAll(userId);

    expect(supabase.from).toHaveBeenCalledWith('tf_notes');
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: '1',
      userId: userId,
      date: '2026-04-29',
      content: 'Note 1',
      createdAt: '2026-04-29T10:00:00Z',
    });
  });

  it('create should insert and return a mapped note', async () => {
    const input = { date: '2026-04-30', content: 'New Note' };
    const mockNote = {
      id: '2',
      user_id: userId,
      ...input,
      created_at: '2026-04-29T11:00:00Z',
    };

    const mockQuery = (supabase.from('') as any).insert();
    mockQuery.single.mockResolvedValue({ data: mockNote, error: null });

    const result = await notesApi.create(input, userId);

    expect(supabase.from).toHaveBeenCalledWith('tf_notes');
    expect(result.content).toBe('New Note');
    expect(result.userId).toBe(userId);
  });

  it('update should update and return a mapped note', async () => {
    const input = { id: '1', content: 'Updated Note' };
    const mockNote = {
      id: '1',
      user_id: userId,
      date: '2026-04-29',
      content: 'Updated Note',
      created_at: '2026-04-29T10:00:00Z',
    };

    const mockQuery = (supabase.from('') as any).update();
    mockQuery.single.mockResolvedValue({ data: mockNote, error: null });

    const result = await notesApi.update(input, userId);

    expect(supabase.from).toHaveBeenCalledWith('tf_notes');
    expect(result.content).toBe('Updated Note');
  });

  it('remove should delete the note', async () => {
    const mockQuery = (supabase.from('') as any).delete();
    // Chained eq calls
    mockQuery.eq.mockReturnValue(mockQuery);
    // The final promise-like behavior or awaitable
    mockQuery.then = (onFullfilled: any) =>
      Promise.resolve({ error: null }).then(onFullfilled);

    await notesApi.remove('1', userId);

    expect(supabase.from).toHaveBeenCalledWith('tf_notes');
  });
});
