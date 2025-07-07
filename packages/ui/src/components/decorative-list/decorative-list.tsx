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
 */
export function DecorativeList({
  children,
  className,
  style,
  ...props
}: Props) {
  const ulRef = useRef<HTMLUListElement>(null);
  const [stopY, setStopY] = useState(0);

  const updateStopY = useCallback(() => {
    const ul = ulRef.current;
    if (!ul) return;

    const lastLi = ul.querySelector("li:last-child") as HTMLElement | null;
    const lastLiHeight = lastLi?.offsetHeight ?? 0;
    const totalHeight = ul.offsetHeight;

    setStopY(totalHeight - lastLiHeight / 2);
  }, []);

  useEffect(() => {
    if (!ulRef.current) return;

    updateStopY();
    const resizeObs = new ResizeObserver(updateStopY);
    const mutationObs = new MutationObserver(updateStopY);

    resizeObs.observe(ulRef.current);
    mutationObs.observe(ulRef.current, { childList: true, subtree: true });

    return () => {
      resizeObs.disconnect();
      mutationObs.disconnect();
    };
  }, [updateStopY]);

  return (
    <ul
      className={cn(
        "gencl:relative gencl:pl-4 gencl:[&>li]:pl-8 gencl:[&>li]:relative",
        // Decorative pseudo-lines
        "gencl:[&>li]:before:content-[''] gencl:[&>li]:before:w-12 gencl:[&>li]:before:h-2.5",
        "gencl:[&>li]:before:rounded-bl-[12px] gencl:[&>li]:before:border-secondary-150",
        "gencl:[&>li]:before:border-b gencl:[&>li]:before:border-l gencl:[&>li]:before:border-solid",
        "gencl:[&>li]:before:absolute gencl:[&>li]:before:left-[-1em] gencl:[&>li]:before:top-1/2",
        "gencl:[&>li.has-child]:before:hidden",
        className
      )}
      ref={ulRef}
      role="list"
      style={{
        paddingLeft: "1em",
        position: "relative",
        ...style,
      }}
      {...props}
    >
      {/* Decorative vertical line */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "1px",
          height: "100%",
          background: `linear-gradient(to bottom, var(--secondary-150) ${stopY}px, transparent ${stopY + 1}px)`,
          pointerEvents: "none",
        }}
      />
      {children}
    </ul>
  );
}
