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

  // Don't know perfect root cause but from event swiper index calculation starts from 0, whereas here activeIndex starts from 1.
  // I will had to do -1 to know the first visible index.
  const firstVisibleIndex = swiper.activeIndex - 1;
  const lastVisibleIndex = firstVisibleIndex + slidesPerView;

  return targetIndex >= firstVisibleIndex && targetIndex < lastVisibleIndex;
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
  if (!swiper || !swiper.slides || !swiper.params) {
    return { shouldSlide: false, targetIndex: currentActiveIndex };
  }

  const totalSlides = swiper.slides.length;
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
  if (!swiper || !swiper.slides || !swiper.params) return { first: 0, last: 0 };

  // Default to 1 if slidesPerView is undefined
  const slidesPerView = (swiper.params.slidesPerView as number) || 1;
  const first = swiper.activeIndex;
  const last = Math.min(first + slidesPerView - 1, swiper.slides.length - 1);

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
  if (!swiper || !swiper.params || !swiper.slides) return 0;

  const newRange = getVisibleSlideRange(swiper);

  // If current activeIndex was the last visible slide in previous range
  // Set it to the new last visible slide
  if (currentActiveIndex === previousVisibleRange.last) {
    return newRange.last;
  }

  // Otherwise, set it to the first visible slide
  return newRange.first;
}
