"use client";

import { cn } from "@genuin/ui/lib/utils";
import { useLayoutEffect, useRef, useState } from "react";

/**
 * Placeholder AI response block.
 *
 * Renders the canonical "Meaningful Holiday Gifts" sample from the
 * Figma reference (node 8316:41382) — a title + three numbered
 * sections of bulleted text with mixed plain/linked items. Fills
 * its container (`width: 100%; height: 100%`).
 *
 * **Auto-scaling text.** The text content auto-grows its font
 * size so it fills the full vertical space of the host. A
 * `ResizeObserver` watches the container; on every change we
 * reset the scale, measure the natural (base-size) content
 * height, then set a `--ai-fs-scale` CSS variable that every
 * text element multiplies into its own `font-size` /
 * `line-height` via `calc()`. The carousel's "fits" decision
 * is based on the unscaled natural height (so showing the
 * carousel doesn't fight the scaling), and the scale targets
 * `containerHeight − carouselHeight` when the carousel is
 * visible. Scale is clamped to `[1, 2.5]`.
 *
 * Per Figma [node 8316:41382](https://www.figma.com/design/31vZmmekJ2UDRkvvv6EUIR/Genuin-Master-Design-System-V2?node-id=8316-41382&m=dev)
 * (text) and [node 8316:44497](https://www.figma.com/design/31vZmmekJ2UDRkvvv6EUIR/Genuin-Master-Design-System-V2?node-id=8316-44497&m=dev)
 * (video carousel).
 */
const CAROUSEL_CARD_HEIGHT = 320;
const CAROUSEL_TOP_GAP = 16;
const CAROUSEL_TOTAL_HEIGHT = CAROUSEL_CARD_HEIGHT + CAROUSEL_TOP_GAP;

const MIN_SCALE = 1;
const MAX_SCALE = 2.5;

/** Scaled-size helper. Returns inline-style values that multiply
 *  `--ai-fs-scale` (defaulting to 1) into the font-size and
 *  line-height. Keeps the typography rules in one place so the
 *  base sizes match Figma — `Headline 4 Medium` = 20/24,
 *  `Body 0 Medium / Semi Bold` = 16/22. */
function scaledFont(fontSize: number, lineHeight: number) {
  return {
    fontSize: `calc(${fontSize}px * var(--ai-fs-scale, 1))`,
    lineHeight: `calc(${lineHeight}px * var(--ai-fs-scale, 1))`,
  };
}
function scaledGap(px: number) {
  return `calc(${px}px * var(--ai-fs-scale, 1))`;
}

export function AiResponse({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textContentRef = useRef<HTMLDivElement>(null);
  const [showCarousel, setShowCarousel] = useState(false);

  useLayoutEffect(() => {
    const containerEl = containerRef.current;
    const textEl = textContentRef.current;
    if (!containerEl || !textEl) return;

    const update = () => {
      // Reset to base scale, force a synchronous layout, measure
      // the unscaled content height. The scrollHeight is stable
      // because the inner wrapper isn't a scroll container — its
      // own size equals the natural content height.
      textEl.style.setProperty("--ai-fs-scale", "1");
      const naturalH = textEl.scrollHeight;
      const containerH = containerEl.clientHeight;
      if (naturalH <= 0 || containerH <= 0) return;

      const fitsCarousel = naturalH + CAROUSEL_TOTAL_HEIGHT <= containerH;
      setShowCarousel(fitsCarousel);

      const availableH = fitsCarousel ? containerH - CAROUSEL_TOTAL_HEIGHT : containerH;
      const target = Math.min(MAX_SCALE, Math.max(MIN_SCALE, availableH / naturalH));
      textEl.style.setProperty("--ai-fs-scale", String(target));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(containerEl);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      data-slot="ai-response"
      className={cn(
        "gencl:w-full gencl:h-full gencl:flex gencl:flex-col gencl:overflow-hidden",
        "gencl:text-secondary-900 gencl:font-[Inter,sans-serif]",
        className
      )}>
      <div className="gencl:flex-1 gencl:min-h-0 gencl:overflow-y-auto gencl:overflow-x-hidden">
        <div ref={textContentRef}>
          <TextContent />
        </div>
      </div>
      {showCarousel && (
        <div
          className="gencl:shrink-0 gencl:overflow-x-auto gencl:overflow-y-hidden"
          style={{ marginTop: CAROUSEL_TOP_GAP }}>
          <VideoCarousel />
        </div>
      )}
    </div>
  );
}

// ── Text content ─────────────────────────────────────────────────

function TextContent() {
  return (
    <div className="gencl:flex gencl:flex-col gencl:items-start gencl:w-full" style={{ gap: scaledGap(16) }}>
      <h2 className="gencl:text-secondary-900 gencl:w-full gencl:font-medium" style={scaledFont(20, 24)}>
        🎁 Meaningful Holiday Gifts for Friends & Family This Season
      </h2>

      {/* Section 1 ----------------------------------------------- */}
      <div className="gencl:flex gencl:flex-col gencl:w-full" style={{ gap: scaledGap(8) }}>
        <ol
          start={1}
          className="gencl:list-decimal gencl:pl-6 gencl:w-full gencl:text-secondary-900 gencl:font-semibold"
          style={scaledFont(16, 22)}>
          <li>Personalized Gifts</li>
        </ol>
        <ul className="gencl:list-disc gencl:pl-6 gencl:w-full gencl:flex gencl:flex-col" style={{ gap: scaledGap(4) }}>
          <li className="gencl:font-medium" style={scaledFont(16, 22)}>
            <span className="gencl:text-secondary-500">Personalized photo archive </span>
            <ResponseLink href="#">Custom photo book & Albums↗</ResponseLink>
          </li>
          <li className="gencl:text-secondary-600 gencl:font-medium" style={scaledFont(16, 22)}>
            Personalized necklace or birth-flower jewelry
          </li>
        </ul>
      </div>

      {/* Section 2 ----------------------------------------------- */}
      <div className="gencl:flex gencl:flex-col gencl:w-full" style={{ gap: scaledGap(8) }}>
        <ol
          start={2}
          className="gencl:list-decimal gencl:pl-6 gencl:w-full gencl:text-secondary-900 gencl:font-semibold"
          style={scaledFont(16, 22)}>
          <li>{"Experience Gifts (Memories > Objects)"}</li>
        </ol>
        <ul className="gencl:list-disc gencl:pl-6 gencl:w-full gencl:flex gencl:flex-col" style={{ gap: scaledGap(4) }}>
          <li className="gencl:text-secondary-600 gencl:font-medium" style={scaledFont(16, 22)}>
            Cooking class or pottery workshop
          </li>
          <li className="gencl:font-medium" style={scaledFont(16, 22)}>
            <span className="gencl:text-secondary-600">Concert or theater tickets </span>
            <ResponseLink href="#">Go to ticketmaster↗</ResponseLink>
          </li>
          <li className="gencl:text-secondary-600 gencl:font-medium" style={scaledFont(16, 22)}>
            Spa day or wellness class
          </li>
        </ul>
      </div>

      {/* Section 3 ----------------------------------------------- */}
      <div className="gencl:flex gencl:flex-col gencl:w-full" style={{ gap: scaledGap(8) }}>
        <ol
          start={3}
          className="gencl:list-decimal gencl:pl-6 gencl:w-full gencl:text-secondary-900 gencl:font-semibold"
          style={scaledFont(16, 22)}>
          <li>Cozy & Comfort Gifts</li>
        </ol>
        <ul className="gencl:list-disc gencl:pl-6 gencl:w-full gencl:flex gencl:flex-col" style={{ gap: scaledGap(4) }}>
          <li className="gencl:font-medium" style={scaledFont(16, 22)}>
            <span className="gencl:text-secondary-600">Custom illustration of a family or pet </span>
            <ResponseLink href="#">(Etsy)</ResponseLink>
          </li>
          <li className="gencl:text-secondary-600 gencl:font-medium" style={scaledFont(16, 22)}>
            Soft blanket or cozy slippers
          </li>
          <li className="gencl:text-secondary-600 gencl:font-medium" style={scaledFont(16, 22)}>
            Engraved cutting board or kitchen item
          </li>
          <li className="gencl:font-medium" style={scaledFont(16, 22)}>
            <span className="gencl:text-secondary-600">Matching pajamas </span>
            <ResponseLink href="#">Shop Matching Pajamas at Old Navy↗</ResponseLink>
          </li>
          <li className="gencl:text-secondary-600 gencl:font-medium" style={scaledFont(16, 22)}>
            Board games or card games
          </li>
        </ul>
      </div>
    </div>
  );
}

function ResponseLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="gencl:underline gencl:decoration-solid"
      style={{ color: "#0645ff" }}>
      {children}
    </a>
  );
}

// ── Video carousel ───────────────────────────────────────────────
//
// Placeholder for now — gray cards with the Figma layout (top
// metadata band + bottom date / CTA / dots band). Real wiring to
// `<VideoPlayer>` + linkout overlays would replace the inner
// surface. Card sizing is fixed (NOT scaled with the text) since
// the carousel is bounded by `CAROUSEL_CARD_HEIGHT` in the
// `showCarousel` predicate above.

const CAROUSEL_PLACEHOLDER_CARDS = 5;

function VideoCarousel() {
  return (
    <div className="gencl:flex gencl:gap-2">
      {Array.from({ length: CAROUSEL_PLACEHOLDER_CARDS }).map((_, i) => (
        <CarouselCard key={i} />
      ))}
    </div>
  );
}

function CarouselCard() {
  return (
    <div
      className="gencl:relative gencl:shrink-0 gencl:rounded-lg gencl:overflow-hidden gencl:bg-secondary-700"
      style={{ width: 180, height: CAROUSEL_CARD_HEIGHT }}>
      {/* Top overlay: cover + title/subtitle + clips count */}
      <div
        className="gencl:absolute gencl:top-0 gencl:left-0 gencl:right-0 gencl:flex gencl:flex-col gencl:gap-1 gencl:p-2 gencl:rounded-t-lg"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 100%)",
        }}>
        <div className="gencl:flex gencl:gap-2 gencl:items-start gencl:w-full">
          {/* Cover image placeholder — gradient stand-in for the
              podcast tile art in Figma. */}
          <div
            className="gencl:shrink-0 gencl:rounded-md"
            style={{
              width: 32,
              height: 32,
              background: "linear-gradient(135deg, #4a90e2 0%, #f5a623 100%)",
              boxShadow: "0px 1px 3px 0px rgba(0,0,0,0.15)",
            }}
          />
          <div className="gencl:flex gencl:flex-col gencl:flex-1 gencl:min-w-0 gencl:items-start">
            <p
              className="gencl:text-white gencl:font-semibold gencl:truncate gencl:overflow-hidden gencl:w-full"
              style={{ fontSize: 8, lineHeight: "12px" }}>
              Title
            </p>
            <p
              className="gencl:text-white gencl:font-medium gencl:overflow-hidden gencl:w-full"
              style={{
                fontSize: 8,
                lineHeight: "12px",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}>
              Subtitle Using placeholders instead of standard text boxes ensures that the layout remains consistent even
              if the text is changed later
            </p>
          </div>
        </div>
        <p className="gencl:text-white gencl:font-semibold" style={{ fontSize: 8, lineHeight: "12px" }}>
          9 clips
        </p>
      </div>

      {/* Bottom overlay: clip description + CTA + pagination dots */}
      <div
        className="gencl:absolute gencl:bottom-0 gencl:left-0 gencl:right-0 gencl:flex gencl:flex-col gencl:gap-2 gencl:px-2 gencl:pb-1 gencl:pt-2 gencl:rounded-b-lg"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 100%)",
        }}>
        <p
          className="gencl:text-white gencl:font-medium gencl:overflow-hidden"
          style={{
            fontSize: 10,
            lineHeight: "14px",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}>
          Jan 6 • 1 min 30s • Short clip description Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </p>
        <div
          className="gencl:flex gencl:flex-col gencl:items-end gencl:overflow-hidden gencl:w-full"
          style={{ backdropFilter: "blur(5px)" }}>
          <div
            className="gencl:flex gencl:items-center gencl:justify-center gencl:w-full gencl:rounded-lg"
            style={{
              height: 32,
              padding: "2px 8px",
              background: "rgba(19, 20, 21, 0.5)",
            }}>
            <p
              className="gencl:text-white gencl:font-semibold gencl:text-center gencl:truncate gencl:w-full"
              style={{ fontSize: 12, lineHeight: "16px" }}>
              Sign Up Now
            </p>
          </div>
          <div className="gencl:flex gencl:items-center gencl:justify-center gencl:gap-1 gencl:w-full gencl:py-1">
            <span
              className="gencl:rounded-full"
              style={{
                width: 6,
                height: 6,
                background: "#dfe1e3",
              }}
            />
            <span className="gencl:rounded-full" style={{ width: 6, height: 6, background: "#767b81" }} />
            <span className="gencl:rounded-full" style={{ width: 6, height: 6, background: "#767b81" }} />
            <span className="gencl:rounded-full" style={{ width: 6, height: 6, background: "#767b81" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
