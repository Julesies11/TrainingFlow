import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { TemplateBuilderDialog } from '../template-builder-dialog';

// Mock dependencies
const mockSportTypes: unknown[] = [];
const mockLibrary: unknown[] = [];

vi.mock('@/hooks/use-training-data', () => ({
  useLibrary: () => ({ data: mockLibrary }),
  useUserSportSettings: () => ({ data: [] }),
  useCreateLibraryWorkout: () => ({ mutate: vi.fn() }),
  useUpdateLibraryWorkout: () => ({ mutate: vi.fn() }),
  useDeleteLibraryWorkout: () => ({ mutate: vi.fn() }),
  useIsDeveloper: () => false,
  useCreatePlanTemplate: () => ({ mutate: vi.fn(), isPending: false }),
  useUpdatePlanTemplate: () => ({ mutate: vi.fn(), isPending: false }),
  useSportTypes: () => ({ data: mockSportTypes }),
  useCreateWorkoutsBulk: () => ({ mutate: vi.fn(), isPending: false }),
  useDeleteWorkoutsBulk: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock('@/hooks/use-supabase-user', () => ({
  useSupabaseUserId: () => 'test-user-id',
}));

// Mock ResizeObserver
global.ResizeObserver = class {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderComponent = (props = {}) => {
  const defaultProps = {
    template: { name: 'Test Template', workouts: [], notes: [] },
    sportTypes: [],
    onClose: vi.fn(),
  };
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <TemplateBuilderDialog {...defaultProps} {...props} />
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe('TemplateBuilderDialog', () => {
  it('renders the "Back" button and initial "save" button', () => {
    renderComponent();
    expect(screen.getByLabelText(/back to plans/i)).toBeInTheDocument();
    expect(screen.getByText(/^save$/i)).toBeInTheDocument();
  });

  it('maintains "save" text when form is dirty', async () => {
    renderComponent();

    // Change plan name to trigger dirty state
    const nameInput = screen.getByPlaceholderText(/plan name/i);
    fireEvent.change(nameInput, { target: { value: 'New Name' } });

    // The text should still be "save"
    expect(screen.getByText(/^save$/i)).toBeInTheDocument();
  });

  it('shows the discard confirmation when clicking Back with unsaved changes', async () => {
    renderComponent();

    // 1. Make a change
    const nameInput = screen.getByPlaceholderText(/plan name/i);
    fireEvent.change(nameInput, { target: { value: 'Modified Plan' } });

    // 2. Click Back
    const backBtn = screen.getByLabelText(/back to plans/i);
    fireEvent.click(backBtn);

    // 3. Verify Alert Dialog appears
    expect(screen.getByText(/unsaved changes/i)).toBeInTheDocument();
    expect(screen.getByText(/discard changes/i)).toBeInTheDocument();
  });

  it('opens the Bulk Delete dialog from the more actions menu', async () => {
    renderComponent();

    // 1. Click the 'More' menu trigger
    const moreBtn = screen.getByLabelText(/more actions/i);
    fireEvent.pointerDown(moreBtn, { button: 0 });
    fireEvent.pointerUp(moreBtn, { button: 0 });
    fireEvent.click(moreBtn);

    // 2. Click the 'bulk delete' menu item
    const bulkDeleteBtn = await screen.findByText(
      /bulk delete/i,
      {},
      { timeout: 2000 },
    );
    fireEvent.click(bulkDeleteBtn);

    await waitFor(
      () => {
        expect(
          screen.getByText(/Bulk Delete Template Sessions/i),
        ).toBeInTheDocument();
      },
      { timeout: 2000 },
    );
  });
});
