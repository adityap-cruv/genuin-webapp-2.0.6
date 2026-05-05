import { getAspectRatio } from "@genuin/ui/lib/utils";

/**
 * Swiper configuration constants.
 */
export const SWIPER_CONFIG = {
  SCROLL_DELAY: 500,
  THRESHOLD_TIME: 400, // Increased from 300
  MOUSE_THRESHOLD: {
    WINDOWS: 30, // Higher threshold for Windows
    DEFAULT: 20, // Original threshold for other OS
  },
  MOUSE_SENSITIVITY: {
    WINDOWS: 0.8, // Lower sensitivity for Windows
    DEFAULT: 1, // Original sensitivity for other OS
  },
  DEBOUNCE_TIME: 150, // New debounce time for wheel events
  FREE_MODE: {
    enabled: true,
    momentum: true,
    momentumBounce: true,
    momentumBounceRatio: 1,
    momentumRatio: 0.4,
    minimumVelocity: 0,
  },
};

/**
 * Get the number of slides to show based on the container size.
 * @param clientHeight - The height of the container.
 * @param clientWidth - The width of the container.
 * @param forFeed - Whether the swiper is for a feed or not.
 * @returns The number of slides to show.
 */
export function getSlidesPerView(
  clientHeight: number,
  clientWidth: number,
  forFeed: boolean,
  aspectRatio?: string,
  useWindowSwiperMode?: boolean
) {
  clientHeight = useWindowSwiperMode ? window.innerHeight : clientHeight;
  const elementHeight = clientHeight;
  const elementWidth = clientWidth;
  let ratio = 1;
  const { width: widthRatio, height: heightRatio } = getAspectRatio(aspectRatio);

  // separate logic for feed and carousel
  if (forFeed) {
    // calculating video height based on elementWidth, because we have to control height for feed view.
    const videoHeight = elementWidth * (heightRatio / widthRatio);
    ratio = elementHeight / videoHeight;
    // if element's height is less then video height, then we have to set ratio to 1.
    if (elementHeight < videoHeight) ratio = 1;
    // if ratio is less than 1, then we have to set it to 1.1.
    if (ratio < 1) ratio = 1.1;
  } else {
    // calculating width based on height.
    let calculatedWidth = (widthRatio / heightRatio) * elementHeight;
    // if calculated width is greater than element width, then we have to set it to element width.
    if (calculatedWidth > elementWidth) {
      calculatedWidth = elementWidth;
    }
    // calculating ratio based on calculated width.
    ratio = elementWidth / calculatedWidth;
  }
  return ratio;
}
