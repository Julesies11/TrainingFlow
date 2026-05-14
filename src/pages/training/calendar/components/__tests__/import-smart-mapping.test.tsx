import { render, screen } from '@/test/test-utils';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ImportDialog } from '../import-dialog';
import * as trainingHooks from '@/hooks/use-training-data';

// Mock hooks
vi.mock('@/hooks/use-training-data', () => ({
  useSportTypes: vi.fn(),
  useCreateWorkoutsBulk: vi.fn().mockReturnValue({ mutate: vi.fn() }),
}));

describe('ImportDialog Smart Mapping Smoke Test', () => {
  const mockSportTypes = [{ id: 'run', name: 'Run' }];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(trainingHooks.useSportTypes).mockReturnValue({
      data: mockSportTypes,
      isLoading: false,
    } as any);
  });

  it('renders without crashing', () => {
    render(<ImportDialog open={true} onOpenChange={() => {}} />);
    expect(screen.getByRole('heading', { name: /import training plan/i })).toBeInTheDocument();
  });
});
