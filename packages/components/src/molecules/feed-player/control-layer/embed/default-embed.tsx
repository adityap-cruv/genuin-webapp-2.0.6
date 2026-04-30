import { cn } from "@genuin/ui/lib/utils";
import { ControlLayerPropsType } from "../control-layer.types";
import { type FC, lazy, Suspense } from "react";
import { Stats } from "@genuin/components/molecules/stats";
import { PlayIcon } from "@genuin/ui/icons";
import { Controls } from "../controls/controls";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";

const Linkouts = lazy(() =>
  import("@genuin/components/organisms/linkouts/index.js").then((m) => ({
    default: m.Linkouts,
  })),
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

  return (
    <div
      className={cn(
        "gencl:flex gencl:h-full gencl:flex-col gencl:justify-between",
        className,
      )}
      {...restProps}
    >
      <div className="gencl:absolute gencl:bottom-0 gencl:p-2 gencl:space-y-2 gencl:w-full">
        {config.links.showLinkInside &&
          isActive &&
          postDetails.video?.linkoutId && (
            <Suspense fallback={null}>
              <Linkouts
                variant="embed"
                isActive={isActive}
                showImmediately
                linkouts={postDetails.video.linkouts}
                linkoutId={postDetails.video.linkoutId}
                videoDetails={postDetails.video}
              />
            </Suspense>
          )}
        {config.community.showViewCount && !isActive && (
          <Stats
            className="gencl:gap-1!"
            valueClassName="gencl:text-white!"
            stats={{
              Views: {
                value: postDetails.video?.viewCount ?? 0,
                icon: <PlayIcon theme="dark" size="md" />,
              },
            }}
          />
        )}
      </div>

      {isActive && postDetails.owner?.userName && (
        <>
          <Controls
            variant="embed"
            ownerInfo={{ userName: postDetails.owner?.userName }}
            showUserName={config.community.showUserName}
          />
        </>
      )}
    </div>
  );
};
