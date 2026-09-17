import { getFloatingVideoSession, setFloatingVideoSession } from "./session-store";
import type {
  FloatingVideoClearDetail,
  FloatingVideoClearReason,
  FloatingVideoPromotionIntent,
  FloatingVideoRestoreRequest,
  FloatingVideoSession,
  FloatingVideoTrigger,
} from "./types";

/**
 * The wire between the three roots that take part in a floating-video hand-off: the page
 * (Next.js) root, each Genuin SDK placement root, and the SDK runtime. They load from separate
 * bundles and share neither context nor module state — but they do share one `document`, so
 * every step of the protocol is a document-level `CustomEvent`.
 *
 * The flow, in order:
 *
 * 1. A navigating surface dispatches an **intent** ("I am going to X, come with me").
 * 2. The player showing that video answers by **promoting** itself, which opens a session.
 * 3. The destination route eventually **clears** the session, or asks to **restore** the video
 *    to where it was full size, at which point the SDK runtime releases the React root it was
 *    keeping alive.
 *
 * Step 1 is what makes this reusable: a surface needs to know only its own href, never
 * anything about players, placements or sessions.
 */

/** Navigating surface → player: this navigation would like to take the video with it. */
export const FLOATING_VIDEO_INTENT_EVENT = "genuin:floating-video-intent";
/** Player → everyone: a session is open for this video. */
export const FLOATING_VIDEO_PROMOTE_EVENT = "genuin:floating-video-promote";
/** Presenter → player: the framing is applied; this player is a card from now on. */
export const FLOATING_VIDEO_PRESENTED_EVENT = "genuin:floating-video-presented";
/** Anyone → everyone: the session is over; collapse the floating player and clean up. */
export const FLOATING_VIDEO_CLEAR_EVENT = "genuin:floating-video-clear";
/** Card → host: take me back to where this video was full size, and re-open it there. */
export const FLOATING_VIDEO_RESTORE_EVENT = "genuin:floating-video-restore";

function dispatch<T>(name: string, detail: T): void {
  if (typeof document === "undefined") return;
  document.dispatchEvent(new CustomEvent<T>(name, { detail }));
}

function subscribe<T>(name: string, listener: (detail: T) => void): () => void {
  if (typeof document === "undefined") return () => undefined;
  const handler = (event: Event) => listener((event as CustomEvent<T>).detail);
  document.addEventListener(name, handler);
  return () => document.removeEventListener(name, handler);
}

// ─── 1. Intent ───────────────────────────────────────────────────────────────────────

/**
 * Offers a navigation to whichever player is currently eligible, and reports whether one took
 * it. Synchronous: `dispatchEvent` runs listeners inline, so the answer is available before
 * this returns and the caller can decide within the same click.
 */
export function requestFloatingVideoPromotion(request: {
  targetHref: string;
  trigger: FloatingVideoTrigger;
}): boolean {
  const intent: FloatingVideoPromotionIntent = { ...request, accepted: false };
  dispatch(FLOATING_VIDEO_INTENT_EVENT, intent);
  return intent.accepted;
}

export function onFloatingVideoPromotionIntent(listener: (intent: FloatingVideoPromotionIntent) => void): () => void {
  return subscribe(FLOATING_VIDEO_INTENT_EVENT, listener);
}

// ─── 2. Promote ──────────────────────────────────────────────────────────────────────

/**
 * Records the session and tells every root about it.
 *
 * Call this synchronously while handling the intent, before the router navigates: the SDK root
 * must already know it is being handed off by the time the page root starts unmounting.
 */
export function promoteFloatingVideo(session: FloatingVideoSession): void {
  const previous = getFloatingVideoSession();
  if (previous && previous.sessionId !== session.sessionId) {
    clearFloatingVideo(previous.sessionId, "superseded");
  }
  setFloatingVideoSession(session);
  dispatch(FLOATING_VIDEO_PROMOTE_EVENT, session);
}

export function onFloatingVideoPromote(listener: (session: FloatingVideoSession) => void): () => void {
  return subscribe(FLOATING_VIDEO_PROMOTE_EVENT, listener);
}

/**
 * Announced when the card framing is applied — which happens as the source route finally
 * unmounts, not when the session opens.
 *
 * The distinction matters: a promoted session exists from the click, but the navigation may
 * still be in flight. Shrinking the player at click time would leave the user staring at a
 * gutted source page while the destination loads.
 */
export function announceFloatingVideoPresented(sessionId: string): void {
  dispatch(FLOATING_VIDEO_PRESENTED_EVENT, { sessionId });
}

export function onFloatingVideoPresented(listener: (detail: { sessionId: string }) => void): () => void {
  return subscribe(FLOATING_VIDEO_PRESENTED_EVENT, listener);
}

// ─── 3. Clear / restore ──────────────────────────────────────────────────────────────

/**
 * Ends a session. Safe to call for an already-cleared or unknown session id — the stale call
 * is dropped rather than tearing down a newer session.
 */
export function clearFloatingVideo(sessionId: string, reason: FloatingVideoClearReason): void {
  const active = getFloatingVideoSession();
  if (!active || active.sessionId !== sessionId) return;
  const { sourceDomId, sourceInstanceId } = active;
  setFloatingVideoSession(null);
  dispatch<FloatingVideoClearDetail>(FLOATING_VIDEO_CLEAR_EVENT, {
    sessionId,
    reason,
    sourceDomId,
    sourceInstanceId,
  });
}

export function onFloatingVideoClear(listener: (detail: FloatingVideoClearDetail) => void): () => void {
  return subscribe(FLOATING_VIDEO_CLEAR_EVENT, listener);
}

/**
 * Asks the host to return to the route where this video was full size.
 *
 * The card's expand control means "put the video back the way it was". For an inline article
 * that is a local state change; for a hand-off the full-size player lives on another route, so
 * restoring it is a navigation plus a re-open once we get there.
 */
export function requestFloatingVideoRestore(request: FloatingVideoRestoreRequest): void {
  dispatch(FLOATING_VIDEO_RESTORE_EVENT, request);
}

export function onFloatingVideoRestore(listener: (request: FloatingVideoRestoreRequest) => void): () => void {
  return subscribe(FLOATING_VIDEO_RESTORE_EVENT, listener);
}
