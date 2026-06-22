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
 * Deep merge `override` onto `base`, preserving legacy semantics.
 *
 * - Non-object override → shallow clone of `base`.
 * - `undefined` and `null` values in override are skipped.
 * - Plain-object values on both sides recurse.
 * - Arrays are REPLACED at the leaf level (not concatenated).
 * - Date/Map/class instances are assigned as-is (no recursion).
 *
 * Pure — never mutates `base` or `override`.
 *
 * @param base     Source object/array. May be null/undefined.
 * @param override Overlay values.
 * @returns A new object/array — never the original reference.
 */
export function deepMergeOverwrite<TBase = unknown, TOverride = unknown>(
  base: TBase,
  override: TOverride
): TBase & Partial<TOverride> {
  if (!override || typeof override !== "object") {
    return shallowClone(base) as TBase & Partial<TOverride>;
  }

  const result = shallowClone(base) as PlainRecord;
  const ov = override as PlainRecord;

  for (const key of Object.keys(ov)) {
    const val = ov[key];
    if (val === undefined || val === null) continue;

    const baseVal = base ? (base as PlainRecord)[key] : undefined;

    if (isPlainObject(val) && isPlainObject(baseVal)) {
      result[key] = deepMergeOverwrite(baseVal, val);
    } else {
      result[key] = val;
    }
  }

  return result as TBase & Partial<TOverride>;
}
