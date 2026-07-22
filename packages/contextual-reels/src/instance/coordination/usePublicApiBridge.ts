/**
 * usePublicApiBridge — bridges internal bus events to the window.cxr public
 * API's `_emit`, so host pages subscribed via `window.cxr.on(...)` observe
 * this instance's play/pause/fullscreen/ad events.
 *
 * No-op when `window.cxr._emit` is absent (public API not installed / SDK not
 * loaded on this page).
 *
 * Must be mounted inside EventBusProvider. Side-effect only — returns nothing.
 */
import { useEffect } from "react";

import type { CxrEventBus } from "@cxr/instance/coordination/CxrEventBus";
import type { CxrPublicApiInternal } from "@cxr/publicApi";

export function usePublicApiBridge(instanceId: string, bus: CxrEventBus): void {
  useEffect(() => {
    const publicApi = (window as Window & { cxr?: CxrPublicApiInternal }).cxr;
    if (!publicApi?._emit) return;
    const emit = publicApi._emit.bind(publicApi);

    const subs = [
      bus.on("player:play", () => emit(instanceId, "play")),
      bus.on("player:pause", () => emit(instanceId, "pause")),
      bus.on("fullscreen:enter", () => emit(instanceId, "fullscreen:enter")),
      bus.on("fullscreen:exit", () => emit(instanceId, "fullscreen:exit")),
      bus.on("ad:fill", () => emit(instanceId, "ad:fill")),
      bus.on("ad:nofill", () => emit(instanceId, "ad:nofill")),
      bus.on("ad:removed", () => emit(instanceId, "ad:removed")),
    ];
    return () => {
      subs.forEach((u) => u());
    };
  }, [instanceId, bus]);
}
