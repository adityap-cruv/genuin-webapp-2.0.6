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
        // TODO: Apply z-index conditionally since we don’t want clients to set this manually. This can be removed once full custom CSS support for brands is added in BCC.
        // Brand : Adland, India-exppress
        if (brandDetails.brand_id === 2764 || brandDetails.brand_id === 2793) {
          host.style.zIndex = "2147483647";
        } else if (
          // Brand : Fansided or Minute Media
          brandDetails.brand_id === 3211 ||
          brandDetails.brand_id === 2633
        ) {
          host.style.zIndex = "50";
        }
        // Brand : Carlist
        else if (
          brandDetails.brand_id === 3075 ||
          brandDetails.brand_id === 2314
        ) {
          host.style.zIndex = "1000000";
        }
        // Apply custom styles to the overlay host when provided via props
        if (style) {
          Object.assign(host.style, style);
        }

        const container = shadowRoot.querySelector(
          "[data-portal-container]",
        ) as HTMLElement;
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

    const isCarlistBrand =
      brandDetails.brand_id === 3075 || brandDetails.brand_id === 2314;
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
