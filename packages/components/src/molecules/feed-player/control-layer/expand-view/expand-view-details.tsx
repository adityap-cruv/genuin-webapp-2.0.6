"use client";
import { Avatar } from "@genuin/ui/avatar";
import { Image } from "@genuin/ui/components/image";
import { cn, getFormattedDuration, getMonthYear } from "@genuin/ui/utils";
import type { VariantProps } from "class-variance-authority";
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
  forwardRef,
  useImperativeHandle,
} from "react";

import { VideoTypes } from "@genuin/components/context";
import { useSafeEmbedContext } from "@genuin/components/context/embed/context";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";
import useViewportHeight from "@genuin/components/hooks/use-screen-height";
import { getBaseUrl } from "@genuin/components/lib/utils";
import { getBrandType } from "@genuin/components/lib/utils/brand-layout";
import { buildPageUrl } from "@genuin/components/lib/utils/pages";
import { Pills } from "@genuin/components/molecules/feed-player/pills";
import { Link } from "@genuin/components/molecules/link";
import { ProfileLink } from "@genuin/components/molecules/profile-link";
import { ReadMore } from "@genuin/components/molecules/read-more";
import type { ReadMoreTextType } from "@genuin/components/molecules/read-more/read-more.types";
import type { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";

import { usePlayerContext } from "../../context";
import type { controlLayerVariant } from "../control-layer";
import { IHeartControls } from "../embed/iheart";
import { ClipPlayerCTA } from "../embed/iheart/clip-player-cta";
import { getBaseUrlWithouthighlights } from "../embed/iheart/use-iheart-playback";
import { OctoExpandSheet, type OctoExpandSheetRef } from "../octo/octo-expand-sheet";
import { Scrubber } from "../scrubber";

import type { ExpandViewCallbacks } from "./types";

// Lazy load heavy components
const Actions = lazy(() =>
  import("../../../actions").then((m) => ({
    default: m.Actions,
  }))
);

const Linkouts = lazy(() =>
  import("@genuin/components/organisms/linkouts").then((m) => ({
    default: m.Linkouts,
  }))
);

const CommentsDialog = lazy(() =>
  import("../../../comments").then((m) => ({
    default: m.CommentsDialog,
  }))
);

type BrandLayoutType = "default" | "iheart" | "ted" | "walmart" | "grubhub";

// Utility functions
const brandHidesPills = (type: BrandLayoutType): boolean => type === "iheart" || type === "ted";

const brandHidesCommunityFeatures = (type: BrandLayoutType): boolean => type === "iheart" || type === "ted";

type ExpandViewProps = ComponentProps<"div"> & {
  postDetails: PostDetailsType;
  isActive: boolean;
} & ExpandViewCallbacks &
  VariantProps<typeof controlLayerVariant>;

export type ExpandViewDetailsRef = {
  closeSheet: () => void;
};

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
  const { showSeeker, showScrubber, toggleExpandView, totalVideos, positionIndex } = usePlayerContext();
  const { isDesktop } = useDeviceDetectMediaQuery();
  const embedDetails = useSafeEmbedContext();
  const embedConfig = useEmbedConfigs();
  const {
    view: { websiteType, brandLayoutType: embedBrandLayoutType },
    video: { videoAutoplay },
  } = useEmbedConfigs();
  const showLinkoutInExpand = embedConfig.links.showLinksInExpand;

  const videoLayoutId = embedConfig.view.isPlacementView
    ? postDetails.video?.placement_video_layout_id
    : postDetails.video?.videoLayoutId;
  const cardLayoutId = embedConfig.view.isPlacementView
    ? postDetails.video?.placement_card_layout_id
    : postDetails.video?.cardLayoutId;

  const brandLayoutType = embedDetails
    ? embedConfig.view.brandLayoutType === "iheart"
      ? embedConfig.view.brandLayoutType
      : (getBrandType(cardLayoutId, videoLayoutId) as BrandLayoutType)
    : "default";

  // Configure visibility based on layout type using utility functions
  const hideGroupPill = brandHidesPills(brandLayoutType);
  const hideCommunityPill = brandLayoutType === "iheart";
  const hideCommunityJoinButton = brandHidesCommunityFeatures(brandLayoutType);
  const hideGroupSubscriptionButton = brandHidesCommunityFeatures(brandLayoutType);

  const shouldOpenCommentDialog = useMemo(() => {
    return (
      (embedDetails?.embedData.autoUserInteractionToPerform === "comment-spark" ||
        embedDetails?.embedData.autoUserInteractionToPerform === "comment") &&
      embedDetails.embedData.startVideoSlug === postDetails.video?.slug &&
      !isDesktop &&
      !embedDetails?.embedEventBus.getContext().autoInteractionActionDone
    );
  }, [embedDetails, postDetails.video?.slug, isDesktop]);

  useEffect(() => {
    if (shouldOpenCommentDialog && embedDetails?.embedData.autoUserInteractionToPerform === "comment") {
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
  onExpand: _onExpand,
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
  const attributes = video?.attributes;

  const embedContext = useSafeEmbedContext();
  const contentType = embedContext?.embedData.brand_context?.some((val) => val.type === "podcast")
    ? "podcast"
    : "station";

  const linkUrl = useMemo(() => {
    if (typeof window === "undefined" || !attributes) return "";
    if (contentType === attributes.type) {
      return getBaseUrlWithouthighlights({
        type: attributes.type,
        slug: attributes.slug,
      });
    }
    const baseUrl = getBaseUrl(window.location.href);
    const path = attributes.type === "podcast" ? "/podcast" : "/live";
    const slug = video?.attributes?.slug;
    return `${baseUrl}${path}/${slug}`;
  }, [contentType, attributes?.type, attributes?.slug, video?.attributes?.slug]);

  if (!video) return null;

  switch (type) {
    case "iheart": {
      return (
        <div className="gencl:flex gencl:gap-2 gencl:items-center gencl:text-white">
          {attributes?.image_url && (
            <div className="gencl:shrink-0! gencl:size-16 gencl:rounded-md">
              <Link
                href={linkUrl}
                bypassChecks
                aria-label={`${postDetails.video?.attributes?.title || contentType} podcast artwork`}
                tabIndex={0}
                target="_blank">
                <Image
                  aspectRatio="square"
                  src={attributes.image_url}
                  alt={`${postDetails.video?.attributes?.title || contentType} podcast artwork`}
                  className={cn("gencl:rounded-md gencl:object-cover gencl:size-[68px]")}
                />
              </Link>
            </div>
          )}
          <div className="gencl:w-full gencl:flex gencl:flex-col gencl:self-start">
            <div className="gencl:flex gencl:items-center gencl:gap-2 gencl:h-11">
              {postDetails.video?.attributes?.title && (
                <Link
                  href={linkUrl}
                  bypassChecks
                  aria-label={`${postDetails.video.attributes?.title} heading`}
                  tabIndex={0}
                  target="_blank">
                  <ReadMore
                    text={video.attributes?.title}
                    shouldAnimate
                    lineClampClassName="gencl:line-clamp-1"
                    maxLines={1}
                    showExpandText={false}
                    expandable={false}
                    position="overlay"
                    textClassName={cn(
                      "gencl:my-3! gencl:h-5 gencl:flex gencl:items-center gencl:gap-2 gencl:font-semibold gencl:leading-[24px] gencl:tracking-[-0.2px] gencl:lg:font-semibold! gencl:lg:leading-[24px]! gencl:lg:tracking-[-0.2px]! gencl:break-all!",
                      websiteType === "polaris" ? "gencl:text-[16px] gencl:lg:text-[17px]!" : "gencl:text-[16px]"
                    )}
                  />
                </Link>
              )}

              {/* <div className="gencl:h-11 gencl:flex gencl:items-center">
                <IHeartFollowButton
                  websiteType={websiteType}
                  attributes={attributes}
                  videoSlug={video.slug}
                  videoId={video.id}
                />
              </div> */}
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
    }
    case "ted":
      return null;
    case "walmart":
    case "grubhub":
    case "default":
    default:
      if (!owner) return null;
      return (
        <div className="gencl:flex gencl:gap-2 gencl:items-center gencl:text-white gencl:text-body-0-semi-bold">
          <Avatar imageUrl={owner?.profileImage || ""} alt={owner?.name ?? ""} isAvatar={owner?.isAvatar ?? false} />
          <ProfileLink
            url={buildPageUrl({
              type: owner?.brand ? "brand" : "profile",
              slug: owner?.brand ? owner.brand.slug : owner?.userName,
            })}
            userLogoType={owner?.brand?.userLogo}>
            @{owner?.userName}
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
}: {
  video: PostDetailsType["video"];
  type: BrandLayoutType;
  isExpanded?: boolean;
  onExpand?: () => void;
  layoutType?: BrandLayoutType;
}) {
  const { description, createdAt, duration } = video ?? {};

  const enhancedDescription: ReadMoreTextType = useMemo(() => {
    if (!video) return [];
    const { description, createdAt, duration } = video;
    if (type !== "iheart") {
      return description ? (Array.isArray(description) ? description : [description]) : [];
    }

    const monthYear = getMonthYear(createdAt ?? 0);
    const durationText = duration ? ` • ${getFormattedDuration(String(duration))}` : "";

    return [
      {
        type: "custom",
        text: `${monthYear}${durationText}`,
        style: { color: "#ffffff" },
        className:
          "gencl:text-[12px] gencl:font-normal gencl:leading-[20px] gencl:tracking-[-0.35px]! gencl:lg:text-[14px]! gencl:lg:font-normal! gencl:lg:leading-[18px]! gencl:lg:tracking-[-0.5px]!",
      },
      " ",
      ...(description ? (Array.isArray(description) ? description : [description]) : []),
    ];
  }, [type, video]);

  if (!video) return null;

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
        />
      );
  }
});

/**
 * Hook to determine iHeart scrubber visibility styling
 */
function useIHeartScrubberVisibility(showScrubber: boolean, brandLayoutType: BrandLayoutType) {
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
  onOctoOpen,
  linkoutThumbnail,
  isDesktop,
}: {
  postDetails: PostDetailsType;
  defaultOpenCommentDialog: boolean;
  brandLayoutType: BrandLayoutType;
  onCommentCountChange?: ComponentProps<typeof CommentsDialog>["onCommentCountChange"];
  onReactionStateChange?: (videoId: string, videoSlug: string, isReacted: boolean) => void;
  isActive: boolean;
  linkoutThumbnail?: string | null;
  onOctoOpen?: () => void;
  isDesktop: boolean;
}) {
  const { video, group, community } = postDetails;
  if (!video || !community || !group) return null;

  // Handle iHeart brand controls
  if (brandLayoutType === "iheart") {
    return (
      <IHeartControls
        onClick={(e) => e.stopPropagation()}
        className={cn("gencl:gap-1 gencl:z-10")}
        size="lg"
        variant="expand"
        isActive={isActive}
        contentId={video.id}
        slug={video.slug}
        isReacted={video.isSparked ?? false}
        reactionCount={video.sparkCount}
        onReactionStateChange={(isReacted) => {
          onReactionStateChange?.(video.id, video.slug, isReacted);
        }}
        videoDetails={video}
      />
    );
  }

  // Default actions for other brands
  return (
    <Suspense fallback={null}>
      <Actions
        onClick={(e) => e.stopPropagation()}
        className="gencl:sm:hidden! gencl:gap-2!"
        variant="mobile"
        theme="dark"
        contentId={video.id}
        isReacted={video.isSparked ?? false}
        reactionCount={video.sparkCount}
        shareUrl={video.shareUrl}
        slug={video.slug}
        videoType={video.videoType}
        groupSlug={group?.slug ?? ""}
        showLinkout={false}
        actionWrapper={{
          OCTO: (defaultNode) => {
            if (isDesktop) return defaultNode;
            return (
              <div
                key="octo-action"
                onClick={(e) => {
                  e.stopPropagation();
                  onOctoOpen?.();
                }}>
                {defaultNode}
              </div>
            );
          },
          COMMENT: (defaultNode) => {
            return (
              <CommentsDialog
                key="comment-dialog"
                shareUrl={video.shareUrl}
                communityId={community.id}
                loopId={group.id}
                videoId={video.id}
                videoSlug={video.slug}
                commentCount={video.commentCount}
                videoType={video.videoType ?? VideoTypes.Content}
                defaultOpen={defaultOpenCommentDialog}
                onCommentCountChange={(videoId, increment) => {
                  onCommentCountChange?.(videoId, increment);
                }}>
                {defaultNode}
                <p className="gencl:text-body-2-medium gencl:text-white!">{video.commentCount}</p>
              </CommentsDialog>
            );
          },
        }}
        // actionWrapper={{
        //   COMMENT: (defaultNode) => {
        //     return (
        //       <div
        //         key="comment-action"
        //         onClick={(e) => {
        //           e.stopPropagation();
        //           openContentType("comments", "inside", "panel-view");
        //         }}>
        //         {defaultNode}
        //         <p className="gencl:text-body-2-medium gencl:text-white! gencl:text-center">{video.commentCount}</p>
        //       </div>
        //     );
        //   },
        //   LINKOUT: (defaultNode) => {
        //     return (
        //       <div
        //         key="linkout-action"
        //         onClick={(e) => {
        //           e.stopPropagation();
        //           toggleContentType("linkouts", "inside", "default");
        //         }}>
        //         {defaultNode}
        //       </div>
        //     );
        //   },
        // }}
        onReactionStateChange={(isReacted) => {
          onReactionStateChange?.(video.id, video.slug, isReacted);
        }}
      />
    </Suspense>
  );
});

export const ExpandViewDetails = forwardRef<ExpandViewDetailsRef, ExpandViewProps>(function ExpandViewDetails(
  {
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
  }: ExpandViewProps,
  ref
) {
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
  const viewportHeight = useViewportHeight();
  const { isMobile, isDesktop } = useDeviceDetectMediaQuery();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOctoSwipeBlocked, setIsOctoSwipeBlocked] = useState(false);
  const [isOctoVisible, setIsOctoVisible] = useState(false);
  const scrubberRef = useRef<HTMLDivElement>(null);
  const octoExpandSheetRef = useRef<OctoExpandSheetRef>(null);

  const { shouldHide, hiddenClassName } = useIHeartScrubberVisibility(showScrubber, brandLayoutType);

  const onExpand = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  // TODO: THIS IS NOT GOOD APPROACH - WILL HAVE TO CHANGE IT
  useImperativeHandle(
    ref,
    () => ({
      closeSheet: () => octoExpandSheetRef.current?.onActionToggle(),
    }),
    []
  );

  const { video } = postDetails;
  if (!video) return null;

  return (
    <div
      data-expand-view="true"
      className={cn(
        "gencl:absolute gencl:gap-2 gencl:w-full gencl:z-20 gencl:right-0 gencl:bottom-0 gencl:p-4 gencl:focus:outline-none",
        brandLayoutType !== "iheart" && "gencl:bg-gradient-to-t gencl:from-black/50 gencl:to-transparent",
        className
      )}
      {...restProps}>
      <div
        className={cn(
          "gencl:flex gencl:w-full gencl:gap-4 gencl:justify-between gencl:items-end gencl:transition-opacity gencl:duration-200",
          brandLayoutType === "ted" && "gencl:gap-3",
          shouldHide && hiddenClassName
        )}>
        <div
          className={cn(
            "gencl:flex gencl:flex-col gencl:gap-4 gencl:sm:gap-2 gencl:w-5/6 gencl:sm:w-full gencl:transition-all",
            brandLayoutType === "ted" || (brandLayoutType === "iheart" && "gencl:gap-3"),
            isOctoSwipeBlocked && "swiper-no-swiping"
          )}
          onClick={(e) => e.stopPropagation()}>
          <div className="gencl:z-20">
            {!isDesktop && (
              <OctoExpandSheet
                ref={octoExpandSheetRef}
                isActive={isActive}
                videoId={video.id}
                videoSlug={video.slug}
                isMobile={isMobile}
                viewportHeight={viewportHeight}
                onSwipeBlockChange={setIsOctoSwipeBlocked}
                onVisibilityChange={setIsOctoVisible}
              />
            )}
          </div>

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

          {/* NOT NEEDED AS PER 2.0.5, if you want to make any changes for DynamicSheet contact devtejot@begenuin.com */}
          {/* <DynamicSheet
            isOpen={isMobile && hasContentType("comments")}
            renderMode="container"
            config={{
              initialState: "panel-view",
              enabledStates: ["panel-view", "full-view"],
              heights: {
                "panel-view": "70vh",
                "full-view": `${viewportHeight}px`,
              },
              showClose: true,
              showOverlay: true,
              showIndicator: true,
              navTitle: "Comments",
              onStateChange: (state) => setContentTypeState("comments", state),
              onClose: () => {
                resetSheet();
                // openContentType("linkouts", "inside");
              },
              theme: commentsState === "full-view" || commentsState === "panel-view" ? "light" : "dark",
            }}
            // onDragging={(isDragging) => {
            //   // console.log("isDragging:: ", isDragging);
            //   onSwiperToggle?.(isDragging);
            // }}
            footer={
              <CommentInputBox
                communityId={community?.id ?? ""}
                shareUrl={video.shareUrl}
                loopId={group?.id ?? ""}
                videoId={video.id}
                videoSlug={video.slug}
                videoType={video.videoType as VideoTypes}
                onCommentPosted={(comments) => {
                  setQueryDataForNewComment(video.id, comments);
                  onCommentCountChange?.(video.id);
                }}
              />
            }
            footerClassName="gencl:px-0 gencl:py-0"
            headerClassName="gencl:text-body-1-semi-bold!"
            className={cn(
              (commentsState === "panel-view" || commentsState === "full-view") &&
                "gencl:rounded-t-2xl! gencl:rounded-b-none!"
            )}>
            <CommentsList
              videoId={video.id}
              showCloseButton={false}
              shareUrl={video.shareUrl}
              className="gencl:pt-4"
              videoSlug={video.slug}
              videoType={video.videoType as VideoTypes}
              onCommentCountChange={onCommentCountChange}
            />
          </DynamicSheet> */}

          {/* Linkout inside player — show on mobile always, and on desktop only when
              comments are also open (split view: linkout overlay + comment right panel). */}
          {showLinkoutInExpand && brandLayoutType !== "iheart" && !isOctoVisible && video.linkouts && (
            <Suspense fallback={null}>
              <Linkouts
                linkouts={video.linkouts}
                linkoutId={video.linkoutId!}
                // variant="dynamic"
                view="expand"
                showImmediately={video.linkouts.length > 0 && !video.linkoutId}
                isActive={isActive}
                layout="overlay"
                className={cn("gencl:w-full gencl:z-10", className)}
                videoDetails={video}
                totalVideos={totalVideos}
                positionIndex={positionIndex}
                autoplay={videoAutoplay}
              />
            </Suspense>
          )}

          {!isOctoVisible && (
            <AdaptiveDescription
              video={video}
              type={brandLayoutType}
              {...(brandLayoutType === "iheart" && {
                isExpanded,
                onExpand,
              })}
              layoutType={brandLayoutType}
            />
          )}
        </div>

        <SharedActions
          postDetails={postDetails}
          brandLayoutType={brandLayoutType}
          defaultOpenCommentDialog={defaultOpenCommentDialog}
          onReactionStateChange={onReactionStateChange}
          onCommentCountChange={onCommentCountChange}
          isActive={isActive}
          onOctoOpen={() => octoExpandSheetRef.current?.onActionToggle()}
          linkoutThumbnail={video.linkouts?.[0]?.links?.find((l: any) => l.image)?.image}
          isDesktop={isDesktop}
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
          style={{
            scrollBehavior: "smooth",
          }}>
          <Pills
            communityDetails={postDetails.community}
            groupDetails={postDetails.group}
            videoId={video.id}
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
          data-scrubber-container="true">
          <Scrubber className={cn("gencl:z-20 gencl:transition-all")} showOnlyTime={true} duration={video.duration} />
        </div>
      ) : (
        <div aria-hidden="true" className={cn("gencl:h-0 gencl:transition-all", showSeeker && "gencl:h-4")} />
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
});
