"use client";

import type { ReactNode } from "react";
import {
  useEffect, // Keep useEffect for the initial service initialization call
  useCallback,
  useMemo,
  useState,
} from "react";

import { useAxiosInstance } from "@genuin/components/context/axios";
import type { EmbedDataType } from "@genuin/components/context/embed/embed.types";
import { usePathname } from "@genuin/components/hooks/use-pathname";
import { GENUIN_BRAND_ID } from "@genuin/components/lib/constants";
import { SDKEventEmitter, SDKEventName } from "@genuin/components/lib/sdk-event-emitter";
import { getDeviceId } from "@genuin/components/lib/utils/device-id";
import { sendAnalyticsToBackend } from "@genuin/components/react-query/api/analytics";
import { useIpInfo } from "@genuin/components/react-query/api/authentication/ip-info";
import type { AuthUser } from "@genuin/components/types/auth";
import type { BrandDetailsConfigType } from "@genuin/components/types/brand";

import { useBaseContext } from "../base";
import { useSafeEmbedContext } from "../embed/context";

import { buildLayoutIdentity } from "./build-layout-identity";
import type { ScreenType } from "./context";
import { AnalyticsContext, EventName } from "./context";
import { EmitAnalyticsData } from "./emit-analytics-data";
import type { DefaultAnalyticsPayload } from "./service";
import { AnalyticsService } from "./service"; // Import the singleton service
import type { EventNameType, EventPayload } from "./types";
import { getSdkVersion } from "./utils";

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
  brandDetails: BrandDetailsConfigType;
  user: AuthUser | null;
  currentScreen?: ScreenType; // Optional initial screen value, defaults to "view_embed".
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
  brandDetails,
  user,
  currentScreen = "view_embed",
}: AnalyticsProviderProps) {
  const { isInIframe } = useBaseContext();
  const embedDetails = useSafeEmbedContext();
  const { data: ipInfo } = useIpInfo();
  const axiosInstance = useAxiosInstance();
  const pathname = usePathname();

  // Holds the current active screen. Defaults to "view_embed".
  const [screen, setScreen] = useState<ScreenType>(currentScreen);

  // Updates the current screen in state.
  const updateScreen = useCallback((newScreen: ScreenType): void => {
    setScreen(newScreen);
  }, []);

  // Returns the current screen value.
  const getScreen = useCallback((): ScreenType => {
    return screen;
  }, [screen]);

  useEffect(() => {
    if (!isWebSDK) AnalyticsService.track(EventName.PAGE_VIEW);
  }, [pathname]);

  // Polyfill for requestIdleCallback — falls back to 1ms setTimeout on Safari/older browsers
  // that lack native idle scheduling, simulating a 50ms budget window.
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
    typeof cancelIdleCallback !== "undefined" ? cancelIdleCallback : (id: number) => window.clearTimeout(id);

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
        app_source: "Web",
        device_id: deviceId,
        url: typeof window !== "undefined" ? window.location.href : undefined,
        path: pathname,
        query_params: Object.fromEntries(new URLSearchParams(window.location.search)),
        title: document.title,
        // sponsorship_id is per-layout — it now flows through buildLayoutIdentity at every
      };

      // SDK embeds carry shared page-level context not present in webapp.
      // Layout-specific identity (embed_id, placement_id, embed_style, style_id, etc.)
      // is intentionally NOT stored in the singleton's defaultPayload — it lives in
      // `layoutIdentity` below and gets injected per-event by the wrapped `track` callback.
      // This prevents the multi-layout race where the first-mounted layout's identity
      // would leak into the second layout's events. See AnalyticsService.initialize().
      if (isWebSDK && (embedData?.embed_id || embedData?.placement_id)) {
        // Shared, layout-independent payload only.
        const sdkPayload: Record<string, string | undefined> = {};
        sdkPayload.content_category = "loop";
        sdkPayload.sdk_version = getSdkVersion();
        if (user) {
          if (user.phoneNumber) sdkPayload.phone_no = user.phoneNumber;
          if (user.nickname) {
            sdkPayload.user_name = user.nickname;
            sdkPayload.gen_user_name = user.nickname;
          }
        }

        if (ipInfo) {
          sdkPayload.user_city = ipInfo.city;
          sdkPayload.user_region = ipInfo.region;
          sdkPayload.user_country = ipInfo.country;
          sdkPayload.user_location = ipInfo.location;
          sdkPayload.user_postal = ipInfo.postal;
          sdkPayload.user_timezone = ipInfo.timezone;
        }

        // Add non-empty SDK values to the main payload
        Object.assign(initPayload, sdkPayload);
      }
      AnalyticsService.initialize(initPayload, brandDetails, embedDetails?.embedData)
        .then(() => {
          // console.log(
          //   "[AnalyticsProvider] AnalyticsService.initialize() called and promise resolved."
          // );
        })
        .catch((error) => {
          console.error("[AnalyticsProvider] AnalyticsService.initialize() failed:", error);
        });
    });

    return () => {
      cancelIdleCallbackPolyfill(idleCallbackHandle);
    };
  }, [brandDetails, user, isWebSDK, embedData, pathname]);

  useEffect(() => {
    if (!ipInfo) return;

    // Transform IP info into the analytics payload format
    // and merge it into the existing analytics context.
    const ipPayload: Partial<DefaultAnalyticsPayload> = {
      user_city: ipInfo.city,
      user_region: ipInfo.region,
      user_country: ipInfo.country,
      user_location: ipInfo.location,
      user_postal: ipInfo.postal,
      user_timezone: ipInfo.timezone,
    };

    AnalyticsService.updatePayload(ipPayload);
  }, [ipInfo]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const flushAnalytics = () => {
      AnalyticsService.flush();
    };

    const handleBeforeUnload = () => {
      flushAnalytics();
    };

    const handlePageHide = () => {
      flushAnalytics();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      flushAnalytics();
    };
  }, []);

  const emitAnalyticsEvent = useCallback((eventName: EventNameType, customPayload?: EventPayload) => {
    if (!EmitAnalyticsData[eventName] || !EmitAnalyticsData[eventName].canFire) return;
    const basePayload = AnalyticsService.getDefaultPayload();

    const combinedPayload: EventPayload = {
      ...(basePayload || {}),
      ...(customPayload || {}),
    };

    // Some events expose only a subset of fields to SDK consumers; filter to allowed keys when defined.
    const allowedKeys: (keyof EventPayload)[] | undefined = EmitAnalyticsData[eventName].allowed_keys;

    const filteredPayload =
      allowedKeys && allowedKeys.length > 0
        ? allowedKeys.reduce((result, payloadKey) => {
            result[payloadKey] = combinedPayload[payloadKey];
            return result;
          }, {} as EventPayload)
        : combinedPayload;

    SDKEventEmitter.emit(SDKEventName.ANALYTICS, {
      eventName: `analytics:${eventName}`,
      eventPayload: filteredPayload,
    });
  }, []);

  // iHeart placements require a separate backend call on video completion for content reporting.
  const sendVideoCompletedToBackend = useCallback(
    (payload?: EventPayload) => {
      if (embedDetails?.brandLayoutType === "iheart" && user && embedDetails.embedData.placement_id) {
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
          axiosInstance,
        });
      }
    },
    [
      embedDetails?.brandLayoutType,
      embedDetails?.embedData.placement_id,
      user,
      brandDetails.environment,
      brandDetails.brand_id,
      isInIframe,
    ]
  );

  // Per-layout identity. Lives in this provider's closure so each AnalyticsProvider
  // instance carries its own embed/placement identity. Injected into every track call
  // below, replacing the singleton-held identity that caused the multi-layout race.
  const layoutIdentity = useMemo<Record<string, string | number | undefined>>(
    () => (isWebSDK ? buildLayoutIdentity(embedData) : {}),
    [isWebSDK, embedData],
  );

  const track = useCallback(
    async (eventName: EventNameType, payload?: EventPayload) => {
      // Capture current screen at call time; getScreen() is stable ref so it's safe to read here.
      await AnalyticsService.track(eventName, {
        ...layoutIdentity,
        ...payload,
        event_record_screen: getScreen(),
      });
      emitAnalyticsEvent(eventName, payload);
      if (eventName === EventName.VIDEO_COMPLETED) {
        sendVideoCompletedToBackend(payload);
      }
    },
    [emitAnalyticsEvent, sendVideoCompletedToBackend, getScreen, layoutIdentity]
  );

  return (
    <AnalyticsContext.Provider value={{ track, EventName, updateScreen, getScreen }}>
      {children}
    </AnalyticsContext.Provider>
  );
}
