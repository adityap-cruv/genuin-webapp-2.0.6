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
 *  6. Track passback state — when `setAdPassback()` is called, set `passback: 1`
 *     on ALL subsequent events (buffered and post-flush). This is critical for
 *     ad-loading failures. DO NOT REMOVE OR MODIFY THIS BEHAVIOR without
 *     explicit review of impact on ad revenue tracking.
 *  7. Two distinct ways for a provider to publish live state onto events —
 *     don't mix them up:
 *       - `setBaseEventContext` (basePayloadRef): read INSIDE the deferred
 *         buffer factory, i.e. at flush time. Retroactive on purpose — it's how
 *         `passback` backfills onto events that were already buffered before
 *         the ad waterfall failed (see #6). Right for state a failure should
 *         rewrite history for.
 *       - `setLiveEventContext` (liveContextRef): read at `sendEvent()` call
 *         time, before enqueueing — a point-in-time snapshot. Right for state
 *         that must reflect what was true when the event fired, not the latest
 *         value once buffering finally resolves (e.g. `unit_visible` — see
 *         `useFeedVisibilityGate`).
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
import { createLogger } from "@cxr/utils/logger";

const logger = createLogger("cxr/analytics-provider");

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
   * Merge fields captured RIGHT NOW into the very next `sendEvent` call only —
   * unlike {@link setBaseEventContext}, which is read at flush time and is
   * therefore retroactive, this is snapshotted at enqueue time so a fast-
   * changing value is stamped with what was true when the event fired, not
   * whatever it becomes by the time a buffered event actually flushes. See the
   * module doc comment (point 7) for when to use which.
   */
  setLiveEventContext: (partial: Record<string, unknown>) => void;
  /**
   * Set mandatory event data (visit_id, geoip) for RudderStack buffering.
   * Called when APIs return data. Buffer auto-flushes when all required
   * mandatory fields are available.
   */
  setMandatoryData: (data: Partial<MandatoryEventPayload>) => void;
  /**
   * Mark ad as passback (failed to load). Sets passback: 1 on all subsequent events.
   */
  setAdPassback: () => void;
}

const AnalyticsContext = createContext<AnalyticsContextValue | undefined>(undefined);

interface RudderstackReadyApi extends RudderstackLike {
  ready: (cb: () => void) => void;
}

interface AnalyticsProviderProps {
  children: ReactNode;
  /** Tag ID injected into every event's `event_details.tag_id`. */
  tagId?: string;
  /**
   * Dashboard preview mode. When true this instance emits ZERO analytics:
   * `sendEvent` is a no-op and neither Rudderstack nor the geoip fetch is
   * bootstrapped. Distinct from a normal embed, which always reports.
   */
  preview?: boolean;
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
export function AnalyticsProvider({ children, tagId, preview = false }: AnalyticsProviderProps): ReactNode {
  // Refs persist across renders without re-triggering effects.
  const deviceRef = useRef<DeviceDetails>(getDeviceDetailsSnapshot());
  const bufferRef = useRef<RudderstackEventBuffer>(new RudderstackEventBuffer(["visit_id", "geoip"], 500));
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
    passback: 0,
  });
  // Track if ad passback occurred for this widget instance
  const passbackRef = useRef(false);
  // Point-in-time context — snapshotted into each event at sendEvent() call
  // time (see setLiveEventContext's doc comment). Distinct from basePayloadRef,
  // which is deliberately read later, at flush time.
  const liveContextRef = useRef<Record<string, unknown>>({});

  const setBrandId = useCallback((brandId: number | undefined): void => {
    brandIdRef.current = brandId;
  }, []);

  const setBaseEventContext = useCallback((partial: Record<string, unknown>): void => {
    basePayloadRef.current = { ...basePayloadRef.current, ...partial };
  }, []);

  const setLiveEventContext = useCallback((partial: Record<string, unknown>): void => {
    liveContextRef.current = { ...liveContextRef.current, ...partial };
  }, []);

  const setMandatoryData = useCallback((data: Partial<MandatoryEventPayload>): void => {
    bufferRef.current.setMandatoryData(data);
  }, []);

  const setAdPassback = useCallback((): void => {
    passbackRef.current = true;
    // CRITICAL: Set passback to 1 so all subsequent events include passback: 1
    // This signals that the ad waterfall failed and affects revenue tracking
    basePayloadRef.current.passback = 1;
  }, []);

  useEffect(() => {
    // Preview mode is analytics-silent: never bootstrap Rudderstack or fetch geoip.
    if (preview) return;
    initializeRudderAnalytics();

    // Arm the buffer with the emitter only once Rudderstack itself signals ready —
    // arming (and therefore auto-flushing) any earlier would fire events at an
    // SDK instance that hasn't finished loading. `geoip` (below) is the other
    // required gate; the buffer auto-flushes once both mandatory fields land.
    readRudderstack()?.ready(() => {
      bufferRef.current.setEmitter((eventName, payload) => {
        try {
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
        } catch (err) {
          // A single event's send failure (e.g. rudderanalytics.track throwing on a
          // malformed payload) must not take down the buffer's flush of every other
          // queued event.
          logger.error("failed to flush event", eventName, err);
        }
      });
    });

    // Shared geoip fetch (one per page, never rejects): stamp it onto the
    // device details and signal the buffer. Fetched for every tag — including
    // statically-served ones, which still need geoip on analytics and a real IP
    // for the ad-URL rewrite (see genAdSdk / adUrlMacros).
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
  }, [preview]);

  const value = useMemo<AnalyticsContextValue>(
    () => ({
      sendEvent(eventName, eventDetails) {
        // Preview mode: swallow every event so nothing reaches the buffer.
        if (preview) return;
        // Captured NOW, at enqueue time — point-in-time fields (e.g.
        // unit_visible) must reflect what was true when the event fired, not
        // whatever liveContextRef becomes by flush time. Contrast with
        // basePayloadRef below, read inside the deferred factory precisely so
        // it CAN retroactively backfill (passback) onto already-buffered
        // events — see the module doc comment (point 7).
        const liveSnapshot = { ...liveContextRef.current };
        // Pass a factory function so payload is computed at flush time,
        // allowing basePayloadRef updates (like visit_id, passback) to be included in buffered events.
        bufferRef.current.enqueue(eventName, () => {
          const identifiers = {
            ...(tagId !== undefined ? { tag_id: tagId } : {}),
            ...(brandIdRef.current !== undefined ? { brand_id: brandIdRef.current } : {}),
          };
          // basePayloadRef includes passback: 0 or 1 depending on ad waterfall state.
          // eventDetails can override if needed, but passback defaults from base.
          return {
            ...basePayloadRef.current,
            ...liveSnapshot,
            ...identifiers,
            ...eventDetails,
          };
        });
      },
      setBrandId,
      setBaseEventContext,
      setLiveEventContext,
      setMandatoryData,
      setAdPassback,
    }),
    [tagId, preview, setBrandId, setBaseEventContext, setLiveEventContext, setMandatoryData, setAdPassback]
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
