/**
 * Analytics React Hooks
 */

import { useContext, useEffect, useMemo } from "react";
import { AnalyticsContext } from "./analytics-context";
import type { AnalyticsContextValue } from "./analytics-context";

/**
 * Hook to access analytics context
 * @throws Error if used outside AnalyticsProvider
 */
export function useAnalytics(): AnalyticsContextValue {
  const context = useContext(AnalyticsContext);

  if (!context) {
    throw new Error("useAnalytics must be used within AnalyticsProvider");
  }

  return context;
}

/**
 * Hook to get track function
 */
export function useTrack() {
  const { track } = useAnalytics();
  return track;
}

/**
 * Hook to get identify function
 */
export function useIdentify() {
  const { identify } = useAnalytics();
  return identify;
}

/**
 * Hook to get page function
 */
export function usePage() {
  const { page } = useAnalytics();
  return page;
}

/**
 * Hook to get group function
 */
export function useGroup() {
  const { group } = useAnalytics();
  return group;
}

/**
 * Hook to automatically track page views
 * @param pageName - Optional page name (defaults to document.title)
 * @param properties - Optional page properties
 * @param options - Tracking options
 */
export function usePageTracking(
  pageName?: string,
  properties?: Record<string, any>,
  options: {
    /**
     * Whether to track on mount
     * @default true
     */
    trackOnMount?: boolean;
    /**
     * Whether to track on pageName change
     * @default true
     */
    trackOnChange?: boolean;
  } = {}
) {
  const { page, isReady } = useAnalytics();
  const { trackOnMount = true, trackOnChange = true } = options;

  useEffect(() => {
    if (!isReady) return;

    const name = pageName || (typeof document !== "undefined" ? document.title : "");
    const props = properties || {
      path: typeof window !== "undefined" ? window.location.pathname : "",
      url: typeof window !== "undefined" ? window.location.href : "",
    };

    if (trackOnMount || trackOnChange) {
      page(name, props).catch((error) => {
        console.error("[usePageTracking] Failed to track page:", error);
      });
    }
  }, [pageName, page, isReady, trackOnMount, trackOnChange, properties]);
}

/**
 * Hook to get event names with type safety
 * Useful for creating type-safe event constants
 */
export function useEventNames<T extends Record<string, string>>(eventNames: T): T {
  return useMemo(() => eventNames, [eventNames]);
}

/**
 * Hook to check if analytics is ready
 */
export function useAnalyticsReady(): boolean {
  const { isReady } = useAnalytics();
  return isReady;
}

/**
 * Hook to get analytics client instance
 */
export function useAnalyticsClient() {
  const { client } = useAnalytics();
  return client;
}
