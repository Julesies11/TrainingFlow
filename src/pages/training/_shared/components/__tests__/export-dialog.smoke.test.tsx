import { render, screen } from '@/test/test-utils';
import { describe, expect, it } from 'vitest';
import { PlanTemplate, SportTypeRecord } from '@/types/training';
import { ExportDialog } from '../export-dialog';

describe('ExportDialog Smoke Test', () => {
  const mockSportTypes: Partial<SportTypeRecord>[] = [
    { id: 'run', name: 'Run' },
    { id: 'bike', name: 'Bike' },
  ];

  it('renders correctly for calendar mode', () => {
    render(
      <ExportDialog
        open={true}
        onOpenChange={() => {}}
        sportTypes={mockSportTypes as SportTypeRecord[]}
      />,
    );

    expect(screen.getByText(/export workouts/i)).toBeInTheDocument();
    expect(screen.getByText(/from date/i)).toBeInTheDocument();
    expect(screen.getByText(/to date/i)).toBeInTheDocument();
    expect(screen.getByText(/run/i)).toBeInTheDocument();
    expect(screen.getByText(/bike/i)).toBeInTheDocument();
  });

  it('renders correctly for template mode', () => {
    const mockTemplate: Partial<PlanTemplate> = {
      name: 'Test Plan',
      workouts: [],
    };
    render(
      <ExportDialog
        open={true}
        onOpenChange={() => {}}
        sportTypes={mockSportTypes as SportTypeRecord[]}
        template={mockTemplate as PlanTemplate}
      />,
    );

    expect(
      screen.getByRole('heading', { name: /export workouts/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/export workouts from "test plan"/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/from date/i)).not.toBeInTheDocument();
  });
});
