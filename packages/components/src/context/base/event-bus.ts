import { EventManager } from "@genuin/components/lib/utils/event-manager";

export type BaseEventBusContext = {
  userIsFocused: boolean;
  muted: boolean;
  /**
   * To track whether to bypass muted change emit or not.
   */
  firstTimeMutedBypass: boolean;
  volume: number;
};

type EventNames = "userFocusChange";

export function createBaseEventBus() {
  return new EventManager<BaseEventBusContext, EventNames>({
    userIsFocused: true,
    firstTimeMutedBypass: true,
    muted: true,
    volume: 100,
  });
}
