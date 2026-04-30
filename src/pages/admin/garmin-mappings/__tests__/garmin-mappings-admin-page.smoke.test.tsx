import { render, screen } from '@/test/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { GarminMappingsAdminPage } from '../garmin-mappings-admin-page';

// Mock protection hook to allow access
vi.mock('@/hooks/use-is-developer', () => ({
  useIsDeveloper: () => true,
}));

vi.mock('@/hooks/use-garmin-mapping', () => ({
  useGarminMappings: () => ({
    data: [
      {
        id: '1',
        garminActivityType: 'Running',
        sportTypeId: 's1',
        isSystem: true,
        garminDistanceUnit: 'km',
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

vi.mock('@/hooks/use-training-data', () => ({
  useSportTypes: () => ({
    data: [{ id: 's1', name: 'Run' }],
    isLoading: false,
  }),
}));

describe('GarminMappingsAdminPage Smoke Test', () => {
  it('renders correctly for authorized users', () => {
    render(<GarminMappingsAdminPage />);

    expect(screen.getByText(/garmin mappings admin/i)).toBeInTheDocument();
    expect(screen.getByText(/mappings guide/i)).toBeInTheDocument();
    expect(screen.getAllByText(/source/i).length).toBeGreaterThan(0); // Admin-only toggle
    expect(screen.getByText(/running/i)).toBeInTheDocument();
  });
});
