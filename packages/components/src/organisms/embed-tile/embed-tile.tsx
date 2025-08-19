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

/**
 * Helper function to extract the most appropriate URL from linkouts based on priority:
 * 1. CTA link from first linkout
 * 2. First link from links array in first linkout
 * 3. URL from first linkout (legacy format)
 * 4. null if no valid URL found
 */
function getLinkoutUrl(linkouts: any): string | null {
  if (!linkouts || typeof linkouts !== "object") {
    return null;
  }

  // Handle array of linkout objects
  if (Array.isArray(linkouts) && linkouts.length > 0) {
    const firstLinkout = linkouts[0];

    // First priority: CTA link
    if (firstLinkout.cta_link) {
      return firstLinkout.cta_link;
    }

    // Second priority: First link from links array
    if (
      firstLinkout.links &&
      Array.isArray(firstLinkout.links) &&
      firstLinkout.links.length > 0 &&
      firstLinkout.links[0].link
    ) {
      return firstLinkout.links[0].link;
    }

    // Legacy format with url property
    if (firstLinkout.url) {
      return firstLinkout.url;
    }
  }

  // Handle direct object with cta_link
  if (!Array.isArray(linkouts) && linkouts.cta_link) {
    return linkouts.cta_link;
  }

  return null;
}

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
  const { changeActivePlayerType, embedData } = useEmbedContext();

  const handleClickOnEmbedTile = useCallback(() => {
    if (isAdPlaying) {
      return;
    }

    if (embedData.card_layout_id === 4) {
      // For card_layout_id 4, prioritize URLs in this order: CTA, first linkout, or no action
      const linkoutUrl = getLinkoutUrl(postDetails.video.linkouts);

      if (linkoutUrl) {
        window.open(linkoutUrl, "_blank");
        return;
      }

      // No expand view for card_layout_id 4(Grubhub)
      return;
    }

    // Default behavior for other card layouts
    if (postDetails.video.clickableUrl) {
      window.open(postDetails.video.clickableUrl, "_blank");
      return;
    }

    changeActivePlayerType("expand-view", index);
  }, [
    isAdPlaying,
    changeActivePlayerType,
    postDetails,
    embedData.card_layout_id,
  ]);

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
