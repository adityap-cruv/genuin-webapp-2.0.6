import { useEffect, useRef } from "react";

/**
 * Auto-expand hook: opens expand view once when the root element crosses
 * 50% visibility. Only activates when shouldAutoExpand is true.
 *
 * NOTE: Temporary feature — IDs are configured in use-embed-config.ts (brand.shouldAutoExpand).
 */
export function useAutoExpand(
  rootElement: HTMLElement | null | undefined,
  shouldAutoExpand: boolean,
  onExpand: () => void,
  expandEnabled: boolean
): void {
  const hasExpanded = useRef(false);

  useEffect(() => {
    if (!expandEnabled || !shouldAutoExpand || !rootElement || hasExpanded.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !hasExpanded.current) {
            hasExpanded.current = true;
            onExpand();
            observer.disconnect();
          }
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(rootElement);
    return () => observer.disconnect();
  }, [rootElement, shouldAutoExpand, onExpand, expandEnabled]);
}
