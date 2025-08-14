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
  aspectRatio?: string
) {
  const elementHeight = clientHeight;
  const elementWidth = clientWidth;
  let ratio = 1;
  let widthRatio = 9;
  let heightRatio = 16;
  
  if (aspectRatio) {
    const parts = aspectRatio.split(':');
    if (parts.length === 2) {
      const firstPart = parts[0];
      const secondPart = parts[1];
      
      if (firstPart && secondPart) {
        const parsedWidth = parseInt(firstPart, 10);
        const parsedHeight = parseInt(secondPart, 10);
        
        if (!isNaN(parsedWidth) && !isNaN(parsedHeight) && parsedWidth > 0 && parsedHeight > 0) {
          widthRatio = parsedWidth;
          heightRatio = parsedHeight;
        }
      }
    }
  }
  
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
