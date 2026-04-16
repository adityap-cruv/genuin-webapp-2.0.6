import { memo, useEffect, useRef, useState } from "react";

type AnimatedTextProps = {
  text: string;
  width: number;
  /**
   * If this parameter is set to true, the animation will stop (collapse width to 0).
   */
  stop: boolean;
};

export const AnimatedText = memo(function ({
  text,
  width = 110,
  stop,
}: AnimatedTextProps) {
  // Start visible so the open animation plays on mount.
  const [animateText, setAnimateText] = useState(true);
  const animationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

  const startAnimation = () => {
    if (animationIntervalRef.current) return;
    // Show immediately, then pulse every 3 s.
    setAnimateText(true);
    animationIntervalRef.current = setInterval(() => {
      setAnimateText((prev) => !prev);
    }, 3000);
  };

  const stopAnimation = () => {
    if (animationIntervalRef.current) {
      clearInterval(animationIntervalRef.current);
      animationIntervalRef.current = null;
    }
    // Collapse width so the closing animation plays.
    setAnimateText(false);
  };

  useEffect(() => {
    startAnimation();
    return () => {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (stop) {
      stopAnimation();
    } else {
      // Restart animation when stop flips back to false (e.g. player muted again).
      startAnimation();
    }
  }, [stop]);

  return (
    <div
      className="gencl:text-body-1-medium gencl:flex gencl:min-w-0 gencl:overflow-hidden gencl:whitespace-nowrap gencl:transition-[max-width,opacity] gencl:duration-500 gencl:ease-in-out"
      style={{
        maxWidth: animateText ? `${width}px` : "0px",
        opacity: animateText ? 1 : 0,
      }}
    >
      <p className="gencl:text-white gencl:pr-4">{text}</p>
    </div>
  );
});
