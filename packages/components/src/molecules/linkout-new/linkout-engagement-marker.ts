/**
 * Per-bus record of videos whose linkout the user engaged (clicked / dragged
 * open). An engaged video skips the reveal delay on re-activation — see
 * `useShowLinkouts`. WeakMap so it survives remounts and stays per-SDK-instance;
 * scope is same-video (a new video still honours its delay).
 */
const engagedVideoIdsByBus = new WeakMap<object, Set<string>>();

/** Mark `videoId`'s linkout as engaged for this bus. No-op without a videoId. */
export function markLinkoutEngaged(bus: object, videoId: string | null | undefined): void {
  if (!videoId) return;
  let engaged = engagedVideoIdsByBus.get(bus);
  if (!engaged) {
    engaged = new Set<string>();
    engagedVideoIdsByBus.set(bus, engaged);
  }
  engaged.add(videoId);
}

/** Whether the user has already engaged `videoId`'s linkout on this bus. */
export function isLinkoutEngaged(bus: object, videoId: string | null | undefined): boolean {
  if (!videoId) return false;
  return engagedVideoIdsByBus.get(bus)?.has(videoId) ?? false;
}
