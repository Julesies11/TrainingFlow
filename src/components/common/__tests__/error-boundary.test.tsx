import { render, screen } from '@/test/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { errorLogsApi } from '@/services/api/system/error-logs.api';
import { ErrorBoundary } from '../error-boundary';

// Mock errorLogsApi
vi.mock('@/services/api/system/error-logs.api', () => ({
  errorLogsApi: {
    capture: vi.fn(),
  },
}));

// A component that throws an error
const ThrowError = ({ message }: { message: string }) => {
  throw new Error(message);
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Silence console.error for expected errors during test
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div data-testid="child">No error</div>
      </ErrorBoundary>,
    );
    expect(screen.getByTestId('child')).toBeDefined();
    expect(screen.queryByText(/oops/i)).toBeNull();
  });

  it('renders fallback and logs error when a child throws', () => {
    render(
      <ErrorBoundary>
        <ThrowError message="Render failure" />
      </ErrorBoundary>,
    );

    expect(screen.getByText(/500 error/i)).toBeDefined();
    expect(screen.getByText(/internal server error/i)).toBeDefined();

    expect(errorLogsApi.capture).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Render failure',
        component_name: 'ErrorBoundary',
      }),
    );
  });
});
