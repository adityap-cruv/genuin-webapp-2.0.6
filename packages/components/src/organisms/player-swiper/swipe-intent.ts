import type { Swiper } from "swiper";

export type SwipeSource = "navigation" | "keyboard";

interface SwiperState extends Swiper {
  __userSwipeSource?: SwipeSource;
  __userDragged?: boolean;
}

/** Keys the Swiper keyboard module navigates with; used to detect keyboard intent. */
const KEYBOARD_NAV_KEYS = new Set(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "PageUp", "PageDown"]);

/**
 * Wire per-instance swipe-intent tracking. Call once per Swiper inside
 * `onSwiper` / `onInit`. State is stored ON the instance, so multiple swipers
 * on one page never interfere.
 */
export function attachSwipeIntent(swiper: Swiper): void {
  const swiperState = swiper as SwiperState;

  // --- Event handlers -------------------------------------------------------

  // Drag: `sliderMove` fires only on a real pointer drag — never programmatically.
  const onTouchStart = () => {
    swiperState.__userDragged = false;
  };
  const onSliderMove = () => {
    swiperState.__userDragged = true;
  };

  // Keyboard: Swiper's `keyPress` fires after it slides (too late), so stamp on
  // keydown in the capture phase — ahead of Swiper's bubble-phase handler.
  const onKeydown = (event: KeyboardEvent) => {
    if (KEYBOARD_NAV_KEYS.has(event.key)) swiperState.__userSwipeSource = "keyboard";
  };

  // Touchpad/wheel: drives the Mousewheel module, not a drag. Swiper's `scroll`
  // event fires too late, so catch the raw wheel in the capture phase.
  const onWheel = () => {
    swiperState.__userDragged = true;
  };

  // Clear flags once a slide settles so nothing leaks into the next change.
  const onSlideSettled = () => {
    swiperState.__userDragged = false;
    swiperState.__userSwipeSource = undefined;
  };

  // --- Wiring ---------------------------------------------------------------

  const addEventListeners = () => {
    swiper.on("touchStart", onTouchStart);
    swiper.on("sliderMove", onSliderMove);
    swiper.on("slideChangeTransitionEnd", onSlideSettled);
    document.addEventListener("keydown", onKeydown, { capture: true });
    swiper.el.addEventListener("wheel", onWheel, { capture: true, passive: true });
  };

  const removeEventListeners = () => {
    swiper.off("touchStart", onTouchStart);
    swiper.off("sliderMove", onSliderMove);
    swiper.off("slideChangeTransitionEnd", onSlideSettled);
    document.removeEventListener("keydown", onKeydown, { capture: true });
    swiper.el.removeEventListener("wheel", onWheel, { capture: true });
  };

  addEventListeners();
  swiper.on("destroy", removeEventListeners);
}

/** Stamp user intent on a swiper that will be advanced by an indirect path. */
export function markSwipeIntent(swiper: Swiper, source: SwipeSource): void {
  (swiper as SwiperState).__userSwipeSource = source;
}

/** Stamp intent + advance. Use at direct user-trigger sites. */
export function userSlideNext(swiper: Swiper, source: SwipeSource): void {
  (swiper as SwiperState).__userSwipeSource = source;
  swiper.slideNext();
}

/** Stamp intent + go back. Use at direct user-trigger sites. */
export function userSlidePrev(swiper: Swiper, source: SwipeSource): void {
  (swiper as SwiperState).__userSwipeSource = source;
  swiper.slidePrev();
}

/**
 * Read whether the slide change that just settled was user-initiated. Resets
 * all flags on read so nothing leaks into the next (possibly programmatic) change.
 */
export function isUserSwipe(swiper: Swiper): boolean {
  const swiperState = swiper as SwiperState;
  const result =
    swiperState.__userDragged === true ||
    swiperState.__userSwipeSource === "navigation" ||
    swiperState.__userSwipeSource === "keyboard";
  swiperState.__userSwipeSource = undefined;
  swiperState.__userDragged = false;
  return result;
}
