import type { FloatingVideoRestoreRequest, FloatingVideoSession } from "./types";

/**
 * The hand-off's shared state.
 *
 * It lives on `window` rather than in module scope for a concrete reason: the page bundle and
 * the Genuin SDK bundle each carry their own copy of this package, so module scope would give
 * them two independent stores. One `window` is the only thing they genuinely share.
 *
 * Everything here is deliberately dumb — reads and writes, no dispatching. Announcing a change
 * is `events.ts`'s job, which keeps "what is true" separate from "who was told".
 */

type FloatingVideoWindow = Window & {
  __genuinFloatingVideoSession?: FloatingVideoSession | null;
  /** Number of mounted host bridges willing to route a promoted navigation. */
  __genuinFloatingVideoHosts?: number;
  /** Survives the navigation back to the source route, which then consumes it. */
  __genuinFloatingVideoRestore?: FloatingVideoRestoreRequest | null;
};

const store = (): FloatingVideoWindow | null =>
  typeof window === "undefined" ? null : (window as FloatingVideoWindow);

// ─── Active session ──────────────────────────────────────────────────────────────────

/** The session currently promoted, or null when no floating hand-off is in flight. */
export function getFloatingVideoSession(): FloatingVideoSession | null {
  return store()?.__genuinFloatingVideoSession ?? null;
}

export function setFloatingVideoSession(session: FloatingVideoSession | null): void {
  const target = store();
  if (target) target.__genuinFloatingVideoSession = session;
}

export function createFloatingVideoSessionId(): string {
  return `fv-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// ─── Host registry ───────────────────────────────────────────────────────────────────

/**
 * Announces that a host router is listening and will perform promoted navigations itself.
 *
 * This handshake is what makes the hand-off safe to ship inside the SDK. The SDK renders its
 * links as plain anchors, so a pill click is normally a full document load, which no in-page
 * player can survive. Only when a first-party host says it will take over the navigation may
 * a link cancel its anchor. On any third-party page no host registers, nothing is
 * intercepted, and links behave exactly as they always have.
 */
export function registerFloatingVideoHost(): () => void {
  const target = store();
  if (!target) return () => undefined;
  target.__genuinFloatingVideoHosts = (target.__genuinFloatingVideoHosts ?? 0) + 1;
  return () => {
    target.__genuinFloatingVideoHosts = Math.max(0, (target.__genuinFloatingVideoHosts ?? 1) - 1);
  };
}

/** Whether a host bridge is mounted and will route promoted navigations client-side. */
export function isFloatingVideoHostAvailable(): boolean {
  return (store()?.__genuinFloatingVideoHosts ?? 0) > 0;
}

// ─── Pending restore ─────────────────────────────────────────────────────────────────

/** Parks a restore request so it outlives the navigation back to the source route. */
export function setPendingFloatingVideoRestore(request: FloatingVideoRestoreRequest | null): void {
  const target = store();
  if (target) target.__genuinFloatingVideoRestore = request;
}

/** Whether a restore is in flight, i.e. the card is deliberately outliving this navigation. */
export function hasPendingFloatingVideoRestore(): boolean {
  return Boolean(store()?.__genuinFloatingVideoRestore);
}

/**
 * Takes the pending restore request for this placement, if there is one. Reading it clears it,
 * so a placement can only act on it once.
 *
 * Matching prefers `placementId` because it survives the navigation; `domId` is only a fallback
 * for a placement that has no placement id of its own.
 */
export function consumePendingFloatingVideoRestore(placement: {
  domId: string;
  placementId?: string;
  articleSlug?: string;
}): FloatingVideoRestoreRequest | null {
  const target = store();
  const pending = target?.__genuinFloatingVideoRestore;
  if (!target || !pending) return null;
  if (pending.sourceArticleSlug && pending.sourceArticleSlug !== placement.articleSlug) return null;
  const matches = pending.sourcePlacementId
    ? pending.sourcePlacementId === placement.placementId
    : pending.sourceDomId === placement.domId;
  if (!matches) return null;
  target.__genuinFloatingVideoRestore = null;
  return pending;
}
