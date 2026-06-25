"use client";
/**
 * OctoCountdownStrip — the 320×100 / 320×50 non-fullscreen Octo experience.
 *
 * Mounts the SDK panel in `countdown-only` auto-prompt mode (prefill + countdown,
 * never auto-send). No DynamicSheet, no state ladder. When a countdown completes
 * (lifecycle phase transitions `countdown` → `idle`), the widget enters
 * fullscreen — where the standard mobile sheet ladder takes over.
 *
 * The fullscreen entry uses the FullScreenProvider, which falls back to
 * CSS/React-state fullscreen (no native browser Fullscreen API), so the
 * timer-triggered entry works without a user gesture.
 */
import type React from "react";
import { useEffect, useRef, useState } from "react";

import { isIframe } from "@cxr/config";
import { useFullScreen } from "@cxr/providers/FullScreenProvider";

import { OctoSdkPanel } from "./OctoSdkPanel";
import type { OctoSheetProps } from "./OctoSheet";

/** Props for {@link OctoCountdownStrip}. */
export interface OctoCountdownStripProps extends OctoSheetProps {
  /** `"100"` = 320×100 strip below the bar; `"50"` = 320×50 strip replacing the bar. */
  variant: "100" | "50";
}

let stripSeq = 0;

/**
 * Render the short-format Octo countdown strip.
 *
 * @param props - {@link OctoCountdownStripProps}
 * @returns The strip, or `null` when GenAI is not allowed / no video.
 */
export function OctoCountdownStrip({
  instanceId,
  videoId,
  brandId,
  isActive,
  variant,
}: OctoCountdownStripProps): React.JSX.Element | null {
  const { enterFullScreen } = useFullScreen();

  // Stable panel id so the lifecycle listener can filter to this strip.
  const panelIdRef = useRef<string | null>(null);
  if (panelIdRef.current === null) {
    stripSeq += 1;
    panelIdRef.current = `${instanceId}-octo-strip-${stripSeq}`;
  }
  const panelId = panelIdRef.current;

  const [activationKey, setActivationKey] = useState(0);
  const wasActiveRef = useRef(false);
  // prevPhaseRef must be declared before the activation effect so the reset
  // on re-activation is in scope.
  const prevPhaseRef = useRef<string | null>(null);
  useEffect(() => {
    const wasActive = wasActiveRef.current;
    wasActiveRef.current = isActive;
    if (isActive && !wasActive) {
      setActivationKey((key) => key + 1);
      // Reset stale phase so a fresh SDK session re-emitting countdown→idle
      // doesn't fire enterFullScreen from a prior session's last phase.
      prevPhaseRef.current = null;
    }
  }, [isActive]);

  // Detect the countdown→idle edge and enter fullscreen on completion.
  useEffect(() => {
    const handler = (event: Event) => {
      const { detail } = event as CustomEvent<{ parentOctoPanelId?: string; phase: string }>;
      if (detail?.parentOctoPanelId && detail.parentOctoPanelId !== panelId) return;
      const phase = detail?.phase;
      if (!phase) return;
      const prev = prevPhaseRef.current;
      prevPhaseRef.current = phase;
      if (prev === "countdown" && phase === "idle") {
        if (!isIframe()) enterFullScreen();
      }
    };
    window.addEventListener("genai:octoLifecycle", handler);
    return () => window.removeEventListener("genai:octoLifecycle", handler);
  }, [panelId, enterFullScreen]);

  if (!videoId) return null;

  // 60px = 100px total strip height − ~40px compact control bar above it.
  const heightClass = variant === "100" ? "gencl:h-[60px]" : "gencl:h-full";

  return (
    <div
      data-testid="octo-countdown-strip"
      data-octo-strip-panel-id={panelId}
      className={`gencl:w-full ${heightClass}`}>
      <OctoSdkPanel
        instanceId={instanceId}
        videoId={videoId}
        brandId={brandId}
        renderMode="compact"
        uiDensity="xs"
        isOpen={isActive}
        activationKey={activationKey}
        autoPromptMode="countdown-only"
        parentOctoPanelIdOverride={panelId}
        onLifecyclePhase={() => undefined}
      />
    </div>
  );
}
