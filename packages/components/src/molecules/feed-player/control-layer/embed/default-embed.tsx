import { PlayIcon } from "@genuin/ui/icons";
import { cn } from "@genuin/ui/lib/utils";
import { type FC, lazy, useCallback } from "react";

import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { SafeSuspense } from "@genuin/components/molecules/error/safe-suspense";
import { resolveControlSize } from "@genuin/components/molecules/feed-player/control-layer/player-control-size";

import { Stats } from "@genuin/components/molecules/stats";

import type { ControlLayerPropsType } from "../control-layer.types";
import { Controls } from "../controls/controls";

const Linkouts = lazy(() =>
  import("@genuin/components/organisms/linkouts").then((m) => ({
    default: m.Linkouts,
  }))
);

export const DefaultEmbed: FC<ControlLayerPropsType> = ({
  postDetails,
  className,
  isActive,
  style,
  onClick,
  containerWidth,
}) => {
  const config = useEmbedConfigs();

  const { video, owner } = postDetails;
  if (!video || !owner) return null;

  // Drop the rest of the ControlLayerPropsType bag — none of it (postDetails,
  // onReactionStateChange, onCommentCountChange, containerWidth, adType, …)
  // is a valid DOM attribute, and spreading the whole bag onto the wrapper
  // `<div>` triggers React's "unknown prop" warnings. Only className, style and
  // onClick are DOM-safe and forwarded — onClick drives the tile→expand-view tap.
  return (
    <div
      className={cn("gencl:flex gencl:h-full gencl:flex-col gencl:justify-between", className)}
      style={style}
      onClick={onClick}>
      <div className="gencl:absolute gencl:bottom-0 gencl:p-2 gencl:space-y-2 gencl:w-full">
        {isActive && video.linkouts && (
          <SafeSuspense fallback={null} errorFallback={null}>
            <Linkouts
              view="embed"
              {...(config.isDesignSystemV2 ? { variant: "dynamic" as const } : {})}
              layout="overlay"
              isActive={isActive}
              showImmediately
              linkouts={video.linkouts}
              linkoutId={video.linkoutId}
              videoDetails={video}
            />
          </SafeSuspense>
        )}
        {config.community.showViewCount && !isActive && (
          <Stats
            className="gencl:gap-1!"
            valueClassName="gencl:text-white!"
            stats={{
              Views: {
                value: video.viewCount,
                icon: <PlayIcon theme="dark" size="md" />,
              },
            }}
          />
        )}
      </div>

      {isActive && owner?.userName && (
        <>
          <Controls
            variant="embed"
            size={config.isDesignSystemV2 ? resolveControlSize(containerWidth!) : "sm"}
            ownerInfo={{ userName: owner.userName }}
            showUserName={config.community.showUserName}
          />
        </>
      )}
    </div>
  );
};
