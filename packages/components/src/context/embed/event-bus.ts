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
};

type EmbedEventNameType =
  | "activeIndexChange"
  | "activePlayerTypeChange"
  | "sectionListChange"
  | "isSectionedChange"
  | "selectedSectionChange";

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
    ...context,
  });
