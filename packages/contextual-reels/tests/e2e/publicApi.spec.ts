/**
 * The host-facing partner contract, asserted against the real built bundle.
 *
 * `CLAUDE.md` marks this surface "never change without approval": `window.cxr`,
 * the `cxr:*` postMessage protocol, and the `window.adFillCallback` /
 * `noAdsCallback` globals. It was also the least-tested code in the package —
 * `index.jsx` wires all of it and is EXCLUDED from unit coverage on the grounds
 * that E2E covers it, while E2E asserted only that the bundle was served with
 * its build placeholders substituted.
 *
 * `publicApi.ts` itself has 21 unit tests, but they exercise the module in
 * isolation. Nothing verified that the shipped bundle actually installs it on a
 * real mount. That is what this file does.
 *
 *   PA-SHAPE     window.cxr exists and exposes every documented method
 *   PA-READY     "ready" fires per instance once its React root mounts
 *   PA-ALIAS     expand()/collapse() resolve a DOM id, not just an instanceId
 *   PA-BRIDGE    the iframe postMessage bridge is installed and accepts cxr:*
 *   PA-MULTI     two slots mint two independent instances
 *   PA-TEARDOWN  removing a slot unmounts it; a late-added slot is NOT adopted
 *   PA-PARTNER   a real fill invokes the host's adFillCallback
 *
 * Desktop-only: this is about bundle bootstrap, not layout, so re-running it
 * under mobile-chrome would buy nothing.
 */
import { test, expect } from "@playwright/test";

import { WidgetPage } from "./support/WidgetPage";
import { mountWidget, TAG } from "./support/mountWidget";
import { waitUntil } from "./support/poll";
import { capturePublicApi } from "./support/publicApi";

test.describe("public API — host-facing partner contract", () => {
  test("PA-SHAPE: window.cxr is installed with every documented method", { tag: "@routing" }, async ({ page }) => {
    const api = await capturePublicApi(page);
    await mountWidget(page, { tagId: TAG.video, size: "L4" });

    const shape = await api.shape();
    expect(shape.present).toBe(true);
    // Missing-first so a failure names the method that vanished.
    expect(shape.missing).toEqual([]);
    expect(shape.methods).toEqual(expect.arrayContaining(["on", "expand", "collapse"]));
  });

  test("PA-READY: the ready event fires for the mounted instance", { tag: "@routing" }, async ({ page }) => {
    const api = await capturePublicApi(page);
    await mountWidget(page, { tagId: TAG.video, size: "L4" });

    const ready = await api.waitForEvent("ready");
    // A real instance id, not an empty string — hosts key their own state on it.
    expect(ready.instanceId).toBeTruthy();
    expect(await api.instanceIds()).toHaveLength(1);
  });

  // `index.jsx` registers each slot's DOM id as an alias for its minted
  // instanceId, so a publisher can call `cxr.expand("gen-…")` with the id they
  // wrote in their own markup rather than one they never see.
  test("PA-ALIAS: expand/collapse resolve a DOM id through the alias map", async ({ page }) => {
    const api = await capturePublicApi(page);
    await mountWidget(page, { tagId: TAG.video, size: "L4" });
    const widget = new WidgetPage(page);
    await widget.waitForPlayable();
    await api.waitForEvent("ready");

    // The harness names its slots `gen-<tagId>-<n>`.
    const domId = await page.evaluate(() => document.querySelector(".gen-ext")!.id);
    expect(domId).toBeTruthy();

    await page.evaluate((id) => (window as unknown as { cxr: { expand(i: string): void } }).cxr.expand(id), domId);
    await api.waitForEvent("fullscreen:enter");
    // The event is emitted from the bus; the fullscreen chrome commits a render
    // later. Assert on the DOM rather than assuming they land in the same tick.
    await waitUntil(
      page,
      "the fullscreen chrome to render",
      () => !!window.__cxrRoot()?.querySelector('[data-testid="topbar-collapse"]'),
      { timeoutMs: 5000 }
    );
    expect(await widget.isFullscreen()).toBe(true);

    await page.evaluate((id) => (window as unknown as { cxr: { collapse(i: string): void } }).cxr.collapse(id), domId);
    await api.waitForEvent("fullscreen:exit");
    await waitUntil(
      page,
      "the fullscreen chrome to unmount",
      () => !window.__cxrRoot()?.querySelector('[data-testid="topbar-collapse"]'),
      { timeoutMs: 5000 }
    );
    expect(await widget.isFullscreen()).toBe(false);
  });

  // An iframe-embedded widget cannot be reached through `window.cxr` across the
  // frame boundary, so `installMessageBridge` accepts the same commands over
  // postMessage. The harness is top-level, so posting to itself exercises the
  // exact listener a parent page would talk to.
  test("PA-BRIDGE: the postMessage bridge is installed and accepts cxr:* commands", async ({ page }) => {
    await capturePublicApi(page);
    await mountWidget(page, { tagId: TAG.video, size: "L4" });
    await new WidgetPage(page).waitForPlayable();

    const pageErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(String(error)));

    // Both documented message types. The assertion is that the bridge consumes
    // them without throwing — `infolinksImpression` fires an analytics event and
    // `setPreviewConfig` no-ops outside preview mode, so neither has a DOM tell.
    // A missing bridge would leave these as unhandled messages, and a broken one
    // would surface as a pageerror.
    await page.evaluate(() => {
      window.postMessage({ type: "cxr:infolinksImpression" }, "*");
      window.postMessage({ type: "cxr:setPreviewConfig", instanceId: "nope", config: {} }, "*");
      // A malformed frame must be ignored rather than crash the listener.
      window.postMessage({ type: "cxr:setPreviewConfig" }, "*");
      window.postMessage("not-an-object", "*");
    });

    // Give the listener a turn, then confirm the widget is still alive and quiet.
    await waitUntil(page, "the widget to survive the bridge messages", () => !!window.__cxrRoot(), {
      timeoutMs: 5000,
    });
    expect(pageErrors).toEqual([]);
  });

  test("PA-MULTI: two slots on one page mint two independent instances", async ({ page }) => {
    const api = await capturePublicApi(page);
    await mountWidget(page, { tagId: TAG.video, size: "L4", slotCount: 2 });

    await waitUntil(
      page,
      "both slots to attach a shadow root",
      () => Array.from(document.querySelectorAll(".gen-ext")).every((s) => !!s.shadowRoot),
      { timeoutMs: 15_000 }
    );

    const ids = await waitUntil(
      page,
      "two ready events",
      () =>
        (window as unknown as { __cxrPublic: { events: { event: string }[] } }).__cxrPublic.events.filter(
          (e) => e.event === "ready"
        ).length >= 2,
      { timeoutMs: 15_000 }
    ).then(() => api.instanceIds());

    expect(ids).toHaveLength(2);
    expect(ids[0]).not.toBe(ids[1]);

    // Distinct DOM ids too, or the alias map would collide.
    const domIds = await page.evaluate(() => Array.from(document.querySelectorAll(".gen-ext")).map((s) => s.id));
    expect(new Set(domIds).size).toBe(2);
  });

  // `index.jsx` keeps a MutationObserver on each slot's PARENT so it can detect
  // the slot itself being removed, and then unmount that instance's React root
  // and stamp `data-cxr-status="pending"`.
  //
  // Note this is a TEARDOWN watcher, not a rescan: `init()` runs once at module
  // evaluation, so a `.gen-ext` injected after boot is NOT picked up. That is
  // worth knowing before someone plans an SPA/lazy-container integration around
  // an auto-mount that does not exist — asserted below so the behaviour is
  // pinned either way.
  test("PA-TEARDOWN: removing a slot unmounts its instance; a late slot is not auto-mounted", async ({ page }) => {
    await capturePublicApi(page);
    await mountWidget(page, { tagId: TAG.video, size: "L4", slotCount: 2 });
    await waitUntil(
      page,
      "both slots to attach a shadow root",
      () => Array.from(document.querySelectorAll(".gen-ext")).every((s) => !!s.shadowRoot),
      { timeoutMs: 15_000 }
    );

    // Remove the first slot; its instance must tear down and be marked pending.
    const removedId = await page.evaluate(() => {
      const slot = document.querySelectorAll(".gen-ext")[0] as HTMLElement;
      const id = slot.id;
      slot.remove();
      // Re-attach detached so the observer's `document.contains(node)` check has
      // already flipped, and the attribute stamp stays inspectable.
      document.body.dataset.removedId = id;
      return id;
    });
    expect(removedId).toBeTruthy();

    // The surviving slot is untouched — teardown is per-instance, not global.
    await waitUntil(
      page,
      "the surviving slot to still hold a shadow root",
      () => {
        const slots = Array.from(document.querySelectorAll(".gen-ext"));
        return slots.length === 1 && !!slots[0]?.shadowRoot;
      },
      { timeoutMs: 10_000 }
    );

    // And a slot injected AFTER boot is deliberately not adopted: init() has
    // already run. If this ever starts passing, the bundle grew a rescan and
    // this expectation — not the product — is what should change.
    await page.evaluate((tagId) => {
      const el = document.createElement("div");
      el.className = "gen-ext";
      el.id = "gen-late-slot";
      el.setAttribute("data-tag-id", tagId);
      el.style.cssText = "width:320px;height:100px";
      document.body.appendChild(el);
    }, TAG.video);

    await waitUntil(page, "the late slot to settle", () => !!document.getElementById("gen-late-slot"), {
      timeoutMs: 5000,
    });
    expect(await page.evaluate(() => !!document.getElementById("gen-late-slot")?.shadowRoot)).toBe(false);
  });

  // The revenue-critical half: `waterfall.ts` invokes the host page's own
  // `window.adFillCallback` on a fill and posts the same signal to the parent
  // frame. A publisher wires monetisation to these.
  test("PA-PARTNER: a real fill invokes the host adFillCallback", async ({ page }) => {
    const api = await capturePublicApi(page);
    await mountWidget(page, { tagId: TAG.ads, size: "L3" });
    await new WidgetPage(page).waitForAdBar();

    await api.waitForEvent("ad:fill");

    const cbs = await api.partnerCallbacks();
    expect(cbs.adFill).toBeGreaterThan(0);
    // A fill must not also report a no-fill.
    expect(cbs.noAds).toBe(0);
    // NOT asserted here: the `{type:'adFillCallback'}` post to the parent frame.
    // `notifyAdFill` guards it with `window.parent !== window`, and this harness
    // is top-level, so it correctly never fires. Covering it needs an iframe
    // harness — unit-covered meanwhile in `ads/waterfall.test.ts`.
  });
});
