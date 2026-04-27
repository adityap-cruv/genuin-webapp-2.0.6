import { useSafeEmbedContext } from "@genuin/components/context/embed/context";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import {
  SDKEventEmitter,
  SDKEventName,
} from "@genuin/components/lib/sdk-event-emitter";
import { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import { cn } from "@genuin/ui/lib/utils";
import { useCallback, lazy, Suspense, useMemo } from "react";
import { usePlayerContext } from "../../../context";
import { buildLinkoutsAnalyticsData } from "@genuin/components/organisms";
import { useAnalytics } from "@genuin/components/context";

const Linkouts = lazy(() =>
  import("@genuin/components/organisms/linkouts/index.js").then((m) => ({
    default: m.Linkouts,
  })),
) as React.ComponentType<any>;

interface ClipPlayerCTAProps {
  websiteType: "polaris" | "legacy";
  postDetails: PostDetailsType;
  toggleExpandView?: () => void;
  isActive: boolean;
}

export const ClipPlayerCTA = ({
  postDetails,
  isActive,
}: ClipPlayerCTAProps) => {
  const {
    view: { websiteType },
    video,
  } = useEmbedConfigs();
  const embedDetails = useSafeEmbedContext();
  const { totalVideos, positionIndex } = usePlayerContext();
  const { track, EventName } = useAnalytics();
  const analyticsEventData = useMemo(
    () =>
      buildLinkoutsAnalyticsData({
        videoDetails: postDetails.video,
        totalVideos,
        positionIndex,
      }),
    [postDetails.video, totalVideos, positionIndex],
  );

  const handleCTAClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const type = postDetails.video?.attributes?.type;
      const episodeId = postDetails.video?.attributes?.episode_id
        ? Number(postDetails.video.attributes?.episode_id)
        : undefined;
      const podcastId = postDetails.video?.attributes?.podcast_id
        ? Number(postDetails.video.attributes?.podcast_id)
        : undefined;
      const stationId = postDetails.video?.attributes?.station_id
        ? Number(postDetails.video.attributes?.station_id)
        : undefined;
      const slug = postDetails.video?.attributes?.slug;

      if (slug) {
        SDKEventEmitter.emit(SDKEventName.PLAY_IHEART_CONTENT, {
          navigate: true,
          // dummy data,
          play: true,
          episodeId,
          podcastId,
          slug,
          stationId,
          type,
          videoId: postDetails.video?.id,
          videoTitle: postDetails.video?.attributes?.description ?? undefined,
        });
      }
      const isGoToEpisode = podcastId && !episodeId;
      const isFullEpisode = podcastId && episodeId;
      const isStation = !podcastId && !episodeId;
      const url = new URL(
        "https://iheart.com/" +
          (isStation ? "live/" : "podcast/") +
          (isStation ? stationId : slug) +
          (isFullEpisode ? "/episode/" + episodeId : ""),
      );

      track(EventName.LINKOUTS_CLICKED, {
        ...analyticsEventData,
        linkUrl: url,
        linkTitle: isGoToEpisode
          ? "Go to Episode"
          : isFullEpisode
            ? "Full Episode"
            : "Listen Live",
      });

      const isExpandViewOpen = embedDetails?.embedEventBus.getContext();
      // if (isExpandViewOpen) {
      //   embedDetails?.goBackToPreviousPlayerType();
      // }
      window.open(url, "_blank", "noopener,noreferrer");
    },
    [postDetails, embedDetails],
  );

  if (!postDetails.video?.attributes?.slug) return;
  if (!postDetails.video.linkoutId) return;

  return (
    <Suspense fallback={null}>
      <Linkouts
        linkouts={postDetails.video.linkouts}
        linkoutId={postDetails.video.linkoutId}
        isActive={isActive}
        className={cn("gencl:w-full")}
        cardVariant="primary"
        ctaOnly={true}
        handleCTAClick={handleCTAClick}
        showImmediately={true}
        videoDetails={postDetails.video}
        totalVideos={totalVideos}
        positionIndex={positionIndex}
        autoplay={video.videoAutoplay}
      />
    </Suspense>
  );
};
