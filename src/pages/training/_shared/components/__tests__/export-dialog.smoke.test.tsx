import { render, screen } from '@/test/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { ExportDialog } from '../export-dialog';

describe('ExportDialog Smoke Test', () => {
  const mockSportTypes = [
    { id: 'run', name: 'Run' },
    { id: 'bike', name: 'Bike' },
  ];

  it('renders correctly for calendar mode', () => {
    render(
      <ExportDialog
        open={true}
        onOpenChange={() => {}}
        sportTypes={mockSportTypes as any}
      />
    );

    expect(screen.getByText(/export workouts/i)).toBeInTheDocument();
    expect(screen.getByText(/from date/i)).toBeInTheDocument();
    expect(screen.getByText(/to date/i)).toBeInTheDocument();
    expect(screen.getByText(/run/i)).toBeInTheDocument();
    expect(screen.getByText(/bike/i)).toBeInTheDocument();
  });

  it('renders correctly for template mode', () => {
    const mockTemplate = { name: 'Test Plan', workouts: [] };
    render(
      <ExportDialog
        open={true}
        onOpenChange={() => {}}
        sportTypes={mockSportTypes as any}
        template={mockTemplate}
      />
    );

    expect(screen.getByRole('heading', { name: /export workouts/i })).toBeInTheDocument();
    expect(screen.getByText(/export workouts from "test plan"/i)).toBeInTheDocument();
    expect(screen.queryByText(/from date/i)).not.toBeInTheDocument();
  });
});
