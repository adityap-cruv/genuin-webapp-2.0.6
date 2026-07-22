import { useEffect } from "react";

/** Carousel swipe controls to gate — the `enable`/`disable` pair from `useEmblaCarousel`. */
export interface SwipeGateControls {
  enable: () => void;
  disable: () => void;
}

/**
 * Freezes vertical feed swiping while any of `disableReasons` is true (an Octo
 * sheet owns part of the player, an ad is active, …); restores it the moment
 * every reason clears.
 *
 * A single gate — rather than one independent `enable`/`disable` effect per
 * reason — so two reasons can never race and re-enable swipe while another
 * reason still wants it frozen: the effect only re-evaluates when the combined
 * boolean actually flips.
 *
 * @param disableReasons  Booleans; swipe is disabled while any is true.
 */
export function useSwipeGate({ enable, disable }: SwipeGateControls, disableReasons: boolean[]): void {
  const shouldDisable = disableReasons.some(Boolean);

  useEffect(() => {
    if (shouldDisable) {
      disable();
    } else {
      enable();
    }
  }, [shouldDisable, enable, disable]);
}
