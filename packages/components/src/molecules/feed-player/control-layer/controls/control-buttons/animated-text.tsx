import { memo, useEffect, useRef, useState } from "react";

type AnimatedTextProps = {
  text: string;
  width: number;
  /**
   * If this parameter is set to true, the animation will stop.
   */
  stop: boolean;
};

export const AnimatedText = memo(function ({
  text,
  width = 110,
  stop,
}: AnimatedTextProps) {
  const [animateText, setAnimateText] = useState(false);
  const animationIntervalRef = useRef<any>(null);

  const startAnimation = () => {
    if (animationIntervalRef.current) return;
    animationIntervalRef.current = setInterval(() => {
      setAnimateText((prev) => !prev);
    }, 3000);
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

  const stopAnimation = () => {
    if (animationIntervalRef.current) {
      clearInterval(animationIntervalRef.current);
      animationIntervalRef.current = null;
      setAnimateText(false);
    }
  };

  return (
    <div
      className="gencl:text-body-1-medium gencl:flex gencl:min-w-0 gencl:overflow-hidden gencl:whitespace-nowrap gencl:transition-[width,opacity] gencl:duration-500 gencl:ease-in-out"
      style={{
        maxWidth: animateText ? width : "0px",
        opacity: animateText ? 1 : 0,
      }}
    >
      <p className="gencl:text-white gencl:pr-4">{text}</p>
    </div>
  );
});
