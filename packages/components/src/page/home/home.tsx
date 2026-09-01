"use client";

import { HomeDynamic } from "@genuin/components/page/home-dynamic/home-dynamic";

/**
 * The home page. `/home` runs the backend-driven `home-dynamic` engine — BFF-supplied layout
 * plus per-page content, infinite scroll, and the video↔article contextual mapping.
 *
 * The previous hand-built version (a static `HomeSections` tree repeated by a `copies` counter
 * and an IntersectionObserver, wired through the `EventSurface` bus) was superseded by
 * `HomeDynamic` and has been removed; git history has it if it's ever needed again.
 */
export function Home() {
  return <HomeDynamic />;
}
