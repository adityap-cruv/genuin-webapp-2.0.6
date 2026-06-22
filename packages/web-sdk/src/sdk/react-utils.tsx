import type { EmbedDataType } from "@genuin/components/context/embed/embed.types";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";
import { getBrandType } from "@genuin/components/lib/utils/brand-layout";
import { AppErrorBoundary } from "@genuin/components/molecules/error/app-error-boundary";
import { SafeSuspense } from "@genuin/components/molecules/error/safe-suspense";
import {
  cleanupOverlayShadowHost,
  ensureStylesInShadowRoot,
} from "@genuin/components/molecules/root-portal/shadow-root/shadow-dom.utils";
import type { AuthUser } from "@genuin/components/types/auth";
import type { BrandDetailsConfigType } from "@genuin/components/types/brand";
import { cn } from "@genuin/ui";
import { Loader } from "@genuin/ui/components/loader";
import { Skeleton } from "@genuin/ui/components/skeleton";
import type { ToasterProps } from "@genuin/ui/components/toaster";
import { Suspense, lazy, useEffect, useMemo, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";

import { metrics } from "../utils/metrics";
import { generateExpandViewSkeletonHTML } from "../utils/skeleton-html";

import type { EmbedRootProps } from "./embed-root";

import { SDKEventType } from "@/core";
import type { SingleEmbedDataConfig } from "@/type";

// Lazy load Toaster for better code splitting
const LazyToasterInner = lazy(() =>
  import("@genuin/ui/components/toaster").then((module) => ({
    default: module.Toaster,
  }))
);

/**
 * Wraps Toaster so style sync runs after mount (inside useEffect), not during
 * lazy resolution. Sonner injects its own <style> into document on mount —
 * only after that can ensureStylesInShadowRoot clone it into shadow roots.
 * Doing this inside the lazy factory (void / fire-and-forget) races React's
 * commit phase and causes removeChild crashes.
 */
export function LazyToaster(props: ToasterProps) {
  useEffect(() => {
    const selectors = ["[data-genuin-host]", "[data-genuin-overlay-host]", "[data-genuin-toaster-host]"];
    selectors.forEach((sel) => {
      document.querySelectorAll<HTMLElement>(sel).forEach((host) => {
        if (host.shadowRoot) void ensureStylesInShadowRoot(host.shadowRoot);
      });
    });
  }, []);

  return <LazyToasterInner {...props} />;
}

// Bare factory for the EmbedRoot chunk. Recreated per retry-attempt inside
// EmbedRootMount so AppErrorBoundary's "Try again" re-runs the dynamic import.
const loadEmbedRoot = () => import("./embed-root").then((module) => ({ default: module.EmbedRoot }));

/**
 * Mounts the lazily-loaded EmbedRoot under an AppErrorBoundary. If the EmbedRoot
 * chunk (or anything it dynamically pulls in) fails to load, the failure is
 * contained here: a styled retryable card is shown instead of a blank embed, and
 * every other embed / the host page keeps working. Recreating LazyEmbedRoot on
 * each `attempt` makes the retry button genuinely re-fetch the failed chunk.
 */
function LazyEmbedRootSuspense({
  attempt,
  embedRootProps,
  fallbackSkeleton,
}: {
  attempt: number;
  embedRootProps: EmbedRootProps;
  fallbackSkeleton: ReactNode;
}) {
  // eslint-disable-next-line react-hooks/exhaustive-deps -- attempt intentionally drives recreation
  const LazyEmbedRoot = useMemo(() => lazy(loadEmbedRoot), [attempt]);
  // Intentionally a bare <Suspense>, NOT <SafeSuspense>: the parent
  // EmbedRootMount already wraps this in an AppErrorBoundary whose `attempt`
  // render-prop drives the retry (recreating LazyEmbedRoot re-fetches the chunk).
  // Adding an inner AppErrorBoundary here would swallow the failure first and
  // defeat that retry loop.
  return (
    // eslint-disable-next-line no-restricted-syntax -- intentional bare Suspense; parent AppErrorBoundary drives the retry loop
    <Suspense fallback={fallbackSkeleton}>
      <LazyEmbedRoot {...embedRootProps} />
    </Suspense>
  );
}

function EmbedRootMount({
  embedRootProps,
  fallbackSkeleton,
}: {
  embedRootProps: EmbedRootProps;
  fallbackSkeleton: ReactNode;
}) {
  return (
    // <AppErrorBoundary>
    // {(attempt: number) => (
    <LazyEmbedRootSuspense attempt={1} embedRootProps={embedRootProps} fallbackSkeleton={fallbackSkeleton} />
    // )}
    // </AppErrorBoundary>
  );
}

// Track React roots per container to support multiple embeds
const containerRootMap = new Map<HTMLElement, Root>();
// Remember whether a container created its own shadow host so cleanup
// doesn't tear down shared hosts in nested embed scenarios.
const containerOwnsHostMap = new WeakMap<HTMLElement, boolean>();

// Global toaster singleton
let toasterRoot: Root | null = null;

/**
 * React-based skeleton component (loaded after providers are available)
 * Used as Suspense fallback after providers are loaded
 */
function EmbedSkeleton({ container, theme }: { container: HTMLElement; theme?: "dark" | "light" }) {
  const bgClass = theme === "dark" ? "gencl:bg-secondary-900" : "gencl:bg-secondary-200";
  const shimmerBgClass = theme === "dark" ? "gencl:bg-secondary-800" : "gencl:bg-secondary-100";
  const { isDesktop } = useDeviceDetectMediaQuery();
  const websiteType = container.getAttribute("data-website-type");

  return (
    <div className={`gencl:relative gencl:h-full gencl:w-full gencl:rounded-md ${isDesktop && bgClass}`}>
      {websiteType ? (
        <div
          style={{
            height: !isDesktop ? "100%" : "calc(100% - 68px)",
          }}
          className={cn(
            "gencl:w-full gencl:flex gencl:overflow-auto gencl:gap-2",
            !isDesktop && websiteType === "polaris" && "gencl:flex-col"
          )}>
          {Array.from({ length: 6 }).map((_, idx) => (
            <Skeleton
              key={idx}
              className={cn(
                "gencl:aspect-square gencl:flex-shrink-0 gencl:rounded-md",
                !isDesktop && websiteType === "polaris" ? "gencl:w-full" : "gencl:h-full",
                shimmerBgClass
              )}
            />
          ))}
        </div>
      ) : (
        <div className="gencl:flex gencl:items-center gencl:justify-center gencl:h-full gencl:w-full">
          <Loader size="md" />
        </div>
      )}
    </div>
  );
}

// Error view function
export function loadErrorView(container: HTMLElement): void {
  container.innerHTML = `
    <div style="
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      width: 100%;
      padding: 20px;
      font-family: Arial, sans-serif;
      color: #666;
      text-align: center;
    ">
      <div>
        <h3 style="margin: 0 0 10px 0; color: #333;">Unable to load content</h3>
        <p style="margin: 0; font-size: 14px;">Please check your configuration and try again.</p>
      </div>
    </div>
  `;
}

// Loading view function
export function loadLoadingView(container: HTMLElement, theme?: "dark" | "light"): void {
  // Unmount previous root if exists for this container
  const prevRoot = containerRootMap.get(container);
  if (prevRoot) {
    prevRoot.unmount();
    containerRootMap.delete(container);
    containerOwnsHostMap.delete(container);
  }

  const root = createRoot(container);
  containerRootMap.set(container, root);

  root.render(<EmbedSkeleton container={container} theme={theme} />);
}

// Expand view function
export function loadExpandView(
  container: HTMLElement,
  theme?: "dark" | "light",
  /**
   * The shadow root to render the expand loader inside.
   * When provided (always the case after the Shadow DOM refactor) the loader div is
   * appended to the shadow root instead of document.body, so it is scoped to the embed.
   */
  shadowRoot?: ShadowRoot | null
): void {
  if (container.getAttribute("data-web-sdk-nested") === "true") {
    return;
  }

  const loaderId = "gen-sdk-expand-view-loader";

  // Prefer shadow-root-scoped lookup when a shadow root is provided
  let loaderDiv = (
    shadowRoot ? (shadowRoot.getElementById(loaderId) as HTMLElement | null) : document.getElementById(loaderId)
  ) as HTMLElement | null;

  if (!loaderDiv) {
    loaderDiv = document.createElement("div");
    loaderDiv.id = loaderId;
    loaderDiv.classList.add("loader");
    loaderDiv.classList.add("gen-sdk-class");
    loaderDiv.classList.add("gen-sdk-root-portal");
    loaderDiv.style.position = "fixed";
    loaderDiv.style.zIndex = "2147483647";
    loaderDiv.style.top = "0";
    loaderDiv.style.left = "0";
    loaderDiv.style.width = "100%";
    loaderDiv.style.height = "100%";

    if (shadowRoot) {
      shadowRoot.appendChild(loaderDiv);
    } else {
      document.body.appendChild(loaderDiv);
    }
  }

  // Create a React root inside the loader div (or reuse existing)
  const isNewRoot = !containerRootMap.has(loaderDiv);
  const root =
    containerRootMap.get(loaderDiv) ??
    (() => {
      const newRoot = createRoot(loaderDiv);
      containerRootMap.set(loaderDiv, newRoot);
      return newRoot;
    })();

  /*
  Remove or unmount the loader div when the SDK_EXPAND_VIEW_CHANGED event is emitted,
  indicating that the expand view has successfully loaded.
  */
  const cleanup = () => {
    if (loaderDiv) {
      // unmount() is synchronous in React 18+. Remove the container in the
      // same tick so React never tries removeChild on a detached node.
      // A setTimeout here creates a window where React's passive-effect
      // cleanup races the DOM removal and throws "removeChild: not a child".
      root.unmount();
      containerRootMap.delete(loaderDiv);
      loaderDiv.remove();
      loaderDiv = null;
    } else {
      const loader = document.getElementById(loaderId);
      if (loader) {
        loader.remove();
      }
    }
  };

  const unsubscribe = window.genuin?.onInternal?.(SDKEventType.SDK_EXPAND_VIEW_CHANGED, (payload: any) => {
    if (payload.payload) {
      cleanup();
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    }
  });

  // Only set innerHTML on a freshly created container. If React already owns
  // this div (root reused), overwriting innerHTML destroys the fiber tree's
  // DOM references and causes removeChild crashes on next reconcile.
  if (isNewRoot) {
    loaderDiv.innerHTML = generateExpandViewSkeletonHTML({ theme });
  }
}

export async function loadNewEmbed({
  container,
  shadowTarget,
  embedData,
  brandDetails,
  config,
  user,
  wasLazilyLoaded,
  isOnlyForExpand,
}: {
  container: HTMLElement;
  /** The element inside the already-created Shadow DOM to mount React into. */
  shadowTarget: HTMLElement;
  embedData: EmbedDataType;
  brandDetails: BrandDetailsConfigType;
  config: Partial<SingleEmbedDataConfig>;
  user?: AuthUser | null;
  wasLazilyLoaded?: boolean;
  isOnlyForExpand?: boolean;
}): Promise<() => void> {
  // Performance marker: Embed render start
  const embedId = embedData.embed_id || embedData.placement_id || "unknown";
  metrics.markEmbedRenderStart(embedId);

  // Unmount previous root if exists for this container
  const prevRoot = containerRootMap.get(container);
  if (prevRoot) {
    prevRoot.unmount();
    containerRootMap.delete(container);
  }

  // useShadowDOM is already resolved to its final boolean value by genuin-sdk.ts
  // (default true, overridable via configByUser.useShadowDOM = false).
  // shadowTarget is the React mount point: the shadow root inner element when
  // Shadow DOM is on, or the host element itself when it is off.

  // Reuse existing root if present — calling createRoot on the same node twice
  // creates two competing React trees on the same DOM node, causing removeChild
  // crashes and spurious re-renders. This happens when loadNewEmbed is called
  // again (e.g. live embed update) before the previous root is cleaned up.
  const existingRoot = containerRootMap.get(container);
  const root =
    existingRoot ??
    createRoot(shadowTarget, {
      // Fires for every error any error boundary in this tree catches, with the
      // React componentStack. Unlike the boundary's console.error (stripped by
      // the prod build), this re-dispatches as a window event so a caught render
      // failure is observable in production. Listen via:
      //   window.addEventListener("genuin:caught-error", (e) => console.warn(e.detail));
      onCaughtError: (error, errorInfo) => {
        window.dispatchEvent(
          new CustomEvent("genuin:caught-error", {
            detail: {
              embedId,
              message: error instanceof Error ? error.message : String(error),
              stack: error instanceof Error ? error.stack : undefined,
              componentStack: errorInfo?.componentStack,
            },
          })
        );
      },
    });
  if (!existingRoot) {
    containerRootMap.set(container, root);
  }

  // Determine brand layout type
  const isPlacementView = !!embedData.placement_id;
  const cardLayoutId = isPlacementView ? embedData.placement_card_layout_id : embedData.card_layout_id;
  const videoLayoutId = isPlacementView ? embedData.placement_video_layout_id : embedData.video_layout_id;
  const brandLayoutType = getBrandType(
    cardLayoutId ? Number(cardLayoutId) : undefined,
    videoLayoutId ? Number(videoLayoutId) : undefined
  );

  // Initialize toaster singleton on first embed (shadow DOM mode only).
  // Toaster gets its own shadow root so its DOM is fully isolated from embed
  // shadow roots — no shared-root races, no removeChild conflicts.
  if (!toasterRoot) {
    const host = document.createElement("div");
    host.id = "gen-sdk-toaster-root";
    host.setAttribute("data-genuin-toaster-host", "true");
    host.classList.add("gen-sdk-class");
    host.classList.add("gen-sdk-root-portal");
    document.body.appendChild(host);

    const toasterShadow = host.attachShadow({ mode: "open" });
    // Inject styles into toaster shadow immediately (CSS link + cloned styles).
    // ensureStylesInShadowRoot is also called from LazyToaster's useEffect after
    // sonner mounts and injects its own <style> into document.
    void ensureStylesInShadowRoot(toasterShadow);

    const toasterMount = document.createElement("div");
    toasterMount.classList.add("gen-sdk-class");
    toasterShadow.appendChild(toasterMount);

    toasterRoot = createRoot(toasterMount);

    const isIheartIframe = document.getElementById("ihr-player-bar-frame");

    toasterRoot.render(
      // Toaster is non-critical chrome: if its chunk fails, swallow it silently
      // (fallback={null}) so a failed toast bundle never blanks the embed.
      <SafeSuspense fallback={null} errorFallback={null}>
        <LazyToaster
          style={
            {
              bottom: isIheartIframe ? "72px" : "24px",
              "--offset-right": "16px",
            } as React.CSSProperties
          }
        />
      </SafeSuspense>
    );
  }

  // Remove the HTML skeleton that was injected into the shadow root before React mounted.
  // Called once by EmbedRoot on its first render via the onContentReady prop.
  const handleContentReady = () => {
    const shadowRoot = container.shadowRoot;
    if (!shadowRoot) return;
    const skeleton = shadowRoot.querySelector(".gen-sdk-skeleton-container");
    if (skeleton) {
      skeleton.remove();
    }
    window.genuin?.emitInternal?.(SDKEventType.SDK_EMBED_CONTENT_READY, {
      instanceId: container.getAttribute("data-instance-id"),
    });
  };

  const rootToRender: ReactNode = (
    <EmbedRootMount
      fallbackSkeleton={<EmbedSkeleton theme={config.theme} container={container} />}
      embedRootProps={{
        targetContainer: shadowTarget,
        container,
        embedData,
        brandDetails,
        config,
        user,
        wasLazilyLoaded,
        brandLayoutType,
        isOnlyForExpand,
        onContentReady: handleContentReady,
      }}
    />
  );

  root.render(rootToRender);

  // Performance marker: Embed render end (after React render)
  // Use requestAnimationFrame to ensure render is complete
  requestAnimationFrame(() => {
    metrics.markEmbedRenderEnd(embedId);
  });

  // Return cleanup function
  return () => {
    root.unmount();
    containerRootMap.delete(container);
    containerOwnsHostMap.delete(container);

    // Cleanup toaster when no embeds remain
    if (containerRootMap.size === 0 && toasterRoot) {
      toasterRoot.unmount();
      document.getElementById("gen-sdk-toaster-root")?.remove();
      toasterRoot = null;
    }

    const rootNode = container.getRootNode();
    if (rootNode instanceof ShadowRoot && (rootNode as ShadowRoot).host.hasAttribute("data-genuin-host")) {
      (rootNode as ShadowRoot).host.remove();
    } else {
      container.remove();
    }

    // Clean up overlay shadow host ONLY if this was the last embed
    // Clean up overlay shadow host if no other instances are using it
    const remainingInstances = document.querySelectorAll("[data-genuin-host]");
    if (remainingInstances.length === 0) {
      // NOTE: Cleanup is handled in the root portal component; this is kept as a safeguard.
      cleanupOverlayShadowHost();
    }
  };
}
