"use client";
import { cn } from "@genuin/ui/utils";
import type { ComponentProps } from "react";
import { useWindowSize } from "usehooks-ts";

import { TOP_BAR_HEIGHT } from "@genuin/components/lib/constants";
import { SideBar } from "@genuin/components/organisms/side-bar";
import { TopBar } from "@genuin/components/organisms/top-bar";
import React from "react";
import { Toaster } from "@genuin/ui/toaster";

type BaseLayoutProps = ComponentProps<"section"> & { search?: React.ReactNode };

export function BaseLayout({
  search,
  children,
  className,
  ...restProps
}: BaseLayoutProps) {
  const { height } = useWindowSize();

  return (
    <div className="gencl:h-full gencl:w-full gencl:mx-auto">
      <TopBar
        className="gencl:border-b gencl:border-secondary-150 gencl:bg-white gencl:relative"
        style={{ zIndex: 9 }}
        search={search}
      />
      <main
        className="gencl:flex gencl:h-full"
        style={{ height: height - TOP_BAR_HEIGHT }}
      >
        <SideBar />
        <section
          className={cn(
            "gencl:w-full gencl:!h-full gencl:mx-auto gencl:relative",
            className
          )}
          style={{ maxWidth: "1300px" }}
          {...restProps}
        >
          {children}
        </section>
        <Toaster />
      </main>
    </div>
  );
}
