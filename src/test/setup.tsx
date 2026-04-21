import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver as a class
window.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock ApexCharts
vi.mock('react-apexcharts', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-apexchart" />,
}));

// Mock FullCalendar (it can be heavy and cause issues in jsdom)
vi.mock('@fullcalendar/react', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-fullcalendar" />,
}));

// Runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});
