import { announceFloatingVideoPresented, clearFloatingVideo, onFloatingVideoClear } from "./events";
import { isPlacementParked } from "./placement-retention";
import { getFloatingVideoSession } from "./session-store";
import type { FloatingVideoSession } from "./types";

/**
 * Lets an already-running SDK expand view keep playing as the bottom-right floating card
 * after its page has navigated away.
 *
 * This deliberately contains no card styling of its own. The card, its entrance animation,
 * its close button and its compact control layer all come from the inline-article floating
 * video (`INLINE_ARTICLE_PLAYER_CSS` and the `isVideoFloating` branches in `player-swiper`),
 * which the player enters by itself on the promote event. Copying those rules here would be
 * two implementations to keep in sync; instead this only has to make the host stop behaving
 * like a full-screen overlay so the card the player already renders becomes visible.
 *
 * It is DOM-level rather than React because the page root that used to frame the expand view
 * is unmounting at exactly the moment the hand-off happens — there is no tree left to render
 * into on this side.
 */

const FLOATING_ATTRIBUTE = "data-genuin-floating-video";
const STYLE_ID = "gen-floating-video-style";

/**
 * `visibility: hidden` inherits but can be overridden by descendants, so hiding everything and
 * re-showing only the video-frame subtree strips the expand view's backdrop, side panels and
 * feed chrome while leaving the floating card — which lives inside that frame — untouched.
 *
 * The host keeps its full-viewport box on purpose: the card is positioned `absolute` against
 * the player root, so the player root has to stay the size of the screen for the card to land
 * in the same place it does for an inline article.
 */
const FLOATING_VIDEO_CSS = `
  [${FLOATING_ATTRIBUTE}="true"] {
    position: fixed !important;
    inset: 0 !important;
    width: 100% !important;
    height: 100% !important;
    background: transparent !important;
    visibility: visible !important;
    pointer-events: none !important;
    z-index: 2147483000 !important;
  }
  [${FLOATING_ATTRIBUTE}="true"] * {
    visibility: hidden !important;
  }
  /* Strip the expand view's opaque backdrops, but never inside the card — the close button and
     the control layer paint their own translucent surfaces and must keep them. */
  [${FLOATING_ATTRIBUTE}="true"] *:not([data-feed-video-frame]):not([data-feed-video-frame] *) {
    background-color: transparent !important;
  }
  [${FLOATING_ATTRIBUTE}="true"] [data-feed-video-frame],
  [${FLOATING_ATTRIBUTE}="true"] [data-feed-video-frame] * {
    visibility: visible !important;
  }
  [${FLOATING_ATTRIBUTE}="true"] [data-feed-video-frame] {
    pointer-events: auto !important;
  }
`;

type FloatingVideoPresentation = {
  /**
   * Removes the floating framing. Pass `adopted` when the host is being re-framed as the
   * full-size player rather than discarded, so the media is left running.
   */
  teardown: (adopted?: boolean) => void;
};

/** Re-frames `host` as the floating card for `session`. Returns a teardown handle. */
export function presentFloatingVideo(
  host: HTMLElement,
  session: FloatingVideoSession
): FloatingVideoPresentation {
  // FeedViewOverlay pins the host with inline `!important` styles while it is the bounded Feed
  // View. Inline `!important` outranks a stylesheet `!important`, so those have to go first.
  host.removeAttribute("style");
  host.setAttribute(FLOATING_ATTRIBUTE, "true");
  // The page being left renders its Feed View Back control into a body portal. That page is
  // mid-unmount and its player is now this card, so the control would linger over a blank
  // route with nothing to go back to.
  //
  // Hidden, never removed: React still owns these nodes, and detaching one behind its back
  // makes its own unmount throw `removeChild ... not a child of this node`, which takes the
  // whole destination route down with an error boundary.
  document.querySelectorAll<HTMLElement>('[data-slot="feed-view-back"]').forEach((node) => {
    node.style.setProperty("display", "none", "important");
  });

  let style = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = FLOATING_VIDEO_CSS;
    document.head.appendChild(style);
  }

  // A finished or broken video has nothing left to float. Capture phase because media events
  // do not bubble, and scoped to this host so an unrelated player never ends the session.
  const handleMediaEvent = (event: Event) => {
    if (!(event.target instanceof HTMLMediaElement)) return;
    clearFloatingVideo(session.sessionId, event.type === "error" ? "video-error" : "video-ended");
  };
  host.addEventListener("ended", handleMediaEvent, true);
  host.addEventListener("error", handleMediaEvent, true);

  announceFloatingVideoPresented(session.sessionId);

  return {
    teardown: (adopted = false) => {
      host.removeEventListener("ended", handleMediaEvent, true);
      host.removeEventListener("error", handleMediaEvent, true);
      host.removeAttribute(FLOATING_ATTRIBUTE);
      document.getElementById(STYLE_ID)?.remove();
      // Adopted: this host is about to be pinned as the full-size Feed View, so leave the
      // media playing and the host visible — it is the same player, just re-framed.
      if (adopted) return;
      // Keep the player silent and out of the way for the frame or two before the SDK's
      // floating lease unmounts the retained root.
      host.querySelectorAll<HTMLMediaElement>("video, audio").forEach((media) => {
        if (!media.paused) media.pause();
      });
      host.style.setProperty("visibility", "hidden", "important");
      host.style.setProperty("pointer-events", "none", "important");
    },
  };
}

type GenuinWindow = Window & { genuin?: { collapse?: (id: string) => void } };

/**
 * Starts the floating presentation for whatever session is currently active and keeps it up
 * until that session is cleared, at which point the expand view is collapsed for real.
 *
 * Call this from the page root's teardown, at the moment the route that owned the player goes
 * away. Returns false when there is no session to present, so the caller can fall through to
 * its normal collapse behaviour.
 *
 * The session names its own placement rather than being matched against the caller's dom id.
 * Those two legitimately diverge: once a card has been handed back, the visible Feed View is
 * the *retained* root, so the next hand-off comes from that placement while the page is still
 * passing the dom id of the freshly mounted one. Only one Feed View is open at a time, so the
 * open session is unambiguously the one being framed.
 */
export function beginFloatingVideoPresentation(host: HTMLElement): boolean {
  const session = getFloatingVideoSession();
  if (!session) return false;

  const { teardown } = presentFloatingVideo(host, session);

  const off = onFloatingVideoClear(({ sessionId, reason }) => {
    if (sessionId !== session.sessionId) return;
    off();
    teardown(reason === "adopted");
    if (reason === "adopted") return;
    // Only collapse a placement that is still in the document. `genuin.collapse()` resolves
    // its target by embed/placement id and the SDK broadcasts the result to every instance
    // sharing that id — including the freshly mounted placement on the route we just
    // returned to, which would collapse the very Feed View this hand-off restored. A
    // detached root needs no reset anyway: the SDK's floating lease unmounts it whole.
    const container = document.getElementById(session.sourceDomId);
    // A parked container is in the document only to stay measurable; the placement itself is
    // gone, so there is nothing to collapse.
    if (!container || isPlacementParked(container)) return;
    try {
      (window as GenuinWindow).genuin?.collapse?.(session.sourceDomId);
    } catch {
      /* The placement is already gone; the lease still releases the root. */
    }
  });

  return true;
}
