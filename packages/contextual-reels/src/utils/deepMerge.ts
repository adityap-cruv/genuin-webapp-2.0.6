type PlainRecord = Record<string, unknown>;

function isPlainObject(value: unknown): value is PlainRecord {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

function shallowClone<T>(value: T | null | undefined): T {
  if (Array.isArray(value)) {
    return value.slice() as unknown as T;
  }
  return { ...((value as object | null) ?? {}) } as T;
}

/**
 * Hard cap on merge recursion depth. Real config/event payloads are only a few
 * levels deep; anything past this is a malformed or hostile host-supplied object
 * (e.g. `window.offsitePropertiesConfig`). Bailing here keeps a broken host from
 * exhausting the call stack — the observed `Maximum call stack size exceeded`
 * crash that took down widget init/analytics for such hosts.
 */
const MAX_MERGE_DEPTH = 32;

/**
 * Deep merge `override` onto `base`, preserving legacy semantics.
 *
 * - Non-object override → shallow clone of `base`.
 * - `undefined` and `null` values in override are skipped.
 * - Plain-object values on both sides recurse.
 * - Arrays are REPLACED at the leaf level (not concatenated).
 * - Date/Map/class instances are assigned as-is (no recursion).
 *
 * Guarded against unbounded recursion from host-supplied input: a circular
 * `override` (detected via {@link seen}) or one nested past {@link MAX_MERGE_DEPTH}
 * stops recursing at that branch and keeps `base`'s value, rather than throwing
 * `Maximum call stack size exceeded`. The merge degrades gracefully — the widget
 * still renders / the event still fires — instead of crashing.
 *
 * Pure — never mutates `base` or `override`.
 *
 * @param base     Source object/array. May be null/undefined.
 * @param override Overlay values.
 * @param seen     Internal — tracks override objects already on the recursion
 *                 path to break reference cycles. Callers pass nothing.
 * @param depth    Internal — current recursion depth. Callers pass nothing.
 * @returns A new object/array — never the original reference.
 */
export function deepMergeOverwrite<TBase = unknown, TOverride = unknown>(
  base: TBase,
  override: TOverride,
  seen: WeakSet<object> = new WeakSet<object>(),
  depth = 0
): TBase & Partial<TOverride> {
  if (!override || typeof override !== "object") {
    return shallowClone(base) as TBase & Partial<TOverride>;
  }

  // Cycle / runaway-depth guard: keep base's value at this branch rather than
  // recursing forever into a self-referential or pathologically deep override.
  // `seen` tracks only the CURRENT recursion path (added before descending,
  // removed after) — so a shared sub-object reused across sibling keys (a
  // non-cyclic DAG) still merges normally; only a true back-edge is cut.
  if (depth >= MAX_MERGE_DEPTH || seen.has(override as object)) {
    return shallowClone(base) as TBase & Partial<TOverride>;
  }
  seen.add(override as object);

  const result = shallowClone(base) as PlainRecord;
  const ov = override as PlainRecord;

  for (const key of Object.keys(ov)) {
    const val = ov[key];
    if (val === undefined || val === null) continue;

    const baseVal = base ? (base as PlainRecord)[key] : undefined;

    if (isPlainObject(val) && isPlainObject(baseVal)) {
      result[key] = deepMergeOverwrite(baseVal, val, seen, depth + 1);
    } else {
      result[key] = val;
    }
  }

  seen.delete(override as object);
  return result as TBase & Partial<TOverride>;
}
