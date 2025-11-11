/**
 * Utility functions for iHeart component text handling
 * Centralizes text logic based on content type and website type
 */

export type ContentType = "podcast" | "station";
export type WebsiteType = "polaris" | "legacy";

/**
 * Get follow button text based on website type and content type
 */
export function getFollowButtonTexts(websiteType: WebsiteType, contentType: ContentType) {
  if (websiteType === "polaris") {
    if (contentType === "station") {
      return { defaultText: "Library", followingText: "Library" };
    }
    return { defaultText: "Follow", followingText: "Following" };
  }
  // legacy: podcast and station both use Follow/Following
  return { defaultText: "Follow", followingText: "Following" };
}