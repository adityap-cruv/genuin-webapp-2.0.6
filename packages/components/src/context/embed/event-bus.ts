import { EventManager } from "@genuin/components/lib/utils/event-manager";
import type { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";

import type { FollowStatusItem } from "./context";

export type ActivePlayerType = "embed" | "expand-view" | "pip";

/**
 * The context for the embed event bus.
 */
export type EmbedEventContextType = {
  /**
   * The currently active player type.
   */
  activePlayerType: ActivePlayerType;
  /**
   * The previous player type before the current one.
   */
  previousPlayerType?: ActivePlayerType;
  /**
   * The index of the currently active player.
   */
  activeIndex: number;
  /**
   * The index of the previously active player.
   */
  previousActiveIndex: number;
  /**
   * List of all available sections in the feed (used for sectioned views)
   */
  sectionList: PostDetailsType["section"][];
  /**
   * Indicates if the feed is currently sectioned (true = sectioned, false = flat)
   */
  isSectioned: boolean;
  /**
   * Currently selected section (nullable)
   */
  selectedSection?: PostDetailsType["section"] | null;
  /**
   * Indicates if the auto interaction action (like auto play) has been done
   */
  autoInteractionActionDone?: boolean;
  /**
   * Indicates if the embed container is currently in view.
   */
  containerInView: boolean;
  /**
   * This flag is used to see if player went from (embed -> expand) or (expand -> embed),
   * Player should have to play from same currenttime instead or doing -5 of currentTime, for the first activeIndex only, from second activeIndex onwards it should do -5.
   */
  skipTimeOffsetOnce: boolean;
  /**
   * Flag to disable swiper in expand view (used when startVideoSlug is present on first open)
   */
  disableSwiper: boolean;
  /**
   * Array of follow statuses for podcast and station content
   */
  followStatuses: FollowStatusItem[];
  /**
   * Indicates whether the current event should trigger impression tracking.
   * This flag is set based on player index changes — `true` when the `activeIndex`
   * differs from the `newIndex`, and `false` when they are the same.
   * Used to ensure impressions are recorded only during valid player transitions.
   */
  shouldTrackImpression?: boolean;

  /**
   * Indicates whether the "onCaughtOverlay" event has already been fired
   * during the current session.
   *
   * When set to `true`, the event will not be triggered again, ensuring that the
   * "onCaughtOverlay" is shown only once per session. This prevents duplicate
   * event emissions and maintains consistent session-level behavior.
   */
  isCaughtUpEventFired?: boolean;
  hasEmittedEmbedRendered: boolean;
  resourceTracking: {
    thumbnailImages: {
      expected: number;
      loaded: number;
      resources: string[];
      thumbnailUrl: string;
    };
    videos: {
      expected: number;
      loaded: number;
      resources: string[];
      videoUrl: string;
    };
  };
};

export type EmbedEventNameType =
  | "activeIndexChange"
  | "activePlayerTypeChange"
  | "sectionListChange"
  | "isSectionedChange"
  | "selectedSectionChange"
  | "containerInViewChange"
  | "disableSwiperChange"
  | "centerActiveSlide"
  | "followStatusChange"
  | "disableCaughtUpEvent"
  | "updateResourceTracking"
  /** Host-driven "navigate this instance's feed/carousel to a video id" (payload: { videoId }). */
  | "goToVideoId"
  /** Host-driven "navigate this instance's feed/carousel to an index" (payload: { index }). */
  | "goToIndex";

/**
 * Creates a new event bus instance for embed functionality
 * Each EmbedProvider should create its own instance to avoid cross-contamination
 */
export const createEmbedEventBus = (context?: EmbedEventContextType) =>
  new EventManager<EmbedEventContextType, EmbedEventNameType>({
    activePlayerType: "embed",
    activeIndex: 0,
    previousActiveIndex: -1,
    sectionList: [],
    isSectioned: false,
    selectedSection: null,
    autoInteractionActionDone: false,
    containerInView: true,
    skipTimeOffsetOnce: false,
    disableSwiper: false,
    followStatuses: [],
    isCaughtUpEventFired: false,
    hasEmittedEmbedRendered: false,
    resourceTracking: {
      thumbnailImages: {
        expected: 0,
        loaded: 0,
        resources: [],
        thumbnailUrl: "",
      },
      videos: { expected: 0, loaded: 0, resources: [], videoUrl: "" },
    },
    ...context,
  });
