"use client";
import { useEffect, useState } from "react";

import { LIGHT_OVERLAY_40 } from "./player-control-size";

/** How long the ring stays white after a volume change before fading to its idle color. */
const IDLE_DELAY_MS = 2000;
const FADE_DURATION_MS = 500;
/** Cap just short of a full circle — `strokeLinecap="round"` on a fully-closed
 * dasharray draws an overlapping seam at the start/end join. Visually identical
 * to 100% at any of our sizes (sub-degree gap), no seam artifact. */
const MAX_STROKE_PCT = 99.9;

/**
 * Volume-percentage arc filling the gap between the outer and inner control
 * circles. Rendered as an SVG stroked circle (not `conic-gradient`) so both
 * ends of the arc get a rounded cap, per Figma — a conic-gradient can only
 * produce a flat, hard-edged cut. White right after a change; fades to
 * `LIGHT_OVERLAY_40` if left untouched for 2s. Any further volume change
 * snaps it back to white and restarts the 2s countdown.
 */
export function VolumeRing({ volPct, inner, outer }: { volPct: number; inner: number; outer: number }) {
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    setIdle(false);
    const timer = setTimeout(() => setIdle(true), IDLE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [volPct]);

  // Ring lives centered in the outer/inner gap: stroke thickness spans that
  // gap, and the circle's radius sits at the gap's midline so the stroke's
  // outer edge meets `outer` and inner edge meets `inner`.
  const strokeWidth = (outer - inner) / 2;
  const radius = (outer - strokeWidth) / 2;
  const center = outer / 2;
  const circumference = 2 * Math.PI * radius;
  const drawnPct = Math.min(volPct, MAX_STROKE_PCT);
  const dashOffset = circumference * (1 - drawnPct / 100);

  const circleProps = {
    cx: center,
    cy: center,
    r: radius,
    fill: "none",
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeDasharray: circumference,
    strokeDashoffset: dashOffset,
    // Start at 12 o'clock, sweep clockwise — matches the old conic-gradient's convention.
    transform: `rotate(-90 ${center} ${center})`,
  };

  return (
    <svg
      width={outer}
      height={outer}
      viewBox={`0 0 ${outer} ${outer}`}
      className="gencl:absolute gencl:inset-0 gencl:pointer-events-none">
      <circle
        {...circleProps}
        stroke="#ffffff"
        style={{
          opacity: idle ? 0 : 1,
          transition: `opacity ${FADE_DURATION_MS}ms ease-out`,
        }}
      />
      <circle
        {...circleProps}
        stroke={LIGHT_OVERLAY_40}
        style={{
          opacity: idle ? 1 : 0,
          transition: `opacity ${FADE_DURATION_MS}ms ease-out`,
        }}
      />
    </svg>
  );
}
