"use client";
/**
 * OctoSdkPanel — GenAI SDK lifecycle wrapper for the contextual-reels widget.
 *
 * The cxr-local equivalent of the webapp's `OctoPanel` (sheet variant only).
 * Loads the SDK by **directly importing the `@genuin/genai-sdk` module** — the
 * same path the web-sdk uses — rather than the CDN window-global. The module
 * import bundles the SDK + its CSS, exposes the `web-sdk` view, and types cleanly.
 * Mounts the SDK into a container div and forwards `genai:octoLifecycle` phases
 * to the parent state machine. The web-sdk parent-instance plumbing is omitted.
 */
import { userId } from "@cxr/userId";
import { createLogger } from "@cxr/utils/logger";
import type * as GenAiSdk from "@genuin/genai-sdk";
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import type { OctoPhase } from "./octo-phase-map";

const logger = createLogger("cxr/octo-sdk-panel");

/** The slice of the `@genuin/genai-sdk` module the panel uses. */
type GenAiSdkModule = typeof GenAiSdk;

/** Props for {@link OctoSdkPanel}. */
export interface OctoSdkPanelProps {
  /** Stable per-instance id used to namespace the SDK container + lifecycle routing. */
  instanceId: string;
  /** Current reel's video id. A change destroys + reinitialises the SDK. */
  videoId: string;
  /** Advertiser/brand id forwarded to the SDK. */
  brandId?: number;
  /** "compact" | "full" — drives the SDK's render density; mirrors the sheet state. */
  renderMode: "compact" | "full";
  /** Whether the panel is open (mounted + initialised). */
  isOpen: boolean;
  /**
   * Monotonically-increasing key bumped each time the reel re-activates
   * (`isActive` false→true). A change forces a full destroy + fresh init so
   * stale SDK chat/prompt state never carries over to a revisited reel.
   */
  activationKey: number;
  /**
   * Auto-prompt mode forwarded to the SDK. `"full"` auto-sends; `"countdown-only"`
   * prefills + counts down without sending. Defaults to `"full"`.
   */
  autoPromptMode?: "full" | "countdown-only";
  /**
   * Optional caller-supplied panel id. When provided, it replaces the internally
   * generated `panelId` so a parent can filter `genai:octoLifecycle` events for
   * this exact panel. Used by short-format hosts that own the lifecycle.
   */
  parentOctoPanelIdOverride?: string;
  /**
   * UI density level forwarded to the SDK at init time.
   * Controls the scale of all sizing-sensitive UI elements.
   * - `"xs"`   — compact strips (320×100, 320×50)
   * - `"sm"`   — larger ad tiles (300×250 split view)
   * - `"base"` — standard full UI (default)
   */
  uiDensity?: "xs" | "sm" | "base";
  /** Called with each inbound lifecycle phase (already panel-filtered). */
  onLifecyclePhase: (phase: OctoPhase) => void;
}

let panelSeq = 0;

/**
 * Renders the GenAI SDK mount node and manages its init/destroy lifecycle.
 *
 * @param props - {@link OctoSdkPanelProps}
 * @returns The SDK container element, or a loading placeholder until the SDK loads.
 */
export function OctoSdkPanel({
  instanceId,
  videoId,
  brandId,
  renderMode,
  isOpen,
  activationKey,
  autoPromptMode = "full",
  parentOctoPanelIdOverride,
  uiDensity,
  onLifecyclePhase,
}: OctoSdkPanelProps): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerNode, setContainerNode] = useState<HTMLDivElement | null>(null);

  // Stable identity for this panel instance.
  const idsRef = useRef<{ containerId: string; panelId: string } | null>(null);
  if (idsRef.current === null) {
    panelSeq += 1;
    idsRef.current = {
      containerId: `${instanceId}-octo-genai-${panelSeq}`,
      panelId: parentOctoPanelIdOverride ?? `${instanceId}-octo-panel-${panelSeq}`,
    };
  }
  const { containerId, panelId } = idsRef.current;

  const [sdk, setSdk] = useState<GenAiSdkModule | null>(null);
  const loadingRef = useRef(false);
  const initializedRef = useRef(false);
  const destroyingRef = useRef(false);
  const prevVideoIdRef = useRef<string | null>(null);
  const prevActivationKeyRef = useRef<number | null>(null);
  const prevRenderModeRef = useRef<"compact" | "full">(renderMode);
  const [reinitTick, setReinitTick] = useState(0);

  const handleContainerRef = useCallback((node: HTMLDivElement | null) => {
    containerRef.current = node;
    setContainerNode(node);
  }, []);

  /** Tell the SDK to reset its chat/prompt state. */
  const dispatchClose = useCallback(() => {
    window.dispatchEvent(new CustomEvent("genai:webSdkClose", { detail: { parentOctoPanelId: panelId } }));
  }, [panelId]);

  // Lazy-load the SDK module the first time the panel opens. Importing the
  // module bundles the SDK + injects its CSS (no CDN script, no polling).
  useEffect(() => {
    if (!isOpen || sdk || loadingRef.current) return;
    loadingRef.current = true;
    import("@genuin/genai-sdk")
      .then((module) => setSdk(module))
      .catch((err: unknown) => {
        logger.error("OctoSdkPanel: failed to load @genuin/genai-sdk", err);
        loadingRef.current = false;
      });
  }, [isOpen, sdk]);

  // Init / destroy+reinit (video change OR reel re-activation). useLayoutEffect
  // so DOM mutations land before paint, matching the webapp's OctoPanel.
  useLayoutEffect(() => {
    const container = containerNode ?? containerRef.current;
    if (!isOpen || !sdk || !container) return;

    const hasVideoChanged = prevVideoIdRef.current !== null && prevVideoIdRef.current !== videoId;
    const hasReactivated = prevActivationKeyRef.current !== null && prevActivationKeyRef.current !== activationKey;
    const needsReinit = hasVideoChanged || hasReactivated;

    if (initializedRef.current && !needsReinit) return;
    if (destroyingRef.current) return;

    // Video changed or the reel re-activated → destroy the current SDK (clearing
    // its chat/prompt state first), then re-run init via the reinit tick.
    if (initializedRef.current && needsReinit) {
      destroyingRef.current = true;
      const destroyAndReinit = async () => {
        try {
          dispatchClose();
          await Promise.resolve(sdk.destroy());
          initializedRef.current = false;
          await new Promise((resolve) => setTimeout(resolve, 100));
        } catch (err) {
          logger.error("OctoSdkPanel: destroy on reinit failed", err);
        } finally {
          destroyingRef.current = false;
          setReinitTick((t) => t + 1);
        }
      };
      destroyAndReinit();
      return;
    }

    try {
      void sdk.init({
        containerId,
        containerElement: container,
        userId,
        brandId: 1729,
        view: "web-sdk",
        renderMode,
        uiDensity,
        videoId,
        parentOctoPanelId: panelId,
        integrationType: "placement",
        autoPromptConfig: {
          // mode: autoPromptMode,
          mode: "disabled",
          countdownMs: 5000,
          idealDelayMs: 5000,
          nextPromptDelayMs: 5000,
          disableAutoClose: true,
        },
      });
      initializedRef.current = true;
      prevVideoIdRef.current = videoId;
      prevActivationKeyRef.current = activationKey;
    } catch (err) {
      logger.error("OctoSdkPanel: init failed", err);
      initializedRef.current = false;
    }
  }, [
    isOpen,
    sdk,
    containerNode,
    videoId,
    activationKey,
    autoPromptMode,
    brandId,
    renderMode,
    uiDensity,
    containerId,
    panelId,
    reinitTick,
    dispatchClose,
  ]);

  // Destroy on close, with a grace period to absorb quick re-opens.
  useEffect(() => {
    if (isOpen) return;
    const timeout = setTimeout(() => {
      if (!isOpen && initializedRef.current && sdk) {
        try {
          dispatchClose();
          sdk.destroy();
        } catch (err) {
          logger.error("OctoSdkPanel: destroy on close failed", err);
        }
        initializedRef.current = false;
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [isOpen, sdk, dispatchClose]);

  // Cleanup on true unmount (deferred a tick so React finishes its render).
  useEffect(() => {
    return () => {
      if (initializedRef.current && sdk) {
        dispatchClose();
        setTimeout(() => {
          try {
            sdk.destroy();
          } catch (err) {
            logger.error("OctoSdkPanel: cleanup failed", err);
          }
        }, 0);
        initializedRef.current = false;
      }
    };
  }, [sdk, dispatchClose]);

  // Push render-mode changes to the SDK without a full reinit.
  useEffect(() => {
    if (!initializedRef.current || !sdk) return;
    if (typeof sdk.setWebSdkRenderMode !== "function") return;
    if (prevRenderModeRef.current === renderMode) return;
    prevRenderModeRef.current = renderMode;
    try {
      sdk.setWebSdkRenderMode(renderMode);
    } catch (err) {
      logger.error("OctoSdkPanel: setWebSdkRenderMode failed", err);
    }
  }, [renderMode, sdk]);

  // Inbound lifecycle phases, filtered to this panel.
  useEffect(() => {
    const handler = (event: Event) => {
      const { detail } = event as CustomEvent<{ parentOctoPanelId?: string; phase: OctoPhase }>;
      if (detail?.parentOctoPanelId && detail.parentOctoPanelId !== panelId) return;
      if (detail?.phase) onLifecyclePhase(detail.phase);
    };
    window.addEventListener("genai:octoLifecycle", handler);
    return () => window.removeEventListener("genai:octoLifecycle", handler);
  }, [panelId, onLifecyclePhase]);

  if (!sdk) {
    return (
      <div className="gencl:flex gencl:h-full gencl:w-full gencl:items-center gencl:justify-center">
        <div className="gencl:h-8 gencl:w-8 gencl:animate-spin gencl:rounded-full gencl:border-b-2 gencl:border-white" />
      </div>
    );
  }

  return (
    <div
      id={containerId}
      ref={handleContainerRef}
      data-octo-panel-id={panelId}
      data-video-id={videoId}
      className="genai-sdk-container gencl:h-full gencl:w-full"
    />
  );
}
