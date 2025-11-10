import { EventManager } from "@genuin/components/lib/utils/event-manager";
import { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";

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
  previousIndex?: number;
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
};

type EmbedEventNameType =
  | "activeIndexChange"
  | "activePlayerTypeChange"
  | "sectionListChange"
  | "isSectionedChange"
  | "selectedSectionChange"
  | "containerInViewChange";

/**
 * Creates a new event bus instance for embed functionality
 * Each EmbedProvider should create its own instance to avoid cross-contamination
 */
export const createEmbedEventBus = (context?: EmbedEventContextType) =>
  new EventManager<EmbedEventContextType, EmbedEventNameType>({
    activePlayerType: "embed",
    activeIndex: 0,
    sectionList: [],
    isSectioned: false,
    selectedSection: null,
    autoInteractionActionDone: false,
    containerInView: true,
    ...context,
  });
