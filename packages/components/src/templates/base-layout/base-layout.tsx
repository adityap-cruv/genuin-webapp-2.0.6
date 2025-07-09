"use client";
import { cn } from "@genuin/ui/utils";
import type { ComponentProps } from "react";
import { useWindowSize } from "usehooks-ts";

import { TOP_BAR_HEIGHT } from "@genuin/components/lib/constants";
import { SideBar } from "@genuin/components/organisms/side-bar";
import { TopBar } from "@genuin/components/organisms/top-bar";
import React from "react";
import { Toaster } from "@genuin/ui/toaster";

type BaseLayoutProps = ComponentProps<"section">;

export function BaseLayout({
  children,
  className,
  ...restProps
}: BaseLayoutProps) {
  const { height } = useWindowSize();

  return (
    <>
      <TopBar
        className="gencl:border-b gencl:border-secondary-150 gencl:bg-white gencl:relative"
        style={{ zIndex: 9 }}
      />
      <main
        className="gencl:flex gencl:h-full"
        style={{
          height: "calc(100vh - " + TOP_BAR_HEIGHT + "px)",
        }}
      >
        <SideBar />
        <section
          className={cn(
            "gencl:w-full gencl:flex-grow gencl:!h-full gencl:relative",
            className
          )}
          {...restProps}
        >
          {children}
        </section>
        <Toaster />
      </main>
    </>
  );
}
