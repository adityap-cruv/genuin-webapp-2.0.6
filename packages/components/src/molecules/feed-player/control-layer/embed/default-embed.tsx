import { PlayIcon } from "@genuin/ui/icons";
import { cn } from "@genuin/ui/lib/utils";
import { type FC, lazy, Suspense } from "react";

import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
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
  onReactionStateChange,
  onCommentCountChange,
  ...restProps
}) => {
  const config = useEmbedConfigs();

  const { video, owner } = postDetails;
  if (!video || !owner) return null;

  return (
    <div className={cn("gencl:flex gencl:h-full gencl:flex-col gencl:justify-between", className)} {...restProps}>
      <div className="gencl:absolute gencl:bottom-0 gencl:p-2 gencl:space-y-2 gencl:w-full">
        {config.links.showLinkInside && isActive && video.linkouts && (
          <Suspense fallback={null}>
            <Linkouts
              view="embed"
              // variant="dynamic"
              layout="overlay"
              isActive={isActive}
              showImmediately
              linkouts={video.linkouts}
              linkoutId={video.linkoutId}
              videoDetails={video}
            />
          </Suspense>
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
            ownerInfo={{ userName: owner.userName }}
            showUserName={config.community.showUserName}
          />
        </>
      )}
    </div>
  );
};
