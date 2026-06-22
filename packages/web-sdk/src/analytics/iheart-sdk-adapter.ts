/**
 * Thin wrapper over the global iHeart Analytics SDK (`window.iHeartAnalytics`).
 *
 * This is the single place that touches the iHeart global. All calls are guarded so the
 * SDK being absent (e.g. on non-iHeart host pages) is a safe no-op — which also serves as
 * our "is this an iHeart article/highlights page" detection.
 */

import type { IHeartAnalyticsSDK, IHeartEvent } from "./iheart-types";

function getSdk(): IHeartAnalyticsSDK | null {
  if (typeof window === "undefined") {
    return null;
  }
  return window.iHeartAnalytics ?? null;
}

/** Dev-only diagnostic log, matching the SDK's existing console convention. */
function devWarn(message: string, detail?: unknown): void {
  if (process.env.NODE_ENV === "development") {
    console.warn(`[iHeart-analytics] ${message}`, detail ?? "");
  }
}

/**
 * Logs a built event so it can be inspected even when the iHeart SDK is absent (i.e.
 * `window.iHeartAnalytics` not present). Called from the bridge BEFORE the SDK-ready gate,
 * so the full `{ type, data }` is visible regardless of forwarding.
 *
 * Not gated on `NODE_ENV`, so payloads remain inspectable in any build.
 */
export function logIHeartEvent(event: IHeartEvent, forwarded: boolean): void {
  const status = forwarded ? "forwarded" : "SDK absent — not forwarded";
  console.info(`[iHeart-analytics] ${event.type} (${status})`, event.data);
  console.table(event.data);
}

/**
 * Whether the iHeart Analytics SDK is present and ready to receive events.
 * Gates on `enabled` only — the iHeart SDK does not expose an `initialized` flag.
 */
export function isIHeartSdkReady(): boolean {
  const sdk = getSdk();
  return sdk !== null && sdk.enabled === true;
}

/**
 * Raises a single event to iHeart analytics.
 *
 * Some properties (notably `station.listenTime`) must be sent as BOTH a global attribute
 * AND in the event data ("dual send" per spec). When `attributes` are supplied they are
 * pushed via `setGlobalData` before the `track` call.
 *
 * @returns `true` if the event was handed to the SDK, `false` if it was skipped/failed.
 */
export function raiseIHeartEvent(event: IHeartEvent, attributes?: Record<string, unknown>): boolean {
  const sdk = getSdk();
  if (!sdk) {
    devWarn("SDK not present; skipping event", event.type);
    return false;
  }

  try {
    if (attributes && Object.keys(attributes).length > 0) {
      sdk.setGlobalData(attributes);
    }
    sdk.track({ type: event.type, data: event.data });
    return true;
  } catch (error) {
    devWarn("track() threw", error);
    return false;
  }
}
