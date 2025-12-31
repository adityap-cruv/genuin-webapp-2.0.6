import { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";

/**
 * Type for the analytics data passed to Linkouts component
 */
export type LinkoutsAnalyticsData = {
  content_category: string;
  content_id?: string;
  event_record_screen: string;
  event_target_screen: string;
  title?: string | null;
  video_id?: string;
  video_description?: string | null;
  video_url?: string;
  total_videos?: number;
  position_index?: number;
  autoplay?: boolean;
};

export type BuildLinkoutsAnalyticsDataParams = {
  videoDetails?: PostDetailsType["video"];
  totalVideos?: number;
  positionIndex?: number;
  autoplay?: boolean;
};

/**
 * @param params - The parameters for building analytics data
 * @returns LinkoutsAnalyticsData object ready to be passed to Linkouts component
 */
export function buildLinkoutsAnalyticsData({
  videoDetails,
  totalVideos,
  positionIndex,
  autoplay,
}: BuildLinkoutsAnalyticsDataParams): LinkoutsAnalyticsData {
  return {
    content_category: "linkout",
    content_id: videoDetails?.id,
    event_record_screen: "feed",
    event_target_screen: "none",
    total_videos: totalVideos,
    position_index: positionIndex,
    autoplay: autoplay,
    title: videoDetails?.descritptionText,
    video_id: videoDetails?.id,
    video_url: videoDetails?.source,
  };
}
