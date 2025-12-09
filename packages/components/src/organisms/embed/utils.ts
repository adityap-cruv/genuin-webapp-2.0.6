import { Swiper as SwiperType } from "swiper/types";

/**
 * Utility functions for managing embed navigation
 */

/**
 * Checks if a slide index is currently visible in the viewport
 * @param swiper - The Swiper instance
 * @param targetIndex - The slide index to check
 * @returns boolean indicating if the slide is visible
 */
export function isSlideVisible(
  swiper: SwiperType,
  targetIndex: number
): boolean {
  if (!swiper || !swiper.params) return false;

  // Default to 1 if slidesPerView is undefined
  const slidesPerView = Math.floor(
    (swiper.params.slidesPerView as number) || 1
  );

  // Check if virtualization is enabled
  const isVirtualEnabled = swiper.params.virtual && swiper.virtual;

  // Calculate first visible index based on slide centering mode, in case of centered slides true activeIndex moves forward with 1 slide.
  // - Normal mode: activeIndex is the first visible slide (leftmost)
  // - Centered mode: activeIndex is the center slide, so first visible is one before
  const firstVisibleIndex = swiper.params.centeredSlides
    ? swiper.activeIndex - Math.floor(slidesPerView / 2)
    : swiper.activeIndex;

  // Calculate last visible index based on slide centering mode
  const lastVisibleIndex = firstVisibleIndex + slidesPerView - 1;

  // Get total slides count - use virtual slides length when virtualization is enabled
  const totalSlides = isVirtualEnabled
    ? (swiper.virtual?.slides?.length ?? swiper.slides?.length ?? 0)
    : (swiper.slides?.length ?? 0);

  // Clamp indices to valid range
  const clampedFirst = Math.max(0, firstVisibleIndex);
  const clampedLast = Math.min(totalSlides - 1, lastVisibleIndex);

  return targetIndex >= clampedFirst && targetIndex <= clampedLast;
}

/**
 * Determines if navigation should slide or just update active index
 * @param swiper - The Swiper instance
 * @param currentActiveIndex - Current active index
 * @param direction - Navigation direction ('next' or 'prev')
 * @returns object with shouldSlide boolean and targetIndex
 */
export function getNavigationAction(
  swiper: SwiperType,
  currentActiveIndex: number,
  direction: "next" | "prev"
): { shouldSlide: boolean; targetIndex: number } {
  if (!swiper || !swiper.params) {
    return { shouldSlide: false, targetIndex: currentActiveIndex };
  }

  // Check if virtualization is enabled
  const isVirtualEnabled = swiper.params.virtual && swiper.virtual;

  // When virtualization is enabled, use virtual.slides.length for total count
  const totalSlides = isVirtualEnabled
    ? (swiper.virtual?.slides?.length ?? 0)
    : (swiper.slides?.length ?? 0);

  if (totalSlides === 0) {
    return { shouldSlide: false, targetIndex: currentActiveIndex };
  }
  const targetIndex =
    direction === "next" ? currentActiveIndex + 1 : currentActiveIndex - 1;

  // in case of zero no need to check if we should swiper or not,
  // if swiper is already at 0 it won't swipe. So we just send true for should swipe as it will swipe to top even if small out of bounds issue.
  if (targetIndex === 0) {
    return { shouldSlide: true, targetIndex };
  }

  // Check bounds
  if (targetIndex < 0 || targetIndex >= totalSlides) {
    return { shouldSlide: false, targetIndex: currentActiveIndex };
  }

  // Check if target slide is visible
  const isVisible = isSlideVisible(swiper, targetIndex);

  // For backward navigation, if we're at the end and going back,
  // we should slide to make the target visible
  if (direction === "prev" && !isVisible) {
    return {
      shouldSlide: true,
      targetIndex: targetIndex,
    };
  }

  return {
    shouldSlide: !isVisible,
    targetIndex: targetIndex,
  };
}

/**
 * Gets the range of currently visible slide indices
 * @param swiper - The Swiper instance
 * @returns object with first and last visible indices
 */
export function getVisibleSlideRange(swiper: SwiperType): {
  first: number;
  last: number;
} {
  if (!swiper || !swiper.params) return { first: 0, last: 0 };

  // Check if virtualization is enabled
  const isVirtualEnabled = swiper.params.virtual && swiper.virtual;

  // When virtualization is enabled, swiper.slides only contains rendered DOM elements
  // Use virtual.slides.length for the total count
  const totalSlides = isVirtualEnabled
    ? (swiper.virtual?.slides?.length ?? 0)
    : (swiper.slides?.length ?? 0);

  if (totalSlides === 0) return { first: 0, last: 0 };

  // Default to 1 if slidesPerView is undefined
  const slidesPerView = (swiper.params.slidesPerView as number) || 1;
  const first = swiper.activeIndex;
  const last = Math.min(first + slidesPerView - 1, totalSlides - 1);

  return { first, last };
}

/**
 * Determines the appropriate activeIndex when current one goes out of bounds
 * @param swiper - The Swiper instance
 * @param currentActiveIndex - Current active index that went out of bounds
 * @param previousVisibleRange - Previous visible range before slide change
 * @returns new appropriate activeIndex
 */
export function getNewActiveIndexOnSlideChange(
  swiper: SwiperType,
  currentActiveIndex: number,
  previousVisibleRange: { first: number; last: number }
): number {
  if (!swiper || !swiper.params) return 0;

  // Check if virtualization is enabled
  const isVirtualEnabled = swiper.params.virtual && swiper.virtual;

  // When virtualization is enabled, swiper.slides only contains rendered DOM elements
  // We need to check virtual.slides for the full list
  const hasSlides = isVirtualEnabled
    ? (swiper.virtual?.slides?.length ?? 0) > 0
    : (swiper.slides?.length ?? 0) > 0;

  if (!hasSlides) return 0;

  const newRange = getVisibleSlideRange(swiper);

  // If current activeIndex was the last visible slide in previous range
  // Set it to the new last visible slide
  if (currentActiveIndex === previousVisibleRange.last) {
    return newRange.last;
  }

  // Otherwise, set it to the first visible slide
  return newRange.first;
}
