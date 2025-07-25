"use client";

import {
  useEffect, // Keep useEffect for the initial service initialization call
  // useState, // No longer needed for isInitialized
  useCallback,
  ReactNode,
} from "react";
import { AnalyticsService } from "./service"; // Import the singleton service
import { AnalyticsContext, EventName } from "./context";
import { EventNameType, EventPayload } from "./types";
import { useBaseContext } from "../base";
import { useAuthContext } from "../auth";
import { getDeviceId } from "@genuin/components/lib/utils/device-id";
import { GENUIN_BRAND_ID } from "@genuin/components/lib/constants";
import { usePathname } from "@genuin/components/hooks/use-pathname";

type AnalyticsProviderProps = {
  children: ReactNode;
  /**
   * Optional prop to indicate if the SDK is being used in a web context.
   * This can be useful for conditional logic based on the environment.
   */
  isWebSDK?: boolean;
};

enum Channel {
  WEB_APP = "genuin web",
  WEB_SDK = "web sdk",
  WHITE_LABEL = "white label",
}

/**
 * Provider component for the AnalyticsContext.
 * It initializes the AnalyticsService (if not already done)
 * and provides the `track` function from the service.
 */
export function AnalyticsProvider({
  children,
  isWebSDK,
}: AnalyticsProviderProps) {
  const { brandDetails } = useBaseContext();
  const { user } = useAuthContext();
  const pathname = usePathname();
  useEffect(() => {
    AnalyticsService.track(EventName.PAGE_VIEW);
  }, [pathname]);

  // Updated polyfill for requestIdleCallback
  const requestIdleCallbackPolyfill =
    typeof requestIdleCallback !== "undefined"
      ? requestIdleCallback
      : (callback: IdleRequestCallback): number => {
          const start = Date.now();
          return window.setTimeout(() => {
            callback({
              didTimeout: false,
              timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
            });
          }, 1);
        };

  const cancelIdleCallbackPolyfill =
    typeof cancelIdleCallback !== "undefined"
      ? cancelIdleCallback
      : (id: number) => window.clearTimeout(id);

  useEffect(() => {
    const idleCallbackHandle = requestIdleCallbackPolyfill(() => {
      const deviceId = getDeviceId();
      const userIdToPass = user?.id ?? deviceId;
      const channel = isWebSDK
        ? Channel.WEB_SDK
        : brandDetails.brand_id !== GENUIN_BRAND_ID
          ? Channel.WHITE_LABEL
          : Channel.WEB_APP;

      // Initialize the service. It handles its own low-priority loading and idempotency.
      // We call initialize here but don't need to track its state within the provider anymore.
      AnalyticsService.initialize({
        brand_id: brandDetails.brand_id,
        channel,
        environment: brandDetails.environment,
        gen_user_id: userIdToPass,
        user_id: userIdToPass,
        url: typeof window !== "undefined" ? window.location.href : undefined,
        path: pathname,
        query_params: Object.fromEntries(
          new URLSearchParams(window.location.search)
        ),
        title: document.title,
      })
        .then(() => {
          // console.log(
          //   "[AnalyticsProvider] AnalyticsService.initialize() called and promise resolved."
          // );
        })
        .catch((error) => {
          console.error(
            "[AnalyticsProvider] AnalyticsService.initialize() failed:",
            error
          );
        });
    });

    return () => {
      cancelIdleCallbackPolyfill(idleCallbackHandle);
    };
  }, [brandDetails, user, isWebSDK]); // Re-run if config changes, AnalyticsService.initialize is idempotent

  const track = useCallback(
    async (eventName: EventNameType, payload?: EventPayload) => {
      await AnalyticsService.track(eventName, payload);
    },
    []
  );

  return (
    <AnalyticsContext.Provider value={{ track, EventName }}>
      {children}
    </AnalyticsContext.Provider>
  );
}
