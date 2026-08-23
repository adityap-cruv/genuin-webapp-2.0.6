import type { ComponentPropsWithoutRef, CSSProperties } from "react";
import type { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import type { FeedData, FeedWithDataPropsType } from "@genuin/components/templates/feed/feed.type";
import type { FeedType } from "@genuin/components/types/post";
import type { PlayerControlSize } from "@genuin/ui/player-controls";

export interface VideoCarouselSettings {
  slidesPerView: number;
  slidesPerGroup: number;
  spaceBetween: number;
}

export interface VideoCarouselResponsiveConfig {
  mobile: VideoCarouselSettings;
  tablet: VideoCarouselSettings;
  desktop: VideoCarouselSettings;
}

export type ActiveVideoDetails = {
  videoId: string;
  communityId?: string;
  groupId?: string;
  index: number;
  post: PostDetailsType;
};

export type VideoCarouselCardProps = {
  post: PostDetailsType;
  index: number;
  isActive: boolean;
  isNext: boolean;
  isPrev: boolean;
  isVisible: boolean;
  isInitialSlide?: boolean;
  isSectioned?: boolean;
  totalVideos?: number;
  controlSize?: PlayerControlSize;
  ctaText?: string;
  playOnHover?: boolean;
  /** Whether the full-screen expand view is open — pauses the inline player and hides its controls. */
  expanded?: boolean;
  /** Toggle the full-screen expand view (fired by the card's expand control). */
  onToggleExpand?: () => void;
  onCardHover?: (index: number) => void;
  onCardClick?: (index: number) => void;
  onPlayerIterationEnd?: (index: number) => void;
  onCtaClick?: (post: PostDetailsType, e: React.MouseEvent) => void;
  onActiveIndexChange?: (index: number) => void;
  pageSession?: string | null;
  className?: string;
  style?: CSSProperties;
};

export interface VideoCarouselViewProps {
  feedData: FeedData;
  startIndex?: number;
  /** Open the expand view on mount. */
  defaultExpandView?: boolean;
  /** Called when the expand view closes. */
  onCloseExpandView?: () => void;
  /**
   * Controlled active video. When this changes to a video present in the feed,
   * the carousel slides to it. Reacting only to changes (not to the carousel's
   * own index) keeps it from fighting a user swipe.
   */
  activeVideoId?: string;
  isSectioned?: boolean;
  responsiveConfig?: Partial<VideoCarouselResponsiveConfig>;
  cardWidth?: number | string;
  cardHeight?: number | string;
  cardAspectRatio?: number;
  controlSize?: PlayerControlSize;
  ctaText?: string;
  playOnHover?: boolean;
  autoAdvanceOnEnd?: boolean;
  /** Show the prev/next navigation arrows on non-mobile viewports (default: true). */
  showNavigation?: boolean;
  onCtaClick?: (post: PostDetailsType, e: React.MouseEvent) => void;
  onActiveIndexChange?: (index: number) => void;
  onActiveVideoChange?: (details: ActiveVideoDetails) => void;
  className?: string;
  style?: CSSProperties;
}

export interface VideoCarouselProps
  extends Omit<ComponentPropsWithoutRef<"div">, "onActiveIndexChange">,
    Omit<FeedWithDataPropsType, "className" | "style"> {
  /**
   * Controlled active video. When it changes to a video in the feed, the
   * carousel slides to that video — lets a sibling (e.g. an article list) drive
   * which video plays.
   */
  activeVideoId?: string;
  /** Optional custom responsive settings for mobile, tablet, and desktop */
  responsiveConfig?: Partial<VideoCarouselResponsiveConfig>;
  /** Fixed card width override (e.g. 260 or "260px") */
  cardWidth?: number | string;
  /** Fixed card height override (e.g. 460 or "460px") */
  cardHeight?: number | string;
  /** Aspect ratio for cards (default: 9 / 16) */
  cardAspectRatio?: number;
  /** Size for top player control buttons (default: "sm") */
  controlSize?: PlayerControlSize;
  /** Custom label for the Read More button */
  ctaText?: string;
  /** Whether hovering over a video card starts its playback (default: true) */
  playOnHover?: boolean;
  /** Whether to automatically advance and play the next video when current ends (default: true) */
  autoAdvanceOnEnd?: boolean;
  /** Show the prev/next navigation arrows on non-mobile viewports (default: true) */
  showNavigation?: boolean;
  /** Callback fired when a card's CTA/Read More button is clicked */
  onCtaClick?: (post: PostDetailsType, e: React.MouseEvent) => void;
  /** Callback fired when active slide index changes */
  onActiveIndexChange?: (index: number) => void;
  /** Callback fired with full video, community, and group details when active video changes */
  onActiveVideoChange?: (details: ActiveVideoDetails) => void;
  /** Container CSS classes */
  containerClassName?: string;
}
