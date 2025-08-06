import { EventManager } from "../../lib/utils/event-bus-class";

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
};

type EmbedEventNameType = "activeIndexChange" | "activePlayerTypeChange";

/**
 * Creates a new event bus instance for embed functionality
 * Each EmbedProvider should create its own instance to avoid cross-contamination
 */
export const createEmbedEventBus = (context?: EmbedEventContextType) =>
  new EventManager<EmbedEventContextType, EmbedEventNameType>({
    activePlayerType: "embed",
    activeIndex: 0,
    ...context,
  });
