/**
 * Thin progress bar displayed at the bottom of the video player.
 * Visual-only — no seek interaction.
 */

/** Props for {@link VideoScrubber}. */
export interface VideoScrubberProps {
  /** 0–1 fraction of video progress. */
  progress: number;
}

/**
 * Renders a full-width progress bar at the bottom of its container.
 * The bar is purely visual — it does not support seeking.
 *
 * @param props.progress  0–1 fraction representing playback position.
 *
 * @example
 * <VideoScrubber progress={currentTime / duration} />
 */
export function VideoScrubber({ progress }: VideoScrubberProps): React.JSX.Element {
  const pct = Math.min(100, Math.max(0, progress * 100));

  return (
    <div
      data-testid="video-scrubber"
      className="gencl:absolute gencl:bottom-0 gencl:left-0 gencl:right-0 gencl:h-[3px]"
      style={{ background: "rgba(255,255,255,0.25)" }}>
      <div
        data-testid="video-scrubber-fill"
        className="gencl:h-full gencl:bg-white"
        style={{ width: `${pct}%`, transition: "width 0.25s linear" }}
      />
    </div>
  );
}
