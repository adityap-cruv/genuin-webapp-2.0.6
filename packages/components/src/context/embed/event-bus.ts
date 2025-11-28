import { EventManager } from "@genuin/components/lib/utils/event-manager";
import { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
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
   * Indicates whether the current event should trigger impression tracking.
   * This flag is set based on player index changes — `true` when the `activeIndex`
   * differs from the `newIndex`, and `false` when they are the same.
   * Used to ensure impressions are recorded only during valid player transitions.
   */
  shouldTrackImpression?: boolean;
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
  | "followStatusChange";

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
    ...context,
  });
