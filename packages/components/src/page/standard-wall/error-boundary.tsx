"use client";

import React, {
  Component,
  ErrorInfo,
  PropsWithChildren,
  ReactNode,
} from "react";
import { Button } from "@genuin/ui/button";
import { RefreshCcw } from "lucide-react";

interface ErrorBoundaryProps extends PropsWithChildren {
  /**
   * Custom fallback component to show when an error occurs
   */
  fallback?: ReactNode;
  /**
   * Callback that will be called when an error is caught
   */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /**
   * Whether to reset the error boundary when the location changes
   * @default false
   */
  resetOnRouteChange?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component that catches JavaScript errors in its child component tree,
 * displays a fallback UI, and logs the error information.
 *
 * @example
 * ```tsx
 * <ErrorBoundary
 *   fallback={<p>Something went wrong</p>}
 *   onError={(error) => console.error(error)}
 * >
 *   <ComponentThatMightError />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to an error reporting service
    console.error("Error caught by ErrorBoundary:", error, errorInfo);

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetErrorBoundary = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // If a custom fallback is provided, render it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Otherwise render the default fallback UI
      return (
        <div className="gencl:flex gencl:min-h-[200px] gencl:w-full gencl:flex-col gencl:items-center gencl:justify-center gencl:rounded-md gencl:border gencl:border-red-200 gencl:bg-red-50 gencl:p-6 gencl:text-center">
          <h2 className="gencl:mb-2 gencl:text-lg gencl:font-semibold gencl:text-red-800">
            Something went wrong
          </h2>
          <p className="gencl:mb-4 gencl:text-sm gencl:text-red-600">
            An error occurred while rendering this component
          </p>
          <Button
            theme="outline"
            size="sm"
            onClick={this.resetErrorBoundary}
            className="gencl:flex gencl:items-center gencl:gap-2"
          >
            <RefreshCcw className="gencl:h-4 gencl:w-4" /> Try again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * A hook to create a wrapper component that catches errors in the rendering phase
 * and displays a fallback UI when an error occurs.
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps: Omit<ErrorBoundaryProps, "children"> = {}
): React.FC<P> {
  const WithErrorBoundary = (props: P) => {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };

  // Set display name for debugging
  const displayName = Component.displayName || Component.name || "Component";
  WithErrorBoundary.displayName = `withErrorBoundary(${displayName})`;

  return WithErrorBoundary;
}

export default ErrorBoundary;
