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
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, type ReactNode } from "react";

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
  /**
   * Register the active tag's numeric `brand_id` so it is injected into every
   * subsequent event's `event_details.brand_id`. Resolved asynchronously after
   * the tag config loads — call once `tagDetails` is available.
   */
  setBrandId: (brandId: number | undefined) => void;
  /**
   * Merge fields into the base event payload stamped onto EVERY event's
   * `event_details`. Providers call this to publish live state that should
   * accompany all analytics — e.g. PlayerProvider reports `{ volume, is_muted }`,
   * FullScreenProvider reports `{ event_record_screen }`, and Feed reports the
   * active `{ video_id }`. Merged (not replaced), so independent contributors
   * don't clobber each other. Ref-backed → stable identity.
   */
  setBaseEventContext: (partial: Record<string, unknown>) => void;
}

const AnalyticsContext = createContext<AnalyticsContextValue | undefined>(undefined);

interface RudderstackReadyApi extends RudderstackLike {
  ready: (cb: () => void) => void;
}

interface AnalyticsProviderProps {
  children: ReactNode;
  /** Tag ID injected into every event's `event_details.tag_id`. */
  tagId?: string;
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
export function AnalyticsProvider({ children, tagId }: AnalyticsProviderProps): ReactNode {
  // Refs persist across renders without re-triggering effects.
  const deviceRef = useRef<DeviceDetails>(getDeviceDetailsSnapshot());
  const bufferRef = useRef<EventBuffer>(createEventBuffer());
  // brand_id resolves async after the tag loads. Held in a ref so `sendEvent`
  // stays referentially stable (its identity must not change when brand_id
  // arrives, or consumer effects keyed on it would re-run).
  const brandIdRef = useRef<number | undefined>(undefined);
  // Base event payload stamped onto every event. Defaults mirror the widget's
  // initial state — silent (volume 0, muted) and collapsed (embed view) — so
  // events emitted before a provider reports still carry sane values. Held in a
  // ref so `sendEvent` stays referentially stable as the payload changes.
  const basePayloadRef = useRef<Record<string, unknown>>({
    volume: 0,
    is_muted: true,
    event_record_screen: "embed",
  });

  const setBrandId = useCallback((brandId: number | undefined): void => {
    brandIdRef.current = brandId;
  }, []);

  const setBaseEventContext = useCallback((partial: Record<string, unknown>): void => {
    basePayloadRef.current = { ...basePayloadRef.current, ...partial };
  }, []);

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
        // Inject tag_id + brand_id into every event. Omitted when undefined so
        // we never emit `tag_id: undefined` keys. brand_id is read from the ref
        // at call time so late-resolving values still attach. Caller-supplied
        // eventDetails win on key collision.
        const identifiers = {
          ...(tagId !== undefined ? { tag_id: tagId } : {}),
          ...(brandIdRef.current !== undefined ? { brand_id: brandIdRef.current } : {}),
        };
        // Base payload first, then identifiers, then caller details win.
        // Read at call time so each field reflects the moment of emission.
        const finalPayload: Record<string, unknown> = {
          ...basePayloadRef.current,
          ...identifiers,
          ...eventDetails,
        };
        bufferRef.current.enqueue(eventName, finalPayload);
      },
      setBrandId,
      setBaseEventContext,
    }),
    [tagId, setBrandId, setBaseEventContext]
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
