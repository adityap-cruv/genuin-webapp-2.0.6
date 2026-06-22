import { EventManager } from "@genuin/components/lib/utils/event-manager";

/**
 * The visual state of the bottom sheet.
 * Matches the DraggableSheetState from @genuin/ui.
 */
export type SheetState =
  | "pl-xs"
  | "pl-sml"
  | "default"
  | "default-active"
  | "expand-view"
  | "panel-view"
  | "full-view"
  | "responsive";

/**
 * @deprecated Use `SheetState` instead. Will be removed in a future version.
 */
export type ExpandableWrapperState = SheetState;

/**
 * Describes which content type the bottom sheet is currently displaying.
 */
export type SheetContentType = "default" | "octo" | "linkouts" | "comments";

/**
 * Where the content type should be rendered relative to the video player.
 * - "inside"  — rendered overlaid / inside the video player bounds
 * - "outside" — rendered outside / below the video player bounds
 */
export type SheetContentPlacement = "inside" | "outside";

/**
 * @deprecated Use `SheetContentType` instead. Will be removed in a future version.
 */
export type ExpandableLayout = SheetContentType;

export type BaseEventBusContext = {
  userIsFocused: boolean;
  muted: boolean;
  volume: number;
  /**
   * To track whether any video is playing or not globally.
   * This will only work for iheart, not other brands.
   */
  globalPlayingState: boolean;
  /**
   * Per-content-type sheet states. Each active content type independently tracks its own
   * visual state (e.g. "default", "panel-view", "full-view").
   */
  sheetContentStates: Partial<Record<SheetContentType, SheetState>>;
  /**
   * All content types that are currently open / active.
   * Multiple types can be open simultaneously.
   */
  activeSheetContentTypes: SheetContentType[];
  /**
   * Specifies where each active content type should be rendered.
   * "inside"  — overlaid inside the video player.
   * "outside" — rendered outside / below the video player.
   */
  sheetContentPlacements: Partial<Record<SheetContentType, SheetContentPlacement>>;
  /*
   * Whether the player was paused by a system/browser restriction.
   * When true, all players should show the system pause recovery UI.
   */
  systemPaused: boolean;
  hasUserInteractedWithMute: boolean; // To track if user has manually interacted with mute/unmute, to handle browser autoplay policies that require user interaction before unmuting audio.
  /**
   * Whether the Octo widget has been explicitly hidden by the user (e.g. via
   * swipe-down or the action-button toggle). Stored on the global event bus so
   * any consumer can derive `isOctoVisible` from `useSheetState()` without
   * requiring an `onStateChange` callback or local `useState<OctoState>`.
   */
  octoHidden: boolean;
  /** Whether the Octo widget is currently visible (enabled, active, not hidden, past delay). */
  octoVisible: boolean;
  // /**
  //  * Per-content-type sheet states. Each active content type independently tracks its own
  //  * visual state (e.g. "default", "panel-view", "full-view").
  //  */
  // sheetContentStates: Partial<Record<SheetContentType, SheetState>>;
  // /**
  //  * All content types that are currently open / active.
  //  * Multiple types can be open simultaneously.
  //  */
  // activeSheetContentTypes: SheetContentType[];
  // /**
  //  * Specifies where each active content type should be rendered.
  //  * "inside"  — overlaid inside the video player.
  //  * "outside" — rendered outside / below the video player.
  //  */
  // sheetContentPlacements: Partial<Record<SheetContentType, SheetContentPlacement>>;
};

type EventNames =
  | "userFocusChange"
  | "globalPlayingStateChange"
  | "systemPauseStateChange"
  | "sheetStateChange"
  | "sheetContentTypeChange";

export function createBaseEventBus(initialGlobalPlayingState: boolean = true) {
  return new EventManager<BaseEventBusContext, EventNames>({
    userIsFocused: true,
    muted: true,
    volume: 100,
    globalPlayingState: initialGlobalPlayingState,
    systemPaused: false,
    hasUserInteractedWithMute: false,
    // TODO: Create different content types for Octo, Linkouts, Comments, etc. rather than lumping them all under "default"
    sheetContentStates: { linkouts: "default" },
    activeSheetContentTypes: ["linkouts"],
    sheetContentPlacements: { linkouts: "inside" },
    octoHidden: false,
    octoVisible: false,
  });
}
