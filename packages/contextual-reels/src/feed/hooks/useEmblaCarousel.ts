import EmblaCarousel from "embla-carousel";
import type { EmblaCarouselType, EmblaOptionsType } from "embla-carousel";
import { useCallback, useRef } from "react";

export interface UseEmblaCarouselOptions {
  /** Called after Embla initialises. Useful for syncing external state. */
  onReady?: (api: EmblaCarouselType) => void;
}

/**
 * Block Embla from starting a drag when the gesture originates inside an ad
 * slot. Ad creatives render in a cross-origin iframe: Embla binds `mouseup`
 * to the parent document on pointerdown, but a click that focuses/navigates
 * the iframe consumes the `mouseup` inside the iframe's own document, so the
 * parent never sees it. Embla's drag handler then never calls `up()` — it
 * stays mid-drag and follows the cursor as a phantom touch until the next
 * pointerup lands in the parent doc. Skipping drag-start here hands the
 * gesture entirely to the ad. Returns `false` to suppress the drag.
 */
const skipDragInAdSlot = (_api: EmblaCarouselType, evt: PointerEvent | MouseEvent | TouchEvent): boolean => {
  const target = evt.target as Element | null;
  return !target?.closest("[data-testid='ad-layout'], [data-testid='gen-ad-slot']");
};

/**
 * Base Embla options shared across init and every `reInit`. `enable`/`disable`
 * toggle only `watchDrag` on top of this so axis/loop/duration never drift.
 *
 * `watchDrag` is a predicate (not a bare `true`) so drags starting inside an ad
 * iframe never begin — see {@link skipDragInAdSlot}. `disable`/`enable` still
 * override it with `false`/the predicate, which wins because it is spread last.
 */
const BASE_OPTIONS: EmblaOptionsType = {
  axis: "y",
  loop: true,
  dragFree: false,
  containScroll: false,
  duration: 15,
  watchDrag: skipDragInAdSlot,
};

export interface UseEmblaCarouselResult {
  /** Callback ref — attach to the viewport div via `ref={viewportRef}`. */
  viewportRef: (node: HTMLDivElement | null) => void;
  /**
   * Stable ref to the live Embla API. Consumers should read `.current` directly
   * rather than relying on the snapshot value, which is null on first render.
   */
  emblaApiRef: React.RefObject<EmblaCarouselType | null>;
  /** Live Embla API snapshot — null on first render, non-null after viewport mounts. */
  emblaApi: EmblaCarouselType | null;
  /** Scroll to the next slide. */
  scrollNext: () => void;
  /** Scroll to the previous slide. */
  scrollPrev: () => void;
  /**
   * Fully disable vertical feed swiping — both Embla pointer drag (via
   * `reInit({ watchDrag: false })`) and the wheel/trackpad handler (guarded by
   * an internal flag). Safe to call before the viewport mounts; the disabled
   * state is remembered so init applies it. Used while an Octo sheet is open.
   */
  disable: () => void;
  /**
   * Re-enable vertical feed swiping after {@link UseEmblaCarouselResult.disable},
   * restoring pointer drag and the wheel handler. No-op-safe before mount.
   */
  enable: () => void;
}

/**
 * Encapsulates all Embla carousel initialisation and wheel/trackpad handling.
 *
 * Uses a callback ref instead of useState+useEffect so Embla initialises
 * synchronously when the DOM node attaches — before any child effects fire.
 * This eliminates the race where ad callbacks (onWaterfallFail) call goNext()
 * before emblaApi is available.
 *
 * - Vertical axis, loop enabled, snappy `duration: 15`.
 * - Wheel/trackpad: one slide per gesture, unlocks on `settle` for continuous swiping.
 * - Direction flip mid-gesture resets the accumulator immediately.
 * - Firefox `deltaMode` normalisation (line/page → px).
 *
 * Exposes `enable`/`disable` so callers can freeze the feed while an Octo sheet
 * is open: `disable` turns off both pointer drag and the wheel handler, `enable`
 * restores them. The disabled flag is remembered across mount so a `disable`
 * issued before the viewport attaches still applies once Embla initialises.
 *
 * @param options  Optional `onReady` callback fired after Embla initialises.
 * @returns Callback ref to attach to the viewport, live `emblaApi`, `scrollNext`/`scrollPrev`, and `enable`/`disable`.
 */
export function useEmblaCarousel(options?: UseEmblaCarouselOptions): UseEmblaCarouselResult {
  const emblaApiRef = useRef<EmblaCarouselType | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const onReadyRef = useRef(options?.onReady);
  onReadyRef.current = options?.onReady;

  // Swipe-disabled flag — read by the wheel handler and at init time. A ref (not
  // state) so toggling it never re-runs the synchronous viewport callback.
  const disabledRef = useRef(false);
  // Resets the live wheel accumulator/lock; assigned by the viewport callback so
  // enable/disable can clear in-flight gesture state. Null before mount.
  const resetWheelRef = useRef<(() => void) | null>(null);

  // Callback ref fires synchronously when the DOM node attaches — no useEffect delay.
  const viewportRef = useCallback((el: HTMLDivElement | null) => {
    // Tear down previous instance (StrictMode double-invoke or remount).
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
      emblaApiRef.current = null;
    }
    if (!el) return;

    // If disable() ran before mount, init with drag off so the feed starts frozen.
    // Otherwise use the ad-slot predicate (BASE_OPTIONS) — never bare `true`,
    // which would re-enable the iframe phantom-drag bug.
    const api = EmblaCarousel(el, disabledRef.current ? { ...BASE_OPTIONS, watchDrag: false } : BASE_OPTIONS);

    // Synchronous assignment — available to all consumers before any child useEffect.
    emblaApiRef.current = api;
    onReadyRef.current?.(api);

    // Wheel/trackpad: one slide per gesture, continuous swiping supported.
    // Unlocks on 'settle' (snap complete) so back-to-back gestures work immediately.
    const THRESHOLD = 20;
    let locked = false;
    let accumulated = 0;

    const unlock = (): void => {
      locked = false;
      accumulated = 0;
    };

    // Exposed to enable/disable so a toggle clears any in-flight gesture state.
    resetWheelRef.current = unlock;

    const normalizeDelta = (e: WheelEvent): number => {
      if (e.deltaMode === 1) return e.deltaY * 16; // line mode (Firefox) → px
      if (e.deltaMode === 2) return e.deltaY * 100; // page mode → px
      return e.deltaY;
    };

    const onWheel = (e: WheelEvent): void => {
      // If the event originates inside a scrollable Octo/GenAI element, let it
      // scroll naturally — do not intercept or prevent it.
      const target = e.target as Element | null;
      if (target?.closest(".genai-sdk-container, [data-testid='octo-split-view']")) return;

      // Swipe frozen (Octo sheet open): swallow the event without scrolling so
      // the gesture neither moves the feed nor leaks to the page.
      if (disabledRef.current) {
        e.preventDefault();
        return;
      }
      e.preventDefault();
      const delta = normalizeDelta(e);

      // Direction flip mid-gesture — reset so reverse works immediately.
      if ((delta > 0 && accumulated < 0) || (delta < 0 && accumulated > 0)) {
        accumulated = 0;
        locked = false;
      }
      accumulated += delta;

      if (!locked && Math.abs(accumulated) > THRESHOLD) {
        locked = true;
        if (accumulated > 0) {
          api.scrollNext();
        } else {
          api.scrollPrev();
        }
      }
    };

    api.on("settle", unlock);
    el.addEventListener("wheel", onWheel, { passive: false });

    cleanupRef.current = () => {
      el.removeEventListener("wheel", onWheel);
      api.off("settle", unlock);
      resetWheelRef.current = null;
      api.destroy();
    };
  }, []);

  const scrollNext = (): void => {
    emblaApiRef.current?.scrollNext();
  };
  const scrollPrev = (): void => {
    emblaApiRef.current?.scrollPrev();
  };

  // Freeze the feed: set the wheel guard, drop pointer drag via reInit, and clear
  // any in-flight gesture. No-op-safe before mount — the flag is honoured at init.
  const disable = useCallback((): void => {
    disabledRef.current = true;
    resetWheelRef.current?.();
    emblaApiRef.current?.reInit({ ...BASE_OPTIONS, watchDrag: false });
  }, []);

  // Restore swiping: clear the wheel guard, reInit with drag on, reset the
  // accumulator. No-op-safe before mount.
  const enable = useCallback((): void => {
    disabledRef.current = false;
    resetWheelRef.current?.();
    // Restore the predicate (not bare `true`) so ad-slot drag stays suppressed.
    emblaApiRef.current?.reInit({ ...BASE_OPTIONS, watchDrag: skipDragInAdSlot });
  }, []);

  return {
    viewportRef,
    emblaApiRef,
    emblaApi: emblaApiRef.current,
    scrollNext,
    scrollPrev,
    disable,
    enable,
  };
}
