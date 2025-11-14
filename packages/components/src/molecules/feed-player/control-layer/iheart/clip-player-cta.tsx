import {
  SDKEventEmitter,
  SDKEventName,
} from "@genuin/components/lib/sdk-event-emitter";
import { Linkouts } from "@genuin/components/organisms";
import { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import { cn } from "@genuin/ui/lib/utils";

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
  const handleCTAClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const type = postDetails.video.attributes?.type;
    const episodeId = postDetails.video.attributes?.episode_id
      ? Number(postDetails.video.attributes?.episode_id)
      : undefined;
    const podcastId = postDetails.video.attributes?.podcast_id
      ? Number(postDetails.video.attributes?.podcast_id)
      : undefined;
    const stationId = postDetails.video.attributes?.station_id
      ? Number(postDetails.video.attributes?.station_id)
      : undefined;
    const slug = postDetails.video.attributes?.slug;

    if (slug)
      SDKEventEmitter.emit(SDKEventName.PLAY_IHEART_CONTENT, {
        navigate: true,
        // dummy data,
        play: false,
        episodeId,
        podcastId,
        slug,
        stationId,
        type,
      });
  };

  if (!postDetails.video.attributes?.slug) return;

  return (
    <Linkouts
      linkouts={postDetails.video.linkouts}
      linkoutId={postDetails.video.linkoutId}
      isActive={isActive}
      className={cn("gencl:w-full")}
      cardVariant="primary"
      ctaOnly={true}
      handleCTAClick={handleCTAClick}
      showImmediately={true}
    />
  );
};
