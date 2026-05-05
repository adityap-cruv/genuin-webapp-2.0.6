import { Avatar } from "@genuin/ui/components/avatar";
import { cn } from "@genuin/ui/lib/utils";
import { type FC } from "react";

import { useEmbedDimensions } from "@genuin/components/hooks/embed/use-embed-dimensions";
import { ReadMore } from "@genuin/components/molecules/read-more";

import type { ControlLayerPropsType } from "../control-layer.types";
import { EmbedControls } from "../controls/embed";

export const TedEmbed: FC<ControlLayerPropsType> = ({ postDetails, className, isActive, ...restProps }) => {
  const { containerHeight } = useEmbedDimensions();

  const { video, community } = postDetails;
  if (!video || !community) return null;

  return (
    <div className={cn(className)} {...restProps}>
      {isActive && (
        <div
          className="gencl:absolute gencl:top-0 gencl:right-0 gencl:py-2 gencl:px-3"
          onClick={(e) => e.stopPropagation()}>
          <EmbedControls className={cn("gencl:gap-3")} size="xs" />
        </div>
      )}

      <div className="gencl:px-3 gencl:py-4 gencl:absolute gencl:space-y-2 gencl:bottom-0 gencl:bg-gradient-to-t gencl:from-black/80 gencl:to-transparent">
        <ReadMore
          text={video.description}
          position="overlay"
          viewLessText=""
          viewMoreText=""
          maxChars={500}
          shouldAnimate
          className="gencl:overflow-y-auto gencl:text-body-2-normal! gencl:[&_span]:leading-[125%]! gencl:tracking-[-0.042px]!"
          expandedHeight={`${containerHeight * 0.35}px`}
          maxLines={containerHeight < 375 ? 1 : 2}
        />
        <div className="gencl:flex gencl:items-center gencl:gap-2" onClick={(e) => e.stopPropagation()}>
          <Avatar size="xs" imageUrl={community.profileImage ?? ""} isAvatar={false} alt={community.name ?? ""} />
          <p className="gencl:text-white! gencl:text-body-1-bold gencl:line-clamp-1 gencl:tracking-[-0.21px]! gencl:leading-[130%]!">
            {community.name}
          </p>
        </div>
      </div>
    </div>
  );
};
