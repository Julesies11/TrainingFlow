/* eslint-disable @typescript-eslint/no-explicit-any */
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SportSelector } from '../sport-selector';

describe('SportSelector', () => {
  const mockSports = [
    { id: '1', name: 'Run' },
    { id: '2', name: 'Bike' },
  ];

  it('renders all sport types as buttons', () => {
    render(
      <SportSelector
        sportTypes={mockSports as any}
        selectedSportId="1"
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getByText('Run')).toBeInTheDocument();
    expect(screen.getByText('Bike')).toBeInTheDocument();
  });

  it('calls onSelect when a button is clicked', () => {
    const onSelect = vi.fn();
    render(
      <SportSelector
        sportTypes={mockSports as any}
        selectedSportId="1"
        onSelect={onSelect}
      />,
    );
    fireEvent.click(screen.getByText('Bike'));
    expect(onSelect).toHaveBeenCalledWith('2');
  });

  it('renders the optional note button', () => {
    const onNote = vi.fn();
    render(
      <SportSelector
        sportTypes={mockSports as any}
        selectedSportId="1"
        onSelect={vi.fn()}
        onSwitchToNote={onNote}
      />,
    );
    const noteBtn = screen.getByText('note');
    expect(noteBtn).toBeInTheDocument();
    fireEvent.click(noteBtn);
    expect(onNote).toHaveBeenCalled();
  });
});
