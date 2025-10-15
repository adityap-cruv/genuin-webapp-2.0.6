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
import { Scrubber } from "../scrubber";
import { IHeartControls } from "../iheart";
import { getBrandType } from "@genuin/components/lib/utils/brand-layout";
import { ReadMoreTextType } from "@genuin/components/molecules/read-more/read-more.types";
import { Link } from "@genuin/components/molecules/link";

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
 * Removes the /clip segment and everything after it from a URL
 * @param url - The URL to process
 * @returns The base URL without /clip and subsequent segments
 * @example
 * // Returns "https://dev.listen.iheart.com/live/971-wash-fm-2501"
 * getBaseUrlWithoutClip("https://dev.listen.iheart.com/live/971-wash-fm-2501/clip/subscribe-for-more-bmw-content-visit-our-website-2rvh_bcde348d-74c4-4689-aa07-59d2648dfff9")
 */
function getBaseUrlWithoutClip(url: string): string {
  const clipIndex = url.indexOf("/clip");
  return clipIndex !== -1 ? url.substring(0, clipIndex) : url;
}

/**
 * Hook to get layout configuration and shared logic
 */
function useExpandViewConfig(postDetails: PostDetailsType): {
  brandLayoutType: "default" | "iheart" | "ted" | "walmart" | "grubhub";
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

  const brandLayoutType =
    embedConfig.view.brandLayoutType === "iheart"
      ? embedConfig.view.brandLayoutType
      : (getBrandType(cardLayoutId, videoLayoutId) as
          | "default"
          | "iheart"
          | "ted"
          | "walmart"
          | "grubhub");

  // Configure visibility based on layout type instead of IDs
  const hideGroupPill =
    brandLayoutType === "iheart" || brandLayoutType === "ted";
  const hideCommunityPill = brandLayoutType === "iheart";
  const hideCommunityJoinButton =
    brandLayoutType === "iheart" || brandLayoutType === "ted";
  const hideGroupSubscriptionButton =
    brandLayoutType === "iheart" || brandLayoutType === "ted";

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
    brandLayoutType,
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
  postDetails,
  type,
}: {
  postDetails: PostDetailsType;
  type: "default" | "iheart" | "ted" | "walmart" | "grubhub";
}) {
  switch (type) {
    case "iheart":
      const embedDetails = useSafeEmbedContext();
      const isPodcast = embedDetails?.embedData?.brand_context?.some(
        (context) => context.type === "podcast"
      );

      const podcastUrl = useMemo(
        () => getBaseUrlWithoutClip(window.location.href),
        []
      );

      return (
        <div className="gencl:flex gencl:gap-2 gencl:items-center gencl:text-white">
          {postDetails.video.attributes?.image_url && (
            <Link href={podcastUrl} bypassChecks>
              <Image
                aspectRatio="square"
                src={postDetails.video.attributes?.image_url ?? ""}
                alt={postDetails.video.attributes?.video_slug ?? ""}
                className="gencl:size-12 gencl:rounded-md gencl:object-cover"
              />
            </Link>
          )}
          <div className="gencl:w-full gencl:flex gencl:flex-col gencl:gap-1">
            {(postDetails.video.attributes?.station_title ||
              postDetails.video.attributes?.podcast_title) && (
              <Link href={podcastUrl} bypassChecks>
                <p className="gencl:h-5 gencl:text-body-2-semi-bold gencl:line-clamp-1 gencl:tracking-[-0.35px]! gencl:flex gencl:items-center gencl:gap-2">
                  {isPodcast
                    ? postDetails.video.attributes?.podcast_title
                    : postDetails.video.attributes?.station_title}

                  {/* <span className="gencl:px-1.5 gencl:bg-[#CC032E] gencl:rounded-xs">
                  LIVE
                </span> */}
                  {/* <IHeartFollowButton
                  variant="outlined"
                  size="xs"
                  onClick={(e) => e.stopPropagation()}
                /> */}
                </p>
              </Link>
            )}

            {postDetails.video.attributes?.description && (
              <ReadMore
                text={postDetails.video.attributes?.description ?? ""}
                shouldAnimate

              textClassName="gencl:text-body-2-normal gencl:tracking-[-0.35px]!"
              lineClampClassName="gencl:line-clamp-1"
              maxLines={2}
              />
            )}
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
            imageUrl={postDetails.owner.profileImage}
            alt={postDetails.owner.name ?? ""}
            isAvatar={postDetails.owner.isAvatar}
          />
          <ProfileLink
            url={buildPageUrl({
              type: !!postDetails.owner.brand ? "brand" : "profile",
              slug: !!postDetails.owner.brand
                ? postDetails.owner.brand.slug
                : postDetails.owner.userName,
            })}
            userLogoType={postDetails.owner.brand?.userLogo}
          >
            @{postDetails.owner.userName}
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
  const enhancedDescription: ReadMoreTextType = useMemo(() => {
    if (type !== "iheart") {
      return video.description
        ? Array.isArray(video.description)
          ? video.description
          : [video.description]
        : [];
    }

    const monthYear = getMonthYear(video.createdAt ?? 0);
    const duration = video.duration
      ? ` • ${getFormattedDuration(String(video.duration))}`
      : "";

    return [
      {
        type: "custom",
        text: `${monthYear}${duration}`,
        style: { color: "#ffffff" },
        className:
          "gencl:text-white gencl:text-body-2-normal gencl:font-normal",
      },
      " ",
      ...(video.description
        ? Array.isArray(video.description)
          ? video.description
          : [video.description]
        : []),
    ];
  }, [type, video.createdAt, video.duration, video.description]);
  switch (type) {
    case "iheart":
      return (
        <div className="gencl:z-10">
          <ReadMore
            text={enhancedDescription}
            showExpandText
            viewMoreText="more"
            viewLessText="less"
            position="overlay"
            textClassName="gencl:text-body-2-normal gencl:tracking-[-0.35px]! gencl:text-white/70!"
            maxLines={2}
            lineClampClassName="gencl:line-clamp-3"
          />
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
  brandLayoutType,
}: {
  postDetails: PostDetailsType;
  defaultOpenCommentDialog: boolean;
  brandLayoutType: "default" | "iheart" | "ted" | "walmart" | "grubhub";
  onCommentCountChange?: ComponentProps<
    typeof CommentsDialog
  >["onCommentCountChange"];
  onReactionStateChange?: (videoId: string, isReacted: boolean) => void;
}) {
  const embedDetails = useSafeEmbedContext();

  // Handle iHeart brand controls
  if (brandLayoutType === "iheart") {
    return (
      <IHeartControls
        onClick={(e) => e.stopPropagation()}
        className={cn("gencl:gap-1 gencl:z-20")}
        size="lg"
        variant="expand"
        contentId={postDetails.video.id}
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
    brandLayoutType,
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
          brandLayoutType === "ted" && "gencl:gap-3",
          showScrubber &&
            brandLayoutType === "iheart" &&
            "gencl:opacity-0 gencl:pointer-events-none"
        )}
      >
        <div
          className={cn(
            "gencl:flex gencl:flex-col gencl:gap-4 gencl:sm:gap-2 gencl:w-5/6 gencl:sm:w-full gencl:transition-all",
            brandLayoutType === "ted" && "gencl:gap-3"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div onClick={(e) => e.stopPropagation()} className="gencl:z-10">
            <AdaptiveUserProfile
              postDetails={postDetails}
              type={brandLayoutType}
            />
          </div>

          {showLinkoutInExpand && brandLayoutType !== "iheart" && (
            <Linkouts
              linkouts={postDetails.video.linkouts}
              linkoutId={postDetails.video.linkoutId}
              isActive={isActive}
              className={cn("gencl:w-full gencl:z-10", className)}
            />
          )}

          <AdaptiveDescription
            video={postDetails.video}
            type={brandLayoutType}
          />
        </div>

        <SharedActions
          postDetails={postDetails}
          brandLayoutType={brandLayoutType}
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
              brandLayoutType === "iheart" &&
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

      {brandLayoutType === "iheart" ? (
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
      {/* TODO : iheart phase-2 implementation  */}      {/* {showLinkoutInExpand &&
        brandLayoutType === "iheart" &&
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
        )} */}
    </div>
  );
}
