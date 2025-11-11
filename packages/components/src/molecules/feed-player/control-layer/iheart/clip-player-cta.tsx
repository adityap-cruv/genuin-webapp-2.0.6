import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";
import { getBaseUrl } from "@genuin/components/lib/utils";
import { Linkouts } from "@genuin/components/organisms";
import { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import { IHeartPlayIcon } from "@genuin/ui";
import { Button } from "@genuin/ui/components/button";
import { cn } from "@genuin/ui/lib/utils";
import { useMemo } from "react";
import {
  SDKEventEmitter,
  SDKEventName,
} from "@genuin/components/lib/sdk-event-emitter";

interface ClipPlayerCTAProps {
  websiteType: "polaris" | "legacy";
  postDetails: PostDetailsType;
  toggleExpandView?: () => void;
  isActive: boolean;
}

export const ClipPlayerCTA = ({
  websiteType,
  postDetails,
  toggleExpandView,
  isActive,
}: ClipPlayerCTAProps) => {
  const { isDesktop } = useDeviceDetectMediaQuery();

  // const linkUrl = useMemo(() => {
  //   if (typeof window === "undefined") return "";

  //   const currentUrl = window.location.href;
  //   const baseUrl = getBaseUrl(currentUrl);
  //   const path =
  //     postDetails.video.attributes?.type === "podcast" ? "/podcast" : "/live";
  //   const slug = postDetails.video.attributes?.slug;

  //   return `${baseUrl}${path}/${slug}/now-playing`;
  // }, [postDetails.video.attributes?.type, postDetails.video.attributes?.slug]);

  const handleCTAClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (websiteType === "polaris") {
      if (!isDesktop) {
        // Emit LINKOUT_CTA_CLICK event for mobile/tablet on polaris
        SDKEventEmitter.emit(SDKEventName.LINKOUT_CTA_CLICK, {
          type: postDetails.video.attributes?.type || undefined,
        });

        // Redirect to linkUrl for mobile/tablet
        // window.location.href = linkUrl;
      } else {
        // TODO: For desktop if our video is unmuted and playing, on click mute it and start mini-player
        console.log("Desktop view detected for polaris website");
      }
    } else if (websiteType === "legacy") {
      // Close expand view and scroll to top for all viewports
      if (toggleExpandView) {
        toggleExpandView();
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

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
