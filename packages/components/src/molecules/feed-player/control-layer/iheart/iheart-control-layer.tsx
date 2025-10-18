"use client";
import { cn, getFormattedDuration, getMonthYear } from "@genuin/ui/lib/utils";
import { useEffect, useState, type FC } from "react";
import { Image } from "@genuin/ui/components/image";
import { IHeartControls, IHeartEndOfContentOverlay } from "./index";
import { useSafeEmbedContext } from "@genuin/components/context/embed/context";
import { ControlLayerPropsType } from "../control-layer.types";
import { useBaseContext } from "@genuin/components/context";
import { usePlayerContext } from "../../context";
import { ReadMore } from "@genuin/components/molecules/read-more";
import { GenericData } from "@genuin/components/context/base/feed-context-manager";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";

export const IHeartControlLayer: FC<ControlLayerPropsType> = ({
  postDetails,
  className,
  onReactionStateChange,
  onClick,
  layoutType,
  onCommentCountChange,
  isActive,
  ...restProps
}) => {
  const { baseContextManager } = useBaseContext();
  const { isDesktop } = useDeviceDetectMediaQuery();
  const { play } = usePlayerContext();
  const embedDetails = useSafeEmbedContext();
  const [isVideoWatched, setIsVideoWatched] = useState<boolean>(
    baseContextManager.getVideoState(postDetails.video.id)?.isWatched ?? false
  );

  useEffect(() => {
    function handleVideoWatched(payload: Partial<GenericData>) {
      if (postDetails.video.id === payload.videoId)
        setIsVideoWatched(payload.isVideoWatched ?? false);
    }

    baseContextManager.on("onVideoWatchedChanged", handleVideoWatched);
    return () => {
      baseContextManager.off("onVideoWatchedChanged", handleVideoWatched);
    };
  }, []);

  return (
    <div
      role="region"
      aria-label={`Video player controls for ${postDetails.video.attributes?.title || "video"}`}
      className={cn("gencl:h-full gencl:relative", className)}
      onClick={(e) => {
        if (postDetails.video.isWatched || isVideoWatched) {
          e.stopPropagation();
          return;
        }
        onClick?.(e);
      }}
      {...restProps}
    >
      {/* Header Section */}
      <header
        aria-label="Video information"
        className="gencl:absolute gencl:top-0 gencl:w-full gencl:flex gencl:justify-between gencl:items-center gencl:gap-2 gencl:text-white gencl:p-3 gencl:bg-gradient-to-b gencl:from-black/50 gencl:to-transparent"
      >
        {postDetails.video.attributes?.image_url && (
          <Image
            aspectRatio="square"
            src={postDetails.video.attributes?.image_url ?? ""}
            alt={`${postDetails.video.attributes.title ?? "Podcast artwork"}`}
            role="img"
            aria-label={`${postDetails.video.attributes.title ?? "Podcast cover image"}`}
            className="gencl:size-12 gencl:rounded-md gencl:object-cover gencl:lg:size-16!"
          />
        )}
        <div className="gencl:w-full">
          {postDetails.video.attributes?.title && (
            <p className="gencl:text-[14px] gencl:font-semibold gencl:leading-[20px] gencl:line-clamp-1 gencl:tracking-[-0.35px] gencl:lg:text-[17px]! gencl:lg:font-semibold! gencl:lg:leading-[24px]! gencl:lg:tracking-[-0.2px]!">
              {postDetails.video.attributes?.title}
            </p>
          )}
          {postDetails.video.attributes?.description && (
            <p className="gencl:text-[14px] gencl:font-normal gencl:leading-[20px] gencl:line-clamp-2 gencl:tracking-[-0.35px] gencl:lg:text-[14px]! gencl:lg:font-normal! gencl:lg:leading-[18px]! gencl:lg:tracking-[-0.5px]!">
              {postDetails.video.attributes?.description}
            </p>
          )}
        </div>
      </header>

      {/* Footer Section */}
      <footer
        aria-label="Video metadata and controls"
        className="gencl:absolute gencl:bottom-0 gencl:p-3 gencl:text-white gencl:w-full gencl:space-y-3 gencl:bg-gradient-to-t gencl:from-black/50 gencl:to-transparent"
      >
        <div
          aria-label={`Published ${getMonthYear(postDetails.video.createdAt ?? 0)}, Duration ${getFormattedDuration(String(postDetails.video.duration ?? ""))}`}
        >
          <div className="gencl:text-[14px] gencl:font-normal gencl:leading-[20px] gencl:line-clamp-2 gencl:tracking-[-0.35px]! gencl:lg:text-[14px]! gencl:lg:font-normal! gencl:lg:leading-[18px]! gencl:lg:tracking-[-0.5px]!">
            <time
              dateTime={new Date(
                postDetails.video.createdAt ?? 0
              ).toISOString()}
            >
              {getMonthYear(postDetails.video.createdAt ?? 0)}
            </time>
            {postDetails.video.duration && " • "}
            <span
              aria-label={`Duration ${getFormattedDuration(String(postDetails.video.duration ?? ""))}`}
            >
              {getFormattedDuration(String(postDetails.video.duration ?? ""))}
            </span>{" "}
            <ReadMore
              text={postDetails.video.description ?? ""}
              position="overlay"
              shouldAnimate
              textClassName="gencl:text-[14px] gencl:font-normal gencl:leading-[20px] gencl:tracking-[-0.35px]! gencl:text-white/70! gencl:lg:text-[14px]! gencl:lg:font-normal! gencl:lg:leading-[18px]! gencl:lg:tracking-[-0.5px]!"
              expandable={false}
              display="inline"
            />
          </div>
        </div>

        {/* Controls Section */}
        <div
          className={cn(
            "gencl:overflow-hidden gencl:transition-all gencl:ease-in-out gencl:duration-300 gencl:flex gencl:items-center gencl:justify-between"
          )}
        >
          <IHeartControls
            onClick={(e) => e.stopPropagation()}
            className={cn("gencl:z-20 gencl:lg:gap-1!")}
            size={isDesktop ? "xl" : "lg"}
            variant="clip"
            contentId={postDetails.video.id}
            slug={postDetails.video.slug}
            isReacted={postDetails.video.isSparked ?? false}
            reactionCount={postDetails.video.sparkCount}
            onReactionStateChange={(isReacted) => {
              const videoId =
                postDetails.video.slug ===
                embedDetails?.embedData.startVideoSlug
                  ? postDetails.video.slug
                  : postDetails.video.id;
              onReactionStateChange?.(videoId, isReacted);
            }}
          />
          {/* TODO : iheart phase-2 implementation  */}
          {/* <IHeartListenLiveButton variant="filled" /> */}
        </div>
      </footer>

      {(postDetails.video.isWatched || isVideoWatched) && (
        <IHeartEndOfContentOverlay
          onGoToEpisodes={() => {
            // Handle go to episodes action
            console.log("Go to episodes clicked");
          }}
          onPlayAgain={() => {
            // Handle play again action
            play(true, 0);
            baseContextManager.setVideoWatched({
              videoId: postDetails.video.id,
              isWatched: false,
            });
          }}
        />
      )}
    </div>
  );
};
