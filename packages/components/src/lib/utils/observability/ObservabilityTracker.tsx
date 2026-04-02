// ObservabilityTracker.tsx
import { useEffect } from "react";
import { useObservability } from "@genuin/components/hooks/use-observisibility";
import {
  removeObservabilityInterceptor,
  setupObservabilityInterceptor,
} from "@genuin/components/lib/utils/observability/axios-observability-interceptor";
import {
  EmbedEventContextType,
  EmbedEventNameType,
} from "@genuin/components/context/embed/event-bus";
import { EventManager } from "@genuin/components/lib/utils/event-manager";
import { useAxiosInstance } from "@genuin/components/context";

interface ObservabilityTrackerProps {
  embedEventBus: EventManager<EmbedEventContextType, EmbedEventNameType>;
  sdkInitTime?: number;
}

/**
 * ObservabilityTracker component wrapper that initializes observability tracking
 * This component is lazy loaded to reduce initial bundle size
 *
 * Responsibilities:
 * 1. Initialize axios interceptor for API performance tracking
 * 2. Setup resource tracking for images and videos
 * 3. Monitor performance metrics
 */
export function ObservabilityTracker({
  embedEventBus,
  sdkInitTime,
}: ObservabilityTrackerProps) {
  // Initialize observability hook for resource tracking
  useObservability({ embedEventBus, sdkInitTime });
  const axiosInstance = useAxiosInstance();

  // Initialize axios observability interceptor
  useEffect(() => {
    setupObservabilityInterceptor(axiosInstance).catch((error) => {
      console.warn(
        "Failed to initialize axios observability in tracker:",
        error,
      );
    });

    return () => {
      removeObservabilityInterceptor(axiosInstance);
    };
  }, []);

  // This component doesn't render anything
  return null;
}
