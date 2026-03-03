import React from 'react';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from '../shared/ErrorBoundary';

// Mock console.error to avoid cluttering test output
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

// Test component that throws an error
const ThrowError: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow = true }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>Child component content</div>;
};

// Test component that throws error in useEffect
const AsyncErrorComponent: React.FC = () => {
  React.useEffect(() => {
    throw new Error('Async error');
  }, []);
  return <div>Async component</div>;
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should_render_children_when_no_error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
        <button>Test button</button>
      </ErrorBoundary>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
    expect(screen.getByText('Test button')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong. Please refresh.')).not.toBeInTheDocument();
  });

  test('should_render_error_message_when_has_error', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong. Please refresh.')).toBeInTheDocument();
    expect(screen.queryByText('Child component content')).not.toBeInTheDocument();
  });

  test('should_log_error_details_to_console', () => {
    const testError = new Error('Test error message');
    const errorInfo = { componentStack: 'Test stack trace' };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(console.error).toHaveBeenCalledWith(
      'Unhandled Error:',
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String)
      })
    );
  });

  test('should_update_state_when_error_occurs', () => {
    const error = new Error('Test error');
    const state = ErrorBoundary.getDerivedStateFromError();
    
    expect(state).toEqual({ hasError: true });
  });

  test('should_catch_error_from_child_component', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Child component content')).toBeInTheDocument();

    // Rerender with error
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong. Please refresh.')).toBeInTheDocument();
  });

  test('should_remain_in_error_state_for_subsequent_errors', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong. Please refresh.')).toBeInTheDocument();

    // Try to render another error-throwing component
    rerender(
      <ErrorBoundary>
        <div>
          <ThrowError />
          <div>This should not render</div>
        </div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong. Please refresh.')).toBeInTheDocument();
    expect(screen.queryByText('This should not render')).not.toBeInTheDocument();
  });

  test('should_reset_error_state_on_remount', () => {
    const { unmount } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong. Please refresh.')).toBeInTheDocument();

    // Unmount the error boundary
    unmount();

    // Remount with working component
    render(
      <ErrorBoundary>
        <div>Fresh content after remount</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Fresh content after remount')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong. Please refresh.')).not.toBeInTheDocument();
  });

  test('should_handle_multiple_children_with_one_erroring', () => {
    render(
      <ErrorBoundary>
        <div>First child</div>
        <ThrowError />
        <div>Third child</div>
      </ErrorBoundary>
    );

    // Error boundary should catch the error and show fallback UI
    expect(screen.getByText('Something went wrong. Please refresh.')).toBeInTheDocument();
    
    // None of the children should render
    expect(screen.queryByText('First child')).not.toBeInTheDocument();
    expect(screen.queryByText('Third child')).not.toBeInTheDocument();
  });

  test('should_display_error_ui_with_proper_heading_tag', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    const errorHeading = screen.getByRole('heading', { level: 2 });
    expect(errorHeading).toHaveTextContent('Something went wrong. Please refresh.');
  });
});