"use client";
import { Avatar } from "@genuin/ui/avatar";
import { ReadMore } from "@genuin/components/molecules/read-more";
import { cn, getFormattedDuration, getMonthYear } from "@genuin/ui/utils";
import { useMemo, memo, type ComponentProps } from "react";
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
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";
import { Image } from "@genuin/ui/components/image";
import { compressText } from "@genuin/components/lib/utils";
import { Scrubber } from "../scrubber";
import { IHeartControls, IHeartFollowButton } from "../iheart";
import { getBrandType } from "../../../../lib/utils/brand-layout";

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

/**
 * Hook to get layout configuration and shared logic
 */
function useExpandViewConfig(postDetails: PostDetailsType): {
  layoutType: "default" | "iheart" | "ted" | "walmart" | "grubhub";
  defaultOpenCommentDialog: boolean;
  showSeeker: boolean;
  hideCommunityJoinButton: boolean;
  hideGroupSubscriptionButton: boolean;
  showLinkoutInExpand: boolean;
  hideGroupPill: boolean;
  hideCommunityPill: boolean;
  showScrubber: boolean;
} {
  const { showSeeker, showScrubber } = usePlayerContext();
  const { isDesktop } = useDeviceDetectMediaQuery();
  const embedDetails = useSafeEmbedContext();
  const embedConfig = useEmbedConfigs();
  const showLinkoutInExpand = embedConfig.links.showLinksInExpand;

  const videoLayoutId = embedConfig.view.isPlacementView
    ? postDetails.video.placement_video_layout_id
    : postDetails.video.videoLayoutId;
  const cardLayoutId = embedConfig.view.isPlacementView
    ? postDetails.video.placement_card_layout_id
    : postDetails.video.cardLayoutId;

  const layoutType = getBrandType(cardLayoutId, videoLayoutId) as
    | "default"
    | "iheart"
    | "ted"
    | "walmart"
    | "grubhub";

  // Configure visibility based on layout type instead of IDs
  const hideGroupPill = layoutType === "iheart" || layoutType === "ted";
  const hideCommunityPill = layoutType === "iheart";
  const hideCommunityJoinButton =
    layoutType === "iheart" || layoutType === "ted";
  const hideGroupSubscriptionButton =
    layoutType === "iheart" || layoutType === "ted";

  const defaultOpenCommentDialog = useMemo(() => {
    const openCommentDialog =
      (embedDetails?.embedData.autoUserInteractionToPerform ===
        "comment-spark" ||
        embedDetails?.embedData.autoUserInteractionToPerform === "comment") &&
      embedDetails.embedData.startVideoSlug === postDetails.video.slug &&
      !isDesktop &&
      !embedDetails?.embedEventBus.getContext().autoInteractionActionDone;
    if (openCommentDialog) {
      embedDetails.markAutoInteractionActionDone();
    }
    return openCommentDialog ?? false;
  }, [embedDetails, postDetails, isDesktop]);

  return {
    layoutType,
    defaultOpenCommentDialog,
    showSeeker,
    hideCommunityJoinButton,
    hideGroupSubscriptionButton,
    showLinkoutInExpand,
    hideGroupPill,
    hideCommunityPill,
    showScrubber,
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
  type: "default" | "iheart" | "ted" | "walmart" | "grubhub";
}) {
  switch (type) {
    case "iheart":
      return (
        <div className="gencl:flex gencl:gap-2 gencl:items-center gencl:text-white">
          <Image
            aspectRatio="square"
            src={
              "https://fastly.picsum.photos/id/576/200/200.jpg?hmac=pkNsIvSErgVpup1XYfj_NAE5ySK9YL7DmYlGGTTjScw"
            }
            alt={'postDetails.video.slug ?? ""'}
            className="gencl:size-12 gencl:rounded-md gencl:object-cover"
          />
          <div className="gencl:w-full gencl:flex gencl:flex-col gencl:gap-1">
            <p className="gencl:h-5 gencl:text-body-2-semi-bold gencl:line-clamp-1 gencl:tracking-[-0.35px]! gencl:flex gencl:items-center gencl:gap-2">
              {compressText("iHeart Sports 960", 25)}
              <span className="gencl:px-1.5 gencl:bg-[#CC032E] gencl:rounded-xs">
                LIVE
              </span>
              <IHeartFollowButton
                variant="outlined"
                size="xs"
                onClick={(e) => e.stopPropagation()}
              />
            </p>

            <ReadMore
              text={compressText(
                "The Sunday Read: ‘The Cryptocurrency Scam That Turned a Small Town Against Itself, The Sunday Read: ‘The Cryptocurrency Scam That Turned a Small Town Against Itself ",
                110
              )}
              shouldAnimate
              textClassName="gencl:text-body-2-normal gencl:tracking-[-0.35px]!"
              className="gencl:line-clamp-3"
            />
          </div>
        </div>
      );
    case "ted":
      return null;
    case "walmart":
    case "grubhub":
    case "default":
    default:
      return (
        <div className="gencl:flex gencl:gap-2 gencl:items-center gencl:text-white gencl:text-body-0-semi-bold">
          <Avatar
            imageUrl={owner.profileImage}
            alt={owner.name ?? ""}
            isAvatar={owner.isAvatar}
          />
          <ProfileLink
            url={buildPageUrl({
              type: !!owner.brand ? "brand" : "profile",
              slug: !!owner.brand ? owner.brand.slug : owner.userName,
            })}
            userLogoType={owner.brand?.userLogo}
          >
            @{owner.userName}
          </ProfileLink>
        </div>
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
  type: "default" | "iheart" | "ted" | "walmart" | "grubhub";
}) {
  switch (type) {
    case "iheart":
      return (
        <div className="gencl:z-10">
          <p className="gencl:text-white gencl:text-body-2-normal gencl:font-normal">
            {getMonthYear(video.createdAt ?? 0)}
            {video.duration && " • "}
            {getFormattedDuration(String(video.duration ?? ""))}{" "}
            <ReadMore
              text={video.description}
              showExpandText
              shouldAnimate
              position="overlay"
              textClassName="gencl:text-body-2-normal gencl:tracking-[-0.35px]! gencl:text-white/70!"
              className="gencl:line-clamp-5"
            />
          </p>
        </div>
      );
    case "ted":
      return (
        <ReadMore
          showExpandText={false}
          text={video.description}
          maxLines={2}
          shouldAnimate
          position="overlay"
          className="gencl:text-body-2-normal! gencl:[&_span]:leading-[125%]! gencl:tracking-[-0.042px]!"
          showOverlay={true}
        />
      );
    case "walmart":
    case "grubhub":
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
          showOverlay={true}
        />
      );
  }
}

/**
 * Shared actions component that handles different brand controls
 */
const SharedActions = memo(function SharedActions({
  postDetails,
  defaultOpenCommentDialog,
  onReactionStateChange,
  onCommentCountChange,
  layoutType,
}: {
  postDetails: PostDetailsType;
  defaultOpenCommentDialog: boolean;
  layoutType: "default" | "iheart" | "ted" | "walmart" | "grubhub";
  onCommentCountChange?: ComponentProps<
    typeof CommentsDialog
  >["onCommentCountChange"];
  onReactionStateChange?: (videoId: string, isReacted: boolean) => void;
}) {
  const embedDetails = useSafeEmbedContext();

  // Handle iHeart brand controls
  if (layoutType === "iheart") {
    return (
      <IHeartControls
        onClick={(e) => e.stopPropagation()}
        className={cn("gencl:gap-1 gencl:z-20")}
        size="lg"
        variant="expand"
        contentId={postDetails.video.id}
        shareUrl={postDetails.video.shareUrl}
        slug={postDetails.video.slug}
        isReacted={postDetails.video.isSparked ?? false}
        reactionCount={postDetails.video.sparkCount}
        onReactionStateChange={(isReacted) => {
          const videoId =
            postDetails.video.slug === embedDetails?.embedData.startVideoSlug
              ? postDetails.video.slug
              : postDetails.video.id;
          onReactionStateChange?.(videoId, isReacted);
        }}
      />
    );
  }

  // Default actions for other brands
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
        const videoId =
          postDetails.video.slug === embedDetails?.embedData.startVideoSlug
            ? postDetails.video.slug
            : postDetails.video.id;
        onReactionStateChange?.(videoId, isReacted);
      }}
    />
  );
});

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
    layoutType,
    defaultOpenCommentDialog,
    showSeeker,
    hideCommunityJoinButton,
    hideGroupSubscriptionButton,
    showLinkoutInExpand,
    hideGroupPill,
    hideCommunityPill,
    showScrubber,
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
      <div
        className={cn(
          "gencl:flex gencl:w-full gencl:gap-4 gencl:justify-between gencl:items-end gencl:transition-opacity gencl:duration-200",
          layoutType === "ted" && "gencl:gap-3",
          showScrubber &&
            layoutType === "iheart" &&
            "gencl:opacity-0 gencl:pointer-events-none"
        )}
      >
        <div
          className={cn(
            "gencl:flex gencl:flex-col gencl:gap-4 gencl:sm:gap-2 gencl:w-5/6 gencl:sm:w-full gencl:transition-all",
            layoutType === "ted" && "gencl:gap-3"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div onClick={(e) => e.stopPropagation()} className="gencl:z-10">
            <AdaptiveUserProfile owner={postDetails.owner} type={layoutType} />
          </div>

          {showLinkoutInExpand && layoutType !== "iheart" && (
            <Linkouts
              linkouts={postDetails.video.linkouts}
              linkoutId={postDetails.video.linkoutId}
              isActive={isActive}
              className={cn("gencl:w-full gencl:z-10", className)}
            />
          )}

          <AdaptiveDescription video={postDetails.video} type={layoutType} />
        </div>

        <SharedActions
          postDetails={postDetails}
          layoutType={layoutType}
          defaultOpenCommentDialog={defaultOpenCommentDialog}
          onReactionStateChange={onReactionStateChange}
          onCommentCountChange={onCommentCountChange}
        />
      </div>

      {(!hideGroupPill || !hideCommunityPill) && (
        <div
          className={cn(
            "gencl:w-full gencl:overflow-x-auto gencl:scrollbar-none gencl:transition-opacity gencl:duration-200",
            showScrubber &&
              layoutType === "iheart" &&
              "gencl:opacity-0 gencl:pointer-events-none"
          )}
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
            hideGroupPill={hideGroupPill}
            hideCommunityPill={hideCommunityPill}
          />
        </div>
      )}

      {layoutType === "iheart" ? (
        <div className="gencl:h-11 gencl:flex gencl:items-center">
          <Scrubber
            className={cn("gencl:z-20 gencl:transition-all")}
            showOnlyTime={true}
          />
        </div>
      ) : (
        <div
          className={cn(
            "gencl:h-0 gencl:transition-all",
            showSeeker && "gencl:h-4"
          )}
          onClick={(e) => e.stopPropagation()}
        />
      )}

      {/* iHeart: Show linkouts below seeker */}
      {showLinkoutInExpand &&
        layoutType === "iheart" &&
        postDetails.video.linkoutId && (
          <div className="gencl:h-11 gencl:flex gencl:items-center">
            <Linkouts
              linkouts={postDetails.video.linkouts}
              linkoutId={postDetails.video.linkoutId}
              isActive={isActive}
              className={cn("gencl:w-full", className)}
              cardVariant="primary"
              ctaOnly={true}
              showImmediately={true}
            />
          </div>
        )}
    </div>
  );
}
