import type { BrandDetailsConfigType } from "@genuin/components/types/brand";

/**
 * Determines the tap behavior for the feed player based on the provided web configuration.
 *
 * @param webConfigs - The web configuration object containing the `tap_behavior` property.
 * @returns A string describing the tap behavior: "Mute/Unmute", "Play/Pause", or "Unmute then Play/Pause".
 */
export const getTapBehaviour = (webConfigs: BrandDetailsConfigType["web_configs"]) => {
  switch (webConfigs.tap_behavior) {
    case 1:
      return "Mute/Unmute";
    case 2:
      return "Play/Pause";
    case 3:
      return "Unmute then Play/Pause";
    default:
      return "Mute/Unmute";
  }
};

/**
 * Determines the video autoplay setting based on the provided web configuration.
 *
 * @param webConfigs - The web configuration object containing video autoplay settings.
 * @returns A string representing the autoplay behavior: "always", "never", or "custom".
 */
export const getVideoAutoplay = (webConfigs: BrandDetailsConfigType["web_configs"]) => {
  switch (webConfigs.video_autoplay.type) {
    case 1:
      return "always";
    case 2:
      return "never";
    case 3:
      return "custom";
    default:
      return "always";
  }
};

/**
 * Returns a custom string describing the video play behavior in the feed,
 * formatted for use in RudderStack analytics events.
 *
 * @param webConfigs - The web configuration object containing feed video play settings.
 * @returns A string in the format:
 *   - "video_loop-{repeat_video}" if type is 1 (video loops)
 *   - "auto_swipe-{swipe_after}" if type is 2 (auto swipe after N repeats)
 */
export const getVideoPlayInFeed = (webConfigs: BrandDetailsConfigType["web_configs"]) => {
  const play = webConfigs.feed_video_play;
  // Used for RudderStack event tracking
  return play.type === 1 ? `video_loop-${play.repeat_video}` : `auto_swipe-${play.swipe_after}`;
};

/**
 * Returns a string representing the link delay configuration for RudderStack events.
 * If the delay type is `1`, it returns a custom delay string in the format `custom-{appear_after}`.
 * Otherwise, it returns `"immediately"`.
 *
 * @param webConfigs - The web configuration object containing linkout delay settings.
 * @returns A string indicating the link delay type for RudderStack events.
 */
export const getLinkDelay = (webConfigs: BrandDetailsConfigType["web_configs"]) => {
  const delay = webConfigs.linkout_delay;
  return delay.type === 1 ? `custom-${delay.appear_after}` : "immediately";
};

/**
 * Default SDK version used as a safe fallback.
 * This is applied when the Genuin SDK is not available
 * or its version cannot be resolved reliably.
 */
const DEFAULT_SDK_VERSION = "2.0.0";

/**
 * Retrieves the currently loaded Genuin SDK version in a safe and resilient way.
 *
 * This helper ensures that accessing the SDK version never breaks the application.
 * It gracefully handles the following scenarios:
 * - Genuin SDK is not loaded on the page
 * - `window.genuin` is undefined or inaccessible
 * - SDK version is missing, empty, or not a valid string
 * - Runtime errors during global object access
 *
 * @returns {string}
 * The resolved SDK version if available; otherwise, a predefined
 * fallback version (`DEFAULT_SDK_VERSION`).
 */
export function getSdkVersion(): string {
  try {
    const version = window?.genuin?.version;

    // Ensure the resolved version is a non-empty string
    if (typeof version === "string" && version.trim().length > 0) {
      return version;
    }

    return DEFAULT_SDK_VERSION;
  } catch {
    // Catch any unexpected runtime or access errors
    return DEFAULT_SDK_VERSION;
  }
}
