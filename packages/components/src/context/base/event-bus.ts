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
};

type EventNames = "userFocusChange" | "globalPlayingStateChange";

export function createBaseEventBus(initialGlobalPlayingState: boolean = true) {
  return new EventManager<BaseEventBusContext, EventNames>({
    userIsFocused: true,
    muted: true,
    volume: 100,
    globalPlayingState: initialGlobalPlayingState,
  });
}
