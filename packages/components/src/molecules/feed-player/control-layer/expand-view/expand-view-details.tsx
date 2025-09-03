"use client";
import { Avatar } from "@genuin/ui/avatar";
import { ReadMore } from "@genuin/components/molecules/read-more";
import { cn, getFormattedDuration, getMonthYear } from "@genuin/ui/utils";
import { useMemo, type ComponentProps } from "react";
import type { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import { usePlayerContext } from "../../context";
import { ProfileLink } from "@genuin/components/molecules/profile-link";
import { buildPageUrl } from "@genuin/components/lib/utils/pages";
import { Pills } from "@genuin/components/molecules/feed-player/pills";
import { Actions } from "@genuin/components/molecules/actions";
import { CommentsDialog } from "@genuin/components/molecules/comments";
import { controlLayerVariant } from "../control-layer";
import { VariantProps } from "class-variance-authority";
import { useSafeEmbedContext } from "@genuin/components/context/embed/context";
import { Linkouts } from "@genuin/components/organisms";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";

type ExpandViewProps = ComponentProps<"div"> & {
  postDetails: PostDetailsType;
  isActive: boolean;
  onReactionStateChange?: (videoId: string, isReacted: boolean) => void;
  onGroupJoinStatusChange?: ComponentProps<
    typeof Pills
  >["onGroupJoinStatusChange"];
  onGroupSubscriptionChange?: ComponentProps<
    typeof Pills
  >["onGroupSubscriptionChange"];
  onCommunityJoinStatusChange?: ComponentProps<
    typeof Pills
  >["onCommunityJoinStatusChange"];
  onCommentCountChange?: ComponentProps<
    typeof CommentsDialog
  >["onCommentCountChange"];
} & VariantProps<typeof controlLayerVariant>;

// Layout configuration interface
interface LayoutConfig {
  userProfile: "default" | "iheart";
  description: "default" | "iheart";
  linkouts: {
    cardVariant?: "default" | "primary";
  };
}

// Layout configurations
const LAYOUT_CONFIGS: Record<number | "default", LayoutConfig> = {
  default: {
    userProfile: "default",
    description: "default",
    linkouts: {
      cardVariant: "default",
    },
  },
  2: {
    // iHeart
    userProfile: "iheart",
    description: "iheart",
    linkouts: {
      cardVariant: "primary",
    },
  },
  6: {
    // Walmart
    userProfile: "default",
    description: "default",
    linkouts: {
      cardVariant: "default",
    },
  },
};

/**
 * Hook to get layout configuration and shared logic
 */
function useExpandViewConfig(postDetails: PostDetailsType): {
  config: LayoutConfig;
  defaultOpenCommentDialog: boolean;
  showSeeker: boolean;
  hideCommunityJoinButton: boolean;
  hideGroupSubscriptionButton: boolean;
  showLinkoutInExpand: boolean;
} {
  const { showSeeker } = usePlayerContext();
  const embedDetails = useSafeEmbedContext();
  const embedConfig = useEmbedConfigs();

  const videoLayoutId = postDetails.video.videoLayoutId;
  const placementVideoLayoutId = postDetails.video.placement_video_layout_id;
  const showLinkoutInExpand = embedConfig.links.showLinksInExpand ?? true;

  // Determine layout config
  let config = LAYOUT_CONFIGS.default;
  if (videoLayoutId && LAYOUT_CONFIGS[videoLayoutId]) {
    config = LAYOUT_CONFIGS[videoLayoutId];
  } else if (placementVideoLayoutId === 1) {
    config = LAYOUT_CONFIGS[6]!; // Use Walmart config for placement layout 1
  }

  // Determine button visibility based on layout IDs
  const shouldHideButtons = videoLayoutId === 5 && placementVideoLayoutId === 1;

  const defaultOpenCommentDialog = useMemo(() => {
    return (
      embedDetails?.embedData.autoUserInteractionToPerform ===
        "comment-spark" &&
      embedDetails.embedData.startVideoSlug === postDetails.video.slug
    );
  }, [embedDetails, postDetails]);

  return {
    config,
    defaultOpenCommentDialog,
    showSeeker,
    hideCommunityJoinButton: shouldHideButtons,
    hideGroupSubscriptionButton: shouldHideButtons,
    showLinkoutInExpand,
  };
}

/**
 * User profile component that adapts based on layout
 */
function AdaptiveUserProfile({
  owner,
  type,
}: {
  owner: PostDetailsType["owner"];
  type: "default" | "iheart";
}) {
  switch (type) {
    case "iheart":
      return (
        <div>
          <p className="gencl:text-body-2-semi-bold gencl:line-clamp-1">
            {owner.name}
          </p>
          <p className="gencl:text-body-2-normal gencl:line-clamp-2">
            {owner.bio}
          </p>
        </div>
      );
    case "default":
    default:
      return (
        <ProfileLink
          url={buildPageUrl({
            type: !!owner.brand ? "brand" : "profile",
            slug: !!owner.brand ? owner.brand.slug : owner.userName,
          })}
          userLogoType={owner.brand?.userLogo}
        >
          @{owner.userName}
        </ProfileLink>
      );
  }
}

/**
 * Description component that adapts based on layout
 */
function AdaptiveDescription({
  video,
  type,
}: {
  video: PostDetailsType["video"];
  type: "default" | "iheart";
}) {
  switch (type) {
    case "iheart":
      return (
        <div>
          <p className="gencl:text-white gencl:text-body-2-semi-bold gencl:font-normal">
            {getMonthYear(video.attributes?.timestamp ?? video.createdAt ?? 0)}{" "}
            • {getFormattedDuration(String(video.duration ?? ""))}
          </p>
          <ReadMore
            showExpandText={false}
            text={video.description ?? ""}
            maxLines={2}
            shouldAnimate
            position="overlay"
            textClassName="gencl:text-body-2-normal"
          />
        </div>
      );
    case "default":
    default:
      return (
        <ReadMore
          showExpandText={false}
          text={video.description}
          maxLines={2}
          shouldAnimate
          position="overlay"
          className="gencl:text-body-1-medium"
        />
      );
  }
}

/**
 * Shared actions component
 */
function SharedActions({
  postDetails,
  defaultOpenCommentDialog,
  onReactionStateChange,
  onCommentCountChange,
}: {
  postDetails: PostDetailsType;
  defaultOpenCommentDialog: boolean;
  onCommentCountChange?: ComponentProps<
    typeof CommentsDialog
  >["onCommentCountChange"];
  onReactionStateChange?: (videoId: string, isReacted: boolean) => void;
}) {
  return (
    <Actions
      onClick={(e) => e.stopPropagation()}
      className="gencl:sm:hidden!"
      variant="mobile"
      theme="dark"
      contentId={postDetails.video.id}
      isReacted={postDetails.video.isSparked ?? false}
      reactionCount={postDetails.video.sparkCount}
      shareUrl={postDetails.video.shareUrl}
      slug={postDetails.video.slug}
      groupSlug={postDetails.group.slug}
      actionWrapper={{
        COMMENT: (defaultNode) => {
          return (
            <CommentsDialog
              key="comment-dialog"
              shareUrl={postDetails.video.shareUrl}
              communityId={postDetails.community.id}
              loopId={postDetails.group.id}
              videoId={postDetails.video.id}
              videoSlug={postDetails.video.slug}
              commentCount={postDetails.video.commentCount}
              defaultOpen={defaultOpenCommentDialog}
              onCommentCountChange={(videoId, increment) => {
                onCommentCountChange?.(videoId, increment);
              }}
            >
              {defaultNode}
              <p className="gencl:text-body-2-medium gencl:text-white!">
                {postDetails.video.commentCount}
              </p>
            </CommentsDialog>
          );
        },
      }}
      onReactionStateChange={(isReacted) => {
        onReactionStateChange?.(postDetails.video.id, isReacted);
      }}
    />
  );
}

export function ExpandViewDetails({
  className,
  postDetails,
  isActive,
  variant,
  onGroupJoinStatusChange,
  onGroupSubscriptionChange,
  onCommunityJoinStatusChange,
  onReactionStateChange,
  onCommentCountChange,
  ...restProps
}: ExpandViewProps) {
  const {
    config,
    defaultOpenCommentDialog,
    showSeeker,
    hideCommunityJoinButton,
    hideGroupSubscriptionButton,
    showLinkoutInExpand,
  } = useExpandViewConfig(postDetails);

  return (
    <div
      className={cn(
        "gencl:absolute gencl:gap-2 gencl:w-full gencl:z-20 gencl:right-0 gencl:bottom-0 gencl:p-4",
        "gencl:bg-gradient-to-b gencl:from-[#11111100] gencl:to-[#111111b3]",
        className
      )}
      {...restProps}
    >
      <div className="gencl:flex gencl:w-full gencl:gap-4 gencl:justify-between gencl:items-end">
        <div
          className="gencl:flex gencl:flex-col gencl:gap-4 gencl:sm:gap-2 gencl:w-5/6 gencl:sm:w-full gencl:transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="gencl:flex gencl:gap-2 gencl:items-center gencl:text-white gencl:text-body-0-semi-bold"
            onClick={(e) => e.stopPropagation()}
          >
            <Avatar
              imageUrl={postDetails.owner.profileImage}
              alt={postDetails.owner.name ?? ""}
              isAvatar={postDetails.owner.isAvatar}
            />
            <AdaptiveUserProfile
              owner={postDetails.owner}
              type={config.userProfile}
            />
          </div>

          {showLinkoutInExpand && (
            <Linkouts
              linkouts={postDetails.video.linkouts}
              linkoutId={postDetails.video.linkoutId}
              isActive={isActive}
              className="gencl:w-full"
              cardVariant={config.linkouts.cardVariant}
            />
          )}

          <AdaptiveDescription
            video={postDetails.video}
            type={config.description}
          />
        </div>

        <SharedActions
          postDetails={postDetails}
          defaultOpenCommentDialog={defaultOpenCommentDialog}
          onReactionStateChange={onReactionStateChange}
          onCommentCountChange={onCommentCountChange}
        />
      </div>

      <div
        className="gencl:w-full gencl:overflow-x-auto gencl:scrollbar-none"
        onClick={(e) => {
          e.stopPropagation();
        }}
        style={{
          scrollBehavior: "smooth",
        }}
      >
        <Pills
          communityDetails={postDetails.community}
          groupDetails={postDetails.group}
          onGroupJoinStatusChange={onGroupJoinStatusChange}
          onGroupSubscriptionChange={onGroupSubscriptionChange}
          onCommunityJoinStatusChange={onCommunityJoinStatusChange}
          variant="fullScreen"
          className="gencl:min-w-max gencl:pt-3"
          hideCommunityJoinButton={hideCommunityJoinButton}
          hideGroupSubscriptionButton={hideGroupSubscriptionButton}
        />
      </div>

      <div
        className={cn(
          "gencl:h-0 gencl:transition-all",
          showSeeker && "gencl:h-4"
        )}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
