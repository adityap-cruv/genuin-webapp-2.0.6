"use client";

import { Player } from "@lottiefiles/react-lottie-player";
import { cn } from "@genuin/ui/lib/utils";
import type { LottieIconProps } from "./lottie-icon.types";
import { useRef, useEffect } from "react";

/**
 * LottieIcon - A reusable Lottie animation component
 *
 * Usage:
 * ```tsx
 * import animationData from "@genuin/components/assets/lottie/gathering.json"
 *
 * <LottieIcon
 *   src={animationData}
 *   width={32}
 *   height={32}
 *   loop={true}
 *   autoplay={true}
 * />
 * ```
 */
export function LottieIcon({
  src,
  loop = true,
  autoplay = true,
  speed = 1,
  className,
  width,
  height,
  onComplete,
  playing,
  rendererSettings,
  ...restProps
}: LottieIconProps) {
  const playerRef = useRef<any>(null);

  // Handle external play/pause control
  useEffect(() => {
    if (!playerRef.current) return;

    if (playing === true) {
      playerRef.current.play();
    } else if (playing === false) {
      playerRef.current.pause();
    }
  }, [playing]);

  // Keep the underlying player in sync when loop changes
  useEffect(() => {
    if (!playerRef.current || typeof playerRef.current.setLoop !== "function") {
      return;
    }

    playerRef.current.setLoop(Boolean(loop));
  }, [loop]);

  return (
    <div
      className={cn("gencl:inline-flex gencl:items-center gencl:justify-center", className)}
      style={{ width, height }}
      {...restProps}
    >
      <Player
        ref={playerRef}
        src={src}
        loop={loop}
        autoplay={autoplay}
        speed={speed}
        style={{ width: "100%", height: "100%" }}
        rendererSettings={rendererSettings}
        onEvent={(event) => {
          if (event === "complete") {
            if (loop && playing !== false) {
              playerRef.current?.play();
            }

            if (onComplete) {
              onComplete();
            }
          }
        }}
      />
    </div>
  );
}
