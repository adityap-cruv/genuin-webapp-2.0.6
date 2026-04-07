import { useBaseContext } from "@genuin/components/context/base";
import { cn } from "@genuin/ui/lib/utils";
import * as React from "react";
import { createPortal } from "react-dom";
import {
  cleanupOverlayShadowHost,
  getOrCreateOverlayShadowHost,
} from "./shadow-root/shadow-dom.utils";
import { Toaster } from "@genuin/ui";
import { useEffect } from "react";

type RootPortalProps = {
  children: React.ReactNode;
  className?: string;
  container?: string | HTMLElement;
  style?: React.ComponentProps<"div">["style"];
  enabledToaster?: boolean;
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
};

const getOverlayZIndexByBrandId = (brandId?: number): string | undefined => {
  if (!brandId) return undefined;
  return BRAND_OVERLAY_Z_INDEX[brandId];
};

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
}: RootPortalProps) {
  // SSR guard: don't render on server
  if (typeof window === "undefined") return null;
  const [mounted, setMounted] = React.useState(false);
  const [containerElement, setContainerElement] =
    React.useState<HTMLElement | null>(null);
  const { parsedBrandColors, isEmbed, useShadowDOM, brandDetails, theme } =
    useBaseContext();

  React.useEffect(() => {
    setMounted(true);

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
        // Get or create overlay shadow host
        const { shadowRoot, host } = getOrCreateOverlayShadowHost();
        const brandOverlayZIndex = getOverlayZIndexByBrandId(
          brandDetails.brand_id,
        );
        if (brandOverlayZIndex) {
          host.style.zIndex = brandOverlayZIndex;
        }
        const container = shadowRoot.querySelector(
          "[data-portal-container]",
        ) as HTMLElement;
        // Apply custom styles to the overlay host when provided via props
        if (style) {
          Object.assign(host.style, style);
          Object.assign(container.style, style);
        }
        setContainerElement(container);
      } else {
        // Default to document.body
        setContainerElement(document.body);
      }
    }

    return () => {
      cleanupOverlayShadowHost();
    };
  }, [container]);

  useEffect(() => {
    if (!containerElement) return;
    containerElement?.classList.add("gen-sdk-class");
    containerElement.style.position = "fixed";
    containerElement.style.inset = "0";
    const carlistBrandIds = [2992, 2993, 3080, 3075, 2314, 2557, 2558, 2556];
    const isCarlistBrand = carlistBrandIds.includes(brandDetails.brand_id);
    if (isCarlistBrand) {
      containerElement.style.backgroundColor = "rgba(0, 0, 0, 0.85)";
    } else {
      containerElement?.classList.add(
        theme === "dark" || theme === undefined
          ? "gencl:bg-black"
          : "gencl:bg-white",
      );
    }
  }, [containerElement, theme]);

  if (!isEmbed || !mounted || !containerElement) return null;

  const elementToRender = (
    <div
      style={{
        ...parsedBrandColors,
        ...style,
        pointerEvents: "auto",
        position: useShadowDOM ? "relative" : undefined,
        zIndex: 30,
      }}
      className={cn("gen-sdk-root-portal gen-sdk-class", className)}
    >
      {children}
      {enabledToaster && <Toaster />}
    </div>
  );
  return createPortal(elementToRender, containerElement);
}
