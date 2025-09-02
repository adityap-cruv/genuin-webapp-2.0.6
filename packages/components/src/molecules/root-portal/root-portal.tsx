import { useBaseContext } from "@genuin/components/context/base";
import * as React from "react";
import { createPortal } from "react-dom";

type RootPortalProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * The RootPortal component is a React component that renders its children into a portal at the root of the document body.
 * @param param0 RootPortalProps - The props for the RootPortal component.
 * @returns
 */
export function RootPortal({ children, className }: RootPortalProps) {
  // SSR guard: don't render on server
  if (typeof window === "undefined") return null;
  const [mounted, setMounted] = React.useState(false);
  const { parsedBrandColors, isEmbed } = useBaseContext();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!isEmbed) return;

  if (!mounted) return null;
  const elementToRender = (
    <div style={{ ...parsedBrandColors, zIndex: 20 }} className={className}>
      {children}
    </div>
  );
  return createPortal(elementToRender, document.body);
}
