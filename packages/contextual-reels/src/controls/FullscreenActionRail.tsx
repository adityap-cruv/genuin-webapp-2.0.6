"use client";
import React from "react";

import { ShareIcon, SparkIcon } from "@genuin/ui/icons";

import type { ControlLayerVariant } from "@cxr/controls/control-layer.types";
import type { NormalisedReel, TagResponse } from "@cxr/types";
import { copyToClipboard, openShareLink } from "@cxr/utils/share";

/** Matches DefaultTopBar's `xl`-size ghost button shell (bg blur + size + padding). */
const iconButtonCls =
  "gencl:border-0 gencl:rounded-full gencl:cursor-pointer gencl:flex gencl:items-center gencl:justify-center " +
  "gencl:bg-[#00000066] gencl:backdrop-blur-[10px] gencl:w-12 gencl:h-12 gencl:p-2.5";

/**
 * Fullscreen-only action rail (spark?, share?) — `default` variant only.
 *
 * Rendered at the feed backdrop level — NOT inside the Embla/video subtree — because
 * Embla applies a CSS `transform` to its slide container, which would trap a
 * `position:fixed` descendant relative to the transformed box instead of the viewport.
 * Mounting here lets the rail sit in the black margin to the right of the 9:16 video box,
 * matching the design.
 *
 * The `iheart` variant renders nothing here — its mute/play/expand controls already
 * live in {@link DefaultTopBar} for fullscreen.
 *
 * `show_spark`/`show_share` from the tag config gate the buttons. Clicks stop
 * propagation so they never reach the underlying video/backdrop.
 *
 * @param config  the tag-level config controlling button visibility
 */
export function FullscreenActionRail({
  config,
  variant,
  item,
}: {
  config: TagResponse["config"];
  variant?: ControlLayerVariant;
  item?: NormalisedReel;
}): React.JSX.Element | null {
  if (variant === "iheart") return null;
  if (!config?.show_spark && !config?.show_share) return null;

  const shareUrl = item?.video?.share_string;

  return (
    <div data-testid="fullscreen-action-rail" className="gencl:flex gencl:flex-col gencl:items-center gencl:gap-2">
      {config?.show_spark && (
        <button
          data-testid="bottombar-spark"
          aria-label="Spark"
          className={iconButtonCls}
          onClick={(e) => {
            e.stopPropagation();
            openShareLink(shareUrl);
          }}>
          <SparkIcon theme="dark" size="lg" />
        </button>
      )}
      {config?.show_share && (
        <button
          data-testid="bottombar-share"
          aria-label="Share"
          className={iconButtonCls}
          onClick={(e) => {
            e.stopPropagation();
            void copyToClipboard(shareUrl ?? "");
          }}>
          <ShareIcon theme="dark" size="lg" />
        </button>
      )}
    </div>
  );
}
