import { render, screen } from '@/test/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { GarminImportDialog } from '../garmin-import-dialog';

// Mock the hooks
vi.mock('@/hooks/use-training-data', () => ({
  useSportTypes: () => ({
    data: [
      { id: '1', name: 'Run' },
      { id: '2', name: 'Bike' },
    ],
    isLoading: false,
  }),
  useCreateWorkoutsBulk: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

vi.mock('@/hooks/use-garmin-mapping', () => ({
  useGarminMappings: () => ({
    data: [],
    isLoading: false,
  }),
  useUpsertGarminMapping: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useDeleteGarminMapping: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

describe('GarminImportDialog Smoke Test', () => {
  it('renders correctly when open', () => {
    render(<GarminImportDialog open={true} onOpenChange={() => {}} />);

    expect(screen.getByText(/import garmin activities/i)).toBeInTheDocument();
    expect(screen.getByText(/upload csv/i)).toBeInTheDocument();
  });

  it('contains the guide information', () => {
    render(<GarminImportDialog open={true} onOpenChange={() => {}} />);

    expect(screen.getByText(/garmin export guide/i)).toBeInTheDocument();
  });
});
