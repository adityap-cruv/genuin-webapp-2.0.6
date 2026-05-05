/**
 * URL utility functions
 */

/**
 * Converts a HTTPS URL to HTTP by replacing the protocol
 * @param url - The URL string to convert
 * @returns The URL with HTTP protocol instead of HTTPS
 */
export function toHttpUrl(url: string | undefined): string {
  return url ? url.replace(/^https:\/\//, "http://") : "";
}
