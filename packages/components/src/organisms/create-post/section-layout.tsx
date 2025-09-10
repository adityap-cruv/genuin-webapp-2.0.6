"use client";

import { cn } from "@genuin/ui/lib/utils";
import { ComponentProps, useEffect, useRef, useState } from "react";

type SectionLayoutProps = {
  children: React.ReactNode;
} & ComponentProps<"div">;

export function SectionLayout({
  children,
  className,
  ...restProps
}: SectionLayoutProps) {
  return (
    <div
      className={cn(
        "gencl:flex gencl:w-full gencl:h-full gencl:bg-white",
        className
      )}
      {...restProps}
    >
      {children}
    </div>
  );
}

export function SectionLayoutLeft({
  children,
  className,
  ...restProps
}: SectionLayoutProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [videoWidth, setVideoWidth] = useState<number>(0);

  // Maintain aspect ratio for post video
  const updateVideoWidth = () => {
    if (containerRef.current) {
      const height = containerRef.current.clientHeight;
      const width = height * (9 / 16);
      setVideoWidth(width);
    }
  };

  useEffect(() => {
    updateVideoWidth();
    window.addEventListener("resize", updateVideoWidth);
    return () => window.removeEventListener("resize", updateVideoWidth);
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "gencl:flex gencl:flex-col gencl:items-end gencl:justify-center gencl:h-full",
        className
      )}
      style={{ width: `${videoWidth}px` }}
      {...restProps}
    >
      {children}
    </div>
  );
}

export function SectionLayoutRight({
  children,
  className,
  ...restProps
}: SectionLayoutProps) {
  return (
    <div
      className={cn(
        "gencl:flex-1 gencl:overflow-y-scroll gencl:px-6 gencl:py-4",
        className
      )}
      {...restProps}
    >
      {children}
    </div>
  );
}
