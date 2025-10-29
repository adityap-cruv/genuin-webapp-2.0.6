"use client";

import {
  useEffect, // Keep useEffect for the initial service initialization call
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
import { EmbedDataType } from "@genuin/components/context/embed/embed.types";
import { useSafeEmbedContext } from "../embed/context";
import { sendAnalyticsToBackend } from "@genuin/components/react-query/api/analytics";

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
  embedData?: EmbedDataType;
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
  const { brandDetails, isInIframe } = useBaseContext();
  const { user } = useAuthContext();
  const embedDetails = useSafeEmbedContext();
  const pathname = usePathname();
  useEffect(() => {
    if (!isWebSDK) AnalyticsService.track(EventName.PAGE_VIEW);
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
      const deviceId = getDeviceId(isInIframe);
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

      // If isWebSDK is true, override with embedData values if available
      if (isWebSDK && (embedData?.embed_id || embedData?.placement_id)) {
        // Create SDK payload with only non-empty values
        const sdkPayload: Record<string, string | undefined> = {};
        // Payload of embed specific values
        if (embedData.embed_id) {
          sdkPayload.embed_id = embedData.embed_id;
          if (embedData.type) sdkPayload.embed_type = embedData.style;
          if (embedData.style) sdkPayload.embed_style = embedData.style;
        }

        // Payload of placement specific values
        if (embedData.placement_id) {
          sdkPayload.placement_id = embedData.placement_id;
          if (embedData.style_id) sdkPayload.style_id = embedData.style_id;
          if (embedData.feed_type) sdkPayload.feed_style = embedData.feed_type;
          if (embedData.style) sdkPayload.placement_layout = embedData.style;
          if (embedData.type)
            sdkPayload.feed_style = embedData.type.split("_")[0];

          // TODO : from where it should pass?
          /*
 user_city,
user_region,
user_country,
user_location,
user_postal,
user_timezone,
user_latitude,
user_longitude
 */
        }

        // Common payload for embed and placement
        sdkPayload.content_category = "loop";

        // TODO : need to change sdk version
        sdkPayload.sdk_version = "2.0.0";
        if (user) {
          if (user.phoneNumber) sdkPayload.phone_no = user.phoneNumber;
          if (user.nickname) {
            sdkPayload.user_name = user.nickname;
            sdkPayload.gen_user_name = user.nickname;
          }
        }

        // Add non-empty SDK values to the main payload
        Object.assign(initPayload, sdkPayload);
      }
      AnalyticsService.initialize(
        initPayload,
        brandDetails,
        embedDetails?.embedData
      )
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
      if (
        eventName === EventName.VIDEO_COMPLETED &&
        embedDetails?.brandLayoutType === "iheart" &&
        user
      ) {
        sendAnalyticsToBackend({
          eventName: EventName.VIDEO_MARK_COMPLETE,
          payload: {
            content_id: payload?.content_id,
            video_length: payload?.video_length,
            video_view_length: payload?.video_view_length,
            environment: brandDetails.environment,
            brand_id: brandDetails.brand_id,
            user_id: user?.id ?? getDeviceId(isInIframe),
            placement_id: embedDetails.embedData.placement_id,
          },
        });
      }
    },
    [embedDetails?.brandLayoutType, user, isInIframe]
  );

  return (
    <AnalyticsContext.Provider value={{ track, EventName }}>
      {children}
    </AnalyticsContext.Provider>
  );
}
