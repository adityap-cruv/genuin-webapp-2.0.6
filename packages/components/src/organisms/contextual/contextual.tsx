"use client";

import { cn } from "@genuin/ui/lib/utils";
import { useCallback, useEffect, useMemo, useRef, useState, type ComponentProps, type ReactNode } from "react";

import { VideoTypes } from "@genuin/components/context";
import { ControlLayer, FeedPlayer } from "@genuin/components/molecules/feed-player";
import { PlayerProvider } from "@genuin/components/molecules/feed-player/context";
import { SectionHeader } from "@genuin/components/molecules/section-header";
import { HoverLinkCardList, type ContextualLinkMetaData } from "@genuin/components/organisms/hover-link-card-list";
import type { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";

import styles from "./contextual.module.css";

export type ContextualVideoMetaData = {
  video_id: string;
  source: string;
  poster?: string;
  title?: string;
  description?: string;
  community_id: string;
  group_id: string;
  shareUrl?: string;
  slug?: string;
  commentCount?: number;
  viewCount?: number;
  duration?: number;
  metaText?: string;
  videoType?: VideoTypes;
  adsPlatform?: string;
  adUrl?: string;
};

export type ContextualHeaderData = {
  iconUrl?: string | null;
  iconAlt?: string;
  heading?: ReactNode;
  subHeading?: ReactNode;
};

export interface ContextualProps extends Omit<ComponentProps<"section">, "children"> {
  header: ContextualHeaderData;
  videos: readonly ContextualVideoMetaData[];
  articles: readonly ContextualLinkMetaData[];
  activeVideoId?: string | null;
  /**
   * Automatically move to the next video when player asks to advance on iteration end.
   */
  autoAdvanceOnEnd?: boolean;
  /**
   * When auto advance reaches the last video, wrap to first.
   */
  autoAdvanceLoop?: boolean;
  onActiveVideoChange?: (video: ContextualVideoMetaData) => void;
  ctaText?: string;
  videoClassName?: string;
  articleListClassName?: string;
  articleFallback?: ReactNode;
  relatedContentLabel?: string;
  animationDurationMs?: number;
  onArticleClick?: (
    article: ContextualLinkMetaData,
    index: number,
    linkedVideo?: ContextualVideoMetaData | null
  ) => void;
  /**
   * Optional: pass a fully custom video node; if provided, we only wire
   * hover/card mapping to this node and still keep video-id sync.
   */
  video?: ReactNode;
}

function createPostFromVideo(video: ContextualVideoMetaData): PostDetailsType {
  const fallbackTitle = typeof video.title === "string" ? video.title : "Video";
  const description = video.description ?? "";
  return {
    video: {
      id: video.video_id,
      type: "video",
      createdAt: Date.now(),
      commentCount: video.commentCount ?? 0,
      viewCount: video.viewCount ?? 0,
      shareUrl: video.shareUrl ?? "",
      attachedLink: null,
      source: video.source,
      isSparked: false,
      isWatched: false,
      sparkCount: 0,
      thumbnail: video.poster ?? "",
      thumbnailM: null,
      description: description ? [description] : [],
      descritptionText: description || fallbackTitle,
      slug: video.slug || video.video_id,
      linkoutId: null,
      clickableUrl: null,
      linkouts: [],
      isPinned: false,
      thumbnailSprite: null,
      cardLayoutId: 1,
      videoLayoutId: 1,
      duration: video.duration ?? 0,
      placement_card_layout_id: null,
      placement_video_layout_id: null,
      placement_card_section_layout_id: null,
      adUrl: video.adUrl ?? null,
      adsPlatform: video.adsPlatform,
    },
    group: {
      id: video.group_id,
      slug: `group-${video.group_id}`,
      description: "",
      shareUrl: "",
      name: "Community Group",
      isSubscribed: false,
      role: "UNJOINED",
      isPrivate: false,
    },
    community: {
      profileImage: null,
      name: "Community",
      slug: `community-${video.community_id}`,
      handle: "",
      isPrivate: false,
      userRole: "UNJOINED",
      id: video.community_id,
      shareUrl: "",
      membersCount: 0,
      groupsCount: 0,
      postsCount: 0,
    },
    owner: {
      profileImage: "",
      isAvatar: false,
      userName: "",
      name: "",
      bio: null,
      shareUrl: "",
    },
    section: {
      id: null,
      title: null,
      description: null,
      position: null,
      thumbnail_url: null,
      cover_url: null,
      no_of_clips: null,
      sub_title: null,
    },
    sponsored: null,
  };
}

function ContextualFallback() {
  return (
    <div
      className={cn(
        "gencl:flex gencl:w-full gencl:h-full gencl:items-center gencl:justify-center gencl:bg-secondary-100 gencl:text-sm gencl:text-secondary-500",
        "gencl:p-6 gencl:text-center"
      )}>
      No video data available.
    </div>
  );
}

/**
 * Contextual media surface with feed-style playback support.
 * The active video's matching article is pinned to first and expanded;
 * selecting a related card updates video mapping.
 */
export function Contextual({
  header,
  videos,
  articles,
  activeVideoId,
  onActiveVideoChange,
  ctaText = "Read More",
  videoClassName,
  articleListClassName,
  articleFallback,
  relatedContentLabel = "Articles related to the active video",
  animationDurationMs = 450,
  autoAdvanceOnEnd = true,
  autoAdvanceLoop = true,
  onArticleClick,
  video,
  className,
  ...restProps
}: ContextualProps) {
  const [internalActiveVideoId, setInternalActiveVideoId] = useState<string | null>(() => {
    return activeVideoId ?? videos[0]?.video_id ?? null;
  });
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const videoScrollerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<number | null>(null);
  const syncScrollTimeoutRef = useRef<number | null>(null);
  const isSyncingScrollRef = useRef(false);

  const isControlled = activeVideoId !== undefined;
  const activeCandidateId = isControlled ? activeVideoId : internalActiveVideoId;
  const activeVideoIndex = useMemo(
    () => videos.findIndex((item) => item.video_id === activeCandidateId),
    [activeCandidateId, videos]
  );
  const activeVideoIndexSafe = activeVideoIndex >= 0 ? activeVideoIndex : 0;
  const activeVideo = videos[activeVideoIndexSafe] ?? videos[0] ?? null;
  const useScrollableVideos = !video && videos.length > 1;

  const postDetailsByVideoId = useMemo(() => {
    const map = new Map<string, PostDetailsType>();
    videos.forEach((videoItem) => map.set(videoItem.video_id, createPostFromVideo(videoItem)));
    return map;
  }, [videos]);

  useEffect(() => {
    if (isControlled) return;
    if (!internalActiveVideoId && videos[0]?.video_id) {
      setInternalActiveVideoId(videos[0].video_id);
    }
  }, [isControlled, internalActiveVideoId, videos]);

  const scrollToVideoIndex = useCallback(
    (targetIndex: number, behavior: ScrollBehavior = "smooth") => {
      const container = videoScrollerRef.current;
      if (!container) return;
      const safeIndex = Math.max(0, Math.min(targetIndex, Math.max(0, videos.length - 1)));
      const targetTop = safeIndex * container.clientHeight;

      isSyncingScrollRef.current = true;
      container.scrollTo({ top: targetTop, behavior });

      if (syncScrollTimeoutRef.current) {
        window.clearTimeout(syncScrollTimeoutRef.current);
      }
      syncScrollTimeoutRef.current = window.setTimeout(() => {
        isSyncingScrollRef.current = false;
        syncScrollTimeoutRef.current = null;
      }, 450);
    },
    [videos.length]
  );

  const setActiveByVideoId = useCallback(
    (nextVideoId: string | null, shouldScrollToVideo = true) => {
      const nextIndex = videos.findIndex((item) => item.video_id === nextVideoId);
      const nextVideo = nextIndex >= 0 ? videos[nextIndex] : null;
      if (!nextVideo) return;

      if (!isControlled) {
        setInternalActiveVideoId(nextVideo.video_id);
      }
      onActiveVideoChange?.(nextVideo);

      if (shouldScrollToVideo && useScrollableVideos) {
        scrollToVideoIndex(nextIndex);
      }
    },
    [isControlled, onActiveVideoChange, scrollToVideoIndex, useScrollableVideos, videos]
  );

  const handleArticleClick = useCallback(
    (item: ContextualLinkMetaData, index: number) => {
      const linkedVideo = videos.find((entry) => entry.video_id === item.video_id) ?? null;
      const nextVideoId = linkedVideo?.video_id ?? null;
      setActiveByVideoId(nextVideoId, useScrollableVideos);
      onArticleClick?.(item, index, linkedVideo);
    },
    [setActiveByVideoId, useScrollableVideos, videos, onArticleClick]
  );

  const handlePlayerIterationEnd = useCallback(
    (shouldAdvance?: boolean) => {
      if (shouldAdvance === false) return;
      if (!autoAdvanceOnEnd || videos.length === 0) return;

      const currentIndex = videos.findIndex((entry) => entry.video_id === activeCandidateId);
      if (currentIndex < 0) return;

      const nextIndex = currentIndex + 1;
      if (nextIndex >= videos.length && !autoAdvanceLoop) return;

      const resolvedNextIndex = autoAdvanceLoop ? nextIndex % videos.length : nextIndex;
      const nextVideo = videos[resolvedNextIndex];
      if (!nextVideo) return;

      setActiveByVideoId(nextVideo.video_id);
    },
    [activeCandidateId, autoAdvanceLoop, autoAdvanceOnEnd, setActiveByVideoId, videos]
  );

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        window.clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = null;
      }
      if (syncScrollTimeoutRef.current) {
        window.clearTimeout(syncScrollTimeoutRef.current);
        syncScrollTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!useScrollableVideos || !activeVideo) return;
    scrollToVideoIndex(activeVideoIndexSafe, "auto");
  }, [activeVideo, activeVideoIndexSafe, scrollToVideoIndex, useScrollableVideos]);

  const handleScrollerScroll = useCallback(() => {
    if (!useScrollableVideos) return;
    if (isSyncingScrollRef.current) return;
    const container = videoScrollerRef.current;
    if (!container) return;

    const containerHeight = container.clientHeight;
    if (!containerHeight) return;

    const nextIndex = Math.max(
      0,
      Math.min(Math.round(container.scrollTop / containerHeight), Math.max(0, videos.length - 1))
    );
    const nextVideoId = videos[nextIndex]?.video_id ?? null;
    if (!nextVideoId || nextIndex === activeVideoIndexSafe) return;

    if (scrollTimeoutRef.current) {
      window.clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = window.setTimeout(() => {
      setActiveByVideoId(nextVideoId, false);
      scrollTimeoutRef.current = null;
    }, 90);
  }, [activeVideoIndexSafe, setActiveByVideoId, useScrollableVideos, videos]);

  const renderedVideo = useMemo(() => {
    if (video) return video;
    if (videos.length === 0) return <ContextualFallback />;

    const renderVideo = (videoMeta: ContextualVideoMetaData, index: number, isActive: boolean) => {
      const postDetails = postDetailsByVideoId.get(videoMeta.video_id);
      if (!postDetails) return null;

      return (
        <PlayerProvider
          key={videoMeta.video_id}
          index={index}
          isActive={isActive}
          videoId={videoMeta.video_id}
          videoUrl={videoMeta.source}
          onPlayerIterationEnd={handlePlayerIterationEnd}
          videoDescription={videoMeta.description ?? videoMeta.title ?? videoMeta.video_id}
          totalVideos={videos.length}
          videoType={videoMeta.videoType ?? VideoTypes.Content}>
          <div className="gencl:relative gencl:h-full gencl:w-full gencl:overflow-hidden gencl:group">
            <FeedPlayer
              key={videoMeta.video_id}
              src={videoMeta.source}
              videoId={videoMeta.video_id}
              poster={videoMeta.poster}
              playsInline
              isActive={isActive}
              videoDescription={videoMeta.description ?? videoMeta.title}
              videoType={videoMeta.videoType ?? VideoTypes.Content}
              sponsorshipInfo={postDetails.sponsored}
              className="gencl:h-full! gencl:w-full! gencl:object-cover"
              adUrl={videoMeta.adUrl}
              adsPlatform={videoMeta.adsPlatform}
              onEnded={() => handlePlayerIterationEnd()}
            />
            <ControlLayer
              variant="default"
              index={index}
              isActive={isActive}
              postDetails={postDetails}
              className={cn("gencl:!opacity-100 gencl:!pointer-events-auto", "gencl:!z-20")}
              enableExpand={true}
              expandViewDetails={false}
            />
            {(videoMeta.metaText || videoMeta.title) && (
              <div className="gencl:absolute gencl:left-2.5 gencl:bottom-2.5 gencl:right-2.5 gencl:text-[11px] gencl:leading-4 gencl:text-white gencl:drop-shadow-sm">
                <p className="gencl:text-body-1-semi-bold! gencl:leading-4 gencl:line-clamp-1">
                  {videoMeta.metaText ?? videoMeta.title}
                </p>
              </div>
            )}
          </div>
        </PlayerProvider>
      );
    };

    if (!useScrollableVideos) {
      if (!activeVideo) return <ContextualFallback />;
      return renderVideo(activeVideo, activeVideoIndexSafe, true);
    }

    return videos.map((videoMeta, index) => {
      const isActive = index === activeVideoIndexSafe;
      return (
        <div
          key={videoMeta.video_id}
          data-slot="contextual-video-slide"
          data-video-id={videoMeta.video_id}
          data-item-index={index}
          className="gencl:h-full gencl:w-full gencl:snap-start gencl:relative">
          {renderVideo(videoMeta, index, isActive)}
        </div>
      );
    });
  }, [
    activeVideo,
    activeVideoIndexSafe,
    handlePlayerIterationEnd,
    postDetailsByVideoId,
    useScrollableVideos,
    videos,
    video,
  ]);

  return (
    <section data-slot="contextual" className={cn(styles.root, className)} {...restProps}>
      <SectionHeader
        data-slot="contextual-header"
        className={styles.header}
        imageUrl={header.iconUrl}
        imageAlt={header.iconAlt ?? ""}
        heading={header.heading}
        subHeading={header.subHeading}
      />

      <div
        data-slot="contextual-video"
        className={cn(
          styles.video,
          "gencl:relative gencl:rounded-xl gencl:border gencl:border-secondary-150 gencl:bg-secondary-100",
          useScrollableVideos ? "gencl:overflow-hidden" : "gencl:overflow-hidden",
          videoClassName
        )}
        ref={videoContainerRef}>
        <div
          ref={useScrollableVideos ? videoScrollerRef : null}
          className={cn(
            "gencl:h-full gencl:w-full",
            useScrollableVideos
              ? "gencl:overflow-y-auto gencl:overflow-x-hidden gencl:snap-y gencl:snap-mandatory gencl:scroll-smooth"
              : "gencl:overflow-hidden gencl:flex gencl:items-stretch"
          )}
          onScroll={useScrollableVideos ? handleScrollerScroll : undefined}
          style={{
            scrollbarWidth: useScrollableVideos ? "none" : undefined,
          }}
          data-slot="contextual-video-scroller">
          {renderedVideo}
        </div>
      </div>

      <aside
        data-slot="contextual-related"
        aria-label={relatedContentLabel}
        className={cn(styles.related, "gencl:rounded-xl gencl:bg-white gencl:p-2")}>
        {articles.length > 0 ? (
          <HoverLinkCardList
            className={cn("gencl:size-full", articleListClassName)}
            items={articles}
            width="100%"
            height="100%"
            activeVideoId={activeVideo?.video_id ?? null}
            pinActiveItemToTop
            autoRotate={false}
            animationDurationMs={animationDurationMs}
            ctaText={ctaText}
            ariaLabel={relatedContentLabel}
            onLinkClick={handleArticleClick}
          />
        ) : (
          <div
            className={cn(
              styles.fallback,
              "gencl:grid gencl:size-full gencl:place-items-center gencl:p-6 gencl:text-center gencl:text-body-2-medium gencl:text-secondary-500"
            )}>
            {articleFallback ?? "No related articles available."}
          </div>
        )}
      </aside>
    </section>
  );
}
