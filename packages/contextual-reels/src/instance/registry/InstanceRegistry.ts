/** Controls exposed per widget instance. */
export interface InstanceControls {
  /** Programmatically expand (enter fullscreen) this instance. */
  expand: () => void;
  /** Programmatically collapse (exit fullscreen) this instance. */
  collapse: () => void;
  /** Pause playback on this instance. */
  pause: () => void;
}

let _registry: InstanceRegistry | null = null;

/**
 * Returns the module-level InstanceRegistry singleton.
 */
export function getInstanceRegistry(): InstanceRegistry {
  if (!_registry) _registry = new InstanceRegistry();
  return _registry;
}

/**
 * Maps instanceId to its controls. Used by the public API.
 *
 * Supports two lookup keys per widget:
 *  - internal instanceId  (e.g. "cxr-1716000000000-123456") — set by the runtime
 *  - DOM element id       (e.g. "gen-ext-1")               — set by the partner's HTML
 *
 * `expand("gen-ext-2")` and `expand("cxr-...")` both work.
 */
export class InstanceRegistry {
  private readonly _instances = new Map<string, InstanceControls>();
  /** domId → instanceId alias map */
  private readonly _aliases = new Map<string, string>();

  /** Register controls for the given instanceId. Overwrites any existing entry. */
  register(instanceId: string, controls: InstanceControls): void {
    this._instances.set(instanceId, controls);
  }

  /**
   * Register a DOM element id as an alias for an instanceId.
   * Called from index.jsx when the element has an `id` attribute.
   */
  registerAlias(domId: string, instanceId: string): void {
    this._aliases.set(domId, instanceId);
  }

  /** Remove the controls and any alias for the given instanceId. No-op if not registered. */
  unregister(instanceId: string): void {
    this._instances.delete(instanceId);
    // Remove alias entries pointing at this instanceId
    for (const [domId, id] of this._aliases) {
      if (id === instanceId) this._aliases.delete(domId);
    }
  }

  /**
   * Retrieve controls by instanceId or DOM element id.
   * Tries instanceId first, then resolves via alias map.
   */
  get(id: string): InstanceControls | undefined {
    return this._instances.get(id) ?? this._instances.get(this._aliases.get(id) ?? "");
  }

  /** Return an immutable view of all registered instances. */
  getAll(): ReadonlyMap<string, InstanceControls> {
    return this._instances;
  }
}
