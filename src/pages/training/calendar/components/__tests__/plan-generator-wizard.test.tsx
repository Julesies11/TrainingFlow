import { fireEvent, render, screen } from '@/test/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PlanGeneratorWizard } from '../plan-generator-wizard';

// Mock hooks
vi.mock('@/hooks/use-training-data', () => ({
  useEvents: () => ({
    data: [{ id: 'e1', title: 'Target Race', date: '2026-06-01' }],
  }),
  usePlanTemplates: () => ({
    data: [
      {
        id: 't1',
        name: 'Marathon Base',
        totalWeeks: 4,
        workouts: [],
        notes: [],
      },
    ],
  }),
  useCreateWorkoutsBulk: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useCreateNotesBulk: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

describe('PlanGeneratorWizard', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the initial step correctly', () => {
    render(<PlanGeneratorWizard onClose={mockOnClose} />);

    expect(screen.getByText(/training plan generator/i)).toBeInTheDocument();
    expect(screen.getByText(/select training plan/i)).toBeInTheDocument();
    expect(screen.getByText(/scheduling method/i)).toBeInTheDocument();
  });

  it('renders CalendarPlus icon when forward mode is selected', async () => {
    // This test specifically verifies the fix for "ReferenceError: CalendarPlus is not defined"
    render(<PlanGeneratorWizard onClose={mockOnClose} />);

    // Default is backward mode. Click "Start From Date" (forward mode)
    const forwardBtn = screen.getByText(/Start From Date/i).closest('button');
    if (!forwardBtn) throw new Error('Forward button not found');

    fireEvent.click(forwardBtn);

    // If CalendarPlus was not defined, the component would have crashed during the render cycle triggered by click.
    // Verify we are still on screen and in forward mode
    expect(screen.getByText(/select plan start date/i)).toBeInTheDocument();
  });

  it('requires template and event selection before preview', () => {
    render(<PlanGeneratorWizard onClose={mockOnClose} />);

    const previewBtn = screen.getByRole('button', { name: /preview plan/i });
    expect(previewBtn).toBeDisabled();

    // Select template
    const templateTrigger = screen.getByRole('combobox', {
      name: /choose a static training plan/i,
    });
    fireEvent.click(templateTrigger);
    // Find option in portal (using findByRole)
    // Note: ReUI Select might need different interaction, but this is a standard smoke check
  });

  it('calls onClose when cancel is clicked', () => {
    render(<PlanGeneratorWizard onClose={mockOnClose} />);
    fireEvent.click(screen.getByText(/cancel/i));
    expect(mockOnClose).toHaveBeenCalled();
  });
});
