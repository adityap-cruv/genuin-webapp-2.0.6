/**
 * Page object for the widget, piercing its shadow root.
 *
 * Covers every chrome rather than one layout: `read`/`tapPlay`/`tapMute` are
 * scoped to the CompactControlBar (L3/L4), while the `*Anywhere` methods and the
 * fullscreen helpers work against the default banner chrome (L1/L2/L5) and the
 * fullscreen rail too. The shadow root is resolved through `window.__cxrRoot()`
 * so the stacked variant — where the root moves onto the `stacked-top` row —
 * resolves as well; see ./shadow.ts.
 *
 * Icons are asserted by asset filename — `unmute.svg` is the sound-on icon
 * (shown for perceived-unmuted, including the enticement), `mute.svg` is the
 * muted icon. Reads corroborate against the active slide's `<video>.volume`,
 * mirroring the dual check used while diagnosing the bugs by hand.
 *
 * Taps are real input events, dispatched through the touchscreen under a
 * touch-enabled context (`mobile-chrome`) and the mouse otherwise, so they fire
 * the App-root `onPointerDownCapture` — the exact path that used to wrongly flip
 * the mute icon on a play/pause tap.
 */
import type { Page } from "@playwright/test";

import { pollUntil, waitUntil } from "./poll";

/** Sound-on / muted icon filenames the buttons render. */
export type MuteIcon = "unmute.svg" | "mute.svg" | null;
export type PlayIcon = "play.svg" | "pause.svg" | null;

/** Snapshot of the active slide's control + media state. */
export interface BarState {
  /** Index of the active slide among all rendered control bars. */
  activeIndex: number;
  barCount: number;
  muteIcon: MuteIcon;
  playIcon: PlayIcon;
  /** Active slide's `<video>.volume`, or null when no video (audio-ad slot). */
  videoVolume: number | null;
}

export class WidgetPage {
  constructor(private readonly page: Page) {}

  /** Cached `hasTouch` for this context — the answer cannot change mid-test. */
  private touchCapable: boolean | undefined;

  /**
   * Real input event at viewport coordinates.
   *
   * Under `mobile-chrome` the context has `hasTouch`, so this dispatches a real
   * `touchstart`/`touchend` pair rather than a mouse click. That is the whole
   * point of running the phone formats under a touch device: a mouse click still
   * *works* in Chromium with touch enabled, which is why the suite could claim
   * mobile coverage while never exercising a touch handler.
   */
  private async tapAt(x: number, y: number): Promise<void> {
    this.touchCapable ??= await this.page.evaluate(() => "ontouchstart" in window || navigator.maxTouchPoints > 0);
    if (this.touchCapable) {
      await this.page.touchscreen.tap(x, y);
      return;
    }
    await this.page.mouse.click(x, y);
  }

  /**
   * Mute-icon filename from the *first visible* mute button anywhere in the
   * widget — works across every chrome (compact bar, default top bar, fullscreen
   * rail), unlike `read()` which is scoped to the compact control bar. Use for
   * size variants (L1/L2) and fullscreen, where there is no compact-control-bar.
   */
  async muteIconAnywhere(): Promise<MuteIcon> {
    return this.page.evaluate(() => {
      const root = window.__cxrRoot();
      const btns = Array.from(root?.querySelectorAll('[data-testid="mute-btn"]') ?? []);
      const visible = btns.find((b) => {
        const r = (b as HTMLElement).getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      });
      const img = visible?.querySelector("img") as HTMLImageElement | null;
      return (img ? (img.getAttribute("src")?.split("/").pop() ?? null) : null) as MuteIcon;
    });
  }

  /**
   * Wait for the visible mute icon to reach `expected`, then return what it
   * actually is. Best-effort: on timeout it returns the current icon so the
   * caller's own assertion produces the diff.
   *
   * For an audible-start unit the bar can render (gated on `isAdReady`) a beat
   * before the SDK reports its volume, so the icon is briefly `mute.svg`. This
   * turns that race into a bounded wait rather than a sleep.
   */
  async waitForMuteIcon(expected: NonNullable<MuteIcon>, timeoutMs = 4000): Promise<MuteIcon> {
    await pollUntil(
      this.page,
      (want: string) => {
        const root = window.__cxrRoot();
        const btns = Array.from(root?.querySelectorAll('[data-testid="mute-btn"]') ?? []);
        const visible = btns.find((b) => {
          const r = (b as HTMLElement).getBoundingClientRect();
          return r.width > 0 && r.height > 0;
        });
        const img = visible?.querySelector("img") as HTMLImageElement | null;
        return (img?.getAttribute("src")?.split("/").pop() ?? null) === want;
      },
      { timeoutMs, arg: expected }
    );
    return this.muteIconAnywhere();
  }

  /** Click the first visible control with the given testid (chrome-agnostic). */
  private async tapTestid(testid: string): Promise<boolean> {
    const p = await this.page.evaluate((id) => {
      const root = window.__cxrRoot();
      const els = Array.from(root?.querySelectorAll(`[data-testid="${id}"]`) ?? []);
      const vis = els.find((e) => {
        const r = (e as HTMLElement).getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      });
      if (!vis) return null;
      const r = (vis as HTMLElement).getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }, testid);
    if (!p) return false;
    const before = await this.sampleShape();
    await this.tapAt(p.x, p.y);
    // Wait for the tap to visibly land before settling. Stability alone is not
    // enough: if nothing has changed yet, two samples agree immediately and we
    // would return sooner than the old fixed delay did. Best-effort — some taps
    // legitimately leave the compact bar's fingerprint untouched.
    const deadline = Date.now() + 1500;
    while (Date.now() < deadline) {
      if ((await this.sampleShape()) !== before) break;
      await new Promise((resolve) => setTimeout(resolve, 60));
    }
    await this.waitForStable();
    return true;
  }

  /** Tap the first visible mute button anywhere (chrome-agnostic). */
  async tapMuteAnywhere(): Promise<boolean> {
    return this.tapTestid("mute-btn");
  }

  /** Tap the first visible play/pause button anywhere (chrome-agnostic). */
  async tapPlayAnywhere(): Promise<boolean> {
    return this.tapTestid("play-pause-btn");
  }

  /** Tap the expand control to enter fullscreen. Returns true if a button was hit. */
  async tapExpand(): Promise<boolean> {
    const hit = await this.tapTestid("topbar-expand");
    if (hit) await this.waitForFullscreen(true);
    return hit;
  }

  /** Tap the collapse control to exit fullscreen. */
  async tapCollapse(): Promise<boolean> {
    const hit = await this.tapTestid("topbar-collapse");
    if (hit) await this.waitForFullscreen(false);
    return hit;
  }

  /**
   * Wait for the fullscreen chrome to appear or disappear. The swap replaces the
   * whole control layer, so it is the transition the caller actually cares about
   * — not merely "the DOM stopped moving". Best-effort on timeout, so the
   * caller's own `expect(isFullscreen())` still produces the diff.
   */
  private async waitForFullscreen(want: boolean, timeoutMs = 4000): Promise<void> {
    await pollUntil(
      this.page,
      (expected: boolean) => {
        const root = window.__cxrRoot();
        return !!root?.querySelector('[data-testid="topbar-collapse"]') === expected;
      },
      { timeoutMs, arg: want }
    );
    await this.waitForStable();
  }

  /** Whether the fullscreen layout is currently shown (collapse control present). */
  async isFullscreen(): Promise<boolean> {
    return this.page.evaluate(() => {
      const root = window.__cxrRoot();
      return !!root?.querySelector('[data-testid="topbar-collapse"]');
    });
  }

  /**
   * Wait for the ad control bar to render — i.e. the REAL GenAd waterfall has
   * filled the active slot (the bar is gated on `isAdReady`). Throws on timeout:
   * a genuine no-fill is a real failure for the QA ad config we test against.
   */
  async waitForAdBar(timeoutMs = 20_000): Promise<void> {
    await waitUntil(
      this.page,
      "the ad control bar to render (waterfall fill)",
      () => !!window.__cxrRoot()?.querySelector('[data-testid="compact-control-bar"]'),
      { timeoutMs }
    );
    await this.waitForStable();
  }

  /**
   * Wait for a real GenAd slot to mount — the chrome-agnostic fill signal.
   *
   * Use this instead of {@link waitForAdBar} on the full-player layouts
   * (L1/L2/L5): the ad there renders under `DefaultTopBar`, never a
   * `compact-control-bar`, so the bar wait would time out on a slot that filled
   * perfectly well.
   */
  async waitForAdSlot(timeoutMs = 25_000): Promise<void> {
    await waitUntil(
      this.page,
      "a GenAd slot to mount (waterfall fill)",
      // GenAdSlot mints `gen-ad-slot-<instance>-<adId>` once the SDK has a slot.
      () => !!window.__cxrRoot()?.querySelector('[id^="gen-ad-slot-"]'),
      { timeoutMs }
    );
    await this.waitForStable();
  }

  /**
   * Wait for the carousel to advance off `fromIndex` — ad feeds advance when the
   * REAL ad completes (≈15–30s); they do not respond to swipe. Returns the new
   * active slide index. Throws on timeout.
   *
   * The active slide is detected geometrically (which layout sits inside the host
   * box), so a mid-transition frame can transiently place a neighbour there while
   * Embla is still animating. Under CPU contention that frame is what the poll
   * catches, and the index snaps back to `fromIndex` by the time it is re-read —
   * so the change is confirmed AFTER the animation settles, and a snap-back just
   * resumes waiting until the deadline.
   */
  async waitForAdvance(fromIndex: number, timeoutMs = 45_000): Promise<number> {
    const deadline = Date.now() + timeoutMs;
    for (;;) {
      await waitUntil(
        this.page,
        `the carousel to advance off slide ${fromIndex}`,
        (prev: number) => {
          const host = window.__cxrHost() as HTMLElement;
          const root = window.__cxrRoot();
          if (!root) return false;
          const hostRect = host.getBoundingClientRect();
          const slides = Array.from(root.querySelectorAll('[data-testid="ad-layout"], [data-testid="video-layout"]'));
          const idx = slides.findIndex((s) => {
            const r = s.getBoundingClientRect();
            return (
              r.width > 0 &&
              r.left >= hostRect.left - 5 &&
              r.right <= hostRect.right + 5 &&
              r.top >= hostRect.top - 5 &&
              r.bottom <= hostRect.bottom + 5
            );
          });
          return idx !== prev && idx !== -1;
        },
        { timeoutMs: Math.max(0, deadline - Date.now()), arg: fromIndex }
      );

      await this.waitForStable();
      const settled = await this.activeSlideIndex();
      if (settled !== fromIndex && settled !== -1) return settled;

      if (Date.now() >= deadline) {
        throw new Error(`Carousel left slide ${fromIndex} mid-transition but settled back on it within ${timeoutMs}ms`);
      }
    }
  }

  /**
   * TRUE active position within the feed, from `data-cxr-active-index`.
   *
   * Prefer this over {@link activeSlideIndex}, which is an index among the
   * MOUNTED layouts — `computeSlideMountWindow` keeps only the active slide plus
   * a neighbour, so that value never exceeds 1 however far the feed has walked
   * and cannot distinguish "advanced" from "the mount window shifted".
   *
   * @returns The active index, or -1 when the feed has not mounted.
   */
  async feedIndex(): Promise<number> {
    return this.page.evaluate(() => {
      const el = window.__cxrRoot()?.querySelector("[data-cxr-active-index]");
      const raw = el?.getAttribute("data-cxr-active-index");
      return raw === null || raw === undefined ? -1 : Number(raw);
    });
  }

  /** Index of the active slide among all slide layouts (ads + video). */
  async activeSlideIndex(): Promise<number> {
    return this.page.evaluate(() => {
      const host = window.__cxrHost() as HTMLElement;
      const root = window.__cxrRoot();
      if (!root) return -1;
      const hostRect = host.getBoundingClientRect();
      const slides = Array.from(root.querySelectorAll('[data-testid="ad-layout"], [data-testid="video-layout"]'));
      return slides.findIndex((s) => {
        const r = s.getBoundingClientRect();
        return (
          r.width > 0 &&
          r.left >= hostRect.left - 5 &&
          r.right <= hostRect.right + 5 &&
          r.top >= hostRect.top - 5 &&
          r.bottom <= hostRect.bottom + 5
        );
      });
    });
  }

  /**
   * Tap the ad creative surface itself (not a control button) — the gesture
   * that fires the ad's `handleAdClick` → `ad:unmuteRequest`. Clicks the
   * top-left of the active ad-layout, away from the right-side control cluster.
   */
  async tapAdSurface(): Promise<void> {
    const p = await this.page.evaluate(() => {
      const host = window.__cxrHost() as HTMLElement;
      const root = window.__cxrRoot()!;
      const hostRect = host.getBoundingClientRect();
      const slides = Array.from(root.querySelectorAll('[data-testid="ad-layout"]'));
      const active =
        slides.find((s) => {
          const r = s.getBoundingClientRect();
          return (
            r.width > 0 &&
            r.left >= hostRect.left - 5 &&
            r.right <= hostRect.right + 5 &&
            r.top >= hostRect.top - 5 &&
            r.bottom <= hostRect.bottom + 5
          );
        }) ?? slides[0];
      const r = active!.getBoundingClientRect();
      // Top-left quadrant — the GenAd thumbnail area, clear of the controls.
      return { x: r.left + r.width * 0.15, y: r.top + r.height * 0.3 };
    });
    await this.tapAt(p.x, p.y);
    await this.waitForStable();
  }

  /**
   * Read the active slide's icon + media state. "Active" = the rendered bar
   * whose box sits within the host viewport (Embla keeps siblings mounted).
   */
  async read(): Promise<BarState> {
    return this.page.evaluate(() => {
      const host = window.__cxrHost() as HTMLElement;
      const root = window.__cxrRoot()!;
      const hostRect = host.getBoundingClientRect();
      const bars = Array.from(root.querySelectorAll('[data-testid="compact-control-bar"]'));
      // Most-visible bar, NOT the first fully-contained one. Full containment
      // cannot match while Embla is animating, and the old `?? bars[0]` fallback
      // then silently read a neighbour: its mute icon looks right (mute state is
      // global) but its slide has no <video> under active-slide-only startLoad,
      // so videoVolume came back null. Keep in sync with `centerOf`.
      const overlap = (el: Element) => {
        const r = el.getBoundingClientRect();
        const w = Math.max(0, Math.min(r.right, hostRect.right) - Math.max(r.left, hostRect.left));
        const h = Math.max(0, Math.min(r.bottom, hostRect.bottom) - Math.max(r.top, hostRect.top));
        return w * h;
      };
      let active: Element | undefined;
      let bestArea = -1;
      for (const el of bars) {
        const area = overlap(el);
        if (area > bestArea) {
          bestArea = area;
          active = el;
        }
      }
      const file = (sel: string): string | null => {
        const img = active?.querySelector(`${sel} img`) as HTMLImageElement | null;
        return img ? (img.getAttribute("src")?.split("/").pop() ?? null) : null;
      };
      const slide = active?.closest('[data-testid="ad-layout"], [data-testid="video-layout"]');
      const vid = slide?.querySelector("video") as HTMLVideoElement | null;
      return {
        activeIndex: active ? bars.indexOf(active) : -1,
        barCount: bars.length,
        muteIcon: file('[data-testid="mute-btn"]') as MuteIcon,
        playIcon: file('[data-testid="play-pause-btn"]') as PlayIcon,
        videoVolume: vid ? vid.volume : null,
      };
    });
  }

  /** Viewport-center coords of a control on the active slide. */
  private async centerOf(testid: string): Promise<{ x: number; y: number }> {
    return this.page.evaluate((id) => {
      const host = window.__cxrHost() as HTMLElement;
      const root = window.__cxrRoot()!;
      const hostRect = host.getBoundingClientRect();
      const bars = Array.from(root.querySelectorAll('[data-testid="compact-control-bar"]'));
      // Most-visible bar (2-D overlap with the host box), so a mid-transition
      // frame aims at the slide the user sees rather than an arbitrary sibling.
      // The reel scrolls vertically, so the area test must consider both axes.
      // Keep in sync with `read`.
      const overlap = (el: Element) => {
        const r = el.getBoundingClientRect();
        const w = Math.max(0, Math.min(r.right, hostRect.right) - Math.max(r.left, hostRect.left));
        const h = Math.max(0, Math.min(r.bottom, hostRect.bottom) - Math.max(r.top, hostRect.top));
        return w * h;
      };
      let active: Element | undefined;
      let bestArea = -1;
      for (const bar of bars) {
        const area = overlap(bar);
        if (area > bestArea) {
          bestArea = area;
          active = bar;
        }
      }
      const el = active!.querySelector(`[data-testid="${id}"]`) as HTMLElement;
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }, testid);
  }

  /**
   * Real pointer click on the active slide's play/pause control, then wait for
   * the icon to actually flip. A swallowed tap throws here rather than surfacing
   * as a puzzling assertion failure further down the test — the same principle
   * `swipeNext` already applies to a swallowed flick.
   */
  async tapPlay(): Promise<void> {
    const before = await this.read();
    const p = await this.centerOf("play-pause-btn");
    await this.tapAt(p.x, p.y);
    await this.waitForChange("the play/pause icon to flip", (now) => now.playIcon !== before.playIcon);
  }

  /**
   * Real pointer click on the active slide's mute control, then wait for the
   * state to actually move.
   *
   * The observable differs per transition, which is why this cannot just watch
   * the icon: the enticement → audible tap leaves the icon on `unmute.svg` and
   * only raises `videoVolume`, while audible → muted moves both. So accept
   * either signal.
   */
  async tapMute(): Promise<void> {
    const before = await this.read();
    const p = await this.centerOf("mute-btn");
    await this.tapAt(p.x, p.y);
    await this.waitForChange(
      "the mute icon or video volume to change",
      (now) => now.muteIcon !== before.muteIcon || now.videoVolume !== before.videoVolume
    );
  }

  /**
   * Poll `read()` until `predicate` holds, then let the DOM settle. Throws with
   * the full DOM shape if the change never lands, so a swallowed gesture is
   * self-explaining.
   */
  private async waitForChange(
    what: string,
    predicate: (state: BarState) => boolean,
    timeoutMs = 4000,
    intervalMs = 80
  ): Promise<void> {
    const deadline = Date.now() + timeoutMs;
    for (;;) {
      if (predicate(await this.read())) break;
      if (Date.now() >= deadline) {
        throw new Error(`Timed out after ${timeoutMs}ms waiting for ${what}.\n` + (await this.describeDom()));
      }
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
    await this.waitForStable();
  }

  /**
   * Advance one slide via a synthetic pointer flick. Embla needs drag velocity
   * and the flick is occasionally swallowed, so retry (alternating vertical /
   * horizontal axis) until the active slide index actually changes. Throws if
   * it never advances — a swallowed swipe must fail loudly, not silently assert
   * against the same slide.
   */
  async swipeNext(maxAttempts = 5): Promise<BarState> {
    const startIndex = await this.activeSlideIndex();
    const host = await this.page.evaluate(() => {
      const r = (window.__cxrHost() as HTMLElement).getBoundingClientRect();
      return { x: r.left, y: r.top, w: r.width, h: r.height };
    });
    const flick = async (vertical: boolean) => {
      const cx = host.x + host.w * 0.4;
      const cy = host.y + host.h / 2;
      if (vertical) {
        await this.page.mouse.move(cx, host.y + host.h - 8);
        await this.page.mouse.down();
        await this.page.mouse.move(cx, host.y + host.h * 0.5, { steps: 6 });
        await this.page.mouse.move(cx, host.y - host.h, { steps: 6 });
      } else {
        await this.page.mouse.move(host.x + host.w * 0.4, cy);
        await this.page.mouse.down();
        await this.page.mouse.move(host.x + host.w * 0.2, cy, { steps: 4 });
        await this.page.mouse.move(host.x - host.w, cy, { steps: 6 });
      }
      await this.page.mouse.up();
      // Embla animates the snap; wait for the geometry to stop moving rather
      // than guessing a duration. A swallowed flick reads as stable at once,
      // so the retry below fires sooner than the old fixed 900ms allowed.
      await this.waitForStable();
    };

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await flick(attempt % 2 === 0);
      if ((await this.activeSlideIndex()) !== startIndex) {
        // CompactBar.read()'s activeIndex is among rendered bars; align it to
        // the slide we actually landed on by reading once more after settle.
        return this.read();
      }
    }
    throw new Error(`swipeNext: carousel did not advance after ${maxAttempts} attempts`);
  }

  /**
   * Wait for the active slide's video to be playable. A mute tap that unmutes
   * a not-yet-ready video trips the autoplay-blocked fallback, which re-mutes
   * to volume 0 — so audio-action assertions must wait for readiness first.
   * Ad slots have no video element, so the readiness check is a no-op for them
   * and only the settle applies.
   */
  async waitForPlayable(timeoutMs = 4000): Promise<void> {
    // Best-effort — a slot whose media never becomes ready falls through to
    // whatever state we have, and the test's own assertions report the problem.
    await pollUntil(
      this.page,
      () => {
        const vid = window.__cxrRoot()?.querySelector("video") as HTMLVideoElement | null;
        // No video (ad slot) → nothing to wait for. Otherwise need HAVE_CURRENT_DATA+.
        return !vid || vid.readyState >= 2;
      },
      { timeoutMs }
    );
    await this.waitForStable();
  }

  /**
   * Read, waiting for the active slide to actually have a `<video>`.
   *
   * `read()` reports `videoVolume: null` both for a legitimately video-less slot
   * (audio ad) and for "the player is not mounted yet", so a caller asserting on
   * the volume gets an opaque `expected 0, received null`. This waits for the
   * element and, if it never appears, throws with the DOM shape attached — the
   * failure names its own cause instead of pointing at the assertion line.
   */
  async readVideoState(timeoutMs = 5000, intervalMs = 100): Promise<BarState> {
    const deadline = Date.now() + timeoutMs;
    for (;;) {
      const state = await this.read();
      if (state.videoVolume !== null) return state;
      if (Date.now() >= deadline) {
        throw new Error(
          `No <video> on the active slide after ${timeoutMs}ms, so videoVolume reads null.\n` +
            (await this.describeDom())
        );
      }
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
  }

  /**
   * Dump of what the widget's DOM actually looks like, for failure messages.
   * Deliberately verbose: the CI-only failures in this suite are not reproducible
   * locally, and traces do not survive the artifact-storage quota, so the log line
   * is the only diagnostic that reliably comes back.
   */
  async describeDom(): Promise<string> {
    return this.page.evaluate(() => {
      const host = window.__cxrHost();
      if (!host) return "  .gen-ext host is absent";
      const root = window.__cxrRoot();
      if (!root) return "  host has no shadowRoot";
      const hostRect = host.getBoundingClientRect();
      const box = (r: DOMRect) =>
        `${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}`;
      const bars = Array.from(root.querySelectorAll('[data-testid="compact-control-bar"]'));
      const lines = [
        `  host: ${box(hostRect)}`,
        `  bars: ${bars.length}`,
        ...bars.map((b, i) => {
          const r = b.getBoundingClientRect();
          const w = Math.max(0, Math.min(r.right, hostRect.right) - Math.max(r.left, hostRect.left));
          const h = Math.max(0, Math.min(r.bottom, hostRect.bottom) - Math.max(r.top, hostRect.top));
          const slide = b.closest('[data-testid="ad-layout"], [data-testid="video-layout"]');
          const icon = (sel: string) =>
            (b.querySelector(`${sel} img`) as HTMLImageElement | null)?.getAttribute("src")?.split("/").pop() ?? "none";
          return (
            `    bar#${i}: ${box(r)} overlap=${Math.round(w * h)} ` +
            `slide=${slide?.getAttribute("data-testid") ?? "none"} ` +
            `video=${!!slide?.querySelector("video")} ` +
            `mute=${icon('[data-testid="mute-btn"]')} play=${icon('[data-testid="play-pause-btn"]')}`
          );
        }),
      ];
      const videos = Array.from(root.querySelectorAll("video")) as HTMLVideoElement[];
      lines.push(`  <video> in shadow root: ${videos.length}`);
      videos.forEach((v, i) => {
        lines.push(
          `    video#${i}: readyState=${v.readyState} paused=${v.paused} volume=${v.volume} ` +
            `muted=${v.muted} networkState=${v.networkState} error=${v.error?.code ?? "none"} ` +
            `src=${v.currentSrc ? "set" : "empty"} ${box(v.getBoundingClientRect())}`
        );
      });
      const brk = root.querySelector('[data-testid="fullscreen-ad-break"]') as HTMLElement | null;
      lines.push(
        `  fullscreen-ad-break: ${brk ? `mounted opacity=${brk.style.opacity || "?"}` : "not mounted"}`,
        `  slide layouts: ${root.querySelectorAll('[data-testid="ad-layout"], [data-testid="video-layout"]').length}`,
        `  placeholders: ${root.querySelectorAll('[data-testid="reel-slide-placeholder"]').length}`
      );
      return lines.join("\n");
    });
  }

  /**
   * Wait until the widget stops changing: two consecutive samples of the bar
   * geometry, icons and media state agree.
   *
   * Replaces the fixed `page.waitForTimeout` this page object used to call
   * `settle()` — banned repo-wide, and a constant delay is exactly the wrong
   * tool here: it is dead time on a fast machine and too short on a loaded CI
   * runner. Best-effort by design; on timeout it returns and lets the caller's
   * assertion produce the diff.
   */
  private async waitForStable(timeoutMs = 3000, intervalMs = 80): Promise<void> {
    const deadline = Date.now() + timeoutMs;
    let previous = await this.sampleShape();
    for (;;) {
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
      const next = await this.sampleShape();
      if (next === previous) return;
      previous = next;
      if (Date.now() >= deadline) return;
    }
  }

  /**
   * Compact fingerprint of everything `waitForStable` watches. Excludes anything
   * that changes during normal playback (currentTime), so a playing video still
   * reads as stable.
   */
  private async sampleShape(): Promise<string> {
    return this.page.evaluate(() => {
      const host = window.__cxrHost();
      const root = window.__cxrRoot();
      if (!host || !root) return "no-host";
      const bars = Array.from(root.querySelectorAll('[data-testid="compact-control-bar"]'));
      const parts = bars.map((b) => {
        const r = b.getBoundingClientRect();
        const icon = (sel: string) =>
          (b.querySelector(`${sel} img`) as HTMLImageElement | null)?.getAttribute("src")?.split("/").pop() ?? "-";
        const slide = b.closest('[data-testid="ad-layout"], [data-testid="video-layout"]');
        const vid = slide?.querySelector("video") as HTMLVideoElement | null;
        return [
          Math.round(r.left),
          Math.round(r.top),
          Math.round(r.width),
          icon('[data-testid="mute-btn"]'),
          icon('[data-testid="play-pause-btn"]'),
          vid ? vid.volume : "novid",
          vid ? vid.paused : "-",
        ].join(":");
      });
      return `${bars.length}|${parts.join("|")}`;
    });
  }
}
