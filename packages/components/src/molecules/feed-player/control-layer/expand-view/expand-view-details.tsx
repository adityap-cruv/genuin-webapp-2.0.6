"use client";
import { Avatar } from "@genuin/ui/avatar";
import { ReadMore } from "@genuin/components/molecules/read-more";
import { cn, getFormattedDuration, getMonthYear } from "@genuin/ui/utils";
import {
  useMemo,
  memo,
  useEffect,
  useState,
  type ComponentProps,
  useCallback,
  useRef,
  lazy,
  Suspense,
} from "react";
import type { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import { usePlayerContext } from "../../context";
import { ProfileLink } from "@genuin/components/molecules/profile-link";
import { buildPageUrl } from "@genuin/components/lib/utils/pages";
import { Pills } from "@genuin/components/molecules/feed-player/pills";
import { controlLayerVariant } from "../control-layer";
import { VariantProps } from "class-variance-authority";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";
import { Image } from "@genuin/ui/components/image";
import { Scrubber } from "../scrubber";
import { IHeartControls, IHeartFollowButton } from "../embed/iheart";
import { getBrandType } from "@genuin/components/lib/utils/brand-layout";
import { ReadMoreTextType } from "@genuin/components/molecules/read-more/read-more.types";
import { Link } from "@genuin/components/molecules/link";
import { getBaseUrl } from "@genuin/components/lib/utils";
import { ClipPlayerCTA } from "../embed/iheart/clip-player-cta";
import { getBaseUrlWithouthighlights } from "../embed/iheart/use-iheart-playback";
import type { ExpandViewCallbacks } from "./types";
import { useSafeEmbedContext } from "@genuin/components/context/embed/context";

// Lazy load heavy components
const Actions = lazy(() =>
  import("../../../actions/index.js").then((m) => ({
    default: m.Actions,
  }))
);

const Linkouts = lazy(() =>
  import("@genuin/components/organisms/linkouts/index.js").then((m) => ({
    default: m.Linkouts,
  }))
);

const CommentsDialog = lazy(() =>
  import("../../../comments/index.js").then((m) => ({
    default: m.CommentsDialog,
  }))
);

type BrandLayoutType = "default" | "iheart" | "ted" | "walmart" | "grubhub";

// Utility functions
const brandHidesPills = (type: BrandLayoutType): boolean =>
  type === "iheart" || type === "ted";

const brandHidesCommunityFeatures = (type: BrandLayoutType): boolean =>
  type === "iheart" || type === "ted";

type ExpandViewProps = ComponentProps<"div"> & {
  postDetails: PostDetailsType;
  isActive: boolean;
} & ExpandViewCallbacks &
  VariantProps<typeof controlLayerVariant>;

/**
 * Hook to get layout configuration and shared logic
 */
function useExpandViewConfig(postDetails: PostDetailsType): {
  brandLayoutType: BrandLayoutType;
  defaultOpenCommentDialog: boolean;
  showSeeker: boolean;
  hideCommunityJoinButton: boolean;
  hideGroupSubscriptionButton: boolean;
  showLinkoutInExpand: boolean;
  hideGroupPill: boolean;
  hideCommunityPill: boolean;
  showScrubber: boolean;
  websiteType: "polaris" | "legacy";
  toggleExpandView?: () => void;
  totalVideos?: number;
  positionIndex?: number;
  videoAutoplay?: boolean;
} {
  const {
    showSeeker,
    showScrubber,
    toggleExpandView,
    totalVideos,
    positionIndex,
  } = usePlayerContext();
  const { isDesktop } = useDeviceDetectMediaQuery();
  const embedDetails = useSafeEmbedContext();
  const embedConfig = useEmbedConfigs();
  const {
    view: { websiteType },
    video: { videoAutoplay },
  } = useEmbedConfigs();
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
      : (getBrandType(cardLayoutId, videoLayoutId) as BrandLayoutType);

  // Configure visibility based on layout type using utility functions
  const hideGroupPill = brandHidesPills(brandLayoutType);
  const hideCommunityPill = brandLayoutType === "iheart";
  const hideCommunityJoinButton = brandHidesCommunityFeatures(brandLayoutType);
  const hideGroupSubscriptionButton =
    brandHidesCommunityFeatures(brandLayoutType);

  const shouldOpenCommentDialog = useMemo(() => {
    return (
      (embedDetails?.embedData.autoUserInteractionToPerform ===
        "comment-spark" ||
        embedDetails?.embedData.autoUserInteractionToPerform === "comment") &&
      embedDetails.embedData.startVideoSlug === postDetails.video.slug &&
      !isDesktop &&
      !embedDetails?.embedEventBus.getContext().autoInteractionActionDone
    );
  }, [embedDetails, postDetails.video.slug, isDesktop]);

  useEffect(() => {
    if (
      shouldOpenCommentDialog &&
      embedDetails?.embedData.autoUserInteractionToPerform === "comment"
    ) {
      embedDetails?.markAutoInteractionActionDone();
    }
  }, [shouldOpenCommentDialog, embedDetails]);

  return {
    brandLayoutType,
    defaultOpenCommentDialog: shouldOpenCommentDialog,
    showSeeker,
    hideCommunityJoinButton,
    hideGroupSubscriptionButton,
    showLinkoutInExpand,
    hideGroupPill,
    hideCommunityPill,
    showScrubber,
    websiteType,
    toggleExpandView,
    totalVideos,
    positionIndex,
    videoAutoplay,
  };
}

/**
 * User profile component that adapts based on layout
 */
const AdaptiveUserProfile = memo(function AdaptiveUserProfile({
  postDetails,
  type,
  isExpanded,
  onExpand,
  websiteType,
}: {
  postDetails: PostDetailsType;
  type: BrandLayoutType;
  isExpanded?: boolean;
  onExpand?: () => void;
  websiteType: "polaris" | "legacy";
  isActive?: boolean;
}) {
  const { video, owner } = postDetails;
  const { attributes } = video;

  switch (type) {
    case "iheart":
      const embedContext = useSafeEmbedContext();
      const contentType = embedContext?.embedData.brand_context?.some((val) => {
        return val.type === "podcast";
      })
        ? "podcast"
        : "station";

      const linkUrl = useMemo(() => {
        if (typeof window === "undefined") return "";

        // If content type matches, use current URL without highlights
        if (contentType === attributes?.type) {
          return getBaseUrlWithouthighlights({
            type: attributes.type,
            slug: attributes.slug,
          });
        }

        // Otherwise, generate URL for the other content type
        const baseUrl = getBaseUrl(window.location.href);
        const path = attributes?.type === "podcast" ? "/podcast" : "/live";
        const slug = postDetails.video.attributes?.slug;

        return `${baseUrl}${path}/${slug}`;
      }, [contentType, attributes?.type, postDetails.video.attributes?.slug]);

      return (
        <div className="gencl:flex gencl:gap-2 gencl:items-center gencl:text-white">
          {attributes?.image_url && (
            <div className="gencl:shrink-0! gencl:size-16 gencl:rounded-md">
              <Link
                href={linkUrl}
                bypassChecks
                aria-label={`${postDetails.video.attributes?.title || contentType} podcast artwork`}
                tabIndex={0}
              >
                <Image
                  aspectRatio="square"
                  src={attributes.image_url}
                  alt={`${postDetails.video.attributes?.title || contentType} podcast artwork`}
                  className={cn(
                    "gencl:rounded-md gencl:object-cover gencl:size-[68px]"
                  )}
                />
              </Link>
            </div>
          )}
          <div className="gencl:w-full gencl:flex gencl:flex-col gencl:self-start">
            <div className="gencl:flex gencl:items-center gencl:gap-2 gencl:h-11">
              {postDetails.video.attributes?.title && (
                <Link
                  href={linkUrl}
                  bypassChecks
                  aria-label={`${postDetails.video.attributes?.title} heading`}
                  tabIndex={0}
                >
                  <ReadMore
                    text={postDetails.video.attributes?.title}
                    shouldAnimate
                    lineClampClassName="gencl:line-clamp-1"
                    maxLines={1}
                    showExpandText={false}
                    expandable={false}
                    position="overlay"
                    textClassName={cn(
                      "gencl:my-3! gencl:h-5 gencl:flex gencl:items-center gencl:gap-2 gencl:font-semibold gencl:leading-[24px] gencl:tracking-[-0.2px] gencl:lg:font-semibold! gencl:lg:leading-[24px]! gencl:lg:tracking-[-0.2px]! gencl:break-all!",
                      websiteType === "polaris"
                        ? "gencl:text-[16px] gencl:lg:text-[17px]!"
                        : "gencl:text-[16px]"
                    )}
                  />
                </Link>
              )}

              <div className="gencl:h-11 gencl:flex gencl:items-center">
                <IHeartFollowButton
                  websiteType={websiteType}
                  attributes={attributes}
                  videoSlug={video.slug}
                  videoId={video.id}
                />
              </div>
            </div>

            {attributes?.description && (
              <ReadMore
                text={attributes.description}
                shouldAnimate
                lineClampClassName="gencl:line-clamp-3"
                maxLines={2}
                open={isExpanded}
                showExpandText={false}
                expandable={false}
                position="overlay"
                textClassName="gencl:text-body-2-normal gencl:tracking-[-0.35px] gencl:lg:text-[14px]! gencl:lg:font-normal! gencl:lg:leading-[18px]! gencl:lg:tracking-[-0.5px]!"
                aria-label={attributes.description}
                tabIndex={0}
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
});

/**
 * Description component that adapts based on layout
 */
const AdaptiveDescription = memo(function AdaptiveDescription({
  video,
  type,
  isExpanded,
  onExpand,
  layoutType,
  onSwiperToggle,
}: {
  video: PostDetailsType["video"];
  type: BrandLayoutType;
  isExpanded?: boolean;
  onExpand?: () => void;
  layoutType?: BrandLayoutType;
  onSwiperToggle?: (disable: boolean) => void;
}) {
  const { description, createdAt, duration } = video;

  const enhancedDescription: ReadMoreTextType = useMemo(() => {
    if (type !== "iheart") {
      return description
        ? Array.isArray(description)
          ? description
          : [description]
        : [];
    }

    const monthYear = getMonthYear(createdAt ?? 0);
    const durationText = duration
      ? ` • ${getFormattedDuration(String(duration))}`
      : "";

    return [
      {
        type: "custom",
        text: `${monthYear}${durationText}`,
        style: { color: "#ffffff" },
        className:
          "gencl:text-[12px] gencl:font-normal gencl:leading-[20px] gencl:tracking-[-0.35px]! gencl:lg:text-[14px]! gencl:lg:font-normal! gencl:lg:leading-[18px]! gencl:lg:tracking-[-0.5px]!",
      },
      " ",
      ...(description
        ? Array.isArray(description)
          ? description
          : [description]
        : []),
    ];
  }, [type, createdAt, duration, description]);

  switch (type) {
    case "iheart":
      return (
        <div className="gencl:z-10">
          <ReadMore
            text={enhancedDescription}
            showExpandText
            viewMoreText="More"
            shouldAnimate
            expandable
            showBottomOverlay={layoutType === "iheart"}
            open={isExpanded}
            onExpandChange={onExpand}
            viewLessText="Less"
            expandedHeight="20vh"
            position="overlay"
            showOverlay={true}
            isLineTruncate={false}
            buttonClassName="gencl:text-white! gencl:font-bold gencl:text-[12px] gencl:lg:text-[14px]! gencl:leading-[18px] gencl:tracking-[-0.5px] gencl:align-bottom gencl:hover:no-underline"
            textClassName="gencl:text-[12px] gencl:font-normal gencl:leading-[20px] gencl:tracking-[-0.35px]! gencl:lg:text-[14px]! gencl:lg:font-normal! gencl:lg:leading-[18px]! gencl:lg:tracking-[-0.5px]! gencl:text-white! gencl:pt-1!"
            maxLines={2}
            tabIndex={0}
            aria-label={`${getMonthYear(createdAt ?? 0)}${duration ? ` • ${getFormattedDuration(String(duration))}` : ""} ${Array.isArray(description) ? description.join(" ") : description || ""}, Video description`}
            onPointerEnter={() => {
              onSwiperToggle?.(true);
            }}
            onPointerLeave={() => {
              onSwiperToggle?.(false);
            }}
            onTouchStart={() => {
              onSwiperToggle?.(true);
            }}
            onTouchEnd={() => {
              onSwiperToggle?.(false);
            }}
          />
        </div>
      );
    case "ted":
      return (
        <ReadMore
          showExpandText={false}
          text={description}
          maxLines={2}
          shouldAnimate
          position="overlay"
          className="gencl:text-body-2-normal! gencl:[&_span]:leading-[125%]! gencl:tracking-[-0.042px]!"
          showOverlay={true}
          onPointerEnter={() => {
            onSwiperToggle?.(true);
          }}
          onPointerLeave={() => {
            onSwiperToggle?.(false);
          }}
          onTouchStart={() => {
            onSwiperToggle?.(true);
          }}
          onTouchEnd={() => {
            onSwiperToggle?.(false);
          }}
        />
      );
    case "walmart":
    case "grubhub":
    case "default":
    default:
      return (
        <ReadMore
          showExpandText={false}
          text={description}
          maxLines={2}
          shouldAnimate
          position="overlay"
          className="gencl:text-body-1-medium"
          showOverlay={true}
          onPointerEnter={() => {
            onSwiperToggle?.(true);
          }}
          onPointerLeave={() => {
            onSwiperToggle?.(false);
          }}
          onTouchStart={() => {
            onSwiperToggle?.(true);
          }}
          onTouchEnd={() => {
            onSwiperToggle?.(false);
          }}
        />
      );
  }
});

/**
 * Hook to determine iHeart scrubber visibility styling
 */
function useIHeartScrubberVisibility(
  showScrubber: boolean,
  brandLayoutType: BrandLayoutType
) {
  return {
    shouldHide: showScrubber && brandLayoutType === "iheart",
    hiddenClassName: "gencl:opacity-0 gencl:pointer-events-none",
  };
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
  isActive,
}: {
  postDetails: PostDetailsType;
  defaultOpenCommentDialog: boolean;
  brandLayoutType: BrandLayoutType;
  onCommentCountChange?: ComponentProps<
    typeof CommentsDialog
  >["onCommentCountChange"];
  onReactionStateChange?: (
    videoId: string,
    videoSlug: string,
    isReacted: boolean
  ) => void;
  isActive: boolean;
}) {
  // Handle iHeart brand controls
  if (brandLayoutType === "iheart") {
    return (
      <IHeartControls
        onClick={(e) => e.stopPropagation()}
        className={cn("gencl:gap-1 gencl:z-20")}
        size="lg"
        variant="expand"
        isActive={isActive}
        contentId={postDetails.video.id}
        slug={postDetails.video.slug}
        isReacted={postDetails.video.isSparked ?? false}
        reactionCount={postDetails.video.sparkCount}
        onReactionStateChange={(isReacted) => {
          onReactionStateChange?.(
            postDetails.video.id,
            postDetails.video.slug,
            isReacted
          );
        }}
        videoDetails={postDetails.video}
      />
    );
  }

  // Default actions for other brands
  return (
    <Suspense fallback={null}>
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
          onReactionStateChange?.(
            postDetails.video.id,
            postDetails.video.slug,
            isReacted
          );
        }}
      />
    </Suspense>
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
  onSwiperToggle,
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
    websiteType,
    toggleExpandView,
    totalVideos,
    positionIndex,
    videoAutoplay,
  } = useExpandViewConfig(postDetails);
  const { brand } = useEmbedConfigs();
  const [isExpanded, setIsExpanded] = useState(false);
  const scrubberRef = useRef<HTMLDivElement>(null);

  const { shouldHide, hiddenClassName } = useIHeartScrubberVisibility(
    showScrubber,
    brandLayoutType
  );

  const onExpand = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  return (
    <div
      data-expand-view="true"
      className={cn(
        "gencl:absolute gencl:gap-2 gencl:w-full gencl:z-20 gencl:right-0 gencl:bottom-0 gencl:p-4 gencl:focus:outline-none",
        brandLayoutType !== "iheart" &&
          "gencl:bg-gradient-to-t gencl:from-black/50 gencl:to-transparent",
        className
      )}
      {...restProps}
    >
      <div
        className={cn(
          "gencl:flex gencl:w-full gencl:gap-4 gencl:justify-between gencl:items-end gencl:transition-opacity gencl:duration-200",
          brandLayoutType === "ted" && "gencl:gap-3",
          shouldHide && hiddenClassName
        )}
      >
        <div
          className={cn(
            "gencl:flex gencl:flex-col gencl:gap-4 gencl:sm:gap-2 gencl:w-5/6 gencl:sm:w-full gencl:transition-all",
            brandLayoutType === "ted" ||
              (brandLayoutType === "iheart" && "gencl:gap-3")
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="gencl:z-20">
            {/**
             * If the brand is US Weekly, we do not show the user profile in expand view.
             */}
            {!brand.isUsWeekly && (
              <AdaptiveUserProfile
                postDetails={postDetails}
                type={brandLayoutType}
                {...(brandLayoutType === "iheart" && {
                  isExpanded,
                  onExpand,
                })}
                websiteType={websiteType}
                isActive={isActive}
              />
            )}
          </div>

          {showLinkoutInExpand &&
            brandLayoutType !== "iheart" &&
            postDetails.video.linkoutId && (
              <Suspense fallback={null}>
                <Linkouts
                  linkouts={postDetails.video.linkouts}
                  linkoutId={postDetails.video.linkoutId}
                  isActive={isActive}
                  className={cn("gencl:w-full gencl:z-10", className)}
                  videoDetails={postDetails.video}
                  totalVideos={totalVideos}
                  positionIndex={positionIndex}
                  autoplay={videoAutoplay}
                />
              </Suspense>
            )}

          <AdaptiveDescription
            video={postDetails.video}
            type={brandLayoutType}
            {...(brandLayoutType === "iheart" && {
              isExpanded,
              onExpand,
            })}
            layoutType={brandLayoutType}
            onSwiperToggle={onSwiperToggle}
          />
        </div>

        <SharedActions
          postDetails={postDetails}
          brandLayoutType={brandLayoutType}
          defaultOpenCommentDialog={defaultOpenCommentDialog}
          onReactionStateChange={onReactionStateChange}
          onCommentCountChange={onCommentCountChange}
          isActive={isActive}
        />
      </div>
      {(!hideGroupPill || !hideCommunityPill) && (
        <div
          role="group"
          aria-label="Community and group information"
          tabIndex={0}
          className={cn(
            "swiper-no-swiping gencl:w-full gencl:overflow-x-auto gencl:scrollbar-none gencl:transition-opacity",
            shouldHide && hiddenClassName
          )}
          onClick={(e) => {
            e.stopPropagation();
          }}
          onPointerEnter={() => {
            onSwiperToggle?.(true);
          }}
          onPointerLeave={() => {
            onSwiperToggle?.(false);
          }}
          onTouchStart={() => {
            onSwiperToggle?.(true);
          }}
          onTouchEnd={() => {
            onSwiperToggle?.(false);
          }}
          style={{
            scrollBehavior: "smooth",
          }}
        >
          <Pills
            communityDetails={postDetails.community}
            groupDetails={postDetails.group}
            videoId={postDetails.video.id}
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
        <div
          ref={scrubberRef}
          className="gencl:h-11 gencl:flex gencl:items-center gencl:relative gencl:z-10"
          data-scrubber-container="true"
        >
          <Scrubber
            className={cn("gencl:z-20 gencl:transition-all")}
            showOnlyTime={true}
            duration={postDetails.video.duration}
          />
        </div>
      ) : (
        <div
          aria-hidden="true"
          className={cn(
            "gencl:h-0 gencl:transition-all",
            showSeeker && "gencl:h-4"
          )}
        />
      )}
      {/* iHeart: Show linkouts below seeker */}
      {/* TODO : iheart phase-2 implementation  */}{" "}
      {brandLayoutType === "iheart" && (
        <div className="gencl:h-11 gencl:flex gencl:items-center gencl:relative gencl:z-10">
          <ClipPlayerCTA
            websiteType={websiteType}
            postDetails={postDetails}
            toggleExpandView={toggleExpandView}
            isActive={isActive}
          />
        </div>
      )}
    </div>
  );
}
