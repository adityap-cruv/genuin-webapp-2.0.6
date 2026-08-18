/**
 * L4 — 320×100 banner with a 100px thumbnail player.
 *
 * L4 is the only compact layout that carries BOTH the enticement chrome and a
 * real `<video>`, so it is the one place the icon rules can be corroborated
 * against `video.volume` rather than trusted on the glyph alone. That makes it
 * the home for the audio-engagement strategy family: the cross-slide latch, the
 * audible-start case, and the mute-passback timer.
 *
 * It also owns `feedLoopEnabled` and `suppressedEvents` — both are feed-level
 * behaviours that need a multi-reel video feed to be visible at all.
 *
 *   L4-ROUTE           320×100 → compact bar PLUS a thumbnail player
 *   L4-ENTICEMENT-XS   engagement persists across a slide change
 *   L4-AUDIBLE-START   initialVolume > 0 means no enticement; the FIRST tap mutes
 *   L4-MUTE-PASSBACK   the muted-playback timer passes the slot back, and unmuting cancels it
 *   L4-NO-LOOP         feedLoopEnabled:false makes the last slide a hard stop
 *   L4-SUPPRESSED      suppressedEvents drops listed events, keeps the rest
 *
 * L4 ships to phones, so the whole file runs under `mobile-chrome` too.
 */
import { test, expect } from "@playwright/test";

import { WidgetPage } from "./support/WidgetPage";
import { captureAnalytics } from "./support/analytics";
import { mountWidget, TAG } from "./support/mountWidget";

test.describe("L4 — 320x100 banner + thumbnail player", { tag: "@mobile" }, () => {
  test("L4-ROUTE: 320x100 resolves to the compact bar with a thumbnail player", async ({ page }) => {
    await mountWidget(page, { tagId: TAG.video, size: "L4" });
    const widget = new WidgetPage(page);
    await widget.waitForPlayable();

    const probe = await page.evaluate(() => {
      const host = window.__cxrHost() as HTMLElement;
      const root = window.__cxrRoot() as ShadowRoot;
      return {
        slot: [host.offsetWidth, host.offsetHeight],
        adSizeMeta: document.querySelector('meta[name="ad.size"]')?.getAttribute("content"),
        hasCompactBar: !!root.querySelector('[data-testid="compact-control-bar"]'),
        // Unlike L3, L4 has room for the thumbnail column — a real <video>.
        videoCount: root.querySelectorAll("video").length,
      };
    });

    expect(probe.slot).toEqual([320, 100]);
    expect(probe.adSizeMeta).toBe("width=320,height=100");
    expect(probe.hasCompactBar).toBe(true);
    expect(probe.videoCount).toBeGreaterThan(0);
  });

  // The enticement latch is per-widget-instance, not per-slide, so a slide change
  // must NOT re-show the sound-on glyph over a genuinely muted unit. `videoVolume`
  // is asserted alongside the icon so an enticement cannot masquerade as real.
  test("L4-ENTICEMENT-XS: engagement persists across a slide change", async ({ page }) => {
    await mountWidget(page, { tagId: TAG.video, size: "L4" });
    const widget = new WidgetPage(page);
    await widget.waitForPlayable();

    // Silent load shows the enticement.
    expect((await widget.read()).muteIcon).toBe("unmute.svg");

    // Engage (tap 1 unmutes) then mute (tap 2) — now genuinely muted.
    await widget.tapMute();
    const unmuted = await widget.readVideoState();
    expect(unmuted.muteIcon).toBe("unmute.svg");
    expect(unmuted.videoVolume).toBeGreaterThan(0);

    await widget.tapMute();
    const muted = await widget.readVideoState();
    expect(muted.muteIcon).toBe("mute.svg");
    expect(muted.videoVolume).toBe(0);

    // Swipe: the arrived slide reports the REAL state, not a fresh enticement.
    // Movement is asserted on `feedIndex()` (the feed's real position), NOT on
    // `BarState.activeIndex` — that is an index among the MOUNTED control bars,
    // and `slideMountWindow` keeps only ~2, so the value can legitimately repeat
    // across a genuine advance. It flaked here for exactly that reason.
    const before = await widget.feedIndex();
    const next = await widget.swipeNext();
    expect(await widget.feedIndex()).not.toBe(before);
    expect(next.muteIcon).toBe("mute.svg");

    // And play/pause on the arrived slide still cannot disturb it.
    await widget.waitForPlayable();
    const beforePlay = await widget.read();
    await widget.tapPlay();
    const afterPlay = await widget.read();
    expect(afterPlay.muteIcon).toBe("mute.svg");
    expect(afterPlay.playIcon).not.toBe(beforePlay.playIcon);

    // The toggle still works on the arrived slide — not stuck.
    await widget.tapMute();
    expect((await widget.read()).muteIcon).toBe("unmute.svg");
  });

  // An audible-start unit (`initialVolume: 0.2`) loads genuinely unmuted, so
  // there is no enticement to end and the FIRST tap must MUTE. Getting this
  // backwards is the failure mode the enticement rule invites.
  test("L4-AUDIBLE-START: with initialVolume > 0 the first tap mutes", async ({ page }) => {
    await mountWidget(page, { tagId: TAG.videoAudible, size: "L4" });
    const widget = new WidgetPage(page);
    await widget.waitForPlayable();

    // Genuinely unmuted on load: sound-on icon AND real volume.
    const start = await widget.readVideoState();
    expect(start.muteIcon).toBe("unmute.svg");
    expect(start.videoVolume).toBeGreaterThan(0);

    // First tap mutes (no enticement to burn).
    await widget.tapMute();
    const muted = await widget.readVideoState();
    expect(muted.muteIcon).toBe("mute.svg");
    expect(muted.videoVolume).toBe(0);

    // And back.
    await widget.tapMute();
    const unmuted = await widget.readVideoState();
    expect(unmuted.muteIcon).toBe("unmute.svg");
    expect(unmuted.videoVolume).toBeGreaterThan(0);
  });

  // `mutePassback` is the OTHER audio gate, and the distinction matters:
  // `gateOnUnmute` (L3) suppresses the request while muted, whereas this passes
  // the slot back after a muted-playback timer. Short delay so the test is quick.
  test("L4-MUTE-PASSBACK: the muted-playback timer passes the slot back", async ({ page }) => {
    const events = await captureAnalytics(page);

    await mountWidget(page, {
      tagId: TAG.video,
      size: "L4",
      strategies: { mutePassback: true, mutePassbackDelayMs: 2000, autoplayEnabled: true },
    });
    const widget = new WidgetPage(page);
    await widget.waitForPlayable();

    // Never unmuted → the timer fires and the placement is passed back.
    await events.waitFor("Ad Passback", 25_000);
  });

  test("L4-MUTE-PASSBACK: unmuting before the timer cancels the passback", async ({ page }) => {
    const events = await captureAnalytics(page);

    await mountWidget(page, {
      tagId: TAG.video,
      size: "L4",
      // 8 s, and deliberately NOT shorter. The guard arms on `player:play`, but
      // `waitForPlayable()` only returns once the video is actually playing, so
      // an unknown slice of the window is already spent before the tap below.
      // Trimming this to 3 s made the passback win that race under load and tear
      // the slot down mid-`tapMute` (null host). Costs nothing in wall time
      // either way — the cancel arm never waits the deadline out, only the
      // `expectNever` window below is real time.
      strategies: { mutePassback: true, mutePassbackDelayMs: 8000, autoplayEnabled: true },
    });
    const widget = new WidgetPage(page);
    await widget.waitForPlayable();

    // Engage audio well before the timer would fire.
    await widget.tapMute();
    const unmuted = await widget.readVideoState();
    expect(unmuted.videoVolume).toBeGreaterThan(0);

    // Past the deadline, nothing was passed back. 9 s rather than 12 s: the tap
    // lands ~1-2 s after arming, so this still observes ~1.3x the deadline, and
    // the assertion is only that one `setTimeout` stayed silent — clearing it by
    // a second is as conclusive as clearing it by four.
    await events.expectNever("Ad Passback", 9000);
  });

  // `feedLoopEnabled: false` makes the last slide a hard stop rather than
  // wrapping to slide 0. Loop is the ONLY strategy that defaults ON, so this is
  // the opt-out direction and the one that regresses silently.
  //
  // Asserted on `data-cxr-active-index` (the feed's real position), NOT on a
  // count of rendered layouts: `computeSlideMountWindow` keeps only the active
  // slide plus a neighbour, so the DOM never shows more than ~2 regardless of
  // how far the feed has walked.
  test("L4-NO-LOOP: a finite feed rests on its last slide instead of wrapping", async ({ page }) => {
    test.setTimeout(90_000);

    /**
     * Swipe until the outcome is decided, and report every feed position visited.
     *
     * Two deliberate cost choices — this was the single slowest test in the suite
     * (~50 s per project) before them:
     *
     *   `swipeNext(2)` — the default is 5 retries, which exists because Embla
     *   occasionally swallows a synthetic flick. This test EXPECTS refusals, so
     *   the default made every post-end swipe pay 5 full flick+settle cycles for
     *   a result we already wanted. A genuine advance lands on attempt 1–2.
     *
     *   Early exit — once a looping feed has wrapped, or a finite one has stopped
     *   moving, further swipes cannot change the assertion.
     */
    const walk = async (feedLoopEnabled: boolean, maxSwipes: number): Promise<number[]> => {
      await mountWidget(page, { tagId: TAG.video, size: "L4", strategies: { feedLoopEnabled } });
      const widget = new WidgetPage(page);
      await widget.waitForPlayable();

      const visited = [await widget.feedIndex()];
      // Both exits are gated on having advanced at least once. Without that, a
      // single swallowed flick ends the walk immediately — which would fail the
      // finite arm outright and, worse, pass the looping arm VACUOUSLY (it never
      // left 0, so "0 was revisited" is trivially true).
      let advanced = false;
      // Two CONSECUTIVE no-moves means the hard stop, not a swallowed flick:
      // each swipeNext already retries twice internally, so this is four failed
      // flicks in a row. Bounded on purpose — an earlier version confirmed with
      // the full 5-retry budget and could fire that repeatedly, which pushed the
      // worst case to ~56 flicks (1.6 min).
      let stalls = 0;

      for (let i = 0; i < maxSwipes; i++) {
        await widget.swipeNext(2).catch(() => undefined);
        const previous = visited[visited.length - 1];
        const index = await widget.feedIndex();
        visited.push(index);

        if (index !== previous) {
          advanced = true;
          stalls = 0;
          if (feedLoopEnabled && index === 0) break; // wrapped last→first
          continue;
        }
        if (!advanced) continue; // swallowed flick before we ever moved
        if (++stalls >= 2) break;
      }
      return visited;
    };

    // Cap of 14 for a 6-reel fixture. Both arms exit early — the finite one on
    // two consecutive stalls, the looping one the moment it wraps — so the extra
    // budget is free in the happy path (~6 advances) and only consumed when
    // Embla swallows flicks. A cap of 8 flaked exactly there: six swallowed
    // flicks left the looping arm resting on the last slide, never revisiting 0.
    const finite = await walk(false, 14);
    // It climbed, then came to rest — and never returned to 0 once past it.
    expect(Math.max(...finite)).toBeGreaterThan(0);
    expect(finite.at(-1)).toBe(Math.max(...finite));
    expect(finite.slice(1)).not.toContain(0);

    // Same feed, looping: it wraps last→first, so 0 is visited again.
    const looping = await walk(true, 14);
    expect(looping.slice(1)).toContain(0);
  });

  // `suppressedEvents` is a per-tag drop list applied at the single
  // `AnalyticsProvider.sendEvent` choke point. Asserted as a DELTA across two
  // mounts of the SAME tag: without the delta, a dead analytics pipeline would
  // read as a pass.
  //
  // Note this is the one strategy that does NOT flow through `StrategyProvider`:
  // `AnalyticsProvider` sits deliberately ABOVE it in the tree, so it resolves
  // via `getSuppressedEvents(tagId)`, which is routed through the same
  // localhost-only test seam for exactly this reason.
  test("L4-SUPPRESSED: a listed event is dropped while the rest still fire", async ({ page }) => {
    const events = await captureAnalytics(page);

    /** Swipe once, then report which events reached `rudderanalytics.track`. */
    const namesAfterSwipe = async (suppressed: string[]): Promise<string[]> => {
      await mountWidget(page, {
        tagId: TAG.video,
        size: "L4",
        ...(suppressed.length > 0 ? { strategies: { suppressedEvents: suppressed } } : {}),
      });
      const widget = new WidgetPage(page);
      await widget.waitForPlayable();
      await widget.swipeNext();
      // The buffer flushes in batches; give it room rather than reading raw.
      await events.waitFor("Feed API Call Completed", 20_000);
      return (await events.all()).map((e) => e.name);
    };

    // Control: nothing suppressed — the swipe emits `Swipe Next`.
    const unsuppressed = await namesAfterSwipe([]);
    expect(unsuppressed).toContain("Swipe Next");
    // A control event that must survive suppression in the arm below.
    expect(unsuppressed).toContain("Feed API Call Completed");

    // Same tag + same gesture, with the event listed: it never reaches the wire,
    // and the unlisted control still does.
    const suppressed = await namesAfterSwipe(["Swipe Next"]);
    expect(suppressed).not.toContain("Swipe Next");
    expect(suppressed).toContain("Feed API Call Completed");
  });
});
