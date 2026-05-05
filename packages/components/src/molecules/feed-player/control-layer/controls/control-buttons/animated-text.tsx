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
  // Start visible so the expand animation plays immediately on mount.
  const [visible, setVisible] = useState(true);

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
   * Schedule one full show→hide→show cycle starting from the expand phase.
   * Calling this while timers are already running is safe — they are cleared
   * first so the cycle always restarts cleanly.
   */
  const startCycle = () => {
    clearTimers();
    // Phase 1: show immediately (CSS transition handles the expand animation).
    setVisible(true);
    // Phase 2: after SHOW_DURATION collapse.
    showTimerRef.current = setTimeout(() => {
      setVisible(false);
      // Phase 3: after HIDE_DURATION restart from expand.
      hideTimerRef.current = setTimeout(() => {
        startCycle();
      }, HIDE_DURATION);
    }, SHOW_DURATION);
  };

  // Mount: kick off the cycle immediately.
  useEffect(() => {
    startCycle();
    return () => {
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // React to `stop` prop changes.
  useEffect(() => {
    if (stop) {
      clearTimers();
      // Collapse immediately so the CSS closing animation plays.
      setVisible(false);
    } else {
      // `stop` flipped false → restart cycle from the expand phase.
      startCycle();
    }
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
