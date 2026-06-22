/**
 * Shared grid-layout resolution for the GridView and its loading skeleton.
 *
 * The backend `grid_layout` config can mark one dimension as dynamic with a
 * sentinel value of `-1`. This module turns the raw config plus a video count
 * into the effective grid mode and dimensions, so the rendered grid and the
 * skeleton stay in sync.
 */

/** Sentinel value from the backend indicating a dimension should be derived from the video count. */
export const DYNAMIC_DIMENSION = -1;
/** Allowed range for the fixed dimension when its counterpart is dynamic. */
export const MIN_FIXED_DIMENSION = 1;
export const MAX_FIXED_DIMENSION = 3;
/** Grid gap in px (matches gencl:gap-2). */
export const GRID_GAP = 8;
/** Fallback grid used when the config is invalid (e.g. both dimensions dynamic). */
export const FALLBACK_ROWS = 2;
export const FALLBACK_COLS = 2;

export type GridMode = "fixed" | "dynamic-rows" | "dynamic-cols";

export const clampFixed = (value: number) =>
  Math.min(Math.max(value, MIN_FIXED_DIMENSION), MAX_FIXED_DIMENSION);

/**
 * Resolve the effective grid mode and dimensions from the backend `grid_layout`
 * values and the current number of loaded videos.
 *
 * - `row === -1` → rows derived from video count, columns fixed (clamped 1–3).
 * - `column === -1` → columns derived from video count, rows fixed (clamped 1–3).
 * - both `-1` → invalid, fall back to a safe fixed grid.
 * - neither `-1` → existing fixed behavior, unchanged.
 */
export function resolveGridDimensions(
  rows: number,
  cols: number,
  videoCount: number
): { mode: GridMode; rows: number; cols: number } {
  const rowDynamic = rows === DYNAMIC_DIMENSION;
  const colDynamic = cols === DYNAMIC_DIMENSION;

  if (rowDynamic && colDynamic) {
    // Both dynamic is unsupported — fall back to a safe fixed grid.
    return { mode: "fixed", rows: FALLBACK_ROWS, cols: FALLBACK_COLS };
  }

  if (rowDynamic) {
    const fixedCols = clampFixed(cols);
    const derivedRows = Math.max(Math.ceil(videoCount / fixedCols), 1);
    return { mode: "dynamic-rows", rows: derivedRows, cols: fixedCols };
  }

  if (colDynamic) {
    const fixedRows = clampFixed(rows);
    const derivedCols = Math.max(Math.ceil(videoCount / fixedRows), 1);
    return { mode: "dynamic-cols", rows: fixedRows, cols: derivedCols };
  }

  return { mode: "fixed", rows, cols };
}

/** Aspect ratio (width / height) from parsed ratio parts; falls back to 1. */
export const ratioToAspect = (widthRatio: number, heightRatio: number) =>
  heightRatio > 0 ? widthRatio / heightRatio : 1;

/**
 * Compute the tile size for a resolved grid. The FIXED axis drives the size and
 * the other axis follows the aspect ratio, so tiles stay a constant size as the
 * dynamic axis grows. Shared by the GridView and its skeleton so they match.
 *
 * @param usableHeight container height minus the header height.
 * @param containerWidth full container width.
 */
export function computeTileSize(params: {
  mode: GridMode;
  rows: number;
  cols: number;
  containerWidth: number;
  usableHeight: number;
  aspect: number;
}): { tileWidth: number; tileHeight: number } {
  const { mode, rows, cols, containerWidth, usableHeight, aspect } = params;

  if (mode === "dynamic-cols") {
    const tileHeight = usableHeight / rows - GRID_GAP;
    return { tileHeight, tileWidth: aspect > 0 ? tileHeight * aspect : tileHeight };
  }
  if (mode === "dynamic-rows") {
    const tileWidth = containerWidth / cols - GRID_GAP;
    return { tileWidth, tileHeight: aspect > 0 ? tileWidth / aspect : tileWidth };
  }
  return {
    tileWidth: containerWidth / cols - GRID_GAP,
    tileHeight: usableHeight / rows - GRID_GAP,
  };
}
