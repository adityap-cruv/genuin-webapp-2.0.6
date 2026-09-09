"use client";

import { useEffect, useState } from "react";

export type ImageLoadStatus = "pending" | "loaded" | "error";

/**
 * Preloads `src` off-DOM (a throwaway `Image()`, never mounted) so callers can
 * decide what to render BEFORE ever committing a real `<img>` to the page —
 * avoids a visible flash of a blank/broken image that then swaps to a
 * fallback once `onError` fires on the mounted element. `pending` and `error`
 * are meant to render the same fallback; only `loaded` should mount the
 * favicon `<img>` itself.
 */
export function useImageLoadStatus(src: string | null | undefined): ImageLoadStatus {
  const [status, setStatus] = useState<ImageLoadStatus>(src ? "pending" : "error");

  useEffect(() => {
    if (!src) {
      setStatus("error");
      return;
    }
    setStatus("pending");
    const img = new window.Image();
    img.onload = () => setStatus("loaded");
    img.onerror = () => setStatus("error");
    img.src = src;
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return status;
}
