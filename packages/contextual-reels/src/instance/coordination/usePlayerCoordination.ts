import { useEffect } from "react";

import { useEventBus } from "@cxr/instance/coordination/EventBusContext";
import { getGlobalMuteCoordinator } from "@cxr/instance/coordination/GlobalMuteCoordinator";
import { getGlobalPlayerCoordinator } from "@cxr/instance/coordination/GlobalPlayerCoordinator";
import { useInstanceId } from "@cxr/instance/registry/InstanceContext";
import { usePlayer } from "@cxr/providers/PlayerProvider";

/**
 * Register this instance with the GlobalPlayerCoordinator and GlobalMuteCoordinator.
 *
 * - When 'player:play' fires on this bus, all other instances are paused.
 * - When 'mute:unmuted' fires on this bus, all other instances are muted.
 * - When another instance unmutes, this instance mutes itself.
 */
export function usePlayerCoordination(pause: () => void): void {
  const instanceId = useInstanceId();
  const bus = useEventBus();
  const { setMuted } = usePlayer();

  useEffect(() => {
    const playCoord = getGlobalPlayerCoordinator();
    playCoord.register(instanceId, pause);
    const unsubPlay = bus.on("player:play", () => playCoord.notifyPlay(instanceId));

    const muteCoord = getGlobalMuteCoordinator();
    // Register: when another instance unmutes, mute this one
    muteCoord.register(instanceId, () => setMuted(true));
    // Broadcast: when this instance unmutes, mute all others
    const unsubMute = bus.on("mute:unmuted", () => muteCoord.notifyUnmuted(instanceId));

    return () => {
      playCoord.unregister(instanceId);
      unsubPlay();
      muteCoord.unregister(instanceId);
      unsubMute();
    };
  }, [instanceId, bus, pause, setMuted]);
}
