import { memo, useEffect, useRef, useState } from "react";

const SHOW_DURATION = 3000;
const HIDE_DURATION = 3000;

type AnimatedTextProps = {
  text: string;
  /** Expanded box width (px) — fixed per caller's size token, not measured. */
  width: number;
  /** Expanded box height (px) — fixed per caller's size token. */
  height: number;
  /** Classes for the text itself — font size and any padding (e.g. "gencl:text-[10px]"). */
  textClassName: string;
  /** When true, immediately collapses and stops cycling. */
  stop: boolean;
  /** Show the "Tap to unmute" pill once per mount instead of cycling. @default false */
  once?: boolean;
  /** Reports the pill's actual expanded/collapsed state so the parent can size around it. */
  onVisibleChange?: (visible: boolean) => void;
};

/** Text pill that expands/collapses on repeat while `stop` is false. */
export const AnimatedText = memo(function AnimatedText({
  text,
  width,
  height,
  textClassName,
  stop,
  once = false,
  onVisibleChange,
}: AnimatedTextProps) {
  // Start collapsed (width 0) so the first expand has a delta to animate —
  // `startCycle(true)` then waits HIDE_DURATION before expanding, letting the
  // CSS width/opacity transition play the slide-in instead of snapping open.
  const [visible, setVisible] = useState(false);

  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shownOnceRef = useRef(false);

  /** Clear both pending timers without touching `visible` state. */
  const clearTimers = () => {
    if (showTimerRef.current !== null) {
      clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }
    if (hideTimerRef.current !== null) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  /**
   * Start (or restart) the expand→collapse cycle.
   * `beginHidden=true` waits HIDE_DURATION before expanding — eases back in
   * instead of snapping when `stop` clears.
   */
  const startCycle = (beginHidden = false) => {
    clearTimers();
    if (beginHidden) {
      setVisible(false);
      hideTimerRef.current = setTimeout(() => startCycle(false), HIDE_DURATION);
      return;
    }
    // Phase 1: expand (CSS transition handles the slide-in).
    setVisible(true);
    if (once) {
      // Single appearance: latch, then collapse after SHOW_DURATION and stop —
      // no Phase 3 re-expand.
      shownOnceRef.current = true;
      showTimerRef.current = setTimeout(() => setVisible(false), SHOW_DURATION);
      return;
    }
    // Phase 2: after SHOW_DURATION collapse.
    showTimerRef.current = setTimeout(() => {
      setVisible(false);
      // Phase 3: after HIDE_DURATION expand again.
      hideTimerRef.current = setTimeout(() => startCycle(false), HIDE_DURATION);
    }, SHOW_DURATION);
  };

  // Drives both mount and `stop` changes.
  useEffect(() => {
    if (stop) {
      clearTimers();
      setVisible(false);
      return;
    }
    // Already shown its single time for this mount — stay collapsed.
    if (once && shownOnceRef.current) {
      setVisible(false);
      return;
    }
    // `once` appears immediately; cycling eases in from collapsed (beginHidden).
    startCycle(!once);
    return () => clearTimers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stop]);

  // Surface the actual expanded state so the parent pill can grow/shrink in step.
  useEffect(() => {
    onVisibleChange?.(visible);
  }, [visible, onVisibleChange]);

  // On unmount (e.g. unmute removes the pill) report collapsed so the parent animates closed.
  useEffect(() => () => onVisibleChange?.(false), [onVisibleChange]);

  return (
    <div
      // Duration/easing matched to the parent pill's own max-width transition
      // (mute-button-view.tsx) and the icon's shrink transition — all three
      // fire off the same `visible`/`textVisible` trigger. A slower clock here
      // (previously 500ms vs the pill's 350ms) let this box keep growing after
      // the pill's `overflow: hidden` had already stopped, clipping the last
      // character mid-reveal.
      className="gencl:flex gencl:min-w-0 gencl:items-center gencl:overflow-hidden gencl:whitespace-nowrap gencl:transition-[max-width,opacity] gencl:duration-[350ms] gencl:ease-in-out"
      style={{
        maxWidth: visible ? `${width}px` : "0px",
        opacity: visible ? 1 : 0,
      }}>
      <p className={`gencl:text-white ${textClassName}`} style={{ width, height, lineHeight: `${height}px` }}>
        {text}
      </p>
    </div>
  );
});
