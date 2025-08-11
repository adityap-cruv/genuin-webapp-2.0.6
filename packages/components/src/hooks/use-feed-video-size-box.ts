"use client";
import { useEffect, useState } from "react";
import type { SizeBoxType } from "@genuin/components/types/base";
import { useEmbedConfigs } from "./embed/use-embed-config";
import { useBaseContext } from "../context/base";
import { useEmbedContext } from "../context/embed";
import { useSafeEmbedContext } from "../context/embed/context";

/**
 * A custom hook that returns the size of the feed video container.
 * @param considerTopBar - Whether to consider the top bar height in the calculation.
 * @returns The size of the feed video container.
 */
export function useFeedVideoSizeBox() {
  const { isEmbed } = useBaseContext();
  const embedDetails = useSafeEmbedContext();

  const {
    layoutConfig: { showNavigationBar: considerTopBar },
  } = useEmbedConfigs(); // This can be parameterized if needed
  const [sizeBox, setSizeBox] = useState<SizeBoxType>(
    typeof window !== "undefined"
      ? getSizeBox(considerTopBar, embedDetails?.rootElement ?? undefined)
      : { height: 0, width: 0 }
  );

  useEffect(() => {
    const elementToTrack = isEmbed ? embedDetails?.rootElement : window;
    setSizeBox(
      getSizeBox(considerTopBar, embedDetails?.rootElement ?? undefined)
    );
    const handleResize = () => {
      setSizeBox(
        getSizeBox(considerTopBar, embedDetails?.rootElement ?? undefined)
      );
    };
    elementToTrack?.addEventListener("resize", handleResize);
    return () => {
      elementToTrack?.removeEventListener("resize", handleResize);
    };
  }, [isEmbed]);

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

function getSizeBox(
  considerTopBar: boolean = true,
  rootElement?: HTMLElement
): SizeBoxType {
  const height =
    (rootElement ? rootElement.clientHeight : window.innerHeight) -
    (considerTopBar ? NAVBAR_HEIGHT : 0) -
    MARGIN;
  const width = height * (9 / 16);
  return {
    height,
    width,
  };
}
