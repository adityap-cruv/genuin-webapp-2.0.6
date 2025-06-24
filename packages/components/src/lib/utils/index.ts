import type { CommunityUserRole } from "@genuin/components/types/post";
import DOMPurify from "dompurify";

import { PROTECTED_ROUTES } from "../constants";
import { GroupUserStatusType } from "@genuin/components/types/roles";
import { MEDIA_BASE_URL } from "./env";
import { DeepLinkActionType } from "@genuin/components/react-query/api/deeplink";

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
 * Maps the numeric role value to a GroupUserStatusType string
 * @param role - The numeric role value:
 *               1 = Not joined/No role
 *               2 = Requested to join
 *               3 = Joined member
 * @returns GroupUserStatusType - One of:
 *          'UNJOINED' - User has not joined or has invalid role
 *          'REQUESTED' - User has requested to join
 *          'JOINED' - User is an active member
 */
export function mapGroupJoinStatus(role?: number | null): GroupUserStatusType {
  if (role === null || role === undefined) return "UNJOINED";

  switch (role) {
    case 1:
      return "UNJOINED";
    case 2:
      return "REQUESTED";
    case 3:
      return "JOINED";
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

/**
 * This func returns the url for the reaction.
 * @param reaction type of reaction
 * @param isReacted if user have already reacted.
 * @returns
 */
export function getUrlForReaction(
  reaction: string,
  isReacted: boolean,
  forComment: boolean = false
) {
  return `https://media.begenuin.com/webapp_assets/reactions/${reaction}/${forComment ? "comment_" : "feed_"}${
    isReacted ? "selected" : "unselected"
  }.svg`;
}

/**
 * Extracts loop and community share parameters from a share URL
 * @param shareUrl - The URL containing share parameters
 * @returns Object containing loop and community share strings
 */
export function getLoopAndCommunityShareString(shareUrl: string) {
  const urlObj = new URL(shareUrl);
  const loopShareString = urlObj.searchParams.get('loop');
  const communityShareString = urlObj.searchParams.get('community');
  return { loopShareString, communityShareString };
}

/**
 * Converts a string to title case (first letter capitalized, rest lowercase)
 * @param word - The string to convert to title case
 * @returns The string in title case format
 */
export function toTitleCase(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

/**
 * Gets all search parameters from the current window URL
 * @returns An object containing all URL search parameters as key-value pairs
 */
export function getSearchParamsFromWindow(): Record<string, any> {
  return Object.fromEntries(new URLSearchParams(window.location.search));
}

/**
 * Attempts to parse a JSON string. If parsing fails, returns the original string.
 *
 * @param data - The string to attempt to parse as JSON.
 * @returns The parsed object if `data` is valid JSON; otherwise, returns the original string.
 */
export function tryJsonParse(data: string) {
  try {
    return JSON.parse(data)
  } catch (e) {
    return data
  }
}

/**
 * Compresses a string to a maximum number of characters.
 * If the text exceeds maxChars, it truncates and appends '...'.
 * @param text - The input string to compress
 * @param maxChars - The maximum allowed characters
 * @returns The compressed string with ellipsis if truncated
 */
export function compressText(text: string, maxChars: number): string {
  if (typeof text !== "string" || maxChars <= 0) return "";
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars) + "...";
}

/**
 * Returns the SVG link for the given name.
 * @param name - The name of the SVG.
 * @returns The SVG link.
 */
export function getIconLink(name: string, type: string = 'svg') {
  return `${MEDIA_BASE_URL}/web-sdk/v1/icons/${name}.${type}`
}

/**
 * Returns the GIF link for the given name.
 * @param name - The name of the GIF.
 * @returns The GIF link.
 */
export function getGifLink(name: string) {
  return `${MEDIA_BASE_URL}/web-sdk/v1/icons/${name}.gif`
}


export function getActionText(defaultText : string , action: DeepLinkActionType | undefined , preText : string) {
  if (!action) return defaultText;

  const actionObjectMap: Record<DeepLinkActionType, string> = {
    subscribe: `${preText} to subscribe a group.`,
    join_as_collaborator: `${preText} to become a member.`,
    join_community: `${preText} join a community`,
    comment: `${preText} to add a comment to a post.`,
    repost: `${preText} to repost the post.`,
    spark: `${preText} to react to the post.`,
    report: `${preText} to report the post.`,
    get_app: "the app",
  };
  return actionObjectMap[action];
}