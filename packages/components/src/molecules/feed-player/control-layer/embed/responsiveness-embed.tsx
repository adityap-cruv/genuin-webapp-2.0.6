import { cn } from "@genuin/ui/lib/utils";
import { resolveControlSize } from "@genuin/ui/player-controls";
import { type FC, lazy } from "react";

import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { SafeSuspense } from "@genuin/components/molecules/error/safe-suspense";
import { hasLinkouts } from "@genuin/components/molecules/linkout-new/linkout-utils";

import type { ControlLayerPropsType } from "../control-layer.types";
import { EmbedControls } from "../controls/embed";
import { useNewPlayerControls } from "../use-new-player-controls";

const Linkouts = lazy(() =>
  import("@genuin/components/organisms/linkouts").then((m) => ({
    default: m.Linkouts,
  }))
);

export const ResponsivenessEmbed: FC<ControlLayerPropsType> = ({
  postDetails,
  className,
  isActive,
  // Drain non-DOM props so they don't leak via {...restProps} onto the <div>.
  onReactionStateChange: _onReactionStateChange,
  onCommentCountChange: _onCommentCountChange,
  containerWidth,
  adType: _adType,
  ...restProps
}) => {
  const video = postDetails?.video;
  const config = useEmbedConfigs();
  const newUI = useNewPlayerControls();
  return (
    <div className={cn("gencl:relative gencl:h-full gencl:w-full", className)} {...restProps}>
      {isActive && (
        <EmbedControls
          onClick={(e) => e.stopPropagation()}
          className="gencl:justify-end gencl:p-1"
          size={containerWidth && newUI ? resolveControlSize(containerWidth) : "sm"}
        />
      )}
      {/* Outside wins: below-player host owns the linkout, suppress overlay. */}
      {!config.links.showLinkOutside && isActive && hasLinkouts(video) && (
        <div
          // `embed-carousel-no-swiping` blocks the outer carousel Swiper but not the
          // linkout's inner Swiper (which uses the default `swiper-no-swiping`).
          className="embed-carousel-no-swiping gencl:absolute gencl:bottom-0 gencl:py-2 gencl:space-y-2 gencl:w-full"
          onClick={(e) => e.stopPropagation()}>
          <SafeSuspense fallback={null}>
            <Linkouts
              view="embed"
              variant="dynamic"
              layout="overlay"
              isActive={isActive}
              showImmediately
              linkouts={video.linkouts}
              linkoutId={video.linkoutId}
              videoDetails={video}
            />
          </SafeSuspense>
        </div>
      )}
    </div>
  );
};
