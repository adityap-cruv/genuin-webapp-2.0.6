/**
 * Keeps a handed-off placement's container in the document.
 *
 * A floating hand-off deliberately outlives the page that owned it: the player keeps running
 * in a body portal while its container leaves with the route. That breaks an invariant the
 * rest of the embed relies on — *a live placement has a connected, measurable container* — and
 * a detached element measures `0×0`. Downstream, `useEmbedConfigs()` reads that zero as "a very
 * small player" and switches to the smallest responsive variant, which is why a handed-off card
 * lost its description while the inline-article card (whose page never leaves) kept it.
 *
 * The anomaly is created here, so it is absorbed here rather than by teaching a shared hook to
 * tolerate a broken invariant. The container is parked off-screen at its last real size, so
 * every measurement downstream keeps returning what it returned a frame earlier.
 */

/** Marks a container that is only still in the document to keep the hand-off measurable. */
export const PARKED_ATTRIBUTE = "data-genuin-floating-parked";

/** Frames to wait for the source route's unmount to actually detach the container. */
const MAX_DETACH_FRAMES = 10;

export type PlacementRetention = {
  /** Re-homes the container off-screen, once the page has let go of it. */
  park: () => void;
  /** Removes the parked container and restores what was changed to park it. */
  release: () => void;
};

/**
 * Snapshots a container so it can be re-homed later.
 *
 * Deliberately not driven by a MutationObserver: React removes the page by detaching an
 * ancestor, so watching the container's own parent for child changes never fires. The element
 * reference survives that either way, and a detached element can simply be re-appended.
 */
export function retainPlacementContainer(container: HTMLElement): PlacementRetention {
  // Measured now, while the placement is still laid out on the page it belongs to.
  const width = container.offsetWidth;
  const height = container.offsetHeight;
  const originalStyle = container.getAttribute("style");

  const attach = () => {
    container.setAttribute(PARKED_ATTRIBUTE, "true");
    // Keep the box, lose the presence: same size for measurements, invisible and untouchable,
    // and far enough off-screen that it can never affect scroll extents.
    Object.assign(container.style, {
      position: "fixed",
      top: "0px",
      left: "-99999px",
      width: `${width}px`,
      height: `${height}px`,
      visibility: "hidden",
      pointerEvents: "none",
    } satisfies Partial<CSSStyleDeclaration>);
    document.body.appendChild(container);
  };

  return {
    park: () => {
      if (typeof document === "undefined") return;
      // The hand-off is announced while the source route is committing its unmount; React
      // detaches the DOM after that commit. Reading `isConnected` in the same tick would
      // always say "still here" and park nothing, so wait for it to actually leave.
      let frames = 0;
      const parkWhenDetached = () => {
        if (container.getAttribute(PARKED_ATTRIBUTE) === "true") return;
        if (container.isConnected) {
          // A handful of frames covers the unmount commit. Beyond that the page kept its
          // placement, so there is nothing to re-home.
          if (frames++ < MAX_DETACH_FRAMES) requestAnimationFrame(parkWhenDetached);
          return;
        }
        attach();
      };
      requestAnimationFrame(parkWhenDetached);
    },
    release: () => {
      if (container.getAttribute(PARKED_ATTRIBUTE) !== "true") return;
      container.removeAttribute(PARKED_ATTRIBUTE);
      if (originalStyle === null) container.removeAttribute("style");
      else container.setAttribute("style", originalStyle);
      container.remove();
    },
  };
}

/** Whether this container is only in the document because a hand-off is holding it there. */
export function isPlacementParked(container: Element | null | undefined): boolean {
  return container?.getAttribute(PARKED_ATTRIBUTE) === "true";
}
