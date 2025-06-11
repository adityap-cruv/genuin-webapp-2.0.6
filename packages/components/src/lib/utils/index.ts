import type { CommunityUserRole } from "@types/post";
import DOMPurify from "dompurify";

import { PROTECTED_ROUTES } from "../constants";

/**
 * This function will check if the url includes any of the protected routes.
 * @param url
 * @returns
 */
export function checkIfUrlIncludesProtectedRoute(url: string) {
  return PROTECTED_ROUTES.some((route) => url.includes(route));
}

/**
 * This function formats a date string in ISO format to a more readable format.
 * @param isoString = string - The ISO date string to format.
 * @returns
 */
export function formateDateToLocaleString(isoString: string): string {
  const date = new Date(isoString);
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return date.toLocaleDateString("en-US", options);
}

/*
 * This function maps the role of the user in the community.
 * @param role - Role of the user in the community.
 * @param isRequested - If the user has requested to join the community.
 */
export function mapCommunityUserRole(
  role?: number | null,
  isRequested?: boolean | null
): CommunityUserRole {
  // If isRequested is true, return 'REQUESTED'.
  if (isRequested) return "REQUESTED";

  switch (role) {
    case 1:
      return "LEADER";
    case 2:
      return "MEMBER";
    case 3:
      return "MODERATOR";
    // If role is null or anything other than above cases than return 'UNJOINED'.
    default:
      return "UNJOINED";
  }
}

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
