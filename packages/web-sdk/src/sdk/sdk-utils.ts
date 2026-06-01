/**
 * Hardcoded keyword priority pairs.
 *
 * When multiple keywords match the same URL, the `winner` keyword takes
 * precedence and every keyword in `losers` is dropped from the result.
 * Comparison is case-insensitive.
 *
 * Add new pairs here as priority rules are discovered.
 */
const KEYWORD_PRIORITY: ReadonlyArray<{ winner: string; losers: readonly string[] }> = [
  { winner: "fifa", losers: ["sports"] },
];

/**
 * Applies hardcoded keyword priority rules to a list of matched keywords.
 *
 * For each rule, if `winner` is present in `matches`, all entries listed in
 * `losers` are removed. Comparison is case-insensitive; original casing of
 * surviving entries is preserved.
 *
 * @param matches - Keywords matched from URL segments, in keyword-array order
 * @returns Filtered keywords with losing entries dropped
 */
function applyKeywordPriority(matches: string[]): string[] {
  const lowerSet = new Set(matches.map((m) => m.toLowerCase()));
  const dropped = new Set<string>();

  for (const { winner, losers } of KEYWORD_PRIORITY) {
    if (lowerSet.has(winner.toLowerCase())) {
      for (const loser of losers) dropped.add(loser.toLowerCase());
    }
  }

  return matches.filter((m) => !dropped.has(m.toLowerCase()));
}

/**
 * Finds keywords that appear as substrings within any category.
 *
 * A keyword matches when it occurs as a case-insensitive substring of at least
 * one category. Comparison is direction-strict: substring extraction happens
 * only from categories, never the reverse.
 *
 * @param categories - Path segments derived from the URL pathname
 * @param keywords - Backend-provided context keywords
 * @returns The matched keywords (preserving keyword-array order), or [] if none match
 */
export function findMatchingKeywords(categories: string[], keywords: string[]): string[] {
  const lowerCategories = categories.map((c) => c.toLowerCase());

  return keywords.filter((keyword) => {
    const lowerKeyword = keyword.toLowerCase();
    return lowerCategories.some((category) => category.includes(lowerKeyword));
  });
}

/**
 * Derives the brand context keyword from the current page URL by matching
 * URL path segments against the backend-provided context keywords.
 *
 * Extracts up to 3 path segments from `window.location.pathname` (e.g. for
 * "/sports/nba" it considers ["sports", "nba"]) and returns every keyword
 * that appears as a substring of any segment.
 *
 * @param contextKeywords - Keywords provided by the brand's backend config.
 *   The function is a no-op when this array is empty.
 * @returns A brand-context array ready to assign to `config.brandContext`,
 *   or `undefined` when no path segments are present or no keyword matches.
 */
export function resolveBrandContextFromUrl(
  contextKeywords: string[]
): Array<{ type: string; value: string }> | undefined {
  if (!contextKeywords.length) return undefined;

  // Split pathname into segments, dropping the leading empty string produced by
  // the leading "/" (e.g. "/a/b/c".split("/") → ["", "a", "b", "c"]).
  const pathSegments = typeof window !== "undefined" ? window.location.pathname.split("/") : [];

  // Need at least one real segment after the leading empty string.
  if (pathSegments.length <= 1) return undefined;

  // Take up to 3 meaningful segments (index 1..3 of the split result).
  const filteredSegments: string[] = pathSegments.slice(1, pathSegments.length >= 3 ? 4 : 2);

  const matches = applyKeywordPriority(findMatchingKeywords(filteredSegments, contextKeywords));
  if (!matches.length) return undefined;

  return matches.map((value) => ({ type: "keyword", value }));
}
