import { Skeleton } from "@genuin/ui/components/skeleton";
import { cn } from "@genuin/ui/lib/utils";

/**
 * Loading skeleton shown in the expand view's linkout slot while the linkout
 * is still resolving — either its lazy chunk (cold-chunk case: tile linkout
 * off + expand on) or, more commonly, its own internal pre-paint / appear-delay
 * window inside `<Linkouts>` (the tile pre-warms the chunk, so the outer
 * Suspense boundary usually never suspends). Without it that window rendered
 * nothing, reading as "linkout is missing" rather than "linkout is loading".
 *
 * SHAPE FOLLOWS THE CARRIED STATE: the linkout reveal state carries from the
 * tile into the expand view (see linkouts-dynamic.tsx's "expand always carries"
 * reset logic), so the skeleton mirrors the real `LinkCard` for whatever state
 * the user left the tile in — same radius, thumb size and CTA-pill placement
 * (see link-card.tsx). That keeps the swap to the real card jump-free.
 *
 * OUTER CONTAINER: the chip (pl-xs/pl-sml) is itself a floating pill with its
 * own `bg-secondary-900/50` background — LinkCard's `default`/`expand-view`
 * cards have NO background of their own (only `p-2 rounded-lg`); that
 * translucent backdrop normally comes from the SnapSheet chrome wrapping them
 * (see `expandPanelClassName` in linkouts-sheet-config.ts), which doesn't
 * exist yet while this fallback is showing (it's what's still loading). So
 * both the `default` and rich-card branches get the SAME floating-chip
 * background here — otherwise those two states would render as bare skeleton
 * blocks with no boundary, inconsistent with the chip's contained look.
 */
export function LinkoutLoadingIndicator({ state }: { state?: string | null }) {
  const floatingChrome = "gencl:rounded-lg gencl:bg-secondary-900/50 gencl:backdrop-blur-sm";

  // Chip (pl-xs 32px / pl-sml 40px) — translucent pill holding a 24px thumb
  // (pl-sml only) + title. No chevron block (the trailing arrow doesn't need one).
  if (state === "pl-xs" || state === "pl-sml") {
    const isSml = state === "pl-sml";
    return (
      <div
        aria-hidden
        data-testid="linkout-loading-indicator"
        className={cn(
          "gencl:flex gencl:w-full gencl:items-center gencl:gap-2 gencl:px-2",
          floatingChrome,
          isSml ? "gencl:h-10" : "gencl:h-8"
        )}>
        {isSml && <Skeleton className="gencl:size-6 gencl:shrink-0 gencl:rounded" />}
        <Skeleton className="gencl:h-4 gencl:flex-1 gencl:rounded" />
      </div>
    );
  }

  // Rich card (expand-view / panel-view / full-view) — title, then a row of an
  // 84px thumb + a details column. The CTA pill sits INSIDE that column beside
  // the thumb (bottom-aligned via `mt-auto`), matching LinkCard's inline-CTA
  // layout (link-card.tsx `ctaFitsInline` branch) — NOT below the whole row.
  if (state === "expand-view" || state === "panel-view" || state === "full-view") {
    return (
      <div
        aria-hidden
        data-testid="linkout-loading-indicator"
        className={cn("gencl:flex gencl:w-full gencl:flex-col gencl:gap-2 gencl:p-2", floatingChrome)}>
        <Skeleton className="gencl:h-5 gencl:w-3/5 gencl:rounded-md" />
        <div className="gencl:grid gencl:grid-cols-[auto_1fr] gencl:gap-2">
          {/* Inline px (not a `size-[84px]` arbitrary class) — arbitrary gencl
              utilities aren't in the prebuilt CSS, so they collapse to 0; this
              mirrors how LinkCard sizes its own thumb. */}
          <Skeleton className="gencl:shrink-0 gencl:rounded-lg" style={{ width: 84, height: 84 }} />
          <div className="gencl:flex gencl:min-w-0 gencl:flex-col gencl:gap-1">
            <Skeleton className="gencl:h-3 gencl:w-full gencl:rounded" />
            <Skeleton className="gencl:h-3 gencl:w-4/5 gencl:rounded" />
            {/* CTA pill beside the thumb, pushed to the column's bottom edge. */}
            <Skeleton className="gencl:mt-auto gencl:h-10 gencl:w-full gencl:rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  // Default / default-active (and any unknown state) — 64/84px thumb + title
  // line + full-width `h-10` CTA pill. `default` is the `expand-mobile`
  // initialState, so this is also the fresh-open shape. Inline px for the
  // thumb (see the rich-card branch above re: arbitrary gencl classes).
  const thumbPx = state === "default-active" ? 84 : 64;
  return (
    <div
      aria-hidden
      data-testid="linkout-loading-indicator"
      className={cn("gencl:grid gencl:w-full gencl:grid-cols-[auto_1fr] gencl:gap-2 gencl:p-2", floatingChrome)}>
      <Skeleton className="gencl:shrink-0 gencl:rounded-lg" style={{ width: thumbPx, height: thumbPx }} />
      <div className="gencl:flex gencl:min-w-0 gencl:flex-col gencl:justify-center gencl:gap-2">
        <Skeleton className="gencl:h-5 gencl:w-3/5 gencl:rounded-md" />
        <Skeleton className="gencl:h-10 gencl:w-full gencl:rounded-lg" />
      </div>
    </div>
  );
}
