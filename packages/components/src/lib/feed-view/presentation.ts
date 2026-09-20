const ACTIVE_FEED_VIEW_SELECTOR = '[data-home-feed-view="true"]';

/** Parent players own the inline article and its original PiP, outside the child portal. */
export function getParentExpandViewSourceIds(source: HTMLElement): string[] {
  const ids: string[] = [];
  let current: HTMLElement | null = source;
  while (current) {
    const portal: HTMLElement | null = current.closest('[data-genuin-root-portal][data-portal-key="expand-view"]');
    const id = portal?.dataset.genuinSourceDomId;
    if (!id || ids.includes(id)) break;
    ids.unshift(id);
    current = document.getElementById(id);
  }
  return ids;
}

/** Actual SDK owner, including when a retained player is adopted by another page. */
export function getExpandViewSourceId(host: HTMLElement): string | undefined {
  const portals = (host.shadowRoot ?? host).querySelectorAll<HTMLElement>(
    '[data-genuin-root-portal][data-portal-key="expand-view"]'
  );
  return portals[portals.length - 1]?.dataset.genuinSourceDomId;
}

/** Nested expand hosts are appended after the player underneath them. */
export function getActiveExpandViewSourceId(): string | undefined {
  const hosts = document.querySelectorAll<HTMLElement>(
    '[data-genuin-light-portal-host][data-portal-key="expand-view"], ' +
      '[data-genuin-overlay-host][data-portal-key="expand-view"]'
  );
  for (let index = hosts.length - 1; index >= 0; index--) {
    const host = hosts[index]!;
    if (host.dataset.genuinFloatingVideo === "true" || host.dataset.genuinArticleContextSuspended === "true") continue;
    const sourceId = getExpandViewSourceId(host);
    if (sourceId) return sourceId;
  }
}

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
