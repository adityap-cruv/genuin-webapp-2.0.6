/**
 * Calculate slide dimensions for given aspect ratio fitting slides in container
 * @param options - Configuration object
 * @param options.containerDimension - The container dimension (height or width)
 * @param options.dimensionType - Whether the dimension is 'height' or 'width' (default: 'height')
 * @param options.aspectRatio - The aspect ratio as width/height ratio (default: 9/16)
 * @param options.slidesPerView - Number of slides to fit (default: 1.2)
 * @returns Object with slide width, height, and slidesPerView
 */
export function calculateSlideDimensions({
  containerDimension,
  dimensionType = "height",
  aspectRatio = 9 / 16,
  slidesPerView = 1,
}: {
  containerDimension: number;
  dimensionType?: "height" | "width";
  aspectRatio?: number;
  slidesPerView?: number;
}) {
  let slideHeight: number;
  let slideWidth: number;

  if (dimensionType === "height") {
    // Container height is the constraint
    slideHeight = containerDimension / slidesPerView;
    slideWidth = slideHeight * aspectRatio;
  } else {
    // Container width is the constraint
    slideWidth = containerDimension / slidesPerView;
    slideHeight = slideWidth / aspectRatio;
  }

  return {
    slideWidth,
    slideHeight,
    slidesPerView,
  };
}
