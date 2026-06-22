/** Module-level singleton — one coordinator for all instances on the page. */
let _coordinator: GlobalPlayerCoordinator | null = null;

/**
 * Returns the module-level GlobalPlayerCoordinator singleton.
 */
export function getGlobalPlayerCoordinator(): GlobalPlayerCoordinator {
  if (!_coordinator) _coordinator = new GlobalPlayerCoordinator();
  return _coordinator;
}

/**
 * Tracks registered pause callbacks per instance.
 * When one instance calls notifyPlay, all others are paused.
 */
export class GlobalPlayerCoordinator {
  private readonly _instances = new Map<string, () => void>();

  /** Register a pause callback for an instance. */
  register(instanceId: string, pause: () => void): void {
    this._instances.set(instanceId, pause);
  }

  /** Remove an instance from coordination. */
  unregister(instanceId: string): void {
    this._instances.delete(instanceId);
  }

  /** Pause all instances except the one that just started playing. */
  notifyPlay(instanceId: string): void {
    for (const [id, pause] of this._instances) {
      if (id !== instanceId) pause();
    }
  }
}
