"use client";
import { SafeSuspense } from "@genuin/components/molecules/error/safe-suspense";
import React, { lazy } from "react";

import type { BottomBarProps } from "@cxr/controls/control-layer.types";

const DefaultBottomBar = lazy(() =>
  import("./bottombar/DefaultBottomBar").then((m) => ({ default: m.DefaultBottomBar }))
);

/**
 * Routes to the correct BottomBar sub-component.
 *
 * default + fullscreen  → FullscreenBottomBar (youtube style)
 * default + !fullscreen → DefaultBottomBar    (instagram style)
 * iheart  + any         → DefaultBottomBar    (instagram style)
 */
export function BottomBar({ ...rest }: BottomBarProps): React.JSX.Element {
  return (
    <SafeSuspense fallback={null}>
      <DefaultBottomBar {...rest} />
    </SafeSuspense>
  );
}
