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
  width = 125,
  stop,
}: AnimatedTextProps) {
  const [animateText, setAnimateText] = useState(false);
  const animationIntervalRef = useRef<any>(null);

  useEffect(() => {
    animationIntervalRef.current = setInterval(() => {
      setAnimateText((prev) => !prev);
    }, 3000);

    return () => {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (stop) {
      stopAnimation();
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
        width: animateText ? width : "0px",
        opacity: animateText ? 1 : 0,
      }}
    >
      <p className="gencl:text-white gencl:pr-4">{text}</p>
    </div>
  );
});
