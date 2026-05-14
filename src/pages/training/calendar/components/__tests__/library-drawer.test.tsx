import { fireEvent, render, screen } from '@/test/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LibraryDrawer } from '../library-drawer';

describe('LibraryDrawer', () => {
  const mockOnClose = vi.fn();
  const mockOnSelectTemplate = vi.fn();
  const mockOnAddTemplate = vi.fn();
  const mockOnCreateLibrary = vi.fn();
  const mockOnDeleteLibrary = vi.fn();

  const defaultProps = {
    open: true,
    onClose: mockOnClose,
    library: [],
    selectedDate: '2026-05-13',
    sportTypes: [{ id: '1', name: 'Run' }],
    userSettingsMap: new Map(),
    onSelectTemplate: mockOnSelectTemplate,
    onAddTemplate: mockOnAddTemplate,
    onCreateLibrary: mockOnCreateLibrary,
    onDeleteLibrary: mockOnDeleteLibrary,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the "Add new template" button', () => {
    render(<LibraryDrawer {...defaultProps} />);
    const addButton = screen.getByTitle(/Add new template/i);
    expect(addButton).toBeInTheDocument();
  });

  it('opens LibraryTemplateDialog when "Add new template" button is clicked', async () => {
    render(<LibraryDrawer {...defaultProps} />);

    // Dialog shouldn't be visible initially
    expect(screen.queryByText(/new template/i)).not.toBeInTheDocument();

    const addButton = screen.getByTitle(/Add new template/i);
    fireEvent.click(addButton);

    // After clicking, the dialog should render
    const dialogTitle = await screen.findByText(/new template/i);
    expect(dialogTitle).toBeInTheDocument();
  });
});
