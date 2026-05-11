/**
 * Brand types supported in the application
 */
export type BrandType = "default" | "iheart" | "ted" | "grubhub" | "walmart";

/**
 * Get brand type based on card layout ID and video layout ID
 * Based on the layout configuration table
 *
 * @param cardLayoutId - The card layout identifier
 * @param videoLayoutId - The video layout identifier (optional)
 * @returns BrandType - The determined brand type
 */
export function getBrandType(cardLayoutId?: number | null, videoLayoutId?: number | null): BrandType {
  // Convert null to undefined for easier handling
  const cardId = cardLayoutId ?? undefined;
  const videoId = videoLayoutId ?? undefined;

  // Primary: Check card layout ID first (most specific)
  switch (cardId) {
    case 1:
      return "default"; // Default - Genuin
    case 2:
      return "iheart"; // iHeart
    case 3:
      return "ted"; // TED
    case 4:
      return "grubhub"; // Grubhub - Carousel
    case 5:
      return "default"; // Ad View
    case 6:
      return "walmart"; // Walmart
    default:
      break;
  }

  // Secondary: Check video layout ID if card layout ID is not available
  switch (videoId) {
    case 1:
      return "default"; // Default - Genuin, Grubhub uses card layout for distinction
    case 2:
      return "iheart"; // iHeart
    case 3:
      return "ted"; // TED
    case 4:
      return "default"; // Ad View
    case 5:
      return "walmart"; // Walmart
    default:
      return "default"; // Default fallback
  }
}
