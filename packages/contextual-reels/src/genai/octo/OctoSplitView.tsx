"use client";
/**
 * OctoSplitView — the 300×250 non-fullscreen Octo experience.
 *
 * Octo overlays the full-size player rather than splitting the container: the
 * player keeps playing at full size and clicking the video background expands
 * to fullscreen, while this Octo overlay stays interactable on top. To preserve
 * that, the view does NOT publish an octo fraction (`octoFraction` stays 0), so
 * `splitActive` is false and VideoLayout leaves the player full-size + its
 * expand click-overlay enabled. Octo is locked to a full-view conversation: it
 * mounts the SDK panel directly (no DynamicSheet, no state ladder) and
 * auto-prompts in `mode: "full"`. Lifecycle phases are ignored for layout.
 */
import { isGenAiAllowed } from "@cxr/config";
import { useEffect, useRef, useState } from "react";

import { OctoSdkPanel } from "./OctoSdkPanel";
import type { OctoSheetProps } from "./OctoSheet";

/**
 * Render the 300×250 Octo overlay column.
 *
 * @param props - {@link OctoSheetProps} (the dispatcher forwards all sheet props)
 * @returns The Octo SDK overlay, or `null` when GenAI is not allowed / no video.
 */
export function OctoSplitView({
  instanceId,
  videoId,
  brandId,
  isActive,
  tagId,
}: OctoSheetProps): React.JSX.Element | null {
  // Monotonic activation key for SDK destroy+reinit on reel re-activation.
  const [activationKey, setActivationKey] = useState(0);
  const wasActiveRef = useRef(false);
  useEffect(() => {
    const wasActive = wasActiveRef.current;
    wasActiveRef.current = isActive;
    if (isActive && !wasActive) setActivationKey((key) => key + 1);
  }, [isActive]);

  if (!videoId) return null;
  if (!isGenAiAllowed(tagId)) return null;

  const isOpen = isActive;

  return (
    <div data-testid="octo-split-view" className="gencl:h-full gencl:w-full">
      <OctoSdkPanel
        instanceId={instanceId}
        videoId={videoId}
        brandId={brandId}
        renderMode="full"
        uiDensity="xs"
        isOpen={isOpen}
        activationKey={activationKey}
        autoPromptMode="full"
        onLifecyclePhase={() => undefined}
      />
    </div>
  );
}
