import { EventManager } from "@genuin/components/lib/utils/event-manager";

type Context = {
  userIsFocused: boolean;
};

type EventNames = "userFocusChange";

export function createBaseEventBus() {
  return new EventManager<Context, EventNames>({
    userIsFocused: true,
  });
}
