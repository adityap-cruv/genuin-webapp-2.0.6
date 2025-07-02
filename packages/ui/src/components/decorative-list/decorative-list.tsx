import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  type ComponentProps,
} from "react";

import { cn } from "@genuin/ui/lib/utils";

type Props = ComponentProps<"ul"> & { children: React.ReactNode };

/**
 * Add only <li></li> elements in it.
 * @param param0
 * @returns
 */
export function DecorativeList({
  children,
  className,
  style,
  ...props
}: Props) {
  const [lastLiHeight, setLastLiHeight] = useState(0);
  const ul = useRef<HTMLUListElement>(null);

  // Debounced update for performance
  const updateLastLiHeight = useCallback(() => {
    const li = ul.current?.querySelector<HTMLLIElement>("li:last-child");
    if (li) {
      const height = getComputedStyle(li).height;
      setLastLiHeight(parseFloat(height));
    }
  }, []);

  useEffect(() => {
    if (!ul.current) return;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const debouncedUpdate = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(updateLastLiHeight, 50);
    };

    updateLastLiHeight();
    const resizeObs = new ResizeObserver(debouncedUpdate);
    const mutationObs = new MutationObserver(debouncedUpdate);
    resizeObs.observe(ul.current);
    mutationObs.observe(ul.current, { childList: true, subtree: true });
    return () => {
      resizeObs.disconnect();
      mutationObs.disconnect();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [updateLastLiHeight]);

  // Note: Consider moving styles to a CSS module or styled-jsx for maintainability
  return (
    <ul
      className={cn(
        "gencl:relative gencl:h-fit gencl:border-l",
        // Base list styles
        "gencl:[&>li]:relative gencl:pl-4 gencl:[&>li]:pl-8",
        // Pseudo-element styles for list decoration
        "gencl:[&>li]:before:content-[''] gencl:[&>li]:before:w-12 gencl:[&>li]:before:h-2.5",
        "gencl:[&>li]:before:rounded-bl-[12px] gencl:[&>li]:before:border-secondary-150",
        "gencl:[&>li]:before:border-b gencl:[&>li]:before:border-l gencl:[&>li]:before:border-solid",
        "gencl:[&>li]:before:absolute gencl:[&>li]:before:left-[-1em] gencl:[&>li]:before:top-1/2",
        // Hide pseudo-element for items with has-child class
        "gencl:[&>li.has-child]:before:hidden",
        className
      )}
      ref={ul}
      role="list"
      style={{
        paddingLeft: "0.95em",
        borderImage: `linear-gradient(to bottom, var(--secondary-150) calc(100% - ${lastLiHeight / 2}px - ${
          window.devicePixelRatio > 1
            ? (4 * window.devicePixelRatio).toFixed(1) + "px"
            : "0px"
        }), transparent 50%) 1`,
        ...style,
      }}
      {...props}
    >
      {children}
    </ul>
  );
}
