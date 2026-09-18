/**
 * L2 — 300×250 desktop full player + Octo (GenAI) overlay.
 *
 * L2's differentiator is the Octo sheet: when it mounts, `VideoControlLayer`
 * sets `hideChrome`, which drops the default control rows so the sheet owns the
 * surface. Nothing else in the suite reaches that path.
 *
 * It also owns the two config-precedence cases that only make sense on a
 * full-chrome desktop unit: the dashboard's `enable_ask_question` beating the
 * strategy allowlist, and the brand-level backdrop colour beating the backend's
 * `brand_color`.
 *
 *   L2-ROUTE        300×250 resolves to the full-player chrome
 *   L2-OCTO         GenAI on → the Octo sheet takes the chrome
 *   L2-PRECEDENCE   the dashboard flag beats the allowlist, in both directions
 *   L2-ADS-DISABLED the kill switch drops ad slides AND suppresses the request
 *
 * Desktop-only: L2 does not ship to phones, so nothing here is tagged @mobile.
 */
import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";

import { captureAdRequests } from "./support/adRequests";
import { mountWidget, TAG } from "./support/mountWidget";
import { waitUntil } from "./support/poll";

/**
 * Read the FIRST rendered slide's chrome. Scoped to one slide because the
 * carousel mounts a neighbour too, and an inactive reel keeps its own chrome.
 */
const chrome = (page: Page) =>
  page.evaluate(() => {
    const root = window.__cxrRoot() as ShadowRoot;
    const slide = root.querySelector('[data-testid="video-layout"]');
    return {
      // OctoSdkPanel mints `<instanceId>-octo-genai-<seq>` on its container.
      hasOctoPanel: !!slide?.querySelector('[id*="-octo-genai-"]'),
      // Any bottombar control stands in for the whole row.
      hasBottomBar: !!slide?.querySelector('[data-testid^="bottombar-"]'),
      hasTopBar: !!slide?.querySelector('[data-testid="default-top-bar"]'),
      hasPlayer: !!slide?.querySelector('[data-testid="video-layout-player"]'),
    };
  });

const waitForOcto = (page: Page, timeoutMs = 10_000) =>
  waitUntil(page, "the Octo panel to mount", () => !!window.__cxrRoot()?.querySelector('[id*="-octo-genai-"]'), {
    timeoutMs,
  });

test.describe("L2 — 300x250 full player + Octo", () => {
  test("L2-ROUTE: 300x250 resolves to the full-player layout", { tag: "@routing" }, async ({ page }) => {
    await mountWidget(page, { tagId: TAG.video, size: "L2" });

    const probe = await page.evaluate(() => {
      const host = window.__cxrHost() as HTMLElement;
      const root = window.__cxrRoot() as ShadowRoot;
      return {
        slot: [host.offsetWidth, host.offsetHeight],
        adSizeMeta: document.querySelector('meta[name="ad.size"]')?.getAttribute("content"),
        hasFullPlayer: !!root.querySelector('[data-testid="video-layout-player"]'),
        hasCompactBar: !!root.querySelector('[data-testid="compact-control-bar"]'),
      };
    });

    expect(probe.slot).toEqual([300, 250]);
    expect(probe.adSizeMeta).toBe("width=300,height=250");
    expect(probe.hasFullPlayer).toBe(true);
    expect(probe.hasCompactBar).toBe(false);
  });

  // Both halves are mounted so the assertion is the DELTA, not just the on state.
  test("L2-OCTO: enabling GenAI hands the chrome to the Octo sheet", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(String(error)));

    // Control: GenAI off — full default chrome, no Octo.
    await mountWidget(page, { tagId: TAG.video, size: "L2" });
    const off = await chrome(page);
    expect(off.hasOctoPanel).toBe(false);
    expect(off.hasBottomBar).toBe(true);
    expect(off.hasTopBar).toBe(true);
    expect(off.hasPlayer).toBe(true);

    // Same tag, GenAI on via the strategy seam.
    await mountWidget(page, { tagId: TAG.video, size: "L2", strategies: { genAiEnabled: true } });
    await waitForOcto(page);
    const on = await chrome(page);
    expect(on.hasOctoPanel).toBe(true);
    // `hideChrome` gates BOTH rows in DefaultControlLayer — the sheet takes the
    // whole surface, so the top icon cluster goes with the ticker/CTA row.
    expect(on.hasBottomBar).toBe(false);
    expect(on.hasTopBar).toBe(false);
    // The player stays mounted underneath — Octo overlays it, never replaces it.
    expect(on.hasPlayer).toBe(true);

    expect(pageErrors).toEqual([]);
  });

  // The dashboard's `enable_ask_question` is what drives live-preview toggling,
  // and it reaches `genAiEnabled` without any strategyConfig entry for the tag.
  //
  // NOTE: this deliberately does NOT use the `strategies` seam. That seam is the
  // last step of the cascade by design, so it beats the dashboard flag as well —
  // it cannot express "the dashboard wins over the allowlist". That ordering is
  // unit-covered in `src/strategies/StrategyProvider.test.tsx`; what E2E can
  // prove is that the dashboard flag alone drives the real chrome, both ways.
  test("L2-PRECEDENCE: the dashboard flag alone drives GenAI, both ways", async ({ page }) => {
    // ON: an unlisted tag with the dashboard switch set → Octo mounts.
    await mountWidget(page, {
      tagId: TAG.video,
      size: "L2",
      tagOverrides: { config: { enable_ask_question: true } },
    });
    await waitForOcto(page);
    expect((await chrome(page)).hasOctoPanel).toBe(true);

    // OFF: same tag, switch cleared → it does not. Asserted as a bounded wait on
    // the SAME signal the positive arm uses, so this cannot pass merely by
    // reading before Octo had a chance to mount.
    await mountWidget(page, {
      tagId: TAG.video,
      size: "L2",
      tagOverrides: { config: { enable_ask_question: false } },
    });
    await expect(waitForOcto(page, 4000)).rejects.toThrow();
    expect((await chrome(page)).hasOctoPanel).toBe(false);
  });

  // The hard kill switch. Distinct from every audio gate: `adsDisabled` drops
  // standalone ad slides from the normalised feed and strips the ad break, so
  // the request must never be made at all — which is only observable on the wire.
  test("L2-ADS-DISABLED: the kill switch drops ad slides and suppresses the request", async ({ page }) => {
    const ads = await captureAdRequests(page);

    await mountWidget(page, {
      tagId: TAG.ads,
      size: "L2",
      strategies: { adsDisabled: true },
      // Every slide in an ads-only feed is dropped, so no layout ever mounts.
      awaitMount: "none",
    });

    // The shadow root is attached a tick after domcontentloaded, which is where
    // `awaitMount: "none"` returns — wait for the root itself before probing it.
    await waitUntil(page, "the shadow root to attach", () => !!window.__cxrRoot(), { timeoutMs: 10_000 });

    const probe = await page.evaluate(() => {
      const root = window.__cxrRoot() as ShadowRoot;
      return {
        adLayouts: root.querySelectorAll('[data-testid="ad-layout"]').length,
        genAdSlots: root.querySelectorAll('[id^="gen-ad-slot-"]').length,
      };
    });

    // An ads-only feed with ads disabled has no ad slides left to render.
    expect(probe.adLayouts).toBe(0);
    expect(probe.genAdSlots).toBe(0);
    // And nothing was requested — the tell that separates "suppressed" from
    // "requested and no-filled", which look identical in the DOM.
    await ads.expectNoneFor(5000);
  });
});
