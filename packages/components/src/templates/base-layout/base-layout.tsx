import { cn } from "@genuin/ui/utils";
import type { ComponentProps } from "react";
import { useWindowSize } from "usehooks-ts";

import { TOP_BAR_HEIGHT } from "@genuin/components/lib/constants";
import { SideBar } from "@organisms/side-bar";
import { TopBar } from "@organisms/top-bar";

type BaseLayoutProps = ComponentProps<"section">;

export function BaseLayout({
  children,
  className,
  ...restProps
}: BaseLayoutProps) {
  const { height } = useWindowSize();

  return (
    <div className="gencl:h-full gencl:w-full gencl:mx-auto">
      <TopBar className="gencl:border-b gencl:border-secondary-150" />
      <main className="gencl:flex gencl:h-full" style={{ height: 813 }}>
        <SideBar className="gencl:h-full" />
        <section
          className={cn("gencl:w-full gencl:h-full gencl:mx-auto", className)}
          style={{ maxWidth: "1300px" }}
          {...restProps}
        >
          {children}
        </section>
      </main>
    </div>
  );
}
