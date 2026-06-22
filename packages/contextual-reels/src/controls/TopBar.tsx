"use client";

import React, { lazy, Suspense } from "react";

import type { TopBarProps } from "@cxr/controls/control-layer.types";

const DefaultTopBar = lazy(() => import("./topbar/DefaultTopBar").then((m) => ({ default: m.DefaultTopBar })));

/**
 * Renders the TopBar — DefaultTopBar handles variant-based icon visibility.
 */
export function TopBar({ variant, ...rest }: TopBarProps): React.JSX.Element {
  return (
    <Suspense fallback={null}>
      <DefaultTopBar variant={variant} {...rest} />
    </Suspense>
  );
}
