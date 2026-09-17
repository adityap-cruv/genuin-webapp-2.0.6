const ACTIVE_FEED_VIEW_SELECTOR = '[data-home-feed-view="true"]';

/**
 * Whether this placement is currently presented as a bounded Home Feed View.
 *
 * A child expand opened inside the active Feed View must reuse the same presentation, so a
 * placement without its own marker still inherits the document-level one.
 */
export function isFeedViewPresentation(rootElement: HTMLElement | null | undefined): boolean {
  // First-party page feeds (/latest, /popular, /video) do not have an SDK placement root.
  // They must never inherit another placement's document-level Feed View marker, including
  // one that is briefly present during navigation.
  if (!rootElement) return false;
  if (rootElement.dataset.homeFeedView === "true") return true;
  // The session owner may intentionally be promoted to Full View; do not force it back.
  if (rootElement.dataset.homeFeedSession === "true") return false;
  return document.querySelector(ACTIVE_FEED_VIEW_SELECTOR) !== null;
}
