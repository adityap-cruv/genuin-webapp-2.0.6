/**
 * Resolve the redirect destination for the /trk route.
 *
 * Only absolute `https:` URLs are allowed as external destinations. Anything else — missing,
 * malformed, non-https scheme (`http:`, `javascript:`, `data:`), or a relative path — falls back
 * to the site homepage to avoid open-redirect / protocol abuse.
 *
 * @param rawRedirectUrl The raw `redirect_url` query param (nullable).
 * @returns A safe destination: the validated https URL, or `"/"` as a same-origin fallback.
 */
export function resolveRedirectTarget(rawRedirectUrl: string | null | undefined): string {
  if (!rawRedirectUrl) return "/";
  try {
    const parsed = new URL(rawRedirectUrl);
    return parsed.protocol === "https:" ? parsed.toString() : "/";
  } catch {
    return "/";
  }
}
