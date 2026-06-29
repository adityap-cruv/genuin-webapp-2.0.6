import { Image } from "@genuin/ui/components/image";
import { cn, getFormattedDuration, getMonthYear } from "@genuin/ui/lib/utils";
import { useMemo } from "react";

import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import type { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";

/**
 * Helper function to process video description.
 * Handles both string and array descriptions.
 */
export const processVideoDescription = (description: any) => {
  if (Array.isArray(description)) {
    return description
      .map((desc) =>
        typeof desc === "string" ? desc : desc && typeof desc === "object" && "text" in desc ? desc.text : ""
      )
      .filter(Boolean)
      .map((text, idx) => <span key={idx}>{text}</span>);
  }
  return description;
};

type PlacementMetadataResult = {
  sectionDetails: React.ReactNode | null;
  noOfClips: React.ReactNode | null;
  videoDetails: React.ReactNode | null;
};

/**
 * Renders the placement-specific metadata pieces — section details, number of
 * clips, and video details — from the shared `contentDisplay` config.
 *
 * Returns each piece as a separate node so consumers can position them
 * independently (e.g. honoring `sectionDetailsPosition` / `videoDetailsPosition`
 * top vs bottom). Reads `useEmbedConfigs()` internally, so call sites pass only
 * `postDetails`.
 */
export function PlacementMetadata({ postDetails }: { postDetails: PostDetailsType }): PlacementMetadataResult {
  const { contentDisplay, responsive, view } = useEmbedConfigs();
  const { isXs, isMd, isSm } = responsive;
  const shouldHideOnSmall = isXs;
  const shouldUseCompactText = isMd;
  const isIheartLayout = view.brandLayoutType === "iheart";

  const section = useMemo(() => postDetails.section, [postDetails.section]);
  const video = useMemo(() => postDetails.video, [postDetails.video]);

  const sectionDetails = useMemo(
    () => (
      <div
        className={cn(
          "gencl:flex gencl:items-center gencl:gap-2",
          contentDisplay.showSectionSubTitle && section?.description && "gencl:justify-between"
        )}>
        {contentDisplay.showSectionThumbnail && section?.thumbnail_url && !shouldHideOnSmall && (
          <Image
            src={section?.thumbnail_url ?? ""}
            alt="thumbnail"
            className={cn("gencl:object-cover", shouldUseCompactText ? "gencl:size-8" : "gencl:size-12")}
          />
        )}
        <div className="gencl:flex gencl:flex-col gencl:justify-center gencl:min-w-0 gencl:flex-1">
          {contentDisplay.showSectionTitle && (
            <p
              className={cn(
                "gencl:truncate",
                isIheartLayout &&
                  "gencl:bg-black/40 gencl:transition-colors gencl:border gencl:border-white gencl:p-2 gencl:rounded-2xl gencl:w-fit",
                shouldUseCompactText ? "gencl:!text-[12px] gencl:font-semibold" : "gencl:text-body-2-semi-bold"
              )}>
              {section?.title}
            </p>
          )}
          {contentDisplay.showSectionSubTitle && !isXs && (
            <p
              className={cn(
                "gencl:truncate",
                shouldUseCompactText ? "gencl:!text-[12px] gencl:font-normal" : "gencl:text-body-2-normal"
              )}>
              {section?.description}
            </p>
          )}
        </div>
      </div>
    ),
    [
      contentDisplay.showSectionThumbnail,
      contentDisplay.showSectionTitle,
      contentDisplay.showSectionSubTitle,
      section,
      shouldUseCompactText,
      shouldHideOnSmall,
      isXs,
    ]
  );

  const noOfClips = useMemo(() => {
    if (!contentDisplay.showClipsCount || !section?.no_of_clips || section.no_of_clips <= 0 || isSm) {
      return null;
    }

    return (
      <p
        className={cn(
          "gencl:!leading-[16px] gencl:text-nowrap",
          shouldUseCompactText ? "gencl:!text-[12px] gencl:font-semibold" : "gencl:text-body-1-semi-bold"
        )}>
        {section.no_of_clips} clips
      </p>
    );
  }, [contentDisplay.showClipsCount, section?.no_of_clips, isSm, shouldUseCompactText]);

  const videoDetails = useMemo(() => {
    if (!video) return null;
    const details = [
      contentDisplay.showPostDate && (
        <span key="date">{getMonthYear(video.attributes?.timestamp ?? video.createdAt ?? 0)}</span>
      ),
      contentDisplay.showVideoDuration && (video?.duration ?? 0) > 0 && (
        <span key="duration">{getFormattedDuration(String(video.duration ?? ""))}</span>
      ),
      contentDisplay.showPostDescription && (video.description?.length ?? 0) > 0 && !shouldHideOnSmall && (
        <span key="description">{processVideoDescription(video.description)}</span>
      ),
    ].filter(Boolean);

    return (
      <div
        className={cn(
          "gencl:line-clamp-3",
          shouldUseCompactText ? "gencl:!text-[12px] gencl:font-normal" : "gencl:text-body-2-normal"
        )}>
        {details.map((child, index, array) => (
          <span key={index}>
            {child}
            {index < array.length - 1 && <span> • </span>}
          </span>
        ))}
      </div>
    );
  }, [contentDisplay, video, shouldUseCompactText, shouldHideOnSmall]);

  return { sectionDetails, noOfClips, videoDetails };
}
