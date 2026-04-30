import { render, screen } from '@/test/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { GarminMappingsPage } from '../garmin-mappings-page';

// Mock the hooks
vi.mock('@/hooks/use-training-data', () => ({
  useSportTypes: () => ({
    data: [{ id: '1', name: 'Run' }],
    isLoading: false,
  }),
}));

vi.mock('@/hooks/use-garmin-mapping', () => ({
  useGarminMappings: () => ({
    data: [
      {
        id: 'm1',
        garminActivityType: 'Running',
        sportTypeId: '1',
        isSystem: true,
      },
    ],
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

describe('GarminMappingsPage Smoke Test', () => {
  it('renders correctly', () => {
    render(<GarminMappingsPage />);

    expect(screen.getByText(/garmin mappings/i)).toBeInTheDocument();
    // Using getAllByText because it appears in both a description and a label
    expect(screen.getAllByText(/garmin activity type/i).length).toBeGreaterThan(
      0,
    );
    expect(screen.getByText(/running/i)).toBeInTheDocument();
    expect(screen.getByText(/system/i)).toBeInTheDocument();
  });

  it('shows the add mapping form', () => {
    render(<GarminMappingsPage />);

    expect(screen.getByPlaceholderText(/e\.g\. hiking/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /add mapping/i }),
    ).toBeInTheDocument();
  });
});
