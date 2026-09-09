import { useState, useEffect, useMemo } from "react";

import { useBaseContext } from "../context";
import { isLinkoutEngaged } from "../molecules/linkout-new/linkout-engagement-marker";

export function useShowLinkouts({
  linkoutId,
  isActive,
  videoId,
}: {
  linkoutId: number | null | undefined;
  isActive: boolean;
  videoId?: string | null;
}) {
  const [showLinkouts, setShowLinkouts] = useState(false);
  const { brandDetails, baseEventBus } = useBaseContext();

  const linkoutDelayConfig = useMemo(() => {
    return {
      appearAfter: brandDetails?.web_configs?.linkout_delay?.appear_after ?? 0,
      type: brandDetails?.web_configs?.linkout_delay?.type ?? 1,
    };
  }, [brandDetails]);

  useEffect(() => {
    if (!isActive || !linkoutId) {
      setShowLinkouts(false);
      return;
    }

    // Reveal immediately (no delay) if already engaged (re-hiding what the user
    // opened reads as broken) or if the config opts out of the delay (type 2).
    if (isLinkoutEngaged(baseEventBus, videoId) || linkoutDelayConfig.type === 2) {
      setShowLinkouts(true);
      return;
    }

    const timeoutId = setTimeout(() => {
      setShowLinkouts(true);
    }, linkoutDelayConfig.appearAfter * 1000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isActive, linkoutId, linkoutDelayConfig, baseEventBus, videoId]);

  // Engagement can happen after the delay timer armed (deps unchanged), which the
  // timer alone can't catch. Listen for the sheet events both engage actions emit
  // and reveal. Only flips ON.
  useEffect(() => {
    if (!isActive || !linkoutId) return;
    const revealIfEngaged = () => {
      if (isLinkoutEngaged(baseEventBus, videoId)) setShowLinkouts(true);
    };
    revealIfEngaged(); // catch engagement that landed before this subscribed
    baseEventBus.on("sheetContentTypeChange", revealIfEngaged);
    baseEventBus.on("sheetStateChange", revealIfEngaged);
    return () => {
      baseEventBus.off("sheetContentTypeChange", revealIfEngaged);
      baseEventBus.off("sheetStateChange", revealIfEngaged);
    };
  }, [isActive, linkoutId, baseEventBus, videoId]);

  return { showLinkouts };
}
