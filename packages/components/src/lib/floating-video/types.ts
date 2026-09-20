/**
 * Shared vocabulary for the floating-video hand-off.
 *
 * Kept free of runtime code so every participant — the page root, the SDK placement root and
 * the SDK runtime, which are three separate bundles — can agree on the shape of the protocol
 * without importing any of each other's behaviour.
 */

/**
 * What kind of navigation caused the hand-off. Open-ended on purpose: any surface that can
 * navigate may introduce its own trigger without changing this contract.
 */
export type FloatingVideoTrigger = "community" | "group" | "sidebar" | (string & {});

/** Why an active session ended, kept for analytics and debugging. */
export type FloatingVideoClearReason =
  | "route-change"
  | "manual-close"
  | "video-ended"
  | "video-error"
  | "superseded"
  /**
   * The session ended because the source route took its player back and is showing it full
   * size again. The retained React root must survive this one — it *is* the restored player.
   */
  | "adopted";

/**
 * A navigation asking to be accompanied by the currently playing video.
 *
 * Dispatched by the navigating surface, which knows only where it is going. The player that
 * owns the video answers by filling in everything else — see {@link FloatingVideoSession}.
 */
export type FloatingVideoPromotionIntent = {
  /** The href as authored on the link, before any router normalisation. */
  targetHref: string;
  trigger: FloatingVideoTrigger;
  /**
   * Set to true by the player that took the hand-off. Mutated in place because the request is
   * dispatched synchronously, which lets the caller act on the answer in the same click.
   */
  accepted: boolean;
};

/**
 * Everything the destination route needs to keep one already-playing video alive.
 *
 * `sourceDomId` and `sourceInstanceId` together identify the one SDK placement allowed to
 * answer a promote request: `sourceDomId` is the page-owned container id, `sourceInstanceId`
 * is the id the SDK stamps onto that container as `data-instance-id`.
 */
export type FloatingVideoSession = {
  sessionId: string;
  sourceInstanceId: string;
  sourceDomId: string;
  /**
   * The placement this video came from. Unlike `sourceDomId` — which React's `useId` re-derives
   * on every mount, so it changes across a client-side navigation — this is stable, and is what
   * lets the source route recognise the placement again when the user comes back.
   */
  sourcePlacementId: string;
  /** Which video is floating. Not used to rebuild anything — the player is never re-created — but
   * it is what makes a session identifiable in logs and analytics. */
  videoId: string;
  targetHref: string;
  /** Pathname only, used to decide when the destination route has been left. */
  targetPathname: string;
  /** Where the video was playing full size, so the card can navigate back to it. */
  sourcePathname: string;
  /** Inline article to reveal behind the restored player, without changing routes. */
  sourceArticleSlug?: string;
  /** Outermost first: retained players that own the article and its original PiP. */
  sourceParentDomIds?: string[];
  trigger: FloatingVideoTrigger;
};

export type FloatingVideoClearDetail = {
  sessionId: string;
  reason: FloatingVideoClearReason;
  /** Carried so the SDK runtime can find and release the exact root it retained. */
  sourceDomId: string;
  sourceInstanceId: string;
};

/**
 * What the source route needs to put the user back where they were: the same placement, the
 * same video, presented as Feed View again.
 */
export type FloatingVideoRestoreRequest = {
  /**
   * The session to end once the source route has the video full size again. The card is
   * deliberately kept alive through the navigation — ending it up front would leave the user
   * staring at a bare source page while the placement remounts.
   */
  sessionId: string;
  sourceDomId: string;
  sourcePlacementId: string;
  sourcePathname: string;
  sourceArticleSlug?: string;
  sourceParentDomIds?: string[];
};
