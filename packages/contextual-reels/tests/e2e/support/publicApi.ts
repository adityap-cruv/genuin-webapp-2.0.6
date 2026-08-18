/**
 * Capture the host-facing partner contract from outside the bundle.
 *
 * `CLAUDE.md` lists these as things that must never change without approval:
 * the loader name, `window.cxr`, the `cxr:*` postMessage protocol, and the
 * `window.adFillCallback` / `noAdsCallback` globals. They were the least-tested
 * surface in the package — `index.jsx` (which wires all of it) is excluded from
 * unit coverage on the grounds that E2E covers it, and E2E asserted only that
 * the bundle was served.
 *
 * Two capture problems this solves:
 *
 *  1. **`window.cxr` does not exist yet at navigation time.** `index.jsx` assigns
 *     it at module evaluation. So instead of polling, this installs an accessor
 *     on `window` that subscribes the moment the bundle assigns — which also
 *     beats the `"ready"` emit, and `on()` has no replay buffer.
 *  2. **The partner callbacks are host-supplied.** `waterfall.ts` calls
 *     `window.adFillCallback()` / `noAdsCallback()` only when the host page
 *     defined them, so the harness has to define them before load, exactly as a
 *     publisher would.
 *
 * MUST be called BEFORE `mountWidget`.
 */
import type { Page } from "@playwright/test";

/** A `window.cxr.on(...)` delivery, flattened for assertion. */
export interface CapturedCxrEvent {
  event: string;
  instanceId: string;
  data?: Record<string, unknown>;
}

/** Live view over the host-facing surface. */
export interface PublicApiLog {
  /** Was `window.cxr` assigned, and does it expose the documented methods? */
  shape(): Promise<{ present: boolean; methods: string[]; missing: string[] }>;
  /** Every public event delivered so far, in order. */
  events(): Promise<CapturedCxrEvent[]>;
  /** Wait for a specific public event; returns the first match. Throws on timeout. */
  waitForEvent(event: string, timeoutMs?: number): Promise<CapturedCxrEvent>;
  /** How many times the host-supplied `adFillCallback` / `noAdsCallback` fired. */
  partnerCallbacks(): Promise<{ adFill: number; noAds: number }>;
  /** Every `postMessage` the widget sent to the parent frame (`{type}` payloads). */
  postedToParent(): Promise<string[]>;
  /** Distinct instance ids seen across all captured events. */
  instanceIds(): Promise<string[]>;
}

/** The documented `CxrPublicApi` surface — see src/publicApi.ts. */
const REQUIRED_METHODS = ["on", "expand", "collapse", "infolinksImpression", "setPreviewConfig"];

/** Every `CxrPublicEvent` the widget can emit. */
const PUBLIC_EVENTS = [
  "ready",
  "play",
  "pause",
  "fullscreen:enter",
  "fullscreen:exit",
  "ad:fill",
  "ad:nofill",
  "ad:removed",
];

const INIT = `
  window.__cxrPublic = { events: [], adFill: 0, noAds: 0, posted: [], methods: null };

  // A publisher's own callbacks. waterfall.ts only invokes these when the host
  // page has defined them, so they must exist before the bundle loads.
  window.adFillCallback = function () { window.__cxrPublic.adFill++; };
  window.noAdsCallback  = function () { window.__cxrPublic.noAds++; };

  // The widget also posts {type} frames to its parent when embedded in an iframe.
  // The harness is top-level, so window.parent === window and these land here.
  window.addEventListener("message", function (e) {
    var t = e && e.data && e.data.type;
    if (typeof t === "string" && (t === "adFillCallback" || t === "noAdsCallback")) {
      window.__cxrPublic.posted.push(t);
    }
  });

  // Subscribe at assignment time rather than polling: index.jsx sets window.cxr
  // during module evaluation, and "ready" is emitted per instance shortly after.
  // on() has no replay buffer, so a poll would race the emit.
  var _cxr;
  Object.defineProperty(window, "cxr", {
    configurable: true,
    get: function () { return _cxr; },
    set: function (api) {
      _cxr = api;
      try {
        window.__cxrPublic.methods = Object.keys(api).filter(function (k) {
          return typeof api[k] === "function";
        });
        ${JSON.stringify(PUBLIC_EVENTS)}.forEach(function (evt) {
          api.on(evt, function (payload) {
            window.__cxrPublic.events.push({
              event: evt,
              instanceId: payload && payload.instanceId,
              data: payload && payload.data,
            });
          });
        });
      } catch (err) {
        window.__cxrPublic.subscribeError = String(err);
      }
    },
  });
`;

/**
 * Start capturing the host-facing surface on `page`.
 *
 * @param page Playwright page. Must not have navigated yet.
 */
export async function capturePublicApi(page: Page): Promise<PublicApiLog> {
  await page.addInitScript(INIT);

  type Bag = {
    events: CapturedCxrEvent[];
    adFill: number;
    noAds: number;
    posted: string[];
    methods: string[] | null;
  };
  const read = (): Promise<Bag> =>
    page.evaluate(
      () =>
        (window as unknown as { __cxrPublic: Bag }).__cxrPublic ?? {
          events: [],
          adFill: 0,
          noAds: 0,
          posted: [],
          methods: null,
        }
    );

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  return {
    async shape() {
      const methods = (await read()).methods;
      return {
        present: methods !== null,
        methods: methods ?? [],
        missing: REQUIRED_METHODS.filter((m) => !(methods ?? []).includes(m)),
      };
    },
    async events() {
      return (await read()).events;
    },
    async waitForEvent(event, timeoutMs = 20_000) {
      const deadline = Date.now() + timeoutMs;
      for (;;) {
        const seen = (await read()).events;
        const hit = seen.find((e) => e.event === event);
        if (hit) return hit;
        if (Date.now() >= deadline) {
          const names = [...new Set(seen.map((e) => e.event))];
          throw new Error(`No "${event}" public event within ${timeoutMs}ms. Saw: ${names.join(", ") || "none"}`);
        }
        await sleep(200);
      }
    },
    async partnerCallbacks() {
      const b = await read();
      return { adFill: b.adFill, noAds: b.noAds };
    },
    async postedToParent() {
      return (await read()).posted;
    },
    async instanceIds() {
      return [...new Set((await read()).events.map((e) => e.instanceId).filter(Boolean))];
    },
  };
}
