import { Toaster } from "@genuin/ui";
import { cn } from "@genuin/ui/lib/utils";
import * as React from "react";
import { useEffect } from "react";
import { createPortal } from "react-dom";

import { useBaseContext } from "@genuin/components/context/base";

import { cleanupOverlayShadowHost, getOrCreateOverlayShadowHost } from "./shadow-root/shadow-dom.utils";

type RootPortalProps = {
  children: React.ReactNode;
  className?: string;
  container?: string | HTMLElement;
  style?: React.ComponentProps<"div">["style"];
  enabledToaster?: boolean;
  /**
   * Key that identifies which overlay shadow host to use.
   * Each distinct key gets its own isolated host element so that style props
   * (e.g. height) from different callers never overwrite each other.
   * Defaults to "default" for backward compatibility.
   */
  portalKey?: string;
  /**
   * When true, the portal container is re-anchored to the live visual viewport
   * (`window.visualViewport`) instead of being pinned to the layout viewport via
   * `inset: 0`. This shrinks the (potentially `bg-black`) backdrop to the visible
   * area when the iOS keyboard opens, so it does not paint a "black void" behind
   * the keyboard. Defaults to false — existing consumers keep `inset: 0`.
   */
  trackVisualViewport?: boolean;
};

const BRAND_OVERLAY_Z_INDEX: Record<number, string> = {
  // Adland, India-express
  2764: "2147483647",
  2793: "2147483647",
  // Fansided, Minute Media
  3211: "50",
  2633: "50",
  // Carlist
  3075: "1000000",
  2314: "1000000",
  // Mobil123
  2992: "999999",
  2556: "999999",
  // one2car
  2993: "99999",
  2557: "99999",
  // carmudi
  3080: "1000000",
  2558: "1000000",
  // Bargain Hunter
  2801: "10000",
  // TED,
  2357: "30",
  // Mike iheart
  1729: "11",
  // Sports Server
  3275: "12",
};

const getOverlayZIndexByBrandId = (brandId?: number): string | undefined => {
  if (!brandId) return undefined;
  return BRAND_OVERLAY_Z_INDEX[brandId];
};

// Expand views can nest into the same keyed host. The child must not remove the host still owned by its parent.
const portalOwnerCount = new Map<string, number>();

/**
 * The RootPortal component is a React component that renders its children into a portal at the root of the document body.
 * @param param0 RootPortalProps - The props for the RootPortal component.
 * @returns
 */
export function RootPortal({
  children,
  className,
  container,
  style,
  enabledToaster = true,
  portalKey = "default",
  trackVisualViewport = false,
}: RootPortalProps) {
  const { parsedBrandColors, isEmbed, useShadowDOM, brandDetails, theme } = useBaseContext();
  const brandId = brandDetails.brand_id;
  const styleRef = React.useRef(style);
  styleRef.current = style;

  // Resolve the shadow-host container *synchronously* during the first render for
  // the embed-overlay case. getOrCreateOverlayShadowHost is idempotent and sync, so
  // the portal target exists on the very first commit — there is no null-first-render
  // frame where the previous skeleton has unmounted but the overlay hasn't painted
  // yet (the transparent gap when entering expand-view). The effect below still owns
  // all style/z-index work; this only seeds the target early.
  const [containerElement, setContainerElement] = React.useState<HTMLElement | null>(() => {
    if (typeof window === "undefined" || container || !useShadowDOM) return null;
    const { shadowRoot } = getOrCreateOverlayShadowHost(portalKey);
    return shadowRoot.querySelector("[data-portal-container]") as HTMLElement | null;
  });
  useEffect(() => {
    // Resolve the container element
    if (container) {
      if (typeof container === "string") {
        // If container is a string ID, find the element
        const element = document.getElementById(container);
        setContainerElement(element);
      } else {
        // If container is already an HTMLElement, use it directly
        setContainerElement(container);
      }
    } else {
      if (useShadowDOM) {
        portalOwnerCount.set(portalKey, (portalOwnerCount.get(portalKey) ?? 0) + 1);
        // Each portalKey gets its own isolated shadow host so that style props
        // (e.g. PipView height:0px vs ExpandView height:812px) never overwrite
        // each other.
        const { shadowRoot, host } = getOrCreateOverlayShadowHost(portalKey);
        const brandOverlayZIndex = getOverlayZIndexByBrandId(brandId);
        if (brandOverlayZIndex) {
          host.style.zIndex = brandOverlayZIndex;
        }

        const portalContainer = shadowRoot.querySelector("[data-portal-container]") as HTMLElement;
        if (styleRef.current) {
          Object.assign(host.style, styleRef.current);
          Object.assign(portalContainer.style, styleRef.current);
        }
        setContainerElement(portalContainer);

        return () => {
          const remainingOwners = (portalOwnerCount.get(portalKey) ?? 1) - 1;
          if (remainingOwners > 0) {
            portalOwnerCount.set(portalKey, remainingOwners);
          } else {
            portalOwnerCount.delete(portalKey);
            cleanupOverlayShadowHost(portalKey);
          }
        };
      } else {
        // Light-DOM embeds still get a dedicated keyed host. Mutating `document.body` here used to
        // make the entire first-party WebApp fixed/inset when a nested placement expanded.
        const host = document.createElement("div");
        host.setAttribute("data-genuin-light-portal-host", "true");
        host.setAttribute("data-portal-container", "true");
        host.setAttribute("data-portal-key", portalKey);
        host.classList.add("gen-sdk-root-portal");
        if (styleRef.current) Object.assign(host.style, styleRef.current);
        document.body.appendChild(host);
        setContainerElement(host);

        return () => host.remove();
      }
    }
  }, [brandId, container, portalKey, useShadowDOM]);

  useEffect(() => {
    if (!containerElement) return;
    containerElement?.classList.add("gen-sdk-class");
    containerElement.style.position = "fixed";
    containerElement.style.inset = "0";
    const carlistBrandIds = [2992, 2993, 3080, 3075, 2314, 2557, 2558, 2556];
    const isCarlistBrand = carlistBrandIds.includes(brandId);
    if (isCarlistBrand) {
      containerElement.style.backgroundColor = "rgba(0, 0, 0, 0.85)";
    } else {
      containerElement?.classList.add(theme === "dark" || theme === undefined ? "gencl:bg-black" : "gencl:bg-white");
    }
  }, [brandId, containerElement, theme]);

  // When enabled, anchor the portal container to the live visual viewport instead
  // of the layout viewport (`inset: 0`). On iOS the keyboard shrinks the visual
  // viewport but not the layout viewport, so an `inset: 0` backdrop keeps painting
  // (e.g. `bg-black`) behind the keyboard — the "black void". Re-anchoring to the
  // visual-viewport rectangle shrinks the backdrop to the visible area.
  // `theme` is in the deps so this re-applies immediately after the theme effect
  // re-sets `inset: 0` on a theme change.
  useEffect(() => {
    if (!trackVisualViewport || !containerElement) return;
    const viewport = window.visualViewport;
    if (!viewport) return;

    function syncToVisualViewport() {
      const vp = window.visualViewport;
      if (!vp || !containerElement) return;
      containerElement.style.inset = "";
      containerElement.style.top = `${vp.offsetTop}px`;
      containerElement.style.left = `${vp.offsetLeft}px`;
      containerElement.style.width = `${vp.width}px`;
      containerElement.style.height = `${vp.height}px`;
    }

    syncToVisualViewport();
    viewport.addEventListener("resize", syncToVisualViewport);
    viewport.addEventListener("scroll", syncToVisualViewport);

    return () => {
      viewport.removeEventListener("resize", syncToVisualViewport);
      viewport.removeEventListener("scroll", syncToVisualViewport);
    };
  }, [trackVisualViewport, containerElement, theme]);

  if (typeof window === "undefined") return null;
  // The shadow-overlay path seeds `containerElement` synchronously above, so it
  // renders on the first client commit (no transparent gap). Light-DOM and
  // explicit-container paths resolve it in the effect, so they still wait one tick.
  if (!isEmbed || !containerElement) return null;

  const elementToRender = (
    <div
      data-genuin-root-portal="true"
      data-portal-key={portalKey}
      style={{
        ...parsedBrandColors,
        ...style,
        pointerEvents: "auto",
        position: useShadowDOM ? "relative" : undefined,
        zIndex: 30,
      }}
      className={cn("gen-sdk-root-portal gen-sdk-class", className)}>
      {children}
      {enabledToaster && <Toaster />}
    </div>
  );
  return createPortal(elementToRender, containerElement);
}
