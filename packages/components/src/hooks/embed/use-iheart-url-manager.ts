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
  const baseUrlRef = useRef<string | null>(null);

  const getVideoPathSegment = (index: number): string => {
    const video = videos[index];
    if (!video || video.video.type === "complete") return "";
    let videoId = video.video.id;
    if (videoId.endsWith("overlay")) {
      const parts = videoId.split("_");
      videoId = parts.length > 0 ? (parts[0] ?? "") : "";
    }
    return `${video.video.slug}_${videoId}`;
  };

  const isVideoPathSegment = (segment: string): boolean => {
    return segment.includes("_");
  };

  const removeVideoPath = (segments: string[]): string[] => {
    if (websiteType === "legacy") {
      const highlightsIndex = segments.indexOf("highlights");
      if (highlightsIndex !== -1) {
        segments.splice(highlightsIndex, 2);
      }
    } else if (websiteType === "polaris" && segments.length > 0) {
      const lastSegment = segments[segments.length - 1];
      if (lastSegment && isVideoPathSegment(lastSegment)) {
        segments.pop();
      }
    }
    return segments;
  };

  const setVideoPath = (segments: string[], videoPath: string): string[] => {
    if (websiteType === "polaris") {
      const lastSegment = segments[segments.length - 1];
      if (lastSegment && isVideoPathSegment(lastSegment)) {
        segments[segments.length - 1] = videoPath;
      } else {
        segments.push(videoPath);
      }
    } else if (websiteType === "legacy") {
      const highlightsIndex = segments.indexOf("highlights");
      if (highlightsIndex !== -1) {
        if (highlightsIndex < segments.length - 1) {
          segments[highlightsIndex + 1] = videoPath;
        } else {
          segments.splice(highlightsIndex + 1, 0, videoPath);
        }
      } else {
        segments.push("highlights", videoPath);
      }
    }
    return segments;
  };

  const updateUrl = (pathSegments: string[], replaceState = false) => {
    const currentUrl = new URL(window.location.href);
    currentUrl.pathname = "/" + pathSegments.join("/");
    const method = replaceState ? "replaceState" : "pushState";
    window.history[method]({}, "", currentUrl.toString());
  };

  useEffect(() => {
    if (!isIheartLayout) return;

    if (activePlayerType === "expand-view") {
      const currentUrl = new URL(window.location.href);
      const pathSegments = currentUrl.pathname.split("/").filter(Boolean);

      removeVideoPath(pathSegments);
      const baseUrl = new URL(window.location.href);
      baseUrl.pathname = "/" + pathSegments.join("/");
      baseUrl.search = "";
      baseUrlRef.current = baseUrl.toString();

      const videoPath = getVideoPathSegment(activeIndex);
      if (videoPath) {
        setVideoPath(pathSegments, videoPath);
        updateUrl(pathSegments);
      }
    } else if (baseUrlRef.current) {
      window.history.pushState({}, "", baseUrlRef.current);
      baseUrlRef.current = null;
    }
  }, [activePlayerType, isIheartLayout]);

  useEffect(() => {
    if (!isIheartLayout || activePlayerType !== "expand-view") return;

    const pathSegments = window.location.pathname.split("/").filter(Boolean);
    const videoPath = getVideoPathSegment(activeIndex);

    if (!videoPath) {
      removeVideoPath(pathSegments);
    } else {
      setVideoPath(pathSegments, videoPath);
    }

    updateUrl(pathSegments, true);
  }, [activeIndex, activePlayerType, isIheartLayout, websiteType, videos]);
}
