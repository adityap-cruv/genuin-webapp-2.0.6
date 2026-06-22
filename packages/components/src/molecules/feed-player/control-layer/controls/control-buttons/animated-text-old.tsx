import { memo, useEffect, useRef, useState } from "react";

const SHOW_DURATION = 3000;
const HIDE_DURATION = 3000;

type AnimatedTextProps = {
  text: string;
  width: number;
  stop: boolean;
};

/**
 * Renders a piece of text that repeatedly expands and collapses with a CSS
 * width/opacity transition while `stop` is `false`.
 *
 * Cycle:
 *   expand (500 ms CSS) → visible for SHOW_DURATION → collapse (500 ms CSS)
 *   → hidden for HIDE_DURATION → repeat
 */
export const AnimatedText = memo(function AnimatedText({ text, width = 110, stop }: AnimatedTextProps) {
  // Start collapsed so CSS transition has a 0→width delta to animate (starting true = no delta = pop).
  const [visible, setVisible] = useState(false);

  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
   * Schedule a show→hide→show cycle.
   * @param beginHidden when true, start in the hidden phase — stay collapsed for
   *   HIDE_DURATION, THEN slide in. Used on (re)start so the hint doesn't snap
   *   back the instant it's un-suppressed (e.g. when the cursor leaves the bar).
   * Calling this while timers are running is safe — they're cleared first.
   */
  const startCycle = (beginHidden = false) => {
    clearTimers();
    if (beginHidden) {
      // Grace gap before the first expand.
      setVisible(false);
      hideTimerRef.current = setTimeout(() => startCycle(false), HIDE_DURATION);
      return;
    }
    // Phase 1: expand (CSS transition handles the slide-in).
    setVisible(true);
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
      // Collapse immediately so the CSS closing animation plays.
      setVisible(false);
      return;
    }
    // Begin from the hidden phase: wait HIDE_DURATION, THEN slide in — so the
    // hint eases back in instead of snapping the instant `stop` clears.
    startCycle(true);
    return () => clearTimers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stop]);

  return (
    <div
      className="gencl:text-body-1-medium gencl:flex gencl:min-w-0 gencl:overflow-hidden gencl:whitespace-nowrap gencl:transition-[max-width,opacity] gencl:duration-500 gencl:ease-in-out"
      style={{
        maxWidth: visible ? `${width}px` : "0px",
        opacity: visible ? 1 : 0,
      }}>
      <p className="gencl:text-white gencl:pr-4">{text}</p>
    </div>
  );
});
