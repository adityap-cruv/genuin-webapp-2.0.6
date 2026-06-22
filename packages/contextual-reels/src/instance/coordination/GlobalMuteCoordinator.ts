/** Module-level singleton — one coordinator for all instances on the page. */
let _coordinator: GlobalMuteCoordinator | null = null;

/**
 * Returns the module-level GlobalMuteCoordinator singleton.
 */
export function getGlobalMuteCoordinator(): GlobalMuteCoordinator {
  if (!_coordinator) _coordinator = new GlobalMuteCoordinator();
  return _coordinator;
}

/**
 * Ensures at most one CXR instance is unmuted at a time.
 *
 * When an instance calls `notifyUnmuted`, all other registered instances
 * have their `mute` callback invoked.
 */
export class GlobalMuteCoordinator {
  private readonly _instances = new Map<string, () => void>();

  /** Register a mute callback for the given instanceId. */
  register(instanceId: string, mute: () => void): void {
    this._instances.set(instanceId, mute);
  }

  /** Remove an instance from coordination. */
  unregister(instanceId: string): void {
    this._instances.delete(instanceId);
  }

  /** Mute all instances except the one that just unmuted. */
  notifyUnmuted(instanceId: string): void {
    for (const [id, mute] of this._instances) {
      if (id !== instanceId) mute();
    }
  }
}
