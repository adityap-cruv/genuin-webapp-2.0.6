"use client";

import { SafeSuspense } from "@genuin/components/molecules/error/safe-suspense";
import React, { lazy } from "react";

import type { TopBarProps } from "@cxr/controls/control-layer.types";

const DefaultTopBar = lazy(() => import("./topbar/DefaultTopBar").then((m) => ({ default: m.DefaultTopBar })));

/**
 * Renders the TopBar — DefaultTopBar handles variant-based icon visibility.
 */
export function TopBar({ variant, ...rest }: TopBarProps): React.JSX.Element {
  return (
    <SafeSuspense fallback={null}>
      <DefaultTopBar variant={variant} {...rest} />
    </SafeSuspense>
  );
}
