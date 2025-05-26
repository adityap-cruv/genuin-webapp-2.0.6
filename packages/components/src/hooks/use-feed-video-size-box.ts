"use client";
import { useEffect, useState } from "react";
import { SizeBoxType } from "src/types/base";

/**
 * A custom hook that returns the size of the feed video container.
 * @param considerTopBar - Whether to consider the top bar height in the calculation.
 * @returns The size of the feed video container.
 */
export function useFeedVideoSizeBox(considerTopBar: boolean = true) {
  const [sizeBox, setSizeBox] = useState<SizeBoxType>(
    typeof window !== "undefined"
      ? getSizeBox(considerTopBar)
      : { height: 0, width: 0 }
  );

  useEffect(() => {
    setSizeBox(getSizeBox(considerTopBar));
    const handleResize = () => {
      setSizeBox(getSizeBox(considerTopBar));
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [considerTopBar]);

  return sizeBox;
}

//
/**
 * Height of the top bar.
 */
const NAVBAR_HEIGHT = 64;
/**
 * Margin on top and bottom the video and the top bar.
 */
const MARGIN = 16;

function getSizeBox(considerTopBar: boolean = true) {
  const height =
    window.innerHeight - (considerTopBar ? NAVBAR_HEIGHT : 0) - MARGIN;
  const width = height * (9 / 16);
  return {
    height,
    width,
  };
}
