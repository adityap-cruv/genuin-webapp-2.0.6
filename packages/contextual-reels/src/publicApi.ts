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
  /**
   * Fire the `Infolinks Impression` analytics event for the target widget(s).
   *
   * @param instanceId  Target widget's instanceId or DOM id. Omit to target all
   *   widgets on the page.
   *
   * Iframe embeds can't reach `window.cxr` across the frame boundary — post
   * `{ type: 'cxr:infolinksImpression', instanceId? }` to the iframe instead
   * (see {@link installMessageBridge}).
   */
  infolinksImpression(instanceId?: string): void;
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

  function infolinksImpression(instanceId?: string): void {
    if (instanceId !== undefined) {
      registry.get(instanceId)?.fireInfolinksImpression?.();
      return;
    }
    // Snapshot first — each handler destroys its instance, unregistering it mid-iteration.
    for (const controls of Array.from(registry.getAll().values())) {
      controls.fireInfolinksImpression?.();
    }
  }

  return { on, expand, collapse, infolinksImpression, _emit };
}

/** postMessage type an iframe-embedded widget accepts from its parent page. */
export const INFOLINKS_IMPRESSION_MESSAGE = "cxr:infolinksImpression" as const;

/** Shape of the inbound iframe message consumed by {@link installMessageBridge}. */
interface InfolinksImpressionMessage {
  type: typeof INFOLINKS_IMPRESSION_MESSAGE;
  instanceId?: string;
}

function isInfolinksImpressionMessage(data: unknown): data is InfolinksImpressionMessage {
  return (
    typeof data === "object" && data !== null && (data as { type?: unknown }).type === INFOLINKS_IMPRESSION_MESSAGE
  );
}

/**
 * Listen for {@link INFOLINKS_IMPRESSION_MESSAGE} so a parent page can trigger
 * an iframe-embedded widget. No-op outside a browser. Returns a cleanup fn.
 */
export function installMessageBridge(api: CxrPublicApi): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = (event: MessageEvent): void => {
    if (!isInfolinksImpressionMessage(event.data)) return;
    api.infolinksImpression(event.data.instanceId);
  };
  window.addEventListener("message", handler);
  return () => window.removeEventListener("message", handler);
}
