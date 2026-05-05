import { DYNAMIC_SHEET_STATES, type DynamicSheetState, type HeightValue } from "./types";

/**
 * Convert a HeightValue to pixels relative to a container height.
 *
 * - `number`  → percentage of containerHeight (e.g. 40 → 40%)
 * - `"50vh"`  → percentage of window.innerHeight
 * - `"50%"`   → percentage of containerHeight
 * - `"200px"` → absolute pixels
 * - `"2rem"`  → rem × 16
 */
export function normalizeHeightToPx(value: HeightValue, containerHeight: number): number {
  if (typeof value === "number") {
    return (value / 100) * containerHeight;
  }

  const trimmed = value.trim();

  if (trimmed.endsWith("vh")) {
    return (parseFloat(trimmed) / 100) * window.innerHeight;
  }
  if (trimmed.endsWith("%")) {
    return (parseFloat(trimmed) / 100) * containerHeight;
  }
  if (trimmed.endsWith("px")) {
    return parseFloat(trimmed);
  }
  if (trimmed.endsWith("rem")) {
    return parseFloat(trimmed) * 16;
  }

  return parseFloat(trimmed) || 0;
}

/** Clamp a number between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Return only the states that appear in DYNAMIC_SHEET_STATES order */
export function filterEnabledStates(enabled: DynamicSheetState[]): DynamicSheetState[] {
  return DYNAMIC_SHEET_STATES.filter((s) => enabled.includes(s)) as DynamicSheetState[];
}

/**
 * Determine the nearest snap state given the current pixel height and velocity.
 * If the user flicked fast enough, prefer the next state in that direction.
 */
export function findNearestSnapState(
  currentPx: number,
  velocity: number,
  enabledStates: DynamicSheetState[],
  stateToPx: (state: DynamicSheetState) => number
): DynamicSheetState {
  const VELOCITY_THRESHOLD = 500;

  const snapPoints = filterEnabledStates(enabledStates).map((state) => ({
    state,
    px: stateToPx(state),
  }));

  if (snapPoints.length === 0) return "default";

  // If the user flicked hard, bias toward the next snap in that direction
  if (Math.abs(velocity) > VELOCITY_THRESHOLD) {
    const isSwipingUp = velocity > 0;
    const candidates = snapPoints.filter((snap) => (isSwipingUp ? snap.px > currentPx + 5 : snap.px < currentPx - 5));
    if (candidates.length > 0) {
      return closestSnap(candidates, currentPx).state;
    }
  }

  return closestSnap(snapPoints, currentPx).state;
}

/** Pick the snap point whose pixel value is closest to `targetPx` */
function closestSnap<T extends { px: number }>(snapPoints: T[], targetPx: number): T {
  return snapPoints.reduce((closest, current) =>
    Math.abs(closest.px - targetPx) < Math.abs(current.px - targetPx) ? closest : current
  );
}
