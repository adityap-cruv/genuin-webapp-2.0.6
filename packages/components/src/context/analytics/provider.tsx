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
import { useSafeEmbedContext } from "../embed/context";

type AnalyticsProviderProps = {
  children: ReactNode;
  /**
   * Optional prop to indicate if the SDK is being used in a web context.
   * This can be useful for conditional logic based on the environment.
   */
  isWebSDK?: boolean;
  /**
   * Optional analytics data for SDK initialization
   */
  embedData?: {
    embed_id?: string;
    embed_type?: string;
    embed_style?: string;
    content_category?: string;
    phone_no?: string;
    sdk_version?: string;
    user_name?: string;
    gen_user_name?: string;
  };
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
  embedData,
}: AnalyticsProviderProps) {
  const { brandDetails } = useBaseContext();
  const embedDetails = useSafeEmbedContext();
  const { user } = useAuthContext();
  const pathname = usePathname();
  useEffect(() => {
    if (!embedDetails) AnalyticsService.track(EventName.PAGE_VIEW);
  }, [pathname, embedDetails]);

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

      const initPayload = {
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
      };

      // TODO Separate the objects based on embed

      // If isWebSDK is true, override with embedData values if available
      if (isWebSDK && embedData) {
        // Create SDK payload with only non-empty values
        const sdkPayload: Record<string, string | undefined> = {};

        if (embedData.embed_id) sdkPayload.embed_id = embedData.embed_id;
        if (embedData.embed_type) sdkPayload.embed_type = embedData.embed_type;
        if (embedData.embed_style)
          sdkPayload.embed_style = embedData.embed_style;
        // Set default value for content_category if not provided
        sdkPayload.content_category = embedData.content_category || "loop";
        if (embedData.phone_no) sdkPayload.phone_no = embedData.phone_no;
        if (embedData.sdk_version)
          sdkPayload.sdk_version = embedData.sdk_version;
        if (embedData.user_name) sdkPayload.user_name = embedData.user_name;
        if (embedData.gen_user_name)
          sdkPayload.gen_user_name = embedData.gen_user_name;

        // Add non-empty SDK values to the main payload
        Object.assign(initPayload, sdkPayload);
      }

      AnalyticsService.initialize(initPayload)
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
  }, [brandDetails, user, isWebSDK, embedData, pathname]);

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
