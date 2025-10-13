import { EventManager } from "@genuin/components/lib/utils/event-manager";

export type BaseEventBusContext = {
  userIsFocused: boolean;
  muted: boolean;
  /**
   * To track whether to bypass muted change emit or not.
   */
  firstTimeMutedBypass: boolean;
  volume: number;
  /**
   * To track whether any video is playing or not globally.
   * This will only work for iheart, not other brands.
   */
  globalPlayingState: boolean;
};

type EventNames = "userFocusChange" | "globalPlayingStateChange";

export function createBaseEventBus() {
  return new EventManager<BaseEventBusContext, EventNames>({
    userIsFocused: true,
    firstTimeMutedBypass: true,
    muted: true,
    volume: 100,
    globalPlayingState: false,
  });
}
