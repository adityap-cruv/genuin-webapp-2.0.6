import type { InstanceRegistry } from "@cxr/instance/registry/InstanceRegistry";

/** Public events exposed on window.cxr.on() */
export type CxrPublicEvent =
  | "ready"
  | "play"
  | "pause"
  | "fullscreen:enter"
  | "fullscreen:exit"
  | "ad:fill"
  | "ad:nofill"
  | "ad:removed";

/** Payload delivered to public event handlers. */
export interface CxrEventPayload {
  instanceId: string;
  event: CxrPublicEvent;
  data?: Record<string, unknown>;
}

/** The public API surface exposed on window.cxr */
export interface CxrPublicApi {
  /**
   * Subscribe to a public event. Returns an unsubscribe function.
   *
   * `"ready"` fires once per instance when its React root has mounted (App's
   * own effect committed) — core controls like `expand`/`collapse` are usable
   * from that point on. Attach the listener before the widget's script runs
   * (synchronously, before yielding to any async task) so it can't miss the
   * emit; `on()` itself has no replay buffer for events fired before subscribing.
   */
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
  /**
   * Replace a widget's tag config live (dashboard preview). No-op if the
   * target instance is unknown or not in preview mode.
   *
   * Iframe embeds can't reach `window.cxr` across the frame boundary — post
   * `{ type: 'cxr:setPreviewConfig', instanceId, config }` instead (see
   * {@link installMessageBridge}).
   */
  setPreviewConfig(instanceId: string, config: Record<string, unknown>): void;
}

/** Internal extension of CxrPublicApi used by usePublicApiBridge to bridge bus events. */
export interface CxrPublicApiInternal extends CxrPublicApi {
  _emit(instanceId: string, event: CxrPublicEvent, data?: Record<string, unknown>): void;
  /**
   * Dev-only: installed by {@link useHeavyAdReporter} under the Vite dev server (stripped
   * from prod builds). Fires the full "Ad Removed" path with a synthetic report so the
   * event can be exercised from the console locally, where real Chrome HAI never triggers.
   * Optional `limit` seeds the parsed limit label. Absent in production.
   */
  _debugSimulateAdRemoval?(limit?: string): void;
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

  function setPreviewConfig(instanceId: string, config: Record<string, unknown>): void {
    registry.get(instanceId)?.setPreviewConfig?.(config);
  }

  return { on, expand, collapse, infolinksImpression, setPreviewConfig, _emit };
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

/** postMessage type for a live preview config push into an iframe-embedded widget. */
export const SET_PREVIEW_CONFIG_MESSAGE = "cxr:setPreviewConfig" as const;

/** Shape of the inbound iframe preview-config message. */
interface SetPreviewConfigMessage {
  type: typeof SET_PREVIEW_CONFIG_MESSAGE;
  instanceId: string;
  config: Record<string, unknown>;
}

function isSetPreviewConfigMessage(data: unknown): data is SetPreviewConfigMessage {
  if (typeof data !== "object" || data === null) return false;
  const msg = data as { type?: unknown; instanceId?: unknown; config?: unknown };
  return (
    msg.type === SET_PREVIEW_CONFIG_MESSAGE &&
    typeof msg.instanceId === "string" &&
    typeof msg.config === "object" &&
    msg.config !== null
  );
}

/**
 * Listen for {@link INFOLINKS_IMPRESSION_MESSAGE} so a parent page can trigger
 * an iframe-embedded widget. No-op outside a browser. Returns a cleanup fn.
 */
export function installMessageBridge(api: CxrPublicApi): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = (event: MessageEvent): void => {
    if (isSetPreviewConfigMessage(event.data)) {
      api.setPreviewConfig(event.data.instanceId, event.data.config);
      return;
    }
    if (!isInfolinksImpressionMessage(event.data)) return;
    api.infolinksImpression(event.data.instanceId);
  };
  window.addEventListener("message", handler);
  return () => window.removeEventListener("message", handler);
}
