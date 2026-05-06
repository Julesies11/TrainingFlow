import { Component, ErrorInfo, ReactNode } from 'react';
import { Error500 } from '@/errors/error-500';
import { errorLogsApi } from '@/services/api/system/error-logs.api';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Global Error Boundary to catch rendering errors and log them to the database.
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);

    // Log the error to Supabase
    errorLogsApi.capture({
      message: error.message,
      stack: error.stack,
      component_name: 'ErrorBoundary',
      context: {
        componentStack: errorInfo.componentStack,
      },
    });
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background text-center">
          <Error500 />

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <div className="mt-12 w-full max-w-4xl p-4 bg-muted rounded-lg text-left overflow-auto max-h-[400px]">
              <p className="font-mono text-xs text-destructive">
                {this.state.error.toString()}
              </p>
              <pre className="mt-2 font-mono text-[10px] text-muted-foreground">
                {this.state.error.stack}
              </pre>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
