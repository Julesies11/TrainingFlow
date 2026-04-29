import { fireEvent, render, screen } from '@/test/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { NoteDialog } from '../note-dialog';

describe('NoteDialog', () => {
  const mockNote = {
    id: 'note-1',
    content: 'Existing note content',
    date: '2026-04-29',
  };

  const defaultProps = {
    note: {},
    onSave: vi.fn(),
    onCancel: vi.fn(),
  };

  it('renders "new note" title when creating', () => {
    render(<NoteDialog {...defaultProps} />);
    expect(screen.getByText(/new note/i)).toBeDefined();
  });

  it('renders "edit note" title when editing', () => {
    render(<NoteDialog {...defaultProps} note={mockNote} />);
    expect(screen.getByText(/edit note/i)).toBeDefined();
    expect(screen.getByDisplayValue('Existing note content')).toBeDefined();
  });

  it('calls onSave with content when save is clicked', () => {
    const onSave = vi.fn();
    render(<NoteDialog {...defaultProps} onSave={onSave} />);

    const textarea = screen.getByPlaceholderText(/write your note here/i);
    fireEvent.change(textarea, { target: { value: 'My new note' } });

    const saveButton = screen.getByText(/save note/i);
    fireEvent.click(saveButton);

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        content: 'My new note',
      }),
    );
  });

  it('calls onDelete when delete is clicked', () => {
    const onDelete = vi.fn();
    render(
      <NoteDialog {...defaultProps} note={mockNote} onDelete={onDelete} />,
    );

    const deleteButton = screen.getByText(/delete/i);
    fireEvent.click(deleteButton);

    expect(onDelete).toHaveBeenCalledWith('note-1');
  });

  it('calls onCancel when cancel is clicked', () => {
    const onCancel = vi.fn();
    render(<NoteDialog {...defaultProps} onCancel={onCancel} />);

    const cancelButton = screen.getByText(/cancel/i);
    fireEvent.click(cancelButton);

    expect(onCancel).toHaveBeenCalled();
  });
});
