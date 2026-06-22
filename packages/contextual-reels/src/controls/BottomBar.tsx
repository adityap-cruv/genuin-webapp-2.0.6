"use client";
import React, { lazy, Suspense } from "react";

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
    <Suspense fallback={null}>
      <DefaultBottomBar {...rest} />
    </Suspense>
  );
}
