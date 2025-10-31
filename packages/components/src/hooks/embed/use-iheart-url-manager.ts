import { useEffect, useRef } from "react";
import { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";

type UseIheartUrlManagerProps = {
  isIheartLayout: boolean;
  websiteType: "polaris" | "legacy" | undefined;
  activePlayerType: string;
  activeIndex: number;
  videos: PostDetailsType[];
};

/**
 * Custom hook to manage URL manipulation for iHeart brand layout
 *
 * This hook handles:
 * - Adding video path to URL when entering expand view
 * - Removing video path when exiting expand view
 * - Updating URL when active video index changes in expand view
 *
 * URL patterns:
 * - Polaris: /videoSlug_videoId
 * - Legacy: /highlights/videoSlug_videoId
 */
export function useIheartUrlManager({
  isIheartLayout,
  websiteType,
  activePlayerType,
  activeIndex,
  videos,
}: UseIheartUrlManagerProps) {
  // Track the base URL before entering expand view
  const baseUrlRef = useRef<string | null>(null);

  // Helper function to construct video path segment
  const getVideoPathSegment = (index: number): string => {
    const video = videos[index];
    if (!video) return "";
    // Skip videos with type "complete" - don't append anything to URL
    if (video.video.type === "complete") return "";
    return `${video.video.slug}_${video.video.id}`;
  };

  // Helper function to update URL with video path
  const updateUrlWithVideo = (index: number) => {
    if (typeof window === "undefined" || !isIheartLayout) return;

    const videoPathSegment = getVideoPathSegment(index);
    if (!videoPathSegment) return;

    const currentUrl = new URL(window.location.href);
    const pathSegments = currentUrl.pathname.split("/").filter(Boolean);

    if (websiteType === "polaris") {
      // For polaris: add /videoSlug_videoId
      pathSegments.push(videoPathSegment);
    } else if (websiteType === "legacy") {
      // For legacy: add /highlights/videoSlug_videoId
      pathSegments.push("highlights", videoPathSegment);
    }

    currentUrl.pathname = "/" + pathSegments.join("/");
    window.history.pushState({}, "", currentUrl.toString());
  };

  // Helper function to remove video path from URL
  const removeVideoPathFromUrl = () => {
    if (typeof window === "undefined" || !isIheartLayout || !baseUrlRef.current)
      return;

    window.history.pushState({}, "", baseUrlRef.current);
  };

  // Handle URL updates when entering/exiting expand view
  useEffect(() => {
    if (!isIheartLayout) return;

    if (activePlayerType === "expand-view") {
      // Entering expand view: store base URL and add video path
      baseUrlRef.current = window.location.href;
      updateUrlWithVideo(activeIndex);
    } else if (baseUrlRef.current) {
      // Exiting expand view: restore base URL
      removeVideoPathFromUrl();
      baseUrlRef.current = null;
    }
  }, [activePlayerType, isIheartLayout]);

  // Handle URL updates when activeIndex changes in expand view
  useEffect(() => {
    if (!isIheartLayout || activePlayerType !== "expand-view") return;

    const currentUrl = new URL(window.location.href);
    const pathSegments = currentUrl.pathname.split("/").filter(Boolean);
    const videoPathSegment = getVideoPathSegment(activeIndex);

    // If videoPathSegment is empty (type === "complete"), remove the video path
    if (!videoPathSegment) {
      if (websiteType === "polaris") {
        // For polaris: remove the last segment if it's a video path
        if (pathSegments.length > 0) {
          const lastSegment = pathSegments[pathSegments.length - 1];
          // Check if last segment looks like a video path (contains underscore)
          if (lastSegment && lastSegment.includes("_")) {
            pathSegments.pop();
          }
        }
      } else if (websiteType === "legacy") {
        // For legacy: remove /highlights/videoSlug_videoId
        const highlightsIndex = pathSegments.indexOf("highlights");
        if (highlightsIndex !== -1) {
          // Remove both "highlights" and the video path segment after it
          pathSegments.splice(highlightsIndex, 2);
        }
      }
      currentUrl.pathname = "/" + pathSegments.join("/");
      window.history.replaceState({}, "", currentUrl.toString());
      return;
    }

    if (websiteType === "polaris") {
      // For polaris: replace the last segment if it's a video path, otherwise add it
      if (pathSegments.length > 0) {
        const lastSegment = pathSegments[pathSegments.length - 1];
        // If last segment looks like a video path (contains underscore), replace it
        if (lastSegment && lastSegment.includes("_")) {
          pathSegments[pathSegments.length - 1] = videoPathSegment;
        } else {
          // Otherwise, add the video path as a new segment
          pathSegments.push(videoPathSegment);
        }
      } else {
        // No segments exist, just add the video path
        pathSegments.push(videoPathSegment);
      }
    } else if (websiteType === "legacy") {
      // For legacy: replace or add the segment after "highlights"
      const highlightsIndex = pathSegments.indexOf("highlights");
      if (highlightsIndex !== -1 && highlightsIndex < pathSegments.length - 1) {
        // Replace existing video path after highlights
        pathSegments[highlightsIndex + 1] = videoPathSegment;
      } else if (highlightsIndex !== -1) {
        // highlights exists but no video path after it, add it
        pathSegments.splice(highlightsIndex + 1, 0, videoPathSegment);
      } else {
        // highlights doesn't exist, add both highlights and video path
        pathSegments.push("highlights", videoPathSegment);
      }
    }

    currentUrl.pathname = "/" + pathSegments.join("/");
    window.history.replaceState({}, "", currentUrl.toString());
  }, [activeIndex, activePlayerType, isIheartLayout, websiteType, videos]);
}
