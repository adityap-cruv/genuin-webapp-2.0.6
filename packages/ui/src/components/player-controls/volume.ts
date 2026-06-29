/** Volume scale a consumer's player state speaks. unit = 0–1 (CXR), percent = 0–100 (webapp/sdk). */
export type VolumeScale = "unit" | "percent";

export interface VolumeChange {
  /** New volume in the target scale. */
  volume: number;
  /** True when the slider was dragged to 0 (player should mute). */
  muted: boolean;
}

/**
 * Maps a raw 0–100 slider value (MuteButtonView always emits 0–100) to the
 * consumer's volume scale plus the mute-at-zero decision. Pure, no side effects.
 */
export function resolveVolumeChange(raw0to100: number, scale: VolumeScale): VolumeChange {
  const volume = scale === "unit" ? raw0to100 / 100 : raw0to100;
  return { volume, muted: raw0to100 === 0 };
}
