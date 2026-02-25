import { EventManager } from "@genuin/components/lib/utils/event-manager";

/**
 * The visual state of the bottom sheet.
 * Matches the DraggableSheetState from @genuin/ui.
 */
export type SheetState =
  | "default"
  | "default-active"
  | "expand-view"
  | "panel-view"
  | "full-view";

/**
 * @deprecated Use `SheetState` instead. Will be removed in a future version.
 */
export type ExpandableWrapperState = SheetState;

/**
 * Describes which content type the bottom sheet is currently displaying.
 */
export type SheetContentType = "default" | "octo" | "linkouts" | "comments";

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
   * The current visual state of the bottom sheet (e.g. "default", "panel-view", "full-view").
   */
  sheetState: SheetState;
  /**
   * The content type currently loaded in the bottom sheet (e.g. "comments", "linkouts").
   */
  sheetContentType: SheetContentType;
};

type EventNames =
  | "userFocusChange"
  | "globalPlayingStateChange"
  | "sheetStateChange"
  | "sheetContentTypeChange";

export function createBaseEventBus(initialGlobalPlayingState: boolean = true) {
  return new EventManager<BaseEventBusContext, EventNames>({
    userIsFocused: true,
    muted: true,
    volume: 100,
    globalPlayingState: initialGlobalPlayingState,
    sheetState: "default",
    sheetContentType: "default",
  });
}
