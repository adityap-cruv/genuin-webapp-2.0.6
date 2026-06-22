/**
 * `AnalyticsProvider` — owns the analytics bootstrap lifecycle.
 *
 * Responsibilities:
 *  1. Inject the Rudderstack snippet on mount.
 *  2. Fetch the geoip record and enrich the device-details snapshot.
 *  3. Buffer `sendEvent(...)` calls emitted before Rudderstack is ready.
 *  4. Flush the buffer in FIFO order once `rudderanalytics.ready(cb)` resolves.
 *  5. Provide a stable `useAnalytics()` hook with a memoised `sendEvent`.
 *
 * Phase 1 status: standalone — no `.jsx` imports this yet. Phase 2 will wire
 * the legacy `App.jsx` through this provider.
 */
import { createContext, useContext, useEffect, useMemo, useRef, type ReactNode } from "react";

import { createEventBuffer, type EventBuffer } from "@cxr/analytics/analytics";
import { sendEventLog, type OffsitePropertiesConfig, type RudderstackLike } from "@cxr/analytics/analytics";
import { initializeRudderAnalytics } from "@cxr/analytics/rudderstack";
import { enrichDeviceDetailsWithGeoIp, getDeviceDetailsSnapshot, type DeviceDetails } from "@cxr/platform/device";
import { windowLink as DEFAULT_WINDOW_LINK } from "@cxr/platform/topWindow";
import { getIpInfo } from "@cxr/services/api";
import { userId as DEFAULT_USER_ID } from "@cxr/userId";
import { createLogger } from "@cxr/utils/logger";

const _logger = createLogger("cxr/analytics-provider");

/** Surface exposed via {@link useAnalytics}. */
export interface AnalyticsContextValue {
  /** Emit an analytics event. Buffered until Rudderstack is ready. */
  sendEvent: (eventName: string, eventDetails?: Record<string, unknown>) => void;
}

const AnalyticsContext = createContext<AnalyticsContextValue | undefined>(undefined);

interface RudderstackReadyApi extends RudderstackLike {
  ready: (cb: () => void) => void;
}

interface AnalyticsProviderProps {
  children: ReactNode;
}

/**
 * Resolve the live Rudderstack instance from the window, if any.
 */
function readRudderstack(): RudderstackReadyApi | undefined {
  const win = window as Window & { rudderanalytics?: RudderstackReadyApi };
  return win.rudderanalytics;
}

/**
 * Read the offsite override config from the window, if any.
 */
function readOffsite(): OffsitePropertiesConfig {
  const win = window as Window & { offsitePropertiesConfig?: OffsitePropertiesConfig };
  return win.offsitePropertiesConfig ?? {};
}

/**
 * AnalyticsProvider — bootstraps Rudderstack + geoip, exposes `useAnalytics`.
 */
export function AnalyticsProvider({ children }: AnalyticsProviderProps): ReactNode {
  // Refs persist across renders without re-triggering effects.
  const deviceRef = useRef<DeviceDetails>(getDeviceDetailsSnapshot());
  const bufferRef = useRef<EventBuffer>(createEventBuffer());

  useEffect(() => {
    initializeRudderAnalytics();

    // Enrich device-details once geoip resolves; errors are non-fatal.
    getIpInfo()
      .then((geoip) => {
        deviceRef.current = enrichDeviceDetailsWithGeoIp(deviceRef.current, geoip);
      })
      .catch((err) => {
        // Match legacy behaviour: log + continue with an empty geoip block.
        _logger.error("error :", err);
      });

    const rudder = readRudderstack();
    if (!rudder) return;

    rudder.ready(() => {
      bufferRef.current.flush((eventName, payload) => {
        sendEventLog(
          {
            eventName,
            eventDetails: (payload as Record<string, unknown> | undefined) ?? {},
          },
          {
            rudderanalytics: readRudderstack(),
            deviceDetails: deviceRef.current,
            userId: DEFAULT_USER_ID,
            windowLink: DEFAULT_WINDOW_LINK,
            offsite: readOffsite(),
          }
        );
      });
    });
  }, []);

  const value = useMemo<AnalyticsContextValue>(
    () => ({
      sendEvent(eventName, eventDetails) {
        // Enqueue — the buffer is a pass-through after `flush()`, so post-ready
        // calls forward directly to the live emitter set in the effect above.
        bufferRef.current.enqueue(eventName, eventDetails);
      },
    }),
    []
  );

  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>;
}

/**
 * Hook accessor for the analytics context.
 *
 * @throws Error when called outside an {@link AnalyticsProvider}.
 */
export function useAnalytics(): AnalyticsContextValue {
  const ctx = useContext(AnalyticsContext);
  if (!ctx) {
    throw new Error("useAnalytics must be used inside <AnalyticsProvider>");
  }
  return ctx;
}
