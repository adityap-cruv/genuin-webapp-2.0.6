"use client";

import { Image } from "@genuin/ui/components/image";
import { Text } from "@genuin/ui/components/typography";
import { cn } from "@genuin/ui/lib/utils";
import { Pause, Play } from "lucide-react";
import { useRef, useState } from "react";

import type { IHeartAudioCarouselItem, IHeartAudioCarouselProps } from "./iheart-audio-carousel.types";

/**
 * Equaliser motion for the playing card. A keyframe can't be expressed as a
 * utility class, and the webapp consumes this package's CSS as a PREBUILT
 * bundle that wouldn't include newly-authored `gencl:` utilities — so the
 * animation ships as a literal style block, matching how the other motion in
 * this package is handled. Each bar offsets itself via `--gen-bar-delay`.
 */
const WAVEFORM_CSS = `
@keyframes gen-station-bar {
  0%, 100% { transform: scaleY(0.35); }
  50% { transform: scaleY(1); }
}
.gen-station-bar {
  transform-origin: bottom;
}
.gen-station-bar[data-playing="true"] {
  animation: gen-station-bar 900ms ease-in-out infinite;
  animation-delay: var(--gen-bar-delay, 0ms);
}
@media (prefers-reduced-motion: reduce) {
  .gen-station-bar[data-playing="true"] { animation: none; }
}
`;

/**
 * Transport palette and bar rhythm, measured from iHeart's own EditorialPlayer embed
 * (`iheart.com/artist/<id>/?embed=true&keyid=EditorialPlayer`): a flat `#e6eaed` band with
 * `#c5cdd2` bars 3px wide on a 6px pitch, rounded 1px. These are brand values rather than
 * theme tokens — the `secondary-*` scale is publisher-themed and turns red under some themes,
 * which would wreck the player.
 */
const BAND_COLOR = "#e6eaed";
const BAR_COLOR = "#c5cdd2";
const PLAY_COLOR = "#26262b";
const BAR_WIDTH = 3;
const BAR_GAP = 3;
/**
 * How far the play button and artwork sit from the card's edges.
 *
 * Deliberately much smaller than the card's `p-3` text padding. The band is full-bleed, so this
 * inset is the width of the grey stub left stranded beside the button's white ring: at 12px it
 * reads as a stray rectangle, while at ~4px the ring reaches the card edge and terminates the
 * band cleanly. iHeart uses 3.5px against a 60px button — 6% — which is what this mirrors.
 */
const CONTROL_INSET = 4;

/**
 * Transport geometry, in proportion to the play button. The ratios come from the reference
 * player, where a 60px button pairs with a 38px band, a 30px waveform, and a 68px overall row —
 * so the whole transport rescales from one prop instead of five hand-tuned numbers.
 */
function getBarCount(cardWidth: number, playButtonSize: number, imageSize: number) {
  const available = cardWidth - CONTROL_INSET * 2 - playButtonSize - BAR_GAP - imageSize;
  return Math.max(0, Math.floor((available + BAR_GAP) / (BAR_WIDTH + BAR_GAP)));
}

function getTransportMetrics(playButtonSize: number) {
  const bandHeight = Math.round(playButtonSize * 0.63);
  const height = Math.round(playButtonSize * 1.13);
  return {
    bandHeight,
    height,
    /** The bars occupy everything above the band. */
    waveHeight: height - bandHeight,
    /** Button and artwork bottoms sit just inside the band, not flush with it. */
    controlBottom: Math.round(playButtonSize * 0.09),
  };
}

/**
 * Deterministic pseudo-random amplitudes for a station with no supplied samples.
 * Seeded from the id so a card's silhouette is stable across renders and matches
 * between server and client — a `Math.random()` fill would hydrate mismatched.
 */
function deriveWaveform(id: string, barCount: number): number[] {
  let seed = 0;
  for (let index = 0; index < id.length; index += 1) {
    seed = (seed * 31 + id.charCodeAt(index)) % 2147483647;
  }

  return Array.from({ length: barCount }, (_, index) => {
    seed = (seed * 1103515245 + 12345) % 2147483647;
    const normalized = (seed / 2147483647 + 1) % 1;
    // Taper the ends so the run reads as a clip rather than a flat block.
    const edgeFalloff = Math.sin((Math.PI * (index + 1)) / (barCount + 1));
    return 0.18 + normalized * 0.82 * (0.45 + edgeFalloff * 0.55);
  });
}

/**
 * The iHeart brand mark (heart + broadcast arcs), traced from iHeart's own
 * navigation logotype so the silhouette is the real one. Inlined here rather
 * than added to `@genuin/ui/icons`: this is the only consumer, and that package
 * is a COMPOSITE project reference, so a new icon there would not resolve until
 * `@genuin/ui` is rebuilt.
 *
 * The viewBox is wider than tall — size it by height and let width follow.
 */
function IHeartMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 29 24"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("gencl:h-4 gencl:w-auto gencl:fill-secondary-300", className)}>
      <path d="M25.8641 8.73934C25.8641 10.8613 24.7147 12.953 22.4487 14.9575C22.3487 15.0458 22.224 15.089 22.0999 15.089C21.9551 15.089 21.8105 15.0298 21.7064 14.9125C21.5139 14.6958 21.5335 14.3643 21.7515 14.1716C23.7826 12.3758 24.8126 10.548 24.8126 8.73934V8.71394C24.8126 7.24592 23.8897 5.5178 22.7114 4.78055C22.4653 4.62649 22.3912 4.30248 22.5457 4.05742C22.6998 3.81178 23.0245 3.73773 23.2707 3.89129C24.7486 4.81713 25.8641 6.89067 25.8641 8.71394V8.73934ZM19.0392 13.167C18.958 13.2124 18.8699 13.2339 18.7824 13.2339C18.5983 13.2339 18.4196 13.1371 18.3231 12.9656C18.1816 12.7127 18.2718 12.3928 18.5256 12.2515C19.7428 11.5711 20.5615 10.2491 20.5646 8.95867C20.562 7.77273 19.9066 6.69347 18.8529 6.14033C18.5957 6.0052 18.4969 5.68813 18.6322 5.43155C18.7676 5.17532 19.0856 5.07653 19.3425 5.21131C20.7407 5.94503 21.6103 7.3767 21.6166 8.95115V8.9671C21.6099 10.6226 20.5754 12.3085 19.0392 13.167ZM14.8169 11.6252C13.557 11.6246 12.5359 10.6052 12.5359 9.34784C12.5359 8.0905 13.557 7.07115 14.8169 7.07045C16.0768 7.07115 17.0978 8.0905 17.0978 9.34784C17.0978 10.6052 16.0768 11.6246 14.8169 11.6252ZM11.3106 12.9656C11.2141 13.1371 11.0354 13.2339 10.8514 13.2339C10.7638 13.2339 10.6759 13.2124 10.5946 13.167C9.0584 12.3085 8.02385 10.6226 8.01725 8.9671V8.95115C8.0235 7.3767 8.89317 5.94503 10.2912 5.21131C10.5481 5.07653 10.8661 5.17532 11.0015 5.43155C11.1368 5.68813 11.038 6.0052 10.7808 6.14033C9.72712 6.69347 9.07187 7.77273 9.06912 8.95867C9.07231 10.2491 9.89106 11.5711 11.1083 12.2515C11.362 12.3928 11.4522 12.7127 11.3106 12.9656ZM7.92737 14.9125C7.82337 15.0298 7.6786 15.089 7.53392 15.089C7.4097 15.089 7.28516 15.0458 7.18502 14.9575C4.91902 12.953 3.76973 10.8613 3.76973 8.73934V8.71394C3.76973 6.89067 4.88508 4.81713 6.3632 3.89129C6.60925 3.73773 6.93395 3.81178 7.0881 4.05742C7.24269 4.30248 7.16848 4.62649 6.92243 4.78055C5.74402 5.5178 4.82116 7.24592 4.82116 8.71394V8.73934C4.82116 10.548 5.85123 12.3758 7.88227 14.1716C8.10022 14.3643 8.11998 14.6958 7.92737 14.9125ZM21.1597 1.50009C18.5287 1.50009 16.1781 2.89108 14.8169 4.92227C13.4557 2.89108 11.1051 1.50009 8.47415 1.50009C4.28157 1.50009 0.88501 4.88969 0.88501 9.07295C0.88501 11.7271 2.56953 13.6405 4.32942 15.4112L11.2096 21.9023C11.5702 22.2424 12.1636 21.9874 12.1636 21.4923V16.4349C12.1636 14.9717 13.3511 13.7853 14.8169 13.7829C16.2828 13.7853 17.4703 14.9717 17.4703 16.4349V21.4923C17.4703 21.9874 18.0635 22.2424 18.4241 21.9023L25.3044 15.4112C27.0642 13.6405 28.7487 11.7271 28.7487 9.07295C28.7487 4.88969 25.3523 1.50009 21.1597 1.50009Z" />
    </svg>
  );
}

type StationCardProps = {
  station: IHeartAudioCarouselItem;
  isPlaying: boolean;
  cardWidth: number;
  cardHeight: number;
  imageSize: number;
  playButtonSize: number;
  waveformBarCount?: number;
  badge?: IHeartAudioCarouselProps["badge"];
  onPlayToggle?: (station: IHeartAudioCarouselItem, willPlay: boolean) => void;
};

function StationCard({
  station,
  isPlaying,
  cardWidth,
  cardHeight,
  imageSize,
  playButtonSize,
  waveformBarCount,
  badge,
  onPlayToggle,
}: StationCardProps) {
  // A fixed count would clip a partial bar (or leave a gap) at any other card width, so the run
  // is sized to the space between the play button and the artwork unless the caller overrides it.
  const barCount = waveformBarCount ?? getBarCount(cardWidth, playButtonSize, imageSize);
  const bars = station.waveform?.length ? station.waveform : deriveWaveform(station.id, barCount);
  const label = [station.heading, station.subheading].filter(Boolean).join(", ");
  const transport = getTransportMetrics(playButtonSize);

  return (
    <article
      data-slot="station-card"
      data-playing={isPlaying}
      className={cn(
        "gencl:box-border gencl:flex-none gencl:overflow-hidden gencl:rounded-lg",
        // A real BORDER, not `ring-1 ring-inset`. An inset ring is a box-shadow, which paints
        // beneath child content — so the full-bleed band and the play button's white ring drew
        // straight over it and erased the card's edge. A border shrinks the padding box instead,
        // so absolutely-placed children start inside it and can never cover it.
        "gencl:border gencl:border-secondary-200 gencl:bg-white gencl:text-black"
      )}
      style={{ width: cardWidth, height: cardHeight }}>
      <div className="gencl:flex gencl:h-full gencl:flex-col gencl:justify-between gencl:p-3">
        <div className="gencl:flex gencl:items-start gencl:justify-between gencl:gap-2">
          {/* min-w-0 lets the truncated name shrink rather than push the badge out. */}
          <div className="gencl:min-w-0">
            {station.brand && (
              <Text as="p" size="body-4" data-slot="station-card-brand" className="gencl:truncate gencl:text-black">
                {station.brand}
              </Text>
            )}
            <Text asChild size="body-1" weight="semibold">
              <h3 data-slot="station-card-heading" className="gencl:truncate gencl:text-black">
                {station.heading}
              </h3>
            </Text>
            {station.subheading && (
              <Text
                as="p"
                size="body-4"
                data-slot="station-card-subheading"
                className="gencl:truncate gencl:text-black">
                {station.subheading}
              </Text>
            )}
          </div>

          {badge && (
            <span aria-hidden="true" data-slot="station-card-badge" className="gencl:shrink-0 gencl:text-secondary-400">
              {badge}
            </span>
          )}
        </div>

        {/* TRANSPORT — full-bleed (`-mx-3 -mb-3` cancels the card padding) so the tinted band
            reaches both card edges, exactly as iHeart's own player draws it. The band is a flat
            strip anchored to the bottom; the bars stand ON its top edge, and the play button and
            artwork straddle that edge, overlapping the band. */}
        <div
          data-slot="station-card-transport"
          className="gencl:relative gencl:-mx-3 gencl:-mb-3"
          style={{ height: transport.height }}>
          <div
            aria-hidden="true"
            data-slot="station-card-band"
            className="gencl:absolute gencl:inset-x-0 gencl:bottom-0"
            style={{ height: transport.bandHeight, backgroundColor: BAND_COLOR }}
          />

          <div
            aria-hidden="true"
            data-slot="station-card-waveform"
            className="gencl:absolute gencl:flex gencl:items-end gencl:overflow-hidden"
            style={{
              left: CONTROL_INSET + playButtonSize + BAR_GAP,
              right: CONTROL_INSET + imageSize,
              bottom: transport.bandHeight,
              height: transport.waveHeight,
              gap: BAR_GAP,
            }}>
            {bars.map((amplitude, index) => (
              <span
                key={index}
                className="gen-station-bar"
                data-playing={isPlaying}
                style={{
                  width: BAR_WIDTH,
                  flex: "none",
                  borderRadius: 1,
                  backgroundColor: BAR_COLOR,
                  height: `${Math.min(Math.max(amplitude, 0), 1) * 100}%`,
                  ["--gen-bar-delay" as string]: `${(index % 12) * 70}ms`,
                }}
              />
            ))}
          </div>

          <button
            type="button"
            data-slot="station-card-play"
            aria-pressed={isPlaying}
            aria-label={`${isPlaying ? "Pause" : "Play"} ${label}${station.durationLabel ? `, ${station.durationLabel}` : ""}`}
            onClick={() => onPlayToggle?.(station, !isPlaying)}
            className={cn(
              "gencl:absolute gencl:flex gencl:items-center gencl:justify-center gencl:rounded-full",
              // The white ring separates the button from the band it sits on. Kept at 2px so its
              // OUTER edge lands inside the card's own 1px border: the button sits 4px from the
              // edge, so a 4px ring would paint straight over that border and erase the rounded
              // corner. Any increase here needs a matching increase in CONTROL_INSET.
              "gencl:ring-2 gencl:ring-white gencl:transition-[filter] gencl:hover:brightness-150",
              "gencl:focus-visible:outline-none gencl:focus-visible:ring-2 gencl:focus-visible:ring-black"
            )}
            style={{
              left: CONTROL_INSET,
              bottom: transport.controlBottom,
              width: playButtonSize,
              height: playButtonSize,
              backgroundColor: PLAY_COLOR,
              color: "#ffffff",
            }}>
            {isPlaying ? (
              <Pause aria-hidden="true" className="gencl:size-4" fill="currentColor" strokeWidth={0} />
            ) : (
              // Nudged right so the triangle's optical centre sits on the circle's.
              <Play
                aria-hidden="true"
                className="gencl:size-4 gencl:translate-x-px"
                fill="currentColor"
                strokeWidth={0}
              />
            )}
          </button>

          <Image
            src={station.image.src}
            alt={station.image.alt ?? ""}
            handleError
            data-slot="station-card-artwork"
            className="gencl:absolute gencl:rounded-md gencl:object-cover gencl:ring-2 gencl:ring-white"
            style={{
              right: CONTROL_INSET,
              bottom: transport.controlBottom,
              width: imageSize,
              height: imageSize,
            }}
          />
        </div>
      </div>
    </article>
  );
}

/**
 * Horizontally scrollable row of compact audio station cards.
 *
 * Mirrors {@link EventCarousel}'s track, snapping, and sizing contract, but each
 * card's affordance is inline playback rather than a link-out. All cards share a
 * single native audio element, and each item supplies a finite recording URL.
 */
export function IHeartAudioCarousel({
  stations,
  cardWidth = 332,
  cardHeight = 120,
  imageSize = 48,
  playButtonSize = 40,
  waveformBarCount,
  gap = 8,
  ariaLabel = "Stations",
  badge = <IHeartMark />,
  className,
  ...props
}: IHeartAudioCarouselProps) {
  const [playingStationId, setPlayingStationId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const handlePlayToggle = (station: IHeartAudioCarouselItem, willPlay: boolean) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!willPlay) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      setPlayingStationId(null);
      return;
    }

    // Reuse one player so only one recording can play at a time. This call stays
    // in the click handler, preserving the browser's user-gesture permission.
    audio.pause();
    audio.src = station.audioSrc;
    audio.load();
    setPlayingStationId(station.id);
    void audio.play().catch(() => setPlayingStationId(null));
  };
  if (stations.length === 0) return null;

  return (
    <section aria-label={ariaLabel} className={cn("gencl:w-full", className)} {...props}>
      <style>{WAVEFORM_CSS}</style>
      <div
        data-slot="iheart-audio-carousel-track"
        className="gencl:flex gencl:w-full gencl:overflow-x-auto gencl:pb-2 gencl:[scrollbar-width:none] gencl:[&::-webkit-scrollbar]:hidden"
        style={{ gap, scrollSnapType: "x mandatory" }}>
        {stations.map((station) => (
          <div key={station.id} style={{ scrollSnapAlign: "start" }}>
            <StationCard
              station={station}
              isPlaying={station.id === playingStationId}
              cardWidth={cardWidth}
              cardHeight={cardHeight}
              imageSize={imageSize}
              playButtonSize={playButtonSize}
              waveformBarCount={waveformBarCount}
              badge={badge}
              onPlayToggle={handlePlayToggle}
            />
          </div>
        ))}
      </div>
      <audio
        ref={audioRef}
        data-slot="iheart-audio-player"
        aria-hidden="true"
        className="gencl:pointer-events-none gencl:fixed gencl:-left-[100vw] gencl:top-0 gencl:h-px gencl:w-px gencl:opacity-0"
        preload="none"
        onEnded={() => setPlayingStationId(null)}
        onError={() => setPlayingStationId(null)}
      />
    </section>
  );
}
