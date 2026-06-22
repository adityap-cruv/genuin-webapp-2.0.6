import type { InstanceRegistry } from "@cxr/instance/registry/InstanceRegistry";

/** Public events exposed on window.cxr.on() */
export type CxrPublicEvent = "play" | "pause" | "fullscreen:enter" | "fullscreen:exit" | "ad:fill" | "ad:nofill";

/** Payload delivered to public event handlers. */
export interface CxrEventPayload {
  instanceId: string;
  event: CxrPublicEvent;
  data?: Record<string, unknown>;
}

/** The public API surface exposed on window.cxr */
export interface CxrPublicApi {
  /** Subscribe to a public event. Returns an unsubscribe function. */
  on(event: CxrPublicEvent, handler: (payload: CxrEventPayload) => void): () => void;
  /** Imperatively expand (enter fullscreen) the widget with the given instanceId. */
  expand(instanceId: string): void;
  /** Imperatively collapse (exit fullscreen) the widget with the given instanceId. */
  collapse(instanceId: string): void;
}

/** Internal extension of CxrPublicApi used by AppRegistrar to bridge bus events. */
export interface CxrPublicApiInternal extends CxrPublicApi {
  _emit(instanceId: string, event: CxrPublicEvent, data?: Record<string, unknown>): void;
}

type PublicHandlerSet = Set<(payload: CxrEventPayload) => void>;

/**
 * Build the public API object backed by the given InstanceRegistry.
 */
export function buildPublicApi(registry: InstanceRegistry): CxrPublicApiInternal {
  const _handlers = new Map<CxrPublicEvent, PublicHandlerSet>();

  function on(event: CxrPublicEvent, handler: (payload: CxrEventPayload) => void): () => void {
    if (!_handlers.has(event)) _handlers.set(event, new Set());
    _handlers.get(event)!.add(handler);
    return () => _handlers.get(event)?.delete(handler);
  }

  function _emit(instanceId: string, event: CxrPublicEvent, data?: Record<string, unknown>): void {
    const set = _handlers.get(event);
    if (!set) return;
    const payload: CxrEventPayload = { instanceId, event, data };
    for (const h of set) h(payload);
  }

  function expand(instanceId: string): void {
    registry.get(instanceId)?.expand();
  }

  function collapse(instanceId: string): void {
    registry.get(instanceId)?.collapse();
  }

  return { on, expand, collapse, _emit };
}
