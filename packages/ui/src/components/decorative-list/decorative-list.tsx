import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  type ComponentProps,
} from "react";

import "./decorative-list.css";

import { cn } from "../../lib/utils";

type Props = ComponentProps<"ul"> & { children: React.ReactNode };

/**
 * Add only <li></li> elements in it.
 * @param param0
 * @returns
 */
export function DecorativeList({ children, className, ...props }: Props) {
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
      className={cn("custom-list gencl:relative gencl:h-fit", className)}
      ref={ul}
      role="list"
      style={{
        borderLeft: "1px solid",
        marginLeft: "22px",
        paddingLeft: "0.85em",
        borderImage: `linear-gradient(to bottom, var(--tertiary-200) calc(100% - ${lastLiHeight / 2}px - ${
          window.devicePixelRatio > 1
            ? (4 * window.devicePixelRatio).toFixed(1) + "px"
            : "0px"
        }), transparent 50%) 1`,
      }}
      {...props}
    >
      {children}
    </ul>
  );
}
