import { cn } from "@genuin/ui/lib/utils";
import { useCallback, lazy, useMemo } from "react";

import { useAnalytics } from "@genuin/components/context";
import { useSafeEmbedContext } from "@genuin/components/context/embed/context";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { SDKEventEmitter, SDKEventName } from "@genuin/components/lib/sdk-event-emitter";
import { addIheartCtaCampaign } from "@genuin/components/lib/utils/iheart-url";
import { SafeSuspense } from "@genuin/components/molecules/error/safe-suspense";
import { buildLinkoutsAnalyticsData } from "@genuin/components/organisms/linkouts/build-linkouts-analytics-data";
import type { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";

import { usePlayerContext } from "../../../context";
import { isSponsoredVideo } from "../../controls/sponsored-tag";

// TODO(temp): Remove this KFI dummy-data redirect. Temporary placement-specific
// hardcoding — drop once real linkout data is served from the API.
// Placement whose CTA click redirects to the linkout cta_link instead of the
// constructed iheart.com URL. Mirrors KFI_PLACEMENT_IDS in embed.tsx.
const KFI_PLACEMENT_IDS = ["6a2be0e245aec54862efd9a5", "6a312de7a01f8b8ab6edde5a"];

const Linkouts = lazy(() =>
  import("@genuin/components/organisms/linkouts").then((m) => ({
    default: m.Linkouts,
  }))
) as React.ComponentType<any>;

interface ClipPlayerCTAProps {
  websiteType: "polaris" | "legacy";
  postDetails: PostDetailsType;
  toggleExpandView?: () => void;
  isActive: boolean;
}

export const ClipPlayerCTA = ({ postDetails, isActive }: ClipPlayerCTAProps) => {
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
    [postDetails.video, totalVideos, positionIndex]
  );

  const isKfiPlacement =
    !!embedDetails?.embedData?.placement_id && KFI_PLACEMENT_IDS.includes(embedDetails.embedData.placement_id);

  const isSponsored = isSponsoredVideo(postDetails.video);

  const handleCTAClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();

      // Sponsored posts (and the KFI placement) honour the linkout's explicit
      // destination (cta_link) directly instead of constructing an iheart.com URL
      // from station/podcast attributes they don't have.
      const ctaLink = postDetails.video?.linkouts?.[0]?.cta_link;
      if ((isSponsored || isKfiPlacement) && ctaLink) {
        const url = addIheartCtaCampaign(ctaLink);
        track(EventName.LINKOUTS_CLICKED, {
          ...analyticsEventData,
          linkUrl: url.toString(),
          linkTitle: postDetails.video?.linkouts?.[0]?.cta_text ?? "Listen Live",
        });
        window.open(url, "_blank", "noopener,noreferrer");
        return;
      }

      const type = postDetails.video?.attributes?.type;
      const episodeId = postDetails.video?.attributes?.episode_id
        ? Number(postDetails.video?.attributes?.episode_id)
        : undefined;
      const podcastId = postDetails.video?.attributes?.podcast_id
        ? Number(postDetails.video?.attributes?.podcast_id)
        : undefined;
      const stationId = postDetails.video?.attributes?.station_id
        ? Number(postDetails.video?.attributes?.station_id)
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
          (isFullEpisode ? "/episode/" + episodeId : "")
      );
      const destinationUrl = addIheartCtaCampaign(url);

      track(EventName.LINKOUTS_CLICKED, {
        ...analyticsEventData,
        linkUrl: destinationUrl.toString(),
        linkTitle: isGoToEpisode ? "Go to Episode" : isFullEpisode ? "Full Episode" : "Listen Live",
      });

      const isExpandViewOpen = embedDetails?.embedEventBus.getContext();
      // if (isExpandViewOpen) {
      //   embedDetails?.goBackToPreviousPlayerType();
      // }
      window.open(destinationUrl, "_blank", "noopener,noreferrer");
    },
    [postDetails, embedDetails, isKfiPlacement, isSponsored, track, EventName.LINKOUTS_CLICKED, analyticsEventData]
  );

  // Sponsored posts have linkouts but no station/podcast slug — let them through.
  // Label comes straight from linkouts[0].cta_text (Linkouts derives it).
  if (!isSponsored && !postDetails.video?.attributes?.slug) return;
  if (!postDetails.video?.linkouts) return;

  return (
    <SafeSuspense fallback={null} errorFallback={null}>
      <Linkouts
        linkouts={postDetails.video.linkouts}
        linkoutId={postDetails.video.linkoutId}
        isActive={isActive}
        className={cn("gencl:w-full")}
        variant="cta_only"
        handleCTAClick={handleCTAClick}
        showImmediately={true}
        videoDetails={postDetails.video}
        totalVideos={totalVideos}
        positionIndex={positionIndex}
        autoplay={video.videoAutoplay}
      />
    </SafeSuspense>
  );
};
