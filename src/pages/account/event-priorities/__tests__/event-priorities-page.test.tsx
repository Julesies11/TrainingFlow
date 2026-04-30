import { fireEvent, render, screen, waitFor } from '@/test/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EventPrioritiesPage } from '../event-priorities-page';

// Mock dependencies
const mockCreateMutation = vi.fn();
const mockUpdateMutation = vi.fn();
const mockDeleteMutation = vi.fn();

vi.mock('@/hooks/use-training-data', () => ({
  useEventPriorities: vi.fn().mockReturnValue({
    data: [
      {
        id: '1',
        name: 'System High',
        is_system: true,
      },
      {
        id: '2',
        name: 'My Custom Priority',
        is_system: false,
      },
    ],
    isLoading: false,
  }),
  useCreateEventPriority: () => ({
    mutate: mockCreateMutation,
    isPending: false,
  }),
  useUpdateEventPriority: () => ({ mutate: mockUpdateMutation }),
  useDeleteEventPriority: () => ({ mutate: mockDeleteMutation }),
}));

describe('EventPrioritiesPage Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the event priorities list correctly', async () => {
    render(<EventPrioritiesPage />);

    await waitFor(() => {
      expect(screen.getByText(/System High/i)).toBeInTheDocument();
      expect(screen.getByText(/My Custom Priority/i)).toBeInTheDocument();
    });
  });

  it('allows adding a new event priority', async () => {
    render(<EventPrioritiesPage />);

    const input = screen.getByPlaceholderText(/e.g. Critical, Optional.../i);
    fireEvent.change(input, { target: { value: 'Urgent' } });

    const addButton = screen.getByRole('button', { name: /add priority/i });
    fireEvent.click(addButton);

    expect(mockCreateMutation).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Urgent',
        is_system: false,
      }),
      expect.any(Object),
    );
  });
});
