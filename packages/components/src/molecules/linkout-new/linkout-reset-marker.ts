/**
 * Per-bus "reset reveal once per video" marker → last video id reset. WeakMap
 * (not a ref) so it survives the tile's remount on expand-close; a ref would
 * restart the chip on every return.
 */
export const lastResetVideoIdByBus = new WeakMap<object, string>();
