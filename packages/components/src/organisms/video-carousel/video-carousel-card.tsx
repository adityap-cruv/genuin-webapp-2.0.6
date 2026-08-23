"use client";

import { memo, useCallback, useMemo, lazy } from "react";
import { ChevronRight } from "lucide-react";
import { cn, detectAccessibilityMode } from "@genuin/ui/lib/utils";
import { type PlayerControlSize } from "@genuin/ui/player-controls";
import { useSwiper } from "swiper/react";

import { VideoTypes } from "@genuin/components/context";
import { useBaseContext } from "@genuin/components/context/base";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";
import { SafeSuspense } from "@genuin/components/molecules/error/safe-suspense";
import { PlayerProvider } from "@genuin/components/molecules/feed-player/context/provider";
import { Controls } from "@genuin/components/molecules/feed-player/control-layer/controls/controls-v2";
import { useFeedContext } from "@genuin/components/templates/feed/context";
import { FEED_SKELETON_THEME, PlayerSkeleton } from "@genuin/components/templates/feed/feed-skeleton";

import type { VideoCarouselCardProps } from "./video-carousel.types";

const FeedPlayer = lazy(() =>
  import("@genuin/components/molecules/feed-player").then((m) => ({
    default: m.FeedPlayer,
  }))
);

export function formatVideoDuration(rawDuration?: number | string | null): string {
  if (rawDuration === undefined || rawDuration === null || rawDuration === "") return "";
  let sec = typeof rawDuration === "string" ? parseFloat(rawDuration) : Number(rawDuration);
  if (isNaN(sec) || sec <= 0) return "";

  // If duration is provided in milliseconds (e.g. 90000ms), convert to seconds
  if (sec > 10000) {
    sec = sec / 1000;
  }

  const mins = Math.floor(sec / 60);
  const remainingSecs = Math.round(sec % 60);

  if (mins === 0) {
    return `${remainingSecs}s`;
  }
  if (remainingSecs === 0) {
    return `${mins} min`;
  }
  return `${mins} min ${remainingSecs}s`;
}

export function formatVideoDate(dateString?: string | number | null): string {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
  } catch {
    return "";
  }
}

/**
 * Bottom overlay for a carousel card: metadata (date • duration • description)
 * and the Read More CTA. The top-right player controls
 * (mute · play/pause · expand) are rendered separately by the shared `Controls`
 * component — the same one VideoFeed uses.
 */
function CardOverlay({
  post,
  ctaText,
  onCtaClick,
}: {
  post: VideoCarouselCardProps["post"];
  ctaText?: string;
  onCtaClick?: VideoCarouselCardProps["onCtaClick"];
}) {
  const { video, community, owner } = post;
  const linkout = video?.linkouts?.[0];
  const resolvedCtaText =
    ctaText ??
    linkout?.cta_text ??
    linkout?.title ??
    (video as any)?.cta_text ??
    (post as any)?.cta_text ??
    "Read More";

  const ctaHref =
    linkout?.cta_link ??
    linkout?.links?.[0]?.url ??
    video?.clickableUrl ??
    (video as any)?.cta_link ??
    (post as any)?.cta_link ??
    (post as any)?.url ??
    undefined;

  const ctaIcon =
    (linkout as any)?.icon ??
    (linkout as any)?.favicon ??
    community?.profileImage ??
    owner?.profileImage ??
    undefined;

  const dateLabel = useMemo(
    () =>
      formatVideoDate(
        (post as any).created_at ??
          (post as any).createdAt ??
          post.video?.createdAt ??
          (post.video as any)?.created_at
      ),
    [post]
  );

  const rawDuration =
    video?.duration ??
    (video?.attributes as any)?.duration ??
    (post as any)?.duration ??
    (video as any)?.video_duration ??
    (video as any)?.media_duration;

  const durationLabel = useMemo(() => formatVideoDuration(rawDuration), [rawDuration]);

  const descriptionText =
    video?.attributes?.title ||
    video?.descritptionText ||
    (post as any).title ||
    "";

  const handleCtaClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement | HTMLAnchorElement>) => {
      e.stopPropagation();
      if (onCtaClick) {
        onCtaClick(post, e as any);
      } else if (ctaHref && typeof window !== "undefined") {
        window.open(ctaHref, "_blank", "noopener,noreferrer");
      }
    },
    [ctaHref, onCtaClick, post]
  );

  return (
    <div
      className="gencl:absolute gencl:inset-0 gencl:z-10 gencl:flex gencl:h-full gencl:w-full gencl:flex-col gencl:justify-end gencl:p-3"
      onClick={(e) => e.stopPropagation()}>
      {/* Bottom Overlay: Metadata + Read More CTA */}
      <div className="gencl:relative gencl:flex gencl:w-full gencl:flex-col gencl:gap-2">
        {/* Gradient backdrop behind text and CTA */}
        <div
          className="gencl:pointer-events-none gencl:absolute gencl:-inset-x-3 gencl:-bottom-3 gencl:-top-8 gencl:rounded-b-2xl gencl:bg-gradient-to-t gencl:from-black/90 gencl:via-black/60 gencl:to-transparent"
          aria-hidden
        />

        <div className="gencl:relative gencl:z-10 gencl:flex gencl:flex-col gencl:gap-2">
          {/* Metadata: Date • Duration • Description */}
          <p className="gencl:line-clamp-2 gencl:text-[11px] gencl:font-medium gencl:leading-tight gencl:text-white/90">
            {dateLabel && <span className="gencl:font-semibold">{dateLabel}</span>}
            {dateLabel && durationLabel && <span>{" • "}</span>}
            {durationLabel && <span>{durationLabel}</span>}
            {(dateLabel || durationLabel) && descriptionText && <span>{" • "}</span>}
            {descriptionText && <span className="gencl:text-white/80">{descriptionText}</span>}
          </p>

          {/* Read More Pill CTA */}
          <div
            role="button"
            tabIndex={0}
            onClick={handleCtaClick}
            className="gencl:group gencl:flex gencl:h-9 gencl:w-full gencl:cursor-pointer gencl:items-center gencl:justify-between gencl:gap-2 gencl:rounded-lg gencl:border gencl:border-white/10 gencl:bg-black/60 gencl:px-2.5 gencl:py-1.5 gencl:backdrop-blur-md gencl:transition-all gencl:hover:border-white/20 gencl:hover:bg-black/80 gencl:active:scale-[0.98]">
            <div className="gencl:flex gencl:min-w-0 gencl:items-center gencl:gap-2">
              {/* Brand Logo / Favicon / Community Avatar */}
              {ctaIcon ? (
                <img
                  src={ctaIcon}
                  alt=""
                  className="gencl:size-5 gencl:shrink-0 gencl:rounded gencl:object-cover"
                />
              ) : (
                <div className="gencl:flex gencl:size-5 gencl:shrink-0 gencl:items-center gencl:justify-center gencl:rounded gencl:bg-white/10 gencl:text-xs gencl:font-extrabold gencl:italic gencl:text-white">
                  {community?.name ? community.name.charAt(0).toUpperCase() : "F"}
                </div>
              )}
              <span className="gencl:truncate gencl:text-xs gencl:font-semibold gencl:text-white">
                {resolvedCtaText}
              </span>
            </div>
            <ChevronRight className="gencl:size-4 gencl:shrink-0 gencl:text-white/80 gencl:transition-transform gencl:group-hover:translate-x-0.5" />
          </div>
        </div>
      </div>
    </div>
  );
}

export const VideoCarouselCard = memo(function VideoCarouselCard({
  post,
  index,
  isNext,
  isPrev,
  isVisible,
  isInitialSlide,
  totalVideos,
  controlSize = "sm",
  ctaText,
  playOnHover = true,
  expanded = false,
  onToggleExpand,
  onCardHover,
  onCardClick,
  onPlayerIterationEnd,
  onCtaClick,
  className,
  style,
}: VideoCarouselCardProps) {
  const { activeIndex, setActiveIndex } = useFeedContext();
  const { theme } = useBaseContext();
  const { isMobile } = useDeviceDetectMediaQuery();
  const { video: videoConfig } = useEmbedConfigs();
  const swiper = useSwiper();
  const isAccessibilityMode = useMemo(() => detectAccessibilityMode(), []);
  // While the expand overlay is open no inline card is "active" — the inline player
  // pauses (one video, one player) and the top-right controls hide, matching VideoFeed.
  const isCardActive = index === activeIndex && !expanded;
  const shouldRenderPlayer =
    isAccessibilityMode || isCardActive || isNext || isPrev || isVisible || isInitialSlide;

  const handlePlayerIterationEnd = useCallback(() => {
    if (onPlayerIterationEnd) {
      onPlayerIterationEnd(index);
    } else if (swiper && !swiper.destroyed) {
      setTimeout(() => {
        swiper.allowSlideNext = true;
        swiper.allowSlidePrev = true;
        swiper.enable();
        swiper.slideNext();
      }, 0);
    }
  }, [index, onPlayerIterationEnd, swiper]);

  const handleMouseEnter = useCallback(() => {
    if (playOnHover && onCardHover) {
      onCardHover(index);
    }
  }, [playOnHover, onCardHover, index]);

  const handleClick = useCallback(() => {
    if (onCardClick) {
      onCardClick(index);
    }
  }, [onCardClick, index]);

  const handleUpdateActiveIndex = useCallback(
    (newIdx: number) => {
      if (typeof newIdx === "number") {
        setActiveIndex(newIdx);
      }
    },
    [setActiveIndex]
  );

  return (
    <div
      data-slot="video-carousel-card"
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
      className={cn(
        "gencl:group gencl:relative gencl:h-full gencl:w-full gencl:cursor-pointer gencl:overflow-hidden gencl:rounded-2xl gencl:bg-secondary-900 gencl:shadow-md gencl:select-none",
        className
      )}
      style={style}>
      {shouldRenderPlayer ? (
        <PlayerProvider
          isActive={isCardActive}
          isEmbed={true}
          explicitAutoPlay={isCardActive}
          explicitLoop={false}
          videoId={post.video?.id ?? ""}
          videoUrl={post.video?.source ?? ""}
          showExpandView={expanded}
          toggleExpandView={onToggleExpand}
          swiper={swiper}
          index={index}
          updateActiveIndex={handleUpdateActiveIndex}
          onPlayerIterationEnd={handlePlayerIterationEnd}
          totalVideos={totalVideos}
          videoDescription={post.video?.descritptionText ?? post.video?.attributes?.title ?? (post as any).title}
          sectionTitle={post.video?.attributes?.title ?? (post as any).section?.title}
          sectionSubtitle={post.video?.attributes?.subtitle ?? (post as any).section?.subtitle}
          sectionId={(post as any).section?.id}
          podcastId={post.video?.attributes?.podcast_id}
          stationId={post.video?.attributes?.station_id}
          activeIndex={activeIndex}
          videoType={post.video?.videoType ?? VideoTypes.Content}>
          {/* Background Video Player */}
          <div className="gencl:relative gencl:h-full gencl:w-full">
            <SafeSuspense
              fallback={
                <PlayerSkeleton
                  colors={FEED_SKELETON_THEME[theme === "light" ? "light" : "dark"]}
                  isMobile={isMobile}
                />
              }
              errorFallback={null}>
              <FeedPlayer
                videoId={post.video?.id ?? ""}
                videoDescription={post.video?.descritptionText}
                src={post.video?.source}
                adUrl={post.video?.adUrl ?? undefined}
                id={`carousel-player--${post.video?.id ?? index}`}
                poster={post.video?.thumbnail ?? ""}
                videoType={post.video?.videoType ?? VideoTypes.Content}
                className={cn(
                  "gencl:h-full! gencl:w-full",
                  videoConfig.videoCrop ? "gencl:object-cover gencl:bg-cover!" : "gencl:object-contain gencl:bg-contain!"
                )}
                playsInline
                isActive={isCardActive}
                style={{ height: "inherit" }}
                isSponsored={post.video?.cardLayoutId === 7 || post.video?.videoLayoutId === 6}
                adsPlatform={post.video?.adsPlatform}
                playerSize={{
                  height: swiper?.height ?? 500,
                  width: swiper?.width ?? 280,
                }}
                sponsorshipInfo={post.sponsored}
              />
            </SafeSuspense>
          </div>

          {/* Top-right player controls (mute · play/pause · expand) — same shared
              `Controls` component VideoFeed uses; shown only on the active card. */}
          {isCardActive && (
            <SafeSuspense fallback={null} errorFallback={null}>
              <Controls
                variant="default"
                enableExpand
                size={controlSize}
                className="gencl:top-0! gencl:p-3!"
              />
            </SafeSuspense>
          )}

          {/* Bottom overlay: metadata + Read More CTA */}
          <CardOverlay post={post} ctaText={ctaText} onCtaClick={onCtaClick} />
        </PlayerProvider>
      ) : (
        <PlayerSkeleton
          colors={FEED_SKELETON_THEME[theme === "light" ? "light" : "dark"]}
          isMobile={isMobile}
        />
      )}
    </div>
  );
});
