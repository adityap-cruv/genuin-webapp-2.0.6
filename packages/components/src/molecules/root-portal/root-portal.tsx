import { useBaseContext } from "@genuin/components/context/base";
import * as React from "react";
import { createPortal } from "react-dom";

type RootPortalProps = {
  children: React.ReactNode;
  className?: string;
  container?: string | HTMLElement;
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
}: RootPortalProps) {
  // SSR guard: don't render on server
  if (typeof window === "undefined") return null;
  const [mounted, setMounted] = React.useState(false);
  const [containerElement, setContainerElement] =
    React.useState<HTMLElement | null>(null);
  const { parsedBrandColors, isEmbed } = useBaseContext();

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
      // Default to document.body
      setContainerElement(document.body);
    }
  }, [container]);

  if (!isEmbed) return;

  if (!mounted || !containerElement) return null;
  const elementToRender = (
    <div
      style={{ ...parsedBrandColors, zIndex: 30, position: "relative" }}
      className={className}
    >
      {children}
    </div>
  );
  return createPortal(elementToRender, containerElement);
}
