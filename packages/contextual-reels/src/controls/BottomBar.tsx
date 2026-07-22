"use client";
import { SafeSuspense } from "@genuin/components/molecules/error/safe-suspense";
import React, { lazy } from "react";

import type { BottomBarProps } from "@cxr/controls/control-layer.types";

const DefaultBottomBar = lazy(() =>
  import("./bottombar/DefaultBottomBar").then((m) => ({ default: m.DefaultBottomBar }))
);

/**
 * Renders the bottom control bar (instagram-style) for both the default and
 * iheart variants.
 */
export function BottomBar({ ...rest }: BottomBarProps): React.JSX.Element {
  return (
    <SafeSuspense fallback={null}>
      <DefaultBottomBar {...rest} />
    </SafeSuspense>
  );
}
