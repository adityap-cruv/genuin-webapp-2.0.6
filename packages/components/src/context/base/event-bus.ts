import { EventManager } from "@genuin/components/lib/utils/event-manager";

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
   * Whether the player was paused by a system/browser restriction.
   * When true, all players should show the system pause recovery UI.
   */
  systemPaused: boolean;
};

type EventNames =
  | "userFocusChange"
  | "globalPlayingStateChange"
  | "systemPauseStateChange";

export function createBaseEventBus(initialGlobalPlayingState: boolean = true) {
  return new EventManager<BaseEventBusContext, EventNames>({
    userIsFocused: true,
    muted: true,
    volume: 100,
    globalPlayingState: initialGlobalPlayingState,
    systemPaused: false,
  });
}
