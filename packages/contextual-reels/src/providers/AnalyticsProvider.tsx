/**
 * `AnalyticsProvider` — owns the analytics bootstrap lifecycle.
 *
 * Responsibilities:
 *  1. Inject the Rudderstack snippet on mount.
 *  2. Fetch (or reuse) the shared geoip record and enrich the device-details
 *     snapshot. Failures resolve to an empty geoip block, never reject.
 *  3. Buffer `sendEvent(...)` calls emitted before analytics is ready.
 *  4. Flush the buffer in FIFO order once BOTH Rudderstack is ready AND the
 *     geoip fetch has settled — so every event carries a resolved geoip block.
 *  5. Provide a stable `useAnalytics()` hook with a memoised `sendEvent`.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, type ReactNode } from "react";

import { sendEventLog, type OffsitePropertiesConfig, type RudderstackLike } from "@cxr/analytics/analytics";
import { initializeRudderAnalytics } from "@cxr/analytics/rudderstack";
import { RudderstackEventBuffer, type MandatoryEventPayload } from "@cxr/analytics/rudderstackBuffer";
import { hostMacros } from "@cxr/hostMacros";
import { enrichDeviceDetailsWithGeoIp, getDeviceDetailsSnapshot, type DeviceDetails } from "@cxr/platform/device";
import { windowLink as DEFAULT_WINDOW_LINK } from "@cxr/platform/topWindow";
import { getSharedGeoIp } from "@cxr/services/api";
import { userId as DEFAULT_USER_ID } from "@cxr/userId";

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
  /**
   * Set mandatory event data (visit_id, geoip) for RudderStack buffering.
   * Called when APIs return data. Buffer auto-flushes when all required
   * mandatory fields are available.
   */
  setMandatoryData: (data: Partial<MandatoryEventPayload>) => void;
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
  const bufferRef = useRef<RudderstackEventBuffer>(
    new RudderstackEventBuffer(["visit_id"], 500)
  );
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

  const setMandatoryData = useCallback(
    (data: Partial<MandatoryEventPayload>): void => {
      bufferRef.current.setMandatoryData(data);
    },
    []
  );

  useEffect(() => {
    initializeRudderAnalytics();

    // Arm the buffer with the emitter so it can auto-flush when mandatory data arrives.
    // This ensures events don't fire to RudderStack before all required data is present.
    bufferRef.current.setEmitter((eventName, payload) => {
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
          hostMacros,
        }
      );
    });

    // Shared geoip fetch (one per page, never rejects): stamp it onto the
    // device details and signal the buffer.
    getSharedGeoIp()
      .then((geoip) => {
        deviceRef.current = enrichDeviceDetailsWithGeoIp(deviceRef.current, geoip);
        bufferRef.current.setMandatoryData({
          geoip: {
            country: (geoip as Record<string, unknown>).country as string | undefined,
            lat: (geoip as Record<string, unknown>).latitude as number | undefined,
            long: (geoip as Record<string, unknown>).longitude as number | undefined,
          },
        });
      })
      .catch((err) => {
        // Non-blocking: mark geoip unavailable so buffer can proceed
        console.error("Failed to fetch geoip:", err);
        bufferRef.current.markUnavailable("geoip");
      });
  }, []);

  const value = useMemo<AnalyticsContextValue>(
    () => ({
      sendEvent(eventName, eventDetails) {
        // Pass a factory function so payload is computed at flush time,
        // allowing basePayloadRef updates (like visit_id) to be included in buffered events.
        bufferRef.current.enqueue(eventName, () => {
          const identifiers = {
            ...(tagId !== undefined ? { tag_id: tagId } : {}),
            ...(brandIdRef.current !== undefined ? { brand_id: brandIdRef.current } : {}),
          };
          return {
            ...basePayloadRef.current,
            ...identifiers,
            ...eventDetails,
          };
        });
      },
      setBrandId,
      setBaseEventContext,
      setMandatoryData,
    }),
    [tagId, setBrandId, setBaseEventContext, setMandatoryData]
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
