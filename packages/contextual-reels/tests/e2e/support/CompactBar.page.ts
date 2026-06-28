/**
 * Page object for the compact control bar (320×100 / 320×50), piercing the
 * widget's shadow root.
 *
 * Icons are asserted by asset filename — `unmute.svg` is the sound-on icon
 * (shown for perceived-unmuted, including the enticement), `mute.svg` is the
 * muted icon. Reads corroborate against the active slide's `<video>.volume`,
 * mirroring the dual check used while diagnosing the bugs by hand.
 *
 * Taps go through real pointer clicks (`page.mouse.click`) so they fire the
 * App-root `onPointerDownCapture` — the exact path that used to wrongly flip
 * the mute icon on a play/pause tap.
 */
import type { Page } from "@playwright/test";

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

export class CompactBar {
  constructor(private readonly page: Page) {}

  /**
   * Mute-icon filename from the *first visible* mute button anywhere in the
   * widget — works across every chrome (compact bar, default top bar, fullscreen
   * rail), unlike `read()` which is scoped to the compact control bar. Use for
   * size variants (L1/L2) and fullscreen, where there is no compact-control-bar.
   */
  async muteIconAnywhere(): Promise<MuteIcon> {
    return this.page.evaluate(() => {
      const root = document.querySelector(".gen-ext")?.shadowRoot;
      const btns = Array.from(root?.querySelectorAll('[data-testid="mute-btn"]') ?? []);
      const visible = btns.find((b) => {
        const r = (b as HTMLElement).getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      });
      const img = visible?.querySelector("img") as HTMLImageElement | null;
      return (img ? (img.getAttribute("src")?.split("/").pop() ?? null) : null) as MuteIcon;
    });
  }

  /** Click the first visible control with the given testid (chrome-agnostic). */
  private async tapTestid(testid: string): Promise<boolean> {
    const p = await this.page.evaluate((id) => {
      const root = document.querySelector(".gen-ext")?.shadowRoot;
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
    await this.page.mouse.click(p.x, p.y);
    await this.settle();
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
    return this.tapTestid("topbar-expand");
  }

  /** Tap the collapse control to exit fullscreen. */
  async tapCollapse(): Promise<boolean> {
    return this.tapTestid("topbar-collapse");
  }

  /** Whether the fullscreen layout is currently shown (collapse control present). */
  async isFullscreen(): Promise<boolean> {
    return this.page.evaluate(() => {
      const root = document.querySelector(".gen-ext")?.shadowRoot;
      return !!root?.querySelector('[data-testid="topbar-collapse"]');
    });
  }

  /**
   * Wait for the ad control bar to render — i.e. the REAL GenAd waterfall has
   * filled the active slot (the bar is gated on `isAdReady`). Throws on timeout:
   * a genuine no-fill is a real failure for the QA ad config we test against.
   */
  async waitForAdBar(timeoutMs = 20_000): Promise<void> {
    await this.page.waitForFunction(
      () => !!document.querySelector(".gen-ext")?.shadowRoot?.querySelector('[data-testid="compact-control-bar"]'),
      { timeout: timeoutMs }
    );
    await this.settle(400);
  }

  /**
   * Wait for the carousel to advance off `fromIndex` — ad feeds advance when the
   * REAL ad completes (≈15–30s); they do not respond to swipe. Returns the new
   * active slide index. Throws on timeout.
   */
  async waitForAdvance(fromIndex: number, timeoutMs = 45_000): Promise<number> {
    await this.page.waitForFunction(
      (prev) => {
        const host = document.querySelector(".gen-ext") as HTMLElement;
        const root = host?.shadowRoot;
        if (!root) return false;
        const hostRect = host.getBoundingClientRect();
        const slides = Array.from(root.querySelectorAll('[data-testid="ad-layout"], [data-testid="video-layout"]'));
        const idx = slides.findIndex((s) => {
          const r = s.getBoundingClientRect();
          return r.width > 0 && r.left >= hostRect.left - 5 && r.right <= hostRect.right + 5 &&
            r.top >= hostRect.top - 5 && r.bottom <= hostRect.bottom + 5;
        });
        return idx !== prev && idx !== -1;
      },
      fromIndex,
      { timeout: timeoutMs }
    );
    await this.settle(400);
    return this.activeSlideIndex();
  }

  /** Index of the active slide among all slide layouts (ads + video). */
  async activeSlideIndex(): Promise<number> {
    return this.page.evaluate(() => {
      const host = document.querySelector(".gen-ext") as HTMLElement;
      const root = host?.shadowRoot;
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
      const host = document.querySelector(".gen-ext") as HTMLElement;
      const root = host.shadowRoot!;
      const hostRect = host.getBoundingClientRect();
      const slides = Array.from(root.querySelectorAll('[data-testid="ad-layout"]'));
      const active = slides.find((s) => {
        const r = s.getBoundingClientRect();
        return r.width > 0 && r.left >= hostRect.left - 5 && r.right <= hostRect.right + 5 &&
          r.top >= hostRect.top - 5 && r.bottom <= hostRect.bottom + 5;
      }) ?? slides[0];
      const r = active!.getBoundingClientRect();
      // Top-left quadrant — the GenAd thumbnail area, clear of the controls.
      return { x: r.left + r.width * 0.15, y: r.top + r.height * 0.3 };
    });
    await this.page.mouse.click(p.x, p.y);
    await this.settle();
  }

  /**
   * Read the active slide's icon + media state. "Active" = the rendered bar
   * whose box sits within the host viewport (Embla keeps siblings mounted).
   */
  async read(): Promise<BarState> {
    return this.page.evaluate(() => {
      const host = document.querySelector(".gen-ext") as HTMLElement;
      const root = host.shadowRoot!;
      const hostRect = host.getBoundingClientRect();
      const bars = Array.from(root.querySelectorAll('[data-testid="compact-control-bar"]'));
      const inView = (el: Element) => {
        const r = el.getBoundingClientRect();
        return (
          r.width > 0 &&
          r.left >= hostRect.left - 5 &&
          r.right <= hostRect.right + 5 &&
          r.top >= hostRect.top - 5 &&
          r.bottom <= hostRect.bottom + 5
        );
      };
      const active = bars.find(inView) ?? bars[0];
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
      const host = document.querySelector(".gen-ext") as HTMLElement;
      const root = host.shadowRoot!;
      const hostRect = host.getBoundingClientRect();
      const bars = Array.from(root.querySelectorAll('[data-testid="compact-control-bar"]'));
      // Full-bounds in-view check — the reel scrolls vertically, so a
      // left/right-only test would match an off-screen (vertically) sibling.
      const active =
        bars.find((el) => {
          const r = el.getBoundingClientRect();
          return (
            r.width > 0 &&
            r.left >= hostRect.left - 5 &&
            r.right <= hostRect.right + 5 &&
            r.top >= hostRect.top - 5 &&
            r.bottom <= hostRect.bottom + 5
          );
        }) ?? bars[0];
      const el = active!.querySelector(`[data-testid="${id}"]`) as HTMLElement;
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }, testid);
  }

  /** Real pointer click on the active slide's play/pause control. */
  async tapPlay(): Promise<void> {
    const p = await this.centerOf("play-pause-btn");
    await this.page.mouse.click(p.x, p.y);
    await this.settle();
  }

  /** Real pointer click on the active slide's mute control. */
  async tapMute(): Promise<void> {
    const p = await this.centerOf("mute-btn");
    await this.page.mouse.click(p.x, p.y);
    await this.settle();
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
      const r = (document.querySelector(".gen-ext") as HTMLElement).getBoundingClientRect();
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
      await this.settle(900);
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
   * Falls back to a fixed delay for ad slots (no video element).
   */
  async waitForPlayable(timeoutMs = 4000): Promise<void> {
    try {
      await this.page.waitForFunction(
        () => {
          const host = document.querySelector(".gen-ext") as HTMLElement;
          const vid = host?.shadowRoot?.querySelector("video") as HTMLVideoElement | null;
          // No video (ad slot) → nothing to wait for. Otherwise need HAVE_CURRENT_DATA+.
          return !vid || vid.readyState >= 2;
        },
        { timeout: timeoutMs }
      );
    } catch {
      // Best-effort — fall through to whatever state we have.
    }
    await this.settle(400);
  }

  /** Small settle delay for React state + DOM to flush. */
  private async settle(ms = 300): Promise<void> {
    await this.page.waitForTimeout(ms);
  }
}
