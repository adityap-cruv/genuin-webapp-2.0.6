/**
 * Ad-request observation for strategy specs.
 *
 * Several strategies are decisions about *whether or when the ad request fires*
 * — `gateOnUnmute` suppresses it while muted, `singleHitWaterfall` allows only
 * the first per page load, `adsDisabled` forbids it entirely. None of those are
 * observable from the DOM: "no ad rendered" looks identical whether the request
 * was suppressed or was made and no-filled. Counting the request is the only
 * assertion that distinguishes them.
 *
 * This is an AMENDMENT to ADR 004, not a reversal. Requests are observed and
 * passed straight through (`route.continue()`), so the real GenAd waterfall
 * still runs and still fills — the spec learns the count without giving up the
 * live integration the ADR exists to protect.
 *
 * MUST be called BEFORE `mountWidget`: Playwright routes only affect requests
 * made after the route is registered.
 *
 * @example
 * ```ts
 * const ads = await captureAdRequests(page);
 * await mountWidget(page, { tagId: TAG.ads, size: "L3", strategies: { gateOnUnmute: true } });
 * await bar.waitForPlayable();
 * expect(ads.count()).toBe(0);          // muted → suppressed
 * await bar.tapMuteAnywhere();          // unmute
 * await ads.waitForCount(1);
 * ```
 */
import type { Page } from "@playwright/test";

/**
 * The waterfall's ad REQUEST — the `/tagxml/` endpoint every `video_ad.ads_url`
 * in the captured fixtures points at.
 *
 * Scoped to that path on purpose. The same host also serves the VAST tracking
 * beacons (`/event/won`, `/event/impression`, `/event/start`, and one per
 * quartile), which fire only AFTER a fill — counting those turns "one ad
 * requested" into seven and makes every count assertion meaningless.
 */
const AD_REQUEST_RE = /nxs\.begenuin\.com\/tagxml\//;

/** Live view over the ad requests seen since {@link captureAdRequests}. */
export interface AdRequestLog {
  /** How many ad-server requests have been made so far. */
  count(): number;
  /** Every ad-server URL seen, in order. */
  urls(): string[];
  /**
   * Value of a query param on the most recent ad request — the resolved macro
   * actually sent (e.g. `ua`, `ip`). `undefined` when absent or no request yet.
   */
  param(name: string): string | undefined;
  /**
   * Wait until exactly `expected` requests have been seen and the count HOLDS
   * for `settleMs`, so an assertion cannot pass on a value still climbing.
   * Throws on timeout, naming the count it actually reached.
   */
  waitForCount(expected: number, timeoutMs?: number, settleMs?: number): Promise<void>;
  /**
   * Assert the count stays at its current value for `forMs`. The only honest way
   * to test a *suppressed* request: "0 right now" proves nothing on its own.
   */
  expectNoneFor(forMs: number): Promise<void>;
  /** Forget everything seen so far — e.g. after the gating action. */
  reset(): void;
}

/**
 * Start observing ad-server requests on `page`.
 *
 * @param page Playwright page. Must not have navigated yet.
 * @returns A live log; every method reads the current state at call time.
 */
export async function captureAdRequests(page: Page): Promise<AdRequestLog> {
  let seen: string[] = [];

  await page.route(AD_REQUEST_RE, (route) => {
    seen.push(route.request().url());
    // Pass through: the real waterfall still runs and still fills.
    return route.continue();
  });

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  return {
    count: () => seen.length,
    urls: () => [...seen],
    param(name) {
      const last = seen.at(-1);
      if (!last) return undefined;
      return new URL(last).searchParams.get(name) ?? undefined;
    },
    async waitForCount(expected, timeoutMs = 15_000, settleMs = 500) {
      const deadline = Date.now() + timeoutMs;
      for (;;) {
        if (seen.length === expected) {
          // Hold: a count that is still climbing would otherwise pass here.
          await sleep(settleMs);
          if (seen.length === expected) return;
        }
        if (Date.now() >= deadline) {
          throw new Error(
            `Expected ${expected} ad request(s) within ${timeoutMs}ms, saw ${seen.length}:\n` +
              seen.map((u, i) => `  #${i}: ${u.slice(0, 120)}`).join("\n")
          );
        }
        await sleep(100);
      }
    },
    async expectNoneFor(forMs) {
      const before = seen.length;
      await sleep(forMs);
      if (seen.length !== before) {
        throw new Error(
          `Expected no ad request for ${forMs}ms, but ${seen.length - before} fired:\n` +
            seen
              .slice(before)
              .map((u, i) => `  #${i}: ${u.slice(0, 120)}`)
              .join("\n")
        );
      }
    },
    reset() {
      seen = [];
    },
  };
}
