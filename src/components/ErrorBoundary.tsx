import React from 'react';
import { Sentry } from '../lib/sentry';

interface Props { children: React.ReactNode; fallback?: React.ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info);
    Sentry.captureException(error, { extra: { componentStack: info.componentStack } });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 p-8">
          <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
            Something went wrong. Please try again.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="text-sm px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
