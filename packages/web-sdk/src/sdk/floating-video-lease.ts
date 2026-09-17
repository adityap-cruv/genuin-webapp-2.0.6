/**
 * Runtime side of the floating-video hand-off (see `@genuin/components` → `lib/floating-video`).
 *
 * When a placement's video is promoted to the floating player for a navigation, the host page
 * removes the placement's container from the DOM on the route change. The React root mounted
 * into that container keeps running — which is exactly what keeps the video playing, because
 * the floating player portals into `document.body` rather than into the container.
 *
 * That retained root is a leak unless somebody releases it. This does: when the session ends,
 * the root whose container is no longer in the document is unmounted explicitly.
 */

const FLOATING_VIDEO_CLEAR_EVENT = "genuin:floating-video-clear";
/**
 * A container the hand-off parked in the document purely to stay measurable. Its placement is
 * gone, so for the purposes of releasing the root it counts as detached — otherwise the root
 * it was keeping alive would never be released.
 */
const PARKED_ATTRIBUTE = "data-genuin-floating-parked";

type FloatingVideoClearDetail = {
  sessionId: string;
  reason: string;
  sourceDomId: string;
  sourceInstanceId: string;
};

type LeasedElement = {
  element: HTMLElement;
  cleanup?: () => void;
};

type FloatingVideoLeaseOptions = {
  /** Resolves the retained placement, or undefined when it is already gone. */
  resolve: (sourceInstanceId: string, sourceDomId: string) => LeasedElement | undefined;
  /** Drops the placement from the SDK's registry once its root has been unmounted. */
  forget: (sourceInstanceId: string) => void;
};

/**
 * Starts listening for session ends. Returns an unsubscribe function.
 */
export function startFloatingVideoLease({ resolve, forget }: FloatingVideoLeaseOptions): () => void {
  if (typeof document === "undefined") return () => undefined;

  const handleClear = (event: Event) => {
    const { reason, sourceDomId, sourceInstanceId } = (event as CustomEvent<FloatingVideoClearDetail>).detail;
    // "adopted" means the source route re-framed this very root as its full-size player.
    // Releasing it here would tear down the player the user just asked to see.
    if (reason === "adopted") return;

    // Let the placement's own React root process the clear first: it switches the player back
    // out of PiP, which unmounts the floating portal through normal effect cleanup. Unmounting
    // the root in the same tick would race that teardown.
    requestAnimationFrame(() => {
      const leased = resolve(sourceInstanceId, sourceDomId);
      // Still attached means the user never actually left the page (a manual close, or the
      // video ended in place). The placement is live and must keep its root.
      const isParked = leased?.element.getAttribute(PARKED_ATTRIBUTE) === "true";
      if (!leased || (leased.element.isConnected && !isParked)) return;

      try {
        leased.cleanup?.();
      } catch (error) {
        console.error("[genuin] Failed to release floating video root:", error);
      }
      forget(sourceInstanceId);
    });
  };

  document.addEventListener(FLOATING_VIDEO_CLEAR_EVENT, handleClear);
  return () => document.removeEventListener(FLOATING_VIDEO_CLEAR_EVENT, handleClear);
}
