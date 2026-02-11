import { DRAGGABLE_SHEET_STATES, type DraggableSheetState, type HeightValue } from "./types";

export function normalizeHeight(value: HeightValue): string {
  return typeof value === "number" ? `${value}vh` : value;
}

export function convertHeightToPixels(value: HeightValue): number {
  if (typeof value === "number") {
    return (value / 100) * window.innerHeight;
  }

  const stringValue = value.trim();

  if (stringValue.endsWith("vh")) {
    const vh = parseFloat(stringValue);
    return (vh / 100) * window.innerHeight;
  }

  if (stringValue.endsWith("%")) {
    const percent = parseFloat(stringValue);
    return (percent / 100) * window.innerHeight;
  }

  if (stringValue.endsWith("px")) {
    return parseFloat(stringValue);
  }

  if (stringValue.endsWith("rem")) {
    const rem = parseFloat(stringValue);
    const baseFontSize =
      parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    return rem * baseFontSize;
  }

  const parsed = parseFloat(stringValue);
  return isNaN(parsed) ? 0 : parsed;
}

export function filterEnabledStates(enabledStates: DraggableSheetState[]) {
  return DRAGGABLE_SHEET_STATES.filter((state) =>
    enabledStates.includes(state),
  );
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function findNearestSnapState(
  currentHeightPx: number,
  flickVelocity: number,
  enabledStates: DraggableSheetState[],
  heightToPixels: (state: DraggableSheetState) => number,
): DraggableSheetState {
    const VELOCITY_THRESHOLD = 500;

  const snapPoints = filterEnabledStates(enabledStates).map((state) => ({
    state,
    heightPx: heightToPixels(state),
  }));

  if (snapPoints.length === 0) return "default";

  if (Math.abs(flickVelocity) > VELOCITY_THRESHOLD) {
    const isExpandingUp = flickVelocity > 0;
    const candidates = snapPoints.filter((snap) =>
      isExpandingUp
        ? snap.heightPx > currentHeightPx + 5
        : snap.heightPx < currentHeightPx - 5,
    );

    if (candidates.length > 0) {
      return findClosestSnapPoint(candidates, currentHeightPx).state;
    }
  }

  return findClosestSnapPoint(snapPoints, currentHeightPx).state;
}

function findClosestSnapPoint<T extends { heightPx: number }>(
  snapPoints: T[],
  targetHeightPx: number,
): T {
  return snapPoints.reduce((closest, current) =>
    Math.abs(closest.heightPx - targetHeightPx) <
    Math.abs(current.heightPx - targetHeightPx)
      ? closest
      : current,
  );
}
