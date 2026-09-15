"use client";

import { NavArrowButton } from "@genuin/ui/player-controls";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEventHandler,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";

import {
  HOME_FEED_VIEW_EVENT,
  HOME_FULL_VIEW_EVENT,
  HOME_INLINE_ARTICLE_STATE_EVENT,
  type HomeInlineArticleStateDetail,
} from "@genuin/components/lib/home-feed/events";

/** Identifies the SDK placement whose existing expand portal becomes the bounded Feed View. */
export type FeedViewOverlayRequest = {
  sourceDomId: string;
  /**
   * Expand-view hosts that already existed when this placement was clicked.
   *
   * Article placements can be mounted inside an existing Home Feed View. In that case the
   * document contains the parent player's expand host before the article carousel creates its
   * own. Keeping this snapshot lets the overlay attach to the new host instead of accidentally
   * resizing the parent player.
   */
  existingExpandHosts: HTMLElement[];
};

type OpenFeedViewOverlay = (request: FeedViewOverlayRequest) => void;

const FeedViewOverlayContext = createContext<OpenFeedViewOverlay | null>(null);

export function FeedViewOverlayProvider({
  onOpen,
  children,
}: {
  onOpen: OpenFeedViewOverlay | null;
  children: ReactNode;
}) {
  return <FeedViewOverlayContext.Provider value={onOpen}>{children}</FeedViewOverlayContext.Provider>;
}

/** Placement-level access to the closest page host that can present a bounded Feed View. */
export function useOpenFeedViewOverlay(): OpenFeedViewOverlay | null {
  return useContext(FeedViewOverlayContext);
}

type GenuinWindow = Window & {
  genuin?: {
    collapse?: (id: string) => void;
  };
};

type PlacementFeedViewIntentOptions = {
  onExpandRequest?: () => void;
  waitForSdk?: () => Promise<void>;
};

/**
 * Distinguishes a click on the video body from a click on an SDK control, then pairs that intent
 * with the SDK's global `onVideoClicked` event. The pairing scopes a global SDK event back to the
 * placement the user actually clicked without intercepting play, mute, link or expand controls.
 */
export function usePlacementFeedViewIntent({
  onExpandRequest,
  waitForSdk,
}: PlacementFeedViewIntentOptions): MouseEventHandler<HTMLDivElement> {
  const lastVideoClickRef = useRef(0);

  useEffect(() => {
    if (!onExpandRequest) return;

    let cancelled = false;
    let unsubscribe: (() => void) | undefined;
    let retry: number | undefined;
    let attempts = 0;

    const register = () => {
      if (cancelled) return;
      const genuin = (window as GenuinWindow).genuin;
      if (!genuin?.onInternal) {
        if (attempts++ < 40) retry = window.setTimeout(register, 200);
        return;
      }

      const off = genuin.onInternal("onVideoClicked", () => {
        if (Date.now() - lastVideoClickRef.current > 1200) return;
        lastVideoClickRef.current = 0;
        onExpandRequest();
      });
      if (typeof off === "function") unsubscribe = off;
    };

    (waitForSdk?.() ?? Promise.resolve()).then(register).catch(() => undefined);

    return () => {
      cancelled = true;
      if (retry) window.clearTimeout(retry);
      unsubscribe?.();
    };
  }, [onExpandRequest, waitForSdk]);

  return useCallback((event) => {
    const path = event.nativeEvent.composedPath();
    const controlLayerIndex = path.findIndex(
      (target) =>
        target instanceof Element &&
        target.classList.contains("gencl:absolute") &&
        target.classList.contains("gencl:inset-0")
    );
    const clickPath = controlLayerIndex < 0 ? path : path.slice(0, controlLayerIndex);
    const isPlayerControl = clickPath.some(
      (target) =>
        target instanceof Element &&
        (target.matches("button, a, [role='button']") || target.classList.contains("gencl:cursor-pointer"))
    );

    lastVideoClickRef.current = isPlayerControl ? 0 : Date.now();
  }, []);
}

// These legacy attribute names are a stable cross-root SDK contract. PlayerList reads them to
// select Feed View + Intelligence while the page host owns only the portal bounds and Back action.
const FEED_VIEW_ATTRIBUTE = "data-home-feed-view";
const FEED_SESSION_ATTRIBUTE = "data-home-feed-session";
// Keep the bounded player above page content but below standard document-level dialogs (`z-50`).
const FEED_VIEW_Z_INDEX = "40";
const FEED_BACK_Z_INDEX = 41;

const EXPAND_HOST_SELECTOR = [
  '[data-genuin-overlay-host][data-portal-key="expand-view"]',
  '[data-genuin-light-portal-host][data-portal-key="expand-view"]',
  'body > .gen-sdk-root-portal.gen-sdk-expand-view',
].join(",");

function getExpandHosts(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>(EXPAND_HOST_SELECTOR));
}

function markPlacementAttribute(sourceDomId: string, attribute: string, active: boolean) {
  const source = document.getElementById(sourceDomId);
  const embedRoot = source?.shadowRoot?.querySelector<HTMLElement>(".gen-sdk-class");
  for (const element of [source, embedRoot]) {
    if (active) element?.setAttribute(attribute, "true");
    else element?.removeAttribute(attribute);
  }
}

export function markFeedView(sourceDomId: string, active: boolean) {
  markPlacementAttribute(sourceDomId, FEED_VIEW_ATTRIBUTE, active);
}

export function markFeedViewSession(sourceDomId: string, active: boolean) {
  markPlacementAttribute(sourceDomId, FEED_SESSION_ATTRIBUTE, active);
}

/** Marks the placement synchronously before the SDK's expand portal commits in another React root. */
export function prepareFeedView(sourceDomId: string): HTMLElement[] {
  // Capture this before changing the placement to expand-view. The SDK commits its portal in a
  // separate React root after the click, so any subsequently-added host belongs to this request.
  const existingExpandHosts = getExpandHosts();
  markFeedView(sourceDomId, true);
  markFeedViewSession(sourceDomId, true);
  return existingExpandHosts;
}

function restoreInlineStyle(element: HTMLElement | null, value: string | null) {
  if (!element) return;
  if (value === null) element.removeAttribute("style");
  else element.setAttribute("style", value);
}

function setImportantStyles(element: HTMLElement, styles: Record<string, string>) {
  for (const [property, value] of Object.entries(styles)) {
    if (
      element.style.getPropertyValue(property) === value &&
      element.style.getPropertyPriority(property) === "important"
    ) {
      continue;
    }
    element.style.setProperty(property, value, "important");
  }
}

/**
 * Presents the SDK's existing expand-view portal inside a page-owned boundary. No placement,
 * player or route is created, so playback, active video, controls and analytics keep one owner.
 */
export function FeedViewOverlay({
  request,
  boundsRef,
  onClose,
}: {
  request: FeedViewOverlayRequest;
  boundsRef: RefObject<HTMLDivElement | null>;
  onClose: () => void;
}) {
  const [backPosition, setBackPosition] = useState<{ left: number; top: number } | null>(null);
  const [isInlineArticleOpen, setIsInlineArticleOpen] = useState(false);
  const [isSdkDetailPageOpen, setIsSdkDetailPageOpen] = useState(false);
  const collapseRequestedRef = useRef(false);
  const attachedHostRef = useRef<HTMLElement | null>(null);

  const collapseSdkView = useCallback(() => {
    if (collapseRequestedRef.current) return;
    const collapse = (window as GenuinWindow).genuin?.collapse;
    if (!collapse) return;
    collapseRequestedRef.current = true;
    collapse(request.sourceDomId);
  }, [request.sourceDomId]);

  useEffect(() => {
    const handleInlineArticleState = (event: Event) => {
      const { detail } = event as CustomEvent<HomeInlineArticleStateDetail>;
      if (detail.sourceDomId === request.sourceDomId) setIsInlineArticleOpen(detail.open);
    };

    document.addEventListener(HOME_INLINE_ARTICLE_STATE_EVENT, handleInlineArticleState);
    return () => document.removeEventListener(HOME_INLINE_ARTICLE_STATE_EVENT, handleInlineArticleState);
  }, [request.sourceDomId]);

  useEffect(() => {
    const genuin = (window as GenuinWindow).genuin;
    if (!genuin?.onInternal) return;
    let closeFrame: number | null = null;

    // The runtime returns an unsubscribe callback; the legacy global declaration still says void.
    const off: unknown = genuin.onInternal("onExpandViewChanged", (raw: unknown) => {
      const expanded = typeof raw === "boolean" ? raw : (raw as { payload?: unknown } | null | undefined)?.payload;
      if (expanded === false) {
        // The SDK event is global, so closing a child carousel also notifies the parent Home
        // Feed View. Wait for portal teardown and close only the overlay whose own host vanished.
        const attachedHost = attachedHostRef.current;
        if (closeFrame !== null) window.cancelAnimationFrame(closeFrame);
        closeFrame = window.requestAnimationFrame(() => {
          closeFrame = null;
          if (!attachedHost || attachedHost.isConnected) return;
          collapseRequestedRef.current = true;
          onClose();
        });
      }
    });
    return () => {
      if (closeFrame !== null) window.cancelAnimationFrame(closeFrame);
      if (typeof off === "function") (off as () => void)();
    };
  }, [onClose]);

  useLayoutEffect(() => {
    let frame = 0;
    let collapseOnTeardown = false;
    let portalObserver: MutationObserver | null = null;
    let contentObserver: MutationObserver | null = null;
    let detailPageObserver: MutationObserver | null = null;
    let boundsObserver: ResizeObserver | null = null;
    let host: HTMLElement | null = null;
    let portalContainer: HTMLElement | null = null;
    let feedStageStyle: HTMLStyleElement | null = null;
    let hostStyle: string | null = null;
    let portalStyle: string | null = null;
    let promoted = false;
    let revealed = false;

    collapseRequestedRef.current = false;
    // React Strict Mode immediately runs a setup/cleanup probe in development. Arm the SDK
    // collapse after that probe so a real route unmount closes the expand view without making
    // the probe close a Feed View that has only just opened.
    const collapseArm = window.setTimeout(() => {
      collapseOnTeardown = true;
    }, 0);

    const mountFeedStageStyle = () => {
      if (!host || feedStageStyle) return;
      feedStageStyle = document.createElement("style");
      feedStageStyle.dataset.feedView = "true";
      feedStageStyle.textContent = `
        [data-portal-container], [data-portal-container] > .gen-sdk-expand-view, #gencl-feed-view {
          position: absolute !important;
          inset: 0 !important;
          width: 100% !important;
          height: 100% !important;
          min-height: 0 !important;
          background-color: #fff !important;
        }
        [data-feed-video-column] {
          height: calc(100% - 48px) !important;
          margin-block: 24px !important;
          border-radius: 12px !important;
          overflow: hidden !important;
        }
        [role="navigation"][aria-label="Video navigation"],
        button[class~="gencl:right-7.5"][class~="gencl:top-6"] {
          display: none !important;
        }
        .swiper-slide-active .gencl\\:group-hover\\:opacity-100.gencl\\:opacity-0 {
          opacity: 1 !important;
          pointer-events: auto !important;
        }
      `;
      (host.shadowRoot ?? document.head).appendChild(feedStageStyle);
    };

    const restoreFullView = () => {
      restoreInlineStyle(host, hostStyle);
      restoreInlineStyle(portalContainer, portalStyle);
      feedStageStyle?.remove();
      feedStageStyle = null;
      setBackPosition(null);
    };

    const applyFeedBounds = () => {
      const bounds = boundsRef.current?.getBoundingClientRect();
      if (!host || !portalContainer || !bounds || promoted) return;
      const viewportWidth = window.visualViewport?.width ?? document.documentElement.clientWidth;
      const viewportHeight = window.visualViewport?.height ?? document.documentElement.clientHeight;

      setImportantStyles(host, {
        position: "fixed",
        inset: "auto",
        top: `${bounds.top}px`,
        left: `${bounds.left}px`,
        width: `${Math.min(bounds.width, viewportWidth - bounds.left)}px`,
        height: `${Math.min(bounds.height, viewportHeight - bounds.top)}px`,
        overflow: "hidden",
        "z-index": FEED_VIEW_Z_INDEX,
      });
      if (revealed) {
        setBackPosition((current) => {
          const next = { left: bounds.left + 24, top: bounds.top + 24 };
          return current?.left === next.left && current.top === next.top ? current : next;
        });
      }
    };

    const settleFeedBounds = (remainingFrames = 3) => {
      applyFeedBounds();
      if (remainingFrames > 1 && !promoted) {
        frame = window.requestAnimationFrame(() => settleFeedBounds(remainingFrames - 1));
      }
    };

    const attachToSdkPortal = (): boolean => {
      // Multiple placements may legitimately have expand roots at the same time: the Home player
      // remains mounted while its inline article opens a carousel video. querySelector() used to
      // select that older parent root, shrinking it into the new overlay and leaving the clicked
      // carousel player hidden behind the article. Select only a host created after this request.
      const existingHosts = new Set(request.existingExpandHosts);
      host = getExpandHosts().find((candidate) => !existingHosts.has(candidate)) ?? null;
      portalContainer = host?.shadowRoot?.querySelector<HTMLElement>("[data-portal-container]") ?? host;
      if (!host || !portalContainer) return false;
      attachedHostRef.current = host;

      portalObserver?.disconnect();
      portalObserver = null;

      hostStyle = host.getAttribute("style");
      portalStyle = portalContainer.getAttribute("style");
      setImportantStyles(host, { visibility: "hidden" });
      mountFeedStageStyle();

      const syncDetailPageState = () => {
        setIsSdkDetailPageOpen(Boolean(portalContainer?.querySelector(".playback-speed-class")));
      };
      syncDetailPageState();
      detailPageObserver = new MutationObserver(syncDetailPageState);
      detailPageObserver.observe(portalContainer, { childList: true, subtree: true });

      // The page and SDK portal commit in separate React roots. Apply immediately for first paint;
      // the SDK's expand-change signal performs the final hand-off after RootPortal effects commit.
      settleFeedBounds();

      const revealFeed = (): boolean => {
        if (!host || !portalContainer?.querySelector(".gen-sdk-expand-view")) return false;
        revealed = true;
        applyFeedBounds();
        setImportantStyles(host, { visibility: "visible" });
        contentObserver?.disconnect();
        contentObserver = null;
        return true;
      };
      if (!revealFeed()) {
        contentObserver = new MutationObserver(revealFeed);
        contentObserver.observe(portalContainer, { childList: true, subtree: true });
      }
      return true;
    };

    const handleFullView = () => {
      promoted = true;
      markFeedView(request.sourceDomId, false);
      restoreFullView();
      if (host) {
        setImportantStyles(host, {
          position: "fixed",
          inset: "0",
          width: "100%",
          height: "100%",
          overflow: "hidden",
        });
      }
      if (portalContainer) {
        setImportantStyles(portalContainer, {
          position: "fixed",
          inset: "0",
          width: "100%",
          height: "100%",
        });
      }
    };

    const handleFeedView = () => {
      if (!promoted || !host || !portalContainer) return;
      restoreFullView();
      promoted = false;
      markFeedView(request.sourceDomId, true);
      mountFeedStageStyle();
      setImportantStyles(host, { visibility: "visible" });
      settleFeedBounds();
    };

    prepareFeedView(request.sourceDomId);
    if (!attachToSdkPortal()) {
      portalObserver = new MutationObserver(attachToSdkPortal);
      portalObserver.observe(document.body, { childList: true, subtree: true });
    }
    if (boundsRef.current && typeof ResizeObserver !== "undefined") {
      // The Home sidebar changes the section width without firing a window resize. The Home-owned
      // boundary is therefore the source of truth for its one active SDK portal.
      boundsObserver = new ResizeObserver(applyFeedBounds);
      boundsObserver.observe(boundsRef.current);
    }
    window.addEventListener("resize", applyFeedBounds);
    document.addEventListener(HOME_FULL_VIEW_EVENT, handleFullView);
    document.addEventListener(HOME_FEED_VIEW_EVENT, handleFeedView);

    return () => {
      window.clearTimeout(collapseArm);
      window.cancelAnimationFrame(frame);
      portalObserver?.disconnect();
      contentObserver?.disconnect();
      detailPageObserver?.disconnect();
      boundsObserver?.disconnect();
      window.removeEventListener("resize", applyFeedBounds);
      document.removeEventListener(HOME_FULL_VIEW_EVENT, handleFullView);
      document.removeEventListener(HOME_FEED_VIEW_EVENT, handleFeedView);
      restoreFullView();
      if (collapseOnTeardown && !collapseRequestedRef.current) {
        // The SDK expand portal is owned by a separate React root, so unmounting the Article/Home
        // page does not unmount it. Hide it for the hand-off and explicitly collapse its source;
        // otherwise it survives the route change and restores itself full-screen over /home.
        if (host) setImportantStyles(host, { visibility: "hidden", "pointer-events": "none" });
        collapseSdkView();
      }
      markFeedView(request.sourceDomId, false);
      markFeedViewSession(request.sourceDomId, false);
      attachedHostRef.current = null;
    };
  }, [boundsRef, collapseSdkView, onClose, request.existingExpandHosts, request.sourceDomId]);

  const handleBack = () => {
    collapseSdkView();
    onClose();
  };

  // Inline articles and SDK detail routes render their own Back control. Hide the page-owned
  // action in those states so exactly one Back button is visible across React roots.
  if (!backPosition || isInlineArticleOpen || isSdkDetailPageOpen) return null;
  return createPortal(
    <div data-slot="feed-view-back" style={{ position: "fixed", ...backPosition, zIndex: FEED_BACK_Z_INDEX }}>
      <NavArrowButton direction="left" size="lg" theme="dark" ariaLabel="Back" onClick={handleBack} />
    </div>,
    document.body
  );
}
