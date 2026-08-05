import { cn } from "@genuin/ui/lib/utils";
import { SPONSORED_TAG_SIZE, type PlayerControlSize } from "@genuin/ui/player-controls";

import type { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";

type SponsoredVideo = NonNullable<PostDetailsType>["video"];

/**
 * Sponsored posts are flagged on two independent axes depending on which layout
 * the backend assigned: `cardLayoutId` 7 or `videoLayoutId` 6. Both mean the same
 * thing to the player, so every position must test both or the pill appears on
 * some tiles and not others.
 */
export function isSponsoredVideo(video: SponsoredVideo): boolean {
  return video?.cardLayoutId === 7 || video?.videoLayoutId === 6;
}

/**
 * Design System V2 "Sponsored" pill — white, blurred, size-token driven.
 *
 * Rendered in three positions, exactly one at a time:
 * - the iheart tile header row, positioned by CSS alone: with artwork/title/
 *   description present it's the row's last child (`justify-between` pushes it
 *   right); with none of them it's the row's only child (pushed left instead) —
 *   see iheart-embed.tsx, no separate condition needed for which slot it takes
 * - the tile's top-left corner, when the iheart header isn't rendered at all
 *   (embed-tile.tsx) — non-iheart brands, or an iheart tile too narrow to show one
 * - inline before the meta row in expand view
 *
 * `shrink-0` matters for the inline case: the pill must keep its full width while
 * the neighbouring title/description truncates, otherwise the label wraps mid-word.
 */
export function SponsoredTag({ size, className }: { size: PlayerControlSize; className?: string }) {
  const dimensions = SPONSORED_TAG_SIZE[size];

  return (
    <div
      className={cn(
        // `text-black`, not `text-gray-900`: the prebuilt gencl: CSS the SDK ships
        // has no gray text utilities, so gray-900 leaves the label inheriting the
        // white overlay colour — invisible on the white pill.
        "gencl:bg-white gencl:rounded-3xl gencl:flex-center gencl:text-black gencl:shrink-0 gencl:px-2! gencl:py-1!",
        className
      )}
      style={{
        backdropFilter: "blur(7.5px)",
        width: dimensions.width,
        height: dimensions.height,
      }}>
      <p className={dimensions.text}>Sponsored</p>
    </div>
  );
}
