/**
 * Analytics observation for the E2E suite.
 *
 * Two strategies have no DOM at all: `suppressedEvents` is "this event name
 * never reaches the wire", and the `visibilityGate` passback is an `Ad Passback`
 * event carrying `passback_reason: "unit_hidden"`. Both are only observable as
 * events.
 *
 * Everything the widget emits funnels through `AnalyticsProvider.sendEvent` and
 * out via `rudderanalytics.track(name, props)`, read off `window` at call time
 * (`analytics.ts`). So the seam is the global, not the network:
 * `initRudderstack` is deliberately idempotent — it no-ops when
 * `window.rudderanalytics` already exists — so pre-installing a recorder means
 * the real SDK never loads at all.
 *
 * That is better than intercepting the data plane over HTTP, for three reasons:
 *
 *  1. Rudderstack batches and flushes via `navigator.sendBeacon`, which does not
 *     route reliably — an HTTP interceptor sees nothing (it saw exactly zero
 *     events when this was first written that way).
 *  2. No dependency on the CDN loading or the data plane being reachable.
 *  3. E2E runs stop emitting real events into production analytics.
 *
 * MUST be called BEFORE `mountWidget`: the stub is installed via
 * `addInitScript`, which only affects navigations made after registration.
 */
import type { Page } from "@playwright/test";

/** One captured analytics event. */
export interface CapturedEvent {
  /** The `EVENT` string as passed to `sendEvent` (e.g. `"Ad Passback"`). */
  name: string;
  /** Full payload as passed to `rudderanalytics.track`. */
  properties: Record<string, unknown>;
  /**
   * The `event_details` sub-object, where every per-event field actually lives
   * (`passback_reason`, `volume`, `tag_id`, …). The top level of `properties`
   * only carries `event_name` + `event_details`, so an assertion written against
   * `properties.passback_reason` silently reads `undefined`.
   */
  details: Record<string, unknown>;
}

/** Live view over the analytics events emitted since {@link captureAnalytics}. */
export interface AnalyticsLog {
  /** Every event emitted so far, in order. */
  all(): Promise<CapturedEvent[]>;
  /** Every occurrence of one event name. */
  named(name: string): Promise<CapturedEvent[]>;
  /**
   * Wait for an event with `name` and return the first one. Throws on timeout,
   * listing the event names that did arrive.
   */
  waitFor(name: string, timeoutMs?: number): Promise<CapturedEvent>;
  /**
   * Assert `name` does NOT arrive within `withinMs`. Waits rather than reading
   * once — a bare "not present yet" would pass against an event that simply had
   * not been emitted yet.
   */
  expectNever(name: string, withinMs?: number): Promise<void>;
}

/**
 * Installed before any page script runs, so `initRudderstack` finds it already
 * present and skips loading the real SDK.
 *
 * Only `track` records; the rest are no-op shims so anything else the SDK
 * surface is expected to expose stays callable.
 */
const RECORDER_INIT_SCRIPT = `
  window.__cxrEvents = [];
  var noop = function () {};
  window.rudderanalytics = {
    track: function (name, properties) {
      var props = properties || {};
      window.__cxrEvents.push({
        name: name,
        properties: props,
        details: props.event_details || {},
      });
    },
    // MUST invoke its callback, as the real SDK does once loaded.
    // AnalyticsProvider arms the buffer's emitter inside \`ready(...)\`, and
    // \`RudderstackEventBuffer.checkAndFlush\` requires an emitter before it will
    // flush — so a no-op \`ready\` leaves every event queued in \`buffering\`
    // forever and only the unbuffered \`Tag Init\` is ever recorded.
    ready: function (cb) {
      if (typeof cb === "function") cb();
    },
    load: noop, identify: noop, page: noop, group: noop,
    alias: noop, reset: noop, setAnonymousId: noop,
  };
`;

/**
 * Start recording analytics events on `page`.
 *
 * @param page Playwright page. Must not have navigated yet.
 */
export async function captureAnalytics(page: Page): Promise<AnalyticsLog> {
  await page.addInitScript(RECORDER_INIT_SCRIPT);

  const read = (): Promise<CapturedEvent[]> =>
    page.evaluate(() => (window as unknown as { __cxrEvents?: CapturedEvent[] }).__cxrEvents ?? []);

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  return {
    all: read,
    async named(name) {
      return (await read()).filter((e) => e.name === name);
    },
    async waitFor(name, timeoutMs = 20_000) {
      const deadline = Date.now() + timeoutMs;
      for (;;) {
        const seen = await read();
        const hit = seen.find((e) => e.name === name);
        if (hit) return hit;
        if (Date.now() >= deadline) {
          const names = [...new Set(seen.map((e) => e.name))];
          throw new Error(
            `No "${name}" event within ${timeoutMs}ms. Saw ${seen.length} event(s): ${names.join(", ") || "none"}`
          );
        }
        await sleep(200);
      }
    },
    async expectNever(name, withinMs = 8000) {
      await sleep(withinMs);
      const hits = (await read()).filter((e) => e.name === name);
      if (hits.length > 0) {
        throw new Error(`Expected "${name}" to be suppressed, but it fired ${hits.length}x`);
      }
    },
  };
}
