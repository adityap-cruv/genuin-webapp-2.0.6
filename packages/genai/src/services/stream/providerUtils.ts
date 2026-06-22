import type { CarousalMetadata, ToolMetadataPayload } from '@/types';

/**
 * Truncates a string to `max` characters, appending an ellipsis if needed.
 * @param value - The string to truncate.
 * @param max - Maximum character count (default 140).
 */
export const truncateText = (value: string, max = 140): string => {
  if (!value) return '';
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
};

/**
 * Collapses all whitespace sequences to a single space and trims.
 * @param value - Input string.
 */
export const normalizeWhitespace = (value: string): string =>
  value.replace(/\s+/g, ' ').trim();

/**
 * Converts snake_case, kebab-case, and camelCase identifiers into
 * human-readable title-case phrases.
 * @param value - Identifier string.
 */
export const humanizeIdentifier = (value: string): string =>
  value
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, c => c.toUpperCase());

/**
 * Extracts a human-readable summary from a raw function response.
 * Looks for common message/description fields before falling back to counts.
 * Returns an empty string for status-only payloads so callers can skip the step.
 * @param value - Raw function response (any shape).
 */
export const parseFunctionResponse = (value: unknown): string => {
  if (value == null) return '';

  let parsed: unknown = value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return '';
    try {
      parsed = JSON.parse(trimmed);
      if (typeof parsed === 'string') return parsed;
    } catch {
      return trimmed.replace(/^"|"$/g, '');
    }
  }

  if (typeof parsed !== 'object' || parsed === null) return String(parsed);

  const obj = parsed as Record<string, unknown>;

  // Drill one level into common wrapper shapes: { result: {...} }
  const inner =
    typeof obj.result === 'object' && obj.result !== null
      ? (obj.result as Record<string, unknown>)
      : obj;

  // Prefer explicit human-readable text fields (checked in both inner + outer)
  for (const key of ['message', 'description', 'text', 'summary', 'title']) {
    const field = inner[key] ?? obj[key];
    if (typeof field === 'string' && field.trim()) return field.trim();
  }

  // Array data → count summary
  const data = inner.data ?? obj.data ?? inner.results ?? obj.results;
  if (Array.isArray(data) && data.length > 0) {
    return `Retrieved ${data.length} item${data.length === 1 ? '' : 's'}`;
  }

  // Numeric count fields
  const count = inner.count ?? inner.total ?? inner.total_count ?? obj.count ?? obj.total;
  if (typeof count === 'number') {
    return `Retrieved ${count} result${count === 1 ? '' : 's'}`;
  }

  // Status-only (e.g. { status: 'success', data: null }) — return nothing so
  // the thinking step is skipped rather than showing raw JSON.
  return '';
};

/**
 * Extracts a human-readable summary from a tool metadata payload.
 * @param payload - The tool metadata payload, if present.
 */
export const extractToolMetadataSummary = (
  payload: ToolMetadataPayload | undefined
): string | undefined => {
  if (!payload) return undefined;
  if (Array.isArray(payload.content)) {
    const textEntry = payload.content.find(
      (item: { text?: string }) => typeof item?.text === 'string'
    );
    if (textEntry?.text) {
      return textEntry.text;
    }
  }

  const displayName = payload.structuredContent?.templates?.display_name;
  const totalCount = payload.structuredContent?.total_count;

  if (displayName && typeof totalCount === 'number') {
    return `Received ${totalCount} results from ${displayName}`;
  }

  if (displayName) {
    return `Received results from ${displayName}`;
  }

  return undefined;
};

/**
 * Attempts to parse a value as JSON. Returns the typed result or `undefined`
 * if parsing fails or the value is empty.
 * @param value - Value to parse (string, object, or null/undefined).
 */
export function parseMaybeJson<T>(value: unknown): T | undefined {
  if (value == null) return undefined;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    try {
      return JSON.parse(trimmed) as T;
    } catch (err) {
      console.warn('[providerUtils] Failed to parse JSON payload', err, trimmed);
      return undefined;
    }
  }
  if (typeof value === 'object') {
    return value as T;
  }
  return undefined;
}

/**
 * Coerces an unknown value to an array of finite numbers.
 * Accepts a single value or an array; non-numeric entries are dropped.
 * @param value - Raw input.
 */
export const toNumberArray = (value: unknown): number[] => {
  if (value == null) return [];
  const input = Array.isArray(value) ? value : [value];
  return input
    .map(item => {
      const num = typeof item === 'number' ? item : Number(item);
      return Number.isFinite(num) ? num : null;
    })
    .filter((num): num is number => num !== null);
};

/**
 * Coerces an unknown value to an array of non-empty strings.
 * A comma-delimited string is split into individual entries.
 * @param value - Raw input.
 */
export const toStringArray = (value: unknown): string[] => {
  if (value == null) return [];
  if (Array.isArray(value)) {
    return value
      .map(item => String(item ?? '').trim())
      .filter((item): item is string => Boolean(item));
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];
    return trimmed
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);
  }
  const single = String(value ?? '').trim();
  return single ? [single] : [];
};

/**
 * Normalises a raw carousel metadata value into a typed `CarousalMetadata`
 * object, or `null` if the value is missing or has no content.
 * @param value - Raw carousel metadata (any shape).
 */
export const normalizeCarouselMetadata = (value: unknown): CarousalMetadata | null => {
  const parsed = parseMaybeJson<Record<string, unknown>>(value);
  if (!parsed) return null;

  const videoIds = toStringArray(parsed.video_ids);
  const keywordsValue = parsed.keywords;
  const keywords =
    typeof keywordsValue === 'string'
      ? keywordsValue
      : Array.isArray(keywordsValue)
        ? keywordsValue
            .map(item => (typeof item === 'string' ? item.trim() : ''))
            .filter(Boolean)
            .join(', ')
        : '';

  if (!videoIds.length && !keywords) {
    return null;
  }

  return {
    brand_ids: toNumberArray(parsed.brand_ids),
    cta: typeof parsed.cta === 'string' ? parsed.cta : '',
    url: typeof parsed.url === 'string' ? parsed.url : '',
    h1: typeof parsed.h1 === 'string' ? parsed.h1 : '',
    h2: typeof parsed.h2 === 'string' ? parsed.h2 : '',
    keywords,
    video_ids: videoIds,
  };
};

/**
 * Normalises a raw tool metadata value into a typed `ToolMetadataPayload`,
 * or `undefined` if the value is absent or not an object.
 * @param value - Raw tool metadata (any shape).
 */
export const normalizeToolMetadata = (value: unknown): ToolMetadataPayload | undefined => {
  const parsed = parseMaybeJson<ToolMetadataPayload>(value);
  if (!parsed || typeof parsed !== 'object') {
    return undefined;
  }
  return parsed;
};
