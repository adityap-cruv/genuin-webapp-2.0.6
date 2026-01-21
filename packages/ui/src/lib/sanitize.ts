import DOMPurify from "dompurify";

/**
 * Sanitizes user input to prevent XSS attacks
 * Only allows plain text by escaping dangerous HTML characters
 * @param input - The user input to sanitize
 * @returns Sanitized plain text string
 */
export function sanitizeInput(input: string | null | undefined): string {
  if (typeof input !== "string" || input.trim() === "") return "";
  return DOMPurify.sanitize(input, {
    USE_PROFILES: { html: false },
  });
}
