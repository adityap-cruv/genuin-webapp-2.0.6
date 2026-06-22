/**
 * @fileoverview
 * Feature: iHeart analytics forwarding
 *
 * Objective:
 * Validate that Genuin analytics events are translated into the iHeart streaming lifecycle
 * and forwarded to `window.iHeartAnalytics.track(...)` by default. A stubbed iHeart SDK records
 * every track() call so the test can assert the emitted event types and payloads without a live
 * iHeart page.
 *
 * NOTE: requires the built `dist/gen_sdk.js` (via global-setup) and Playwright browsers.
 */

import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

import { EMBED_LAYOUT_DATA } from "../../data/init";
import { cleanupSDKState } from "../../helpers/cleanup.helper";
import { createSDKContainer } from "../../helpers/sdk-container.helper";
import { waitForSDK, waitForSDKRender } from "../../helpers/sdk-wait.helper";

/** Captured iHeart track() call. */
interface TrackCall {
  type: string;
  data: Record<string, unknown>;
}

const EMBED = EMBED_LAYOUT_DATA.carousel;
const containerDetails = {
  dataAttributes: { "embed-id": EMBED.embed_id, "api-key": EMBED.api_key },
};

/** Injects a stub iHeart SDK that records track() calls onto `window.__iheartTrackCalls`. */
async function injectIHeartStub(page: Page) {
  await page.addInitScript(() => {
    const calls: TrackCall[] = [];
    (window as unknown as { __iheartTrackCalls: TrackCall[] }).__iheartTrackCalls = calls;
    (window as unknown as { iHeartAnalytics: unknown }).iHeartAnalytics = {
      enabled: true,
      initialized: true,
      setGlobalData: () => {},
      track: (event: TrackCall) => calls.push(event),
    };
  });
}

/** Emits a Genuin analytics event on the internal `onAnalyticsTrack` channel. */
async function emitAnalytics(page: Page, value: string, payload: Record<string, unknown>) {
  await page.evaluate(
    ({ value: eventValue, payload: eventPayload }) => {
      (window as any).genuin.emitInternal("onAnalyticsTrack", {
        eventName: `analytics:${eventValue}`,
        eventPayload,
      });
    },
    { value, payload }
  );
}

async function getTrackCalls(page: Page): Promise<TrackCall[]> {
  return page.evaluate(
    () => (window as unknown as { __iheartTrackCalls: TrackCall[] }).__iheartTrackCalls ?? []
  );
}

const clip = (id: string, extra: Record<string, unknown> = {}) => ({
  content_id: id,
  title: `clip ${id}`,
  total_videos: 20,
  position_index: 0,
  ...extra,
});

test.describe("Feature: iHeart analytics forwarding", () => {
  test.afterEach(async ({ page }) => {
    await cleanupSDKState(page, containerDetails).catch(() => {});
  });

  test("Scenario: default — forwards the streaming lifecycle to iHeart", async ({ page }) => {
    await injectIHeartStub(page);
    await page.goto("/index-test.html");
    await waitForSDK(page);
    await createSDKContainer(page, containerDetails);

    await page.evaluate((cfg) => {
      (window as any).genuin.init({ embed_id: cfg.embedId, api_key: cfg.apiKey });
    }, { embedId: EMBED.embed_id, apiKey: EMBED.api_key });
    await waitForSDKRender(page);

    await emitAnalytics(page, "Video Started", clip("a"));
    await emitAnalytics(page, "Video Started", clip("b", { position_index: 1 }));
    await emitAnalytics(page, "Video Complete", clip("b", { position_index: 1 }));

    const calls = await getTrackCalls(page);
    const types = calls.map((c) => c.type);

    expect(types).toEqual(["stream_start", "track_start", "track_end", "track_start", "track_end", "stream_end"]);
    expect(calls[0].data["station.asset.type"]).toBe("highlights");
    expect(calls[0].data["station.sessionId"]).toBeTruthy();
    // Same session id across the whole stream.
    const sessionIds = new Set(calls.map((c) => c.data["station.sessionId"]));
    expect(sessionIds.size).toBe(1);
  });

});
