import { cn } from "@genuin/ui/lib/utils";
import type { EmbedTileProps } from "./embed-tile.types";
import { cva, VariantProps } from "class-variance-authority";
import {
  ControlLayer,
  FeedPlayer,
} from "@genuin/components/molecules/feed-player";
import {
  PlayerProvider,
  usePlayerContext,
} from "@genuin/components/molecules/feed-player/context";
import { useBoolean } from "usehooks-ts";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { Linkouts } from "../linkouts";
import { Stats } from "@genuin/components/molecules/stats";
import { CommentIcon, PlayIcon } from "@genuin/ui/icons";
import { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import { useCallback } from "react";
import { useEmbedContext } from "@genuin/components/context/embed";
import { DynamicReactionIcon } from "@genuin/components/molecules/reaction-button";

const embedTileVariants = cva(
  "gencl:h-full gencl:rounded-lg gencl:overflow-clip gencl:flex gencl:flex-col",
  {
    variants: {
      variant: {
        default: "gencl:bg-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export function EmbedTile({
  isActive,
  variant,
  embedType = 0,
  postDetails,
  className,
  index,
  onPlayerIterationEnd,
  ...restProps
}: EmbedTileProps & VariantProps<typeof embedTileVariants>) {
  const { value, toggle } = useBoolean(false);
  // Use the structured config object
  const config = useEmbedConfigs();

  // Use theme from configuration
  const isDarkTheme = config.view.theme === "dark";

  return (
    <div
      className={cn(
        embedTileVariants({ variant }),
        { "gencl:opacity-40": config.styling.isOpacityDown },
        {
          "gencl:border gencl:border-secondary-150":
            config.video.showBorderAroundVideo,
        },
        { "gencl:bg-gray-900": isDarkTheme },
        className
      )}
      {...restProps}
    >
      {/* Take available height after showLinkOutside & showSocialInteractionData gets its height   */}
      <PlayerProvider
        isActive={isActive}
        videoId={postDetails.video.id}
        showExpandView={value}
        toggleExpandView={toggle}
        onPlayerIterationEnd={onPlayerIterationEnd}
      >
        <EmbedPlayer
          postDetails={postDetails}
          isActive={isActive}
          index={index}
        />
      </PlayerProvider>
      {config.links.showLinkOutside && (
        <div className="gencl:h-27 gencl:w-full gencl:flex gencl:items-center">
          <Linkouts
            variant="embed"
            isActive={true}
            showImmediately
            linkouts={postDetails.video.linkouts}
            linkoutId={postDetails.video.linkoutId}
          />
        </div>
      )}
      {config.engagement.showSocialInteractionData && (
        <>
          <hr className="gencl:w-[90%] gencl:border-secondary-150 gencl:mx-auto" />
          <div className="gencl:h-10">
            <Stats
              className={cn(
                "gencl:flex gencl:gap-2 gencl:justify-between gencl:p-3 gencl:w-full"
              )}
              valueClassName="gencl:text-black! gencl:text-body-2-medium"
              stats={{
                Views: {
                  value: 0,
                  icon: <PlayIcon theme="light" size="sm" />,
                },
                Reactions: {
                  value: postDetails.video.sparkCount,
                  icon: (
                    <DynamicReactionIcon
                      sparkCount={0}
                      isSparked={false}
                      iconHeight={16}
                      iconWidth={16}
                      theme="light"
                    />
                  ),
                },
                Comments: {
                  value: postDetails.video.commentCount,
                  icon: <CommentIcon theme="light" size="sm" />,
                },
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}

type EmbedPlayerProps = {
  postDetails: PostDetailsType;
  isActive?: boolean;
  index: number;
};

function EmbedPlayer({
  postDetails,
  isActive = false,
  index,
}: EmbedPlayerProps) {
  const { isAdPlaying } = usePlayerContext();
  const config = useEmbedConfigs();
  const { changeActivePlayerType } = useEmbedContext();

  const handleClickOnEmbedTile = useCallback(() => {
    if (isAdPlaying) {
      return;
    }

    if (postDetails.video.clickableUrl) {
      window.open(postDetails.video.clickableUrl, "_blank");
      return;
    }

    changeActivePlayerType("expand-view");
  }, [isAdPlaying, changeActivePlayerType, postDetails]);

  return (
    <div className={cn("gencl:relative gencl:flex-1 gencl:min-h-0")}>
      <FeedPlayer
        videoId={postDetails.video.id}
        src={postDetails.video.source}
        poster={postDetails.video.thumbnail}
        loop={config.video.playVideoInLoop && isActive}
        autoPlay={config.video.autoplay && isActive}
        className="gencl:h-full gencl:w-full gencl:object-cover"
      />
      <ControlLayer
        variant="embed"
        isActive={isActive}
        postDetails={postDetails}
        onClick={handleClickOnEmbedTile}
      />
    </div>
  );
}
