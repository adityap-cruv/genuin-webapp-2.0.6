"use client";

import { useEffect, useMemo, useState } from "react";

import { useBaseContext } from "@genuin/components/context";
import type { LinkData } from "@genuin/components/react-query/api/linkouts/schema";

import { LinkCard, type LinkMetaData } from "./link-card";
import { GATED_REVEAL_STATES, type GatedRevealState } from "./linkout-expand-gate";

/** What the well reports back per measurement pass. */
export type LinkoutWellMeasurement = {
  /** Tallest link's BODY height per gated state (chrome not included). */
  bodyPxByState: Record<GatedRevealState, number>;
};

/**
 * Off-screen measurement well for the 50%-height reveal gate.
 *
 * `snap-sheet` only measures the *active* state, so a would-be `default` /
 * `default-active` / `expand-view` height is unknown until it's visited (which
 * would flash on screen). This renders every link's card in each gated state
 * hidden, at the real panel width, and reports back the TALLEST body height PER
 * STATE — so the host can decide whether promoting into a given state fits
 * *before* the transition happens. (A long CTA label no longer gates anything:
 * it marquees in place instead of demoting the state; GEN-10465.)
 *
 * Hidden but laid out (`visibility: hidden`, not `display: none`) so the cards
 * measure real heights/widths; `aria-hidden` + `pointer-events: none` keep it inert.
 *
 * Measurement uses a callback-ref-into-state + a one-shot read (re-run once
 * `document.fonts.ready` settles for late font swap) — deliberately no
 * `ResizeObserver` and no `useRef`, per repo convention. Height here is driven
 * by fixed thumb sizes + text layout, so fonts settling is the only late reflow
 * that matters; images don't change either.
 */
export function LinkoutExpandHeightWell({
  links,
  theme,
  widthPx,
  ctaText,
  onMeasure,
}: {
  links: LinkData[];
  theme?: "light" | "dark";
  /** Real panel content width — drives description wrapping / CTA width, so it drives both measurements. */
  widthPx: number;
  /**
   * Page-level CTA label, forwarded to each measured card so its CTA reads
   * EXACTLY what the live card shows (`ctaText || link.title || "Learn more"`,
   * resolved inside `LinkCard`) — keeps the measured card faithful to the live
   * one. The CTA pill is fixed-height, so the label text doesn't change the
   * measured height; this is purely for card fidelity.
   */
  ctaText?: string;
  onMeasure: (measurement: LinkoutWellMeasurement) => void;
}) {
  const { brandDetails } = useBaseContext();
  // Ref-into-state (not `useRef`): the measure effect re-runs when the node
  // attaches, mirroring the repo's callback-ref measurement pattern.
  const [node, setNode] = useState<HTMLDivElement | null>(null);

  // Same LinkData → LinkMetaData mapping the real body uses (see LinkoutItem),
  // so the measured card is identical to what the sheet will render.
  const linksWithMetadata: LinkMetaData[] = useMemo(
    () =>
      links.map((l) => ({
        link: l.link,
        title: l.title,
        // Must mirror `LinkoutItem` exactly (empty-string image → `undefined`,
        // rendered as the linkout-glyph placeholder) so the measured height
        // matches the rendered card; a mismatch here clips or gaps the sheet.
        image: l.image?.trim() || undefined,
        brand: l.brand ?? brandDetails.name,
        website: l.website ?? brandDetails.website,
        description: l.description ?? undefined,
        originalPrice: l.originalPrice ?? undefined,
        currentPrice: l.currentPrice ?? undefined,
        rating: l.rating ?? undefined,
        likes: l.likes ?? undefined,
        downloads: l.downloads ?? undefined,
        phone: l.phone ?? undefined,
        address: l.address ?? undefined,
      })),
    [links, brandDetails.name, brandDetails.website]
  );

  useEffect(() => {
    if (!node || widthPx <= 0) return;
    let cancelled = false;
    const measure = () => {
      if (cancelled) return;
      const bodyPxByState: Record<GatedRevealState, number> = {
        default: 0,
        "default-active": 0,
        "expand-view": 0,
      };
      node.querySelectorAll<HTMLElement>("[data-well-card]").forEach((card) => {
        const state = card.dataset.wellState as GatedRevealState | undefined;
        if (!state || !(state in bodyPxByState)) return;
        bodyPxByState[state] = Math.max(bodyPxByState[state], card.offsetHeight);
      });
      onMeasure({ bodyPxByState });
    };
    measure();
    // Re-measure once fonts settle (font swap changes wrapped text height). No
    // ResizeObserver — a single promise re-read covers the only late reflow.
    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(measure).catch(() => {});
    }
    return () => {
      cancelled = true;
    };
  }, [node, linksWithMetadata, widthPx, theme, onMeasure]);

  return (
    <div
      ref={setNode}
      aria-hidden
      style={{
        position: "absolute",
        visibility: "hidden",
        pointerEvents: "none",
        top: -99999,
        left: 0,
        width: widthPx,
      }}>
      {GATED_REVEAL_STATES.map((state) =>
        linksWithMetadata.map((data, idx) => (
          <div data-well-card data-well-state={state} key={`${state}-${data.link ?? idx}`}>
            {/* Per-link `cta_text` (Button text on the Add Link form) overrides the
                page-level `ctaText`, matching `resolveCtaText` in `linkouts-dynamic.tsx`. */}
            <LinkCard data={data} sheetState={state} theme={theme} ctaText={links[idx]?.cta_text || ctaText} />
          </div>
        ))
      )}
    </div>
  );
}
