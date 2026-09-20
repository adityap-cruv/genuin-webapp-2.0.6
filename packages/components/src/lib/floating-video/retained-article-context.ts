import { getExpandViewSourceId } from "@genuin/components/lib/feed-view/presentation";

import { FLOATING_VIDEO_CLEAR_EVENT, onFloatingVideoClear } from "./events";
import { beginFloatingVideoPresentation } from "./floating-video-presenter";
import { retainPlacementContainer, type PlacementRetention } from "./placement-retention";
import { consumePendingFloatingVideoRestore, getFloatingVideoSession } from "./session-store";

export const ARTICLE_CONTEXT_SUSPEND_EVENT = "genuin:article-context-suspend";

const HOST_SELECTOR =
  '[data-genuin-light-portal-host][data-portal-key="expand-view"], [data-genuin-overlay-host][data-portal-key="expand-view"]';

type Parent = {
  sourceDomId: string;
  sourceInstanceId: string;
  host: HTMLElement;
  style: string | null;
  inert: boolean;
  retention: PlacementRetention;
};
type RetainedContext = {
  sessionId: string;
  parents: Parent[];
  suspended: boolean;
  dispose: () => void;
};
type ContextWindow = Window & { __genuinRetainedArticleContext?: RetainedContext | null };
const contextWindow = () => window as ContextWindow;

function findHost(sourceId: string): HTMLElement | undefined {
  return Array.from(document.querySelectorAll<HTMLElement>(HOST_SELECTOR)).find(
    (host) => getExpandViewSourceId(host) === sourceId
  );
}

/** Called when the page's outer overlay unmounts, before it can collapse its SDK tree. */
export function suspendArticleContext(host: HTMLElement): boolean {
  const session = getFloatingVideoSession();
  const ids = session?.sourceParentDomIds;
  if (!session || !ids?.length || getExpandViewSourceId(host) !== ids[0]) return false;
  const childHost = findHost(session.sourceDomId);
  if (!childHost) return false;

  let context = contextWindow().__genuinRetainedArticleContext;
  if (context && context.parents[0]?.host !== host) {
    context.dispose();
    context = null;
  }
  if (!context) {
    const parents: Parent[] = [];
    for (const id of ids) {
      const parentHost = findHost(id);
      const source = document.getElementById(id);
      if (!parentHost || !source) return false;
      parents.push({
        sourceDomId: id,
        sourceInstanceId: source.dataset.instanceId ?? "",
        host: parentHost,
        style: null,
        inert: parentHost.inert,
        retention: retainPlacementContainer(source),
      });
    }
    const retained: RetainedContext = { sessionId: session.sessionId, parents, suspended: true, dispose: () => {} };
    context = retained;
    contextWindow().__genuinRetainedArticleContext = retained;
    let disposed = false;
    const observer = new MutationObserver(() => {
      if (!parents[0]?.host.isConnected) retained.dispose();
    });
    const offClear = onFloatingVideoClear((detail) => {
      if (detail.sessionId !== retained.sessionId) return;
      if (detail.reason !== "adopted") retained.dispose();
    });
    retained.dispose = () => {
      if (disposed) return;
      disposed = true;
      observer.disconnect();
      offClear();
      if (contextWindow().__genuinRetainedArticleContext === retained)
        contextWindow().__genuinRetainedArticleContext = null;
      // Release the SDK roots through the same lease protocol as the foreground PiP.
      for (const parent of [...parents].reverse()) {
        (window as Window & { genuin?: { collapse?: (id: string) => void } }).genuin?.collapse?.(parent.sourceDomId);
        parent.retention.release();
        document.dispatchEvent(
          new CustomEvent(FLOATING_VIDEO_CLEAR_EVENT, {
            detail: {
              sessionId: `${retained.sessionId}:parent:${parent.sourceDomId}`,
              reason: "manual-close",
              sourceDomId: parent.sourceDomId,
              sourceInstanceId: parent.sourceInstanceId,
            },
          })
        );
      }
    };
    observer.observe(document.body, { childList: true, subtree: true });
  }

  context.sessionId = session.sessionId;
  context.suspended = true;
  // Nested overlays remain mounted with their article. Suspend their bounds writers
  // before reframing the child as PiP, so observers cannot shrink it back to the article.
  document.dispatchEvent(
    new CustomEvent(ARTICLE_CONTEXT_SUSPEND_EVENT, {
      detail: {
        sourceDomIds: [...ids, session.sourceDomId],
      },
    })
  );
  for (const parent of context.parents) {
    parent.style = parent.host.getAttribute("style");
    // Carousel descendants explicitly restore visibility, so hiding only the host
    // still lets them paint over the next route. Hide the whole composited tree
    // while preserving its layout measurements and the original player instances.
    parent.host.style.setProperty("opacity", "0", "important");
    parent.host.style.setProperty("visibility", "hidden", "important");
    parent.host.style.setProperty("pointer-events", "none", "important");
    parent.host.inert = true;
    parent.host.dataset.genuinArticleContextSuspended = "true";
    (parent.host.shadowRoot ?? parent.host).querySelectorAll<HTMLMediaElement>("video, audio").forEach((media) => {
      if (!media.paused) media.pause();
    });
    parent.retention.park();
  }
  return beginFloatingVideoPresentation(childHost);
}

/** Claims the still-mounted article tree on the original route. No article/player is rebuilt. */
export function claimArticleContext(): { sourceDomId: string; host: HTMLElement; sessionId: string } | null {
  const context = contextWindow().__genuinRetainedArticleContext;
  const session = getFloatingVideoSession();
  if (
    !context?.suspended ||
    !session ||
    session.sessionId !== context.sessionId ||
    session.sourcePathname !== window.location.pathname
  )
    return null;
  const restore = consumePendingFloatingVideoRestore({
    domId: session.sourceDomId,
    placementId: session.sourcePlacementId,
    articleSlug: session.sourceArticleSlug,
  });
  const parent = context.parents[0];
  if (!restore || !parent) return null;
  context.suspended = false;
  for (const entry of context.parents) {
    if (entry.style === null) entry.host.removeAttribute("style");
    else entry.host.setAttribute("style", entry.style);
    entry.host.inert = entry.inert;
    delete entry.host.dataset.genuinArticleContextSuspended;
  }
  return { sourceDomId: parent.sourceDomId, host: parent.host, sessionId: session.sessionId };
}
