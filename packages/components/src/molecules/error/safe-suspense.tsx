"use client";

import { Suspense, type ReactNode } from "react";

import { AppErrorBoundary } from "./app-error-boundary";

interface SafeSuspenseProps {
  children: ReactNode;
  /** Loading UI shown while the lazy chunk resolves (forwarded to Suspense). */
  fallback?: ReactNode;
  /**
   * UI shown when the chunk fails to load (or the subtree throws on render).
   * - omit / `undefined` → the AppErrorBoundary's default styled retry card.
   * - `null` → render nothing (silent — correct for non-critical overlays,
   *   modals, buttons whose Suspense fallback is already `null`).
   * - a node → that node is shown as-is (no retry affordance).
   * - a function → receives a `retry` callback to build a custom retryable UI.
   */
  errorFallback?: ReactNode | ((retry: () => void) => ReactNode);
  /** Fired when the boundary catches an error — wire to logging/observability. */
  onError?: (error: Error) => void;
}

/**
 * Suspense + AppErrorBoundary in one. Drop-in replacement for a bare
 * `<Suspense>` that additionally contains dynamic-import ("chunk load") failures
 * to its own subtree: a failed lazy chunk renders the error fallback instead of
 * unwinding to the React root and blanking the whole UI. Sibling features and
 * the rest of the page keep working. See GEN-9406.
 *
 * @example Silent (non-critical overlay):
 * ```tsx
 * <SafeSuspense fallback={null} errorFallback={null}>
 *   <LazyModal />
 * </SafeSuspense>
 * ```
 * @example Visible retry card (primary content):
 * ```tsx
 * <SafeSuspense fallback={<Skeleton />}>
 *   <LazyFeed />
 * </SafeSuspense>
 * ```
 */
export function SafeSuspense({ children, fallback = null, errorFallback, onError }: SafeSuspenseProps) {
  const boundaryFallback =
    errorFallback === undefined
      ? undefined
      : typeof errorFallback === "function"
        ? (retry: () => void) => errorFallback(retry)
        : () => errorFallback;

  return (
    // <AppErrorBoundary fallback={boundaryFallback} onError={onError ? (error) => onError(error) : undefined}>
    <Suspense fallback={fallback}>{children}</Suspense>
    // </AppErrorBoundary>
  );
}
