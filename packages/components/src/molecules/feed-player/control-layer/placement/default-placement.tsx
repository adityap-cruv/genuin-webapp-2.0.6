import { cn, getFormattedDuration, getMonthYear } from "@genuin/ui/lib/utils";
import { ControlLayerPropsType } from "../control-layer.types";
import { type FC, useMemo, lazy, Suspense } from "react";

const Linkouts = lazy(() =>
  import("@genuin/components/organisms/linkouts/index.js").then((m) => ({
    default: m.Linkouts,
  }))
) as React.ComponentType<any>;
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { EmbedControls } from "../controls/embed";
import { Stats } from "../../../stats";
import { CommentIcon, PlayIcon } from "@genuin/ui/icons";
import { DynamicReactionIcon } from "../../../reaction-button";
import { Image } from "@genuin/ui/components/image";

/**
 * Helper function to process video description
 * Handles both string and array descriptions
 */
export const processVideoDescription = (description: any) => {
  if (Array.isArray(description)) {
    return description
      .map((desc, idx) =>
        typeof desc === "string"
          ? desc
          : desc && typeof desc === "object" && "text" in desc
            ? desc.text
            : ""
      )
      .filter(Boolean)
      .map((text, idx) => <span key={idx}>{text}</span>);
  }
  return description;
};

export const DefaultPlacement: FC<ControlLayerPropsType> = ({
  postDetails,
  className,
  isActive,
  onReactionStateChange,
  ...restProps
}) => {
  const { contentDisplay, responsive, view } = useEmbedConfigs();
  const { isXs, isMd, isSm, isLg } = responsive;
  const shouldHideOnSmall = isXs;
  const shouldUseCompactText = isMd;

  // Memoize expensive computations and element creation
  const sectionDetails = useMemo(
    () => (
      <div
        className={cn(
          "gencl:flex gencl:items-center gencl:gap-2",
          contentDisplay.showSectionSubTitle &&
            postDetails.section?.description &&
            "gencl:justify-between"
        )}
      >
        {contentDisplay.showSectionThumbnail &&
          postDetails.section?.thumbnail_url &&
          !shouldHideOnSmall && (
            <Image
              src={postDetails.section?.thumbnail_url ?? ""}
              alt="thumbnail"
              className={cn(
                "gencl:object-cover",
                shouldUseCompactText ? "gencl:size-8" : "gencl:size-12"
              )}
            />
          )}
        <div className="gencl:flex gencl:flex-col gencl:justify-center gencl:items-start">
          {contentDisplay.showSectionTitle && (
            <p
              className={cn(
                "gencl:line-clamp-1",
                shouldUseCompactText
                  ? "gencl:!text-[10px] gencl:font-semibold"
                  : "gencl:text-body-2-semi-bold"
              )}
            >
              {postDetails.section?.title}
            </p>
          )}
          {contentDisplay.showSectionSubTitle && !isXs && (
            <p
              className={cn(
                "gencl:line-clamp-2",
                shouldUseCompactText
                  ? "gencl:!text-[10px] gencl:font-normal"
                  : "gencl:text-body-2-normal"
              )}
            >
              {postDetails.section?.description}
            </p>
          )}
        </div>
      </div>
    ),
    [
      contentDisplay.showSectionThumbnail,
      contentDisplay.showSectionTitle,
      contentDisplay.showSectionSubTitle,
      postDetails.section,
      shouldUseCompactText,
      shouldHideOnSmall,
      isXs,
    ]
  );

  const noOfClips = useMemo(
    () => (
      <>
        {contentDisplay.showClipsCount &&
          (postDetails.section?.no_of_clips ?? 0) > 0 &&
          !isSm && (
            <p
              className={cn(
                "gencl:!leading-[16px]",
                shouldUseCompactText
                  ? "gencl:!text-[10px] gencl:font-semibold"
                  : "gencl:text-body-1-semi-bold"
              )}
            >
              {postDetails.section?.no_of_clips ?? 0} clips
            </p>
          )}
      </>
    ),
    [
      contentDisplay.showClipsCount,
      postDetails.section?.no_of_clips,
      isSm,
      shouldUseCompactText,
    ]
  );

  const videoDetails = useMemo(() => {
    const details = [
      contentDisplay.showPostDate && (
        <span key="date">
          {getMonthYear(
            postDetails.video.attributes?.timestamp ??
              postDetails.video.createdAt ??
              0
          )}
        </span>
      ),
      contentDisplay.showVideoDuration &&
        (postDetails?.video?.duration ?? 0) > 0 && (
          <span key="duration">
            {getFormattedDuration(String(postDetails.video.duration ?? ""))}
          </span>
        ),
      contentDisplay.showPostDescription &&
        (postDetails.video.description?.length ?? 0) > 0 &&
        !shouldHideOnSmall && (
          <span key="description">
            {processVideoDescription(postDetails.video.description)}
          </span>
        ),
    ].filter(Boolean);

    return (
      <div
        className={cn(
          "gencl:line-clamp-3",
          shouldUseCompactText
            ? "gencl:!text-[10px] gencl:font-normal"
            : "gencl:text-body-2-normal"
        )}
      >
        {details.map((child, index, array) => (
          <span key={index}>
            {child}
            {index < array.length - 1 && <span> • </span>}
          </span>
        ))}
      </div>
    );
  }, [
    contentDisplay,
    postDetails.video,
    shouldUseCompactText,
    shouldHideOnSmall,
  ]);

  const linkoutSection = useMemo(
    () => (
      <>
        {contentDisplay.showVideoLinkouts && postDetails.video.linkoutId && (
          <Suspense fallback={null}>
            <Linkouts
              variant="embed"
              isActive={isActive}
              showImmediately
              linkouts={postDetails.video.linkouts}
              linkoutId={postDetails.video.linkoutId}
            />
          </Suspense>
        )}
      </>
    ),
    [
      contentDisplay.showVideoLinkouts,
      isActive,
      postDetails.video.linkouts,
      postDetails.video.linkoutId,
    ]
  );

  const socialInteraction = useMemo(() => {
    const stats = {
      ...(contentDisplay.showViewCount && {
        Views: {
          value: 0,
          icon: <PlayIcon theme="dark" size="sm" strokeWidth={2} />,
        },
      }),
      ...(contentDisplay.showReactionCount && {
        Reactions: {
          value: postDetails.video.sparkCount,
          icon: (
            <DynamicReactionIcon
              sparkCount={0}
              isSparked={false}
              iconHeight={16}
              iconWidth={16}
              theme="dark"
              type="social_count"
            />
          ),
        },
      }),
      ...(contentDisplay.showCommentCount && {
        Comments: {
          value: postDetails.video.commentCount,
          icon: <CommentIcon theme="dark" size="sm" strokeWidth={3} />,
        },
      }),
    };

    // Don't render Stats if no stats are enabled
    if (Object.keys(stats).length === 0 || isXs) {
      return null;
    }

    return (
      <Stats
        className={cn(
          "gencl:flex gencl:gap-2 gencl:justify-between gencl:items-center gencl:w-full"
        )}
        valueClassName="gencl:text-body-2-medium"
        pairClassName="gencl:gap-1!"
        stats={stats}
      />
    );
  }, [
    contentDisplay.showViewCount,
    contentDisplay.showReactionCount,
    contentDisplay.showCommentCount,
    postDetails.video.sparkCount,
    postDetails.video.commentCount,
    isXs,
  ]);

  // Define layout sections with grouped conditions for better performance
  const layoutSections = useMemo(
    () => ({
      top: [
        contentDisplay.videoDetailsPosition === "overlay_on_top" &&
          videoDetails,
        contentDisplay.sectionDetailsPosition === "overlay_on_top" &&
          sectionDetails,
        contentDisplay.sectionDetailsPosition === "overlay_on_top" && noOfClips,
      ].filter(Boolean),
      bottom: [
        contentDisplay.sectionDetailsPosition === "overlay_on_bottom" &&
          noOfClips,
        contentDisplay.sectionDetailsPosition === "overlay_on_bottom" &&
          sectionDetails,
        contentDisplay.videoDetailsPosition === "overlay_on_bottom" &&
          videoDetails,
        contentDisplay.videoDetailsPosition === "overlay_on_bottom" &&
          linkoutSection,
        contentDisplay.socialInteractionCountsPosition ===
          "overlay_on_bottom" && socialInteraction,
      ].filter(Boolean),
    }),
    [
      contentDisplay,
      videoDetails,
      sectionDetails,
      noOfClips,
      linkoutSection,
      socialInteraction,
    ]
  );

  return (
    <div
      className={cn("gencl:h-full gencl:relative", className)}
      {...restProps}
    >
      <div
        className="gencl:absolute gencl:w-full gencl:flex gencl:justify-between gencl:items-start gencl:gap-2 gencl:text-white gencl:top-0 gencl:p-2 gencl:bg-gradient-to-b gencl:from-black/50 gencl:to-transparent"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Layout */}
        {!(isLg && isActive) ? (
          <div className="gencl:space-y-2">
            {layoutSections.top.map((element, index) => (
              <div key={index}>{element}</div>
            ))}
          </div>
        ) : (
          <div />
        )}

        {isActive && (
          <div>
            <EmbedControls
              size={isXs ? "xs" : "sm"}
              section={postDetails.section}
            />
          </div>
        )}
      </div>

      {/* Bottom Layout */}
      <div className="gencl:absolute gencl:bottom-0 gencl:p-2 gencl:text-white gencl:w-full gencl:bg-gradient-to-t gencl:from-black/50 gencl:to-transparent">
        <div className="gencl:space-y-2">
          {layoutSections.bottom.map((element, index) => (
            <div key={index}>{element}</div>
          ))}
        </div>
      </div>
    </div>
  );
};
