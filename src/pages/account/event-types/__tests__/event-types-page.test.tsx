import { fireEvent, render, screen, waitFor } from '@/test/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EventTypesPage } from '../event-types-page';

// Mock dependencies
const mockCreateMutation = vi.fn();
const mockUpdateMutation = vi.fn();
const mockDeleteMutation = vi.fn();

vi.mock('@/hooks/use-training-data', () => ({
  useEventTypes: vi.fn().mockReturnValue({
    data: [
      {
        id: '1',
        name: 'System Event',
        is_system: true,
        icon_name: 'Star',
        color_theme: 'amber',
      },
      {
        id: '2',
        name: 'My Personal Event',
        is_system: false,
        icon_name: 'Heart',
        color_theme: 'sky',
      },
    ],
    isLoading: false,
  }),
  useCreateEventType: () => ({ mutate: mockCreateMutation, isPending: false }),
  useUpdateEventType: () => ({ mutate: mockUpdateMutation }),
  useDeleteEventType: () => ({ mutate: mockDeleteMutation }),
}));

describe('EventTypesPage Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the event types list correctly', async () => {
    render(<EventTypesPage />);

    await waitFor(() => {
      expect(screen.getByText(/System Event/i)).toBeInTheDocument();
      expect(screen.getByText(/My Personal Event/i)).toBeInTheDocument();
    });
  });

  it('allows adding a new event type', async () => {
    render(<EventTypesPage />);

    const input = screen.getByPlaceholderText(/e.g. Training Camp.../i);
    fireEvent.change(input, { target: { value: 'New Custom Event' } });

    const addButton = screen.getByRole('button', { name: /add event type/i });
    fireEvent.click(addButton);

    expect(mockCreateMutation).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'New Custom Event',
        is_system: false,
        icon_name: 'Info',
        color_theme: 'other',
      }),
      expect.any(Object),
    );
  });
});
