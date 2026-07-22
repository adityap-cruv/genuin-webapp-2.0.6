"use client";

import { Button } from "@genuin/ui/button";
import type { ErrorInfo, ReactNode } from "react";
import { Component } from "react";

/**
 * A render-prop child. Receives the current `attempt` counter so the consumer
 * can recreate any lazily-imported component on retry (e.g. via
 * `useMemo(() => lazy(factory), [attempt])`). Bumping the component identity is
 * the only reliable way to force React.lazy to re-run a failed dynamic import —
 * the rejected import promise is otherwise memoised and a plain remount reuses it.
 */
type AppErrorBoundaryChildren = ReactNode | ((attempt: number) => ReactNode);

interface AppErrorBoundaryProps {
  children: AppErrorBoundaryChildren;
  /**
   * Custom fallback. Receives a `retry` callback that resets the boundary and
   * bumps the attempt counter. When omitted, a styled default card is shown.
   */
  fallback?: (retry: () => void, error: Error) => ReactNode;
  /** Callback fired when an error is caught — wire to a logger/observability sink. */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface AppErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  attempt: number;
}

/**
 * Generic application error boundary.
 *
 * Catches any error thrown while rendering its subtree — a failed dynamic
 * `import()` (surfaced from React.lazy/Suspense), a render-time exception, or a
 * thrown effect-setup error — and contains it to that subtree. Without a boundary
 * the error unwinds to the React root and blanks the whole UI; here, siblings and
 * the rest of the host page keep working, and a graceful, retryable fallback is
 * rendered in place of the failed subtree.
 *
 * The optional `attempt` render-prop exists chiefly so consumers can re-attempt a
 * failed dynamic import on retry (React.lazy memoises the rejected promise, so the
 * lazy component must be recreated to re-fetch).
 *
 * @example
 * ```tsx
 * <AppErrorBoundary>
 *   {(attempt) => {
 *     const Lazy = useMemo(() => lazy(() => import("./thing")), [attempt]);
 *     return <Suspense fallback={<Skeleton />}><Lazy /></Suspense>;
 *   }}
 * </AppErrorBoundary>
 * ```
 */
export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  constructor(props: AppErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, attempt: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<AppErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Surface the failure without crashing the host. Replace with a structured
    // logger/observability sink when one is wired into the SDK.
    console.error("Render failed (contained by AppErrorBoundary):", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  retry = (): void => {
    // Clearing the error AND bumping `attempt` lets the consumer recreate its
    // lazy component so the dynamic import is genuinely re-attempted.
    this.setState((prev) => ({ hasError: false, error: null, attempt: prev.attempt + 1 }));
  };

  render(): ReactNode {
    const { children, fallback } = this.props;
    const { hasError, error, attempt } = this.state;

    if (hasError && error) {
      if (fallback) {
        return fallback(this.retry, error);
      }

      return (
        <div className="gencl:flex gencl:min-h-[200px] gencl:h-full gencl:w-full gencl:flex-col gencl:items-center gencl:justify-center gencl:rounded-md gencl:border gencl:border-secondary-200 gencl:bg-secondary-50 gencl:p-6 gencl:text-center">
          <h2 className="gencl:mb-2 gencl:text-lg gencl:font-semibold gencl:text-secondary-800">
            Unable to load content
          </h2>
          <p className="gencl:mb-4 gencl:text-sm gencl:text-secondary-600">
            Something went wrong while loading this section. Please try again.
          </p>
          <Button theme="outline" size="sm" onClick={this.retry}>
            Try again
          </Button>
        </div>
      );
    }

    return typeof children === "function" ? children(attempt) : children;
  }
}
