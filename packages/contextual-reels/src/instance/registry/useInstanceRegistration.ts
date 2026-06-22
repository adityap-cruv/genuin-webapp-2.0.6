import { useEffect } from "react";

import { useEventBus } from "@cxr/instance/coordination/EventBusContext";
import { useInstanceId } from "@cxr/instance/registry/InstanceContext";
import { getInstanceRegistry } from "@cxr/instance/registry/InstanceRegistry";
import type { InstanceControls } from "@cxr/instance/registry/InstanceRegistry";

/**
 * Register this instance's controls into the InstanceRegistry on mount,
 * unregister on unmount.
 *
 * Expand and collapse are wired to the per-instance {@link CxrEventBus} so
 * that the public API routes imperative calls through the same event channel
 * used internally.
 *
 * @param pause  Function that pauses playback for this instance.
 */
export function useInstanceRegistration(pause: () => void): void {
  const instanceId = useInstanceId();
  const bus = useEventBus();

  useEffect(() => {
    const controls: InstanceControls = {
      expand: () => bus.emit("video:expand", {}),
      collapse: () => bus.emit("video:collapse", {}),
      pause,
    };

    getInstanceRegistry().register(instanceId, controls);

    return () => {
      getInstanceRegistry().unregister(instanceId);
    };
  }, [instanceId, bus, pause]);
}
