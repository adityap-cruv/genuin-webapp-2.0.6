import { useEffect } from "react";

import { useEventBus, useInstanceId } from "@cxr/instance/InstanceContext";
import { getInstanceRegistry } from "@cxr/instance/registry/InstanceRegistry";
import type { InstanceControls } from "@cxr/instance/registry/InstanceRegistry";

/**
 * Register this instance's controls into the InstanceRegistry on mount,
 * unregister on unmount.
 *
 * Expand and collapse are wired to the per-instance {@link CxrEventBus} so
 * that the public API routes imperative calls through the same event channel
 * used internally.
 */
export function useInstanceRegistration(): void {
  const instanceId = useInstanceId();
  const bus = useEventBus();

  useEffect(() => {
    const controls: Partial<InstanceControls> = {
      expand: () => bus.emit("video:expand", {}),
      collapse: () => bus.emit("video:collapse", {}),
    };

    getInstanceRegistry().register(instanceId, controls);

    return () => {
      getInstanceRegistry().unregister(instanceId);
    };
  }, [instanceId, bus]);
}
